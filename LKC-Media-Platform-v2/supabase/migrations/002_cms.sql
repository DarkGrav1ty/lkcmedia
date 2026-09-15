-- LKC Media CMS foundation
create table if not exists public.bookings (
 id uuid primary key default gen_random_uuid(), status text not null default 'new',
 name text not null, email text not null, instagram text, shoot_type text not null,
 sport text, shoot_date date not null, location_name text not null, location_address text not null,
 location_latitude double precision, location_longitude double precision, package text, details text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.site_settings (
    id text primary key default 'main',
    site_name text not null default 'LKC Media',
    tagline text not null default 'Real moments, lasting memories.',
    contact_email text not null default 'logancasey737@gmail.com',
    instagram_url text,
    updated_at timestamptz not null default now()
);

create table if not exists public.page_sections (
    id uuid primary key default gen_random_uuid(),
    page text not null default 'home',
    section_type text not null check (section_type in ('text','cta')),
    title text not null default '',
    subtitle text not null default '',
    body text not null default '',
    image_url text,
    button_label text,
    button_href text,
    is_visible boolean not null default true,
    sort_order integer not null default 0,
    updated_at timestamptz not null default now()
);

create table if not exists public.media_assets (
    id uuid primary key default gen_random_uuid(),
    file_name text not null,
    storage_path text not null unique,
    public_url text not null,
    mime_type text,
    size_bytes bigint,
    created_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
alter table public.page_sections enable row level security;
alter table public.media_assets enable row level security;

grant select, insert, update, delete on public.site_settings to service_role;
grant select, insert, update, delete on public.page_sections to service_role;
grant select, insert, update, delete on public.media_assets to service_role;
grant select, insert, update, delete on public.bookings to service_role;

insert into public.site_settings (id) values ('main') on conflict (id) do nothing;

insert into public.page_sections (section_type, title, subtitle, body, sort_order)
select 'text', 'About LKC Media', 'Behind the camera', 'Hi, I’m Logan. I’m the photographer behind LKC Media. I started shooting in 2025. I photograph sports and portraits, focusing on the moments people actually want to keep.', 0
where not exists (select 1 from public.page_sections where page='home');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('lkc-media', 'lkc-media', true, 20971520, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public=true;
