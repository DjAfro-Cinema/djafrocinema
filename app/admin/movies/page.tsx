'use client';

import { useEffect, useState, useCallback } from 'react';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { movieService } from '@/services/movie.service';
import { PageShell, StatCard, ChartCard, ChartCanvas, DataTable, Skeleton, Badge } from '../components';
import type { Movie } from '@/types/movie.types';

const DB  = process.env.NEXT_PUBLIC_DATABASE_ID!;
const LIB = process.env.NEXT_PUBLIC_USER_LIBRARY_COLLECTION_ID!;

interface MovieStat {
  movie: Movie;
  watchers: number;
  completions: number;
  avgProgress: number;
  purchases: number;
  revenue: number;
  wishlisted: number;
}

export default function MoviesPage() {
  const [movieStats, setMovieStats] = useState<MovieStat[]>([]);
  const [allMovies, setAllMovies]   = useState<Movie[]>([]);
  const [genres, setGenres]         = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [view, setView] = useState<'stats' | 'catalog'>('stats');
  const [sortCatalog, setSortCatalog] = useState<'views' | 'rating' | 'recent'>('views');

  const load = useCallback(async () => {
    const [allMoviesData, genresData] = await Promise.all([
      movieService.getAllMovies(),
      movieService.getAllGenres(),
    ]);
    setAllMovies(allMoviesData);
    setGenres(genresData);

    const movieMap = new Map<string, Movie>(allMoviesData.map(m => [m.$id, m]));

    // Pull entire library to compute real watch stats
    const libRes = await databases.listDocuments(DB, LIB, [Query.limit(1000)]);

    const agg = new Map<string, { watchers: Set<string>; totalProgress: number; count: number; completions: number; purchases: number; revenue: number; wishlisted: number }>();
    for (const doc of libRes.documents) {
      const mid = doc.movieId as string;
      const uid = doc.userId as string;
      if (!mid || !uid) continue;
      if (!agg.has(mid)) agg.set(mid, { watchers: new Set(), totalProgress: 0, count: 0, completions: 0, purchases: 0, revenue: 0, wishlisted: 0 });
      const s = agg.get(mid)!;
      if ((doc.progress as number) > 0) { s.watchers.add(uid); s.totalProgress += doc.progress as number; s.count++; }
      if ((doc.progress as number) >= 1) s.completions++;
      if (doc.purchasedAt)   { s.purchases++; s.revenue += (doc.amountPaid as number) || 0; }
      if (doc.isWishlisted)  s.wishlisted++;
    }

    const stats: MovieStat[] = Array.from(agg.entries())
      .map(([movieId, s]) => {
        const movie = movieMap.get(movieId);
        if (!movie) return null;
        return {
          movie,
          watchers:    s.watchers.size,
          completions: s.completions,
          avgProgress: s.count > 0 ? Math.round((s.totalProgress / s.count) * 100) : 0,
          purchases:   s.purchases,
          revenue:     s.revenue,
          wishlisted:  s.wishlisted,
        };
      })
      .filter(Boolean) as MovieStat[];

    setMovieStats(stats.sort((a, b) => b.watchers - a.watchers));
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const handleRefresh = async () => { setRefreshing(true); movieService.invalidateCache(); await load(); setRefreshing(false); };

  const featured     = allMovies.filter(m => m.is_featured).length;
  const trending     = allMovies.filter(m => m.is_trending).length;
  const premium      = allMovies.filter(m => m.premium_only).length;
  const totalViews   = allMovies.reduce((s, m) => s + (m.view_count || 0), 0);
  const totalRevenue = movieStats.reduce((s, m) => s + m.revenue, 0);

  const top5 = movieStats.slice(0, 5);
  const genreCount = genres.map(g => ({
    genre: g,
    count: allMovies.filter(m => m.genre?.some(mg => mg.toLowerCase() === g.toLowerCase())).length,
  })).sort((a, b) => b.count - a.count).slice(0, 8);

  const filteredCatalog = (selectedGenre === 'all' ? allMovies : allMovies.filter(m => m.genre?.some(g => g.toLowerCase() === selectedGenre.toLowerCase())))
    .slice()
    .sort((a, b) => {
      if (sortCatalog === 'rating')  return (b.rating || 0) - (a.rating || 0);
      if (sortCatalog === 'recent')  return new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime();
      return (b.view_count || 0) - (a.view_count || 0);
    });

  const maxWatchers = top5[0]?.watchers || 1;

  return (
    <PageShell title="Movies" sub="Catalog analytics and engagement from user library" onRefresh={handleRefresh} refreshing={refreshing}>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))', gap:16, marginBottom:28 }}>
        {loading ? Array.from({length:6}).map((_,i)=><Skeleton key={i} h={100}/>) : (<>
          <StatCard label="Total Movies"   value={allMovies.length} />
          <StatCard label="Total Views"    value={totalViews.toLocaleString()} accent="#4285f4" />
          <StatCard label="Total Revenue"  value={`KES ${totalRevenue.toLocaleString()}`} accent="#22c55e" />
          <StatCard label="Featured"       value={featured} accent="#f59e0b" />
          <StatCard label="Trending"       value={trending} accent="#e50914" />
          <StatCard label="Premium Only"   value={premium}  accent="#a855f7" />
        </>)}
      </div>

      {/* Charts */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:28 }}>
        {!loading && (<>
          <ChartCard title="Top 5 Most Watched (Library)" height={260}>
            <ChartCanvas deps={[top5]} config={{
              type:'bar',
              data:{ labels: top5.map(m => m.movie.title.slice(0,20)),
                datasets:[{ label:'Watchers', data:top5.map(m=>m.watchers),
                  backgroundColor: top5.map((_,i)=>`hsla(${i===0?0:i===1?210:i===2?45:i===3?150:280},80%,55%,0.8)`),
                  borderWidth:0, borderRadius:6 }] },
              options:{ indexAxis:'y', responsive:true, maintainAspectRatio:false,
                plugins:{ legend:{display:false} },
                scales:{ x:{ticks:{color:'rgba(255,255,255,0.4)',font:{family:'DM Mono',size:10}},grid:{color:'rgba(255,255,255,0.05)'}},
                         y:{ticks:{color:'rgba(255,255,255,0.65)',font:{family:'DM Mono',size:10}},grid:{display:false}} } },
            }} />
          </ChartCard>

          <ChartCard title="Genre Distribution" height={260}>
            <ChartCanvas deps={[genreCount]} config={{
              type:'bar',
              data:{ labels: genreCount.map(g=>g.genre),
                datasets:[{ label:'Movies', data:genreCount.map(g=>g.count),
                  backgroundColor: genreCount.map((_,i)=>`hsl(${i*42%360},65%,55%)`),
                  borderWidth:0, borderRadius:5 }] },
              options:{ responsive:true, maintainAspectRatio:false,
                plugins:{legend:{display:false}},
                scales:{ x:{ticks:{color:'rgba(255,255,255,0.4)',font:{family:'DM Mono',size:9},maxRotation:35},grid:{display:false}},
                         y:{ticks:{color:'rgba(255,255,255,0.4)',font:{family:'DM Mono',size:10}},grid:{color:'rgba(255,255,255,0.05)'}} } },
            }} />
          </ChartCard>
        </>)}
      </div>

      {/* Main data panel */}
      {!loading && (
        <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:8, padding:'24px 28px' }}>

          {/* Tab bar */}
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center', marginBottom:20 }}>
            {(['stats','catalog'] as const).map(v=>(
              <button key={v} onClick={()=>setView(v)} style={{
                padding:'7px 18px', borderRadius:4, cursor:'pointer', fontFamily:"'DM Mono',monospace", fontSize:11, letterSpacing:'0.15em',
                background: view===v?'rgba(229,9,20,0.15)':'transparent',
                border:`1px solid ${view===v?'rgba(229,9,20,0.4)':'rgba(255,255,255,0.1)'}`,
                color: view===v?'#e50914':'rgba(255,255,255,0.4)',
              }}>{v==='stats'?'Watch Stats':'Movie Catalog'}</button>
            ))}

            {view==='catalog' && (<>
              <select value={selectedGenre} onChange={e=>setSelectedGenre(e.target.value)} style={{ marginLeft:8, padding:'6px 12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:4, color:'#fff', fontFamily:"'DM Mono',monospace", fontSize:11, cursor:'pointer' }}>
                <option value="all">All Genres</option>
                {genres.map(g=><option key={g} value={g}>{g}</option>)}
              </select>
              <select value={sortCatalog} onChange={e=>setSortCatalog(e.target.value as any)} style={{ padding:'6px 12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:4, color:'#fff', fontFamily:"'DM Mono',monospace", fontSize:11, cursor:'pointer' }}>
                <option value="views">Sort: Views</option>
                <option value="rating">Sort: Rating</option>
                <option value="recent">Sort: Newest</option>
              </select>
            </>)}

            <span style={{ marginLeft:'auto', fontSize:11, color:'rgba(255,255,255,0.3)' }}>
              {view==='stats'?`${movieStats.length} movies with activity`:`${filteredCatalog.length} movies`}
            </span>
          </div>

          {view==='stats' ? (
            /* Watch stats table — every row has real movie name + poster */
            <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
              {/* Header */}
              <div style={{ display:'grid', gridTemplateColumns:'28px 44px 1fr 80px 90px 80px 110px 80px', gap:12, padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.07)', marginBottom:4 }}>
                {['#','','Title','Watchers','Avg Progress','Finished','Revenue','Wishlisted'].map(h=>(
                  <div key={h} style={{ fontSize:9, letterSpacing:'0.25em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', fontWeight:500 }}>{h}</div>
                ))}
              </div>
              {movieStats.map((s, i) => (
                <div key={s.movie.$id} style={{ display:'grid', gridTemplateColumns:'28px 44px 1fr 80px 90px 80px 110px 80px', gap:12, padding:'12px 0', borderBottom:'1px solid rgba(255,255,255,0.04)', alignItems:'center' }}>
                  <span style={{ fontSize:12, color: i<3?'#f59e0b':'rgba(255,255,255,0.25)', fontWeight:700 }}>{String(i+1).padStart(2,'0')}</span>
                  {s.movie.poster_url
                    ? <img src={s.movie.poster_url} alt="" style={{ width:36, height:50, objectFit:'cover', borderRadius:3 }} />
                    : <div style={{ width:36, height:50, background:'rgba(255,255,255,0.06)', borderRadius:3, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🎬</div>
                  }
                  <div>
                    <div style={{ fontSize:13, color:'#fff', fontWeight:500, marginBottom:3 }}>{s.movie.title}</div>
                    <div style={{ display:'flex', gap:4 }}>
                      {s.movie.genre?.slice(0,2).map(g=><Badge key={g} label={g} color="#4285f4" />)}
                    </div>
                  </div>
                  <div style={{ fontSize:15, fontWeight:700, color:'#fff' }}>{s.watchers}</div>
                  <div>
                    <div style={{ height:3, background:'rgba(255,255,255,0.07)', borderRadius:2, overflow:'hidden', marginBottom:4 }}>
                      <div style={{ width:`${s.avgProgress}%`, height:'100%', background:'#4285f4', borderRadius:2 }} />
                    </div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>{s.avgProgress}%</div>
                  </div>
                  <div style={{ fontSize:13, color:'#22c55e', fontWeight:600 }}>{s.completions}</div>
                  <div style={{ fontSize:13, color:'#f59e0b', fontWeight:600 }}>KES {s.revenue.toLocaleString()}</div>
                  <div style={{ fontSize:13, color:'#e50914' }}>{s.wishlisted > 0 ? `♥ ${s.wishlisted}` : '—'}</div>
                </div>
              ))}
              {movieStats.length === 0 && <div style={{ padding:'40px 0', textAlign:'center', color:'rgba(255,255,255,0.2)', fontSize:13 }}>No watch data yet</div>}
            </div>
          ) : (
            /* Full catalog */
            <DataTable
              data={filteredCatalog as unknown as Record<string,unknown>[]}
              columns={[
                { key:'poster', label:'', render: r => r.poster_url
                  ? <img src={r.poster_url as string} alt="" style={{ width:34, height:48, objectFit:'cover', borderRadius:3 }} />
                  : <div style={{ width:34, height:48, background:'rgba(255,255,255,0.06)', borderRadius:3 }} />
                },
                { key:'title', label:'Title' },
                { key:'genre', label:'Genre', render: r => (
                  <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                    {(r.genre as string[]||[]).slice(0,2).map((g:string)=><Badge key={g} label={g} color="#4285f4" />)}
                  </div>
                )},
                { key:'release_year', label:'Year' },
                { key:'view_count', label:'Views', align:'right', render: r => <span style={{ color:'#4285f4', fontWeight:600 }}>{Number(r.view_count||0).toLocaleString()}</span> },
                { key:'rating', label:'Rating', align:'right', render: r => <span style={{ color:'#f59e0b' }}>★ {Number(r.rating||0).toFixed(1)}</span> },
                { key:'flags', label:'', render: r => (
                  <div style={{ display:'flex', gap:4 }}>
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