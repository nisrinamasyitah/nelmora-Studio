import { useState, type KeyboardEvent } from 'react';
import { fmt, fmtDate, todayStr } from '../lib/format';
import { useAppData } from '../lib/AppDataContext';
import { BOTTLE_PRICE, RESELLER_PROFIT_PER_BOTTLE } from '../lib/constants';
import { findScentById, findScentByLabel, scentLabel } from '../lib/scents';
import { adjustStock } from '../lib/stock';
import { IconPlus, IconTrash } from './Icons';

function onEnter(fn: () => void) {
  return (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') fn();
  };
}

export default function Resellers() {
  const {
    data,
    loading,
    error,
    addReseller,
    deleteReseller,
    addResellerSale,
    deleteResellerSale,
    addStockEntry,
  } = useAppData();
  const [resellerDraft, setResellerDraft] = useState({ name: '', placeCover: '' });
  const [saleDraft, setSaleDraft] = useState({
    resellerId: '',
    date: todayStr(),
    scentId: '',
    qty: '1',
    notes: '',
    total: String(BOTTLE_PRICE),
  });

  if (loading) return <div className="empty-cell">Loading…</div>;
  if (error) return <div className="auth-error">{error}</div>;

  const unitsByReseller: Record<string, number> = {};
  data.resellerSales.forEach((s) => {
    unitsByReseller[s.resellerId] = (unitsByReseller[s.resellerId] || 0) + Number(s.qty || 0);
  });
  const totalUnits = data.resellerSales.reduce((s, x) => s + Number(x.qty || 0), 0);
  const totalRevenue = data.resellerSales.reduce((s, x) => s + Number(x.total || 0), 0);
  const totalGrossProfit = totalUnits * RESELLER_PROFIT_PER_BOTTLE;

  async function addResellerRow() {
    if (!resellerDraft.name.trim()) return;
    await addReseller(resellerDraft.name.trim(), resellerDraft.placeCover.trim());
    setResellerDraft({ name: '', placeCover: '' });
  }

  function setSaleQty(qty: string) {
    const n = Number(qty) || 0;
    setSaleDraft((d) => ({ ...d, qty, total: n > 0 ? String(n * BOTTLE_PRICE) : d.total }));
  }

  async function addSale() {
    const found = findScentById(data.scents, saleDraft.scentId);
    if (!saleDraft.resellerId || !saleDraft.date || !found) return;
    const { scent, gender } = found;
    const qty = Number(saleDraft.qty) || 1;
    await addResellerSale({
      resellerId: saleDraft.resellerId,
      date: saleDraft.date,
      perfume: scentLabel(gender, scent.inline),
      qty,
      notes: saleDraft.notes.trim(),
      total: Number(saleDraft.total) || 0,
    });
    await adjustStock(addStockEntry, data.stock, gender, scent, saleDraft.date, -qty);
    setSaleDraft({ resellerId: '', date: todayStr(), scentId: '', qty: '1', notes: '', total: String(BOTTLE_PRICE) });
  }

  async function deleteSale(id: string) {
    const entry = data.resellerSales.find((s) => s.id === id);
    await deleteResellerSale(id);
    const found = entry && findScentByLabel(data.scents, entry.perfume);
    if (entry && found) {
      await adjustStock(addStockEntry, data.stock, found.gender, found.scent, todayStr(), entry.qty);
    }
  }

  const menScents = data.scents.men.filter((s) => s.status === 'ADA');
  const womenScents = data.scents.women.filter((s) => s.status === 'ADA');
  const salesByDateDesc = [...data.resellerSales].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const resellerName = (id: string) => data.resellers.find((r) => r.id === id)?.name ?? '—';

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">Resellers</div>
          <div className="page-desc">Reseller partners, their coverage area, and the sales they've moved.</div>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="label">Resellers</span>
          <div className="value">{data.resellers.length}</div>
          <div className="sub">active partners</div>
        </div>
        <div className="stat-card">
          <span className="label">Units Sold (Resellers)</span>
          <div className="value">{totalUnits}</div>
          <div className="sub">{data.resellerSales.length} sale entries</div>
        </div>
        <div className="stat-card">
          <span className="label">Reseller Gross Profit</span>
          <div className="value">RM {fmt(totalGrossProfit)}</div>
          <div className="sub">{totalUnits} units sold × RM{fmt(RESELLER_PROFIT_PER_BOTTLE)} profit</div>
        </div>
      </div>

      <div className="section-block">
        <div className="section-head">
          <h3>Resellers</h3>
          <span className="tag">{data.resellers.length} partners</span>
        </div>
        <div className="section-body table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Place Cover</th>
                <th style={{ textAlign: 'right' }}>Units Sold</th>
                <th style={{ textAlign: 'right' }}>Gross Profit (RM)</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {data.resellers.length ? (
                data.resellers.map((r) => {
                  const units = unitsByReseller[r.id] || 0;
                  return (
                    <tr key={r.id}>
                      <td style={{ color: 'var(--ink)', fontWeight: 500 }}>{r.name}</td>
                      <td>{r.placeCover || '—'}</td>
                      <td className="num" style={{ textAlign: 'right' }}>
                        {units}
                      </td>
                      <td className="num" style={{ textAlign: 'right' }}>
                        {fmt(units * RESELLER_PROFIT_PER_BOTTLE)}
                      </td>
                      <td>
                        <button className="btn-icon-delete" onClick={() => deleteReseller(r.id)} aria-label="Remove reseller">
                          <IconTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="empty-cell">
                    No resellers added yet.
                  </td>
                </tr>
              )}
              <tr className="table-add-row">
                <td>
                  <input
                    placeholder="Reseller name"
                    value={resellerDraft.name}
                    onChange={(e) => setResellerDraft((d) => ({ ...d, name: e.target.value }))}
                    onKeyDown={onEnter(addResellerRow)}
                  />
                </td>
                <td>
                  <input
                    placeholder="Area covered"
                    value={resellerDraft.placeCover}
                    onChange={(e) => setResellerDraft((d) => ({ ...d, placeCover: e.target.value }))}
                    onKeyDown={onEnter(addResellerRow)}
                  />
                </td>
                <td className="num" style={{ textAlign: 'right' }}>
                  —
                </td>
                <td className="num" style={{ textAlign: 'right' }}>
                  —
                </td>
                <td>
                  <button className="btn-add-icon" onClick={addResellerRow} aria-label="Add reseller">
                    <IconPlus />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="section-block">
        <div className="section-head">
          <h3>Reseller Sale Log</h3>
          <span className="tag">
            RM {fmt(totalRevenue)} · {totalUnits} units
          </span>
        </div>
        <div className="section-body table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Reseller</th>
                <th>Perfume</th>
                <th>Qty</th>
                <th>Notes</th>
                <th style={{ textAlign: 'right' }}>Total (RM)</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {salesByDateDesc.length ? (
                salesByDateDesc.map((s) => (
                  <tr key={s.id}>
                    <td>{fmtDate(s.date)}</td>
                    <td style={{ color: 'var(--ink)', fontWeight: 500 }}>{resellerName(s.resellerId)}</td>
                    <td>{s.perfume}</td>
                    <td className="num">{s.qty}</td>
                    <td>{s.notes || '—'}</td>
                    <td className="num" style={{ textAlign: 'right' }}>
                      {fmt(s.total)}
                    </td>
                    <td>
                      <button className="btn-icon-delete" onClick={() => deleteSale(s.id)} aria-label="Remove sale">
                        <IconTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="empty-cell">
                    No reseller sales logged yet.
                  </td>
                </tr>
              )}
              <tr className="table-add-row">
                <td>
                  <input
                    type="date"
                    value={saleDraft.date}
                    onChange={(e) => setSaleDraft((d) => ({ ...d, date: e.target.value }))}
                  />
                </td>
                <td>
                  <select
                    value={saleDraft.resellerId}
                    onChange={(e) => setSaleDraft((d) => ({ ...d, resellerId: e.target.value }))}
                  >
                    <option value="">Select a reseller</option>
                    {data.resellers.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={saleDraft.scentId}
                    onChange={(e) => setSaleDraft((d) => ({ ...d, scentId: e.target.value }))}
                  >
                    <option value="">Select a scent</option>
                    <optgroup label="Men">
                      {menScents.map((sc) => (
                        <option key={sc.id} value={sc.id}>
                          {sc.inline}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Women">
                      {womenScents.map((sc) => (
                        <option key={sc.id} value={sc.id}>
                          {sc.inline}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={saleDraft.qty}
                    onChange={(e) => setSaleQty(e.target.value)}
                    onKeyDown={onEnter(addSale)}
                    style={{ width: 56 }}
                  />
                </td>
                <td>
                  <input
                    placeholder="Notes"
                    value={saleDraft.notes}
                    onChange={(e) => setSaleDraft((d) => ({ ...d, notes: e.target.value }))}
                    onKeyDown={onEnter(addSale)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={saleDraft.total}
                    onChange={(e) => setSaleDraft((d) => ({ ...d, total: e.target.value }))}
                    onKeyDown={onEnter(addSale)}
                    style={{ textAlign: 'right' }}
                  />
                </td>
                <td>
                  <button className="btn-add-icon" onClick={addSale} aria-label="Add reseller sale">
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
