-- One-time correction (2026-07-19): replaces the placeholder/undercounted
-- sale_entries rows with the real per-line sale tracker report (105 bottles,
-- RM1,640 total). Only touches sale_entries -- cost_items, bank_entries,
-- scents, and stock_entries are left untouched.
delete from public.sale_entries;

insert into public.sale_entries (date, perfume, qty, notes, total) values
  ('2025-10-15', 'Mixed (5 scents)', 16, 'OBSIDIAN (M) x2, HORIZON (M) x7, ELARA (W) x1, VELVET (W) x5, BLOOM (W) x1 -- mostly Buy 2 = RM27 promo', 221),
  ('2025-10-16', 'MEN - NelMora OBSIDIAN', 1, '', 16),
  ('2025-10-17', 'Mixed (4 scents)', 8, 'ELARA (W) x1 + VELVET (W) x1 as Buy 2 = RM27 promo pair, plus VELVET (W) x1, BLOOM (W) x2, HORIZON (M) x3 at regular price', 123),
  ('2025-10-18', 'WOMEN - NelMora ELARA', 1, '', 16),
  ('2025-10-22', 'Mixed (4 scents)', 6, 'ELARA (W) x2, VELVET (W) x1, HORIZON (M) x2, OBSIDIAN (M) x1', 96),
  ('2025-10-25', 'Mixed (2 scents)', 2, 'OBSIDIAN (M) x1, HORIZON (M) x1', 32),
  ('2025-10-29', 'Mixed (3 scents)', 4, 'VELVET (W) x2, HORIZON (M) x1, BLOOM (W) x1', 64),
  ('2025-10-30', 'WOMEN - NelMora ELARA', 1, '', 16),
  ('2025-11-01', 'Mixed (3 scents)', 7, 'ELARA (W) x1, HORIZON (M) x2, VELVET (W) x4', 112),
  ('2025-11-02', 'Mixed (multiple scents)', 21, '21 units across ELARA/BLOOM/VELVET/HORIZON/OBSIDIAN (W & M); qty and total are math-verified (336 / RM16), exact per-scent split is a best-effort read of a dense screenshot -- verify against original report if precision matters', 336),
  ('2025-11-06', 'Mixed (2 scents)', 2, 'BLOOM (W) x1, OBSIDIAN (M) x1', 32),
  ('2025-11-09', 'Mixed (8 scents)', 14, 'LYRA (W) x1, ELARA (W) x3, BLOOM (W) x2, VELVET (W) x3, HORIZON (M) x2, OBSIDIAN (M) x1, AEROS (M) x1, VALENTUS (M) x1', 224),
  ('2025-11-10', 'WOMEN - NelMora LYRA', 1, '', 16),
  ('2025-11-12', 'Mixed (2 scents)', 2, 'BLOOM (W) x1, LYRA (W) x1', 32),
  ('2025-11-16', 'Mixed (5 scents)', 12, 'ELARA (W) x3, LYRA (W) x3, AEROS (M) x1, BLOOM (W) x3, VALENTUS (M) x2', 192),
  ('2026-03-28', 'Mixed (2 scents)', 3, 'LYRA (W) x1, VELVET (W) x2', 48),
  ('2026-04-04', 'Mixed (3 scents)', 3, 'VELVET (W) x1, AEROS (M) x1, OBSIDIAN (M) x1', 48),
  ('2026-04-05', 'WOMEN - NelMora ELARA', 1, '', 16);
