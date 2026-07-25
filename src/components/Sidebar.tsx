import type { ReactNode } from 'react';
import type { Account } from '../types';
import { IconDashboard, IconFinance, IconResellers, IconScents, IconStock } from './Icons';

export type Page = 'dashboard' | 'finance' | 'resellers' | 'stock' | 'scents';

interface NavLink {
  key: Page;
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
  { key: 'resellers', label: 'Resellers', icon: <IconResellers /> },
];

const opsLinks: NavLink[] = [
  { key: 'scents', label: 'Scents Catalog', icon: <IconScents /> },
  { key: 'stock', label: 'Stock', icon: <IconStock /> },
];

export default function Sidebar({ user, page, onNavigate, onLogout }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo" aria-label="NelMora">
          <span>N</span>
          <span className="brand-logo-divider" />
          <span>M</span>
        </div>
        <div className="brand-sub">Studio System</div>
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
        {opsLinks.map((link) => (
          <button
            key={link.key}
            className={`nav-item${page === link.key ? ' active' : ''}`}
            onClick={() => onNavigate(link.key)}
          >
            {link.icon}
            {link.label}
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
