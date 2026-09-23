-- LKC Media v3: athlete/subject tagging and secure dynamic client collections.
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums(id) on delete cascade,
  jersey_number text,
  display_name text,
  subject_type text not null default 'athlete' check (subject_type in ('athlete','team','coach','cheer','band','other')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subject_identity_required check (nullif(trim(coalesce(jersey_number,'')),'') is not null or nullif(trim(coalesce(display_name,'')),'') is not null)
);
create unique index if not exists subjects_album_jersey_unique on public.subjects(album_id, lower(jersey_number)) where jersey_number is not null;
create index if not exists subjects_album_idx on public.subjects(album_id, jersey_number, display_name);

create table if not exists public.photo_subjects (
  media_id uuid not null references public.media_assets(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (media_id, subject_id)
);
create index if not exists photo_subjects_subject_idx on public.photo_subjects(subject_id, media_id);

create table if not exists public.client_collections (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  label text not null,
  share_token text not null unique,
  pin_hash text,
  expires_at timestamptz,
  downloads_enabled boolean not null default true,
  is_active boolean not null default true,
  auth_version uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists client_collections_album_idx on public.client_collections(album_id, subject_id, created_at desc);
create index if not exists client_collections_token_idx on public.client_collections(share_token) where is_active;

alter table public.subjects enable row level security;
alter table public.photo_subjects enable row level security;
alter table public.client_collections enable row level security;
revoke all on public.subjects from anon, authenticated;
revoke all on public.photo_subjects from anon, authenticated;
revoke all on public.client_collections from anon, authenticated;
