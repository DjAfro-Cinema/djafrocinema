"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search, X, Play, Star, Crown,
  ChevronDown, Grid3X3, LayoutList, Flame, Sparkles,
  TrendingUp, Filter, ChevronLeft, ChevronRight, Film,
  Projector,
} from "lucide-react";
import DashboardSidebar from "@/components/dashboard/sidebar/DashboardSidebar";
import MobileBottomNav from "@/components/dashboard/mobile/MobileBottomNav";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useMovies } from "@/hooks/useMovies";
import { useAllGenres } from "@/hooks/useAllGenres";
import { useTrendingMovies } from "@/hooks/useTrendingMovies";
import { useLatestMovies } from "@/hooks/useLatestMovies";
import { useTopRated } from "@/hooks/useTopRated";
import VideoPlayer, { useVideoPlayer } from "@/components/dashboard/video-player/VideoPlayer";
import { movieService } from "@/services/movie.service";
import type { Movie } from "@/types/movie.types";

// ── TYPES ─────────────────────────────────────────────────────────────────────

type SortVal = "trending" | "rating" | "newest" | "popular";

const SORT_OPTIONS: { val: SortVal; label: string; Icon: React.ElementType }[] = [
  { val: "trending", label: "Trending",     Icon: TrendingUp },
  { val: "rating",   label: "Top Rated",    Icon: Star },
  { val: "newest",   label: "Newest",       Icon: Projector },
  { val: "popular",  label: "Most Watched", Icon: Flame },
];

// ── MAPPERS ───────────────────────────────────────────────────────────────────

function movieRating(m: Movie): number {
  return m.rating ?? 0;
}

function movieViews(m: Movie): number {
  return m.view_count ?? 0;
}

function movieYear(m: Movie): number {
  return parseInt(m.release_year ?? "0");
}

// ── FEATURED BANNER ───────────────────────────────────────────────────────────

function FeaturedBanner({ movie, onPlay }: { movie: Movie; onPlay: (m: Movie) => void }) {
  const router = useRouter();
  return (
    <div style={{ position: "relative", width: "100%", height: "clamp(260px, 38vw, 440px)", overflow: "hidden", flexShrink: 0 }}>
      <img src={movie.poster_url ?? ""} alt={movie.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.38) saturate(1.15)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, #080808 0%, rgba(8,8,8,0.25) 55%, transparent 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(8,8,8,0.85) 0%, transparent 60%)" }} />

      <div style={{ position: "absolute", bottom: 0, left: 0, padding: "clamp(20px,4vw,48px)", maxWidth: 560 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase", color: "#e50914", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", background: "rgba(229,9,20,0.12)", border: "1px solid rgba(229,9,20,0.3)", padding: "3px 10px", borderRadius: 3 }}>
            {movie.is_trending ? "TRENDING" : "FEATURED"}
          </span>
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem,5vw,3.5rem)", color: "#fff", letterSpacing: "0.05em", lineHeight: 1, margin: "0 0 10px" }}>
          {movie.title}
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#f5c518", fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
            <Star size={12} fill="#f5c518" /> {movie.rating.toFixed(1)}
          </span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif" }}>{movie.release_year}</span>
          {movie.duration && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif" }}>{movie.duration}</span>}
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif" }}>{movie.genre.join(" · ")}</span>
        </div>
        {movie.description && (
          <p style={{ fontSize: "clamp(12px,1.5vw,14px)", color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, margin: "0 0 20px", maxWidth: 440 }}>
            {movie.description.slice(0, 160)}{movie.description.length > 160 ? "…" : ""}
          </p>
        )}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => onPlay(movie)} style={{ display: "flex", alignItems: "center", gap: 9, padding: "11px 26px", background: "#e50914", border: "none", borderRadius: 6, color: "#fff", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
            <Play size={14} fill="#fff" /> Play Now
          </button>
          <button onClick={() => router.push(`/dashboard/movies/${movie.$id}`)} style={{ display: "flex", alignItems: "center", gap: 9, padding: "11px 22px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
            More Info
          </button>
        </div>
      </div>

      <div style={{ position: "absolute", top: 24, right: 24, textAlign: "right" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>Viewed</div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", color: "#fff", letterSpacing: "0.05em" }}>
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

// ── MOVIE CARD (grid + list variants) ────────────────────────────────────────

function MovieCard({ movie, view }: { movie: Movie; view: "grid" | "list" }) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);

  if (view === "list") {
    return (
      <div onClick={() => router.push(`/dashboard/movies/${movie.$id}`)} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        style={{ display: "flex", gap: 16, alignItems: "center", padding: "12px 14px", background: hovered ? "rgba(255,255,255,0.04)" : "transparent", border: "1px solid", borderColor: hovered ? "rgba(229,9,20,0.2)" : "rgba(255,255,255,0.06)", borderRadius: 10, transition: "all 0.18s", cursor: "pointer" }}>
        <div style={{ position: "relative", width: 80, height: 112, flexShrink: 0, borderRadius: 6, overflow: "hidden" }}>
          <img src={movie.poster_url ?? ""} alt={movie.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 5, flexWrap: "wrap" }}>
            {movie.premium_only && <Crown size={10} color="#f5c518" />}
            <span style={{ fontSize: 9, color: "#e50914", letterSpacing: "0.35em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>{movie.genre[0]}</span>
          </div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "#fff", letterSpacing: "0.06em", margin: "0 0 5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {movie.title}
          </h3>
          {movie.description && (
            <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif", margin: "0 0 8px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {movie.description}
            </p>
          )}
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#f5c518", fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
              <Star size={10} fill="#f5c518" /> {movie.rating.toFixed(1)}
            </span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "'DM Sans', sans-serif" }}>{movie.release_year}</span>
            {movie.duration && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "'DM Sans', sans-serif" }}>{movie.duration}</span>}
          </div>
        </div>
        <div style={{ width: 38, height: 38, borderRadius: "50%", background: hovered ? "#e50914" : "rgba(229,9,20,0.12)", border: "1px solid rgba(229,9,20,0.3)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.18s", flexShrink: 0 }}>
          <Play size={14} fill={hovered ? "#fff" : "#e50914"} color={hovered ? "#fff" : "#e50914"} />
        </div>
      </div>
    );
  }

  // Grid
  return (
    <div onClick={() => router.push(`/dashboard/movies/${movie.$id}`)} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ position: "relative", borderRadius: 10, overflow: "hidden", cursor: "pointer", background: "#0c0c0e" }}>
      <div style={{ position: "relative", paddingTop: "144%", overflow: "hidden" }}>
        <img src={movie.poster_url ?? ""} alt={movie.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: hovered ? "scale(1.06)" : "scale(1)", transition: "transform 0.5s ease" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(8,8,8,0.95) 0%, rgba(8,8,8,0.4) 50%, transparent 100%)", opacity: hovered ? 1 : 0.6, transition: "opacity 0.3s" }} />

        {/* Badges */}
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 5, flexWrap: "wrap" }}>
          {movie.premium_only && (
            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 8, letterSpacing: "0.3em", padding: "3px 7px", background: "rgba(245,197,24,0.15)", border: "1px solid rgba(245,197,24,0.3)", borderRadius: 3, color: "#f5c518", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
              <Crown size={8} fill="#f5c518" color="#f5c518" /> PREMIUM
            </span>
          )}
        </div>

        {/* Play button */}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: hovered ? 1 : 0, transition: "opacity 0.2s" }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#e50914", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 30px rgba(229,9,20,0.5)" }}>
            <Play size={20} fill="#fff" color="#fff" />
          </div>
        </div>

        {/* Bottom info */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 12px 10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontSize: 9, color: "#e50914", letterSpacing: "0.35em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>{movie.genre[0]}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 3, color: "#f5c518", fontSize: 10, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>
              <Star size={9} fill="#f5c518" /> {movie.rating.toFixed(1)}
            </span>
          </div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", color: "#fff", letterSpacing: "0.05em", margin: "0 0 3px", lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {movie.title}
          </h3>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif" }}>{movie.release_year}</span>
            {movie.duration && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif" }}>{movie.duration}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── GENRE SECTION ─────────────────────────────────────────────────────────────

function GenreSection({ genre, movies, view }: { genre: string; movies: Movie[]; view: "grid" | "list" }) {
  const router = useRouter();
  if (!movies.length) return null;
  return (
    <section style={{ marginBottom: 52 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 3, height: 20, background: "#e50914", boxShadow: "0 0 8px rgba(229,9,20,0.5)" }} />
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.3rem,2.5vw,1.8rem)", letterSpacing: "0.07em", color: "#fff", margin: 0 }}>{genre}</h2>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "'DM Sans', sans-serif" }}>{movies.length} films</span>
        </div>
        <button onClick={() => router.push(`/dashboard/movies?genre=${genre.toLowerCase()}`)} style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", background: "none", border: "none", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: "pointer" }}>
          View All →
        </button>
      </div>

      {view === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
          {movies.map(m => <MovieCard key={m.$id} movie={m} view="grid" />)}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {movies.map(m => <MovieCard key={m.$id} movie={m} view="list" />)}
        </div>
      )}
    </section>
  );
}

// ── SORT DROPDOWN ─────────────────────────────────────────────────────────────

function SortDropdown({ value, onChange }: { value: SortVal; onChange: (v: SortVal) => void }) {
  const [open, setOpen] = useState(false);
  const current = SORT_OPTIONS.find(o => o.val === value) ?? SORT_OPTIONS[0];

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(p => !p)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 8, color: "rgba(255,255,255,0.55)", fontSize: 12, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
        <current.Icon size={13} />
        {current.label}
        <ChevronDown size={11} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, minWidth: 160, background: "#111113", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, overflow: "hidden", zIndex: 100, boxShadow: "0 20px 60px rgba(0,0,0,0.8)" }}>
          {SORT_OPTIONS.map(o => (
            <button key={o.val} onClick={() => { onChange(o.val); setOpen(false); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "10px 14px", background: o.val === value ? "rgba(229,9,20,0.1)" : "transparent", border: "none", color: o.val === value ? "#fff" : "rgba(255,255,255,0.45)", fontSize: 12, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", textAlign: "left", borderLeft: o.val === value ? "2px solid #e50914" : "2px solid transparent" }}>
              <o.Icon size={12} color={o.val === value ? "#e50914" : "inherit"} />
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
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12 }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} style={{ paddingTop: "144%", background: "#0c0c0e", borderRadius: 10, position: "relative", overflow: "hidden" }}>
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
  const [genrePage,   setGenrePage]   = useState(0); // for genre tab scroll

  // Appwrite data hooks
  const allMoviesHook = useMovies();
  const genreData     = useAllGenres();
  const { playerState, openPlayer, closePlayer } = useVideoPlayer();

  const handlePlay = useCallback((movie: Movie) => {
    if (!movie.video_url) return;
    openPlayer(movie.video_url, movie.title, movie.genre[0], movie.poster_url ?? undefined);
  }, [openPlayer]);

  // All genres including "All"
  const allGenres = ["All", ...genreData.genres];

  // Filter + sort from Appwrite data
  const allMovies = allMoviesHook.movies;

  const filtered = allMovies.filter(m => {
    if (freeOnly && m.premium_only) return false;
    if (activeGenre !== "All" && !m.genre.some(g => g.toLowerCase() === activeGenre.toLowerCase())) return false;
    if (searchVal) {
      const q = searchVal.toLowerCase();
      return m.title.toLowerCase().includes(q) ||
        m.genre.some(g => g.toLowerCase().includes(q)) ||
        (m.description ?? "").toLowerCase().includes(q) ||
        m.tags.some(t => t.toLowerCase().includes(q));
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "rating")   return movieRating(b) - movieRating(a);
    if (sortBy === "newest")   return movieYear(b) - movieYear(a);
    if (sortBy === "popular")  return movieViews(b) - movieViews(a);
    // trending — is_trending first, then by views
    if (b.is_trending !== a.is_trending) return b.is_trending ? 1 : -1;
    return movieViews(b) - movieViews(a);
  });

  // Group by genre for All tab
  const genreGroups: Record<string, Movie[]> = {};
  if (activeGenre === "All" && !searchVal) {
    genreData.genres.forEach(g => {
      const gMovies = sorted.filter(m => m.genre.some(mg => mg.toLowerCase() === g.toLowerCase()));
      if (gMovies.length) genreGroups[g] = gMovies;
    });
  }

  const featured = allMovies.find(m => m.is_featured || m.is_trending) ?? allMovies[0];

  const loading = allMoviesHook.loading;

  // Genre tab chevron navigation
  const GENRES_PER_PAGE = 6;
  const visibleGenres = allGenres.slice(genrePage * GENRES_PER_PAGE, (genrePage + 1) * GENRES_PER_PAGE);
  const canPrevGenre = genrePage > 0;
  const canNextGenre = (genrePage + 1) * GENRES_PER_PAGE < allGenres.length;

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

      <div style={{ display: "flex", height: "100svh", background: "#080808", overflow: "hidden" }}>
        {/* Sidebar */}
        {!isSmall && (
          <DashboardSidebar user={userObj} collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
        )}

        {/* Content column */}
        <div id="movies-scroll-col" style={{ flex: 1, minWidth: 0, height: "100svh", overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column" }}>

          {/* ── STICKY TOP BAR ── */}
          <header style={{ position: "sticky", top: 0, zIndex: 800, height: 62, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 clamp(16px,3vw,28px)", background: scrolled ? "rgba(8,8,10,0.97)" : "rgba(8,8,10,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.05)", flexShrink: 0, gap: 12 }}>
            {/* Title */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.3rem,2.5vw,1.8rem)", color: "#fff", letterSpacing: "0.1em", margin: 0 }}>Movies</h1>
              <span style={{ fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: "#e50914", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", background: "rgba(229,9,20,0.1)", border: "1px solid rgba(229,9,20,0.2)", padding: "3px 8px", borderRadius: 3 }}>
                {allMovies.length} FILMS
              </span>
            </div>

            {/* Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {searchOpen ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(229,9,20,0.25)", borderRadius: 8 }}>
                  <Search size={13} color="rgba(255,255,255,0.3)" strokeWidth={1.8} />
                  <input autoFocus value={searchVal} onChange={e => setSearchVal(e.target.value)} placeholder="Search movies…" style={{ background: "transparent", border: "none", color: "#fff", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none", width: 160 }} />
                  <button onClick={() => { setSearchOpen(false); setSearchVal(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", display: "flex" }}>
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <button onClick={() => setSearchOpen(true)} style={{ width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 9, cursor: "pointer", color: "rgba(255,255,255,0.4)" }}>
                  <Search size={15} strokeWidth={1.8} />
                </button>
              )}

              <SortDropdown value={sortBy} onChange={setSortBy} />

              {/* View toggle */}
              <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, overflow: "hidden" }}>
                {(["grid", "list"] as const).map(v => (
                  <button key={v} onClick={() => setView(v)} style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", background: view === v ? "rgba(229,9,20,0.2)" : "transparent", border: "none", cursor: "pointer", color: view === v ? "#e50914" : "rgba(255,255,255,0.3)", transition: "all 0.15s" }}>
                    {v === "grid" ? <Grid3X3 size={14} /> : <LayoutList size={14} />}
                  </button>
                ))}
              </div>

              {/* Filter */}
              <button onClick={() => setShowFilter(p => !p)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 14px", height: 38, background: showFilter ? "rgba(229,9,20,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${showFilter ? "rgba(229,9,20,0.3)" : "rgba(255,255,255,0.07)"}`, borderRadius: 9, cursor: "pointer", color: showFilter ? "#e50914" : "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
                <Filter size={13} />
                {!isSmall && "Filter"}
              </button>
            </div>
          </header>

          {/* ── FILTER BAR ── */}
          {showFilter && (
            <div style={{ padding: "14px clamp(16px,3vw,28px)", background: "rgba(12,12,14,0.95)", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>Filters:</span>
              <button onClick={() => setFreeOnly(p => !p)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: freeOnly ? "rgba(229,9,20,0.15)" : "rgba(255,255,255,0.03)", border: `1px solid ${freeOnly ? "rgba(229,9,20,0.35)" : "rgba(255,255,255,0.08)"}`, borderRadius: 6, color: freeOnly ? "#fff" : "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
                {freeOnly && <span style={{ color: "#e50914", marginRight: 2 }}>✓</span>}
                Free to Watch
              </button>
              {freeOnly && (
                <button onClick={() => setFreeOnly(false)} style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  Clear all
                </button>
              )}
            </div>
          )}

          {/* ── GENRE TABS ── */}
          <div style={{ padding: "0 clamp(16px,3vw,28px)", background: "rgba(8,8,8,0.6)", borderBottom: "1px solid rgba(255,255,255,0.04)", flexShrink: 0, display: "flex", alignItems: "center", gap: 4 }}>
            {/* Prev chevron */}
            {canPrevGenre && (
              <button onClick={() => setGenrePage(p => p - 1)} style={{ width: 28, height: 28, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.4)", flexShrink: 0 }}>
                <ChevronLeft size={13} />
              </button>
            )}

            <div style={{ flex: 1, display: "flex", gap: 2, overflowX: "auto", scrollbarWidth: "none" }}>
              {allGenres.map(g => (
                <button key={g} onClick={() => setActiveGenre(g)} style={{ flexShrink: 0, fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", fontWeight: 600, padding: "14px 18px", cursor: "pointer", background: "transparent", border: "none", borderBottom: activeGenre === g ? "2px solid #e50914" : "2px solid transparent", color: activeGenre === g ? "#fff" : "rgba(255,255,255,0.28)", fontFamily: "'DM Sans', sans-serif", transition: "all 0.18s" }}>
                  {g}
                </button>
              ))}
            </div>

            {canNextGenre && (
              <button onClick={() => setGenrePage(p => p + 1)} style={{ width: 28, height: 28, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.4)", flexShrink: 0 }}>
                <ChevronRight size={13} />
              </button>
            )}
          </div>

          {/* ── BODY ── */}
          {loading ? (
            <div style={{ padding: "40px clamp(16px,3vw,28px)" }}>
              <div style={{ height: "clamp(260px,38vw,440px)", background: "#0c0c0e", borderRadius: 12, marginBottom: 32, position: "relative", overflow: "hidden" }}>
                <div className="dj-shimmer" />
              </div>
              <SkeletonGrid />
            </div>
          ) : (
            <>
              {/* Featured Banner */}
              {activeGenre === "All" && !searchVal && !freeOnly && featured && (
                <FeaturedBanner movie={featured} onPlay={handlePlay} />
              )}

              <div style={{ padding: "clamp(20px,3vw,40px) clamp(16px,3vw,28px) 80px" }}>

                {/* Search results header */}
                {searchVal && (
                  <div style={{ marginBottom: 24 }}>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
                      {sorted.length} result{sorted.length !== 1 ? "s" : ""} for <span style={{ color: "#fff" }}>"{searchVal}"</span>
                    </p>
                  </div>
                )}

                {/* Active filter pills */}
                {freeOnly && (
                  <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, padding: "5px 12px", background: "rgba(229,9,20,0.1)", border: "1px solid rgba(229,9,20,0.2)", borderRadius: 4, color: "#e50914", fontFamily: "'DM Sans', sans-serif" }}>
                      Free to Watch
                      <button onClick={() => setFreeOnly(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0, display: "flex" }}><X size={10} /></button>
                    </span>
                  </div>
                )}

                {/* Content */}
                {sorted.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "80px 20px" }}>
                    <Film size={48} color="rgba(255,255,255,0.1)" style={{ marginBottom: 16 }} />
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", margin: "0 0 8px" }}>No Movies Found</h3>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.18)", fontFamily: "'DM Sans', sans-serif" }}>Try adjusting your filters or search query</p>
                  </div>
                ) : activeGenre === "All" && !searchVal ? (
                  Object.entries(genreGroups).map(([g, movies]) => (
                    <GenreSection key={g} genre={g} movies={movies} view={view} />
                  ))
                ) : (
                  view === "grid" ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
                      {sorted.map(m => <MovieCard key={m.$id} movie={m} view="grid" />)}
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {sorted.map(m => <MovieCard key={m.$id} movie={m} view="list" />)}
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile bottom nav */}
      {isSmall && <MobileBottomNav />}

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html, body { background: #080808; color: #fff; margin: 0; padding: 0; overflow: hidden; }
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
      `}</style>
    </>
  );
}