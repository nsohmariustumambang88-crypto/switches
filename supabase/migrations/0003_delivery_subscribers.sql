-- Delivery speed on orders, and the email list (international notify-me and
-- newsletter sign-ups). Idempotent: safe to re-run.

alter table public.orders add column if not exists delivery text not null default 'standard';
alter table public.orders drop constraint if exists orders_delivery_check;
alter table public.orders add constraint orders_delivery_check check (delivery in ('standard', 'express'));

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  country text,
  source text,
  created_at timestamptz not null default now()
);

-- No public policies: sign-ups are written by /api/subscribe with the service
-- role, so visitors can never read the list. Admins can read and export it.
alter table public.subscribers enable row level security;
drop policy if exists "admin subscribers" on public.subscribers;
create policy "admin subscribers" on public.subscribers for all using (public.is_admin()) with check (public.is_admin());
