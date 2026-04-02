'use client';

import { useEffect, useState, useCallback } from 'react';
import { analyticsService } from '@/services/analytics.service';
import { movieService } from '@/services/movie.service';
import { paymentService } from '@/services/payment.service';
import { StatCard, PageShell, ChartCard, ChartCanvas, Skeleton, ProgressBar, Badge } from './components';

interface OverviewData {
  signups: Awaited<ReturnType<typeof analyticsService.getSignupStats>>;
  revenue: Awaited<ReturnType<typeof analyticsService.getRevenueStats>>;
  mostWatched: Awaited<ReturnType<typeof analyticsService.getMostWatchedMovies>>;
  movieCount: number;
}

const CHART_DEFAULTS = {
  color: { grid: 'rgba(255,255,255,0.06)', text: 'rgba(255,255,255,0.5)' },
};

export default function OverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [signups, revenue, mostWatched, movieCount] = await Promise.all([
        analyticsService.getSignupStats(),
        analyticsService.getRevenueStats(),
        analyticsService.getMostWatchedMovies(8),
        movieService.getMovieCount(),
      ]);
      setData({ signups, revenue, mostWatched, movieCount });
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <PageShell
      title="Overview"
      sub="Platform-wide performance at a glance"
      onRefresh={handleRefresh}
      refreshing={refreshing}
    >
      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {loading ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} h={110} />) : data && (<>
          <StatCard label="Total Users" value={data.signups.total.toLocaleString()} sub="All signups" />
          <StatCard label="PWA Users" value={data.signups.pwaUsers.toLocaleString()} sub="Web app" accent="#4285f4" />
          <StatCard label="Mobile Users" value={data.signups.mobileUsers.toLocaleString()} sub="Native app" accent="#25d366" />
          <StatCard label="Total Revenue" value={`KES ${data.revenue.totalRevenue.toLocaleString()}`} sub="All time" accent="#f59e0b" />
          <StatCard label="Transactions" value={data.revenue.totalTransactions.toLocaleString()} sub="Completed" accent="#22c55e" />
          <StatCard label="Movies" value={data.movieCount.toLocaleString()} sub="In library" accent="#a855f7" />
        </>)}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
        {loading ? (<><Skeleton h={340} /><Skeleton h={340} /></>) : data && (<>
          {/* Signup Methods doughnut */}
          <ChartCard title="Signup Methods">
            <ChartCanvas
              deps={[data.signups]}
              config={{
                type: 'doughnut',
                data: {
                  labels: ['Email', 'OTP', 'Google OAuth'],
                  datasets: [{
                    data: [data.signups.emailSignups, data.signups.otpSignups, data.signups.googleSignups],
                    backgroundColor: ['#e50914', '#f59e0b', '#4285f4'],
                    borderColor: '#0d0d18',
                    borderWidth: 3,
                    hoverOffset: 6,
                  }],
                },
                options: {
                  responsive: true, maintainAspectRatio: false,
                  cutout: '68%',
                  plugins: {
                    legend: { position: 'bottom', labels: { color: CHART_DEFAULTS.color.text, padding: 20, boxWidth: 10, font: { size: 11, family: 'DM Mono' } } },
                  },
                },
              }}
            />
          </ChartCard>

          {/* Platform bar */}
          <ChartCard title="Platform Distribution">
            <ChartCanvas
              deps={[data.signups]}
              config={{
                type: 'bar',
                data: {
                  labels: ['PWA', 'Mobile App'],
                  datasets: [{
                    label: 'Users',
                    data: [data.signups.pwaUsers, data.signups.mobileUsers],
                    backgroundColor: ['rgba(229,9,20,0.8)', 'rgba(37,211,102,0.8)'],
                    borderColor: ['#e50914', '#25d366'],
                    borderWidth: 1,
                    borderRadius: 4,
                  }],
                },
                options: {
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { ticks: { color: CHART_DEFAULTS.color.text, font: { family: 'DM Mono', size: 11 } }, grid: { color: CHART_DEFAULTS.color.grid } },
                    y: { ticks: { color: CHART_DEFAULTS.color.text, font: { family: 'DM Mono', size: 11 } }, grid: { color: CHART_DEFAULTS.color.grid } },
                  },
                },
              }}
            />
          </ChartCard>
        </>)}
      </div>

      {/* Most Watched */}
      {!loading && data && data.mostWatched.length > 0 && (
        <div style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 6,
          padding: '24px 28px',
          marginBottom: 32,
        }}>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>
            Top 8 Most Watched
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {data.mostWatched.map((m, i) => {
              const maxWatchers = data.mostWatched[0].totalWatchers;
              return (
                <div key={m.movieId} style={{ display: 'grid', gridTemplateColumns: '24px 1fr 80px 80px', gap: 16, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: i < 3 ? '#e50914' : 'rgba(255,255,255,0.25)', fontWeight: 700 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <div style={{ fontSize: 13, color: '#fff', marginBottom: 5 }}>{m.movieTitle}</div>
                    <ProgressBar value={m.totalWatchers} max={maxWatchers} color={i === 0 ? '#e50914' : i === 1 ? '#f59e0b' : '#4285f4'} />
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{m.totalWatchers}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>watchers</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, color: '#22c55e', fontWeight: 600 }}>KES {m.totalRevenue.toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>revenue</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Revenue summary */}
      {!loading && data && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 6,
            padding: '24px 28px',
          }}>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 14 }}>Best Day</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: "'Syne', sans-serif", color: '#f59e0b', marginBottom: 6 }}>
              KES {data.revenue.topDay.revenue.toLocaleString()}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{data.revenue.topDay.date}</div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 6,
            padding: '24px 28px',
          }}>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 14 }}>Avg Transaction</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: "'Syne', sans-serif", color: '#22c55e', marginBottom: 6 }}>
              KES {data.revenue.avgTransactionValue.toLocaleString()}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>per payment</div>
          </div>
        </div>
      )}
    </PageShell>
  );
}