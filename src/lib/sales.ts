import type { SaleEntry, ResellerSale, Reseller } from '../types';
import { PROFIT_PER_BOTTLE, RESELLER_PROFIT_PER_BOTTLE } from './constants';

export interface CombinedSale extends SaleEntry {
  source: 'direct' | 'reseller';
  resellerName?: string;
}

export function combineSales(direct: SaleEntry[], resellerSales: ResellerSale[], resellers: Reseller[]): CombinedSale[] {
  const resellerName = (id: string) => resellers.find((r) => r.id === id)?.name ?? 'Reseller';
  return [
    ...direct.map((s): CombinedSale => ({ ...s, source: 'direct' })),
    ...resellerSales.map(
      (s): CombinedSale => ({
        id: s.id,
        date: s.date,
        perfume: s.perfume,
        qty: s.qty,
        notes: s.notes,
        total: s.total,
        source: 'reseller',
        resellerName: resellerName(s.resellerId),
      }),
    ),
  ];
}

export function combinedGrossProfit(direct: SaleEntry[], resellerSales: ResellerSale[]): number {
  const directUnits = direct.reduce((s, x) => s + Number(x.qty || 0), 0);
  const resellerUnits = resellerSales.reduce((s, x) => s + Number(x.qty || 0), 0);
  return directUnits * PROFIT_PER_BOTTLE + resellerUnits * RESELLER_PROFIT_PER_BOTTLE;
}
