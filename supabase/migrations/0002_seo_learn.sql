-- SEO fields for products and categories, and the /learn guides (articles + authors).
-- Idempotent: safe to re-run.

-- ── Products: search copy and identifiers ───────────────────────────────
alter table public.products add column if not exists summary text;
alter table public.products add column if not exists meta_title text;
alter table public.products add column if not exists image_alt text;
alter table public.products add column if not exists mpn text;
alter table public.products add column if not exists gtin text;

-- updated_at drives sitemap <lastmod>. Only move it for real content edits,
-- not for every stock decrement at checkout (stock only counts when it crosses 0).
create or replace function public.touch_product_content()
returns trigger language plpgsql as $$
begin
  if (to_jsonb(new) - array['stock', 'sort', 'updated_at']) is distinct from (to_jsonb(old) - array['stock', 'sort', 'updated_at'])
     or ((new.stock > 0) is distinct from (old.stock > 0)) then
    new.updated_at := now();
  else
    new.updated_at := old.updated_at;
  end if;
  return new;
end $$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_product_content();

-- ── Categories: search title, snippet and visible intro ─────────────────
alter table public.categories add column if not exists meta_title text;
alter table public.categories add column if not exists meta_description text;
alter table public.categories add column if not exists intro text;

-- ── Authors ─────────────────────────────────────────────────────────────
create table if not exists public.authors (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  kind text not null default 'person' check (kind in ('person', 'team')),
  role text,
  bio text,
  credentials text,
  url text,
  created_at timestamptz not null default now()
);

-- ── Articles (/learn/<pillar>/<slug>) ───────────────────────────────────
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  pillar text not null check (pillar in ('buying-online', 'handguns', 'ammo', 'triggers', 'reference', 'updates')),
  title text not null,
  meta_title text,
  description text not null default '',
  body text not null default '',
  cover text,
  cover_alt text,
  author_slug text references public.authors(slug) on update cascade on delete set null,
  reviewer text,
  reviewed_at date,
  sources jsonb not null default '[]'::jsonb,
  changelog jsonb not null default '[]'::jsonb,
  related_products text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  -- Set by the app only when the content changes (dateModified / sitemap lastmod).
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (pillar, slug)
);
create index if not exists articles_published_idx on public.articles (status, published_at desc);
create index if not exists articles_related_idx on public.articles using gin (related_products);

-- ── Row-level security ──────────────────────────────────────────────────
alter table public.authors enable row level security;
alter table public.articles enable row level security;

drop policy if exists "read authors" on public.authors;
create policy "read authors" on public.authors for select using (true);
drop policy if exists "admin authors" on public.authors;
create policy "admin authors" on public.authors for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read published articles" on public.articles;
create policy "read published articles" on public.articles for select using (status = 'published' or public.is_admin());
drop policy if exists "admin articles" on public.articles;
create policy "admin articles" on public.articles for all using (public.is_admin()) with check (public.is_admin());
