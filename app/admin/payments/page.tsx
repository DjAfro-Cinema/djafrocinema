'use client';

import { useEffect, useState, useCallback } from 'react';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { movieService } from '@/services/movie.service';
import { PageShell, StatCard, ChartCard, ChartCanvas, Skeleton, Badge } from '../components';
import type { Movie } from '@/types/movie.types';

const DB  = process.env.NEXT_PUBLIC_DATABASE_ID!;
const PAY = process.env.NEXT_PUBLIC_PAYMENTS_COLLECTION_ID!;
const LIB = process.env.NEXT_PUBLIC_USER_LIBRARY_COLLECTION_ID!;

interface PayDoc { $id:string; userId:string; movieId:string; movieIds?:string[]; amount:number; status:string; phoneNumber?:string; mpesaPhone?:string; mpesaReceiptId?:string; paymentType?:string; offerType?:string; $createdAt:string; paidAt?:string; [k:string]:unknown; }
interface MovieRevStat { movie:Movie; purchases:number; revenue:number; watchers:number; }

type Period = '7d'|'30d'|'90d'|'all';

function cutoff(p: Period): Date {
  const d = new Date();
  if (p==='7d')  { d.setDate(d.getDate()-7); return d; }
  if (p==='30d') { d.setDate(d.getDate()-30); return d; }
  if (p==='90d') { d.setDate(d.getDate()-90); return d; }
  return new Date(0);
}

function buildDailyData(pays: PayDoc[], period: Period) {
  const from = cutoff(period);
  const filtered = pays.filter(p => new Date(p.paidAt||p.$createdAt) >= from);
  const map = new Map<string,{revenue:number;count:number}>();
  for (const p of filtered) {
    const date = (p.paidAt||p.$createdAt).split('T')[0];
    const e = map.get(date)||{revenue:0,count:0};
    map.set(date, {revenue: e.revenue+(p.amount||0), count: e.count+1});
  }
  return Array.from(map.entries()).sort((a,b)=>a[0].localeCompare(b[0])).map(([date,v])=>({date,...v}));
}

export default function PaymentsPage() {
  const [payments, setPayments]       = useState<PayDoc[]>([]);
  const [movieStats, setMovieStats]   = useState<MovieRevStat[]>([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [period, setPeriod]           = useState<Period>('30d');
  const [statusFilter, setStatusFilter] = useState<'all'|'completed'|'pending'|'failed'>('all');

  const load = useCallback(async () => {
    const [payRes, libRes, allMovies] = await Promise.all([
      databases.listDocuments(DB, PAY, [Query.orderDesc('$createdAt'), Query.limit(500)]),
      databases.listDocuments(DB, LIB, [Query.limit(1000)]),
      movieService.getAllMovies(),
    ]);

    const pays = payRes.documents as unknown as PayDoc[];
    setPayments(pays);

    const movieMap = new Map<string, Movie>(allMovies.map(m => [m.$id, m]));

    // Aggregate per-movie revenue + watchers from library
    const agg = new Map<string,{purchases:number;revenue:number;watchers:Set<string>}>();
    for (const doc of libRes.documents) {
      const mid = doc.movieId as string;
      const uid = doc.userId as string;
      if (!mid||!uid) continue;
      if (!agg.has(mid)) agg.set(mid,{purchases:0,revenue:0,watchers:new Set()});
      const s = agg.get(mid)!;
      if ((doc.progress as number)>0) s.watchers.add(uid);
      if (doc.purchasedAt) { s.purchases++; s.revenue+=(doc.amountPaid as number)||0; }
    }

    const stats: MovieRevStat[] = Array.from(agg.entries())
      .map(([mid, s]) => {
        const movie = movieMap.get(mid);
        if (!movie) return null;
        return { movie, purchases:s.purchases, revenue:s.revenue, watchers:s.watchers.size };
      })
      .filter(Boolean) as MovieRevStat[];

    setMovieStats(stats.sort((a,b)=>b.revenue-a.revenue));
  }, []);

  useEffect(()=>{ load().finally(()=>setLoading(false)); },[load]);
  const handleRefresh = async ()=>{ setRefreshing(true); await load(); setRefreshing(false); };

  const completed  = payments.filter(p=>p.status==='completed');
  const pending    = payments.filter(p=>p.status==='pending');
  const failed     = payments.filter(p=>p.status==='failed'||p.status==='cancelled');
  const totalRev   = completed.reduce((s,p)=>s+(p.amount||0),0);
  const avgTxn     = completed.length>0?Math.round(totalRev/completed.length):0;

  // Period-filtered data
  const from       = cutoff(period);
  const inPeriod   = completed.filter(p=>new Date(p.paidAt||p.$createdAt)>=from);
  const periodRev  = inPeriod.reduce((s,p)=>s+(p.amount||0),0);

  const daily      = buildDailyData(completed, period);
  const labels     = daily.map(d=>d.date.slice(5));
  const revData    = daily.map(d=>d.revenue);
  const txnData    = daily.map(d=>d.count);

  const filteredPays = statusFilter==='all'?payments:payments.filter(p=>{
    if (statusFilter==='failed') return p.status==='failed'||p.status==='cancelled';
    return p.status===statusFilter;
  });

  const statusColor=(s:string)=>s==='completed'?'#22c55e':s==='pending'?'#f59e0b':'#ef4444';
  const maxRev = movieStats[0]?.revenue||1;

  return (
    <PageShell title="Payments" sub="Revenue, transactions and top earning movies" onRefresh={handleRefresh} refreshing={refreshing}>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(175px,1fr))', gap:16, marginBottom:28 }}>
        {loading?Array.from({length:6}).map((_,i)=><Skeleton key={i} h={100}/>):(<>
          <StatCard label="Total Revenue"    value={`KES ${totalRev.toLocaleString()}`}  accent="#22c55e" />
          <StatCard label={`Revenue (${period})`} value={`KES ${periodRev.toLocaleString()}`} accent="#4285f4" />
          <StatCard label="Completed"        value={completed.length}  accent="#22c55e" />
          <StatCard label="Pending"          value={pending.length}    accent="#f59e0b" />
          <StatCard label="Failed"           value={failed.length}     accent="#ef4444" />
          <StatCard label="Avg Transaction"  value={`KES ${avgTxn}`}   accent="#a855f7" />
        </>)}
      </div>

      {/* Period selector + Revenue chart */}
      {!loading && (
        <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:8, padding:'24px 28px', marginBottom:28 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:24 }}>
            <div style={{ fontSize:10, letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', marginRight:8 }}>Revenue Chart</div>
            {(['7d','30d','90d','all'] as Period[]).map(p=>(
              <button key={p} onClick={()=>setPeriod(p)} style={{
                padding:'5px 14px', borderRadius:3, cursor:'pointer', fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:'0.15em',
                background: period===p?'rgba(229,9,20,0.15)':'transparent',
                border:`1px solid ${period===p?'rgba(229,9,20,0.35)':'rgba(255,255,255,0.08)'}`,
                color: period===p?'#e50914':'rgba(255,255,255,0.35)',
              }}>{p==='all'?'All Time':p}</button>
            ))}
            <span style={{ marginLeft:'auto', fontSize:13, color:'#22c55e', fontWeight:700 }}>KES {periodRev.toLocaleString()}</span>
          </div>
          <div style={{ height:280 }}>
            <ChartCanvas deps={[daily, period]} config={{
              type:'bar' as const,
              data:{
                labels,
                datasets:[
                  { type:'bar', label:'Revenue (KES)', data:revData, backgroundColor:'rgba(229,9,20,0.55)', borderColor:'#e50914', borderWidth:1, borderRadius:4, yAxisID:'y' },
                  { type:'line', label:'Transactions',  data:txnData, borderColor:'#f59e0b', backgroundColor:'rgba(245,158,11,0.08)', borderWidth:2, pointRadius:3, pointBackgroundColor:'#f59e0b', tension:0.4, fill:true, yAxisID:'y2' },
                ] as any,
              },
              options:{
                responsive:true, maintainAspectRatio:false,
                interaction:{ mode:'index', intersect:false },
                plugins:{ legend:{ labels:{ color:'rgba(255,255,255,0.5)', font:{family:'DM Mono',size:11} } } },
                scales:{
                  x:{ ticks:{color:'rgba(255,255,255,0.35)',font:{family:'DM Mono',size:9},maxRotation:45}, grid:{color:'rgba(255,255,255,0.04)'} },
                  y:{ ticks:{color:'rgba(255,255,255,0.4)',font:{family:'DM Mono',size:10}}, grid:{color:'rgba(255,255,255,0.06)'}, position:'left' },
                  y2:{ ticks:{color:'rgba(245,158,11,0.6)',font:{family:'DM Mono',size:10}}, grid:{display:false}, position:'right' },
                },
              } as any,
            }} />
          </div>
        </div>
      )}

      {/* Top earning movies — with poster + real name */}
      {!loading && movieStats.length>0 && (
        <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:8, padding:'24px 28px', marginBottom:28 }}>
          <div style={{ fontSize:10, letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', marginBottom:20 }}>
            Top Earning Movies
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {movieStats.slice(0,10).map((s,i)=>(
              <div key={s.movie.$id} style={{ display:'grid', gridTemplateColumns:'28px 40px 1fr 90px 80px 120px', gap:14, alignItems:'center' }}>
                <span style={{ fontWeight:800, fontSize:12, color:i<3?'#f59e0b':'rgba(255,255,255,0.2)' }}>{String(i+1).padStart(2,'0')}</span>
                {s.movie.poster_url
                  ? <img src={s.movie.poster_url} alt="" style={{ width:36, height:50, objectFit:'cover', borderRadius:3, border:'1px solid rgba(255,255,255,0.08)' }} />
                  : <div style={{ width:36, height:50, background:'rgba(255,255,255,0.06)', borderRadius:3, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🎬</div>
                }
                <div>
                  <div style={{ fontSize:13, color:'#fff', fontWeight:500, marginBottom:6 }}>{s.movie.title}</div>
                  <div style={{ height:3, background:'rgba(255,255,255,0.07)', borderRadius:2, overflow:'hidden' }}>
                    <div style={{ width:`${Math.round((s.revenue/maxRev)*100)}%`, height:'100%', background:i===0?'linear-gradient(90deg,#22c55e,#4285f4)':i<3?'#22c55e':'rgba(34,197,94,0.5)', borderRadius:2 }} />
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:13, fontWeight:600 }}>{s.purchases}</div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>purchases</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:13, color:'#4285f4' }}>{s.watchers}</div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>watchers</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:15, fontWeight:700, color:'#22c55e' }}>KES {s.revenue.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction list */}
      {!loading && (
        <div style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:8, padding:'24px 28px' }}>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', marginBottom:20 }}>
            <div style={{ fontSize:10, letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', marginRight:4 }}>Transactions</div>
            {(['all','completed','pending','failed'] as const).map(s=>(
              <button key={s} onClick={()=>setStatusFilter(s)} style={{
                padding:'5px 14px', borderRadius:3, cursor:'pointer', fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:'0.1em',
                background:statusFilter===s?'rgba(229,9,20,0.1)':'transparent',
                border:`1px solid ${statusFilter===s?'rgba(229,9,20,0.25)':'rgba(255,255,255,0.07)'}`,
                color:statusFilter===s?'#e50914':'rgba(255,255,255,0.35)',
                textTransform:'capitalize',
              }}>{s}</button>
            ))}
            <span style={{ marginLeft:'auto', fontSize:11, color:'rgba(255,255,255,0.3)' }}>{filteredPays.length} records</span>
          </div>

          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:"'DM Mono',monospace" }}>
              <thead>
                <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                  {['ID','User','Amount','Status','Type','Phone','Receipt','Date'].map(h=>(
                    <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:9, fontWeight:500, letterSpacing:'0.25em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPays.slice(0,100).map(p=>(
                  <tr key={p.$id}
                    onMouseEnter={e=>(e.currentTarget.style.background='rgba(229,9,20,0.04)')}
                    onMouseLeave={e=>(e.currentTarget.style.background='transparent')}
                    style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}
                  >
                    <td style={{ padding:'12px 14px', fontSize:11, color:'rgba(255,255,255,0.3)' }}>{p.$id.slice(0,8)}…</td>
                    <td style={{ padding:'12px 14px', fontSize:11, color:'rgba(255,255,255,0.55)' }}>{p.userId.slice(0,10)}…</td>
                    <td style={{ padding:'12px 14px', fontSize:13, fontWeight:600, color:'#22c55e' }}>KES {(p.amount||0).toLocaleString()}</td>
                    <td style={{ padding:'12px 14px' }}><Badge label={p.status} color={statusColor(p.status)} /></td>
                    <td style={{ padding:'12px 14px' }}>{p.paymentType?<Badge label={p.paymentType} color="#4285f4" />:<span style={{ color:'rgba(255,255,255,0.2)' }}>—</span>}</td>
                    <td style={{ padding:'12px 14px', fontSize:11, color:'rgba(255,255,255,0.5)' }}>{p.mpesaPhone||p.phoneNumber||'—'}</td>
                    <td style={{ padding:'12px 14px', fontSize:11, color:'rgba(255,255,255,0.35)' }}>{p.mpesaReceiptId||'—'}</td>
                    <td style={{ padding:'12px 14px', fontSize:11, color:'rgba(255,255,255,0.35)' }}>{new Date(p.$createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {filteredPays.length===0&&(
                  <tr><td colSpan={8} style={{ padding:'40px', textAlign:'center', color:'rgba(255,255,255,0.2)', fontSize:13 }}>No transactions</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageShell>
  );
}