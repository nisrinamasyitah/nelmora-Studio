import { useState, type KeyboardEvent } from 'react';
import { fmtDate, todayStr } from '../lib/format';
import { useAppData } from '../lib/AppDataContext';
import { latestStockByCode } from '../lib/stock';
import type { Gender } from '../lib/scents';
import { IconPlus, IconTrash } from './Icons';

function onEnter(fn: () => void) {
  return (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') fn();
  };
}

export default function Stock() {
  const { data, loading, error, addStockEntry, deleteStockEntry } = useAppData();
  const [gender, setGender] = useState<Gender>('men');
  const [draft, setDraft] = useState({ scentId: '', date: todayStr(), stock: '' });

  if (loading) return <div className="empty-cell">Loading…</div>;
  if (error) return <div className="auth-error">{error}</div>;

  const scents = data.scents[gender].filter((s) => s.status === 'ADA');

  const currentMen = Object.values(latestStockByCode(data.stock.men));
  const currentWomen = Object.values(latestStockByCode(data.stock.women));
  const currentAll = [...currentMen, ...currentWomen];
  const totalUnits = currentAll.reduce((s, x) => s + Number(x.stock || 0), 0);
  const lowStockCount = currentAll.filter((x) => Number(x.stock) <= 5).length;
  const codesTracked = currentAll.length;

  const currentForTab = [...(gender === 'men' ? currentMen : currentWomen)].sort((a, b) => a.stock - b.stock);
  const ledgerForTab = [...data.stock[gender]].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const genderLabel = gender === 'men' ? 'Men' : 'Women';

  async function addEntry() {
    const scent = scents.find((s) => s.id === draft.scentId);
    if (!scent || !draft.date || !draft.stock) return;
    await addStockEntry(gender, {
      date: draft.date,
      code: scent.code,
      perfume: scent.perfume,
      inline: scent.inline,
      stock: Number(draft.stock) || 0,
    });
    setDraft({ scentId: '', date: todayStr(), stock: '' });
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">Stock</div>
          <div className="page-desc">
            Inventory snapshots for the men and women lines. Sales deduct stock automatically — add an entry below
            only when new stock comes in.
          </div>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="label">Units In Stock</span>
          <div className="value">{totalUnits}</div>
          <div className="sub">across men &amp; women lines</div>
        </div>
        <div className="stat-card">
          <span className="label">Codes Tracked</span>
          <div className="value">{codesTracked}</div>
          <div className="sub">distinct perfume codes</div>
        </div>
        <div className="stat-card">
          <span className="label">Low Stock</span>
          <div className="value">{lowStockCount}</div>
          <div className="sub">5 units or fewer</div>
        </div>
      </div>

      <div className="tab-bar">
        <button className={`tab-item${gender === 'men' ? ' active' : ''}`} onClick={() => setGender('men')}>
          Men
        </button>
        <button className={`tab-item${gender === 'women' ? ' active' : ''}`} onClick={() => setGender('women')}>
          Women
        </button>
      </div>

      <div className="section-block">
        <div className="section-head">
          <h3>Current Stock — {genderLabel}</h3>
          <span className="tag">{currentForTab.length} items</span>
        </div>
        <div className="section-body table-wrap">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Perfume</th>
                <th>Scent</th>
                <th style={{ textAlign: 'right' }}>Stock</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {currentForTab.length ? (
                currentForTab.map((s) => (
                  <tr key={s.id}>
                    <td style={{ color: 'var(--ink)', fontWeight: 500 }}>{s.code || '—'}</td>
                    <td>{s.perfume}</td>
                    <td>{s.inline}</td>
                    <td className="num" style={{ textAlign: 'right' }}>
                      {s.stock}
                    </td>
                    <td>{fmtDate(s.date)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="empty-cell">
                    No stock logged for {genderLabel.toLowerCase()} yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section-block">
        <div className="section-head">
          <h3>Stock Ledger — {genderLabel}</h3>
          <span className="tag">{ledgerForTab.length} entries</span>
        </div>
        <div className="section-body table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Scent</th>
                <th>Code</th>
                <th style={{ textAlign: 'right' }}>Stock</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {ledgerForTab.length ? (
                ledgerForTab.map((s) => (
                  <tr key={s.id}>
                    <td>{fmtDate(s.date)}</td>
                    <td style={{ color: 'var(--ink)', fontWeight: 500 }}>{s.inline}</td>
                    <td>{s.code || '—'}</td>
                    <td className="num" style={{ textAlign: 'right' }}>
                      {s.stock}
                    </td>
                    <td>
                      <button className="btn-icon-delete" onClick={() => deleteStockEntry(s.id)} aria-label="Remove entry">
                        <IconTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="empty-cell">
                    No stock entries logged yet.
                  </td>
                </tr>
              )}
              <tr className="table-add-row">
                <td>
                  <input
                    type="date"
                    value={draft.date}
                    onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
                  />
                </td>
                <td>
                  <select value={draft.scentId} onChange={(e) => setDraft((d) => ({ ...d, scentId: e.target.value }))}>
                    <option value="">Select a scent</option>
                    {scents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.inline}
                      </option>
                    ))}
                  </select>
                </td>
                <td style={{ color: 'var(--ink-4)' }}>{scents.find((s) => s.id === draft.scentId)?.code || '—'}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={draft.stock}
                    onChange={(e) => setDraft((d) => ({ ...d, stock: e.target.value }))}
                    onKeyDown={onEnter(addEntry)}
                    style={{ textAlign: 'right', width: 70 }}
                  />
                </td>
                <td>
                  <button className="btn-add-icon" onClick={addEntry} aria-label="Add stock entry">
                    <IconPlus />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
