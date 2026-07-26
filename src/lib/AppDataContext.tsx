import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AppData, SaleEntry, BankEntry, ScentEntry, StockEntry, ResellerSale } from '../types';
import {
  fetchAppData,
  insertCostItem,
  removeCostItem,
  insertSaleEntry,
  removeSaleEntry,
  insertBankEntry,
  removeBankEntry,
  insertScent,
  updateScentStatus,
  removeScent,
  insertStockEntry,
  removeStockEntry,
  insertReseller,
  removeReseller,
  insertResellerSale,
  removeResellerSale,
} from './api';

const EMPTY: AppData = {
  finance: { rnd: [], firstBatch: [], saleTracker: [], bank: [] },
  scents: { men: [], women: [] },
  stock: { men: [], women: [] },
  resellers: [],
  resellerSales: [],
};

interface AppDataContextValue {
  data: AppData;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addCostItem: (category: 'rnd' | 'first_batch', name: string, cost: number) => Promise<void>;
  deleteCostItem: (id: string) => Promise<void>;
  addSaleEntry: (entry: Omit<SaleEntry, 'id' | 'createdAt'>) => Promise<void>;
  deleteSaleEntry: (id: string) => Promise<void>;
  addBankEntry: (entry: Omit<BankEntry, 'id'>) => Promise<void>;
  deleteBankEntry: (id: string) => Promise<void>;
  addScent: (gender: 'men' | 'women', entry: Omit<ScentEntry, 'id'>) => Promise<void>;
  setScentStatus: (id: string, status: 'ADA' | 'SOON') => Promise<void>;
  deleteScent: (id: string) => Promise<void>;
  addStockEntry: (gender: 'men' | 'women', entry: Omit<StockEntry, 'id' | 'createdAt'>) => Promise<void>;
  deleteStockEntry: (id: string) => Promise<void>;
  addReseller: (name: string, placeCover: string) => Promise<void>;
  deleteReseller: (id: string) => Promise<void>;
  addResellerSale: (entry: Omit<ResellerSale, 'id' | 'createdAt'>) => Promise<void>;
  deleteResellerSale: (id: string) => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchAppData());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value: AppDataContextValue = {
    data,
    loading,
    error,
    refresh,
    async addCostItem(category, name, cost) {
      const row = await insertCostItem(category, name, cost);
      const key = category === 'rnd' ? 'rnd' : 'firstBatch';
      setData((d) => ({ ...d, finance: { ...d.finance, [key]: [...d.finance[key], row] } }));
    },
    async deleteCostItem(id) {
      await removeCostItem(id);
      setData((d) => ({
        ...d,
        finance: {
          ...d.finance,
          rnd: d.finance.rnd.filter((x) => x.id !== id),
          firstBatch: d.finance.firstBatch.filter((x) => x.id !== id),
        },
      }));
    },
    async addSaleEntry(entry) {
      const row = await insertSaleEntry(entry);
      setData((d) => ({ ...d, finance: { ...d.finance, saleTracker: [...d.finance.saleTracker, row] } }));
    },
    async deleteSaleEntry(id) {
      await removeSaleEntry(id);
      setData((d) => ({
        ...d,
        finance: { ...d.finance, saleTracker: d.finance.saleTracker.filter((x) => x.id !== id) },
      }));
    },
    async addBankEntry(entry) {
      const row = await insertBankEntry(entry);
      setData((d) => ({ ...d, finance: { ...d.finance, bank: [...d.finance.bank, row] } }));
    },
    async deleteBankEntry(id) {
      await removeBankEntry(id);
      setData((d) => ({ ...d, finance: { ...d.finance, bank: d.finance.bank.filter((x) => x.id !== id) } }));
    },
    async addScent(gender, entry) {
      const row = await insertScent(gender, entry);
      setData((d) => ({ ...d, scents: { ...d.scents, [gender]: [...d.scents[gender], row] } }));
    },
    async setScentStatus(id, status) {
      await updateScentStatus(id, status);
      setData((d) => ({
        ...d,
        scents: {
          men: d.scents.men.map((s) => (s.id === id ? { ...s, status } : s)),
          women: d.scents.women.map((s) => (s.id === id ? { ...s, status } : s)),
        },
      }));
    },
    async deleteScent(id) {
      await removeScent(id);
      setData((d) => ({
        ...d,
        scents: {
          men: d.scents.men.filter((x) => x.id !== id),
          women: d.scents.women.filter((x) => x.id !== id),
        },
      }));
    },
    async addStockEntry(gender, entry) {
      const row = await insertStockEntry(gender, entry);
      setData((d) => ({ ...d, stock: { ...d.stock, [gender]: [...d.stock[gender], row] } }));
    },
    async deleteStockEntry(id) {
      await removeStockEntry(id);
      setData((d) => ({
        ...d,
        stock: {
          men: d.stock.men.filter((x) => x.id !== id),
          women: d.stock.women.filter((x) => x.id !== id),
        },
      }));
    },
    async addReseller(name, placeCover) {
      const row = await insertReseller(name, placeCover);
      setData((d) => ({ ...d, resellers: [...d.resellers, row] }));
    },
    async deleteReseller(id) {
      await removeReseller(id);
      setData((d) => ({
        ...d,
        resellers: d.resellers.filter((x) => x.id !== id),
        resellerSales: d.resellerSales.filter((x) => x.resellerId !== id),
      }));
    },
    async addResellerSale(entry) {
      const row = await insertResellerSale(entry);
      setData((d) => ({ ...d, resellerSales: [...d.resellerSales, row] }));
    },
    async deleteResellerSale(id) {
      await removeResellerSale(id);
      setData((d) => ({ ...d, resellerSales: d.resellerSales.filter((x) => x.id !== id) }));
    },
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
