'use client';

import { useEffect, useState, useCallback } from 'react';
import { analyticsService, AnalyticsRecord } from '@/services/analytics.service';
import { PageShell, StatCard, ChartCard, ChartCanvas, DataTable, Skeleton, Badge } from '../components';

interface UserRow extends AnalyticsRecord {
  [key: string]: unknown;
}

function daysAgo(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function groupByDate(records: AnalyticsRecord[]): { date: string; count: number }[] {
  const map = new Map<string, number>();
  for (const r of records) {
    const date = r.signupAt.split('T')[0];
    map.set(date, (map.get(date) || 0) + 1);
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-30)
    .map(([date, count]) => ({ date, count }));
}

export default function UsersPage() {
  const [users, setUsers] = useState<AnalyticsRecord[]>([]);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof analyticsService.getSignupStats>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'pwa' | 'mobile-app'>('all');
  const [methodFilter, setMethodFilter] = useState<'all' | 'email' | 'otp' | 'google-oauth'>('all');

  const load = useCallback(async () => {
    const [allUsers, statsData] = await Promise.all([
      analyticsService.getActiveUsers(),
      analyticsService.getSignupStats(),
    ]);
    setUsers(allUsers);
    setStats(statsData);
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const signupsByDay = groupByDate(users);
  const dates = signupsByDay.map(d => d.date.slice(5));
  const counts = signupsByDay.map(d => d.count);

  // Running cumulative
  const cumulative = counts.reduce<number[]>((acc, v) => {
    acc.push((acc[acc.length - 1] || 0) + v);
    return acc;
  }, []);

  const recentUsers = users.filter(u => daysAgo(u.signupAt) <= 7).length;
  const activeToday = users.filter(u => u.lastLoginAt && daysAgo(u.lastLoginAt) === 0).length;

  const filtered = users.filter(u => {
    const matchSearch = !search || u.email.toLowerCase().includes(search.toLowerCase()) || u.userId.includes(search);
    const matchPlatform = platformFilter === 'all' || u.platform === platformFilter;
    const matchMethod = methodFilter === 'all' || u.signupMethod === methodFilter;
    return matchSearch && matchPlatform && matchMethod;
  });

  const methodColor = (m: string) => m === 'email' ? '#e50914' : m === 'otp' ? '#f59e0b' : '#4285f4';
  const platformColor = (p: string) => p === 'pwa' ? '#a855f7' : '#25d366';

  return (
    <PageShell
      title="Users"
      sub="Signup trends, platform breakdown and user activity"
      onRefresh={handleRefresh}
      refreshing={refreshing}
    >
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 16, marginBottom: 32 }}>
        {loading ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} h={100} />) : stats && (<>
          <StatCard label="Total Users" value={stats.total.toLocaleString()} />
          <StatCard label="This Week" value={recentUsers} accent="#22c55e" />
          <StatCard label="Active Today" value={activeToday} accent="#f59e0b" />
          <StatCard label="Email Signups" value={stats.emailSignups} accent="#e50914" />
          <StatCard label="Google OAuth" value={stats.googleSignups} accent="#4285f4" />
          <StatCard label="OTP Signups" value={stats.otpSignups} accent="#f59e0b" />
        </>)}
      </div>

      {/* Growth chart */}
      {!loading && signupsByDay.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 32 }}>
          <ChartCard title="Signup Growth — Last 30 Days" height={280}>
            <ChartCanvas
              deps={[signupsByDay]}
              config={{
                type: 'bar',
                data: {
                  labels: dates,
                  datasets: [
                    {
                      type: 'bar',
                      label: 'New Signups',
                      data: counts,
                      backgroundColor: 'rgba(229,9,20,0.6)',
                      borderColor: '#e50914',
                      borderWidth: 1,
                      borderRadius: 3,
                      yAxisID: 'y',
                    },
                    {
                      type: 'line',
                      label: 'Total Users',
                      data: cumulative,
                      borderColor: '#4285f4',
                      backgroundColor: 'rgba(66,133,244,0.08)',
                      borderWidth: 2,
                      pointRadius: 0,
                      tension: 0.4,
                      fill: true,
                      yAxisID: 'y2',
                    },
                  ],
                },
                options: {
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { labels: { color: 'rgba(255,255,255,0.5)', font: { family: 'DM Mono', size: 10 } } } },
                  scales: {
                    x: { ticks: { color: 'rgba(255,255,255,0.3)', font: { family: 'DM Mono', size: 9 }, maxRotation: 45 }, grid: { color: 'rgba(255,255,255,0.04)' } },
                    y:  { ticks: { color: 'rgba(255,255,255,0.4)', font: { family: 'DM Mono', size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' }, position: 'left' },
                    y2: { ticks: { color: 'rgba(66,133,244,0.6)', font: { family: 'DM Mono', size: 10 } }, grid: { display: false }, position: 'right' },
                  },
                } as any,
              }}
            />
          </ChartCard>

          <ChartCard title="Signup Method Split" height={280}>
            <ChartCanvas
              deps={[stats]}
              config={{
                type: 'doughnut',
                data: {
                  labels: ['Email', 'OTP', 'Google'],
                  datasets: [{
                    data: [stats?.emailSignups || 0, stats?.otpSignups || 0, stats?.googleSignups || 0],
                    backgroundColor: ['rgba(229,9,20,0.8)', 'rgba(245,158,11,0.8)', 'rgba(66,133,244,0.8)'],
                    borderColor: '#0d0d18',
                    borderWidth: 3,
                    hoverOffset: 5,
                  }],
                },
                options: {
                  responsive: true, maintainAspectRatio: false,
                  cutout: '65%',
                  plugins: { legend: { position: 'bottom', labels: { color: 'rgba(255,255,255,0.5)', padding: 16, font: { size: 11, family: 'DM Mono' }, boxWidth: 10 } } },
                },
              }}
            />
          </ChartCard>
        </div>
      )}

      {/* User table */}
      {!loading && (
        <div style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 6,
          padding: '24px 28px',
        }}>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
            <input
              placeholder="Search email or user ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: '8px 14px', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4,
                color: '#fff', fontFamily: "'DM Mono', monospace", fontSize: 12,
                outline: 'none', width: 260,
              }}
            />

            {(['all', 'pwa', 'mobile-app'] as const).map(p => (
              <button key={p} onClick={() => setPlatformFilter(p)} style={{
                padding: '6px 14px',
                background: platformFilter === p ? 'rgba(168,85,247,0.12)' : 'transparent',
                border: `1px solid ${platformFilter === p ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 3, color: platformFilter === p ? '#a855f7' : 'rgba(255,255,255,0.35)',
                fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.1em',
                cursor: 'pointer', textTransform: 'capitalize',
              }}>{p}</button>
            ))}

            {(['all', 'email', 'otp', 'google-oauth'] as const).map(m => (
              <button key={m} onClick={() => setMethodFilter(m)} style={{
                padding: '6px 14px',
                background: methodFilter === m ? 'rgba(229,9,20,0.1)' : 'transparent',
                border: `1px solid ${methodFilter === m ? 'rgba(229,9,20,0.25)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 3, color: methodFilter === m ? '#e50914' : 'rgba(255,255,255,0.35)',
                fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.1em',
                cursor: 'pointer',
              }}>{m}</button>
            ))}

            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
              {filtered.length} users
            </span>
          </div>

          <DataTable
            data={filtered.slice(0, 100) as unknown as Record<string, unknown>[]}
            columns={[
              { key: 'userId', label: 'User ID', render: r => <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{String(r.userId).slice(0, 12)}…</span> },
              { key: 'email', label: 'Email' },
              { key: 'platform', label: 'Platform', render: r => <Badge label={String(r.platform)} color={platformColor(String(r.platform))} /> },
              { key: 'signupMethod', label: 'Method', render: r => <Badge label={String(r.signupMethod)} color={methodColor(String(r.signupMethod))} /> },
              { key: 'signupAt', label: 'Joined', render: r => {
                const ago = daysAgo(String(r.signupAt));
                return <span style={{ fontSize: 12, color: ago <= 7 ? '#22c55e' : 'rgba(255,255,255,0.45)' }}>
                  {ago === 0 ? 'Today' : ago === 1 ? 'Yesterday' : `${ago}d ago`}
                </span>;
              }},
              { key: 'lastLoginAt', label: 'Last Active', render: r => {
                if (!r.lastLoginAt) return <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>;
                const ago = daysAgo(String(r.lastLoginAt));
                return <span style={{ fontSize: 12, color: ago <= 1 ? '#22c55e' : ago <= 7 ? '#f59e0b' : 'rgba(255,255,255,0.35)' }}>
                  {ago === 0 ? 'Today' : `${ago}d ago`}
                </span>;
              }},
              { key: 'isActive', label: 'Status', render: r => <Badge label={r.isActive ? 'Active' : 'Inactive'} color={r.isActive ? '#22c55e' : '#6b7280'} /> },
            ] as any}
            emptyMsg="No users match filters"
          />
        </div>
      )}
    </PageShell>
  );
}