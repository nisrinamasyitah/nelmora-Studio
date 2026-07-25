import type { ScentEntry, StockEntry } from '../types';
import type { Gender } from './scents';

function isNewer(a: StockEntry, b: StockEntry): boolean {
  const dateA = a.date || '';
  const dateB = b.date || '';
  if (dateA !== dateB) return dateA > dateB;
  // Same day (common: a sale's auto-decrement and a later restore-on-delete
  // both land on today) — break the tie with the real DB creation timestamp,
  // not array/fetch order, which Postgres doesn't guarantee for equal dates.
  return (a.createdAt || '') > (b.createdAt || '');
}

export function latestStockByCode(list: StockEntry[]): Record<string, StockEntry> {
  const map: Record<string, StockEntry> = {};
  for (const s of list) {
    if (!map[s.code] || isNewer(s, map[s.code])) map[s.code] = s;
  }
  return map;
}

export function currentStockFor(list: StockEntry[], code: string): number {
  return latestStockByCode(list)[code]?.stock ?? 0;
}

export async function adjustStock(
  addStockEntry: (gender: Gender, entry: Omit<StockEntry, 'id' | 'createdAt'>) => Promise<void>,
  stockByGender: Record<Gender, StockEntry[]>,
  gender: Gender,
  scent: ScentEntry,
  date: string,
  delta: number,
): Promise<void> {
  const current = currentStockFor(stockByGender[gender], scent.code);
  await addStockEntry(gender, {
    date,
    code: scent.code,
    perfume: scent.perfume,
    inline: scent.inline,
    stock: current + delta,
  });
}
