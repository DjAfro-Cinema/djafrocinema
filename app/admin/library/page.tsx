'use client';

import { useEffect, useState, useCallback } from 'react';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { movieService } from '@/services/movie.service';
import { PageShell, StatCard, ChartCard, ChartCanvas, DataTable, Skeleton, Badge } from '../components';

const DB  = process.env.NEXT_PUBLIC_DATABASE_ID!;
const LIB = process.env.NEXT_PUBLIC_USER_LIBRARY_COLLECTION_ID!;

interface LibEntry {
  $id: string;
  userId: string;
  movieId: string;
  type: string[];
  progress: number;
  rating?: number;
  isWishlisted: boolean;
  lastWatchedAt?: number;
  purchasedAt?: string;
  amountPaid?: number;
  downloadPath?: string;
  downloadQuality?: string;
  $createdAt: string;
  [key: string]: unknown;
}

export default function LibraryPage() {
  const [entries, setEntries] = useState<LibEntry[]>([]);
  const [movieTitles, setMovieTitles] = useState<Map<string, string>>(new Map());
  const [moviePosters, setMoviePosters] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<'all' | 'watching' | 'purchased' | 'wishlisted' | 'downloaded'>('all');

  const load = useCallback(async () => {
    const [libRes, allMovies] = await Promise.all([
      databases.listDocuments(DB, LIB, [Query.orderDesc('$createdAt'), Query.limit(500)]),
      movieService.getAllMovies(),
    ]);
    setEntries(libRes.documents as unknown as LibEntry[]);
    const titles = new Map<string, string>();
    const posters = new Map<string, string>();
    allMovies.forEach(m => {
      titles.set(m.$id, m.title);
      if (m.poster_url) posters.set(m.$id, m.poster_url);
    });
    setMovieTitles(titles);
    setMoviePosters(posters);
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    movieService.invalidateCache();
    await load();
    setRefreshing(false);
  };

  const watching   = entries.filter(e => e.progress > 0 && e.progress < 1);
  const completed  = entries.filter(e => e.progress >= 1);
  const purchased  = entries.filter(e => !!e.purchasedAt);
  const wishlisted = entries.filter(e => e.isWishlisted);
  const downloaded = entries.filter(e => !!e.downloadPath);

  const avgProgress = watching.length > 0
    ? Math.round(watching.reduce((s, e) => s + e.progress, 0) / watching.length * 100)
    : 0;

  // Ratings distribution
  const ratedEntries = entries.filter(e => e.rating != null && e.rating! > 0);
  const ratingBuckets = [1,2,3,4,5].map(r => ({
    r,
    count: ratedEntries.filter(e => Math.round(e.rating!) === r).length,
  }));

  // Progress buckets
  const progBuckets = [
    { label: '0–25%', count: entries.filter(e => e.progress > 0 && e.progress <= 0.25).length },
    { label: '25–50%', count: entries.filter(e => e.progress > 0.25 && e.progress <= 0.5).length },
    { label: '50–75%', count: entries.filter(e => e.progress > 0.5 && e.progress <= 0.75).length },
    { label: '75–99%', count: entries.filter(e => e.progress > 0.75 && e.progress < 1).length },
    { label: '100%', count: completed.length },
  ];

  const filtered = (() => {
    switch (tab) {
      case 'watching': return watching;
      case 'purchased': return purchased;
      case 'wishlisted': return wishlisted;
      case 'downloaded': return downloaded;
      default: return entries;
    }
  })();

  const progressColor = (p: number) => {
    if (p >= 1) return '#22c55e';
    if (p >= 0.5) return '#f59e0b';
    if (p > 0) return '#4285f4';
    return '#4b5563';
  };

  return (
    <PageShell
      title="Library"
      sub="User engagement, watch progress and content activity"
      onRefresh={handleRefresh}
      refreshing={refreshing}
    >
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
        {loading ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} h={100} />) : (<>
          <StatCard label="Total Entries" value={entries.length.toLocaleString()} />
          <StatCard label="Watching" value={watching.length} accent="#4285f4" />
          <StatCard label="Completed" value={completed.length} accent="#22c55e" />
          <StatCard label="Purchased" value={purchased.length} accent="#e50914" />
          <StatCard label="Wishlisted" value={wishlisted.length} accent="#f59e0b" />
          <StatCard label="Avg Progress" value={`${avgProgress}%`} sub="In-progress" accent="#a855f7" />
        </>)}
      </div>

      {/* Charts */}
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
          <ChartCard title="Progress Distribution" height={260}>
            <ChartCanvas
              deps={[progBuckets]}
              config={{
                type: 'bar',
                data: {
                  labels: progBuckets.map(b => b.label),
                  datasets: [{
                    label: 'Users',
                    data: progBuckets.map(b => b.count),
                    backgroundColor: ['rgba(66,133,244,0.7)', 'rgba(66,133,244,0.7)', 'rgba(245,158,11,0.7)', 'rgba(245,158,11,0.7)', 'rgba(34,197,94,0.7)'],
                    borderColor: ['#4285f4', '#4285f4', '#f59e0b', '#f59e0b', '#22c55e'],
                    borderWidth: 1,
                    borderRadius: 4,
                  }],
                },
                options: {
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { ticks: { color: 'rgba(255,255,255,0.45)', font: { family: 'DM Mono', size: 11 } }, grid: { display: false } },
                    y: { ticks: { color: 'rgba(255,255,255,0.4)', font: { family: 'DM Mono', size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
                  },
                },
              }}
            />
          </ChartCard>

          <ChartCard title="User Ratings Distribution" height={260}>
            <ChartCanvas
              deps={[ratingBuckets]}
              config={{
                type: 'bar',
                data: {
                  labels: ratingBuckets.map(b => `${b.r}★`),
                  datasets: [{
                    label: 'Ratings',
                    data: ratingBuckets.map(b => b.count),
                    backgroundColor: ratingBuckets.map(b => `hsl(${(b.r - 1) * 30 + 10}, 80%, 55%)`),
                    borderWidth: 0,
                    borderRadius: 5,
                  }],
                },
                options: {
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { ticks: { color: 'rgba(255,255,255,0.45)', font: { family: 'DM Mono', size: 13 } }, grid: { display: false } },
                    y: { ticks: { color: 'rgba(255,255,255,0.4)', font: { family: 'DM Mono', size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
                  },
                },
              }}
            />
          </ChartCard>
        </div>
      )}

      {/* Library table */}
      {!loading && (
        <div style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 6,
          padding: '24px 28px',
        }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
            {([
              { key: 'all', label: `All (${entries.length})` },
              { key: 'watching', label: `Watching (${watching.length})` },
              { key: 'purchased', label: `Purchased (${purchased.length})` },
              { key: 'wishlisted', label: `Wishlisted (${wishlisted.length})` },
              { key: 'downloaded', label: `Downloaded (${downloaded.length})` },
            ] as const).map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                padding: '6px 14px',
                background: tab === t.key ? 'rgba(229,9,20,0.12)' : 'transparent',
                border: `1px solid ${tab === t.key ? 'rgba(229,9,20,0.3)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 3,
                color: tab === t.key ? '#e50914' : 'rgba(255,255,255,0.35)',
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                letterSpacing: '0.1em',
                cursor: 'pointer',
              }}>{t.label}</button>
            ))}
          </div>

          <DataTable
            data={filtered.slice(0, 100) as unknown as Record<string, unknown>[]}
            columns={[
              { key: 'poster', label: '', render: r => {
                const poster = moviePosters.get(String(r.movieId));
                return poster
                  ? <img src={poster} alt="" style={{ width: 30, height: 42, objectFit: 'cover', borderRadius: 2, display: 'block' }} />
                  : <div style={{ width: 30, height: 42, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }} />;
              }},
              { key: 'movieTitle', label: 'Movie', render: r => (
                <span>{movieTitles.get(String(r.movieId)) || String(r.movieId).slice(0, 12) + '…'}</span>
              )},
              { key: 'userId', label: 'User', render: r => <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{String(r.userId).slice(0, 10)}…</span> },
              { key: 'progress', label: 'Progress', render: r => {
                const p = Number(r.progress || 0);
                const pct = Math.round(p * 100);
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 100 }}>
                    <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: progressColor(p), borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', minWidth: 30, textAlign: 'right' }}>{pct}%</span>
                  </div>
                );
              }},
              { key: 'rating', label: 'Rating', render: r => r.rating
                ? <span style={{ color: '#f59e0b' }}>{'★'.repeat(Math.round(Number(r.rating)))}</span>
                : <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>
              },
              { key: 'flags', label: '', render: r => (
                <div style={{ display: 'flex', gap: 4 }}>
                  {r.purchasedAt && <Badge label="Owned" color="#22c55e" />}
                  {r.isWishlisted && <Badge label="♥" color="#e50914" />}
                  {r.downloadPath && <Badge label="DL" color="#4285f4" />}
                </div>
              )},
              { key: 'amountPaid', label: 'Paid', align: 'right', render: r => r.amountPaid
                ? <span style={{ color: '#22c55e', fontWeight: 600 }}>KES {Number(r.amountPaid).toLocaleString()}</span>
                : <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>
              },
              { key: '$createdAt', label: 'Added', render: r => (
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                  {new Date(String(r.$createdAt)).toLocaleDateString()}
                </span>
              )},
            ] as any}
            emptyMsg="No entries in this view"
          />
        </div>
      )}
    </PageShell>
  );
}