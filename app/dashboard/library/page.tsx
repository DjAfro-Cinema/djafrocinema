"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Play, Clock, Crown, History, Star,
  RotateCcw, Download, CheckCircle2,
  Film, Lock, TrendingUp, AlertCircle,
  RefreshCw, Package,
} from "lucide-react";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useUserLibrary } from "@/hooks/useUserLibrary";
import { WatchProgress, PurchasedMovie } from "@/services/userLibrary.service";
import DashboardSidebar from "@/components/dashboard/sidebar/DashboardSidebar";
import MobileBottomNav from "@/components/dashboard/mobile/MobileBottomNav";
import MobileTopBar from "@/components/dashboard/topbar/MobileTopBar";
import DesktopTopBar from "@/components/dashboard/topbar/DesktopTopBar";

// ── HELPERS ────────────────────────────────────────────────────────────────

function ago(iso: string | null) {
  if (!iso) return "—";
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 864e5);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-KE", { day: "numeric", month: "short" });
}

function remaining(duration: string | null | undefined, pct: number) {
  if (!duration) return "";
  const m = duration.match(/(\d+)h\s*(\d+)m/);
  if (!m) return "";
  const total = parseInt(m[1]) * 60 + parseInt(m[2]);
  const left = Math.round(total * (1 - pct / 100));
  if (left < 1) return "Almost done";
  if (left < 60) return `${left}m left`;
  return `${Math.floor(left / 60)}h ${left % 60}m left`;
}

// ── TABS ───────────────────────────────────────────────────────────────────

const TABS = [
  { id: "continue", label: "Continue Watching", shortLabel: "Watching", Icon: Clock },
  { id: "paid",     label: "My Collection",     shortLabel: "Collection", Icon: Crown },
  { id: "history",  label: "Watch History",     shortLabel: "History",  Icon: History },
] as const;
type Tab = (typeof TABS)[number]["id"];

// ── MOVIE CARD (Continue Watching) ─────────────────────────────────────────

function ContinueCard({ item }: { item: WatchProgress }) {
  const [hov, setHov] = useState(false);
  const pct = item.progressPercent;
  const movie = item.movie;

  return (
    <div
      className="mc"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div className="mc-poster">
        <img
          src={movie.poster_url}
          alt={movie.title}
          className={`mc-img${hov ? " mc-img--zoom" : ""}`}
          onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
        />
        <div className="mc-fallback"><Film size={22} color="rgba(255,255,255,0.1)" /></div>
        <div className={`mc-veil${hov ? " mc-veil--on" : ""}`} />

        {/* Play */}
        <div className={`mc-play${hov ? " mc-play--on" : ""}`}>
          <button className="play-circle" aria-label={`Play ${movie.title}`}>
            <Play size={14} fill="#fff" color="#fff" style={{ marginLeft: 2 }} />
          </button>
        </div>

        {/* Badges */}
        {movie.premium_only && (
          <span className="badge badge-prem">
            <Crown size={7} color="#f59e0b" fill="#f59e0b" /> Premium
          </span>
        )}
        <span className="badge badge-rat">
          <Star size={7} color="#f59e0b" fill="#f59e0b" /> {movie.rating?.toFixed(1)}
        </span>

        {/* Single progress bar at bottom of poster */}
        <div className="poster-prog">
          <div className="poster-prog-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="mc-info">
        <p className="mc-title">{movie.title}</p>
        <div className="mc-meta">
          <span>{movie.genre?.[0]}</span>
          <span className="dot">·</span>
          <span>{movie.release_year}</span>
          {movie.download_enabled && (
            <Download size={8} color="rgba(255,255,255,0.18)" style={{ marginLeft: "auto" }} />
          )}
        </div>
        <div className="mc-time-row">
          <span className="mc-pct">{pct}%</span>
          <span className="mc-rem">{remaining(movie.duration, pct)}</span>
        </div>
      </div>
    </div>
  );
}

// ── COLLECTION CARD ────────────────────────────────────────────────────────

function CollectionCard({ item }: { item: PurchasedMovie }) {
  const [hov, setHov] = useState(false);
  const movie = item.movie;

  return (
    <div
      className="mc"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div className="mc-poster">
        <img
          src={movie.poster_url}
          alt={movie.title}
          className={`mc-img${hov ? " mc-img--zoom" : ""}`}
          onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
        />
        <div className="mc-fallback"><Film size={22} color="rgba(255,255,255,0.1)" /></div>
        <div className={`mc-veil${hov ? " mc-veil--on" : ""}`} />

        <div className={`mc-play${hov ? " mc-play--on" : ""}`}>
          <button className="play-circle" aria-label={`Play ${movie.title}`}>
            <Play size={14} fill="#fff" color="#fff" style={{ marginLeft: 2 }} />
          </button>
        </div>

        <span className="badge badge-owned">
          <CheckCircle2 size={7} color="#10b981" /> Owned
        </span>
        <span className="badge badge-rat">
          <Star size={7} color="#f59e0b" fill="#f59e0b" /> {movie.rating?.toFixed(1)}
        </span>
        {movie.quality_options?.includes("1080p") && (
          <span className="badge badge-hd">HD</span>
        )}
      </div>

      <div className="mc-info">
        <p className="mc-title">{movie.title}</p>
        <div className="mc-meta">
          <span>{movie.genre?.[0]}</span>
          <span className="dot">·</span>
          <span>{movie.duration}</span>
          {movie.download_enabled && (
            <Download size={8} color="rgba(255,255,255,0.18)" style={{ marginLeft: "auto" }} />
          )}
        </div>
        <div className="mc-price-row">
          <span className="mc-price">KES {item.amount?.toLocaleString()}</span>
          <span className="mc-when">{ago(item.paidAt)}</span>
        </div>
      </div>
    </div>
  );
}

// ── HISTORY ROW ───────────────────────────────────────────────────────────

function HistoryRow({ item, i }: { item: WatchProgress; i: number }) {
  const [hov, setHov] = useState(false);
  const movie = item.movie;

  return (
    <div
      className={`hrow${hov ? " hrow--hov" : ""}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <span className="hrow-num">{String(i + 1).padStart(2, "0")}</span>

      <div className="hrow-thumb">
        <img
          src={movie.poster_url}
          alt={movie.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
        />
        <div className={`hrow-thumb-veil${hov ? " hrow-thumb-veil--on" : ""}`}>
          <RotateCcw size={11} color="#fff" />
        </div>
      </div>

      <div className="hrow-meta">
        <p className="hrow-title">{movie.title}</p>
        <p className="hrow-sub">{movie.genre?.[0]} · {movie.release_year} · {movie.duration}</p>
      </div>

      <div className="hrow-right">
        <div className="hrow-rating">
          <Star size={10} color="#f59e0b" fill="#f59e0b" />
          <span>{movie.rating?.toFixed(1)}</span>
        </div>
        <span className="hrow-when">{ago(item.lastWatchedAt)}</span>
      </div>
    </div>
  );
}

// ── STATS BAR ─────────────────────────────────────────────────────────────

function StatsBar({ stats, isMobile }: {
  stats: { owned: number; inProgress: number; completed: number; avgProgress: number };
  isMobile: boolean;
}) {
  const cells = [
    { Icon: Crown,        val: stats.owned,       label: "Owned",     accent: "#f59e0b" },
    { Icon: Clock,        val: stats.inProgress,  label: "Watching",  accent: "#e50914" },
    { Icon: CheckCircle2, val: stats.completed,   label: "Completed", accent: "#10b981" },
    { Icon: TrendingUp,   val: `${stats.avgProgress}%`, label: "Avg. Progress", accent: "#818cf8" },
  ];

  return (
    <div className="stats-row" style={{ gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)" }}>
      {cells.map((c) => (
        <div key={c.label} className="stat-cell">
          <c.Icon size={13} color={c.accent} strokeWidth={1.8} />
          <span className="stat-val">{c.val}</span>
          <span className="stat-lbl">{c.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── SKELETON ──────────────────────────────────────────────────────────────

function SkeletonGrid({ cols }: { cols: number }) {
  return (
    <div className="sk-grid" style={{ gridTemplateColumns: `repeat(${cols},1fr)` }}>
      {Array.from({ length: cols * 2 }).map((_, i) => (
        <div key={i} className="sk-card">
          <div className="shimmer" />
        </div>
      ))}
    </div>
  );
}

// ── EMPTY STATE ────────────────────────────────────────────────────────────

function EmptyState({ tab }: { tab: Tab }) {
  const map = {
    continue: { Icon: Clock,    title: "Nothing in progress",  sub: "Start watching a movie to see your progress here." },
    paid:     { Icon: Package,  title: "No movies owned yet",  sub: "Purchase a movie to start your collection."       },
    history:  { Icon: Film,     title: "No watch history yet", sub: "Movies you finish will appear here."              },
  };
  const { Icon, title, sub } = map[tab];
  return (
    <div className="empty">
      <div className="empty-icon"><Icon size={28} color="rgba(255,255,255,0.12)" /></div>
      <p className="empty-title">{title}</p>
      <p className="empty-sub">{sub}</p>
      <Link href="/dashboard/movies" className="empty-cta">Browse Movies</Link>
    </div>
  );
}

// ── ERROR STATE ────────────────────────────────────────────────────────────

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="empty">
      <div className="empty-icon"><AlertCircle size={28} color="rgba(229,9,20,0.5)" /></div>
      <p className="empty-title">Failed to load library</p>
      <p className="empty-sub">{message}</p>
      <button className="empty-cta" onClick={onRetry} style={{ border: "none", cursor: "pointer" }}>
        <RefreshCw size={12} style={{ marginRight: 6 }} /> Retry
      </button>
    </div>
  );
}

// ── PAGE ───────────────────────────────────────────────────────────────────

export default function LibraryPage() {
  const layout = useDashboardLayout();
  const { user } = useAuth();
  const {
    continueWatching, watchHistory, purchased, stats,
    loading, error, refetch,
  } = useUserLibrary(user?.$id);

  const [tab, setTab] = useState<Tab>("continue");
  const [mounted, setMounted] = useState(false);

  const {
    isMobile, isSmall,
    sidebarCollapsed, setSidebarCollapsed,
    searchOpen, setSearchOpen,
    searchVal, setSearchVal,
    scrolled,
  } = layout;

  useEffect(() => { setMounted(true); }, []);

  const cols = isMobile ? 2 : isSmall ? 3 : 4;

  const tabData = {
    continue: continueWatching.length,
    paid:     purchased.length,
    history:  watchHistory.length,
  };

  return (
    <>
      <style>{CSS}</style>

      <div className="shell">
        {!isSmall && (
          <DashboardSidebar
            user={user ? { name: user.name, email: user.email } : { name: "", email: "" }}
            collapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
          />
        )}

        <div id="dj-content-col" className="content-col">
          {isSmall ? (
            <MobileTopBar onSearchOpen={() => setSearchOpen(true)} notifCount={2} userName={user?.name ?? ""} />
          ) : (
            <DesktopTopBar
              scrolled={scrolled}
              searchOpen={searchOpen} searchVal={searchVal}
              onSearchOpen={() => setSearchOpen(true)}
              onSearchClose={() => { setSearchOpen(false); setSearchVal(""); }}
              onSearchChange={setSearchVal}
              notifCount={2} userName={user?.name ?? ""}
            />
          )}

          <div className="page-body" style={{ padding: isSmall ? "24px 16px 110px" : "32px 28px 80px" }}>

            {/* Header */}
            <div className="page-hd">
              <div>
                <h1 className="page-title">My Library</h1>
                <p className="page-sub">
                  {user ? `${user.name}'s personal cinema` : "Your personal cinema collection"}
                </p>
              </div>
              {!loading && (
                <button className="refetch-btn" onClick={refetch} title="Refresh library">
                  <RefreshCw size={13} />
                </button>
              )}
            </div>

            {/* Stats */}
            {!loading && !error && <StatsBar stats={stats} isMobile={isMobile} />}

            {/* Tabs */}
            <div className="tabs-bar">
              {TABS.map((t) => {
                const active = tab === t.id;
                const count = tabData[t.id];
                return (
                  <button
                    key={t.id}
                    className={`tab-btn${active ? " tab-btn--active" : ""}`}
                    onClick={() => setTab(t.id)}
                  >
                    <t.Icon size={12} strokeWidth={active ? 2.2 : 1.6} />
                    <span>{isMobile ? t.shortLabel : t.label}</span>
                    {count > 0 && (
                      <span className={`tab-count${active ? " tab-count--active" : ""}`}>{count}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            {loading ? (
              <SkeletonGrid cols={cols} />
            ) : error ? (
              <ErrorState message={error} onRetry={refetch} />
            ) : (
              <div className={`tab-body${mounted ? " tab-body--in" : ""}`}>

                {/* ── CONTINUE WATCHING ── */}
                {tab === "continue" && (
                  continueWatching.length === 0
                    ? <EmptyState tab="continue" />
                    : (
                      <div className="card-grid" style={{ gridTemplateColumns: `repeat(${cols},1fr)` }}>
                        {continueWatching.map((item) => (
                          <ContinueCard key={item.entry.$id} item={item} />
                        ))}
                      </div>
                    )
                )}

                {/* ── COLLECTION ── */}
                {tab === "paid" && (
                  purchased.length === 0
                    ? <EmptyState tab="paid" />
                    : (
                      <>
                        <div className="coll-banner">
                          <div className="coll-banner-left">
                            <Crown size={13} color="#f59e0b" />
                            <span>{purchased.length} movie{purchased.length !== 1 ? "s" : ""} owned</span>
                          </div>
                          <span className="coll-total">
                            KES {purchased.reduce((a, p) => a + (p.amount ?? 0), 0).toLocaleString()} total
                          </span>
                        </div>
                        <div className="card-grid" style={{ gridTemplateColumns: `repeat(${cols},1fr)` }}>
                          {purchased.map((item) => (
                            <CollectionCard key={item.entry.$id} item={item} />
                          ))}
                        </div>
                      </>
                    )
                )}

                {/* ── HISTORY ── */}
                {tab === "history" && (
                  watchHistory.length === 0
                    ? <EmptyState tab="history" />
                    : (
                      <div className="hlist">
                        {watchHistory.map((item, i) => (
                          <HistoryRow key={item.entry.$id} item={item} i={i} />
                        ))}
                      </div>
                    )
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

// ── CSS ────────────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; }
  html, body { background: #070709; color: #fff; margin: 0; padding: 0; overflow: hidden; }

  /* ── Layout ── */
  .shell { display: flex; height: 100svh; background: #070709; overflow: hidden; }
  .content-col {
    flex: 1; min-width: 0; height: 100svh;
    overflow-y: auto; overflow-x: hidden;
    display: flex; flex-direction: column;
    scrollbar-width: none;
  }
  .content-col::-webkit-scrollbar { display: none; }
  .page-body { flex: 1; }

  /* ── Page header ── */
  .page-hd {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 22px;
    gap: 12px;
  }
  .page-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(1.5rem, 3vw, 2.1rem);
    font-weight: 800;
    letter-spacing: -0.025em;
    color: #fff;
    margin: 0 0 3px;
    line-height: 1;
  }
  .page-sub {
    font-family: 'Outfit', sans-serif;
    font-size: 12px;
    color: rgba(255,255,255,0.25);
    margin: 0;
  }
  .refetch-btn {
    margin-top: 4px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 8px;
    padding: 7px 9px;
    cursor: pointer;
    color: rgba(255,255,255,0.3);
    transition: background 0.15s, color 0.15s;
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }
  .refetch-btn:hover { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.6); }

  /* ── Stats ── */
  .stats-row {
    display: grid;
    gap: 1px;
    background: rgba(255,255,255,0.04);
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 22px;
    border: 1px solid rgba(255,255,255,0.05);
  }
  .stat-cell {
    background: #0c0c10;
    padding: 16px 14px 14px;
    display: flex; flex-direction: column; gap: 5px;
    transition: background 0.15s;
  }
  .stat-cell:hover { background: #101015; }
  .stat-val {
    font-family: 'Syne', sans-serif;
    font-size: 1.75rem; font-weight: 700;
    color: #fff; line-height: 1;
    letter-spacing: -0.02em;
  }
  .stat-lbl {
    font-family: 'Outfit', sans-serif;
    font-size: 9.5px; font-weight: 500;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: rgba(255,255,255,0.2);
  }

  /* ── Tabs ── */
  .tabs-bar {
    display: flex; gap: 2px;
    margin-bottom: 20px;
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 10px;
    padding: 3px;
  }
  .tab-btn {
    flex: 1;
    display: flex; align-items: center; justify-content: center; gap: 5px;
    padding: 8px 6px;
    border-radius: 8px; border: none; cursor: pointer;
    background: transparent;
    font-family: 'Outfit', sans-serif;
    font-size: 11px; font-weight: 500;
    color: rgba(255,255,255,0.28);
    transition: background 0.16s, color 0.16s;
    white-space: nowrap; overflow: hidden; min-width: 0;
  }
  .tab-btn:hover { color: rgba(255,255,255,0.55); background: rgba(255,255,255,0.03); }
  .tab-btn--active {
    background: #e50914; color: #fff; font-weight: 600;
    box-shadow: 0 3px 16px rgba(229,9,20,0.3);
  }
  .tab-btn--active:hover { background: #e50914; color: #fff; }
  .tab-count {
    font-size: 9.5px; font-weight: 600;
    background: rgba(255,255,255,0.07);
    border-radius: 99px; padding: 1px 6px;
    color: rgba(255,255,255,0.25);
    flex-shrink: 0;
  }
  .tab-count--active { background: rgba(255,255,255,0.18); color: #fff; }
  @media (max-width: 480px) {
    .tab-count { display: none; }
    .tab-btn { font-size: 10px; gap: 4px; }
  }

  /* ── Tab body fade ── */
  .tab-body { opacity: 0; transform: translateY(6px); transition: opacity 0.2s ease, transform 0.2s ease; }
  .tab-body--in { opacity: 1; transform: none; }

  /* ── Card grid ── */
  .card-grid { display: grid; gap: 8px; }

  /* ── Movie card ── */
  .mc {
    border-radius: 9px; overflow: hidden;
    background: #0c0c10;
    border: 1px solid rgba(255,255,255,0.05);
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  }
  .mc:hover {
    transform: translateY(-3px);
    box-shadow: 0 16px 40px rgba(0,0,0,0.7);
    border-color: rgba(255,255,255,0.09);
  }
  .mc-poster {
    position: relative;
    aspect-ratio: 2/3;
    background: #161620;
    overflow: hidden;
  }
  .mc-img {
    width: 100%; height: 100%; object-fit: cover; display: block;
    transition: transform 0.4s ease;
  }
  .mc-img--zoom { transform: scale(1.06); }
  .mc-fallback {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    pointer-events: none;
  }
  .mc-veil {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0.05);
    transition: background 0.2s;
  }
  .mc-veil--on { background: rgba(0,0,0,0.52); }

  /* Play button */
  .mc-play {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.16s;
  }
  .mc-play--on { opacity: 1; }
  .play-circle {
    width: 40px; height: 40px; border-radius: 50%;
    background: #e50914; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 24px rgba(229,9,20,0.55);
    transition: transform 0.14s;
  }
  .play-circle:hover { transform: scale(1.1); }
  .play-circle:active { transform: scale(0.95); }

  /* Badges */
  .badge {
    position: absolute;
    display: inline-flex; align-items: center; gap: 3px;
    border-radius: 4px; padding: 2px 6px;
    font-family: 'Outfit', sans-serif;
    font-size: 8px; font-weight: 600; letter-spacing: 0.04em;
    line-height: 1.4;
  }
  .badge-prem {
    top: 7px; left: 7px;
    background: rgba(245,158,11,0.12);
    border: 1px solid rgba(245,158,11,0.25);
    color: #f59e0b;
  }
  .badge-owned {
    top: 7px; left: 7px;
    background: rgba(16,185,129,0.1);
    border: 1px solid rgba(16,185,129,0.22);
    color: #10b981;
  }
  .badge-rat {
    top: 7px; right: 7px;
    background: rgba(0,0,0,0.6);
    border: 1px solid rgba(255,255,255,0.06);
    color: #fff;
    backdrop-filter: blur(6px);
  }
  .badge-hd {
    bottom: 14px; right: 7px;
    background: rgba(0,0,0,0.65);
    border: 1px solid rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.5);
    font-size: 7.5px; letter-spacing: 0.08em;
  }

  /* Poster progress bar (single, clean) */
  .poster-prog {
    position: absolute; bottom: 0; left: 0; right: 0;
    height: 3px;
    background: rgba(255,255,255,0.08);
  }
  .poster-prog-fill {
    height: 100%;
    background: linear-gradient(90deg, #e50914, #ff4d58);
    transition: width 0.4s ease;
    border-radius: 0 2px 2px 0;
  }

  /* Card info */
  .mc-info { padding: 9px 10px 10px; }
  .mc-title {
    font-family: 'Outfit', sans-serif;
    font-size: 11.5px; font-weight: 600;
    color: rgba(255,255,255,0.85);
    margin: 0 0 4px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .mc-meta {
    display: flex; align-items: center; gap: 4px;
    font-family: 'Outfit', sans-serif;
    font-size: 9.5px; color: rgba(255,255,255,0.2);
  }
  .dot { color: rgba(255,255,255,0.1); }

  /* Time row (continue) */
  .mc-time-row {
    display: flex; align-items: center; justify-content: space-between;
    margin-top: 6px;
  }
  .mc-pct {
    font-family: 'Outfit', sans-serif;
    font-size: 9px; font-weight: 700;
    color: rgba(229,9,20,0.65);
  }
  .mc-rem {
    font-family: 'Outfit', sans-serif;
    font-size: 9px;
    color: rgba(255,255,255,0.18);
  }

  /* Price row (collection) */
  .mc-price-row {
    display: flex; align-items: center; justify-content: space-between;
    margin-top: 6px;
  }
  .mc-price {
    font-family: 'Outfit', sans-serif;
    font-size: 9.5px; font-weight: 600;
    color: rgba(255,255,255,0.3);
  }
  .mc-when {
    font-family: 'Outfit', sans-serif;
    font-size: 8.5px;
    color: rgba(255,255,255,0.14);
  }

  /* ── Collection banner ── */
  .coll-banner {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 13px;
    background: rgba(245,158,11,0.04);
    border: 1px solid rgba(245,158,11,0.1);
    border-radius: 9px;
    margin-bottom: 14px;
    flex-wrap: wrap; gap: 8px;
  }
  .coll-banner-left {
    display: flex; align-items: center; gap: 7px;
    font-family: 'Outfit', sans-serif;
    font-size: 11.5px; font-weight: 500;
    color: rgba(255,255,255,0.5);
  }
  .coll-total {
    font-family: 'Outfit', sans-serif;
    font-size: 10.5px; font-weight: 600;
    color: rgba(255,255,255,0.18);
    letter-spacing: 0.04em;
  }

  /* ── History list ── */
  .hlist { display: flex; flex-direction: column; gap: 2px; }
  .hrow {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 12px;
    border-radius: 9px;
    background: rgba(255,255,255,0.01);
    border: 1px solid rgba(255,255,255,0.03);
    cursor: pointer;
    transition: background 0.14s, border-color 0.14s;
  }
  .hrow--hov { background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.07); }

  .hrow-num {
    font-family: 'Syne', sans-serif;
    font-size: 12px; font-weight: 700;
    color: rgba(255,255,255,0.08);
    width: 20px; text-align: right; flex-shrink: 0;
  }
  .hrow-thumb {
    width: 38px; height: 54px; border-radius: 6px;
    overflow: hidden; flex-shrink: 0;
    background: #161620; position: relative;
  }
  .hrow-thumb-veil {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0.55);
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.14s;
  }
  .hrow-thumb-veil--on { opacity: 1; }

  .hrow-meta { flex: 1; min-width: 0; }
  .hrow-title {
    font-family: 'Outfit', sans-serif;
    font-size: 12.5px; font-weight: 600;
    color: rgba(255,255,255,0.75);
    margin: 0 0 2px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    transition: color 0.14s;
  }
  .hrow--hov .hrow-title { color: #fff; }
  .hrow-sub {
    font-family: 'Outfit', sans-serif;
    font-size: 10px;
    color: rgba(255,255,255,0.2); margin: 0;
  }

  .hrow-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; flex-shrink: 0; }
  .hrow-rating {
    display: flex; align-items: center; gap: 3px;
    font-family: 'Outfit', sans-serif;
    font-size: 12.5px; font-weight: 600; color: #fff;
  }
  .hrow-when {
    font-family: 'Outfit', sans-serif;
    font-size: 8.5px; color: rgba(255,255,255,0.16);
  }

  /* ── Skeleton ── */
  .sk-grid { display: grid; gap: 8px; }
  .sk-card {
    border-radius: 9px; background: #0c0c10;
    aspect-ratio: 2/3; overflow: hidden; position: relative;
  }
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  .shimmer {
    position: absolute; inset: 0;
    background: linear-gradient(90deg,
      rgba(255,255,255,0) 0%,
      rgba(255,255,255,0.03) 50%,
      rgba(255,255,255,0) 100%
    );
    background-size: 600px 100%;
    animation: shimmer 1.5s ease-in-out infinite;
  }

  /* ── Empty / Error ── */
  .empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 60px 24px; text-align: center;
  }
  .empty-icon {
    width: 60px; height: 60px; border-radius: 14px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 16px;
  }
  .empty-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.05rem; font-weight: 700;
    color: rgba(255,255,255,0.65);
    margin: 0 0 7px;
  }
  .empty-sub {
    font-family: 'Outfit', sans-serif;
    font-size: 12px; color: rgba(255,255,255,0.22);
    margin: 0 0 22px; max-width: 240px; line-height: 1.65;
  }
  .empty-cta {
    display: inline-flex; align-items: center;
    padding: 9px 22px;
    background: #e50914; border-radius: 7px;
    font-family: 'Outfit', sans-serif;
    font-size: 11px; font-weight: 600;
    letter-spacing: 0.07em; text-transform: uppercase;
    color: #fff; text-decoration: none;
    transition: background 0.14s, transform 0.14s;
  }
  .empty-cta:hover { background: #ff1a27; transform: translateY(-1px); }
`;