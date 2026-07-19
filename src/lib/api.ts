import { supabase } from './supabaseClient';
import type { AppData, CostItem, SaleEntry, BankEntry, ScentEntry, StockEntry } from '../types';

interface BankRow {
  id: string;
  date: string;
  cash_in: number;
  cash_out: number;
  balance: number;
}

function mapBank(row: BankRow): BankEntry {
  return { id: row.id, date: row.date, in: row.cash_in, out: row.cash_out, balance: row.balance };
}

export async function fetchAppData(): Promise<AppData> {
  const [rnd, firstBatch, sales, bank, scentsMen, scentsWomen, stockMen, stockWomen] = await Promise.all([
    supabase.from('cost_items').select('id,name,cost').eq('category', 'rnd').order('created_at'),
    supabase.from('cost_items').select('id,name,cost').eq('category', 'first_batch').order('created_at'),
    supabase.from('sale_entries').select('id,date,perfume,qty,notes,total').order('date'),
    supabase.from('bank_entries').select('id,date,cash_in,cash_out,balance').order('date'),
    supabase.from('scents').select('id,code,perfume,inline,status').eq('gender', 'men').order('created_at'),
    supabase.from('scents').select('id,code,perfume,inline,status').eq('gender', 'women').order('created_at'),
    supabase.from('stock_entries').select('id,date,code,perfume,inline,stock').eq('gender', 'men').order('date'),
    supabase.from('stock_entries').select('id,date,code,perfume,inline,stock').eq('gender', 'women').order('date'),
  ]);

  for (const r of [rnd, firstBatch, sales, bank, scentsMen, scentsWomen, stockMen, stockWomen]) {
    if (r.error) throw r.error;
  }

  return {
    finance: {
      rnd: rnd.data as CostItem[],
      firstBatch: firstBatch.data as CostItem[],
      saleTracker: sales.data as SaleEntry[],
      bank: (bank.data as BankRow[]).map(mapBank),
    },
    scents: { men: scentsMen.data as ScentEntry[], women: scentsWomen.data as ScentEntry[] },
    stock: { men: stockMen.data as StockEntry[], women: stockWomen.data as StockEntry[] },
    resellers: [],
  };
}

export async function insertCostItem(category: 'rnd' | 'first_batch', name: string, cost: number): Promise<CostItem> {
  const { data, error } = await supabase
    .from('cost_items')
    .insert({ category, name, cost })
    .select('id,name,cost')
    .single();
  if (error) throw error;
  return data as CostItem;
}

export async function removeCostItem(id: string): Promise<void> {
  const { error } = await supabase.from('cost_items').delete().eq('id', id);
  if (error) throw error;
}

export async function insertSaleEntry(entry: Omit<SaleEntry, 'id'>): Promise<SaleEntry> {
  const { data, error } = await supabase
    .from('sale_entries')
    .insert(entry)
    .select('id,date,perfume,qty,notes,total')
    .single();
  if (error) throw error;
  return data as SaleEntry;
}

export async function removeSaleEntry(id: string): Promise<void> {
  const { error } = await supabase.from('sale_entries').delete().eq('id', id);
  if (error) throw error;
}

export async function insertBankEntry(entry: Omit<BankEntry, 'id'>): Promise<BankEntry> {
  const { data, error } = await supabase
    .from('bank_entries')
    .insert({ date: entry.date, cash_in: entry.in, cash_out: entry.out, balance: entry.balance })
    .select('id,date,cash_in,cash_out,balance')
    .single();
  if (error) throw error;
  return mapBank(data as BankRow);
}

export async function removeBankEntry(id: string): Promise<void> {
  const { error } = await supabase.from('bank_entries').delete().eq('id', id);
  if (error) throw error;
}
