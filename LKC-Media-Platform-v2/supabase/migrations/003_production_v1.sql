-- Apply before deploying this branch. All existing bytes are preserved.
create table if not exists public.albums (
 id uuid primary key default gen_random_uuid(), name text not null, slug text unique not null,
 gallery text not null default 'sports' check (gallery in ('sports','portraits')),
 event_date date, is_visible boolean not null default false, sort_order integer not null default 0,
 created_at timestamptz not null default now()
);
alter table public.albums add column if not exists is_private boolean not null default false;
alter table public.albums add column if not exists pin_hash text;
alter table public.albums add column if not exists expires_at timestamptz;
alter table public.albums add column if not exists auth_version uuid not null default gen_random_uuid();
alter table public.media_assets add column if not exists album_id uuid references public.albums(id) on delete set null;
alter table public.media_assets add column if not exists gallery text not null default 'sports';
alter table public.media_assets add column if not exists sport text;
alter table public.media_assets add column if not exists is_featured boolean not null default false;
alter table public.media_assets add column if not exists is_visible boolean not null default false;
alter table public.media_assets add column if not exists sort_order integer not null default 0;
alter table public.media_assets add column if not exists original_bucket text not null default 'lkc-media';
alter table public.media_assets add column if not exists preview_path text;
alter table public.media_assets add column if not exists thumbnail_path text;
alter table public.media_assets add column if not exists client_preview_path text;
alter table public.media_assets add column if not exists width integer;
alter table public.media_assets add column if not exists height integer;
alter table public.media_assets add column if not exists alt_text text;
alter table public.bookings add column if not exists terms_accepted_at timestamptz;
alter table public.bookings add column if not exists media_policy_accepted_at timestamptz;
alter table public.bookings add column if not exists policy_version text;
alter table public.bookings add column if not exists media_consent boolean not null default false;
alter table public.bookings add column if not exists email_owner_sent boolean;
alter table public.bookings add column if not exists email_customer_sent boolean;
create index if not exists media_album_order_idx on public.media_assets(album_id, sort_order, id) where is_visible;
create index if not exists albums_public_order_idx on public.albums(sort_order, id) where is_visible and not is_private;
-- Remove pre-existing public policies: application access is server-only.
do $$ declare t text; pol record; begin
 foreach t in array array['albums','media_assets','bookings','galleries','photos','orders','order_items','download_tokens','site_settings','page_sections'] loop
  execute format('alter table public.%I enable row level security', t);
  for pol in select policyname from pg_policies where schemaname='public' and tablename=t loop execute format('drop policy %I on public.%I', pol.policyname,t); end loop;
  execute format('revoke all on public.%I from anon, authenticated',t);
  execute format('grant select,insert,update,delete on public.%I to service_role',t);
 end loop;
end $$;
-- Old public original URLs must stop working. Purge previously cached URLs at cutover.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('lkc-originals','lkc-originals',false,20971520,array['image/jpeg','image/png','image/webp']),
 ('lkc-previews','lkc-previews',false,8388608,array['image/jpeg'])
on conflict(id) do update set public=false;
update storage.buckets set public=false where id='lkc-media';
-- No direct client access to any of these buckets, including signed-in Supabase users.
drop policy if exists lkc_server_only on storage.objects;
create policy lkc_server_only on storage.objects as restrictive for all to anon,authenticated
 using (bucket_id not in ('lkc-media','lkc-originals','lkc-previews'))
 with check (bucket_id not in ('lkc-media','lkc-originals','lkc-previews'));
create table if not exists public.request_limits (key text primary key, attempts integer not null, resets_at timestamptz not null);
alter table public.request_limits enable row level security;
revoke all on public.request_limits from anon,authenticated;
create or replace function public.take_rate_limit(bucket_key text,max_attempts integer,window_seconds integer) returns boolean
language plpgsql security definer set search_path=public as $$
declare n integer; begin
 delete from request_limits where resets_at < now() - interval '1 day';
 insert into request_limits(key,attempts,resets_at) values(bucket_key,1,now()+make_interval(secs=>window_seconds))
 on conflict(key) do update set attempts=case when request_limits.resets_at<=now() then 1 else request_limits.attempts+1 end,
 resets_at=case when request_limits.resets_at<=now() then now()+make_interval(secs=>window_seconds) else request_limits.resets_at end
 returning attempts into n;
 return n<=max_attempts;
end $$;
revoke all on function public.take_rate_limit(text,integer,integer) from public,anon,authenticated;
grant execute on function public.take_rate_limit(text,integer,integer) to service_role;
-- Read projection contains no storage paths, hashes, or private album metadata.
create or replace view public.public_album_cards with (security_invoker=true) as
 select a.id,a.name,a.slug,a.gallery,a.event_date,a.sort_order,a.created_at,
 count(m.id)::integer photo_count,
 (array_agg(m.id order by m.sort_order,m.id))[1] cover_id,
 array_remove(array_agg(distinct m.sport),null) sports
 from public.albums a join public.media_assets m on m.album_id=a.id and m.is_visible and m.preview_path is not null
 where a.is_visible and not a.is_private and (a.expires_at is null or a.expires_at>now())
 group by a.id;
revoke all on public.public_album_cards from anon,authenticated;
grant select on public.public_album_cards to service_role;

-- All content changes commit together; a failed section write cannot partially update the site.
create or replace function public.save_site_content(new_settings jsonb,new_sections jsonb,deleted_ids uuid[]) returns void
language plpgsql security definer set search_path=public as $$
declare s jsonb; begin
 insert into site_settings(id,site_name,tagline,contact_email,instagram_url,updated_at)
 values('main',new_settings->>'site_name',new_settings->>'tagline',new_settings->>'contact_email',new_settings->>'instagram_url',now())
 on conflict(id) do update set site_name=excluded.site_name,tagline=excluded.tagline,contact_email=excluded.contact_email,instagram_url=excluded.instagram_url,updated_at=now();
 for s in select value from jsonb_array_elements(new_sections) loop
 insert into page_sections(id,page,section_type,title,subtitle,body,image_url,button_label,button_href,is_visible,sort_order,updated_at)
 values((s->>'id')::uuid,'home',s->>'section_type',s->>'title',s->>'subtitle',s->>'body',s->>'image_url',s->>'button_label',s->>'button_href',(s->>'is_visible')::boolean,(s->>'sort_order')::integer,now())
 on conflict(id) do update set title=excluded.title,subtitle=excluded.subtitle,body=excluded.body,image_url=excluded.image_url,button_label=excluded.button_label,button_href=excluded.button_href,is_visible=excluded.is_visible,sort_order=excluded.sort_order,updated_at=now();
 end loop;
 delete from page_sections where id=any(deleted_ids);
end $$;
revoke all on function public.save_site_content(jsonb,jsonb,uuid[]) from public,anon,authenticated;
grant execute on function public.save_site_content(jsonb,jsonb,uuid[]) to service_role;
-- Atomic legacy paid-download claim prevents concurrent requests exceeding the limit.
create or replace function public.claim_paid_download(download_token uuid) returns text
language plpgsql security definer set search_path=public as $$
declare rec record; original text; begin
 select * into rec from download_tokens where token=download_token for update;
 if not found or rec.expires_at<=now() or rec.download_count>=rec.max_downloads then return null;end if;
 select p.original_path into original from order_items i join orders o on o.id=i.order_id join photos p on p.id=i.photo_id where i.id=rec.order_item_id and o.status='paid';
 if original is null then return null;end if;
 update download_tokens set download_count=download_count+1 where id=rec.id;
 return original;
end $$;
revoke all on function public.claim_paid_download(uuid) from public,anon,authenticated;
grant execute on function public.claim_paid_download(uuid) to service_role;
