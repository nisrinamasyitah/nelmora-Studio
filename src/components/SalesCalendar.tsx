import { useEffect, useMemo, useState } from 'react';
import { fmt, fmtDate, latestSaleMonth } from '../lib/format';
import type { SaleEntry } from '../types';

interface SalesCalendarProps<T extends SaleEntry> {
  sales: T[];
  onMonthChange?: (year: number, month: number) => void;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function dayKey(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function isReseller(s: SaleEntry): s is SaleEntry & { source: 'direct' | 'reseller'; resellerName?: string } {
  return 'source' in s;
}

export default function SalesCalendar<T extends SaleEntry>({ sales, onMonthChange }: SalesCalendarProps<T>) {
  const initialMonth = useMemo(() => {
    const { year, month } = latestSaleMonth(sales);
    return new Date(year, month, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [monthDate, setMonthDate] = useState(initialMonth);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  useEffect(() => {
    onMonthChange?.(year, month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  useEffect(() => {
    setSelectedDay(null);
  }, [year, month]);

  const byDay = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    for (const s of sales) {
      if (!s.date) continue;
      const d = new Date(s.date + 'T00:00:00');
      if (isNaN(d.getTime()) || d.getFullYear() !== year || d.getMonth() !== month) continue;
      const cur = map.get(s.date) || { total: 0, count: 0 };
      cur.total += Number(s.total) || 0;
      cur.count += 1;
      map.set(s.date, cur);
    }
    return map;
  }, [sales, year, month]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();
  const monthTotal = Array.from(byDay.values()).reduce((s, v) => s + v.total, 0);
  const maxDayTotal = Math.max(0, ...Array.from(byDay.values()).map((v) => v.total));

  function heatClass(total: number): string {
    if (total <= 0 || maxDayTotal <= 0) return '';
    const ratio = total / maxDayTotal;
    if (ratio > 0.66) return 'heat-3';
    if (ratio > 0.33) return 'heat-2';
    return 'heat-1';
  }

  function toggleDay(key: string) {
    setSelectedDay((cur) => (cur === key ? null : key));
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const chartData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const info = byDay.get(dayKey(year, month, day));
    return { day, total: info?.total || 0, count: info?.count || 0 };
  });
  const chartMax = Math.max(1, ...chartData.map((c) => c.total));
  const peakDay = chartData.reduce((best, c) => (c.total > best.total ? c : best), chartData[0]);

  function shiftMonth(delta: number) {
    setMonthDate(new Date(year, month + delta, 1));
  }

  const monthLabel = monthDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  const selectedDaySales = selectedDay ? sales.filter((s) => s.date === selectedDay) : [];

  return (
    <div className="section-block">
      <div className="section-head">
        <h3>Sales Calendar</h3>
        <div className="cal-nav">
          <button className="cal-nav-btn" onClick={() => shiftMonth(-1)} aria-label="Previous month" type="button">
            ‹
          </button>
          <span className="cal-month-label">{monthLabel}</span>
          <button className="cal-nav-btn" onClick={() => shiftMonth(1)} aria-label="Next month" type="button">
            ›
          </button>
        </div>
      </div>
      <div className="section-body">
        <div className="cal-graph-grid">
          <div className="cal-wrap">
            <div className="cal-weekdays">
              <span>S</span>
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
            </div>
            <div className="cal-grid">
              {cells.map((d, i) => {
                if (d === null) return <div key={`blank-${i}`} className="cal-cell empty" />;
                const key = dayKey(year, month, d);
                const info = byDay.get(key);
                return (
                  <button
                    key={key}
                    type="button"
                    className={`cal-cell${info ? ' ' + heatClass(info.total) : ''}${selectedDay === key ? ' selected' : ''}`}
                    onClick={() => info && toggleDay(key)}
                    disabled={!info}
                  >
                    <span className="cal-day-num">{d}</span>
                    {info && (
                      <span className="viz-tooltip">
                        <b>{fmtDate(key)}</b>
                        RM {fmt(info.total)} · {info.count} sale{info.count > 1 ? 's' : ''}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="chart-wrap">
            <div className="chart-head-row">
              <span>Daily Sales</span>
              <span className="chart-total">RM {fmt(monthTotal)} this month</span>
            </div>
            <div className="chart-bars">
              {chartData.map((c) => {
                const key = dayKey(year, month, c.day);
                return (
                  <div key={c.day} className="chart-bar-col">
                    <button
                      type="button"
                      className={`chart-bar${c.total > 0 ? ' has-value' : ''}${selectedDay === key ? ' selected' : ''}`}
                      style={{ height: `${chartMax ? Math.max((c.total / chartMax) * 100, c.total > 0 ? 3 : 0) : 0}%` }}
                      onClick={() => c.total > 0 && toggleDay(key)}
                      disabled={c.total <= 0}
                    >
                      {peakDay && c.day === peakDay.day && c.total > 0 && (
                        <span className="chart-bar-label">RM{fmt(c.total)}</span>
                      )}
                      {c.total > 0 && (
                        <span className="viz-tooltip">
                          <b>{fmtDate(key)}</b>
                          RM {fmt(c.total)} · {c.count} sale{c.count > 1 ? 's' : ''}
                        </span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="chart-axis">
              <span>1</span>
              <span>{daysInMonth}</span>
            </div>
          </div>
        </div>

        {selectedDay && (
          <div className="cal-day-detail">
            <div className="cal-day-detail-head">
              <h4>{fmtDate(selectedDay)}</h4>
              <button
                type="button"
                className="cal-day-detail-close"
                onClick={() => setSelectedDay(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Perfume</th>
                  <th>Via</th>
                  <th>Qty</th>
                  <th>Notes</th>
                  <th style={{ textAlign: 'right' }}>Total (RM)</th>
                </tr>
              </thead>
              <tbody>
                {selectedDaySales.map((s) => (
                  <tr key={s.id}>
                    <td style={{ color: 'var(--ink)', fontWeight: 500 }}>{s.perfume}</td>
                    <td>
                      {isReseller(s) ? (
                        s.source === 'reseller' ? (
                          <span className="source-tag">{s.resellerName}</span>
                        ) : (
                          <span className="source-tag source-tag-direct">Direct</span>
                        )
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="num">{s.qty}</td>
                    <td>{s.notes || '—'}</td>
                    <td className="num" style={{ textAlign: 'right' }}>
                      {fmt(s.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
