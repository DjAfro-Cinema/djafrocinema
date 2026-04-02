'use client';

import { useEffect, useState, useCallback } from 'react';
import { analyticsService } from '@/services/analytics.service';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { PageShell, StatCard, ChartCard, ChartCanvas, DataTable, Skeleton, Badge } from '../components';

const DB  = process.env.NEXT_PUBLIC_DATABASE_ID!;
const PAY = process.env.NEXT_PUBLIC_PAYMENTS_COLLECTION_ID!;

interface PaymentDoc {
  $id: string;
  userId: string;
  movieId: string;
  movieIds?: string[];
  amount: number;
  status: string;
  paymentMethod?: string;
  phoneNumber?: string;
  mpesaPhone?: string;
  currency?: string;
  paymentType?: string;
  offerType?: string;
  paymentProvider?: string;
  mpesaReceiptId?: string;
  $createdAt: string;
  paidAt?: string;
}

interface DailyRevenue { date: string; revenue: number; count: number; }

function groupByDate(payments: PaymentDoc[]): DailyRevenue[] {
  const map = new Map<string, { revenue: number; count: number }>();
  for (const p of payments) {
    const date = (p.paidAt || p.$createdAt).split('T')[0];
    const existing = map.get(date) || { revenue: 0, count: 0 };
    map.set(date, { revenue: existing.revenue + (p.amount || 0), count: existing.count + 1 });
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-30)
    .map(([date, v]) => ({ date, ...v }));
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentDoc[]>([]);
  const [mostPurchased, setMostPurchased] = useState<Awaited<ReturnType<typeof analyticsService.getMostPurchasedMovies>>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');

  const load = useCallback(async () => {
    const [allPayments, purchased] = await Promise.all([
      databases.listDocuments(DB, PAY, [Query.orderDesc('$createdAt'), Query.limit(300)]),
      analyticsService.getMostPurchasedMovies(10),
    ]);
    setPayments(allPayments.documents as unknown as PaymentDoc[]);
    setMostPurchased(purchased);
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const completed = payments.filter(p => p.status === 'completed');
  const pending   = payments.filter(p => p.status === 'pending');
  const failed    = payments.filter(p => p.status === 'failed' || p.status === 'cancelled');
  const totalRevenue = completed.reduce((s, p) => s + (p.amount || 0), 0);
  const avgTxn = completed.length > 0 ? Math.round(totalRevenue / completed.length) : 0;

  const daily = groupByDate(completed);
  const dates  = daily.map(d => d.date.slice(5));  // MM-DD
  const revs   = daily.map(d => d.revenue);
  const counts = daily.map(d => d.count);

  const filtered = statusFilter === 'all' ? payments : payments.filter(p => {
    if (statusFilter === 'failed') return p.status === 'failed' || p.status === 'cancelled';
    return p.status === statusFilter;
  });

  const statusColor = (s: string) => {
    if (s === 'completed') return '#22c55e';
    if (s === 'pending') return '#f59e0b';
    return '#ef4444';
  };

  return (
    <PageShell
      title="Payments"
      sub="Revenue tracking and transaction analytics"
      onRefresh={handleRefresh}
      refreshing={refreshing}
    >
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {loading ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} h={100} />) : (<>
          <StatCard label="Total Revenue" value={`KES ${totalRevenue.toLocaleString()}`} accent="#22c55e" />
          <StatCard label="Completed" value={completed.length} accent="#22c55e" />
          <StatCard label="Pending" value={pending.length} accent="#f59e0b" />
          <StatCard label="Failed" value={failed.length} accent="#ef4444" />
          <StatCard label="Avg Transaction" value={`KES ${avgTxn}`} accent="#4285f4" />
          <StatCard label="Total Processed" value={payments.length} />
        </>)}
      </div>

      {/* Revenue Chart */}
      {!loading && daily.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <ChartCard title="Daily Revenue — Last 30 Days" height={300}>
            <ChartCanvas
              deps={[daily]}
              config={{
                type: 'bar',
                data: {
                  labels: dates,
                  datasets: [
                    {
                      type: 'bar',
                      label: 'Revenue (KES)',
                      data: revs,
                      backgroundColor: 'rgba(229,9,20,0.5)',
                      borderColor: '#e50914',
                      borderWidth: 1,
                      borderRadius: 3,
                      yAxisID: 'y',
                    },
                    {
                      type: 'line',
                      label: 'Transactions',
                      data: counts,
                      borderColor: '#f59e0b',
                      backgroundColor: 'rgba(245,158,11,0.1)',
                      borderWidth: 2,
                      pointRadius: 3,
                      pointBackgroundColor: '#f59e0b',
                      tension: 0.4,
                      fill: true,
                      yAxisID: 'y2',
                    },
                  ],
                },
                options: {
                  responsive: true, maintainAspectRatio: false,
                  interaction: { mode: 'index', intersect: false },
                  plugins: {
                    legend: {
                      labels: { color: 'rgba(255,255,255,0.5)', font: { family: 'DM Mono', size: 11 } },
                    },
                  },
                  scales: {
                    x: { ticks: { color: 'rgba(255,255,255,0.3)', font: { family: 'DM Mono', size: 9 }, maxRotation: 45 }, grid: { color: 'rgba(255,255,255,0.04)' } },
                    y: { ticks: { color: 'rgba(255,255,255,0.4)', font: { family: 'DM Mono', size: 10 } }, grid: { color: 'rgba(255,255,255,0.06)' }, position: 'left' },
                    y2: { ticks: { color: 'rgba(245,158,11,0.6)', font: { family: 'DM Mono', size: 10 } }, grid: { display: false }, position: 'right' },
                  },
                } as any,
              }}
            />
          </ChartCard>
        </div>
      )}

      {/* Top Purchased */}
      {!loading && mostPurchased.length > 0 && (
        <div style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 6,
          padding: '24px 28px',
          marginBottom: 32,
        }}>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>
            Most Purchased Movies
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {mostPurchased.map((m, i) => {
              const maxRev = mostPurchased[0].totalRevenue || 1;
              const pct = Math.round((m.totalRevenue / maxRev) * 100);
              return (
                <div key={m.movieId} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 100px 120px', gap: 16, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: i < 3 ? '#22c55e' : 'rgba(255,255,255,0.25)', fontWeight: 700 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <div style={{ fontSize: 13, color: '#fff', marginBottom: 5 }}>{m.movieTitle}</div>
                    <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: i === 0 ? '#22c55e' : i === 1 ? '#4285f4' : '#f59e0b', borderRadius: 2 }} />
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{m.totalPurchases}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>purchases</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, color: '#22c55e', fontWeight: 600 }}>KES {m.totalRevenue.toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transaction list */}
      {!loading && (
        <div style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 6,
          padding: '24px 28px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginRight: 8 }}>
              Transactions
            </div>
            {(['all', 'completed', 'pending', 'failed'] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} style={{
                padding: '5px 14px',
                background: statusFilter === s ? 'rgba(229,9,20,0.12)' : 'transparent',
                border: `1px solid ${statusFilter === s ? 'rgba(229,9,20,0.3)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 3,
                color: statusFilter === s ? '#e50914' : 'rgba(255,255,255,0.35)',
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                letterSpacing: '0.1em',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}>{s}</button>
            ))}
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
              {filtered.length} records
            </span>
          </div>
          <DataTable
            data={filtered.slice(0, 100) as unknown as Record<string, unknown>[]}
            columns={[
              { key: '$id', label: 'ID', render: r => <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{String(r.$id).slice(0, 8)}…</span> },
              { key: 'userId', label: 'User', render: r => <span style={{ fontSize: 11 }}>{String(r.userId).slice(0, 10)}…</span> },
              { key: 'amount', label: 'Amount', align: 'right', render: r => <span style={{ color: '#22c55e', fontWeight: 600 }}>KES {Number(r.amount).toLocaleString()}</span> },
              { key: 'status', label: 'Status', render: r => <Badge label={String(r.status)} color={statusColor(String(r.status))} /> },
              { key: 'paymentType', label: 'Type', render: r => r.paymentType ? <Badge label={String(r.paymentType)} color="#4285f4" /> : <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span> },
              { key: 'mpesaPhone', label: 'Phone', render: r => <span style={{ fontSize: 11 }}>{String(r.mpesaPhone || r.phoneNumber || '—')}</span> },
              { key: '$createdAt', label: 'Date', render: r => <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{new Date(String(r.$createdAt)).toLocaleDateString()}</span> },
            ] as any}
            emptyMsg="No transactions found"
          />
        </div>
      )}
    </PageShell>
  );
}