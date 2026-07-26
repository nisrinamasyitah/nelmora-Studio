import { useState, type KeyboardEvent } from 'react';
import { fmt, fmtDate, latestSaleMonth, todayStr } from '../lib/format';
import { useAppData } from '../lib/AppDataContext';
import { BOTTLE_PRICE } from '../lib/constants';
import { combineSales } from '../lib/sales';
import { findScentById, findScentByLabel, scentLabel } from '../lib/scents';
import { adjustStock } from '../lib/stock';
import { IconPlus, IconTrash } from './Icons';
import SalesCalendar from './SalesCalendar';

function onEnter(fn: () => void) {
  return (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') fn();
  };
}

type FinanceTab = 'rnd' | 'firstBatch' | 'sale' | 'bank';

const TABS: { key: FinanceTab; label: string }[] = [
  { key: 'rnd', label: 'R&D Costs' },
  { key: 'firstBatch', label: 'First Batch Costs' },
  { key: 'sale', label: 'Sale Tracker' },
  { key: 'bank', label: 'Bank Ledger' },
];

export default function Finance() {
  const {
    data,
    loading,
    error,
    addCostItem,
    deleteCostItem,
    addSaleEntry,
    deleteSaleEntry,
    addStockEntry,
    addBankEntry,
    deleteBankEntry,
  } = useAppData();
  const [tab, setTab] = useState<FinanceTab>('rnd');
  const allSales = combineSales(data.finance.saleTracker, data.resellerSales, data.resellers);
  const [calendarMonth, setCalendarMonth] = useState(() => latestSaleMonth(allSales));
  const [rndDraft, setRndDraft] = useState({ name: '', cost: '' });
  const [fbDraft, setFbDraft] = useState({ name: '', cost: '' });
  const [saleDraft, setSaleDraft] = useState({ date: todayStr(), scentId: '', qty: '1', notes: '', total: String(BOTTLE_PRICE) });
  const [bankDraft, setBankDraft] = useState({ date: todayStr(), in: '', out: '' });

  if (loading) return <div className="empty-cell">Loading…</div>;
  if (error) return <div className="auth-error">{error}</div>;

  const rndTotal = data.finance.rnd.reduce((s, x) => s + Number(x.cost || 0), 0);
  const fbTotal = data.finance.firstBatch.reduce((s, x) => s + Number(x.cost || 0), 0);
  const salesTotal = allSales.reduce((s, x) => s + Number(x.total || 0), 0);
  const bankBalance = data.finance.bank.length ? data.finance.bank[data.finance.bank.length - 1].balance : 0;

  // ---- R&D ----
  async function addRnd() {
    if (!rndDraft.name.trim()) return;
    await addCostItem('rnd', rndDraft.name.trim(), Number(rndDraft.cost) || 0);
    setRndDraft({ name: '', cost: '' });
  }
  function deleteRnd(id: string) {
    deleteCostItem(id);
  }

  // ---- First Batch ----
  async function addFirstBatch() {
    if (!fbDraft.name.trim()) return;
    await addCostItem('first_batch', fbDraft.name.trim(), Number(fbDraft.cost) || 0);
    setFbDraft({ name: '', cost: '' });
  }
  function deleteFirstBatch(id: string) {
    deleteCostItem(id);
  }

  // ---- Sale Tracker ----
  function setSaleQty(qty: string) {
    const n = Number(qty) || 0;
    setSaleDraft((d) => ({ ...d, qty, total: n > 0 ? String(n * BOTTLE_PRICE) : d.total }));
  }
  async function addSale() {
    const found = findScentById(data.scents, saleDraft.scentId);
    if (!saleDraft.date || !found) return;
    const { scent, gender } = found;
    const qty = Number(saleDraft.qty) || 1;
    await addSaleEntry({
      date: saleDraft.date,
      perfume: scentLabel(gender, scent.inline),
      qty,
      notes: saleDraft.notes.trim(),
      total: Number(saleDraft.total) || 0,
    });
    await adjustStock(addStockEntry, data.stock, gender, scent, saleDraft.date, -qty);
    setSaleDraft({ date: todayStr(), scentId: '', qty: '1', notes: '', total: String(BOTTLE_PRICE) });
  }
  async function deleteSale(id: string) {
    const entry = data.finance.saleTracker.find((s) => s.id === id);
    await deleteSaleEntry(id);
    const found = entry && findScentByLabel(data.scents, entry.perfume);
    if (entry && found) {
      await adjustStock(addStockEntry, data.stock, found.gender, found.scent, todayStr(), entry.qty);
    }
  }
  const menScents = data.scents.men.filter((s) => s.status === 'ADA');
  const womenScents = data.scents.women.filter((s) => s.status === 'ADA');

  const salesByDateDesc = allSales
    .filter((s) => {
      if (!s.date) return false;
      const d = new Date(s.date + 'T00:00:00');
      return d.getFullYear() === calendarMonth.year && d.getMonth() === calendarMonth.month;
    })
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  const salesByDateDescTotal = salesByDateDesc.reduce((s, x) => s + Number(x.total || 0), 0);
  const calendarMonthLabel = new Date(calendarMonth.year, calendarMonth.month, 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });

  // ---- Bank Ledger ----
  const bankDraftIn = Number(bankDraft.in) || 0;
  const bankDraftOut = Number(bankDraft.out) || 0;
  const bankDraftPreviewBalance = bankBalance + bankDraftIn - bankDraftOut;
  async function addBank() {
    if (!bankDraft.date) return;
    await addBankEntry({ date: bankDraft.date, in: bankDraftIn, out: bankDraftOut, balance: bankDraftPreviewBalance });
    setBankDraft({ date: todayStr(), in: '', out: '' });
  }
  function deleteBank(id: string) {
    deleteBankEntry(id);
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">Finance</div>
          <div className="page-desc">R&amp;D and first batch investment, the sale tracker, and the bank ledger.</div>
        </div>
      </div>

      <div className="stat-grid">
        <button className={`stat-card clickable${tab === 'bank' ? ' is-current' : ''}`} onClick={() => setTab('bank')}>
          <span className="label">Bank Balance</span>
          <div className="value">RM {fmt(bankBalance)}</div>
          <div className="sub">as of last ledger entry</div>
        </button>
        <button className={`stat-card clickable${tab === 'sale' ? ' is-current' : ''}`} onClick={() => setTab('sale')}>
          <span className="label">Total Sales</span>
          <div className="value">RM {fmt(salesTotal)}</div>
          <div className="sub">{allSales.length} sale entries · direct + reseller</div>
        </button>
        <button className={`stat-card clickable${tab === 'rnd' ? ' is-current' : ''}`} onClick={() => setTab('rnd')}>
          <span className="label">R&amp;D Costs</span>
          <div className="value">RM {fmt(rndTotal)}</div>
          <div className="sub">{data.finance.rnd.length} line items</div>
        </button>
        <button className={`stat-card clickable${tab === 'firstBatch' ? ' is-current' : ''}`} onClick={() => setTab('firstBatch')}>
          <span className="label">First Batch Costs</span>
          <div className="value">RM {fmt(fbTotal)}</div>
          <div className="sub">{data.finance.firstBatch.length} line items</div>
        </button>
      </div>

      <div className="tab-bar">
        {TABS.map((t) => (
          <button key={t.key} className={`tab-item${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* R&D COSTS */}
      {tab === 'rnd' && (
      <div className="section-block">
        <div className="section-head">
          <h3>R&amp;D Costs</h3>
          <span className="tag">RM {fmt(rndTotal)} total</span>
        </div>
        <div className="section-body table-wrap">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th style={{ textAlign: 'right' }}>Cost (RM)</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {data.finance.rnd.length ? (
                data.finance.rnd.map((item) => (
                  <tr key={item.id}>
                    <td style={{ color: 'var(--ink)', fontWeight: 500 }}>{item.name}</td>
                    <td className="num" style={{ textAlign: 'right' }}>
                      {fmt(item.cost)}
                    </td>
                    <td>
                      <button className="btn-icon-delete" onClick={() => deleteRnd(item.id)} aria-label="Remove item">
                        <IconTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="empty-cell">
                    No R&amp;D costs logged yet.
                  </td>
                </tr>
              )}
              <tr className="table-add-row">
                <td>
                  <input
                    placeholder="Item name"
                    value={rndDraft.name}
                    onChange={(e) => setRndDraft((d) => ({ ...d, name: e.target.value }))}
                    onKeyDown={onEnter(addRnd)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={rndDraft.cost}
                    onChange={(e) => setRndDraft((d) => ({ ...d, cost: e.target.value }))}
                    onKeyDown={onEnter(addRnd)}
                    style={{ textAlign: 'right' }}
                  />
                </td>
                <td>
                  <button className="btn-add-icon" onClick={addRnd} aria-label="Add R&D cost">
                    <IconPlus />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* FIRST BATCH COSTS */}
      {tab === 'firstBatch' && (
      <div className="section-block">
        <div className="section-head">
          <h3>First Batch Costs</h3>
          <span className="tag">RM {fmt(fbTotal)} total</span>
        </div>
        <div className="section-body table-wrap">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th style={{ textAlign: 'right' }}>Cost (RM)</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {data.finance.firstBatch.length ? (
                data.finance.firstBatch.map((item) => (
                  <tr key={item.id}>
                    <td style={{ color: 'var(--ink)', fontWeight: 500 }}>{item.name}</td>
                    <td className="num" style={{ textAlign: 'right' }}>
                      {fmt(item.cost)}
                    </td>
                    <td>
                      <button className="btn-icon-delete" onClick={() => deleteFirstBatch(item.id)} aria-label="Remove item">
                        <IconTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="empty-cell">
                    No first batch costs logged yet.
                  </td>
                </tr>
              )}
              <tr className="table-add-row">
                <td>
                  <input
                    placeholder="Item name"
                    value={fbDraft.name}
                    onChange={(e) => setFbDraft((d) => ({ ...d, name: e.target.value }))}
                    onKeyDown={onEnter(addFirstBatch)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={fbDraft.cost}
                    onChange={(e) => setFbDraft((d) => ({ ...d, cost: e.target.value }))}
                    onKeyDown={onEnter(addFirstBatch)}
                    style={{ textAlign: 'right' }}
                  />
                </td>
                <td>
                  <button className="btn-add-icon" onClick={addFirstBatch} aria-label="Add first batch cost">
                    <IconPlus />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* SALE TRACKER */}
      {tab === 'sale' && (
      <>
      <SalesCalendar
        sales={allSales}
        onMonthChange={(year, month) => setCalendarMonth({ year, month })}
      />
      <div className="section-block">
        <div className="section-head">
          <h3>Sale Tracker</h3>
          <span className="tag">
            RM {fmt(salesByDateDescTotal)} · {calendarMonthLabel}
          </span>
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
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {salesByDateDesc.length ? (
                salesByDateDesc.map((s) => (
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
                    <td>
                      {s.source === 'direct' && (
                        <button className="btn-icon-delete" onClick={() => deleteSale(s.id)} aria-label="Remove sale">
                          <IconTrash />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="empty-cell">
                    No sales logged in {calendarMonthLabel}.
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
                    value={saleDraft.scentId}
                    onChange={(e) => setSaleDraft((d) => ({ ...d, scentId: e.target.value }))}
                  >
                    <option value="">Select a scent</option>
                    <optgroup label="Men">
                      {menScents.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.inline}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Women">
                      {womenScents.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.inline}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </td>
                <td style={{ color: 'var(--ink-4)' }}>—</td>
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
                  <button className="btn-add-icon" onClick={addSale} aria-label="Add sale">
                    <IconPlus />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* BANK LEDGER */}
      {tab === 'bank' && (
      <div className="section-block">
        <div className="section-head">
          <h3>Bank Ledger</h3>
          <span className="tag">RM {fmt(bankBalance)} balance</span>
        </div>
        <div className="section-body table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>In (RM)</th>
                <th style={{ textAlign: 'right' }}>Out (RM)</th>
                <th style={{ textAlign: 'right' }}>Balance (RM)</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {data.finance.bank.length ? (
                data.finance.bank.map((b) => (
                  <tr key={b.id}>
                    <td>{fmtDate(b.date)}</td>
                    <td className="num" style={{ textAlign: 'right' }}>
                      {b.in ? fmt(b.in) : '—'}
                    </td>
                    <td className="num" style={{ textAlign: 'right' }}>
                      {b.out ? fmt(b.out) : '—'}
                    </td>
                    <td className="num" style={{ textAlign: 'right', color: 'var(--ink)', fontWeight: 600 }}>
                      {fmt(b.balance)}
                    </td>
                    <td>
                      <button className="btn-icon-delete" onClick={() => deleteBank(b.id)} aria-label="Remove entry">
                        <IconTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="empty-cell">
                    No ledger entries yet.
                  </td>
                </tr>
              )}
              <tr className="table-add-row">
                <td>
                  <input
                    type="date"
                    value={bankDraft.date}
                    onChange={(e) => setBankDraft((d) => ({ ...d, date: e.target.value }))}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={bankDraft.in}
                    onChange={(e) => setBankDraft((d) => ({ ...d, in: e.target.value }))}
                    onKeyDown={onEnter(addBank)}
                    style={{ textAlign: 'right' }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={bankDraft.out}
                    onChange={(e) => setBankDraft((d) => ({ ...d, out: e.target.value }))}
                    onKeyDown={onEnter(addBank)}
                    style={{ textAlign: 'right' }}
                  />
                </td>
                <td className="num" style={{ textAlign: 'right', color: 'var(--ink-4)' }}>
                  {bankDraft.date ? `→ ${fmt(bankDraftPreviewBalance)}` : '—'}
                </td>
                <td>
                  <button className="btn-add-icon" onClick={addBank} aria-label="Add ledger entry">
                    <IconPlus />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      )}
    </>
  );
}
