import { supabase } from './supabaseClient';
import type { AppData, CostItem, SaleEntry, BankEntry, ScentEntry, StockEntry, Reseller, ResellerSale } from '../types';

type Gender = 'men' | 'women';

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

interface ResellerRow {
  id: string;
  name: string;
  place_cover: string;
}

function mapReseller(row: ResellerRow): Reseller {
  return { id: row.id, name: row.name, placeCover: row.place_cover };
}

interface ResellerSaleRow {
  id: string;
  reseller_id: string;
  date: string;
  perfume: string;
  qty: number;
  notes: string;
  total: number;
}

function mapResellerSale(row: ResellerSaleRow): ResellerSale {
  return {
    id: row.id,
    resellerId: row.reseller_id,
    date: row.date,
    perfume: row.perfume,
    qty: row.qty,
    notes: row.notes,
    total: row.total,
  };
}

export async function fetchAppData(): Promise<AppData> {
  const [rnd, firstBatch, sales, bank, scentsMen, scentsWomen, stockMen, stockWomen, resellers, resellerSales] =
    await Promise.all([
      supabase.from('cost_items').select('id,name,cost').eq('category', 'rnd').order('created_at'),
      supabase.from('cost_items').select('id,name,cost').eq('category', 'first_batch').order('created_at'),
      supabase.from('sale_entries').select('id,date,perfume,qty,notes,total').order('date'),
      supabase.from('bank_entries').select('id,date,cash_in,cash_out,balance').order('date'),
      supabase.from('scents').select('id,code,perfume,inline,status').eq('gender', 'men').order('created_at'),
      supabase.from('scents').select('id,code,perfume,inline,status').eq('gender', 'women').order('created_at'),
      supabase.from('stock_entries').select('id,date,code,perfume,inline,stock').eq('gender', 'men').order('date'),
      supabase.from('stock_entries').select('id,date,code,perfume,inline,stock').eq('gender', 'women').order('date'),
      supabase.from('resellers').select('id,name,place_cover').order('created_at'),
      supabase.from('reseller_sales').select('id,reseller_id,date,perfume,qty,notes,total').order('date'),
    ]);

  for (const r of [rnd, firstBatch, sales, bank, scentsMen, scentsWomen, stockMen, stockWomen, resellers, resellerSales]) {
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
    resellers: (resellers.data as ResellerRow[]).map(mapReseller),
    resellerSales: (resellerSales.data as ResellerSaleRow[]).map(mapResellerSale),
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

export async function insertScent(gender: Gender, entry: Omit<ScentEntry, 'id'>): Promise<ScentEntry> {
  const { data, error } = await supabase
    .from('scents')
    .insert({ gender, code: entry.code, perfume: entry.perfume, inline: entry.inline, status: entry.status })
    .select('id,code,perfume,inline,status')
    .single();
  if (error) throw error;
  return data as ScentEntry;
}

export async function updateScentStatus(id: string, status: 'ADA' | 'SOON'): Promise<void> {
  const { error } = await supabase.from('scents').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function removeScent(id: string): Promise<void> {
  const { error } = await supabase.from('scents').delete().eq('id', id);
  if (error) throw error;
}

export async function insertStockEntry(gender: Gender, entry: Omit<StockEntry, 'id'>): Promise<StockEntry> {
  const { data, error } = await supabase
    .from('stock_entries')
    .insert({ gender, date: entry.date, code: entry.code, perfume: entry.perfume, inline: entry.inline, stock: entry.stock })
    .select('id,date,code,perfume,inline,stock')
    .single();
  if (error) throw error;
  return data as StockEntry;
}

export async function removeStockEntry(id: string): Promise<void> {
  const { error } = await supabase.from('stock_entries').delete().eq('id', id);
  if (error) throw error;
}

export async function insertReseller(name: string, placeCover: string): Promise<Reseller> {
  const { data, error } = await supabase
    .from('resellers')
    .insert({ name, place_cover: placeCover })
    .select('id,name,place_cover')
    .single();
  if (error) throw error;
  return mapReseller(data as ResellerRow);
}

export async function removeReseller(id: string): Promise<void> {
  const { error } = await supabase.from('resellers').delete().eq('id', id);
  if (error) throw error;
}

export async function insertResellerSale(entry: Omit<ResellerSale, 'id'>): Promise<ResellerSale> {
  const { data, error } = await supabase
    .from('reseller_sales')
    .insert({
      reseller_id: entry.resellerId,
      date: entry.date,
      perfume: entry.perfume,
      qty: entry.qty,
      notes: entry.notes,
      total: entry.total,
    })
    .select('id,reseller_id,date,perfume,qty,notes,total')
    .single();
  if (error) throw error;
  return mapResellerSale(data as ResellerSaleRow);
}

export async function removeResellerSale(id: string): Promise<void> {
  const { error } = await supabase.from('reseller_sales').delete().eq('id', id);
  if (error) throw error;
}
