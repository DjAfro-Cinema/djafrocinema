'use client';

import { useEffect, useRef } from 'react';
import type { ChartConfiguration } from 'chart.js';

// ─── Stat Card ───────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  trend?: number; // positive = up, negative = down
}

export function StatCard({ label, value, sub, accent = '#e50914', trend }: StatCardProps) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 6,
      padding: '24px 28px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${accent}40`; }}
    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${accent}80, transparent)`,
      }} />
      <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 14, fontWeight: 500 }}>
        {label}
      </div>
      <div style={{ fontSize: '2.1rem', fontWeight: 700, color: '#fff', lineHeight: 1, fontFamily: "'Syne', sans-serif", marginBottom: 8 }}>
        {value}
      </div>
      {(sub || trend !== undefined) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {trend !== undefined && (
            <span style={{ fontSize: 11, color: trend >= 0 ? '#22c55e' : '#ef4444', fontWeight: 500 }}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
          {sub && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{sub}</span>}
        </div>
      )}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

export function SectionHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
      <div>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: 4 }}>{title}</h2>
        {sub && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── Page Shell ───────────────────────────────────────────────────────────────

export function PageShell({ title, sub, onRefresh, refreshing, children }: {
  title: string; sub?: string; onRefresh?: () => void; refreshing?: boolean; children: React.ReactNode;
}) {
  return (
    <div style={{ padding: '36px 40px', maxWidth: 1400 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#e50914', marginBottom: 8, fontWeight: 500 }}>
            DjAfro Admin ·
          </div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '2.4rem', fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>{title}</h1>
          {sub && <p style={{ marginTop: 6, fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>{sub}</p>}
        </div>
        {onRefresh && (
          <button onClick={onRefresh} disabled={refreshing} style={{
            padding: '10px 20px',
            background: 'transparent',
            border: '1px solid rgba(229,9,20,0.3)',
            borderRadius: 4,
            color: refreshing ? 'rgba(229,9,20,0.4)' : '#e50914',
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            letterSpacing: '0.15em',
            cursor: refreshing ? 'wait' : 'pointer',
            transition: 'all 0.2s',
          }}>
            {refreshing ? '◌ Refreshing' : '↻ Refresh'}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Chart Card ───────────────────────────────────────────────────────────────

export function ChartCard({ title, height = 280, children }: { title: string; height?: number; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 6,
      padding: '24px 28px',
    }}>
      <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 20, fontWeight: 500 }}>
        {title}
      </div>
      <div style={{ position: 'relative', height }}>
        {children}
      </div>
    </div>
  );
}

// ─── Data Table ───────────────────────────────────────────────────────────────

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
}

export function DataTable<T extends { [k: string]: unknown }>({ columns, data, emptyMsg = 'No data' }: {
  columns: Column<T>[]; data: T[]; emptyMsg?: string;
}) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Mono', monospace" }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            {columns.map(c => (
              <th key={String(c.key)} style={{
                padding: '12px 16px',
                textAlign: c.align || 'left',
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.3)',
              }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} style={{ padding: '40px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>{emptyMsg}</td></tr>
          ) : data.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(229,9,20,0.04)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              {columns.map(c => (
                <td key={String(c.key)} style={{ padding: '14px 16px', fontSize: 13, color: 'rgba(255,255,255,0.75)', textAlign: c.align || 'left', verticalAlign: 'middle' }}>
                  {c.render ? c.render(row) : String(row[c.key as keyof T] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

export function Skeleton({ h = 60, mb = 0 }: { h?: number; mb?: number }) {
  return (
    <div style={{
      height: h, marginBottom: mb,
      background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
      backgroundSize: '200% 100%',
      borderRadius: 6,
      animation: 'shimmer 1.5s ease-in-out infinite',
    }}>
      <style>{`@keyframes shimmer { to { background-position: -200% 0; } }`}</style>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

export function Badge({ label, color = '#e50914' }: { label: string; color?: string }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 8px',
      background: `${color}18`,
      border: `1px solid ${color}40`,
      borderRadius: 3,
      fontSize: 10,
      fontWeight: 500,
      letterSpacing: '0.1em',
      color,
      textTransform: 'uppercase',
    }}>{label}</span>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

export function ProgressBar({ value, max, color = '#e50914' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.5s ease' }} />
      </div>
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', minWidth: 32, textAlign: 'right' }}>{Math.round(pct)}%</span>
    </div>
  );
}

// ─── Chart.js canvas wrapper ──────────────────────────────────────────────────

export function ChartCanvas({ config, deps }: { config: ChartConfiguration; deps: unknown[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<import('chart.js').Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    let mounted = true;

    import('chart.js/auto').then(({ default: Chart }) => {
      if (!mounted || !canvasRef.current) return;
      chartRef.current?.destroy();
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) chartRef.current = new Chart(ctx, config);
    });

    return () => {
      mounted = false;
      chartRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
}