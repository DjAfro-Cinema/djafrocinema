"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Play, Clock, Crown, History, Star,
  RotateCcw, Download, Zap, CheckCircle2,
  TrendingUp, Film, Lock,
} from "lucide-react";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import DashboardSidebar from "@/components/dashboard/sidebar/DashboardSidebar";
import MobileBottomNav from "@/components/dashboard/mobile/MobileBottomNav";
import MobileTopBar from "@/components/dashboard/topbar/MobileTopBar";
import DesktopTopBar from "@/components/dashboard/topbar/DesktopTopBar";

// ── TYPES ──────────────────────────────────────────────────────────────────

interface Movie {
  $id: string;
  title: string;
  genre: string[];
  poster_url: string;
  duration: string;
  release_year: string;
  rating: number;
  premium_only: boolean;
  quality_options: string[];
  download_enabled: boolean;
  view_count: number;
  is_featured: boolean;
  is_trending: boolean;
}

interface WatchProgress {
  movieId: string;
  progressPercent: number;
  lastWatchedAt: string;
  movie: Movie;
}

interface Payment {
  $id: string;
  movieId: string;
  amount: number;
  status: string;
  paidAt: string;
  currency: string;
  movie: Movie;
}

// ── MOCK DATA ──────────────────────────────────────────────────────────────

const M: Movie[] = [
  { $id:"m1", title:"Baahubali: The Beginning", genre:["Epic","Action"],   poster_url:"/images/movie2.jpg",  duration:"2h 39m", release_year:"2015", rating:9.1, premium_only:true,  quality_options:["720p","1080p"],        download_enabled:true,  view_count:14200, is_featured:true,  is_trending:false },
  { $id:"m2", title:"John Wick: Chapter 4",     genre:["Action","Crime"],  poster_url:"/images/movie3.jpg",  duration:"2h 49m", release_year:"2023", rating:8.9, premium_only:true,  quality_options:["480p","720p","1080p"], download_enabled:true,  view_count:9800,  is_featured:false, is_trending:true  },
  { $id:"m3", title:"Rampage",                  genre:["Thriller"],        poster_url:"/images/movie4.jpg",  duration:"1h 47m", release_year:"2023", rating:8.1, premium_only:false, quality_options:["480p","720p"],         download_enabled:false, view_count:6100,  is_featured:false, is_trending:false },
  { $id:"m4", title:"Krish III",                genre:["Sci-Fi","Action"], poster_url:"/images/movie5.webp", duration:"2h 10m", release_year:"2013", rating:8.8, premium_only:true,  quality_options:["720p","1080p"],        download_enabled:true,  view_count:11500, is_featured:false, is_trending:false },
  { $id:"m5", title:"Ghost City",               genre:["Crime","Drama"],   poster_url:"/images/movie8.jpg",  duration:"1h 55m", release_year:"2023", rating:8.7, premium_only:true,  quality_options:["720p","1080p"],        download_enabled:true,  view_count:7300,  is_featured:false, is_trending:true  },
  { $id:"m6", title:"Thunderbolts*",            genre:["Marvel","Action"], poster_url:"/images/movie6.jpg",  duration:"2h 07m", release_year:"2024", rating:7.9, premium_only:true,  quality_options:["1080p"],              download_enabled:false, view_count:18900, is_featured:true,  is_trending:true  },
  { $id:"m7", title:"Anaconda Rising",          genre:["Adventure"],       poster_url:"/images/movie7.jpg",  duration:"1h 38m", release_year:"2024", rating:8.4, premium_only:false, quality_options:["480p","720p"],         download_enabled:true,  view_count:5200,  is_featured:false, is_trending:false },
  { $id:"m8", title:"Red 2",                    genre:["Crime","Action"],  poster_url:"/images/movie9.jpg",  duration:"1h 56m", release_year:"2023", rating:8.5, premium_only:false, quality_options:["720p"],               download_enabled:true,  view_count:4800,  is_featured:false, is_trending:false },
  { $id:"m9", title:"The Meg",                  genre:["Thriller"],        poster_url:"/images/movie12.jpg", duration:"1h 53m", release_year:"2024", rating:7.9, premium_only:false, quality_options:["480p","720p"],         download_enabled:false, view_count:6700,  is_featured:false, is_trending:false },
];

const CONTINUE: WatchProgress[] = [
  { movieId:"m1", progressPercent:65, lastWatchedAt:"2025-03-27T18:30:00Z", movie:M[0] },
  { movieId:"m2", progressPercent:30, lastWatchedAt:"2025-03-26T21:15:00Z", movie:M[1] },
  { movieId:"m4", progressPercent:88, lastWatchedAt:"2025-03-25T14:00:00Z", movie:M[3] },
  { movieId:"m5", progressPercent:12, lastWatchedAt:"2025-03-24T20:45:00Z", movie:M[4] },
  { movieId:"m6", progressPercent:55, lastWatchedAt:"2025-03-23T19:00:00Z", movie:M[5] },
];

const PAID: Payment[] = [
  { $id:"p1", movieId:"m1", amount:150, status:"completed", paidAt:"2025-03-10T12:00:00Z", currency:"KES", movie:M[0] },
  { $id:"p2", movieId:"m2", amount:150, status:"completed", paidAt:"2025-03-15T09:30:00Z", currency:"KES", movie:M[1] },
  { $id:"p3", movieId:"m4", amount:150, status:"completed", paidAt:"2025-03-01T16:45:00Z", currency:"KES", movie:M[3] },
  { $id:"p4", movieId:"m5", amount:150, status:"completed", paidAt:"2025-02-20T11:00:00Z", currency:"KES", movie:M[4] },
  { $id:"p5", movieId:"m6", amount:200, status:"completed", paidAt:"2025-03-22T08:15:00Z", currency:"KES", movie:M[5] },
];

const WATCHED: WatchProgress[] = [
  { movieId:"m7", progressPercent:100, lastWatchedAt:"2025-03-20T22:00:00Z", movie:M[6] },
  { movieId:"m8", progressPercent:100, lastWatchedAt:"2025-03-18T19:30:00Z", movie:M[7] },
  { movieId:"m3", progressPercent:100, lastWatchedAt:"2025-03-12T17:00:00Z", movie:M[2] },
  { movieId:"m9", progressPercent:100, lastWatchedAt:"2025-03-05T20:15:00Z", movie:M[8] },
];

const USER = { name:"Mwangi", email:"mwangi@djafro.co.ke" };

// ── HELPERS ────────────────────────────────────────────────────────────────

function ago(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 864e5);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 7)  return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-KE", { day:"numeric", month:"short" });
}

function remaining(duration: string, pct: number) {
  const m = duration.match(/(\d+)h\s*(\d+)m/);
  if (!m) return "";
  const total = parseInt(m[1]) * 60 + parseInt(m[2]);
  const left  = Math.round(total * (1 - pct / 100));
  if (left < 1)  return "Finishing up";
  if (left < 60) return `${left}m left`;
  return `${Math.floor(left/60)}h ${left%60}m left`;
}

// ── TABS ───────────────────────────────────────────────────────────────────

const TABS = [
  { id:"continue", label:"Continue Watching", shortLabel:"Watching", Icon:Clock,   count:CONTINUE.length },
  { id:"paid",     label:"My Collection",     shortLabel:"Collection", Icon:Crown,   count:PAID.length },
  { id:"history",  label:"Watch History",     shortLabel:"History",  Icon:History, count:WATCHED.length },
] as const;
type Tab = (typeof TABS)[number]["id"];

// ── MOVIE CARD ─────────────────────────────────────────────────────────────

function MovieCard({ item, progress, showProgress = false }: {
  item: Movie;
  progress?: WatchProgress;
  showProgress?: boolean;
}) {
  const [hov, setHov] = useState(false);
  const pct = progress?.progressPercent ?? 0;

  return (
    <div
      className="movie-card"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Poster area */}
      <div className="card-poster">
        <img
          src={item.poster_url}
          alt={item.title}
          className={`poster-img ${hov ? "poster-zoom" : ""}`}
          onError={e => {
            const el = e.target as HTMLImageElement;
            el.style.display = "none";
            const parent = el.parentElement;
            if (parent) {
              parent.style.background = "#1a1a22";
              const fallback = parent.querySelector(".poster-fallback") as HTMLElement | null;
              if (fallback) fallback.style.display = "flex";
            }
          }}
        />
        <div className="poster-fallback">
          <Film size={28} color="rgba(255,255,255,0.12)" />
        </div>

        {/* Gradient overlay */}
        <div className={`card-overlay ${hov ? "card-overlay--active" : ""}`} />

        {/* Play button */}
        <div className={`play-btn-wrap ${hov ? "play-btn-wrap--visible" : ""}`}>
          <button className="play-btn" aria-label={`Play ${item.title}`}>
            <Play size={18} fill="#fff" color="#fff" style={{ marginLeft: 2 }} />
          </button>
        </div>

        {/* Top-left badge */}
        {item.premium_only && (
          <div className="badge badge--premium">
            <Crown size={9} color="#f59e0b" fill="#f59e0b" />
            <span>Premium</span>
          </div>
        )}

        {/* Rating */}
        <div className="badge badge--rating">
          <Star size={9} color="#f59e0b" fill="#f59e0b" />
          <span>{item.rating.toFixed(1)}</span>
        </div>

        {/* Quality */}
        {item.quality_options.includes("1080p") && (
          <div className="badge badge--quality">HD</div>
        )}

        {/* Progress bar */}
        {showProgress && pct > 0 && (
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="card-info">
        <p className="card-title">{item.title}</p>
        <div className="card-meta">
          <span className="card-genre">{item.genre[0]}</span>
          <span className="card-dot">·</span>
          <span className="card-year">{item.release_year}</span>
          {item.download_enabled && (
            <Download size={9} color="rgba(255,255,255,0.2)" strokeWidth={2} style={{ marginLeft: "auto" }} />
          )}
        </div>
        {showProgress && progress && (
          <div className="card-progress-row">
            <div className="mini-track">
              <div className="mini-fill" style={{ width:`${pct}%` }} />
            </div>
            <span className="card-time">{remaining(item.duration, pct)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── COLLECTION CARD ────────────────────────────────────────────────────────

function CollectionCard({ payment }: { payment: Payment }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      className="movie-card"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div className="card-poster">
        <img
          src={payment.movie.poster_url}
          alt={payment.movie.title}
          className={`poster-img ${hov ? "poster-zoom" : ""}`}
          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <div className="poster-fallback"><Film size={28} color="rgba(255,255,255,0.12)" /></div>
        <div className={`card-overlay ${hov ? "card-overlay--active" : ""}`} />
        <div className={`play-btn-wrap ${hov ? "play-btn-wrap--visible" : ""}`}>
          <button className="play-btn" aria-label={`Play ${payment.movie.title}`}>
            <Play size={18} fill="#fff" color="#fff" style={{ marginLeft:2 }} />
          </button>
        </div>
        <div className="badge badge--owned">
          <CheckCircle2 size={9} color="#10b981" />
          <span>Owned</span>
        </div>
        <div className="badge badge--rating">
          <Star size={9} color="#f59e0b" fill="#f59e0b" />
          <span>{payment.movie.rating.toFixed(1)}</span>
        </div>
        {payment.movie.quality_options.includes("1080p") && (
          <div className="badge badge--quality">HD</div>
        )}
      </div>
      <div className="card-info">
        <p className="card-title">{payment.movie.title}</p>
        <div className="card-meta">
          <span className="card-genre">{payment.movie.genre[0]}</span>
          <span className="card-dot">·</span>
          <span className="card-year">{payment.movie.duration}</span>
          {payment.movie.download_enabled && (
            <Download size={9} color="rgba(255,255,255,0.2)" strokeWidth={2} style={{ marginLeft:"auto" }} />
          )}
        </div>
        <div className="card-price-row">
          <span className="card-price">KES {payment.amount}</span>
          <span className="card-paid-when">{ago(payment.paidAt)}</span>
        </div>
      </div>
    </div>
  );
}

// ── HISTORY ROW ───────────────────────────────────────────────────────────

function HistoryRow({ item, i }: { item: WatchProgress; i: number }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      className={`history-row ${hov ? "history-row--hov" : ""}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <span className="history-num">{String(i + 1).padStart(2, "0")}</span>

      <div className="history-thumb">
        <img
          src={item.movie.poster_url}
          alt={item.movie.title}
          style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <div className={`history-thumb-overlay ${hov ? "history-thumb-overlay--visible" : ""}`}>
          <RotateCcw size={13} color="#fff" />
        </div>
      </div>

      <div className="history-meta">
        <p className="history-title">{item.movie.title}</p>
        <p className="history-sub">{item.movie.genre[0]} · {item.movie.release_year} · {item.movie.duration}</p>
      </div>

      <div className="history-right">
        <div className="history-rating">
          <Star size={11} color="#f59e0b" fill="#f59e0b" />
          <span>{item.movie.rating.toFixed(1)}</span>
        </div>
        <span className="history-when">{ago(item.lastWatchedAt)}</span>
      </div>
    </div>
  );
}

// ── STATS ──────────────────────────────────────────────────────────────────

function Stats({ isMobile }: { isMobile: boolean }) {
  const avgPct = Math.round(CONTINUE.reduce((a, c) => a + c.progressPercent, 0) / CONTINUE.length);
  const stats = [
    { Icon: Crown,        val: PAID.length,     label: "Owned",       accent: "#f59e0b" },
    { Icon: Clock,        val: CONTINUE.length, label: "Watching",    accent: "#e50914" },
    { Icon: CheckCircle2, val: WATCHED.length,  label: "Completed",   accent: "#10b981" },
    { Icon: TrendingUp,   val: `${avgPct}%`,    label: "Avg. Progress", accent: "#818cf8" },
  ];
  return (
    <div className="stats-grid" style={{ gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)" }}>
      {stats.map(s => (
        <div key={s.label} className="stat-cell">
          <s.Icon size={14} color={s.accent} strokeWidth={1.8} />
          <span className="stat-val">{s.val}</span>
          <span className="stat-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── PAGE ───────────────────────────────────────────────────────────────────

export default function LibraryPage() {
  const layout = useDashboardLayout();
  const [tab, setTab]         = useState<Tab>("continue");
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const {
    isMobile, isSmall,
    sidebarCollapsed, setSidebarCollapsed,
    searchOpen, setSearchOpen,
    searchVal, setSearchVal,
    scrolled,
  } = layout;

  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const cols = isMobile ? 2 : isSmall ? 3 : 5;
  const gridCols = `repeat(${cols},1fr)`;

  return (
    <>
      <style>{CSS}</style>

      <div className="root-shell">
        {!isSmall && (
          <DashboardSidebar
            user={USER}
            collapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
          />
        )}

        <div id="dj-content-col" className="content-col">
          {isSmall ? (
            <MobileTopBar onSearchOpen={() => setSearchOpen(true)} notifCount={2} userName={USER.name} />
          ) : (
            <DesktopTopBar
              scrolled={scrolled}
              searchOpen={searchOpen} searchVal={searchVal}
              onSearchOpen={() => setSearchOpen(true)}
              onSearchClose={() => { setSearchOpen(false); setSearchVal(""); }}
              onSearchChange={setSearchVal}
              notifCount={2} userName={USER.name}
            />
          )}

          <div className="page-body" style={{ padding: isSmall ? "24px 16px 110px" : "36px 32px 80px" }}>

            {/* Header */}
            <div className="page-header">
              <h1 className="page-title">My Library</h1>
              <p className="page-sub">Your personal cinema collection</p>
            </div>

            {/* Stats */}
            {!loading && <Stats isMobile={isMobile} />}

            {/* Tabs */}
            <div className="tabs-bar">
              {TABS.map(t => {
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    className={`tab-btn ${active ? "tab-btn--active" : ""}`}
                    onClick={() => setTab(t.id)}
                  >
                    <t.Icon size={13} strokeWidth={active ? 2.2 : 1.6} />
                    <span className="tab-label">{isMobile ? t.shortLabel : t.label}</span>
                    <span className={`tab-count ${active ? "tab-count--active" : ""}`}>{t.count}</span>
                  </button>
                );
              })}
            </div>

            {/* Content */}
            {loading ? (
              <div className="skeleton-grid" style={{ gridTemplateColumns: gridCols }}>
                {Array.from({ length: cols * 2 }).map((_, i) => (
                  <div key={i} className="skeleton-card">
                    <div className="shimmer" />
                  </div>
                ))}
              </div>
            ) : (
              <div className={`tab-content ${mounted ? "tab-content--visible" : ""}`}>

                {/* ── CONTINUE WATCHING ── */}
                {tab === "continue" && (
                  CONTINUE.length === 0
                    ? <EmptyState tab="continue" />
                    : <div className="grid-section" style={{ gridTemplateColumns: gridCols }}>
                        {CONTINUE.map(item => (
                          <MovieCard
                            key={item.movieId}
                            item={item.movie}
                            progress={item}
                            showProgress
                          />
                        ))}
                      </div>
                )}

                {/* ── COLLECTION ── */}
                {tab === "paid" && (
                  PAID.length === 0
                    ? <EmptyState tab="paid" />
                    : <>
                        <div className="collection-banner">
                          <div className="collection-banner-left">
                            <Crown size={14} color="#f59e0b" />
                            <span>{PAID.length} movies in your collection</span>
                          </div>
                          <span className="collection-spent">
                            KES {PAID.reduce((a, p) => a + p.amount, 0).toLocaleString()} total
                          </span>
                        </div>
                        <div className="grid-section" style={{ gridTemplateColumns: gridCols }}>
                          {PAID.map(p => <CollectionCard key={p.$id} payment={p} />)}
                        </div>
                      </>
                )}

                {/* ── HISTORY ── */}
                {tab === "history" && (
                  WATCHED.length === 0
                    ? <EmptyState tab="history" />
                    : <div className="history-list">
                        {WATCHED.map((item, i) => (
                          <HistoryRow key={item.movieId} item={item} i={i} />
                        ))}
                      </div>
                )}
              </div>
            )}
          </div>
        </div>

        {isSmall && <MobileBottomNav />}
      </div>
    </>
  );
}

// ── EMPTY STATE ────────────────────────────────────────────────────────────

function EmptyState({ tab }: { tab: Tab }) {
  const map = {
    continue: { icon: <Clock size={32} color="rgba(255,255,255,0.12)" />, msg:"Nothing in progress",  sub:"Start watching a movie to see your progress here." },
    paid:     { icon: <Lock  size={32} color="rgba(255,255,255,0.12)" />, msg:"No movies owned yet",   sub:"Purchase a movie to build your collection."           },
    history:  { icon: <Film  size={32} color="rgba(255,255,255,0.12)" />, msg:"No watch history",      sub:"Movies you finish will appear here."                  },
  };
  const { icon, msg, sub } = map[tab];
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <p className="empty-title">{msg}</p>
      <p className="empty-sub">{sub}</p>
      <Link href="/dashboard/movies" className="empty-cta">Browse Movies</Link>
    </div>
  );
}

// ── CSS ────────────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; }
  html, body { background: #070709; color: #fff; margin: 0; padding: 0; overflow: hidden; }

  /* ── Layout ── */
  .root-shell {
    display: flex;
    height: 100svh;
    background: #070709;
    overflow: hidden;
  }
  .content-col {
    flex: 1;
    min-width: 0;
    height: 100svh;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
  }
  .content-col::-webkit-scrollbar { display: none; }
  .content-col { scrollbar-width: none; }
  .page-body { flex: 1; }

  /* ── Page header ── */
  .page-header { margin-bottom: 28px; }
  .page-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(1.6rem, 3.5vw, 2.4rem);
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #fff;
    margin: 0 0 4px;
    line-height: 1;
  }
  .page-sub {
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
    color: rgba(255,255,255,0.28);
    margin: 0;
    font-weight: 400;
  }

  /* ── Stats ── */
  .stats-grid {
    display: grid;
    gap: 1px;
    background: rgba(255,255,255,0.04);
    border-radius: 14px;
    overflow: hidden;
    margin-bottom: 28px;
    border: 1px solid rgba(255,255,255,0.05);
  }
  .stat-cell {
    background: #0e0e13;
    padding: 18px 16px 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    transition: background 0.15s;
  }
  .stat-cell:hover { background: #111117; }
  .stat-val {
    font-family: 'Syne', sans-serif;
    font-size: 2rem;
    font-weight: 700;
    color: #fff;
    line-height: 1;
    letter-spacing: -0.02em;
  }
  .stat-label {
    font-family: 'Outfit', sans-serif;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.22);
  }

  /* ── Tabs ── */
  .tabs-bar {
    display: flex;
    gap: 2px;
    margin-bottom: 24px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 12px;
    padding: 4px;
  }
  .tab-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 9px 6px;
    border-radius: 9px;
    border: none;
    cursor: pointer;
    background: transparent;
    font-family: 'Outfit', sans-serif;
    font-size: 11px;
    font-weight: 500;
    color: rgba(255,255,255,0.3);
    transition: background 0.18s, color 0.18s;
    white-space: nowrap;
    overflow: hidden;
    min-width: 0;
  }
  .tab-btn:hover { color: rgba(255,255,255,0.6); background: rgba(255,255,255,0.03); }
  .tab-btn--active {
    background: #e50914;
    color: #fff;
    font-weight: 600;
    box-shadow: 0 4px 18px rgba(229,9,20,0.28);
  }
  .tab-btn--active:hover { background: #e50914; color: #fff; }
  .tab-label { /* nothing special */ }
  .tab-count {
    font-size: 10px;
    font-weight: 600;
    background: rgba(255,255,255,0.07);
    border-radius: 99px;
    padding: 1px 7px;
    color: rgba(255,255,255,0.3);
    font-family: 'Outfit', sans-serif;
    flex-shrink: 0;
  }
  @media (max-width: 480px) {
    .tab-count { display: none; }
    .tab-btn { gap: 5px; font-size: 10.5px; }
  }
  .tab-count--active {
    background: rgba(255,255,255,0.2);
    color: #fff;
  }

  /* ── Tab content animation ── */
  .tab-content {
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.22s ease, transform 0.22s ease;
  }
  .tab-content--visible {
    opacity: 1;
    transform: none;
  }

  /* ── Movie card ── */
  .movie-card {
    position: relative;
    border-radius: 10px;
    overflow: hidden;
    background: #0e0e13;
    border: 1px solid rgba(255,255,255,0.05);
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  }
  .movie-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 50px rgba(0,0,0,0.7);
    border-color: rgba(255,255,255,0.1);
  }

  .card-poster {
    position: relative;
    aspect-ratio: 2/3;
    background: #1a1a22;
    overflow: hidden;
  }
  .poster-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.4s ease;
  }
  .poster-zoom { transform: scale(1.07); }

  .poster-fallback {
    display: none;
    position: absolute;
    inset: 0;
    align-items: center;
    justify-content: center;
  }

  .card-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.1);
    transition: background 0.2s;
  }
  .card-overlay--active { background: rgba(0,0,0,0.55); }

  /* Play button */
  .play-btn-wrap {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.18s;
  }
  .play-btn-wrap--visible { opacity: 1; }
  .play-btn {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: #e50914;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 28px rgba(229,9,20,0.6);
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .play-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 0 40px rgba(229,9,20,0.8);
  }
  .play-btn:active { transform: scale(0.96); }

  /* Badges */
  .badge {
    position: absolute;
    display: flex;
    align-items: center;
    gap: 4px;
    border-radius: 5px;
    padding: 3px 7px;
    font-family: 'Outfit', sans-serif;
    font-size: 8.5px;
    font-weight: 600;
    letter-spacing: 0.04em;
  }
  .badge span { line-height: 1; }

  .badge--premium {
    top: 8px;
    left: 8px;
    background: rgba(245,158,11,0.15);
    border: 1px solid rgba(245,158,11,0.3);
    color: #f59e0b;
  }
  .badge--owned {
    top: 8px;
    left: 8px;
    background: rgba(16,185,129,0.12);
    border: 1px solid rgba(16,185,129,0.25);
    color: #10b981;
  }
  .badge--rating {
    top: 8px;
    right: 8px;
    background: rgba(0,0,0,0.65);
    border: 1px solid rgba(255,255,255,0.06);
    color: #fff;
    backdrop-filter: blur(6px);
  }
  .badge--quality {
    bottom: 8px;
    right: 8px;
    background: rgba(0,0,0,0.7);
    border: 1px solid rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.6);
    font-size: 8px;
    letter-spacing: 0.08em;
  }

  /* Progress bar on poster */
  .progress-track {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: rgba(255,255,255,0.1);
  }
  .progress-fill {
    height: 100%;
    background: #e50914;
    transition: width 0.5s ease;
  }

  /* Card info */
  .card-info { padding: 11px 11px 12px; }
  .card-title {
    font-family: 'Outfit', sans-serif;
    font-size: 12.5px;
    font-weight: 600;
    color: rgba(255,255,255,0.88);
    margin: 0 0 5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .card-meta {
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: 'Outfit', sans-serif;
    font-size: 10px;
    color: rgba(255,255,255,0.22);
  }
  .card-genre { color: rgba(255,255,255,0.3); }
  .card-dot { color: rgba(255,255,255,0.12); }
  .card-year { color: rgba(255,255,255,0.2); }

  /* Progress row (continue watching) */
  .card-progress-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
  }
  .mini-track {
    flex: 1;
    height: 2px;
    background: rgba(255,255,255,0.07);
    border-radius: 2px;
    overflow: hidden;
  }
  .mini-fill {
    height: 100%;
    background: #e50914;
    border-radius: 2px;
  }
  .card-time {
    font-family: 'Outfit', sans-serif;
    font-size: 9.5px;
    color: rgba(229,9,20,0.7);
    font-weight: 500;
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* Collection extras */
  .card-price-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 7px;
  }
  .card-price {
    font-family: 'Outfit', sans-serif;
    font-size: 10px;
    font-weight: 600;
    color: rgba(255,255,255,0.35);
    letter-spacing: 0.02em;
  }
  .card-paid-when {
    font-family: 'Outfit', sans-serif;
    font-size: 9px;
    color: rgba(255,255,255,0.15);
  }

  /* Grid */
  .grid-section {
    display: grid;
    gap: 10px;
  }

  /* Collection banner */
  .collection-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 11px 14px;
    background: rgba(245,158,11,0.04);
    border: 1px solid rgba(245,158,11,0.1);
    border-radius: 10px;
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 8px;
  }
  .collection-banner-left {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'Outfit', sans-serif;
    font-size: 12px;
    font-weight: 500;
    color: rgba(255,255,255,0.55);
  }
  .collection-spent {
    font-family: 'Outfit', sans-serif;
    font-size: 11px;
    font-weight: 600;
    color: rgba(255,255,255,0.2);
    letter-spacing: 0.04em;
  }

  /* History list */
  .history-list {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .history-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 14px;
    border-radius: 10px;
    background: rgba(255,255,255,0.01);
    border: 1px solid rgba(255,255,255,0.03);
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
  }
  .history-row--hov {
    background: rgba(255,255,255,0.035);
    border-color: rgba(255,255,255,0.07);
  }

  .history-num {
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: rgba(255,255,255,0.1);
    width: 22px;
    text-align: right;
    flex-shrink: 0;
  }
  .history-thumb {
    width: 44px;
    height: 62px;
    border-radius: 7px;
    overflow: hidden;
    flex-shrink: 0;
    background: #1a1a22;
    position: relative;
  }
  .history-thumb-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.15s;
  }
  .history-thumb-overlay--visible { opacity: 1; }

  .history-meta {
    flex: 1;
    min-width: 0;
  }
  .history-title {
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: rgba(255,255,255,0.78);
    margin: 0 0 3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.15s;
  }
  .history-row--hov .history-title { color: #fff; }
  .history-sub {
    font-family: 'Outfit', sans-serif;
    font-size: 10.5px;
    color: rgba(255,255,255,0.22);
    margin: 0;
  }

  .history-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    flex-shrink: 0;
  }
  .history-rating {
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #fff;
  }
  .history-when {
    font-family: 'Outfit', sans-serif;
    font-size: 9px;
    color: rgba(255,255,255,0.18);
  }

  /* Skeleton */
  .skeleton-grid {
    display: grid;
    gap: 10px;
  }
  .skeleton-card {
    border-radius: 10px;
    background: #0e0e13;
    aspect-ratio: 2/3;
    overflow: hidden;
    position: relative;
  }

  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  .shimmer {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg,
      rgba(255,255,255,0) 0%,
      rgba(255,255,255,0.035) 50%,
      rgba(255,255,255,0) 100%
    );
    background-size: 600px 100%;
    animation: shimmer 1.5s ease-in-out infinite;
  }

  /* Empty state */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 72px 24px;
    text-align: center;
  }
  .empty-icon {
    width: 68px;
    height: 68px;
    border-radius: 16px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 18px;
  }
  .empty-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.15rem;
    font-weight: 700;
    color: rgba(255,255,255,0.7);
    margin: 0 0 8px;
    letter-spacing: -0.01em;
  }
  .empty-sub {
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
    color: rgba(255,255,255,0.25);
    margin: 0 0 24px;
    max-width: 260px;
    line-height: 1.6;
  }
  .empty-cta {
    padding: 10px 24px;
    background: #e50914;
    border-radius: 8px;
    font-family: 'Outfit', sans-serif;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #fff;
    text-decoration: none;
    transition: background 0.15s, transform 0.15s;
  }
  .empty-cta:hover {
    background: #ff1a27;
    transform: translateY(-1px);
  }
`;