create extension if not exists pgcrypto;

create table galleries (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    slug text unique not null,
    description text,
    event_date date,
    cover_preview_path text,
    is_public boolean not null default false,
    created_at timestamptz not null default now()
);

create table photos (
    id uuid primary key default gen_random_uuid(),
    gallery_id uuid references galleries(id) on delete cascade,
    title text,
    preview_path text not null,
    original_path text not null,
    price_cents integer not null default 700 check (price_cents >= 0),
    is_for_sale boolean not null default true,
    is_published boolean not null default false,
    sort_order integer not null default 0,
    created_at timestamptz not null default now()
);

create table orders (
    id uuid primary key default gen_random_uuid(),
    stripe_checkout_session_id text unique,
    customer_email text,
    total_cents integer not null,
    status text not null default 'pending',
    created_at timestamptz not null default now(),
    paid_at timestamptz
);

create table order_items (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null references orders(id) on delete cascade,
    photo_id uuid not null references photos(id),
    price_cents integer not null
);

create table download_tokens (
    id uuid primary key default gen_random_uuid(),
    token uuid unique not null default gen_random_uuid(),
    order_item_id uuid not null references order_items(id) on delete cascade,
    expires_at timestamptz not null,
    download_count integer not null default 0,
    max_downloads integer not null default 5
);

-- Storage plan:
-- lkc-previews  = PUBLIC bucket
-- lkc-originals = PRIVATE bucket
--
-- A Stripe webhook should create paid orders/order_items/download_tokens.
-- Do not expose original_path through the public frontend.
