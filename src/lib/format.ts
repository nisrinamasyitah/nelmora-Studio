import type { SaleEntry } from '../types';

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function fmt(n: number): string {
  n = Number(n) || 0;
  return n.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtDate(d: string): string {
  if (!d) return '—';
  const dt = new Date(d + 'T00:00:00');
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function latestSaleMonth(sales: SaleEntry[]): { year: number; month: number } {
  const dates = sales.map((s) => s.date).filter(Boolean).sort();
  const latest = dates.length ? new Date(dates[dates.length - 1] + 'T00:00:00') : new Date();
  return { year: latest.getFullYear(), month: latest.getMonth() };
}
