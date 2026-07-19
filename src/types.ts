export type Role = 'admin' | 'staff';

export interface Account {
  id: string;
  email: string;
  role: Role;
}

export interface CostItem {
  id: string;
  name: string;
  cost: number;
}

export interface SaleEntry {
  id: string;
  date: string;
  perfume: string;
  qty: number;
  notes: string;
  total: number;
}

export interface BankEntry {
  id: string;
  date: string;
  in: number;
  out: number;
  balance: number;
}

export interface ScentEntry {
  id: string;
  code: string;
  perfume: string;
  inline: string;
  status: 'ADA' | 'SOON';
}

export interface StockEntry {
  id: string;
  date: string;
  code: string;
  perfume: string;
  inline: string;
  stock: number;
}

export interface AppData {
  finance: {
    rnd: CostItem[];
    firstBatch: CostItem[];
    saleTracker: SaleEntry[];
    bank: BankEntry[];
  };
  scents: {
    men: ScentEntry[];
    women: ScentEntry[];
  };
  stock: {
    men: StockEntry[];
    women: StockEntry[];
  };
  resellers: unknown[];
}
