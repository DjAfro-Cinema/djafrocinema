"use client";

// app/dashboard/series/page.tsx
// Self-contained series cards — no MovieCard import.
// Every card click and info-icon click routes to /dashboard/series/[id].

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search, X, Tv, Star, Flame, Layers,
  Play, Lock, Info,
} from "lucide-react";

import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import { useAuth }            from "@/hooks/useAuth";
import { useTheme }           from "@/context/ThemeContext";
import { usePremiumGate }     from "@/context/PremiumGateContext";

import DashboardSidebar from "@/components/dashboard/sidebar/DashboardSidebar";
import MobileBottomNav  from "@/components/dashboard/mobile/MobileBottomNav";
import MovieBanner      from "@/components/dashboard/movie-banner/MovieBanner";
import VideoPlayer, { useVideoPlayer } from "@/components/dashboard/video-player/VideoPlayer";

import {
  useFeaturedSeries,
  useTrendingSeries,
  useLatestSeries,
  useTopRatedSeries,
  useSeries,
  useAllSeriesGenres,
} from "@/hooks/useSeries";
import { seriesService } from "@/services/series.service";
import type { Series }      from "@/types/series.types";
import type { BannerMovie } from "@/components/dashboard/movie-banner/MovieBanner";

// ── Banner mapper ─────────────────────────────────────────────────────────────

function toBannerMovie(s: Series): BannerMovie {
  const KB = ["zoom-in-right", "zoom-in-left", "zoom-out"] as const;
  return {
    id:          s.$id,
    title:       s.title,
    genre:       s.genre.join(" · "),
    year:        s.release_year ?? "2024",
    rating:      s.rating.toFixed(1),
    tag:         s.is_trending ? "TRENDING" : "SERIES",
    description: s.description ?? s.ai_summary ?? "",
    img:         s.banner_url ?? s.poster_url ?? "/images/placeholder.jpg",
    duration:    `${s.total_episodes} eps · ${s.total_seasons} season${s.total_seasons !== 1 ? "s" : ""}`,
    kenBurns:    KB[Math.floor(Math.random() * KB.length)],
    premium:     s.premium_only,
    detailHref:  `/dashboard/series/${s.$id}`,
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// SeriesCard — self-contained card with Play + Info icons
// onPlay  → premium gate then navigate to /dashboard/series/[id]
// onInfo  → navigate directly to /dashboard/series/[id]
// ═════════════════════════════════════════════════════════════════════════════

interface SeriesCardProps {
  series: Series;
  onPlay: (s: Series) => void;
  onInfo: (s: Series) => void;
}

function SeriesCard({ series, onPlay, onInfo }: SeriesCardProps) {
  const { t } = useTheme();
  const [hovered, setHovered] = useState(false);

  const img = series.poster_url ?? series.banner_url ?? "/images/placeholder.jpg";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position:     "relative",
        width:        "100%",
        flexShrink:   0,
        cursor:       "pointer",
        borderRadius: 8,
        overflow:     "hidden",
        background:   t.bgSurface,
        transition:   "transform 0.2s ease, box-shadow 0.2s ease",
        transform:    hovered ? "translateY(-4px) scale(1.02)" : "none",
        boxShadow:    hovered ? "0 12px 40px rgba(0,0,0,0.55)" : "none",
      }}
      onClick={() => onPlay(series)}
    >
      {/* Poster — 2:3 aspect ratio */}
      <div style={{ position: "relative", width: "100%", paddingBottom: "148%" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img}
          alt={series.title}
          style={{
            position:   "absolute",
            inset:      0,
            width:      "100%",
            height:     "100%",
            objectFit:  "cover",
            display:    "block",
            transition: "filter 0.2s ease",
            filter:     hovered ? "brightness(0.5)" : "brightness(0.85)",
          }}
        />

        {/* Bottom gradient */}
        <div style={{
          position:   "absolute",
          bottom:     0,
          left:       0,
          right:      0,
          height:     "55%",
          background: `linear-gradient(to top, ${t.bgBase}f2 0%, transparent 100%)`,
        }} />

        {/* Premium badge */}
        {series.premium_only && (
          <div style={{
            position:    "absolute",
            top:         8,
            left:        8,
            display:     "flex",
            alignItems:  "center",
            gap:         3,
            background:  t.accent,
            borderRadius: 4,
            padding:     "2px 7px",
          }}>
            <Lock size={9} color={t.textOnAccent} />
            <span style={{ fontSize: 8, color: t.textOnAccent, fontFamily: "'DM Sans',sans-serif", fontWeight: 700, letterSpacing: "0.08em" }}>PRO</span>
          </div>
        )}

        {/* Rating badge */}
        {series.rating > 0 && (
          <div style={{
            position:    "absolute",
            top:         8,
            right:       8,
            display:     "flex",
            alignItems:  "center",
            gap:         3,
            background:  "rgba(0,0,0,0.65)",
            backdropFilter: "blur(6px)",
            borderRadius: 4,
            padding:     "2px 6px",
          }}>
            <Star size={9} color="#fbbf24" fill="#fbbf24" />
            <span style={{ fontSize: 9, color: "#fbbf24", fontFamily: "'DM Sans',sans-serif", fontWeight: 700 }}>{series.rating.toFixed(1)}</span>
          </div>
        )}

        {/* Hover action buttons — Play + Info */}
        <div style={{
          position:       "absolute",
          inset:          0,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          gap:            10,
          opacity:        hovered ? 1 : 0,
          transition:     "opacity 0.18s ease",
        }}>
          {/* Play */}
          <button
            onClick={e => { e.stopPropagation(); onPlay(series); }}
            style={{
              width:          44,
              height:         44,
              borderRadius:   "50%",
              background:     t.accent,
              border:         "none",
              cursor:         "pointer",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              boxShadow:      `0 4px 16px ${t.accentGlow}`,
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.12)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Play size={18} color={t.textOnAccent} fill={t.textOnAccent} />
          </button>

          {/* Info — navigates directly to /dashboard/series/[id] */}
          <button
            onClick={e => { e.stopPropagation(); onInfo(series); }}
            style={{
              width:          40,
              height:         40,
              borderRadius:   "50%",
              background:     "rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
              border:         "1px solid rgba(255,255,255,0.3)",
              cursor:         "pointer",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.28)"; e.currentTarget.style.transform = "scale(1.12)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; e.currentTarget.style.transform = "scale(1)"; }}
          >
            <Info size={16} color="#fff" />
          </button>
        </div>

        {/* Bottom meta — always visible */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 10px 10px" }}>
          <p style={{
            margin:        0,
            fontFamily:    "var(--font-display)",
            fontSize:      "clamp(0.7rem,1.2vw,0.85rem)",
            color:         t.textPrimary,
            letterSpacing: "0.04em",
            lineHeight:    1.2,
            whiteSpace:    "nowrap",
            overflow:      "hidden",
            textOverflow:  "ellipsis",
          }}>
            {series.title}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4, flexWrap: "wrap" }}>
            {series.release_year && (
              <span style={{ fontSize: 9, color: t.textMuted, fontFamily: "'DM Sans',sans-serif" }}>
                {series.release_year}
              </span>
            )}
            {series.release_year && (
              <span style={{ fontSize: 9, color: t.borderAccent }}>·</span>
            )}
            <span style={{ fontSize: 9, color: t.textMuted, fontFamily: "'DM Sans',sans-serif" }}>
              {series.total_episodes} eps
            </span>
            <span style={{ fontSize: 9, color: t.borderAccent }}>·</span>
            <span style={{ fontSize: 9, color: t.accent, fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>
              {series.genre[0] ?? "Series"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// SeriesRow — horizontal scrolling strip
// ═════════════════════════════════════════════════════════════════════════════

function SeriesRow({ items, onPlay, onInfo }: { items: Series[]; onPlay: (s: Series) => void; onInfo: (s: Series) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      style={{
        display:         "flex",
        gap:             14,
        overflowX:       "auto",
        overflowY:       "visible",
        paddingBottom:   10,
        paddingTop:      4,
        scrollbarWidth:  "none",
        msOverflowStyle: "none",
      }}
    >
      {items.map(s => (
        <div key={s.$id} style={{ width: 160, minWidth: 160, flexShrink: 0 }}>
          <SeriesCard series={s} onPlay={onPlay} onInfo={onInfo} />
        </div>
      ))}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// SeriesGrid — responsive grid for explore section
// ═════════════════════════════════════════════════════════════════════════════

function SeriesGrid({ items, onPlay, onInfo }: { items: Series[]; onPlay: (s: Series) => void; onInfo: (s: Series) => void }) {
  return (
    <div style={{
      display:             "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))",
      gap:                 14,
    }}>
      {items.map(s => (
        <SeriesCard key={s.$id} series={s} onPlay={onPlay} onInfo={onInfo} />
      ))}
    </div>
  );
}

// ── Skeletons ─────────────────────────────────────────────────────────────────

function SkeletonBanner() {
  const { t } = useTheme();
  return (
    <div style={{ position: "relative", width: "100%", height: "min(80vh, 680px)", background: t.bgSurface, overflow: "hidden" }}>
      <div className="dj-shimmer" />
    </div>
  );
}

function SkeletonRow() {
  const { t } = useTheme();
  return (
    <div style={{ marginBottom: 44 }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 18, alignItems: "center" }}>
        <div className="dj-sk" style={{ width: 3, height: 18 }} />
        <div className="dj-sk" style={{ width: 200, height: 22 }} />
      </div>
      <div style={{ display: "flex", gap: 14 }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} style={{ width: 160, minWidth: 160, flexShrink: 0 }}>
            <div style={{ position: "relative", width: "100%", paddingBottom: "148%", background: t.bgSurface, borderRadius: 8, overflow: "hidden" }}>
              <div className="dj-shimmer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyRow({ label }: { label: string }) {
  const { t } = useTheme();
  return (
    <div style={{ padding: "32px 0", textAlign: "center", color: t.textMuted, fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
      No {label} yet.
    </div>
  );
}

// ── Floating Desktop Search ───────────────────────────────────────────────────

function FloatingSearch({ searchOpen, searchVal, onSearchOpen, onSearchClose, onSearchChange }: {
  searchOpen: boolean; searchVal: string;
  onSearchOpen: () => void; onSearchClose: () => void; onSearchChange: (v: string) => void;
}) {
  const { t } = useTheme();
  return (
    <div style={{ position: "absolute", top: 20, right: 28, zIndex: 810, width: searchOpen ? 320 : 200, transition: "width 0.25s cubic-bezier(0.25,1,0.5,1)" }}>
      {searchOpen ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: `${t.bgBase}d9`, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: `1px solid ${t.borderAccent}`, borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
          <Search size={13} color={t.textMuted} strokeWidth={1.8} />
          <input autoFocus value={searchVal} onChange={e => onSearchChange(e.target.value)} placeholder="Search series…" style={{ flex: 1, background: "transparent", border: "none", color: t.textPrimary, fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none" }} />
          <button onClick={onSearchClose} style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted, display: "flex", padding: 0 }}><X size={12} /></button>
        </div>
      ) : (
        <button onClick={onSearchOpen} style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 14px", width: "100%", background: `${t.bgBase}99`, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid ${t.borderSubtle}`, borderRadius: 12, cursor: "pointer", color: t.textMuted, fontSize: 12.5, fontFamily: "'DM Sans', sans-serif", boxShadow: "0 4px 20px rgba(0,0,0,0.4)", transition: "border-color 0.18s" }}>
          <Search size={13} strokeWidth={1.8} />
          <span style={{ flex: 1, textAlign: "left" }}>Search series…</span>
          <kbd style={{ fontSize: 9, padding: "2px 6px", border: `1px solid ${t.borderSubtle}`, borderRadius: 5, color: t.textMuted, fontFamily: "monospace", background: "transparent" }}>⌘K</kbd>
        </button>
      )}
    </div>
  );
}

// ── Mobile Search Overlay ─────────────────────────────────────────────────────

function MobileSearchOverlay({ open, val, onChange, onClose }: {
  open: boolean; val: string; onChange: (v: string) => void; onClose: () => void;
}) {
  const { t } = useTheme();
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: `${t.bgBase}f7`, backdropFilter: "blur(20px)", display: "flex", flexDirection: "column", padding: "20px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: t.navHoverBg, border: `1px solid ${t.borderAccent}`, borderRadius: 12 }}>
          <Search size={15} color={t.textMuted} strokeWidth={1.8} />
          <input autoFocus value={val} onChange={e => onChange(e.target.value)} placeholder="Search series, genres…" style={{ flex: 1, background: "transparent", border: "none", color: t.textPrimary, fontSize: 15, fontFamily: "'DM Sans', sans-serif", outline: "none" }} />
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: t.textSecondary, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
      </div>
      <p style={{ fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase", color: t.textMuted, marginBottom: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>Popular</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {["Action", "Drama", "Thriller", "Romance", "Crime", "Sci-Fi"].map(genre => (
          <button key={genre} onClick={() => onChange(genre)} style={{ padding: "8px 14px", border: `1px solid ${t.borderSubtle}`, borderRadius: 99, background: t.navHoverBg, color: t.textSecondary, fontSize: 12, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>{genre}</button>
        ))}
      </div>
    </div>
  );
}

// ── Stats Widget ──────────────────────────────────────────────────────────────

function StatsWidget({ isMobile, seriesCount }: { isMobile: boolean; seriesCount: number }) {
  const { t } = useTheme();
  const items = [
    { Icon: Tv,     val: seriesCount > 0 ? `${seriesCount}+` : "…", label: "Series",   sub: "available" },
    { Icon: Star,   val: "Top",                                       label: "Rated",    sub: "picks"     },
    { Icon: Flame,  val: "Hot",                                       label: "Trending", sub: "now"       },
    { Icon: Layers, val: "New",                                       label: "Seasons",  sub: "weekly"    },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: 2, background: t.borderSubtle, borderRadius: 4, overflow: "hidden", marginBottom: 44 }}>
      {items.map(s => (
        <div key={s.label} style={{ background: t.bgSurface, padding: "20px 16px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <s.Icon size={20} color={t.accent} strokeWidth={1.5} style={{ marginBottom: 3, opacity: 0.8 }} />
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.85rem", color: t.textPrimary, letterSpacing: "0.05em", lineHeight: 1 }}>{s.val}</span>
          <span style={{ fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase", color: t.textMuted, fontFamily: "'DM Sans', sans-serif" }}>{s.label}</span>
          <span style={{ fontSize: 10, color: t.textMuted, fontFamily: "'DM Sans', sans-serif", opacity: 0.6 }}>{s.sub}</span>
        </div>
      ))}
    </div>
  );
}

// ── Section Head ──────────────────────────────────────────────────────────────

function SectionHead({ eyebrow, title }: { eyebrow?: string; title: string }) {
  const { t } = useTheme();
  return (
    <div style={{ marginBottom: 18 }}>
      {eyebrow && (
        <span style={{ fontSize: 9, letterSpacing: "0.45em", textTransform: "uppercase", color: t.accent, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", display: "block", marginBottom: 4 }}>
          {eyebrow}
        </span>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 3, height: 18, background: t.accent, boxShadow: `0 0 8px ${t.accentGlow}` }} />
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.2rem, 2.5vw, 1.7rem)", letterSpacing: "0.07em", color: t.textPrimary, margin: 0 }}>
          {title}
        </h2>
      </div>
    </div>
  );
}

// ── Genre Filter ──────────────────────────────────────────────────────────────

function GenreFilter({ genres, active, onChange }: { genres: string[]; active: string; onChange: (g: string) => void }) {
  const { t } = useTheme();
  return (
    <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 24, scrollbarWidth: "none" }}>
      {["All", ...genres].map(g => (
        <button key={g} onClick={() => onChange(g)} style={{ flexShrink: 0, fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", padding: "7px 18px", cursor: "pointer", fontWeight: 600, border: `1px solid ${active === g ? t.accent : t.borderSubtle}`, background: active === g ? t.accent : "transparent", color: active === g ? t.textOnAccent : t.textMuted, fontFamily: "'DM Sans', sans-serif", transition: "all 0.18s", borderRadius: 4 }}>
          {g}
        </button>
      ))}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Page
// ═════════════════════════════════════════════════════════════════════════════

export default function SeriesPage() {
  const layout          = useDashboardLayout();
  const { user }        = useAuth();
  const { requestPlay } = usePremiumGate();
  const { t }           = useTheme();
  const router          = useRouter();

  const userName = user?.name || user?.email?.split("@")[0] || "Guest";
  const userObj  = { name: userName, email: user?.email ?? "" };

  const {
    isMobile, isSmall,
    sidebarCollapsed, setSidebarCollapsed,
    searchOpen, setSearchOpen,
    searchVal,  setSearchVal,
  } = layout;

  const featured      = useFeaturedSeries(6);
  const trending      = useTrendingSeries(20);
  const latest        = useLatestSeries(20);
  const topRated      = useTopRatedSeries(20);
  const allSeries     = useSeries();
  const genreData     = useAllSeriesGenres();
  const [activeGenre, setActiveGenre] = useState("All");
  const exploreSeries = useSeries({ genre: activeGenre === "All" ? undefined : activeGenre });

  const { playerState, closePlayer } = useVideoPlayer();

  useEffect(() => { seriesService.warmCache?.(); }, []);

  // ── All navigation goes to /dashboard/series/[id] ─────────────────────────
  const navigateToSeries = useCallback((id: string) => {
    router.push(`/dashboard/series/${id}`);
  }, [router]);

  // onPlay — premium gate if needed, then navigate
  const handlePlay = useCallback((s: Series) => {
    if (s.premium_only) {
      requestPlay({
        movieId:    s.$id,
        movieTitle: s.title,
        posterUrl:  s.poster_url ?? undefined,
        isPremium:  true,
        videoUrl:   undefined,
        onUnlocked: (id: string) => navigateToSeries(id),
      });
    } else {
      navigateToSeries(s.$id);
    }
  }, [requestPlay, navigateToSeries]);

  // onInfo — always navigate straight to the series detail page
  const handleInfo = useCallback((s: Series) => {
    navigateToSeries(s.$id);
  }, [navigateToSeries]);

  // Banner callbacks
  const handleBannerPlay = useCallback((b: BannerMovie) => navigateToSeries(b.id), [navigateToSeries]);
  const handleBannerInfo = useCallback((b: BannerMovie) => navigateToSeries(b.id), [navigateToSeries]);

  const initialLoading = featured.loading && trending.loading && latest.loading;
  const bannerItems    = featured.items.map(toBannerMovie);

  return (
    <>
      {playerState.open && (
        <VideoPlayer
          src={playerState.src}
          title={playerState.title}
          subtitle={playerState.subtitle}
          poster={playerState.poster}
          onClose={closePlayer}
          autoPlay
        />
      )}

      {isSmall && (
        <MobileSearchOverlay
          open={searchOpen}
          val={searchVal}
          onChange={setSearchVal}
          onClose={() => { setSearchOpen(false); setSearchVal(""); }}
        />
      )}

      <div style={{ display: "flex", height: "100svh", background: t.bgBase, overflow: "hidden" }}>
        {!isSmall && (
          <DashboardSidebar
            user={userObj}
            collapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
          />
        )}

        <div
          id="dj-content-col"
          style={{ flex: 1, minWidth: 0, height: "100svh", overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column" }}
        >
          {initialLoading ? (
            <>
              <SkeletonBanner />
              <div style={{ padding: "40px 28px 0" }}>
                <SkeletonRow /><SkeletonRow />
              </div>
            </>
          ) : (
            <>
              {/* Hero banner */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                {bannerItems.length > 0 && (
                  <MovieBanner
                    movies={bannerItems}
                    onPlay={handleBannerPlay}
                    onInfo={handleBannerInfo}
                    userId={user?.$id ?? ""}
                  />
                )}
                {!isSmall && (
                  <FloatingSearch
                    searchOpen={searchOpen}
                    searchVal={searchVal}
                    onSearchOpen={() => setSearchOpen(true)}
                    onSearchClose={() => { setSearchOpen(false); setSearchVal(""); }}
                    onSearchChange={setSearchVal}
                  />
                )}
              </div>

              <div style={{ padding: isSmall ? "28px 16px 100px" : "40px 28px 80px" }}>

                {/* Page header */}
                <div style={{ marginBottom: 32 }}>
                  <p style={{ fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", color: t.textMuted, margin: "0 0 5px", fontFamily: "'DM Sans', sans-serif" }}>Browse All</p>
                  <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 2.8rem)", color: t.textPrimary, letterSpacing: "0.04em", lineHeight: 1, margin: 0, display: "flex", alignItems: "center", gap: 12 }}>
                    TV Series
                    <Tv size={28} color={t.accent} strokeWidth={1.5} style={{ opacity: 0.7 }} />
                  </h1>
                </div>

                <StatsWidget isMobile={isMobile} seriesCount={allSeries.total} />

                {/* Trending */}
                <section style={{ marginBottom: 52 }}>
                  <SectionHead eyebrow="Most Watched This Week" title="Trending Series" />
                  {trending.loading ? <SkeletonRow /> : trending.items.length > 0
                    ? <SeriesRow items={trending.items} onPlay={handlePlay} onInfo={handleInfo} />
                    : <EmptyRow label="trending series" />}
                </section>

                {/* Latest */}
                <section style={{ marginBottom: 52 }}>
                  <SectionHead eyebrow="Just Added" title="New Series" />
                  {latest.loading ? <SkeletonRow /> : latest.items.length > 0
                    ? <SeriesRow items={latest.items} onPlay={handlePlay} onInfo={handleInfo} />
                    : <EmptyRow label="new series" />}
                </section>

                <div style={{ width: "100%", height: 1, background: `linear-gradient(90deg, transparent, ${t.borderAccent}, transparent)`, margin: "0 0 44px" }} />

                {/* Top rated */}
                <section style={{ marginBottom: 52 }}>
                  <SectionHead eyebrow="Highest Rated" title="Top Rated Series" />
                  {topRated.loading ? <SkeletonRow /> : topRated.items.length > 0
                    ? <SeriesRow items={topRated.items} onPlay={handlePlay} onInfo={handleInfo} />
                    : <EmptyRow label="top rated series" />}
                </section>

                {/* Explore by genre — grid */}
                <section style={{ marginBottom: 80 }}>
                  <SectionHead eyebrow="Find Something New" title="Explore by Genre" />
                  <GenreFilter genres={genreData.genres} active={activeGenre} onChange={setActiveGenre} />
                  {exploreSeries.loading ? <SkeletonRow /> : exploreSeries.series.length > 0
                    ? <SeriesGrid items={exploreSeries.series} onPlay={handlePlay} onInfo={handleInfo} />
                    : <EmptyRow label="series in this genre" />}
                </section>

              </div>
            </>
          )}
        </div>

        {isSmall && <MobileBottomNav />}
      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html, body { background: var(--dj-bg-base); color: var(--dj-text-primary); margin: 0; padding: 0; overflow: hidden; }
        #dj-content-col::-webkit-scrollbar { display: none; }
        #dj-content-col { scrollbar-width: none; }
        @keyframes djShimmer { 0%{background-position:-700px 0} 100%{background-position:700px 0} }
        .dj-shimmer { position:absolute;inset:0;background:linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,0.04) 50%,rgba(255,255,255,0) 100%);background-size:700px 100%;animation:djShimmer 1.6s ease-in-out infinite; }
        .dj-sk { background:var(--dj-bg-elevated);position:relative;overflow:hidden;display:block;border-radius:4px; }
        .dj-sk::after { content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,0.04) 50%,rgba(255,255,255,0) 100%);background-size:700px 100%;animation:djShimmer 1.6s ease-in-out infinite; }
      `}</style>
    </>
  );
}