"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search, X, Bell, Film, Star, Flame, Sparkles,
  TrendingUp, Sun, Sunset, Moon, Hand,
  Projector,
} from "lucide-react";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import MobileBottomNav from "@/components/dashboard/mobile/MobileBottomNav";
import DashboardSidebar from "@/components/dashboard/sidebar/DashboardSidebar";
import MovieBanner from "@/components/dashboard/movie-banner/MovieBanner";
import { MovieRow, MovieGrid } from "@/components/dashboard/movie-card/MovieCard";
import VideoPlayer, { useVideoPlayer } from "@/components/dashboard/video-player/VideoPlayer";
import type { MovieCardData } from "@/components/dashboard/movie-card/MovieCard";
import type { BannerMovie } from "@/components/dashboard/movie-banner/MovieBanner";

import { useFeaturedMovies } from "@/hooks/useFeaturedMovies";
import { useTrendingMovies } from "@/hooks/useTrendingMovies";
import { useLatestMovies }   from "@/hooks/useLatestMovies";
import { useTopRated }       from "@/hooks/useTopRated";
import { useMovies }         from "@/hooks/useMovies";
import { useAllGenres }      from "@/hooks/useAllGenres";
import { useMovie }          from "@/hooks/useMovie";
import { movieService }      from "@/services/movie.service";
import type { Movie }        from "@/types/movie.types";

// ── Data mappers ──────────────────────────────────────────────────────────────

function toCardData(m: Movie): MovieCardData {
  return {
    id:       m.$id,
    title:    m.title,
    genre:    m.genre[0] ?? "Movie",
    year:     parseInt(m.release_year ?? "2024"),
    rating:   m.rating.toFixed(1),
    duration: m.duration ?? undefined,
    premium:  m.premium_only,
    img:      m.poster_url ?? "/images/placeholder.jpg",
  };
}

function toBannerMovie(m: Movie): BannerMovie {
  const KB_OPTIONS = ["zoom-in-right", "zoom-in-left", "zoom-out"] as const;
  return {
    id:          m.$id,
    title:       m.title,
    genre:       m.genre.join(" · "),
    year:        m.release_year ?? "2024",
    rating:      m.rating.toFixed(1),
    tag:         m.is_trending ? "TRENDING" : "FEATURED",
    description: m.description ?? m.ai_summary ?? "",
    img:         m.poster_url ?? "/images/placeholder.jpg",
    duration:    m.duration ?? undefined,
    kenBurns:    KB_OPTIONS[Math.floor(Math.random() * KB_OPTIONS.length)],
  };
}

// ── Skeleton components ───────────────────────────────────────────────────────

function SkeletonBanner() {
  return (
    <div style={{ position: "relative", width: "100%", height: "min(80vh, 680px)", background: "#0c0c0e", overflow: "hidden" }}>
      <div className="dj-shimmer" />
    </div>
  );
}

function SkeletonRow() {
  return (
    <div style={{ marginBottom: 44 }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 18, alignItems: "center" }}>
        <div className="dj-sk" style={{ width: 3, height: 18 }} />
        <div className="dj-sk" style={{ width: 180, height: 22 }} />
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ position: "relative", width: 180, minWidth: 180, height: 260, background: "#0e0e10", overflow: "hidden", flexShrink: 0 }}>
            <div className="dj-shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyRow({ label }: { label: string }) {
  return (
    <div style={{ padding: "32px 0", textAlign: "center", color: "rgba(255,255,255,0.18)", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
      No {label} yet.
    </div>
  );
}

// ── Mobile Top Bar ────────────────────────────────────────────────────────────

function MobileTopBar({ onSearchOpen, notifCount = 0, userName }: { onSearchOpen: () => void; notifCount?: number; userName: string }) {
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 800, height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", background: "rgba(8,8,10,0.97)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", letterSpacing: "0.1em", display: "flex", gap: 3, lineHeight: 1 }}>
        <span style={{ color: "#e50914" }}>DJ</span>
        <span style={{ color: "#e8e8e8" }}>AFRO</span>
        <span style={{ color: "rgba(255,255,255,0.28)", marginLeft: 4 }}>CINEMA</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={onSearchOpen} style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, cursor: "pointer", color: "rgba(255,255,255,0.5)" }}>
          <Search size={15} strokeWidth={1.8} />
        </button>
        <Link href="/dashboard/notifications" style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", textDecoration: "none", color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10 }}>
          <Bell size={15} strokeWidth={1.8} />
          {notifCount > 0 && <span style={{ position: "absolute", top: 6, right: 6, width: 7, height: 7, background: "#e50914", borderRadius: "50%", boxShadow: "0 0 6px rgba(229,9,20,0.7)" }} />}
        </Link>
        <Link href="/dashboard/profile" style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(145deg, #e50914, #8b060d)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", textDecoration: "none", fontFamily: "'DM Sans', sans-serif", boxShadow: "0 0 0 2px rgba(229,9,20,0.2)", letterSpacing: "0.03em" }}>
          {userName[0]?.toUpperCase()}
        </Link>
      </div>
    </header>
  );
}

// ── Desktop Top Bar ───────────────────────────────────────────────────────────

function DesktopTopBar({ scrolled, searchOpen, searchVal, onSearchOpen, onSearchClose, onSearchChange, notifCount, userName }: {
  scrolled: boolean; searchOpen: boolean; searchVal: string;
  onSearchOpen: () => void; onSearchClose: () => void; onSearchChange: (v: string) => void;
  notifCount: number; userName: string;
}) {
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 800, height: 62, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", background: scrolled ? "rgba(8,8,10,0.97)" : "transparent", backdropFilter: scrolled ? "blur(20px)" : "none", borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none", transition: "background 0.3s, backdrop-filter 0.3s, border-bottom 0.3s", flexShrink: 0 }}>
      <div style={{ flex: 1, maxWidth: 380 }}>
        {searchOpen ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(229,9,20,0.25)", borderRadius: 10 }}>
            <Search size={13} color="rgba(255,255,255,0.3)" strokeWidth={1.8} />
            <input autoFocus value={searchVal} onChange={e => onSearchChange(e.target.value)} placeholder="Search movies, genres…" style={{ flex: 1, background: "transparent", border: "none", color: "#fff", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none" }} />
            <button onClick={onSearchClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", display: "flex" }}><X size={12} /></button>
          </div>
        ) : (
          <button onClick={onSearchOpen} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, cursor: "pointer", color: "rgba(255,255,255,0.28)", fontSize: 12.5, fontFamily: "'DM Sans', sans-serif" }}>
            <Search size={13} strokeWidth={1.8} />
            <span>Search movies…</span>
            <kbd style={{ marginLeft: 8, fontSize: 9, padding: "2px 6px", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 5, color: "rgba(255,255,255,0.18)", fontFamily: "monospace", background: "transparent" }}>⌘K</kbd>
          </button>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Link href="/dashboard/notifications" style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", textDecoration: "none", color: "rgba(255,255,255,0.5)" }}>
          <Bell size={16} strokeWidth={1.8} />
          {notifCount > 0 && <span style={{ position: "absolute", top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 99, background: "#e50914", color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", boxShadow: "0 0 10px rgba(229,9,20,0.5)" }}>{notifCount}</span>}
        </Link>
        <Link href="/dashboard/profile" style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(145deg, #e50914, #8b060d)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", textDecoration: "none", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.02em", boxShadow: "0 0 0 2px rgba(229,9,20,0.2), 0 4px 12px rgba(229,9,20,0.22)" }}>
          {userName[0]?.toUpperCase()}
        </Link>
      </div>
    </header>
  );
}

// ── Mobile Search Overlay ─────────────────────────────────────────────────────

function MobileSearchOverlay({ open, val, onChange, onClose }: { open: boolean; val: string; onChange: (v: string) => void; onClose: () => void }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(8,8,10,0.97)", backdropFilter: "blur(20px)", display: "flex", flexDirection: "column", padding: "20px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(229,9,20,0.22)", borderRadius: 12 }}>
          <Search size={15} color="rgba(255,255,255,0.35)" strokeWidth={1.8} />
          <input autoFocus value={val} onChange={e => onChange(e.target.value)} placeholder="Search movies, genres…" style={{ flex: 1, background: "transparent", border: "none", color: "#fff", fontSize: 15, fontFamily: "'DM Sans', sans-serif", outline: "none" }} />
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
      </div>
      <p style={{ fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(255,255,255,0.18)", marginBottom: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>Popular</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {["Action", "Drama", "Thriller", "Romance", "Crime", "Sci-Fi"].map(t => (
          <button key={t} onClick={() => onChange(t)} style={{ padding: "8px 14px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 99, background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>{t}</button>
        ))}
      </div>
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────

function SectionHead({ eyebrow, title, viewAll }: { eyebrow?: string; title: string; viewAll?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18 }}>
      <div>
        {eyebrow && <span style={{ fontSize: 9, letterSpacing: "0.45em", textTransform: "uppercase", color: "#e50914", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", display: "block", marginBottom: 4 }}>{eyebrow}</span>}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 3, height: 18, background: "#e50914", boxShadow: "0 0 8px rgba(229,9,20,0.5)" }} />
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.2rem, 2.5vw, 1.7rem)", letterSpacing: "0.07em", color: "#fff", margin: 0 }}>{title}</h2>
        </div>
      </div>
      {viewAll && (
        <Link href={viewAll} style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", textDecoration: "none", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>View All →</Link>
      )}
    </div>
  );
}

// ── Greeting — icons instead of emojis ───────────────────────────────────────

function Greeting({ name, movieCount }: { name: string; movieCount: number }) {
  const h = new Date().getHours();
  const greet = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  // Icon per time of day
  const GreetIcon = h < 12 ? Sun : h < 17 ? Sunset : Moon;

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14, marginBottom: 32 }}>
      <div>
        <p style={{ fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", margin: "0 0 5px", fontFamily: "'DM Sans', sans-serif" }}>{greet},</p>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 2.8rem)", color: "#fff", letterSpacing: "0.04em", lineHeight: 1, margin: 0, display: "flex", alignItems: "center", gap: 12 }}>
          {name}
          <GreetIcon size={28} color="#e50914" strokeWidth={1.5} style={{ opacity: 0.7 }} />
        </h1>
      </div>
      {movieCount > 0 && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(229,9,20,0.07)", border: "1px solid rgba(229,9,20,0.18)", padding: "8px 15px", borderRadius: 8 }}>
          <span style={{ width: 6, height: 6, background: "#e50914", borderRadius: "50%", boxShadow: "0 0 7px rgba(229,9,20,0.7)", animation: "djPulse 2s ease-in-out infinite", display: "inline-block" }} />
          <span style={{ fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>{movieCount}+ Movies Available</span>
        </div>
      )}
    </div>
  );
}

// ── Stats Widget — icons replacing emojis ────────────────────────────────────

function StatsWidget({ isMobile, movieCount }: { isMobile: boolean; movieCount: number }) {
  const items = [
    { Icon: Film,       val: movieCount > 0 ? `${movieCount}+` : "…", label: "Movies",   sub: "available" },
    { Icon: Star,       val: "Top",                                     label: "Rated",    sub: "picks"    },
    { Icon: Flame,      val: "Hot",                                     label: "Trending", sub: "now"      },
    { Icon: Projector,   val: "New",                                     label: "Arrivals", sub: "weekly"   },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: 2, background: "rgba(255,255,255,0.035)", borderRadius: 4, overflow: "hidden", marginBottom: 44 }}>
      {items.map(s => (
        <div key={s.label} style={{ background: "#0c0c0e", padding: "20px 16px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <s.Icon size={20} color="#e50914" strokeWidth={1.5} style={{ marginBottom: 3, opacity: 0.8 }} />
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.85rem", color: "#fff", letterSpacing: "0.05em", lineHeight: 1 }}>{s.val}</span>
          <span style={{ fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", fontFamily: "'DM Sans', sans-serif" }}>{s.label}</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.14)", fontFamily: "'DM Sans', sans-serif" }}>{s.sub}</span>
        </div>
      ))}
    </div>
  );
}

// ── Genre Filter ──────────────────────────────────────────────────────────────

function GenreFilter({ genres, active, onChange }: { genres: string[]; active: string; onChange: (g: string) => void }) {
  const all = ["All", ...genres];
  return (
    <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 24, scrollbarWidth: "none" }}>
      {all.map(g => (
        <button key={g} onClick={() => onChange(g)} style={{ flexShrink: 0, fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", padding: "7px 18px", cursor: "pointer", fontWeight: 600, border: `1px solid ${active === g ? "#e50914" : "rgba(255,255,255,0.09)"}`, background: active === g ? "#e50914" : "transparent", color: active === g ? "#fff" : "rgba(255,255,255,0.32)", fontFamily: "'DM Sans', sans-serif", transition: "all 0.18s", borderRadius: 4 }}>{g}</button>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const layout = useDashboardLayout();
  const { user } = useAuth();

  const userName = user?.name || user?.email?.split("@")[0] || "Guest";
  const userObj  = { name: userName, email: user?.email ?? "" };

  const { isMobile, isSmall, sidebarCollapsed, setSidebarCollapsed, searchOpen, setSearchOpen, searchVal, setSearchVal, scrolled } = layout;

  // ── Data hooks ──────────────────────────────────────────────────────────────
  const featured  = useFeaturedMovies(6);
  const trending  = useTrendingMovies(20);
  const latest    = useLatestMovies(20);
  const topRated  = useTopRated(20);
  const allMovies = useMovies();
  const genreData = useAllGenres();

  // ── Genre explorer state ────────────────────────────────────────────────────
  const [activeGenre, setActiveGenre] = useState("All");
  const exploreMovies = useMovies({ genre: activeGenre === "All" ? undefined : activeGenre });

  // ── Video player ────────────────────────────────────────────────────────────
  const { playerState, openPlayer, closePlayer } = useVideoPlayer();
  const [currentPlayId, setCurrentPlayId] = useState<string | null>(null);
  const { trackView } = useMovie(currentPlayId);

  useEffect(() => { movieService.warmCache(); }, []);

  useEffect(() => {
    if (playerState.open && currentPlayId) trackView();
  }, [playerState.open, currentPlayId, trackView]);

  const handlePlayCard = useCallback((card: MovieCardData) => {
    const full = allMovies.movies.find(m => m.$id === card.id);
    if (!full?.video_url) return;
    setCurrentPlayId(full.$id);
    openPlayer(full.video_url, full.title, full.genre[0], full.poster_url ?? undefined);
  }, [allMovies.movies, openPlayer]);

  const handlePlayBanner = useCallback((banner: BannerMovie) => {
    const full = allMovies.movies.find(m => m.$id === banner.id);
    if (!full?.video_url) return;
    setCurrentPlayId(full.$id);
    openPlayer(full.video_url, full.title, full.genre[0], full.poster_url ?? undefined);
  }, [allMovies.movies, openPlayer]);

  const initialLoading = featured.loading && trending.loading && latest.loading;

  const bannerMovies  = featured.movies.map(toBannerMovie);
  const trendingCards = trending.movies.map(toCardData);
  const latestCards   = latest.movies.map(toCardData);
  const topRatedCards = topRated.movies.map(toCardData);
  const exploreCards  = exploreMovies.movies.map(toCardData);

  return (
    <>
      {/* Video Player */}
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

      {/* Mobile search overlay */}
      {isMobile && (
        <MobileSearchOverlay
          open={searchOpen}
          val={searchVal}
          onChange={setSearchVal}
          onClose={() => { setSearchOpen(false); setSearchVal(""); }}
        />
      )}

      <div style={{ display: "flex", height: "100svh", background: "#080808", overflow: "hidden" }}>
        {!isSmall && (
          <DashboardSidebar user={userObj} collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
        )}

        <div id="dj-content-col" style={{ flex: 1, minWidth: 0, height: "100svh", overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column" }}>
          {/* Top bar */}
          {isSmall ? (
            <MobileTopBar onSearchOpen={() => setSearchOpen(true)} notifCount={0} userName={userName} />
          ) : (
            <DesktopTopBar
              scrolled={scrolled}
              searchOpen={searchOpen}
              searchVal={searchVal}
              onSearchOpen={() => setSearchOpen(true)}
              onSearchClose={() => { setSearchOpen(false); setSearchVal(""); }}
              onSearchChange={setSearchVal}
              notifCount={0}
              userName={userName}
            />
          )}

          {/* Body */}
          {initialLoading ? (
            <>
              <SkeletonBanner />
              <div style={{ padding: "40px 28px 0" }}>
                <SkeletonRow />
                <SkeletonRow />
              </div>
            </>
          ) : (
            <>
              {/* Hero banner */}
              {bannerMovies.length > 0 ? (
                <MovieBanner movies={bannerMovies} onPlay={handlePlayBanner} />
              ) : (
                <div style={{ height: 120 }} />
              )}

              <div style={{ padding: isSmall ? "28px 16px 100px" : "40px 28px 80px" }}>
                {/* Greeting — icons, no emojis */}
                <Greeting name={userName} movieCount={allMovies.total} />

                {/* Stats — icons, no emojis */}
                <StatsWidget isMobile={isMobile} movieCount={allMovies.total} />

                {/* Trending — auto-scroll */}
                <section style={{ marginBottom: 48 }}>
                  <SectionHead eyebrow="Most Watched This Week" title="Trending Now" viewAll="/dashboard/movies" />
                  {trending.loading ? <SkeletonRow /> : trendingCards.length > 0 ? (
                    <MovieRow
                      title=""
                      movies={trendingCards}
                      onPlay={handlePlayCard}
                      viewAllHref="/dashboard/movies"
                      autoScroll
                    />
                  ) : <EmptyRow label="trending movies" />}
                </section>

                {/* New Arrivals — auto-scroll */}
                <section style={{ marginBottom: 48 }}>
                  <SectionHead eyebrow="Just Added" title="New Arrivals" viewAll="/dashboard/movies" />
                  {latest.loading ? <SkeletonRow /> : latestCards.length > 0 ? (
                    <MovieRow
                      title=""
                      movies={latestCards}
                      onPlay={handlePlayCard}
                      viewAllHref="/dashboard/movies"
                      autoScroll
                    />
                  ) : <EmptyRow label="new movies" />}
                </section>

                {/* Divider */}
                <div style={{ width: "100%", height: 1, background: "linear-gradient(90deg, transparent, rgba(229,9,20,0.22), transparent)", margin: "0 0 44px" }} />

                {/* Top Rated — auto-scroll */}
                <section style={{ marginBottom: 48 }}>
                  <SectionHead eyebrow="Highest Rated" title="Top Rated" viewAll="/dashboard/movies" />
                  {topRated.loading ? <SkeletonRow /> : topRatedCards.length > 0 ? (
                    <MovieRow
                      title=""
                      movies={topRatedCards}
                      onPlay={handlePlayCard}
                      viewAllHref="/dashboard/movies"
                      autoScroll
                    />
                  ) : <EmptyRow label="top rated movies" />}
                </section>

                {/* Genre Explorer */}
                <section style={{ marginBottom: 80 }}>
                  <SectionHead eyebrow="Find Something New" title="Explore by Genre" />
                  <GenreFilter
                    genres={genreData.genres}
                    active={activeGenre}
                    onChange={setActiveGenre}
                  />
                  {exploreMovies.loading ? <SkeletonRow /> : exploreCards.length > 0 ? (
                    <MovieGrid movies={exploreCards} onPlay={handlePlayCard} />
                  ) : <EmptyRow label="movies in this genre" />}
                </section>
              </div>
            </>
          )}
        </div>

        {isSmall && <MobileBottomNav />}
      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html, body { background: #080808; color: #fff; margin: 0; padding: 0; overflow: hidden; }
        #dj-content-col::-webkit-scrollbar { display: none; }
        #dj-content-col { scrollbar-width: none; }
        ::-webkit-scrollbar { width: 0; height: 0; }
        @keyframes djShimmer {
          0%   { background-position: -700px 0; }
          100% { background-position:  700px 0; }
        }
        .dj-shimmer {
          position: absolute; inset: 0;
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0) 100%);
          background-size: 700px 100%;
          animation: djShimmer 1.6s ease-in-out infinite;
        }
        .dj-sk {
          background: rgba(255,255,255,0.05);
          position: relative; overflow: hidden; display: block;
        }
        .dj-sk::after {
          content: "";
          position: absolute; inset: 0;
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0) 100%);
          background-size: 700px 100%;
          animation: djShimmer 1.6s ease-in-out infinite;
        }
        @keyframes djPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        .dj-nav-item:hover { background: rgba(255,255,255,0.04) !important; }
        .dj-nav-item[data-active="true"]:hover { background: rgba(229,9,20,0.13) !important; }
      `}</style>
    </>
  );
}