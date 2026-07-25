import type { ScentEntry, StockEntry } from '../types';
import type { Gender } from './scents';

export function latestStockByCode(list: StockEntry[]): Record<string, StockEntry> {
  const map: Record<string, StockEntry> = {};
  for (const s of list) {
    // >= so that, among same-day entries, the one added later (later in the
    // fetched/appended order) wins as "current" instead of the first one seen.
    if (!map[s.code] || (s.date || '') >= (map[s.code].date || '')) map[s.code] = s;
  }
  return map;
}

export function currentStockFor(list: StockEntry[], code: string): number {
  return latestStockByCode(list)[code]?.stock ?? 0;
}

export async function adjustStock(
  addStockEntry: (gender: Gender, entry: Omit<StockEntry, 'id'>) => Promise<void>,
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
