-- Adds the resellers feature (2026-07-19): a reseller directory plus a
-- per-reseller sale log. Run once against the already-provisioned database.

create table public.resellers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  place_cover text not null default '',
  created_at timestamptz not null default now()
);

create table public.reseller_sales (
  id uuid primary key default gen_random_uuid(),
  reseller_id uuid not null references public.resellers(id) on delete cascade,
  date date not null,
  perfume text not null default '',
  qty integer not null default 1,
  notes text not null default '',
  total numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

alter table public.resellers      enable row level security;
alter table public.reseller_sales enable row level security;

create policy "authenticated_full_access" on public.resellers
  for all to authenticated using (true) with check (true);
create policy "authenticated_full_access" on public.reseller_sales
  for all to authenticated using (true) with check (true);

grant select, insert, update, delete on public.resellers      to authenticated;
grant select, insert, update, delete on public.reseller_sales to authenticated;
