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
  if (s === "completed") return "#10b981";
  if (s === "pending") return "#f59e0b";
  if (s === "failed") return "#e50914";
  return "rgba(255,255,255,0.3)";
}

// ── TABS ───────────────────────────────────────────────────────────────────

const TABS = [
  { id: "continue",  label: "Continue",  Icon: Clock       },
  { id: "wishlist",  label: "Wishlist",   Icon: Heart       },
  { id: "payments",  label: "Payments",  Icon: CreditCard  },
] as const;
type Tab = (typeof TABS)[number]["id"];

// ── STATS BAR ─────────────────────────────────────────────────────────────

function StatsBar({ owned, watching, wishlistCount, spent }: {
  owned: number; watching: number; wishlistCount: number; spent: number;
}) {
  const cells = [
    { Icon: Film,      val: owned,           label: "Owned",    accent: "#e50914" },
    { Icon: Clock,     val: watching,        label: "Watching", accent: "#e50914" },
    { Icon: Heart,     val: wishlistCount,   label: "Wishlist", accent: "#e50914" },
    { Icon: Wallet,    val: `${spent}`,      label: "Streak",   accent: "#e50914" },
  ];

  return (
    <div className="stats-row">
      {cells.map((c) => (
        <div key={c.label} className="stat-cell">
          <c.Icon size={18} color={c.accent} strokeWidth={1.6} />
          <span className="stat-val">{c.val}</span>
          <span className="stat-lbl">{c.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── CONTINUE WATCHING ROW (matches mobile app style) ──────────────────────

function ContinueRow({ item }: { item: WatchProgress }) {
  const pct = item.progressPercent;
  const movie = item.movie;

  return (
    <Link href={`/dashboard/movies/${movie.$id}`} className="cw-row">
      <div className="cw-thumb">
        <img
          src={movie.poster_url}
          alt={movie.title}
          className="cw-img"
          onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
        />
        <div className="cw-thumb-overlay">
          <div className="cw-play-sm">
            <Play size={10} fill="#fff" color="#fff" style={{ marginLeft: 1 }} />
          </div>
        </div>
        {/* Progress bar at bottom of thumb */}
        <div className="cw-prog-bar">
          <div className="cw-prog-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="cw-info">
        <p className="cw-title">{movie.title}</p>
        <p className="cw-sub">Last watched {ago(item.lastWatchedAt)}</p>
        <div className="cw-progress-row">
          <div className="cw-track">
            <div className="cw-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="cw-pct">{pct}%</span>
        </div>
        <p className="cw-remain">{remaining(movie.duration, pct)}</p>
      </div>

      <div className="cw-play-btn">
        <Play size={11} fill="#fff" color="#fff" style={{ marginLeft: 1 }} />
      </div>
    </Link>
  );
}

// ── WISHLIST CARD (2-col grid, matches mobile Wishlist tab) ───────────────

function WishlistCard({ entry }: { entry: UserLibraryEntry & { movie?: import("@/services/userLibrary.service").Movie } }) {
  const [hov, setHov] = useState(false);
  const movie = entry.movie;
  if (!movie) return null;

  return (
    <Link
      href={`/dashboard/movies/${movie.$id}`}
      className="wl-card"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div className="wl-poster">
        <img
          src={movie.poster_url}
          alt={movie.title}
          className={`wl-img${hov ? " wl-img--zoom" : ""}`}
          onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
        />
        {/* Rating badge top-left */}
        <div className="wl-badge-rat">
          <Star size={9} color="#f59e0b" fill="#f59e0b" />
          <span>{movie.rating?.toFixed(1) ?? "—"}</span>
        </div>
        {/* Bookmark icon top-right */}
        <div className="wl-badge-bm">
          <Bookmark size={11} color="#fff" fill="rgba(255,255,255,0.9)" />
        </div>
        {/* Play button center on hover */}
        <div className={`wl-play${hov ? " wl-play--on" : ""}`}>
          <div className="wl-play-circle">
            <Play size={13} fill="#fff" color="#fff" style={{ marginLeft: 2 }} />
          </div>
        </div>
        {/* Premium lock */}
        {movie.premium_only && (
          <div className="wl-lock">
            <Lock size={9} color="#f59e0b" />
          </div>
        )}
      </div>
      <div className="wl-info">
        <p className="wl-title">{movie.title}</p>
        <p className="wl-sub">{movie.genre?.[0] ?? "—"} · {movie.release_year}</p>
      </div>
    </Link>
  );
}

// ── PAYMENT ROW (matches Payments tab in mobile app) ──────────────────────

function PaymentRow({ payment, movieTitle }: { payment: Payment; movieTitle?: string }) {
  const color = statusColor(payment.status);

  return (
    <div className="pay-row">
      <div className="pay-thumb">
        <CreditCard size={16} color="rgba(255,255,255,0.2)" />
      </div>

      <div className="pay-info">
        <p className="pay-title">{movieTitle ?? payment.movieId}</p>
        <p className="pay-date">{ago(payment.$createdAt)}</p>
      </div>

      <div className="pay-right">
        <span className="pay-status" style={{ color, borderColor: `${color}33`, background: `${color}12` }}>
          {payment.status.toUpperCase()}
        </span>
        <span className="pay-amount">KES {payment.amount.toLocaleString()}</span>
      </div>
    </div>
  );
}

// ── SKELETON ──────────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <div className="sk-list">
      {[1, 2, 3].map((i) => (
        <div key={i} className="sk-row">
          <div className="sk-thumb shimmer" />
          <div className="sk-lines">
            <div className="sk-line sk-line--lg shimmer" />
            <div className="sk-line sk-line--sm shimmer" />
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
    <div className="empty">
      <div className="empty-icon"><Icon size={26} color="rgba(255,255,255,0.1)" /></div>
      <p className="empty-title">{title}</p>
      <p className="empty-sub">{sub}</p>
      <Link href="/dashboard/movies" className="empty-cta">Browse Movies</Link>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="empty">
      <div className="empty-icon"><AlertCircle size={26} color="rgba(229,9,20,0.5)" /></div>
      <p className="empty-title">Failed to load</p>
      <p className="empty-sub">{message}</p>
      <button className="empty-cta" onClick={onRetry}>
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

  // Wishlist entries — entries with isWishlisted === true
  // We'll derive these from watchHistory + continueWatching entries — 
  // actually we need all entries. For now use purchased to avoid extra fetch.
  // In a full impl you'd add getAllEntries to the hook. We filter from available data.
  const wishlistEntries = [
    ...continueWatching.map((w) => ({ ...w.entry, movie: w.movie })),
    ...watchHistory.map((w) => ({ ...w.entry, movie: w.movie })),
  ].filter((e) => e.isWishlisted);

  const tabCounts = {
    continue: continueWatching.length,
    wishlist: wishlistEntries.length,
    payments: payments.length,
  };

  const loading = libLoading || payLoading;
  const error = libError || payError;
  const refetch = async () => { await Promise.all([refetchLib(), refetchPay()]); };

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

          <div className="page-body" style={{ padding: isSmall ? "20px 16px 100px" : "28px 24px 72px" }}>

            {/* Header */}
            <div className="page-hd">
              <div>
                <h1 className="page-title">My List</h1>
                <p className="page-sub">Your personal collection</p>
              </div>
              <button className="refetch-btn" onClick={refetch} title="Refresh">
                <RefreshCw size={14} />
              </button>
            </div>

            {/* Tabs — pill style matching mobile app */}
            <div className="tabs-bar">
              {TABS.map((t) => {
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    className={`tab-btn${active ? " tab-btn--active" : ""}`}
                    onClick={() => setTab(t.id)}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Stats */}
            {!loading && !error && (
              <StatsBar
                owned={stats.owned}
                watching={stats.inProgress}
                wishlistCount={wishlistEntries.length}
                spent={0}
              />
            )}

            {/* Section label */}
            {!loading && !error && tab === "continue" && continueWatching.length > 0 && (
              <p className="section-label">Continue Watching</p>
            )}

            {/* Content */}
            {loading ? (
              <SkeletonRows />
            ) : error ? (
              <ErrorState message={error} onRetry={refetch} />
            ) : (
              <div className={`tab-body${mounted ? " tab-body--in" : ""}`}>

                {/* ── CONTINUE WATCHING ── */}
                {tab === "continue" && (
                  continueWatching.length === 0
                    ? <EmptyState tab="continue" />
                    : (
                      <div className="cw-list">
                        {continueWatching.map((item) => (
                          <ContinueRow key={item.entry.$id} item={item} />
                        ))}
                      </div>
                    )
                )}

                {/* ── WISHLIST ── */}
                {tab === "wishlist" && (
                  wishlistEntries.length === 0
                    ? <EmptyState tab="wishlist" />
                    : (
                      <div className="wl-grid" style={{ gridTemplateColumns: `repeat(${isMobile ? 2 : isSmall ? 2 : 3}, 1fr)` }}>
                        {wishlistEntries.map((entry) => (
                          <WishlistCard key={entry.$id} entry={entry} />
                        ))}
                      </div>
                    )
                )}

                {/* ── PAYMENTS ── */}
                {tab === "payments" && (
                  payments.length === 0
                    ? <EmptyState tab="payments" />
                    : (
                      <div className="pay-list">
                        {payments.map((p) => (
                          <PaymentRow key={p.$id} payment={p} />
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
    display: flex; align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 18px; gap: 12px;
  }
  .page-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(1.6rem, 4vw, 2.2rem);
    font-weight: 800; letter-spacing: -0.025em;
    color: #fff; margin: 0 0 2px; line-height: 1;
  }
  .page-sub {
    font-family: 'Outfit', sans-serif;
    font-size: 12px; color: rgba(255,255,255,0.25); margin: 0;
  }
  .refetch-btn {
    background: transparent; border: none;
    cursor: pointer; color: rgba(255,255,255,0.3);
    padding: 4px; margin-top: 2px;
    transition: color 0.15s;
    display: flex; align-items: center;
  }
  .refetch-btn:hover { color: rgba(255,255,255,0.6); }

  /* ── Tabs — pill style matching mobile ── */
  .tabs-bar {
    display: flex; gap: 4px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 999px;
    padding: 4px;
    margin-bottom: 20px;
  }
  .tab-btn {
    flex: 1;
    padding: 9px 8px;
    border-radius: 999px; border: none; cursor: pointer;
    background: transparent;
    font-family: 'Outfit', sans-serif;
    font-size: 13px; font-weight: 500;
    color: rgba(255,255,255,0.35);
    transition: background 0.16s, color 0.16s;
    white-space: nowrap;
  }
  .tab-btn:hover { color: rgba(255,255,255,0.6); }
  .tab-btn--active {
    background: #e50914; color: #fff; font-weight: 600;
    box-shadow: 0 2px 12px rgba(229,9,20,0.35);
  }
  .tab-btn--active:hover { background: #e50914; color: #fff; }

  /* ── Stats ── */
  .stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-bottom: 20px;
  }
  .stat-cell {
    background: rgba(229,9,20,0.07);
    border: 1px solid rgba(229,9,20,0.12);
    border-radius: 12px;
    padding: 14px 8px 12px;
    display: flex; flex-direction: column;
    align-items: center; gap: 5px;
  }
  .stat-val {
    font-family: 'Syne', sans-serif;
    font-size: 1.4rem; font-weight: 700;
    color: #fff; line-height: 1;
  }
  .stat-lbl {
    font-family: 'Outfit', sans-serif;
    font-size: 9px; font-weight: 500;
    letter-spacing: 0.05em; text-transform: uppercase;
    color: rgba(255,255,255,0.25);
  }

  /* ── Section label ── */
  .section-label {
    font-family: 'Syne', sans-serif;
    font-size: 14px; font-weight: 700;
    color: #fff; margin: 0 0 12px;
    letter-spacing: -0.01em;
  }

  /* ── Tab body ── */
  .tab-body { opacity: 0; transform: translateY(5px); transition: opacity 0.18s ease, transform 0.18s ease; }
  .tab-body--in { opacity: 1; transform: none; }

  /* ── Continue Watching rows ── */
  .cw-list { display: flex; flex-direction: column; gap: 10px; }
  .cw-row {
    display: flex; align-items: center; gap: 13px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 14px;
    padding: 10px 12px 10px 10px;
    text-decoration: none;
    transition: background 0.14s, border-color 0.14s;
    cursor: pointer;
  }
  .cw-row:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); }

  .cw-thumb {
    width: 56px; height: 78px; border-radius: 8px;
    overflow: hidden; flex-shrink: 0;
    background: #161620; position: relative;
  }
  .cw-img {
    width: 100%; height: 100%; object-fit: cover; display: block;
  }
  .cw-thumb-overlay {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0.3);
    display: flex; align-items: center; justify-content: center;
  }
  .cw-play-sm {
    width: 22px; height: 22px; border-radius: 50%;
    background: rgba(229,9,20,0.9);
    display: flex; align-items: center; justify-content: center;
  }
  .cw-prog-bar {
    position: absolute; bottom: 0; left: 0; right: 0;
    height: 3px; background: rgba(255,255,255,0.1);
  }
  .cw-prog-fill {
    height: 100%; background: #e50914;
    border-radius: 0 2px 2px 0;
    transition: width 0.4s ease;
  }

  .cw-info { flex: 1; min-width: 0; }
  .cw-title {
    font-family: 'Outfit', sans-serif;
    font-size: 13px; font-weight: 600;
    color: rgba(255,255,255,0.9);
    margin: 0 0 3px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .cw-sub {
    font-family: 'Outfit', sans-serif;
    font-size: 10.5px; color: rgba(255,255,255,0.25);
    margin: 0 0 8px;
  }
  .cw-progress-row {
    display: flex; align-items: center; gap: 7px;
    margin-bottom: 4px;
  }
  .cw-track {
    flex: 1; height: 3px; border-radius: 99px;
    background: rgba(255,255,255,0.08);
    overflow: hidden;
  }
  .cw-fill {
    height: 100%; background: linear-gradient(90deg, #e50914, #ff3a46);
    border-radius: 99px;
    transition: width 0.4s ease;
  }
  .cw-pct {
    font-family: 'Outfit', sans-serif;
    font-size: 10px; font-weight: 700;
    color: rgba(255,255,255,0.3); flex-shrink: 0;
  }
  .cw-remain {
    font-family: 'Outfit', sans-serif;
    font-size: 10px; color: rgba(255,255,255,0.2); margin: 0;
  }
  .cw-play-btn {
    width: 32px; height: 32px; border-radius: 50%;
    background: #e50914; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 16px rgba(229,9,20,0.4);
    transition: transform 0.13s;
  }
  .cw-row:hover .cw-play-btn { transform: scale(1.07); }

  /* ── Wishlist grid ── */
  .wl-grid {
    display: grid; gap: 10px;
  }
  .wl-card {
    border-radius: 10px; overflow: hidden;
    background: #0c0c10;
    border: 1px solid rgba(255,255,255,0.05);
    text-decoration: none;
    cursor: pointer;
    display: block;
    transition: transform 0.18s ease, border-color 0.18s ease;
  }
  .wl-card:hover { transform: translateY(-2px); border-color: rgba(255,255,255,0.1); }
  .wl-poster {
    position: relative; aspect-ratio: 2/3;
    background: #161620; overflow: hidden;
  }
  .wl-img {
    width: 100%; height: 100%; object-fit: cover; display: block;
    transition: transform 0.35s ease;
  }
  .wl-img--zoom { transform: scale(1.05); }
  .wl-badge-rat {
    position: absolute; top: 6px; left: 6px;
    display: flex; align-items: center; gap: 3px;
    background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
    border-radius: 6px; padding: 3px 7px;
    font-family: 'Outfit', sans-serif;
    font-size: 10px; font-weight: 700; color: #fff;
    border: 1px solid rgba(255,255,255,0.08);
  }
  .wl-badge-bm {
    position: absolute; top: 6px; right: 6px;
    width: 26px; height: 26px; border-radius: 6px;
    background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
    border: 1px solid rgba(255,255,255,0.1);
    display: flex; align-items: center; justify-content: center;
  }
  .wl-play {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.15s;
    background: rgba(0,0,0,0.35);
  }
  .wl-play--on { opacity: 1; }
  .wl-play-circle {
    width: 42px; height: 42px; border-radius: 50%;
    background: #e50914;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 24px rgba(229,9,20,0.5);
  }
  .wl-lock {
    position: absolute; bottom: 8px; right: 8px;
    background: rgba(0,0,0,0.6); border-radius: 5px;
    padding: 3px 5px;
  }
  .wl-info { padding: 8px 9px 10px; }
  .wl-title {
    font-family: 'Outfit', sans-serif;
    font-size: 12px; font-weight: 600;
    color: rgba(255,255,255,0.85);
    margin: 0 0 3px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .wl-sub {
    font-family: 'Outfit', sans-serif;
    font-size: 10px; color: rgba(255,255,255,0.2); margin: 0;
  }

  /* ── Payment rows ── */
  .pay-list { display: flex; flex-direction: column; gap: 8px; }
  .pay-row {
    display: flex; align-items: center; gap: 12px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 12px;
    padding: 12px 14px;
  }
  .pay-thumb {
    width: 40px; height: 40px; border-radius: 9px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.06);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .pay-info { flex: 1; min-width: 0; }
  .pay-title {
    font-family: 'Outfit', sans-serif;
    font-size: 12.5px; font-weight: 600;
    color: rgba(255,255,255,0.8);
    margin: 0 0 3px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .pay-date {
    font-family: 'Outfit', sans-serif;
    font-size: 10px; color: rgba(255,255,255,0.22); margin: 0;
  }
  .pay-right {
    display: flex; flex-direction: column; align-items: flex-end;
    gap: 4px; flex-shrink: 0;
  }
  .pay-status {
    font-family: 'Outfit', sans-serif;
    font-size: 8.5px; font-weight: 700; letter-spacing: 0.06em;
    padding: 2px 8px; border-radius: 99px;
    border: 1px solid transparent;
  }
  .pay-amount {
    font-family: 'Syne', sans-serif;
    font-size: 12px; font-weight: 700; color: #fff;
  }

  /* ── Skeleton ── */
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  .shimmer {
    background: linear-gradient(90deg,
      rgba(255,255,255,0) 0%,
      rgba(255,255,255,0.04) 50%,
      rgba(255,255,255,0) 100%
    );
    background-size: 600px 100%;
    animation: shimmer 1.5s ease-in-out infinite;
  }
  .sk-list { display: flex; flex-direction: column; gap: 10px; }
  .sk-row {
    display: flex; gap: 13px; align-items: center;
    padding: 10px; border-radius: 14px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.04);
  }
  .sk-thumb { width: 56px; height: 78px; border-radius: 8px; flex-shrink: 0; }
  .sk-lines { flex: 1; display: flex; flex-direction: column; gap: 8px; }
  .sk-line { height: 10px; border-radius: 6px; }
  .sk-line--lg { width: 70%; }
  .sk-line--sm { width: 45%; }

  /* ── Empty / Error ── */
  .empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 50px 24px; text-align: center;
  }
  .empty-icon {
    width: 56px; height: 56px; border-radius: 14px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 14px;
  }
  .empty-title {
    font-family: 'Syne', sans-serif;
    font-size: 1rem; font-weight: 700;
    color: rgba(255,255,255,0.6);
    margin: 0 0 7px;
  }
  .empty-sub {
    font-family: 'Outfit', sans-serif;
    font-size: 12px; color: rgba(255,255,255,0.2);
    margin: 0 0 20px; max-width: 230px; line-height: 1.6;
  }
  .empty-cta {
    display: inline-flex; align-items: center;
    padding: 9px 22px;
    background: #e50914; border-radius: 999px;
    font-family: 'Outfit', sans-serif;
    font-size: 12px; font-weight: 600;
    color: #fff; text-decoration: none; border: none; cursor: pointer;
    transition: background 0.14s, transform 0.14s;
  }
  .empty-cta:hover { background: #ff1f2b; transform: translateY(-1px); }
`;