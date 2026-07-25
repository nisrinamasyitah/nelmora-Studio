# NelMora Studio System

A private internal system for running NelMora, a small fragrance business. It replaces
scattered spreadsheets with one place to track money in/out, stock on hand, and sales —
direct and through resellers.

Access is by invite only (accounts are issued manually, no public sign-up).

## What it does

- **Dashboard** — a snapshot of the business: bank balance, total sales, units sold,
  gross profit, active resellers, a sales calendar, recent sales, and low-stock alerts.
- **Finance**
  - R&D costs and first batch costs (what it took to get NelMora off the ground)
  - Sale Tracker — every direct sale, logged by scent and date
  - Bank Ledger — running cash balance from money in/out
- **Resellers** — partners who sell on NelMora's behalf, their coverage area, and
  their own sale log
- **Scents Catalog** — every perfume NelMora carries, per gender line, and whether
  it's available now (ADA) or coming soon
- **Stock** — current inventory per scent, with a full history of stock changes

Sales and stock are linked: logging a sale (direct or through a reseller) automatically
deducts the quantity from that scent's stock. Gross profit is calculated per channel —
direct sales and reseller sales carry different margins, since resellers buy at a
different rate.

## Tech

- React + TypeScript, built with Vite
- [Supabase](https://supabase.com) for the database and login (Postgres + Auth,
  row-level security restricts all data to signed-in accounts)

## Running it locally

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project URL + anon key
npm run dev
```

Other scripts: `npm run build` (type-check + production build), `npm run lint`,
`npm run preview` (serve the production build locally).

The database schema and seed data live in `supabase/*.sql`.
