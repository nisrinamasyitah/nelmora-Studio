import { useState, type KeyboardEvent } from 'react';
import { useAppData } from '../lib/AppDataContext';
import type { Gender } from '../lib/scents';
import { IconPlus, IconTrash } from './Icons';

function onEnter(fn: () => void) {
  return (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') fn();
  };
}

export default function Scents() {
  const { data, loading, error, addScent, setScentStatus, deleteScent } = useAppData();
  const [gender, setGender] = useState<Gender>('men');
  const [draft, setDraft] = useState({ code: '', perfume: '', inline: '', status: 'ADA' as 'ADA' | 'SOON' });

  if (loading) return <div className="empty-cell">Loading…</div>;
  if (error) return <div className="auth-error">{error}</div>;

  const allScents = [...data.scents.men, ...data.scents.women];
  const adaCount = allScents.filter((s) => s.status === 'ADA').length;
  const soonCount = allScents.filter((s) => s.status === 'SOON').length;

  const listForTab = data.scents[gender];
  const genderLabel = gender === 'men' ? 'Men' : 'Women';

  async function addEntry() {
    if (!draft.perfume.trim() || !draft.inline.trim()) return;
    await addScent(gender, {
      code: draft.code.trim(),
      perfume: draft.perfume.trim(),
      inline: draft.inline.trim().toUpperCase(),
      status: draft.status,
    });
    setDraft({ code: '', perfume: '', inline: '', status: 'ADA' });
  }

  function toggleStatus(id: string, current: 'ADA' | 'SOON') {
    setScentStatus(id, current === 'ADA' ? 'SOON' : 'ADA');
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title">Scents Catalog</div>
          <div className="page-desc">The perfumes NelMora carries, and whether each is available or coming soon.</div>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="label">Total Scents</span>
          <div className="value">{allScents.length}</div>
          <div className="sub">across men &amp; women lines</div>
        </div>
        <div className="stat-card">
          <span className="label">Available (ADA)</span>
          <div className="value">{adaCount}</div>
          <div className="sub">sellable now</div>
        </div>
        <div className="stat-card">
          <span className="label">Coming Soon</span>
          <div className="value">{soonCount}</div>
          <div className="sub">not yet sellable</div>
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
          <h3>Scents — {genderLabel}</h3>
          <span className="tag">{listForTab.length} scents</span>
        </div>
        <div className="section-body table-wrap">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Perfume</th>
                <th>Scent</th>
                <th>Status</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {listForTab.length ? (
                listForTab.map((s) => (
                  <tr key={s.id}>
                    <td style={{ color: 'var(--ink)', fontWeight: 500 }}>{s.code || '—'}</td>
                    <td>{s.perfume}</td>
                    <td>{s.inline}</td>
                    <td>
                      <button
                        className={`status-pill ${s.status === 'ADA' ? 'status-pill-ada' : 'status-pill-soon'}`}
                        onClick={() => toggleStatus(s.id, s.status)}
                        title="Click to toggle status"
                      >
                        {s.status === 'ADA' ? 'ADA' : 'Soon'}
                      </button>
                    </td>
                    <td>
                      <button className="btn-icon-delete" onClick={() => deleteScent(s.id)} aria-label="Remove scent">
                        <IconTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="empty-cell">
                    No scents logged for {genderLabel.toLowerCase()} yet.
                  </td>
                </tr>
              )}
              <tr className="table-add-row">
                <td>
                  <input
                    placeholder="Code"
                    value={draft.code}
                    onChange={(e) => setDraft((d) => ({ ...d, code: e.target.value }))}
                    onKeyDown={onEnter(addEntry)}
                    style={{ width: 64 }}
                  />
                </td>
                <td>
                  <input
                    placeholder="Full perfume name"
                    value={draft.perfume}
                    onChange={(e) => setDraft((d) => ({ ...d, perfume: e.target.value }))}
                    onKeyDown={onEnter(addEntry)}
                  />
                </td>
                <td>
                  <input
                    placeholder="Scent codename"
                    value={draft.inline}
                    onChange={(e) => setDraft((d) => ({ ...d, inline: e.target.value }))}
                    onKeyDown={onEnter(addEntry)}
                  />
                </td>
                <td>
                  <select
                    value={draft.status}
                    onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as 'ADA' | 'SOON' }))}
                  >
                    <option value="ADA">ADA</option>
                    <option value="SOON">Soon</option>
                  </select>
                </td>
                <td>
                  <button className="btn-add-icon" onClick={addEntry} aria-label="Add scent">
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
