'use client';

import { useEffect, useState, useCallback } from 'react';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { movieService } from '@/services/movie.service';
import { PageShell, StatCard, ChartCard, ChartCanvas, Skeleton, Badge } from '../components';
import type { Movie } from '@/types/movie.types';

const DB  = process.env.NEXT_PUBLIC_DATABASE_ID!;
const LIB = process.env.NEXT_PUBLIC_USER_LIBRARY_COLLECTION_ID!;

interface LibEntry { $id:string; userId:string; movieId:string; type:string[]; progress:number; rating?:number; isWishlisted:boolean; lastWatchedAt?:number; purchasedAt?:string; amountPaid?:number; downloadPath?:string; downloadQuality?:string; $createdAt:string; [k:string]:unknown; }

type Tab = 'all'|'watching'|'purchased'|'wishlisted'|'downloaded';

export default function LibraryPage() {
  const [entries, setEntries]         = useState<LibEntry[]>([]);
  const [movieMap, setMovieMap]       = useState<Map<string,Movie>>(new Map());
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [tab, setTab]                 = useState<Tab>('all');
  const [search, setSearch]           = useState('');

  const load = useCallback(async () => {
    const [libRes, allMovies] = await Promise.all([
      databases.listDocuments(DB, LIB, [Query.orderDesc('$createdAt'), Query.limit(1000)]),
      movieService.getAllMovies(),
    ]);
    setEntries(libRes.documents as unknown as LibEntry[]);
    setMovieMap(new Map(allMovies.map(m => [m.$id, m])));
  }, []);

  useEffect(()=>{ load().finally(()=>setLoading(false)); },[load]);
  const handleRefresh = async ()=>{ setRefreshing(true); movieService.invalidateCache(); await load(); setRefreshing(false); };

  const watching   = entries.filter(e=>e.progress>0&&e.progress<1);
  const completed  = entries.filter(e=>e.progress>=1);
  const purchased  = entries.filter(e=>!!e.purchasedAt);
  const wishlisted = entries.filter(e=>e.isWishlisted);
  const downloaded = entries.filter(e=>!!e.downloadPath);

  const avgProgress = watching.length>0
    ? Math.round(watching.reduce((s,e)=>s+e.progress,0)/watching.length*100) : 0;
  const totalRevenue = purchased.reduce((s,e)=>s+(e.amountPaid||0),0);

  // Progress buckets for chart
  const progBuckets = [
    { label:'1–25%',  count:entries.filter(e=>e.progress>0&&e.progress<=0.25).length },
    { label:'26–50%', count:entries.filter(e=>e.progress>0.25&&e.progress<=0.5).length },
    { label:'51–75%', count:entries.filter(e=>e.progress>0.5&&e.progress<=0.75).length },
    { label:'76–99%', count:entries.filter(e=>e.progress>0.75&&e.progress<1).length },
    { label:'100%',   count:completed.length },
  ];

  // Ratings
  const ratingBuckets = [1,2,3,4,5].map(r=>({ r, count:entries.filter(e=>e.rating&&Math.round(e.rating)===r).length }));

  const tabData: Record<Tab, LibEntry[]> = { all:entries, watching, purchased, wishlisted, downloaded };
  const tabCounts: Record<Tab,number>    = { all:entries.length, watching:watching.length, purchased:purchased.length, wishlisted:wishlisted.length, downloaded:downloaded.length };

  const filtered = tabData[tab].filter(e=>{
    if (!search) return true;
    const movie = movieMap.get(e.movieId);
    return movie?.title.toLowerCase().includes(search.toLowerCase()) || e.userId.toLowerCase().includes(search.toLowerCase());
  });

  const progressColor=(p:number)=>p>=1?'#22c55e':p>=0.5?'#f59e0b':p>0?'#4285f4':'rgba(255,255,255,0.15)';

  return (
    <PageShell title="Library" sub="Watch progress, purchases and engagement across all users" onRefresh={handleRefresh} refreshing={refreshing}>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:16, marginBottom:28 }}>
        {loading?Array.from({length:6}).map((_,i)=><Skeleton key={i} h={100}/>):(<>
          <StatCard label="Total Entries" value={entries.length.toLocaleString()} />
          <StatCard label="Watching"      value={watching.length}   accent="#4285f4" />
          <StatCard label="Completed"     value={completed.length}  accent="#22c55e" />
          <StatCard label="Purchased"     value={purchased.length}  accent="#e50914" />
          <StatCard label="Wishlisted"    value={wishlisted.length} accent="#f59e0b" />
          <StatCard label="Revenue"       value={`KES ${totalRevenue.toLocaleString()}`} accent="#22c55e" sub={`Avg progress ${avgProgress}%`} />
        </>)}
      </div>

      {/* Charts */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:28 }}>
        {!loading&&(<>
          <ChartCard title="Watch Progress Distribution" height={240}>
            <ChartCanvas deps={[progBuckets]} config={{
              type:'bar',
              data:{ labels:progBuckets.map(b=>b.label),
                datasets:[{ label:'Users', data:progBuckets.map(b=>b.count),
                  backgroundColor:['rgba(66,133,244,0.75)','rgba(66,133,244,0.75)','rgba(245,158,11,0.75)','rgba(245,158,11,0.75)','rgba(34,197,94,0.75)'],
                  borderColor:['#4285f4','#4285f4','#f59e0b','#f59e0b','#22c55e'],
                  borderWidth:1, borderRadius:5 }] },
              options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}},
                scales:{ x:{ticks:{color:'rgba(255,255,255,0.45)',font:{family:'DM Mono',size:11}},grid:{display:false}},
                         y:{ticks:{color:'rgba(255,255,255,0.4)',font:{family:'DM Mono',size:10}},grid:{color:'rgba(255,255,255,0.05)'}} } },
            }} />
          </ChartCard>

          <ChartCard title="User Ratings" height={240}>
            <ChartCanvas deps={[ratingBuckets]} config={{
              type:'bar',
              data:{ labels:ratingBuckets.map(b=>'★'.repeat(b.r)),
                datasets:[{ label:'Ratings', data:ratingBuckets.map(b=>b.count),
                  backgroundColor:ratingBuckets.map((_,i)=>`hsl(${i*25+10},80%,55%)`),
                  borderWidth:0, borderRadius:5 }] },
              options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}},
                scales:{ x:{ticks:{color:'rgba(255,255,255,0.45)',font:{family:'DM Mono',size:14}},grid:{display:false}},
                         y:{ticks:{color:'rgba(255,255,255,0.4)',font:{family:'DM Mono',size:10}},grid:{color:'rgba(255,255,255,0.05)'}} } },
            }} />
          </ChartCard>
        </>)}
      </div>

      {/* Library table */}
      {!loading&&(
        <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:8, padding:'24px 28px' }}>

          {/* Tabs + search */}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', marginBottom:20 }}>
            {(['all','watching','purchased','wishlisted','downloaded'] as Tab[]).map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{
                padding:'6px 14px', borderRadius:3, cursor:'pointer', fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:'0.1em',
                background:tab===t?'rgba(229,9,20,0.12)':'transparent',
                border:`1px solid ${tab===t?'rgba(229,9,20,0.3)':'rgba(255,255,255,0.08)'}`,
                color:tab===t?'#e50914':'rgba(255,255,255,0.35)', textTransform:'capitalize',
              }}>{t} ({tabCounts[t]})</button>
            ))}
            <input placeholder="Search movie or user…" value={search} onChange={e=>setSearch(e.target.value)} style={{
              marginLeft:'auto', padding:'7px 14px', background:'rgba(255,255,255,0.05)',
              border:'1px solid rgba(255,255,255,0.1)', borderRadius:4, color:'#fff',
              fontFamily:"'DM Mono',monospace", fontSize:12, outline:'none', width:220,
            }} />
          </div>

          {/* Table */}
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:"'DM Mono',monospace" }}>
              <thead>
                <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                  {['','Movie','User','Progress','Rating','Flags','Amount','Added'].map(h=>(
                    <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:9, fontWeight:500, letterSpacing:'0.25em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0,100).map(e=>{
                  const movie = movieMap.get(e.movieId);
                  const title = movie?.title || '(removed)';
                  const poster = movie?.poster_url;
                  const p = e.progress;
                  return (
                    <tr key={e.$id}
                      onMouseEnter={ev=>(ev.currentTarget.style.background='rgba(229,9,20,0.04)')}
                      onMouseLeave={ev=>(ev.currentTarget.style.background='transparent')}
                      style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}
                    >
                      <td style={{ padding:'10px 14px' }}>
                        {poster
                          ? <img src={poster} alt="" style={{ width:30, height:42, objectFit:'cover', borderRadius:3, display:'block' }} />
                          : <div style={{ width:30, height:42, background:'rgba(255,255,255,0.06)', borderRadius:3, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>🎬</div>
                        }
                      </td>
                      <td style={{ padding:'10px 14px', fontSize:13, color:'rgba(255,255,255,0.85)', fontWeight:500 }}>{title}</td>
                      <td style={{ padding:'10px 14px', fontSize:11, color:'rgba(255,255,255,0.4)' }}>{e.userId.slice(0,12)}…</td>
                      <td style={{ padding:'10px 14px', minWidth:110 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ flex:1, height:3, background:'rgba(255,255,255,0.07)', borderRadius:2, overflow:'hidden' }}>
                            <div style={{ width:`${Math.round(p*100)}%`, height:'100%', background:progressColor(p), borderRadius:2 }} />
                          </div>
                          <span style={{ fontSize:11, color:'rgba(255,255,255,0.4)', minWidth:28, textAlign:'right' }}>{Math.round(p*100)}%</span>
                        </div>
                      </td>
                      <td style={{ padding:'10px 14px' }}>
                        {e.rating ? <span style={{ color:'#f59e0b' }}>{'★'.repeat(Math.round(e.rating))}</span> : <span style={{ color:'rgba(255,255,255,0.15)' }}>—</span>}
                      </td>
                      <td style={{ padding:'10px 14px' }}>
                        <div style={{ display:'flex', gap:4 }}>
                          {e.purchasedAt && <Badge label="Owned" color="#22c55e" />}
                          {e.isWishlisted && <Badge label="♥" color="#e50914" />}
                          {e.downloadPath && <Badge label="DL" color="#4285f4" />}
                        </div>
                      </td>
                      <td style={{ padding:'10px 14px', fontSize:13, color:e.amountPaid?'#22c55e':'rgba(255,255,255,0.2)', fontWeight:e.amountPaid?600:400 }}>
                        {e.amountPaid ? `KES ${e.amountPaid.toLocaleString()}` : '—'}
                      </td>
                      <td style={{ padding:'10px 14px', fontSize:11, color:'rgba(255,255,255,0.35)' }}>
                        {new Date(e.$createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length===0&&(
                  <tr><td colSpan={8} style={{ padding:'40px', textAlign:'center', color:'rgba(255,255,255,0.2)', fontSize:13 }}>No entries in this view</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageShell>
  );
}