-- Only needed if you already ran the original add_resellers.sql (which
-- didn't have perfume/total columns). Safe to run even if reseller_sales
-- doesn't exist yet -- adjust table name if you get a "relation does not
-- exist" error, meaning you haven't run add_resellers.sql at all yet.
alter table public.reseller_sales add column if not exists perfume text not null default '';
alter table public.reseller_sales add column if not exists total numeric(12,2) not null default 0;
