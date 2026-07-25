import { fmt, fmtDate } from '../lib/format';
import { useAppData } from '../lib/AppDataContext';
import { combineSales, combinedGrossProfit } from '../lib/sales';
import type { StockEntry } from '../types';
import SalesCalendar from './SalesCalendar';

export default function Dashboard() {
  const { data: DATA, loading, error } = useAppData();

  if (loading) return <div className="empty-cell">Loading…</div>;
  if (error) return <div className="auth-error">{error}</div>;

  const allSales = combineSales(DATA.finance.saleTracker, DATA.resellerSales, DATA.resellers);

  const bank = DATA.finance.bank;
  const balance = bank.length ? bank[bank.length - 1].balance : 0;
  const salesTotal = allSales.reduce((s, x) => s + Number(x.total || 0), 0);
  const resellerCount = DATA.resellers.length;

  const directUnits = DATA.finance.saleTracker.reduce((s, x) => s + Number(x.qty || 0), 0);
  const resellerUnits = DATA.resellerSales.reduce((s, x) => s + Number(x.qty || 0), 0);
  const unitsSold = directUnits + resellerUnits;
  const grossProfit = combinedGrossProfit(DATA.finance.saleTracker, DATA.resellerSales);

  const recentSales = [...allSales]
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 6);

  const allStock: (StockEntry & { line: string })[] = [
    ...DATA.stock.men.map((s) => ({ ...s, line: 'Men' })),
    ...DATA.stock.women.map((s) => ({ ...s, line: 'Women' })),
  ];
  const latestByCode: Record<string, StockEntry & { line: string }> = {};
  allStock.forEach((s) => {
    if (!latestByCode[s.code] || (s.date || '') > (latestByCode[s.code].date || '')) {
      latestByCode[s.code] = s;
    }
  });
  const lowStock = Object.values(latestByCode)
    .filter((s) => Number(s.stock) <= 5)
    .sort((a, b) => a.stock - b.stock);

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">Overview</div>
          <div className="page-desc">A snapshot of NelMora's investment, sales, stock and partners.</div>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="label">Bank Balance</span>
          <div className="value">RM {fmt(balance)}</div>
          <div className="sub">as of last ledger entry</div>
        </div>
        <div className="stat-card">
          <span className="label">Total Sales</span>
          <div className="value">RM {fmt(salesTotal)}</div>
          <div className="sub">{allSales.length} sale entries</div>
        </div>
        <div className="stat-card">
          <span className="label">Units Sold</span>
          <div className="value">{unitsSold}</div>
          <div className="sub">{directUnits} direct + {resellerUnits} reseller</div>
        </div>
        <div className="stat-card">
          <span className="label">Resellers</span>
          <div className="value">{resellerCount}</div>
          <div className="sub">active partners</div>
        </div>
        <div className="stat-card">
          <span className="label">Gross Profit</span>
          <div className="value">RM {fmt(grossProfit)}</div>
          <div className="sub">RM7.80/bottle direct · RM3.90/bottle reseller</div>
        </div>
      </div>

      <SalesCalendar sales={allSales} />

      <div className="section-block">
        <div className="section-head">
          <h3>Recent Sales</h3>
          <span className="tag">Latest 6 entries</span>
        </div>
        <div className="section-body table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Perfume</th>
                <th>Via</th>
                <th>Qty</th>
                <th>Notes</th>
                <th style={{ textAlign: 'right' }}>Total (RM)</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.length ? (
                recentSales.map((s) => (
                  <tr key={s.id}>
                    <td>{fmtDate(s.date)}</td>
                    <td style={{ color: 'var(--ink)', fontWeight: 500 }}>{s.perfume}</td>
                    <td>
                      {s.source === 'reseller' ? (
                        <span className="source-tag">{s.resellerName}</span>
                      ) : (
                        <span className="source-tag source-tag-direct">Direct</span>
                      )}
                    </td>
                    <td className="num">{s.qty}</td>
                    <td>{s.notes || '—'}</td>
                    <td className="num" style={{ textAlign: 'right' }}>
                      {fmt(s.total)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="empty-cell">
                    No sales logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section-block">
        <div className="section-head">
          <h3>Stock Running Low</h3>
          <span className="tag">5 units or fewer</span>
        </div>
        <div className="section-body table-wrap">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Perfume</th>
                <th>Line</th>
                <th>For</th>
                <th style={{ textAlign: 'right' }}>Stock</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.length ? (
                lowStock.map((s) => (
                  <tr key={s.id}>
                    <td style={{ color: 'var(--ink)', fontWeight: 500 }}>{s.code || '—'}</td>
                    <td>{s.perfume}</td>
                    <td>{s.inline}</td>
                    <td>{s.line}</td>
                    <td className="num" style={{ textAlign: 'right' }}>
                      {s.stock}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="empty-cell">
                    Nothing running low right now.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
