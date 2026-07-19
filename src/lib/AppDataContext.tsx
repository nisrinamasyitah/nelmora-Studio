import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AppData, SaleEntry, BankEntry } from '../types';
import {
  fetchAppData,
  insertCostItem,
  removeCostItem,
  insertSaleEntry,
  removeSaleEntry,
  insertBankEntry,
  removeBankEntry,
} from './api';

const EMPTY: AppData = {
  finance: { rnd: [], firstBatch: [], saleTracker: [], bank: [] },
  scents: { men: [], women: [] },
  stock: { men: [], women: [] },
  resellers: [],
};

interface AppDataContextValue {
  data: AppData;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addCostItem: (category: 'rnd' | 'first_batch', name: string, cost: number) => Promise<void>;
  deleteCostItem: (id: string) => Promise<void>;
  addSaleEntry: (entry: Omit<SaleEntry, 'id'>) => Promise<void>;
  deleteSaleEntry: (id: string) => Promise<void>;
  addBankEntry: (entry: Omit<BankEntry, 'id'>) => Promise<void>;
  deleteBankEntry: (id: string) => Promise<void>;
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
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
