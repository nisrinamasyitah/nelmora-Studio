-- One-time seed of real historical data that previously lived in
-- src/lib/storage.ts's seedData(). Run exactly once, after schema.sql.
-- Not idempotent -- there is no uniqueness constraint on business
-- columns, so re-running this duplicates every row.

-- cost_items
insert into public.cost_items (category, name, cost) values
  ('rnd', 'Box (5)', 88),
  ('rnd', 'Stickers (5)', 70),
  ('rnd', 'Perfume Scents (10)', 100),
  ('rnd', 'Bottle (5)', 10),
  ('first_batch', 'Stickers (5 Design)', 30),
  ('first_batch', 'Sticker Kotak (140)', 42),
  ('first_batch', 'Perfume Scents (130)', 1040),
  ('first_batch', 'Bottle (130)', 0),
  ('first_batch', 'Tapak', 127);

-- sale_entries
insert into public.sale_entries (date, perfume, qty, notes, total) values
  ('2025-10-15', 'MEN - NelMora OBSIDIAN', 2, 'Promotion (Buy 2 = RM27)', 221),
  ('2025-10-16', 'MEN - NelMora OBSIDIAN', 1, '', 16),
  ('2025-10-17', 'WOMEN - NelMora ELARA', 1, 'Promotion (Buy 2 = RM27)', 123),
  ('2025-10-18', 'WOMEN - NelMora ELARA', 1, '', 16),
  ('2025-10-22', 'WOMEN - NelMora ELARA', 1, '', 96),
  ('2025-10-25', 'MEN - NelMora OBSIDIAN', 1, '', 32),
  ('2025-10-29', 'WOMEN - NelMora VELVET', 1, '', 64),
  ('2025-10-30', 'WOMEN - NelMora ELARA', 1, '', 16),
  ('2025-11-01', 'WOMEN - NelMora ELARA', 1, '', 112),
  ('2025-11-02', 'WOMEN - NelMora ELARA', 1, '', 336),
  ('2025-11-06', 'WOMEN - NelMora BLOOM', 1, '', 32),
  ('2025-11-09', 'WOMEN - NelMora LYRA', 1, '', 224),
  ('2025-11-10', 'WOMEN - NelMora LYRA', 1, '', 16),
  ('2025-11-12', 'WOMEN - NelMora BLOOM', 1, '', 32),
  ('2025-11-16', 'WOMEN - NelMora ELARA', 1, '', 192),
  ('2026-03-28', 'WOMEN - NelMora LYRA', 1, '', 48),
  ('2026-04-04', 'WOMEN - NelMora VELVET', 1, '', 48),
  ('2026-04-05', 'WOMEN - NelMora ELARA', 1, '', 16);

-- bank_entries (in/out -> cash_in/cash_out)
insert into public.bank_entries (date, cash_in, cash_out, balance) values
  ('2025-11-03', 1064, 214, 850),
  ('2025-11-06', 0, 188, 662),
  ('2025-11-09', 240, 0, 902),
  ('2025-11-11', 0, 120, 782),
  ('2025-11-12', 32, 0, 814),
  ('2025-11-16', 192, 0, 1006),
  ('2026-02-24', 24, 0, 1038),
  ('2026-03-28', 0, 300, 776),
  ('2026-04-04', 48, 0, 824);

-- scents (men)
insert into public.scents (gender, code, perfume, inline, status) values
  ('men', 'M23', 'YSL MYSLF', 'HORIZON', 'ADA'),
  ('men', 'M66', 'DUNHILL DESIRE BLUE', 'OBSIDIAN', 'ADA'),
  ('men', 'M54', 'VERSACE EROS', 'AEROS', 'ADA'),
  ('men', 'M68', 'LV IMAGINATION', 'DELUSION', 'ADA'),
  ('men', 'M15', 'CREED AVENTUS', 'VALENTUS', 'ADA'),
  ('men', 'M62', 'AZZARO THE MOST WANTED', 'ARVAN', 'SOON'),
  ('men', 'M4', 'BVLGARI AQVA', 'AQUA', 'SOON'),
  ('men', 'M11', 'CHANEL DE BLEU', 'BLUE', 'SOON');

-- scents (women)
insert into public.scents (gender, code, perfume, inline, status) values
  ('women', 'W25', 'DIOR JADORE', 'BLOOM', 'ADA'),
  ('women', 'W73', 'PACO RABANNE LADY MILLION', 'VELVET', 'ADA'),
  ('women', 'W127', 'KAYALI YUM BOUJEE MARSHMALLOW', 'ELARA', 'ADA'),
  ('women', 'W130', 'PRADA PARADOXE', 'LYRA', 'ADA'),
  ('women', 'W134', 'ARIANA GRANDE SWEET LIKE CANDY', 'CANDY', 'ADA'),
  ('women', 'W137', 'LATTAFA YARA', 'AURA', 'ADA'),
  ('women', 'W99', 'JEAN PAUL GAULTIER SCANDAL', 'SCANDALEUX', 'SOON'),
  ('women', 'W38', 'ESCADA CHERRY IN THE AIR', 'CHERRYWOOD', 'SOON'),
  ('women', '', 'EDEN JUICY APPLE 01', 'AVELIS', 'SOON');

-- stock_entries (men)
insert into public.stock_entries (gender, date, code, perfume, inline, stock) values
  ('men', '2026-07-07', 'M23', 'YSL MYSLF', 'HORIZON', 9),
  ('men', '2026-07-07', 'M66', 'DUNHILL DESIRE BLUE', 'OBSIDIAN', 13),
  ('men', '2026-07-07', 'M54', 'VERSACE EROS', 'AEROS', 5),
  ('men', '2026-07-07', 'M15', 'CREED AVENTUS', 'VALENTUS', 3),
  ('men', '2026-07-07', 'M68', 'LV IMAGINATION', 'DELUSION', 4);

-- stock_entries (women)
insert into public.stock_entries (gender, date, code, perfume, inline, stock) values
  ('women', '2026-07-06', 'W25', 'DIOR JADORE', 'BLOOM', 5),
  ('women', '2026-07-06', 'W73', 'PACO RABANNE LADY MILLION', 'VELVET', 9),
  ('women', '2026-07-06', 'W127', 'KAYALI YUM BOUJEE MARSHMALLOW', 'ELARA', 8),
  ('women', '2026-07-06', 'W130', 'PRADA PARADOXE', 'LYRA', 10),
  ('women', '2026-07-06', 'W134', 'ARIANA GRANDE SWEET LIKE CANDY', 'CANDY', 11),
  ('women', '2026-07-06', 'W137', 'LATTAFA YARA', 'AURA', 4);
