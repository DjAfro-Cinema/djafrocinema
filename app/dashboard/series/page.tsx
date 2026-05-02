"use client";

// app/dashboard/series/page.tsx

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X, Tv, Star, Flame, Layers } from "lucide-react";

import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import { useAuth }            from "@/hooks/useAuth";
import { useTheme }           from "@/context/ThemeContext";
import { usePremiumGate }     from "@/context/PremiumGateContext";

import DashboardSidebar   from "@/components/dashboard/sidebar/DashboardSidebar";
import MobileBottomNav    from "@/components/dashboard/mobile/MobileBottomNav";
import MovieBanner        from "@/components/dashboard/movie-banner/MovieBanner";
import { MovieRow, MovieGrid } from "@/components/dashboard/movie-card/MovieCard";
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
import type { Series }        from "@/types/series.types";
import type { MovieCardData } from "@/components/dashboard/movie-card/MovieCard";
import type { BannerMovie }   from "@/components/dashboard/movie-banner/MovieBanner";

// ── Mappers ───────────────────────────────────────────────────────────────────

function toCardData(s: Series): MovieCardData {
  return {
    id:       s.$id,
    title:    s.title,
    genre:    s.genre[0] ?? "Series",
    year:     parseInt(s.release_year ?? "2024"),
    rating:   s.rating.toFixed(1),
    duration: `${s.total_episodes} eps`,
    premium:  s.premium_only,
    img:      s.poster_url ?? "/images/placeholder.jpg",
  };
}

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
    duration:    `${s.total_episodes} episodes · ${s.total_seasons} season${s.total_seasons !== 1 ? "s" : ""}`,
    kenBurns:    KB[Math.floor(Math.random() * KB.length)],
    premium:     s.premium_only,
  };
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
        <div className="dj-sk" style={{ width: 3, height: 18, background: t.bgElevated }} />
        <div className="dj-sk" style={{ width: 200, height: 22, background: t.bgElevated }} />
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ position: "relative", width: 180, minWidth: 180, height: 260, background: t.bgSurface, overflow: "hidden", flexShrink: 0 }}>
            <div className="dj-shimmer" />
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
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: `${t.bgBase}d9`, backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: `1px solid ${t.borderAccent}`, borderRadius: 12, boxShadow: `0 8px 32px rgba(0,0,0,0.5)` }}>
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

function MobileSearchOverlay({ open, val, onChange, onClose }: { open: boolean; val: string; onChange: (v: string) => void; onClose: () => void }) {
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

function SectionHead({ eyebrow, title, viewAll }: { eyebrow?: string; title: string; viewAll?: string }) {
  const { t } = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18 }}>
      <div>
        {eyebrow && <span style={{ fontSize: 9, letterSpacing: "0.45em", textTransform: "uppercase", color: t.accent, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", display: "block", marginBottom: 4 }}>{eyebrow}</span>}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 3, height: 18, background: t.accent, boxShadow: `0 0 8px ${t.accentGlow}` }} />
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.2rem, 2.5vw, 1.7rem)", letterSpacing: "0.07em", color: t.textPrimary, margin: 0 }}>{title}</h2>
        </div>
      </div>
      {viewAll && (
        <Link href={viewAll} style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: t.textMuted, textDecoration: "none", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>View All →</Link>
      )}
    </div>
  );
}

// ── Genre Filter ──────────────────────────────────────────────────────────────

function GenreFilter({ genres, active, onChange }: { genres: string[]; active: string; onChange: (g: string) => void }) {
  const { t } = useTheme();
  return (
    <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 24, scrollbarWidth: "none" }}>
      {["All", ...genres].map(g => (
        <button key={g} onClick={() => onChange(g)} style={{ flexShrink: 0, fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", padding: "7px 18px", cursor: "pointer", fontWeight: 600, border: `1px solid ${active === g ? t.accent : t.borderSubtle}`, background: active === g ? t.accent : "transparent", color: active === g ? t.textOnAccent : t.textMuted, fontFamily: "'DM Sans', sans-serif", transition: "all 0.18s", borderRadius: 4 }}>{g}</button>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SeriesPage() {
  const layout      = useDashboardLayout();
  const { user }    = useAuth();
  const { requestPlay } = usePremiumGate();
  const { t }       = useTheme();
  const router      = useRouter();

  const userName = user?.name || user?.email?.split("@")[0] || "Guest";
  const userObj  = { name: userName, email: user?.email ?? "" };

  const {
    isMobile, isSmall,
    sidebarCollapsed, setSidebarCollapsed,
    searchOpen, setSearchOpen,
    searchVal, setSearchVal,
  } = layout;

  const featured    = useFeaturedSeries(6);
  const trending    = useTrendingSeries(20);
  const latest      = useLatestSeries(20);
  const topRated    = useTopRatedSeries(20);
  const allSeries   = useSeries();
  const genreData   = useAllSeriesGenres();
  const [activeGenre, setActiveGenre] = useState("All");
  const exploreSeries = useSeries({ genre: activeGenre === "All" ? undefined : activeGenre });

  const { playerState, closePlayer } = useVideoPlayer();

  useEffect(() => { seriesService.warmCache?.(); }, []);

  // ── KEY FIX: always navigate to /dashboard/series/[id] ───────────────────
  const navigateToSeries = useCallback((seriesId: string) => {
    router.push(`/dashboard/series/${seriesId}`);
  }, [router]);

  const handleCardClick = useCallback((card: MovieCardData) => {
    const full = allSeries.series.find(s => s.$id === card.id);
    if (!full) {
      // fallback — navigate anyway
      navigateToSeries(card.id);
      return;
    }

    if (full.premium_only) {
      requestPlay({
        movieId:    full.$id,
        movieTitle: full.title,
        posterUrl:  full.poster_url ?? undefined,
        isPremium:  true,
        videoUrl:   undefined,
        onUnlocked: (id: string) => navigateToSeries(id),
      });
    } else {
      navigateToSeries(full.$id);
    }
  }, [allSeries.series, requestPlay, navigateToSeries]);

  const handleBannerPlay = useCallback((banner: BannerMovie) => {
    navigateToSeries(banner.id);
  }, [navigateToSeries]);

  const initialLoading = featured.loading && trending.loading && latest.loading;
  const bannerSeries   = featured.items.map(toBannerMovie);
  const trendingCards  = trending.items.map(toCardData);
  const latestCards    = latest.items.map(toCardData);
  const topRatedCards  = topRated.items.map(toCardData);
  const exploreCards   = exploreSeries.series.map(toCardData);

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
              <div style={{ position: "relative", flexShrink: 0 }}>
                {bannerSeries.length > 0 && (
                  <MovieBanner movies={bannerSeries} onPlay={handleBannerPlay} userId={user?.$id ?? ""} />
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
                {/* Page Header */}
                <div style={{ marginBottom: 32 }}>
                  <p style={{ fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", color: t.textMuted, margin: "0 0 5px", fontFamily: "'DM Sans', sans-serif" }}>Browse All</p>
                  <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 2.8rem)", color: t.textPrimary, letterSpacing: "0.04em", lineHeight: 1, margin: 0, display: "flex", alignItems: "center", gap: 12 }}>
                    TV Series
                    <Tv size={28} color={t.accent} strokeWidth={1.5} style={{ opacity: 0.7 }} />
                  </h1>
                </div>

                <StatsWidget isMobile={isMobile} seriesCount={allSeries.total} />

                <section style={{ marginBottom: 48 }}>
                  <SectionHead eyebrow="Most Watched This Week" title="Trending Series" />
                  {trending.loading ? <SkeletonRow /> : trendingCards.length > 0
                    ? <MovieRow title="" movies={trendingCards} onPlay={handleCardClick} viewAllHref="/dashboard/series" userId={user?.$id ?? ""} />
                    : <EmptyRow label="trending series" />}
                </section>

                <section style={{ marginBottom: 48 }}>
                  <SectionHead eyebrow="Just Added" title="New Series" />
                  {latest.loading ? <SkeletonRow /> : latestCards.length > 0
                    ? <MovieRow title="" movies={latestCards} onPlay={handleCardClick} viewAllHref="/dashboard/series" userId={user?.$id ?? ""} />
                    : <EmptyRow label="new series" />}
                </section>

                <div style={{ width: "100%", height: 1, background: `linear-gradient(90deg, transparent, ${t.borderAccent}, transparent)`, margin: "0 0 44px" }} />

                <section style={{ marginBottom: 48 }}>
                  <SectionHead eyebrow="Highest Rated" title="Top Rated Series" />
                  {topRated.loading ? <SkeletonRow /> : topRatedCards.length > 0
                    ? <MovieRow title="" movies={topRatedCards} onPlay={handleCardClick} viewAllHref="/dashboard/series" userId={user?.$id ?? ""} />
                    : <EmptyRow label="top rated series" />}
                </section>

                <section style={{ marginBottom: 80 }}>
                  <SectionHead eyebrow="Find Something New" title="Explore by Genre" />
                  <GenreFilter genres={genreData.genres} active={activeGenre} onChange={setActiveGenre} />
                  {exploreSeries.loading ? <SkeletonRow /> : exploreCards.length > 0
                    ? <MovieGrid movies={exploreCards} onPlay={handleCardClick} userId={user?.$id ?? ""} />
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
        .dj-sk { background:var(--dj-bg-elevated);position:relative;overflow:hidden;display:block; }
        .dj-sk::after { content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,0.04) 50%,rgba(255,255,255,0) 100%);background-size:700px 100%;animation:djShimmer 1.6s ease-in-out infinite; }
      `}</style>
    </>
  );
}