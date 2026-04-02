'use client';

import { useEffect, useState, useCallback } from 'react';
import { analyticsService } from '@/services/analytics.service';
import { movieService } from '@/services/movie.service';
import { PageShell, StatCard, ChartCard, ChartCanvas, DataTable, Skeleton, Badge, ProgressBar } from '../components';
import type { MostWatchedMovie } from '@/services/analytics.service';
import type { Movie } from '@/services/movie.service';

export default function MoviesPage() {
  const [watched, setWatched] = useState<MostWatchedMovie[]>([]);
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [view, setView] = useState<'watched' | 'catalog'>('watched');

  const load = useCallback(async () => {
    const [watchedData, moviesData, genresData] = await Promise.all([
      analyticsService.getMostWatchedMovies(50),
      movieService.getAllMovies(),
      movieService.getAllGenres(),
    ]);
    setWatched(watchedData);
    setAllMovies(moviesData);
    setGenres(genresData);
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    movieService.invalidateCache();
    await load();
    setRefreshing(false);
  };

  const filtered = selectedGenre === 'all'
    ? allMovies
    : allMovies.filter(m => m.genre?.some(g => g.toLowerCase() === selectedGenre.toLowerCase()));

  const featured = allMovies.filter(m => m.is_featured).length;
  const trending = allMovies.filter(m => m.is_trending).length;
  const premium  = allMovies.filter(m => m.premium_only).length;
  const totalViews = allMovies.reduce((s, m) => s + (m.view_count || 0), 0);

  const top5Labels = watched.slice(0, 5).map(m => m.movieTitle.substring(0, 18));
  const top5Watchers = watched.slice(0, 5).map(m => m.totalWatchers);
  const top5Revenue  = watched.slice(0, 5).map(m => m.totalRevenue);

  const genreCount = genres.map(g => ({
    genre: g,
    count: allMovies.filter(m => m.genre?.some(mg => mg.toLowerCase() === g.toLowerCase())).length,
  })).sort((a, b) => b.count - a.count).slice(0, 8);

  return (
    <PageShell
      title="Movies"
      sub="Performance analytics for your film catalog"
      onRefresh={handleRefresh}
      refreshing={refreshing}
    >
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 16, marginBottom: 32 }}>
        {loading ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} h={100} />) : (<>
          <StatCard label="Total Movies" value={allMovies.length} />
          <StatCard label="Total Views" value={totalViews.toLocaleString()} accent="#4285f4" />
          <StatCard label="Featured" value={featured} accent="#f59e0b" />
          <StatCard label="Trending" value={trending} accent="#22c55e" />
          <StatCard label="Premium Only" value={premium} accent="#a855f7" />
        </>)}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
        {!loading && (<>
          <ChartCard title="Top 5 — Most Watched" height={260}>
            <ChartCanvas
              deps={[watched]}
              config={{
                type: 'bar',
                data: {
                  labels: top5Labels,
                  datasets: [{
                    label: 'Watchers',
                    data: top5Watchers,
                    backgroundColor: 'rgba(229,9,20,0.75)',
                    borderColor: '#e50914',
                    borderWidth: 1,
                    borderRadius: 4,
                  }],
                },
                options: {
                  indexAxis: 'y',
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { ticks: { color: 'rgba(255,255,255,0.4)', font: { family: 'DM Mono', size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    y: { ticks: { color: 'rgba(255,255,255,0.6)', font: { family: 'DM Mono', size: 10 } }, grid: { display: false } },
                  },
                },
              }}
            />
          </ChartCard>

          <ChartCard title="Genre Distribution" height={260}>
            <ChartCanvas
              deps={[genreCount]}
              config={{
                type: 'bar',
                data: {
                  labels: genreCount.map(g => g.genre),
                  datasets: [{
                    label: 'Movies',
                    data: genreCount.map(g => g.count),
                    backgroundColor: genreCount.map((_, i) => `hsl(${(i * 42) % 360}, 70%, 55%)`),
                    borderWidth: 0,
                    borderRadius: 4,
                  }],
                },
                options: {
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { ticks: { color: 'rgba(255,255,255,0.4)', font: { family: 'DM Mono', size: 9 }, maxRotation: 35 }, grid: { display: false } },
                    y: { ticks: { color: 'rgba(255,255,255,0.4)', font: { family: 'DM Mono', size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
                  },
                },
              }}
            />
          </ChartCard>
        </>)}
      </div>

      {/* Top watched with revenue bar */}
      {!loading && watched.length > 0 && (
        <div style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 6,
          padding: '24px 28px',
          marginBottom: 32,
        }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            {(['watched', 'catalog'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: '7px 18px',
                background: view === v ? 'rgba(229,9,20,0.15)' : 'transparent',
                border: `1px solid ${view === v ? 'rgba(229,9,20,0.4)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 4,
                color: view === v ? '#e50914' : 'rgba(255,255,255,0.4)',
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                letterSpacing: '0.15em',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}>{v === 'watched' ? 'Watch Stats' : 'Movie Catalog'}</button>
            ))}

            {view === 'catalog' && (
              <select value={selectedGenre} onChange={e => setSelectedGenre(e.target.value)} style={{
                marginLeft: 'auto', padding: '6px 12px',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 4, color: '#fff', fontFamily: "'DM Mono', monospace", fontSize: 11,
                cursor: 'pointer',
              }}>
                <option value="all">All Genres</option>
                {genres.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            )}
          </div>

          {view === 'watched' ? (
            <DataTable
              data={watched as unknown as Record<string, unknown>[]}
              columns={[
                { key: 'rank', label: '#', render: (_, i: number) => <span style={{ color: i < 3 ? '#e50914' : 'rgba(255,255,255,0.3)', fontWeight: 700 }}>{String(i + 1).padStart(2, '0')}</span> },
                { key: 'movieTitle', label: 'Title' },
                { key: 'totalWatchers', label: 'Watchers', align: 'right', render: r => <span style={{ color: '#4285f4', fontWeight: 600 }}>{String(r.totalWatchers)}</span> },
                { key: 'avgProgress', label: 'Avg Progress', render: r => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
                    <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${r.avgProgress}%`, height: '100%', background: '#f59e0b', borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', minWidth: 28 }}>{String(r.avgProgress)}%</span>
                  </div>
                )},
                { key: 'totalPurchases', label: 'Purchases', align: 'right', render: r => <span style={{ color: '#22c55e' }}>{String(r.totalPurchases)}</span> },
                { key: 'totalRevenue', label: 'Revenue', align: 'right', render: r => <span style={{ color: '#22c55e', fontWeight: 600 }}>KES {Number(r.totalRevenue).toLocaleString()}</span> },
              ] as any}
              emptyMsg="No watch data yet"
            />
          ) : (
            <DataTable
              data={filtered as unknown as Record<string, unknown>[]}
              columns={[
                { key: 'poster', label: '', render: r => (
                  r.poster_url
                    ? <img src={r.poster_url as string} alt="" style={{ width: 36, height: 50, objectFit: 'cover', borderRadius: 3, display: 'block' }} />
                    : <div style={{ width: 36, height: 50, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }} />
                )},
                { key: 'title', label: 'Title' },
                { key: 'genre', label: 'Genre', render: r => (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {(r.genre as string[] || []).slice(0, 2).map(g => <Badge key={g} label={g} color="#4285f4" />)}
                  </div>
                )},
                { key: 'release_year', label: 'Year' },
                { key: 'view_count', label: 'Views', align: 'right', render: r => <span style={{ color: '#4285f4' }}>{Number(r.view_count || 0).toLocaleString()}</span> },
                { key: 'rating', label: 'Rating', align: 'right', render: r => <span style={{ color: '#f59e0b' }}>★ {Number(r.rating || 0).toFixed(1)}</span> },
                { key: 'flags', label: 'Flags', render: r => (
                  <div style={{ display: 'flex', gap: 4 }}>
                    {r.is_featured && <Badge label="Featured" color="#f59e0b" />}
                    {r.is_trending && <Badge label="Trending" color="#22c55e" />}
                    {r.premium_only && <Badge label="Premium" color="#a855f7" />}
                  </div>
                )},
              ] as any}
              emptyMsg="No movies found"
            />
          )}
        </div>
      )}
    </PageShell>
  );
}