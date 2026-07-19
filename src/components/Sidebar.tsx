import type { ReactNode } from 'react';
import type { Account } from '../types';
import { IconDashboard, IconFinance, IconResellers, IconScents, IconStock } from './Icons';

export type Page = 'dashboard' | 'finance';

interface NavLink {
  key: Page;
  label: string;
  icon: ReactNode;
}

interface SoonItem {
  key: string;
  label: string;
  icon: ReactNode;
}

interface SidebarProps {
  user: Account;
  page: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

const links: NavLink[] = [
  { key: 'dashboard', label: 'Dashboard', icon: <IconDashboard /> },
  { key: 'finance', label: 'Finance', icon: <IconFinance /> },
];

const soonItems: SoonItem[] = [
  { key: 'scents', label: 'Scents Catalog', icon: <IconScents /> },
  { key: 'stock', label: 'Stock', icon: <IconStock /> },
  { key: 'resellers', label: 'Resellers', icon: <IconResellers /> },
];

export default function Sidebar({ user, page, onNavigate, onLogout }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">N</div>
        <div>
          <div className="brand-name">NelMora</div>
          <div className="brand-sub">Studio System</div>
        </div>
      </div>
      <nav className="nav">
        {links.map((link) => (
          <button
            key={link.key}
            className={`nav-item${page === link.key ? ' active' : ''}`}
            onClick={() => onNavigate(link.key)}
          >
            {link.icon}
            {link.label}
          </button>
        ))}
        <div className="nav-section-label">Operations &amp; Partners</div>
        {soonItems.map((item) => (
          <button key={item.key} className="nav-item disabled" title="Coming soon" disabled>
            {item.icon}
            {item.label}
            <span className="nav-soon">Soon</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-foot">
        <div className="user-chip">
          {user.email}
          {user.role === 'admin' ? ' · Admin' : ''}
        </div>
        <button className="logout-btn" onClick={onLogout}>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
