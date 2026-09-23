-- LKC Media photo storefront orders.
create table if not exists public.photo_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  album_id uuid not null references public.albums(id) on delete restrict,
  customer_name text not null,
  customer_email text not null,
  customer_instagram text,
  photo_count integer not null check (photo_count > 0 and photo_count <= 1000),
  amount_cents integer not null check (amount_cents > 0),
  payment_method text not null check (payment_method in ('cash','apple_cash','zelle')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','cancelled','refunded')),
  order_status text not null default 'awaiting_payment' check (order_status in ('awaiting_payment','fulfilled','cancelled')),
  client_collection_id uuid references public.client_collections(id) on delete set null,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  fulfilled_at timestamptz
);

create table if not exists public.photo_order_items (
  order_id uuid not null references public.photo_orders(id) on delete cascade,
  media_id uuid not null references public.media_assets(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (order_id, media_id)
);

create index if not exists photo_orders_album_idx on public.photo_orders(album_id, created_at desc);
create index if not exists photo_orders_status_idx on public.photo_orders(payment_status, created_at desc);
create index if not exists photo_order_items_media_idx on public.photo_order_items(media_id, order_id);

alter table public.photo_orders enable row level security;
alter table public.photo_order_items enable row level security;
revoke all on public.photo_orders from anon, authenticated;
revoke all on public.photo_order_items from anon, authenticated;
grant select, insert, update, delete on public.photo_orders to service_role;
grant select, insert, update, delete on public.photo_order_items to service_role;
