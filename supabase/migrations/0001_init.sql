-- Storefront schema (new Supabase project). Run with: npm run db:migrate
-- Legal catalog only: handguns (FFL transfer), ammunition, FRT triggers, parts & accessories.

create extension if not exists pgcrypto;

-- ── Catalog ────────────────────────────────────────────────────────────────
create table if not exists public.categories (
  id     text primary key,
  name   text not null,
  short  text not null,
  blurb  text not null default '',
  sort   int  not null default 0
);

create table if not exists public.category_types (
  category_id text not null references public.categories(id) on delete cascade,
  id          text not null,
  name        text not null,
  sort        int  not null default 0,
  primary key (category_id, id)
);

create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name          text not null,
  brand         text not null,
  category_id   text not null references public.categories(id),
  type          text not null,
  caliber       text,
  price         numeric(10,2) not null check (price >= 0),
  compare_at    numeric(10,2) check (compare_at is null or compare_at >= 0),
  rating        numeric(2,1) not null default 0 check (rating between 0 and 5),
  reviews       int not null default 0 check (reviews >= 0),
  image         text not null,          -- "catalog/…" path or Cloudinary public id
  photo         text check (photo in ('light','scene')),
  figure_label  text not null default '',
  figure_value  text not null default '',
  strip         text[] not null default '{}',
  description   text not null default '',
  specs         jsonb not null default '[]'::jsonb,   -- [["Caliber","9mm"], …]
  ffl           boolean not null default false,
  notice        text,
  trending      boolean not null default false,
  active        boolean not null default true,
  stock         int not null default 0 check (stock >= 0),
  sort          int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists products_category_idx on public.products (category_id, active);
create index if not exists products_trending_idx on public.products (trending) where trending;

create table if not exists public.product_packs (
  product_id uuid not null references public.products(id) on delete cascade,
  rounds     int  not null check (rounds > 0),
  price      numeric(10,2) not null check (price >= 0),
  primary key (product_id, rounds)
);

-- ── FFL dealers ────────────────────────────────────────────────────────────
create table if not exists public.ffl_dealers (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  license_no   text,
  address      text not null,
  city         text not null,
  state        text not null check (char_length(state) = 2),
  zip          text not null,
  phone        text,
  email        text,
  transfer_fee numeric(10,2),
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);
create index if not exists ffl_dealers_zip_idx on public.ffl_dealers (zip);

-- ── People ─────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  email            text,
  full_name        text,
  role             text not null default 'customer' check (role in ('customer','admin')),
  age_confirmed_at timestamptz,
  created_at       timestamptz not null default now()
);

-- ── Orders ─────────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id             text primary key,                 -- e.g. CB12345
  user_id        uuid references auth.users(id) on delete set null,
  email          text not null,
  status         text not null default 'placed'
                 check (status in ('placed','shipped','at-ffl','complete','cancelled')),
  subtotal       numeric(10,2) not null,
  shipping       numeric(10,2) not null,
  total          numeric(10,2) not null,
  billing        jsonb not null,                   -- {name,line1,city,state,zip}
  ffl_dealer_id  uuid references public.ffl_dealers(id) on delete set null,
  ffl_snapshot   jsonb,                            -- {name,address} at time of order
  payment_method text not null check (payment_method in ('card','ach')),
  carrier        text,
  tracking       text,
  attested_at    timestamptz not null,             -- age/eligibility attestation
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists orders_user_idx on public.orders (user_id, created_at desc);
create index if not exists orders_status_idx on public.orders (status, created_at desc);

create table if not exists public.order_items (
  id         bigserial primary key,
  order_id   text not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  slug       text not null,
  name       text not null,
  image      text not null,
  ffl        boolean not null default false,
  qty        int not null check (qty between 1 and 99),
  rounds     int,
  unit_price numeric(10,2) not null
);
create index if not exists order_items_order_idx on public.order_items (order_id);

create table if not exists public.order_events (
  id         bigserial primary key,
  order_id   text not null references public.orders(id) on delete cascade,
  status     text not null check (status in ('placed','shipped','at-ffl','complete','cancelled')),
  note       text,
  created_at timestamptz not null default now()
);
create index if not exists order_events_order_idx on public.order_events (order_id, created_at);

create table if not exists public.wishlists (
  user_id    uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists public.settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

-- ── Functions & triggers ───────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();
drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();

-- Atomic stock decrement used when an order is placed (service role only).
create or replace function public.decrement_stock(p_id uuid, n int)
returns boolean language plpgsql security definer set search_path = public as $$
declare updated int;
begin
  update public.products set stock = stock - n where id = p_id and stock >= n;
  get diagnostics updated = row_count;
  return updated = 1;
end $$;
revoke all on function public.decrement_stock(uuid, int) from public, anon, authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Row level security ─────────────────────────────────────────────────────
-- Server code uses the service role for writes after checking the caller;
-- these policies are the second line of defence for any direct client access.
alter table public.categories     enable row level security;
alter table public.category_types enable row level security;
alter table public.products       enable row level security;
alter table public.product_packs  enable row level security;
alter table public.ffl_dealers    enable row level security;
alter table public.profiles       enable row level security;
alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;
alter table public.order_events   enable row level security;
alter table public.wishlists      enable row level security;
alter table public.settings       enable row level security;

drop policy if exists "read categories" on public.categories;
create policy "read categories" on public.categories for select using (true);
drop policy if exists "admin categories" on public.categories;
create policy "admin categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read category types" on public.category_types;
create policy "read category types" on public.category_types for select using (true);
drop policy if exists "admin category types" on public.category_types;
create policy "admin category types" on public.category_types for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read active products" on public.products;
create policy "read active products" on public.products for select using (active or public.is_admin());
drop policy if exists "admin products" on public.products;
create policy "admin products" on public.products for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read packs" on public.product_packs;
create policy "read packs" on public.product_packs for select using (
  exists (select 1 from public.products p where p.id = product_id and (p.active or public.is_admin()))
);
drop policy if exists "admin packs" on public.product_packs;
create policy "admin packs" on public.product_packs for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read active dealers" on public.ffl_dealers;
create policy "read active dealers" on public.ffl_dealers for select using (active or public.is_admin());
drop policy if exists "admin dealers" on public.ffl_dealers;
create policy "admin dealers" on public.ffl_dealers for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles for select using (id = auth.uid() or public.is_admin());
drop policy if exists "admin profiles" on public.profiles;
create policy "admin profiles" on public.profiles for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read own orders" on public.orders;
create policy "read own orders" on public.orders for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "admin orders" on public.orders;
create policy "admin orders" on public.orders for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read own order items" on public.order_items;
create policy "read own order items" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
);
drop policy if exists "read own order events" on public.order_events;
create policy "read own order events" on public.order_events for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
);
drop policy if exists "admin order events" on public.order_events;
create policy "admin order events" on public.order_events for insert with check (public.is_admin());

drop policy if exists "own wishlist" on public.wishlists;
create policy "own wishlist" on public.wishlists for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "read settings" on public.settings;
create policy "read settings" on public.settings for select using (true);
drop policy if exists "admin settings" on public.settings;
create policy "admin settings" on public.settings for all using (public.is_admin()) with check (public.is_admin());
