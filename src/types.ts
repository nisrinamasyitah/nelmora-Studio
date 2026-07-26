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
  createdAt: string;
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
  createdAt: string;
}

export interface Reseller {
  id: string;
  name: string;
  placeCover: string;
}

export interface ResellerSale {
  id: string;
  resellerId: string;
  date: string;
  perfume: string;
  qty: number;
  notes: string;
  total: number;
  createdAt: string;
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
  resellers: Reseller[];
  resellerSales: ResellerSale[];
}
