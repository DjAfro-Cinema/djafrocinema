"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Play, Clock, Heart, CreditCard,
  Film, Star, RotateCcw, CheckCircle2,
  Crown, RefreshCw, Package, AlertCircle,
  Download, TrendingUp, Bookmark, Lock,
  ChevronRight, Wallet,
} from "lucide-react";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useUserLibrary } from "@/hooks/useUserLibrary";
import { usePayments } from "@/hooks/usePayment";
import { WatchProgress, UserLibraryEntry } from "@/services/userLibrary.service";
import { Payment } from "@/services/payment.service";
import DashboardSidebar from "@/components/dashboard/sidebar/DashboardSidebar";
import MobileBottomNav from "@/components/dashboard/mobile/MobileBottomNav";
import MobileTopBar from "@/components/dashboard/topbar/MobileTopBar";
import DesktopTopBar from "@/components/dashboard/topbar/DesktopTopBar";

// ── HELPERS ────────────────────────────────────────────────────────────────

function ago(iso: string | number | null | undefined) {
  if (!iso) return "—";
  const ts = typeof iso === "number" ? iso : new Date(iso).getTime();
  const d = Math.floor((Date.now() - ts) / 864e5);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString("en-KE", { day: "numeric", month: "short" });
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

function statusColor(s: string): string {
  if (s === "completed") return "var(--dj-success)";
  if (s === "pending")   return "var(--dj-warning)";
  if (s === "failed")    return "var(--dj-danger)";
  return "var(--dj-text-muted)";
}

// ── TABS ───────────────────────────────────────────────────────────────────

const TABS = [
  { id: "continue",  label: "Continue",  Icon: Clock       },
  { id: "wishlist",  label: "Wishlist",   Icon: Heart       },
  { id: "payments",  label: "Payments",  Icon: CreditCard  },
] as const;
type Tab = (typeof TABS)[number]["id"];

// ── STATS BAR ─────────────────────────────────────────────────────────────

function StatsBar({ owned, watching, wishlistCount, spent }: { owned: number; watching: number; wishlistCount: number; spent: number }) {
  const cells = [
    { Icon: Film,   val: owned,         label: "Owned"    },
    { Icon: Clock,  val: watching,      label: "Watching" },
    { Icon: Heart,  val: wishlistCount, label: "Wishlist" },
    { Icon: Wallet, val: `${spent}`,    label: "Streak"   },
  ];

  return (
    <div className="lib-stats-row">
      {cells.map((c) => (
        <div key={c.label} className="lib-stat-cell">
          <c.Icon size={18} color="var(--dj-accent)" strokeWidth={1.6} />
          <span className="lib-stat-val">{c.val}</span>
          <span className="lib-stat-lbl">{c.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── CONTINUE WATCHING ROW ─────────────────────────────────────────────────

function ContinueRow({ item }: { item: WatchProgress }) {
  const pct   = item.progressPercent;
  const movie = item.movie;

  return (
    <Link href={`/dashboard/movies/${movie.$id}`} className="lib-cw-row">
      <div className="lib-cw-thumb">
        <img
          src={movie.poster_url} alt={movie.title}
          className="lib-cw-img"
          onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
        />
        <div className="lib-cw-thumb-overlay">
          <div className="lib-cw-play-sm">
            <Play size={10} fill="#fff" color="#fff" style={{ marginLeft: 1 }} />
          </div>
        </div>
        <div className="lib-cw-prog-bar">
          <div className="lib-cw-prog-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="lib-cw-info">
        <p className="lib-cw-title">{movie.title}</p>
        <p className="lib-cw-sub">Last watched {ago(item.lastWatchedAt)}</p>
        <div className="lib-cw-progress-row">
          <div className="lib-cw-track">
            <div className="lib-cw-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="lib-cw-pct">{pct}%</span>
        </div>
        <p className="lib-cw-remain">{remaining(movie.duration, pct)}</p>
      </div>

      <div className="lib-cw-play-btn">
        <Play size={11} fill="#fff" color="#fff" style={{ marginLeft: 1 }} />
      </div>
    </Link>
  );
}

// ── WISHLIST CARD ─────────────────────────────────────────────────────────

function WishlistCard({ entry }: { entry: UserLibraryEntry & { movie?: import("@/services/userLibrary.service").Movie } }) {
  const [hov, setHov] = useState(false);
  const movie = entry.movie;
  if (!movie) return null;

  return (
    <Link
      href={`/dashboard/movies/${movie.$id}`}
      className="lib-wl-card"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div className="lib-wl-poster">
        <img
          src={movie.poster_url} alt={movie.title}
          className={`lib-wl-img${hov ? " lib-wl-img--zoom" : ""}`}
          onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
        />
        <div className="lib-wl-badge-rat">
          <Star size={9} color="#f59e0b" fill="#f59e0b" />
          <span>{movie.rating?.toFixed(1) ?? "—"}</span>
        </div>
        <div className="lib-wl-badge-bm">
          <Bookmark size={11} color="#fff" fill="rgba(255,255,255,0.9)" />
        </div>
        <div className={`lib-wl-play${hov ? " lib-wl-play--on" : ""}`}>
          <div className="lib-wl-play-circle">
            <Play size={13} fill="#fff" color="#fff" style={{ marginLeft: 2 }} />
          </div>
        </div>
        {movie.premium_only && (
          <div className="lib-wl-lock">
            <Lock size={9} color="#f59e0b" />
          </div>
        )}
      </div>
      <div className="lib-wl-info">
        <p className="lib-wl-title">{movie.title}</p>
        <p className="lib-wl-sub">{movie.genre?.[0] ?? "—"} · {movie.release_year}</p>
      </div>
    </Link>
  );
}

// ── PAYMENT ROW ───────────────────────────────────────────────────────────

function PaymentRow({ payment, movieTitle }: { payment: Payment; movieTitle?: string }) {
  const color = statusColor(payment.status);
  return (
    <div className="lib-pay-row">
      <div className="lib-pay-thumb">
        <CreditCard size={16} color="var(--dj-icon-inactive)" />
      </div>
      <div className="lib-pay-info">
        <p className="lib-pay-title">{movieTitle ?? payment.movieId}</p>
        <p className="lib-pay-date">{ago(payment.$createdAt)}</p>
      </div>
      <div className="lib-pay-right">
        <span className="lib-pay-status" style={{ color, borderColor: `${color}33`, background: `${color}12` }}>
          {payment.status.toUpperCase()}
        </span>
        <span className="lib-pay-amount">KES {payment.amount.toLocaleString()}</span>
      </div>
    </div>
  );
}

// ── SKELETON ──────────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <div className="lib-sk-list">
      {[1, 2, 3].map((i) => (
        <div key={i} className="lib-sk-row">
          <div className="lib-sk-thumb lib-shimmer" />
          <div className="lib-sk-lines">
            <div className="lib-sk-line lib-sk-line--lg lib-shimmer" />
            <div className="lib-sk-line lib-sk-line--sm lib-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── EMPTY STATE ────────────────────────────────────────────────────────────

function EmptyState({ tab }: { tab: Tab }) {
  const map: Record<Tab, { Icon: React.ElementType; title: string; sub: string }> = {
    continue: { Icon: Clock,      title: "Nothing in progress",  sub: "Start watching a movie to see your progress here." },
    wishlist: { Icon: Heart,      title: "Wishlist is empty",    sub: "Bookmark movies you want to watch later."          },
    payments: { Icon: CreditCard, title: "No payments yet",      sub: "Purchase a movie to see your payment history."     },
  };
  const { Icon, title, sub } = map[tab];
  return (
    <div className="lib-empty">
      <div className="lib-empty-icon"><Icon size={26} color="var(--dj-icon-inactive)" /></div>
      <p className="lib-empty-title">{title}</p>
      <p className="lib-empty-sub">{sub}</p>
      <Link href="/dashboard/movies" className="lib-empty-cta">Browse Movies</Link>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="lib-empty">
      <div className="lib-empty-icon"><AlertCircle size={26} color="var(--dj-danger)" /></div>
      <p className="lib-empty-title">Failed to load</p>
      <p className="lib-empty-sub">{message}</p>
      <button className="lib-empty-cta" onClick={onRetry}>
        <RefreshCw size={11} style={{ marginRight: 5 }} /> Retry
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
    loading: libLoading, error: libError, refetch: refetchLib,
  } = useUserLibrary(user?.$id);

  const {
    payments, loading: payLoading, error: payError, refetch: refetchPay,
  } = usePayments(user?.$id);

  const [tab, setTab]       = useState<Tab>("continue");
  const [mounted, setMounted] = useState(false);

  const {
    isMobile, isSmall,
    sidebarCollapsed, setSidebarCollapsed,
    searchOpen, setSearchOpen,
    searchVal, setSearchVal,
    scrolled,
  } = layout;

  useEffect(() => { setMounted(true); }, []);

  const wishlistEntries = [
    ...continueWatching.map((w) => ({ ...w.entry, movie: w.movie })),
    ...watchHistory.map((w) => ({ ...w.entry, movie: w.movie })),
  ].filter((e) => e.isWishlisted);

  const loading = libLoading || payLoading;
  const error   = libError  || payError;
  const refetch = async () => { await Promise.all([refetchLib(), refetchPay()]); };

  return (
    <>
      <style>{CSS}</style>

      <div className="lib-shell">
        {!isSmall && (
          <DashboardSidebar
            user={user ? { name: user.name, email: user.email } : { name: "", email: "" }}
            collapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
          />
        )}

        <div id="lib-content-col" className="lib-content-col">
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

          <div className="lib-page-body" style={{ padding: isSmall ? "20px 16px 100px" : "28px 24px 72px" }}>

            {/* Header */}
            <div className="lib-page-hd">
              <div>
                <h1 className="lib-page-title">My List</h1>
                <p className="lib-page-sub">Your personal collection</p>
              </div>
              <button className="lib-refetch-btn" onClick={refetch} title="Refresh">
                <RefreshCw size={14} />
              </button>
            </div>

            {/* Tabs */}
            <div className="lib-tabs-bar">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  className={`lib-tab-btn${tab === t.id ? " lib-tab-btn--active" : ""}`}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Stats */}
            {!loading && !error && (
              <StatsBar owned={stats.owned} watching={stats.inProgress} wishlistCount={wishlistEntries.length} spent={0} />
            )}

            {/* Section label */}
            {!loading && !error && tab === "continue" && continueWatching.length > 0 && (
              <p className="lib-section-label">Continue Watching</p>
            )}

            {/* Content */}
            {loading ? (
              <SkeletonRows />
            ) : error ? (
              <ErrorState message={error} onRetry={refetch} />
            ) : (
              <div className={`lib-tab-body${mounted ? " lib-tab-body--in" : ""}`}>

                {tab === "continue" && (
                  continueWatching.length === 0
                    ? <EmptyState tab="continue" />
                    : <div className="lib-cw-list">{continueWatching.map((item) => <ContinueRow key={item.entry.$id} item={item} />)}</div>
                )}

                {tab === "wishlist" && (
                  wishlistEntries.length === 0
                    ? <EmptyState tab="wishlist" />
                    : (
                      <div className="lib-wl-grid" style={{ gridTemplateColumns: `repeat(${isMobile ? 2 : isSmall ? 2 : 3}, 1fr)` }}>
                        {wishlistEntries.map((entry) => <WishlistCard key={entry.$id} entry={entry} />)}
                      </div>
                    )
                )}

                {tab === "payments" && (
                  payments.length === 0
                    ? <EmptyState tab="payments" />
                    : <div className="lib-pay-list">{payments.map((p) => <PaymentRow key={p.$id} payment={p} />)}</div>
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
  html, body {
    background: var(--dj-bg-base);
    color: var(--dj-text-primary);
    margin: 0; padding: 0; overflow: hidden;
  }

  /* ── Layout ── */
  .lib-shell { display: flex; height: 100svh; background: var(--dj-bg-base); overflow: hidden; }
  .lib-content-col {
    flex: 1; min-width: 0; height: 100svh;
    overflow-y: auto; overflow-x: hidden;
    display: flex; flex-direction: column;
    scrollbar-width: none;
  }
  .lib-content-col::-webkit-scrollbar { display: none; }
  .lib-page-body { flex: 1; }

  /* ── Page header ── */
  .lib-page-hd {
    display: flex; align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 18px; gap: 12px;
  }
  .lib-page-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(1.6rem, 4vw, 2.2rem);
    font-weight: 800; letter-spacing: -0.025em;
    color: var(--dj-text-primary); margin: 0 0 2px; line-height: 1;
  }
  .lib-page-sub {
    font-family: 'Outfit', sans-serif;
    font-size: 12px; color: var(--dj-text-muted); margin: 0;
  }
  .lib-refetch-btn {
    background: transparent; border: none;
    cursor: pointer; color: var(--dj-icon-inactive);
    padding: 4px; margin-top: 2px;
    transition: color 0.15s;
    display: flex; align-items: center;
  }
  .lib-refetch-btn:hover { color: var(--dj-icon-hovered); }

  /* ── Tabs ── */
  .lib-tabs-bar {
    display: flex; gap: 4px;
    background: var(--dj-bg-surface);
    border: 1px solid var(--dj-border-subtle);
    border-radius: 999px;
    padding: 4px;
    margin-bottom: 20px;
  }
  .lib-tab-btn {
    flex: 1; padding: 9px 8px;
    border-radius: 999px; border: none; cursor: pointer;
    background: transparent;
    font-family: 'Outfit', sans-serif;
    font-size: 13px; font-weight: 500;
    color: var(--dj-text-secondary);
    transition: background 0.16s, color 0.16s;
    white-space: nowrap;
  }
  .lib-tab-btn:hover { color: var(--dj-text-primary); }
  .lib-tab-btn--active {
    background: var(--dj-accent);
    color: var(--dj-text-on-accent);
    font-weight: 600;
    box-shadow: 0 2px 12px var(--dj-accent-glow);
  }
  .lib-tab-btn--active:hover { background: var(--dj-accent); color: var(--dj-text-on-accent); }

  /* ── Stats ── */
  .lib-stats-row {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 8px; margin-bottom: 20px;
  }
  .lib-stat-cell {
    background: var(--dj-nav-active-bg);
    border: 1px solid var(--dj-border-accent);
    border-radius: 12px;
    padding: 14px 8px 12px;
    display: flex; flex-direction: column;
    align-items: center; gap: 5px;
  }
  .lib-stat-val {
    font-family: 'Syne', sans-serif;
    font-size: 1.4rem; font-weight: 700;
    color: var(--dj-text-primary); line-height: 1;
  }
  .lib-stat-lbl {
    font-family: 'Outfit', sans-serif;
    font-size: 9px; font-weight: 500;
    letter-spacing: 0.05em; text-transform: uppercase;
    color: var(--dj-text-muted);
  }

  /* ── Section label ── */
  .lib-section-label {
    font-family: 'Syne', sans-serif;
    font-size: 14px; font-weight: 700;
    color: var(--dj-text-primary); margin: 0 0 12px;
    letter-spacing: -0.01em;
  }

  /* ── Tab body ── */
  .lib-tab-body { opacity: 0; transform: translateY(5px); transition: opacity 0.18s ease, transform 0.18s ease; }
  .lib-tab-body--in { opacity: 1; transform: none; }

  /* ── Continue Watching ── */
  .lib-cw-list { display: flex; flex-direction: column; gap: 10px; }
  .lib-cw-row {
    display: flex; align-items: center; gap: 13px;
    background: var(--dj-bg-surface);
    border: 1px solid var(--dj-border-subtle);
    border-radius: 14px;
    padding: 10px 12px 10px 10px;
    text-decoration: none;
    transition: background 0.14s, border-color 0.14s;
    cursor: pointer;
  }
  .lib-cw-row:hover {
    background: var(--dj-bg-elevated);
    border-color: var(--dj-border-medium);
  }
  .lib-cw-thumb {
    width: 56px; height: 78px; border-radius: 8px;
    overflow: hidden; flex-shrink: 0;
    background: var(--dj-bg-elevated); position: relative;
  }
  .lib-cw-img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .lib-cw-thumb-overlay {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0.3);
    display: flex; align-items: center; justify-content: center;
  }
  .lib-cw-play-sm {
    width: 22px; height: 22px; border-radius: 50%;
    background: var(--dj-accent);
    display: flex; align-items: center; justify-content: center;
  }
  .lib-cw-prog-bar {
    position: absolute; bottom: 0; left: 0; right: 0;
    height: 3px; background: var(--dj-border-subtle);
  }
  .lib-cw-prog-fill {
    height: 100%; background: var(--dj-accent);
    border-radius: 0 2px 2px 0;
    transition: width 0.4s ease;
  }
  .lib-cw-info { flex: 1; min-width: 0; }
  .lib-cw-title {
    font-family: 'Outfit', sans-serif;
    font-size: 13px; font-weight: 600;
    color: var(--dj-text-primary);
    margin: 0 0 3px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .lib-cw-sub {
    font-family: 'Outfit', sans-serif;
    font-size: 10.5px; color: var(--dj-text-muted);
    margin: 0 0 8px;
  }
  .lib-cw-progress-row {
    display: flex; align-items: center; gap: 7px; margin-bottom: 4px;
  }
  .lib-cw-track {
    flex: 1; height: 3px; border-radius: 99px;
    background: var(--dj-border-subtle); overflow: hidden;
  }
  .lib-cw-fill {
    height: 100%; background: var(--dj-accent-light);
    border-radius: 99px; transition: width 0.4s ease;
  }
  .lib-cw-pct {
    font-family: 'Outfit', sans-serif;
    font-size: 10px; font-weight: 700;
    color: var(--dj-text-muted); flex-shrink: 0;
  }
  .lib-cw-remain {
    font-family: 'Outfit', sans-serif;
    font-size: 10px; color: var(--dj-text-muted); margin: 0;
  }
  .lib-cw-play-btn {
    width: 32px; height: 32px; border-radius: 50%;
    background: var(--dj-accent); flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 16px var(--dj-accent-glow);
    transition: transform 0.13s;
  }
  .lib-cw-row:hover .lib-cw-play-btn { transform: scale(1.07); }

  /* ── Wishlist grid ── */
  .lib-wl-grid { display: grid; gap: 10px; }
  .lib-wl-card {
    border-radius: 10px; overflow: hidden;
    background: var(--dj-bg-elevated);
    border: 1px solid var(--dj-border-subtle);
    text-decoration: none; cursor: pointer; display: block;
    transition: transform 0.18s ease, border-color 0.18s ease;
  }
  .lib-wl-card:hover { transform: translateY(-2px); border-color: var(--dj-border-medium); }
  .lib-wl-poster {
    position: relative; aspect-ratio: 2/3;
    background: var(--dj-bg-elevated); overflow: hidden;
  }
  .lib-wl-img {
    width: 100%; height: 100%; object-fit: cover; display: block;
    transition: transform 0.35s ease;
  }
  .lib-wl-img--zoom { transform: scale(1.05); }
  .lib-wl-badge-rat {
    position: absolute; top: 6px; left: 6px;
    display: flex; align-items: center; gap: 3px;
    background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
    border-radius: 6px; padding: 3px 7px;
    font-family: 'Outfit', sans-serif;
    font-size: 10px; font-weight: 700; color: var(--dj-text-primary);
    border: 1px solid var(--dj-border-subtle);
  }
  .lib-wl-badge-bm {
    position: absolute; top: 6px; right: 6px;
    width: 26px; height: 26px; border-radius: 6px;
    background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
    border: 1px solid var(--dj-border-medium);
    display: flex; align-items: center; justify-content: center;
  }
  .lib-wl-play {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.15s;
    background: rgba(0,0,0,0.35);
  }
  .lib-wl-play--on { opacity: 1; }
  .lib-wl-play-circle {
    width: 42px; height: 42px; border-radius: 50%;
    background: var(--dj-accent);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 24px var(--dj-accent-glow);
  }
  .lib-wl-lock {
    position: absolute; bottom: 8px; right: 8px;
    background: rgba(0,0,0,0.6); border-radius: 5px; padding: 3px 5px;
  }
  .lib-wl-info { padding: 8px 9px 10px; }
  .lib-wl-title {
    font-family: 'Outfit', sans-serif;
    font-size: 12px; font-weight: 600;
    color: var(--dj-text-primary);
    margin: 0 0 3px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .lib-wl-sub {
    font-family: 'Outfit', sans-serif;
    font-size: 10px; color: var(--dj-text-muted); margin: 0;
  }

  /* ── Payment rows ── */
  .lib-pay-list { display: flex; flex-direction: column; gap: 8px; }
  .lib-pay-row {
    display: flex; align-items: center; gap: 12px;
    background: var(--dj-bg-surface);
    border: 1px solid var(--dj-border-subtle);
    border-radius: 12px; padding: 12px 14px;
  }
  .lib-pay-thumb {
    width: 40px; height: 40px; border-radius: 9px;
    background: var(--dj-bg-elevated);
    border: 1px solid var(--dj-border-subtle);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .lib-pay-info { flex: 1; min-width: 0; }
  .lib-pay-title {
    font-family: 'Outfit', sans-serif;
    font-size: 12.5px; font-weight: 600;
    color: var(--dj-text-primary);
    margin: 0 0 3px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .lib-pay-date {
    font-family: 'Outfit', sans-serif;
    font-size: 10px; color: var(--dj-text-muted); margin: 0;
  }
  .lib-pay-right {
    display: flex; flex-direction: column; align-items: flex-end;
    gap: 4px; flex-shrink: 0;
  }
  .lib-pay-status {
    font-family: 'Outfit', sans-serif;
    font-size: 8.5px; font-weight: 700; letter-spacing: 0.06em;
    padding: 2px 8px; border-radius: 99px;
    border: 1px solid transparent;
  }
  .lib-pay-amount {
    font-family: 'Syne', sans-serif;
    font-size: 12px; font-weight: 700; color: var(--dj-text-primary);
  }

  /* ── Skeleton ── */
  @keyframes libShimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  .lib-shimmer {
    background: linear-gradient(90deg,
      rgba(255,255,255,0) 0%,
      rgba(255,255,255,0.04) 50%,
      rgba(255,255,255,0) 100%
    );
    background-size: 600px 100%;
    animation: libShimmer 1.5s ease-in-out infinite;
  }
  .lib-sk-list { display: flex; flex-direction: column; gap: 10px; }
  .lib-sk-row {
    display: flex; gap: 13px; align-items: center;
    padding: 10px; border-radius: 14px;
    background: var(--dj-bg-surface);
    border: 1px solid var(--dj-border-subtle);
  }
  .lib-sk-thumb { width: 56px; height: 78px; border-radius: 8px; flex-shrink: 0; background: var(--dj-bg-elevated); }
  .lib-sk-lines { flex: 1; display: flex; flex-direction: column; gap: 8px; }
  .lib-sk-line { height: 10px; border-radius: 6px; background: var(--dj-bg-elevated); }
  .lib-sk-line--lg { width: 70%; }
  .lib-sk-line--sm { width: 45%; }

  /* ── Empty / Error ── */
  .lib-empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 50px 24px; text-align: center;
  }
  .lib-empty-icon {
    width: 56px; height: 56px; border-radius: 14px;
    background: var(--dj-bg-surface);
    border: 1px solid var(--dj-border-subtle);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 14px;
  }
  .lib-empty-title {
    font-family: 'Syne', sans-serif;
    font-size: 1rem; font-weight: 700;
    color: var(--dj-text-secondary); margin: 0 0 7px;
  }
  .lib-empty-sub {
    font-family: 'Outfit', sans-serif;
    font-size: 12px; color: var(--dj-text-muted);
    margin: 0 0 20px; max-width: 230px; line-height: 1.6;
  }
  .lib-empty-cta {
    display: inline-flex; align-items: center;
    padding: 9px 22px;
    background: var(--dj-accent); border-radius: 999px;
    font-family: 'Outfit', sans-serif;
    font-size: 12px; font-weight: 600;
    color: var(--dj-text-on-accent);
    text-decoration: none; border: none; cursor: pointer;
    transition: opacity 0.14s, transform 0.14s;
    box-shadow: 0 2px 12px var(--dj-accent-glow);
  }
  .lib-empty-cta:hover { opacity: 0.88; transform: translateY(-1px); }
`;