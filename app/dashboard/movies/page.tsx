"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search, X, Play, Star, Crown,
  ChevronDown, Grid3X3, LayoutList, Flame, Sparkles,
  TrendingUp, Filter, ChevronLeft, ChevronRight, Film,
  Projector, Lock,
} from "lucide-react";
import DashboardSidebar from "@/components/dashboard/sidebar/DashboardSidebar";
import MobileBottomNav from "@/components/dashboard/mobile/MobileBottomNav";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useMovies } from "@/hooks/useMovies";
import { useAllGenres } from "@/hooks/useAllGenres";
import VideoPlayer, { useVideoPlayer } from "@/components/dashboard/video-player/VideoPlayer";
import { movieService } from "@/services/movie.service";
import type { Movie } from "@/types/movie.types";
import { usePremiumGate } from "@/context/PremiumGateContext";
import { useTheme } from "@/context/ThemeContext";
import PremiumPlayButton from "@/components/payment/Premiumplaybutton";

// ── TYPES ─────────────────────────────────────────────────────────────────────

type SortVal = "trending" | "rating" | "newest" | "popular";

const SORT_OPTIONS: { val: SortVal; label: string; Icon: React.ElementType }[] = [
  { val: "trending", label: "Trending",     Icon: TrendingUp },
  { val: "rating",   label: "Top Rated",    Icon: Star       },
  { val: "newest",   label: "Newest",       Icon: Projector  },
  { val: "popular",  label: "Most Watched", Icon: Flame      },
];

// ── MAPPERS ───────────────────────────────────────────────────────────────────

function movieRating(m: Movie): number { return m.rating ?? 0; }
function movieViews(m: Movie): number  { return m.view_count ?? 0; }
function movieYear(m: Movie): number   { return parseInt(m.release_year ?? "0"); }

// ── FEATURED BANNER ───────────────────────────────────────────────────────────

function FeaturedBanner({ movie, onPlay }: { movie: Movie; onPlay: (m: Movie) => void }) {
  const router = useRouter();
  const { t } = useTheme();
  const { paidMovieIds } = usePremiumGate();
  const isPaid   = paidMovieIds.includes(movie.$id);
  const isLocked = !!movie.premium_only && !isPaid;

  return (
    <div style={{ position: "relative", width: "100%", height: "clamp(260px, 38vw, 440px)", overflow: "hidden", flexShrink: 0 }}>
      <img src={movie.poster_url ?? ""} alt={movie.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.38) saturate(1.15)" }} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(0deg, ${t.bgBase} 0%, rgba(0,0,0,0.25) 55%, transparent 100%)` }} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, ${t.overlay} 0%, transparent 60%)` }} />

      <div style={{ position: "absolute", bottom: 0, left: 0, padding: "clamp(20px,4vw,48px)", maxWidth: 560 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase", color: t.accent, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", background: t.navActiveBg, border: `1px solid ${t.borderAccent}`, padding: "3px 10px", borderRadius: 3 }}>
            {movie.is_trending ? "TRENDING" : "FEATURED"}
          </span>
          {movie.premium_only && (
            <span style={{ fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: isPaid ? t.success : t.warning, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", background: isPaid ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)", border: isPaid ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(245,158,11,0.3)", padding: "3px 10px", borderRadius: 3, display: "flex", alignItems: "center", gap: 4 }}>
              {isPaid ? "✓ OWNED" : "KES 10"}
            </span>
          )}
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem,5vw,3.5rem)", color: t.textPrimary, letterSpacing: "0.05em", lineHeight: 1, margin: "0 0 10px" }}>
          {movie.title}
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5, color: t.warning, fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
            <Star size={12} fill={t.warning} color={t.warning} /> {movie.rating.toFixed(1)}
          </span>
          <span style={{ fontSize: 11, color: t.textMuted, fontFamily: "'DM Sans', sans-serif" }}>{movie.release_year}</span>
          {movie.duration && <span style={{ fontSize: 11, color: t.textMuted, fontFamily: "'DM Sans', sans-serif" }}>{movie.duration}</span>}
          <span style={{ fontSize: 11, color: t.textMuted, fontFamily: "'DM Sans', sans-serif" }}>{movie.genre.join(" · ")}</span>
        </div>
        {movie.description && (
          <p style={{ fontSize: "clamp(12px,1.5vw,14px)", color: t.textSecondary, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, margin: "0 0 20px", maxWidth: 440 }}>
            {movie.description.slice(0, 160)}{movie.description.length > 160 ? "…" : ""}
          </p>
        )}
        <div style={{ display: "flex", gap: 10 }}>
          <PremiumPlayButton
            movieId={movie.$id}
            movieTitle={movie.title}
            posterUrl={movie.poster_url ?? undefined}
            isPremium={!!movie.premium_only}
            isPaid={isPaid}
            userId=""
            onPlay={() => onPlay(movie)}
            style={{ display: "flex", alignItems: "center", gap: 9, padding: "11px 26px", background: t.accent, border: "none", borderRadius: 6, color: t.textOnAccent, fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}
          >
            {isLocked ? <Lock size={14} /> : <Play size={14} fill={t.textOnAccent} />}
            {isLocked ? "Unlock — KES 10" : "Play Now"}
          </PremiumPlayButton>
          <button onClick={() => router.push(`/dashboard/movies/${movie.$id}`)} style={{ display: "flex", alignItems: "center", gap: 9, padding: "11px 22px", background: t.navHoverBg, border: `1px solid ${t.borderMedium}`, borderRadius: 6, color: t.textSecondary, fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
            More Info
          </button>
        </div>
      </div>

      <div style={{ position: "absolute", top: 24, right: 24, textAlign: "right" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: t.textMuted, fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>Viewed</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", color: t.textPrimary, letterSpacing: "0.05em" }}>
          {movie.view_count >= 1000000
            ? `${(movie.view_count / 1000000).toFixed(1)}M`
            : movie.view_count >= 1000
            ? `${(movie.view_count / 1000).toFixed(0)}K`
            : movie.view_count}
        </div>
      </div>
    </div>
  );
}

// ── MOVIE CARD ────────────────────────────────────────────────────────────────

function MovieCard({ movie, view, onPlay }: { movie: Movie; view: "grid" | "list"; onPlay: (m: Movie) => void }) {
  const router = useRouter();
  const { t } = useTheme();
  const [hovered, setHovered] = useState(false);
  const { paidMovieIds } = usePremiumGate();
  const isPaid   = paidMovieIds.includes(movie.$id);
  const isLocked = !!movie.premium_only && !isPaid;

  if (view === "list") {
    return (
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ display: "flex", gap: 16, alignItems: "center", padding: "12px 14px", background: hovered ? t.navHoverBg : "transparent", border: "1px solid", borderColor: hovered ? t.borderAccent : t.borderSubtle, borderRadius: 10, transition: "all 0.18s", cursor: "pointer" }}
      >
        <div
          onClick={() => router.push(`/dashboard/movies/${movie.$id}`)}
          style={{ position: "relative", width: 80, height: 112, flexShrink: 0, borderRadius: 6, overflow: "hidden" }}
        >
          <img src={movie.poster_url ?? ""} alt={movie.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          {isLocked && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: t.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Lock size={12} color={t.textOnAccent} />
              </div>
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }} onClick={() => router.push(`/dashboard/movies/${movie.$id}`)}>
          <div style={{ display: "flex", gap: 6, marginBottom: 5, flexWrap: "wrap", alignItems: "center" }}>
            {movie.premium_only && <Crown size={10} color={isPaid ? t.success : t.warning} />}
            {movie.premium_only && !isPaid && (
              <span style={{ fontSize: 8, color: t.warning, fontWeight: 700, letterSpacing: "0.2em", fontFamily: "'DM Sans', sans-serif" }}>KES 10</span>
            )}
            {movie.premium_only && isPaid && (
              <span style={{ fontSize: 8, color: t.success, fontWeight: 700, letterSpacing: "0.2em", fontFamily: "'DM Sans', sans-serif" }}>OWNED</span>
            )}
            <span style={{ fontSize: 9, color: t.accent, letterSpacing: "0.35em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>{movie.genre[0]}</span>
          </div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: t.textPrimary, letterSpacing: "0.06em", margin: "0 0 5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {movie.title}
          </h3>
          {movie.description && (
            <p style={{ fontSize: 11.5, color: t.textMuted, fontFamily: "'DM Sans', sans-serif", margin: "0 0 8px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {movie.description}
            </p>
          )}
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4, color: t.warning, fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
              <Star size={10} fill={t.warning} color={t.warning} /> {movie.rating.toFixed(1)}
            </span>
            <span style={{ fontSize: 11, color: t.textMuted, fontFamily: "'DM Sans', sans-serif" }}>{movie.release_year}</span>
            {movie.duration && <span style={{ fontSize: 11, color: t.textMuted, fontFamily: "'DM Sans', sans-serif" }}>{movie.duration}</span>}
          </div>
        </div>
        <PremiumPlayButton
          movieId={movie.$id}
          movieTitle={movie.title}
          posterUrl={movie.poster_url ?? undefined}
          isPremium={!!movie.premium_only}
          isPaid={isPaid}
          userId=""
          onPlay={() => onPlay(movie)}
          style={{ width: 38, height: 38, borderRadius: "50%", background: hovered ? t.accent : t.navActiveBg, border: `1px solid ${t.borderAccent}`, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.18s", flexShrink: 0, cursor: "pointer" }}
        >
          {isLocked
            ? <Lock size={14} color={hovered ? t.textOnAccent : t.accent} />
            : <Play size={14} fill={hovered ? t.textOnAccent : t.accent} color={hovered ? t.textOnAccent : t.accent} />}
        </PremiumPlayButton>
      </div>
    );
  }

  // Grid
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: "relative", borderRadius: 10, overflow: "hidden", cursor: "pointer", background: t.bgSurface }}
    >
      <div
        onClick={() => router.push(`/dashboard/movies/${movie.$id}`)}
        style={{ position: "relative", paddingTop: "144%", overflow: "hidden" }}
      >
        <img src={movie.poster_url ?? ""} alt={movie.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: hovered ? "scale(1.06)" : "scale(1)", transition: "transform 0.5s ease" }} />
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(0deg, ${t.bgBase}f2 0%, rgba(0,0,0,0.4) 50%, transparent 100%)`, opacity: hovered ? 1 : 0.6, transition: "opacity 0.3s" }} />

        {/* Badges */}
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 5, flexWrap: "wrap" }}>
          {movie.premium_only && !isPaid && (
            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 8, letterSpacing: "0.3em", padding: "3px 7px", background: t.navActiveBg, border: `1px solid ${t.borderAccent}`, borderRadius: 3, color: t.accent, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
              <Lock size={7} /> KES 10
            </span>
          )}
          {movie.premium_only && isPaid && (
            <span style={{ fontSize: 8, letterSpacing: "0.2em", padding: "3px 7px", background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 3, color: t.success, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
              ✓ OWNED
            </span>
          )}
        </div>

        {/* Play button overlay */}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: hovered ? 1 : 0, transition: "opacity 0.2s", zIndex: 2 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: t.accent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 30px ${t.accentGlow}` }}>
            {isLocked ? <Lock size={20} color={t.textOnAccent} /> : <Play size={20} fill={t.textOnAccent} color={t.textOnAccent} />}
          </div>
        </div>

        {/* Bottom info */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 12px 10px", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontSize: 9, color: t.accent, letterSpacing: "0.35em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>{movie.genre[0]}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 3, color: t.warning, fontSize: 10, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>
              <Star size={9} fill={t.warning} color={t.warning} /> {movie.rating.toFixed(1)}
            </span>
          </div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", color: t.textPrimary, letterSpacing: "0.05em", margin: "0 0 3px", lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {movie.title}
          </h3>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ fontSize: 10, color: t.textMuted, fontFamily: "'DM Sans', sans-serif" }}>{movie.release_year}</span>
            {movie.duration && <span style={{ fontSize: 10, color: t.textMuted, fontFamily: "'DM Sans', sans-serif" }}>{movie.duration}</span>}
          </div>
        </div>
      </div>

      {/* Overlay play button */}
      <PremiumPlayButton
        movieId={movie.$id}
        movieTitle={movie.title}
        posterUrl={movie.poster_url ?? undefined}
        isPremium={!!movie.premium_only}
        isPaid={isPaid}
        userId=""
        onPlay={() => onPlay(movie)}
        style={{ position: "absolute", inset: 0, background: "transparent", border: "none", cursor: "pointer", zIndex: 3, opacity: hovered ? 1 : 0 }}
      />
    </div>
  );
}

// ── GENRE SECTION ─────────────────────────────────────────────────────────────

function GenreSection({ genre, movies, view, onPlay }: { genre: string; movies: Movie[]; view: "grid" | "list"; onPlay: (m: Movie) => void }) {
  const router = useRouter();
  const { t } = useTheme();
  if (!movies.length) return null;
  return (
    <section style={{ marginBottom: 52 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 3, height: 20, background: t.accent, boxShadow: `0 0 8px ${t.accentGlow}` }} />
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.3rem,2.5vw,1.8rem)", letterSpacing: "0.07em", color: t.textPrimary, margin: 0 }}>{genre}</h2>
          <span style={{ fontSize: 10, color: t.textMuted, fontFamily: "'DM Sans', sans-serif" }}>{movies.length} films</span>
        </div>
        <button onClick={() => router.push(`/dashboard/movies?genre=${genre.toLowerCase()}`)} style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: t.textMuted, background: "none", border: "none", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: "pointer" }}>
          View All →
        </button>
      </div>
      {view === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
          {movies.map(m => <MovieCard key={m.$id} movie={m} view="grid" onPlay={onPlay} />)}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {movies.map(m => <MovieCard key={m.$id} movie={m} view="list" onPlay={onPlay} />)}
        </div>
      )}
    </section>
  );
}

// ── SORT DROPDOWN ─────────────────────────────────────────────────────────────

function SortDropdown({ value, onChange }: { value: SortVal; onChange: (v: SortVal) => void }) {
  const { t } = useTheme();
  const [open, setOpen] = useState(false);
  const current = SORT_OPTIONS.find(o => o.val === value) ?? SORT_OPTIONS[0];
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(p => !p)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 14px", background: t.navHoverBg, border: `1px solid ${t.borderSubtle}`, borderRadius: 8, color: t.textSecondary, fontSize: 12, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
        <current.Icon size={13} />
        {current.label}
        <ChevronDown size={11} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, minWidth: 160, background: t.bgElevated, border: `1px solid ${t.borderSubtle}`, borderRadius: 10, overflow: "hidden", zIndex: 100, boxShadow: "0 20px 60px rgba(0,0,0,0.8)" }}>
          {SORT_OPTIONS.map(o => (
            <button key={o.val} onClick={() => { onChange(o.val); setOpen(false); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "10px 14px", background: o.val === value ? t.navActiveBg : "transparent", border: "none", color: o.val === value ? t.textPrimary : t.textSecondary, fontSize: 12, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", textAlign: "left", borderLeft: o.val === value ? `2px solid ${t.accent}` : "2px solid transparent" }}>
              <o.Icon size={12} color={o.val === value ? t.accent : "inherit"} />
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── SKELETON ──────────────────────────────────────────────────────────────────

function SkeletonGrid() {
  const { t } = useTheme();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12 }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} style={{ paddingTop: "144%", background: t.bgSurface, borderRadius: 10, position: "relative", overflow: "hidden" }}>
          <div className="dj-shimmer" />
        </div>
      ))}
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function MoviesPage() {
  const router = useRouter();
  const layout = useDashboardLayout();
  const { user } = useAuth();
  const { t } = useTheme();

  const userName = user?.name || user?.email?.split("@")[0] || "Guest";
  const userObj  = { name: userName, email: user?.email ?? "" };

  const { isSmall, isMobile, sidebarCollapsed, setSidebarCollapsed, scrolled } = layout;

  const [activeGenre, setActiveGenre] = useState("All");
  const [searchVal,   setSearchVal]   = useState("");
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [sortBy,      setSortBy]      = useState<SortVal>("trending");
  const [view,        setView]        = useState<"grid" | "list">("grid");
  const [showFilter,  setShowFilter]  = useState(false);
  const [freeOnly,    setFreeOnly]    = useState(false);
  const [genrePage,   setGenrePage]   = useState(0);

  const allMoviesHook = useMovies();
  const genreData     = useAllGenres();
  const { playerState, openPlayer, closePlayer } = useVideoPlayer();
  const { requestPlay, paidMovieIds } = usePremiumGate();

  const handlePlay = useCallback((movie: Movie) => {
    requestPlay({
      movieId:    movie.$id,
      movieTitle: movie.title,
      posterUrl:  movie.poster_url ?? undefined,
      isPremium:  !!movie.premium_only,
      onUnlocked: (movieId: string) => {
        if (!movie.video_url) return;
        openPlayer(movie.video_url, movie.title, movie.genre[0], movie.poster_url ?? undefined);
      },
    });
  }, [requestPlay, openPlayer]);

  const allGenres = ["All", ...genreData.genres];
  const allMovies = allMoviesHook.movies;

  const filtered = allMovies.filter(m => {
    if (freeOnly && m.premium_only) return false;
    if (activeGenre !== "All" && !m.genre.some(g => g.toLowerCase() === activeGenre.toLowerCase())) return false;
    if (searchVal) {
      const q = searchVal.toLowerCase();
      return m.title.toLowerCase().includes(q) ||
        m.genre.some(g => g.toLowerCase().includes(q)) ||
        (m.description ?? "").toLowerCase().includes(q) ||
        m.tags.some(tag => tag.toLowerCase().includes(q));
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "rating")  return movieRating(b) - movieRating(a);
    if (sortBy === "newest")  return movieYear(b) - movieYear(a);
    if (sortBy === "popular") return movieViews(b) - movieViews(a);
    if (b.is_trending !== a.is_trending) return b.is_trending ? 1 : -1;
    return movieViews(b) - movieViews(a);
  });

  const genreGroups: Record<string, Movie[]> = {};
  if (activeGenre === "All" && !searchVal) {
    genreData.genres.forEach(g => {
      const gMovies = sorted.filter(m => m.genre.some(mg => mg.toLowerCase() === g.toLowerCase()));
      if (gMovies.length) genreGroups[g] = gMovies;
    });
  }

  const featured = allMovies.find(m => m.is_featured || m.is_trending) ?? allMovies[0];
  const loading  = allMoviesHook.loading;

  const canPrevGenre = genrePage > 0;
  const canNextGenre = (genrePage + 1) * 6 < allGenres.length;

  return (
    <>
      {playerState.open && (
        <VideoPlayer src={playerState.src} title={playerState.title} subtitle={playerState.subtitle} poster={playerState.poster} onClose={closePlayer} autoPlay />
      )}

      <div style={{ display: "flex", height: "100svh", background: t.bgBase, overflow: "hidden" }}>
        {!isSmall && (
          <DashboardSidebar user={userObj} collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
        )}

        <div id="movies-scroll-col" style={{ flex: 1, minWidth: 0, height: "100svh", overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column" }}>

          {/* ── STICKY TOP BAR ── */}
          <header style={{
            position: "sticky", top: 0, zIndex: 800,
            height: 62,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 clamp(16px,3vw,28px)",
            background: scrolled ? `${t.bgBase}f7` : `${t.bgBase}d9`,
            backdropFilter: "blur(20px)",
            borderBottom: `1px solid ${t.borderSubtle}`,
            flexShrink: 0, gap: 12,
          }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.3rem,2.5vw,1.8rem)", color: t.textPrimary, letterSpacing: "0.1em", margin: 0, flexShrink: 0 }}>
              Movies
            </h1>

            {/* Desktop controls */}
            <div className="topbar-desktop" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {searchOpen ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", background: t.navHoverBg, border: `1px solid ${t.borderAccent}`, borderRadius: 8 }}>
                  <Search size={13} color={t.textMuted} strokeWidth={1.8} />
                  <input autoFocus value={searchVal} onChange={e => setSearchVal(e.target.value)} placeholder="Search movies…" style={{ background: "transparent", border: "none", color: t.textPrimary, fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none", width: 160 }} />
                  <button onClick={() => { setSearchOpen(false); setSearchVal(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted, display: "flex" }}>
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <button onClick={() => setSearchOpen(true)} style={{ width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", background: t.navHoverBg, border: `1px solid ${t.borderSubtle}`, borderRadius: 9, cursor: "pointer", color: t.textMuted }}>
                  <Search size={15} strokeWidth={1.8} />
                </button>
              )}

              <SortDropdown value={sortBy} onChange={setSortBy} />

              <div style={{ display: "flex", background: t.navHoverBg, border: `1px solid ${t.borderSubtle}`, borderRadius: 8, overflow: "hidden" }}>
                {(["grid", "list"] as const).map(v => (
                  <button key={v} onClick={() => setView(v)} style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", background: view === v ? t.navActiveBg : "transparent", border: "none", cursor: "pointer", color: view === v ? t.accent : t.textMuted, transition: "all 0.15s" }}>
                    {v === "grid" ? <Grid3X3 size={14} /> : <LayoutList size={14} />}
                  </button>
                ))}
              </div>

              <button onClick={() => setShowFilter(p => !p)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 14px", height: 38, background: showFilter ? t.navActiveBg : t.navHoverBg, border: `1px solid ${showFilter ? t.borderAccent : t.borderSubtle}`, borderRadius: 9, cursor: "pointer", color: showFilter ? t.accent : t.textMuted, fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
                <Filter size={13} />
                Filter
              </button>
            </div>

            {/* Mobile controls */}
            <div className="topbar-mobile" style={{ display: "none", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", background: t.navHoverBg, border: `1px solid ${t.borderSubtle}`, borderRadius: 8, overflow: "hidden" }}>
                {(["grid", "list"] as const).map(v => (
                  <button key={v} onClick={() => setView(v)} style={{ width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", background: view === v ? t.navActiveBg : "transparent", border: "none", cursor: "pointer", color: view === v ? t.accent : t.textMuted, transition: "all 0.15s" }}>
                    {v === "grid" ? <Grid3X3 size={15} /> : <LayoutList size={15} />}
                  </button>
                ))}
              </div>
            </div>
          </header>

          {/* ── FILTER BAR ── */}
          {showFilter && (
            <div style={{ padding: "14px clamp(16px,3vw,28px)", background: t.bgSurface, borderBottom: `1px solid ${t.borderSubtle}`, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: t.textMuted, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>Filters:</span>
              <button onClick={() => setFreeOnly(p => !p)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: freeOnly ? t.navActiveBg : t.navHoverBg, border: `1px solid ${freeOnly ? t.borderAccent : t.borderSubtle}`, borderRadius: 6, color: freeOnly ? t.textPrimary : t.textMuted, fontSize: 11, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
                {freeOnly && <span style={{ color: t.accent, marginRight: 2 }}>✓</span>}
                Free to Watch
              </button>
              {freeOnly && (
                <button onClick={() => setFreeOnly(false)} style={{ fontSize: 10, color: t.textMuted, background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  Clear all
                </button>
              )}
            </div>
          )}

          {/* ── GENRE TABS ── */}
          <div style={{ padding: "0 clamp(16px,3vw,28px)", background: `${t.bgBase}99`, borderBottom: `1px solid ${t.borderSubtle}`, flexShrink: 0, display: "flex", alignItems: "center", gap: 4 }}>
            {canPrevGenre && (
              <button onClick={() => setGenrePage(p => p - 1)} style={{ width: 28, height: 28, background: t.navHoverBg, border: `1px solid ${t.borderSubtle}`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: t.textMuted, flexShrink: 0 }}>
                <ChevronLeft size={13} />
              </button>
            )}
            <div style={{ flex: 1, display: "flex", gap: 2, overflowX: "auto", scrollbarWidth: "none" }}>
              {allGenres.map(g => (
                <button key={g} onClick={() => setActiveGenre(g)} style={{ flexShrink: 0, fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", fontWeight: 600, padding: "14px 18px", cursor: "pointer", background: "transparent", border: "none", borderBottom: activeGenre === g ? `2px solid ${t.accent}` : "2px solid transparent", color: activeGenre === g ? t.textPrimary : t.textMuted, fontFamily: "'DM Sans', sans-serif", transition: "all 0.18s" }}>
                  {g}
                </button>
              ))}
            </div>
            {canNextGenre && (
              <button onClick={() => setGenrePage(p => p + 1)} style={{ width: 28, height: 28, background: t.navHoverBg, border: `1px solid ${t.borderSubtle}`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: t.textMuted, flexShrink: 0 }}>
                <ChevronRight size={13} />
              </button>
            )}
          </div>

          {/* ── BODY ── */}
          {loading ? (
            <div style={{ padding: "40px clamp(16px,3vw,28px)" }}>
              <div style={{ height: "clamp(260px,38vw,440px)", background: t.bgSurface, borderRadius: 12, marginBottom: 32, position: "relative", overflow: "hidden" }}>
                <div className="dj-shimmer" />
              </div>
              <SkeletonGrid />
            </div>
          ) : (
            <>
              {activeGenre === "All" && !searchVal && !freeOnly && featured && (
                <FeaturedBanner movie={featured} onPlay={handlePlay} />
              )}

              <div style={{ padding: "clamp(20px,3vw,40px) clamp(16px,3vw,28px) 80px" }}>
                {searchVal && (
                  <div style={{ marginBottom: 24 }}>
                    <p style={{ fontSize: 12, color: t.textMuted, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
                      {sorted.length} result{sorted.length !== 1 ? "s" : ""} for <span style={{ color: t.textPrimary }}>"{searchVal}"</span>
                    </p>
                  </div>
                )}

                {freeOnly && (
                  <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, padding: "5px 12px", background: t.navActiveBg, border: `1px solid ${t.borderAccent}`, borderRadius: 4, color: t.accent, fontFamily: "'DM Sans', sans-serif" }}>
                      Free to Watch
                      <button onClick={() => setFreeOnly(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0, display: "flex" }}><X size={10} /></button>
                    </span>
                  </div>
                )}

                {sorted.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "80px 20px" }}>
                    <Film size={48} color={t.textMuted} style={{ marginBottom: 16 }} />
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: t.textMuted, letterSpacing: "0.1em", margin: "0 0 8px" }}>No Movies Found</h3>
                    <p style={{ fontSize: 13, color: t.textMuted, fontFamily: "'DM Sans', sans-serif", opacity: 0.6 }}>Try adjusting your filters or search query</p>
                  </div>
                ) : activeGenre === "All" && !searchVal ? (
                  Object.entries(genreGroups).map(([g, movies]) => (
                    <GenreSection key={g} genre={g} movies={movies} view={view} onPlay={handlePlay} />
                  ))
                ) : (
                  view === "grid" ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
                      {sorted.map(m => <MovieCard key={m.$id} movie={m} view="grid" onPlay={handlePlay} />)}
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {sorted.map(m => <MovieCard key={m.$id} movie={m} view="list" onPlay={handlePlay} />)}
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {isSmall && <MobileBottomNav />}

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html, body { background: var(--dj-bg-base); color: var(--dj-text-primary); margin: 0; padding: 0; overflow: hidden; }
        #movies-scroll-col::-webkit-scrollbar { display: none; }
        #movies-scroll-col { scrollbar-width: none; }
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
        @media (max-width: 640px) {
          .topbar-desktop { display: none !important; }
          .topbar-mobile  { display: flex !important; }
        }
        @media (min-width: 641px) {
          .topbar-mobile { display: none !important; }
        }
      `}</style>
    </>
  );
}