create extension if not exists pgcrypto;

-- ---------- cost_items (rnd + first_batch) ----------
create table public.cost_items (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('rnd', 'first_batch')),
  name text not null,
  cost numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- sale_entries ----------
create table public.sale_entries (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  perfume text not null,
  qty integer not null default 1,
  notes text not null default '',
  total numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- bank_entries (in/out renamed to avoid reserved-word-adjacent columns) ----------
create table public.bank_entries (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  cash_in numeric(12,2) not null default 0,
  cash_out numeric(12,2) not null default 0,
  balance numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- scents (men/women via gender discriminant) ----------
create table public.scents (
  id uuid primary key default gen_random_uuid(),
  gender text not null check (gender in ('men', 'women')),
  code text not null default '',
  perfume text not null,
  inline text not null,
  status text not null check (status in ('ADA', 'SOON')),
  created_at timestamptz not null default now()
);

-- ---------- stock_entries (men/women via gender discriminant) ----------
create table public.stock_entries (
  id uuid primary key default gen_random_uuid(),
  gender text not null check (gender in ('men', 'women')),
  date date not null,
  code text not null default '',
  perfume text not null,
  inline text not null,
  stock integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- resellers + per-reseller sale log ----------
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

-- =========================================================
-- Row Level Security: any authenticated user gets full R/W,
-- anonymous gets nothing. Matches current app behavior
-- (role is cosmetic today -- no admin/staff split).
-- =========================================================
alter table public.cost_items     enable row level security;
alter table public.sale_entries   enable row level security;
alter table public.bank_entries   enable row level security;
alter table public.scents         enable row level security;
alter table public.stock_entries  enable row level security;
alter table public.resellers      enable row level security;
alter table public.reseller_sales enable row level security;

create policy "authenticated_full_access" on public.cost_items
  for all to authenticated using (true) with check (true);
create policy "authenticated_full_access" on public.sale_entries
  for all to authenticated using (true) with check (true);
create policy "authenticated_full_access" on public.bank_entries
  for all to authenticated using (true) with check (true);
create policy "authenticated_full_access" on public.scents
  for all to authenticated using (true) with check (true);
create policy "authenticated_full_access" on public.stock_entries
  for all to authenticated using (true) with check (true);
create policy "authenticated_full_access" on public.resellers
  for all to authenticated using (true) with check (true);
create policy "authenticated_full_access" on public.reseller_sales
  for all to authenticated using (true) with check (true);

-- Explicit grants (Supabase's default privileges usually cover this
-- for new tables, but state it explicitly rather than relying on it).
grant select, insert, update, delete on public.cost_items     to authenticated;
grant select, insert, update, delete on public.sale_entries   to authenticated;
grant select, insert, update, delete on public.bank_entries   to authenticated;
grant select, insert, update, delete on public.scents         to authenticated;
grant select, insert, update, delete on public.stock_entries  to authenticated;
grant select, insert, update, delete on public.resellers      to authenticated;
grant select, insert, update, delete on public.reseller_sales to authenticated;
