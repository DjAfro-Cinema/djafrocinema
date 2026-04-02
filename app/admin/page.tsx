'use client';

import { useEffect, useState, useCallback } from 'react';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { movieService } from '@/services/movie.service';
import { StatCard, PageShell, ChartCard, ChartCanvas, Skeleton } from './components';
import type { Movie } from '@/types/movie.types';

const DB  = process.env.NEXT_PUBLIC_DATABASE_ID!;
const LIB = process.env.NEXT_PUBLIC_USER_LIBRARY_COLLECTION_ID!;
const PAY = process.env.NEXT_PUBLIC_PAYMENTS_COLLECTION_ID!;
const ANA = process.env.NEXT_PUBLIC_ANALYTICS_COLLECTION_ID!;

interface WatchedMovie {
  movieId: string;
  title: string;
  poster: string | null;
  watchers: number;
  completions: number;
  purchases: number;
  revenue: number;
}

interface OverviewData {
  totalUsers: number;
  pwaUsers: number;
  mobileUsers: number;
  totalRevenue: number;
  totalTransactions: number;
  avgTransaction: number;
  topMovies: WatchedMovie[];
  movieCount: number;
  emailSignups: number;
  otpSignups: number;
  googleSignups: number;
}

export default function OverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    // 1. All movies → map for name + poster lookups
    const allMovies = await movieService.getAllMovies();
    const movieMap = new Map<string, Movie>(allMovies.map(m => [m.$id, m]));

    // 2. All analytics users
    const anaRes = await databases.listDocuments(DB, ANA, [Query.limit(1000)]);
    const ana = anaRes.documents;

    // 3. Full user_library
    const libRes = await databases.listDocuments(DB, LIB, [Query.limit(1000)]);

    // 4. Aggregate per movie
    const stats = new Map<string, { watchers: Set<string>; completions: number; purchases: number; revenue: number }>();
    for (const doc of libRes.documents) {
      const mid = doc.movieId as string;
      const uid = doc.userId as string;
      if (!mid || !uid) continue;
      if (!stats.has(mid)) stats.set(mid, { watchers: new Set(), completions: 0, purchases: 0, revenue: 0 });
      const s = stats.get(mid)!;
      if ((doc.progress as number) > 0) s.watchers.add(uid);
      if ((doc.progress as number) >= 1) s.completions++;
      if (doc.purchasedAt) { s.purchases++; s.revenue += (doc.amountPaid as number) || 0; }
    }

    // 5. Top movies with real names + posters
    const topMovies: WatchedMovie[] = Array.from(stats.entries())
      .map(([movieId, s]) => {
        const movie = movieMap.get(movieId);
        return { movieId, title: movie?.title || '(removed)', poster: movie?.poster_url || null, watchers: s.watchers.size, completions: s.completions, purchases: s.purchases, revenue: s.revenue };
      })
      .filter(m => m.watchers > 0)
      .sort((a, b) => b.watchers - a.watchers)
      .slice(0, 8);

    // 6. Payment totals
    const payRes = await databases.listDocuments(DB, PAY, [Query.equal('status', 'completed'), Query.limit(500)]);
    const pays = payRes.documents;
    const totalRevenue = pays.reduce((s, p) => s + ((p.amount as number) || 0), 0);

    setData({
      totalUsers: ana.length,
      pwaUsers:    ana.filter(u => u.platform === 'pwa').length,
      mobileUsers: ana.filter(u => u.platform === 'mobile-app').length,
      emailSignups:  ana.filter(u => u.signupMethod === 'email').length,
      otpSignups:    ana.filter(u => u.signupMethod === 'otp').length,
      googleSignups: ana.filter(u => u.signupMethod === 'google-oauth').length,
      totalRevenue,
      totalTransactions: pays.length,
      avgTransaction: pays.length > 0 ? Math.round(totalRevenue / pays.length) : 0,
      topMovies,
      movieCount: allMovies.length,
    });
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const handleRefresh = async () => { setRefreshing(true); movieService.invalidateCache(); await load(); setRefreshing(false); };

  const maxW = data?.topMovies[0]?.watchers || 1;

  return (
    <PageShell title="Overview" sub="Platform-wide performance — web + mobile" onRefresh={handleRefresh} refreshing={refreshing}>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 16, marginBottom: 28 }}>
        {loading ? Array.from({length:6}).map((_,i)=><Skeleton key={i} h={108}/>) : data && (<>
          <StatCard label="Total Users"   value={data.totalUsers.toLocaleString()} />
          <StatCard label="PWA / Web"     value={data.pwaUsers.toLocaleString()}   accent="#4285f4" />
          <StatCard label="Mobile App"    value={data.mobileUsers.toLocaleString()} accent="#25d366" />
          <StatCard label="Total Revenue" value={`KES ${data.totalRevenue.toLocaleString()}`} accent="#f59e0b" />
          <StatCard label="Transactions"  value={data.totalTransactions.toLocaleString()} accent="#22c55e" />
          <StatCard label="Movies"        value={data.movieCount.toLocaleString()} accent="#a855f7" />
        </>)}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        {loading ? <><Skeleton h={300}/><Skeleton h={300}/></> : data && (<>
          <ChartCard title="Signup Methods" height={280}>
            <ChartCanvas deps={[data.emailSignups, data.otpSignups, data.googleSignups]} config={{
              type: 'doughnut',
              data: { labels: ['Email','OTP','Google OAuth'], datasets: [{ data: [data.emailSignups,data.otpSignups,data.googleSignups], backgroundColor:['#e50914bb','#f59e0bbb','#4285f4bb'], borderColor:'#080810', borderWidth:4, hoverOffset:8 }] },
              options: { responsive:true, maintainAspectRatio:false, cutout:'70%', plugins: { legend:{ position:'bottom', labels:{ color:'rgba(255,255,255,0.55)', padding:20, boxWidth:10, font:{size:11,family:'DM Mono'} } } } },
            }} />
          </ChartCard>
          <ChartCard title="Platform Split" height={280}>
            <ChartCanvas deps={[data.pwaUsers, data.mobileUsers]} config={{
              type: 'bar',
              data: { labels:['PWA / Web','Mobile App'], datasets:[{ data:[data.pwaUsers,data.mobileUsers], backgroundColor:['rgba(66,133,244,0.75)','rgba(37,211,102,0.75)'], borderColor:['#4285f4','#25d366'], borderWidth:1, borderRadius:6 }] },
              options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{ x:{ticks:{color:'rgba(255,255,255,0.5)',font:{family:'DM Mono',size:12}},grid:{color:'rgba(255,255,255,0.05)'}}, y:{ticks:{color:'rgba(255,255,255,0.4)',font:{family:'DM Mono',size:11}},grid:{color:'rgba(255,255,255,0.05)'}} } },
            }} />
          </ChartCard>
        </>)}
      </div>

      {/* Top Watched with posters */}
      {!loading && data && data.topMovies.length > 0 && (
        <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:8, padding:'28px 32px', marginBottom:28 }}>
          <div style={{ fontSize:10, letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', marginBottom:24 }}>
            Most Watched · From User Library · All Platforms
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
            {data.topMovies.map((m, i) => {
              const rankColor = i===0?'#f59e0b':i===1?'#9ca3af':i===2?'#b45309':'rgba(255,255,255,0.2)';
              return (
                <div key={m.movieId} style={{ display:'grid', gridTemplateColumns:'28px 44px 1fr 80px 70px 110px', gap:16, alignItems:'center' }}>
                  <span style={{ fontWeight:800, fontSize:13, color:rankColor, fontFamily:"'Syne',sans-serif" }}>{String(i+1).padStart(2,'0')}</span>
                  {m.poster
                    ? <img src={m.poster} alt={m.title} style={{ width:40, height:56, objectFit:'cover', borderRadius:4, border:'1px solid rgba(255,255,255,0.1)' }} />
                    : <div style={{ width:40, height:56, background:'rgba(255,255,255,0.06)', borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🎬</div>
                  }
                  <div>
                    <div style={{ fontSize:14, color:'#fff', fontWeight:500, marginBottom:7 }}>{m.title}</div>
                    <div style={{ height:3, background:'rgba(255,255,255,0.07)', borderRadius:2, overflow:'hidden' }}>
                      <div style={{ width:`${Math.round((m.watchers/maxW)*100)}%`, height:'100%', borderRadius:2,
                        background: i===0?'linear-gradient(90deg,#e50914,#f59e0b)':i<3?'#4285f4':'rgba(255,255,255,0.2)' }} />
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:18, fontWeight:700, color:'#fff', fontFamily:"'Syne',sans-serif" }}>{m.watchers}</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>WATCHERS</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:14, fontWeight:600, color:'#22c55e' }}>{m.completions}</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>finished</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:14, fontWeight:600, color:'#f59e0b' }}>KES {m.revenue.toLocaleString()}</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>{m.purchases} sales</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Revenue footer */}
      {!loading && data && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>
          {[
            { label:'Total Revenue',   value:`KES ${data.totalRevenue.toLocaleString()}`, color:'#22c55e' },
            { label:'Transactions',    value:data.totalTransactions.toString(),            color:'#4285f4' },
            { label:'Avg Transaction', value:`KES ${data.avgTransaction.toLocaleString()}`, color:'#f59e0b' },
          ].map(c => (
            <div key={c.label} style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:8, padding:'24px 28px' }}>
              <div style={{ fontSize:10, letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', marginBottom:12 }}>{c.label}</div>
              <div style={{ fontSize:'1.9rem', fontWeight:800, color:c.color, fontFamily:"'Syne',sans-serif" }}>{c.value}</div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}