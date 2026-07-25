import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Finance from './components/Finance';
import Resellers from './components/Resellers';
import Stock from './components/Stock';
import Scents from './components/Scents';
import Sidebar, { type Page } from './components/Sidebar';
import Topbar from './components/Topbar';
import { supabase } from './lib/supabaseClient';
import { AppDataProvider } from './lib/AppDataContext';
import type { Account } from './types';

const PAGE_TITLES: Record<Page, string> = {
  dashboard: 'Dashboard',
  finance: 'Finance',
  resellers: 'Resellers',
  stock: 'Stock',
  scents: 'Scents Catalog',
};

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [page, setPage] = useState<Page>('dashboard');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckingSession(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (checkingSession) {
    return <div className="auth-error" style={{ margin: 40 }}>Loading…</div>;
  }

  if (!session) {
    return <Login />;
  }

  const user: Account = {
    id: session.user.id,
    email: session.user.email ?? '',
    role: session.user.user_metadata?.role === 'admin' ? 'admin' : 'staff',
  };

  return (
    <AppDataProvider>
      <div className="app-shell">
        <Sidebar user={user} page={page} onNavigate={setPage} onLogout={() => supabase.auth.signOut()} />
        <main className="main">
          <Topbar section={PAGE_TITLES[page]} />
          <div className="content">
            {page === 'dashboard' && <Dashboard />}
            {page === 'finance' && <Finance />}
            {page === 'resellers' && <Resellers />}
            {page === 'stock' && <Stock />}
            {page === 'scents' && <Scents />}
          </div>
        </main>
      </div>
    </AppDataProvider>
  );
}

export default App;
