"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Search, X, Play, ChevronRight, ChevronLeft, Shuffle,
  Crown, Star, Eye, Flame, Zap, Rocket,
  Clock, Trophy, Gift, RotateCcw,
  Headphones, Film, Lock,
} from "lucide-react";
import DashboardSidebar from "@/components/dashboard/sidebar/DashboardSidebar";
import MobileBottomNav from "@/components/dashboard/mobile/MobileBottomNav";
import VideoPlayer, { useVideoPlayer } from "@/components/dashboard/video-player/VideoPlayer";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import { useAuth } from "@/hooks/useAuth";

import { useFeaturedMovies }  from "@/hooks/useFeaturedMovies";
import { useTrendingMovies }  from "@/hooks/useTrendingMovies";
import { useLatestMovies }    from "@/hooks/useLatestMovies";
import { useTopRated }        from "@/hooks/useTopRated";
import { useMostViewed }      from "@/hooks/useMostViewed";
import { useMovies }          from "@/hooks/useMovies";
import { useMovie }           from "@/hooks/useMovie";
import { movieService }       from "@/services/movie.service";
import type { Movie }         from "@/types/movie.types";
import { usePremiumGate }     from "@/context/PremiumGateContext";

// ── Card type ─────────────────────────────────────────────────────────────────

type CardMovie = {
  id: string;
  title: string;
  genre: string;
  year: string;
  rating: string;
  duration?: string;
  premium: boolean;
  img: string;
  views?: number;
  description?: string;
  video_url?: string;
  is_trending?: boolean;
  is_featured?: boolean;
};

function toCard(m: Movie): CardMovie {
  return {
    id:          m.$id,
    title:       m.title,
    genre:       m.genre[0] ?? "Movie",
    year:        m.release_year ?? "2024",
    rating:      m.rating.toFixed(1),
    duration:    m.duration ?? undefined,
    premium:     m.premium_only,
    img:         m.poster_url ?? "/images/hero1.jpg",
    views:       m.view_count,
    description: m.description ?? m.ai_summary ?? "",
    video_url:   m.video_url ?? undefined,
    is_trending: m.is_trending,
    is_featured: m.is_featured,
  };
}

// ── Moods ─────────────────────────────────────────────────────────────────────

const MOODS = [
  { id: "action",    Icon: Flame,      label: "Hype",      desc: "Action-packed",   genres: ["Action","Adventure"] },
  { id: "drama",     Icon: Film,       label: "Drama",     desc: "Emotional depth", genres: ["Drama","Romance"]    },
  { id: "thriller",  Icon: Zap,        label: "Suspense",  desc: "Edge of seat",    genres: ["Thriller","Horror"]  },
  { id: "scifi",     Icon: Rocket,     label: "Sci-Fi",    desc: "Future worlds",   genres: ["Sci-Fi"]             },
  { id: "bollywood", Icon: Headphones, label: "Bollywood", desc: "Epic sagas",      genres: ["Bollywood"]          },
];

// ── Collections ───────────────────────────────────────────────────────────────

const COLLECTIONS = [
  { id: "col1", title: "DJ Afro Essentials", Icon: Headphones, img: "/images/hero1.jpg", filter: (m: Movie) => !!m.is_featured },
  { id: "col2", title: "Free Tonight",       Icon: Gift,       img: "/images/hero2.jpg", filter: (m: Movie) => !m.premium_only },
  { id: "col3", title: "Hall of Fame",       Icon: Trophy,     img: "/images/hero3.jpg", filter: (m: Movie) => m.rating >= 9.0 },
  { id: "col4", title: "Under 2 Hours",      Icon: Clock,      img: "/images/hero4.jpg", filter: (m: Movie) => typeof m.duration === "string" && m.duration.startsWith("1h") },
  { id: "col5", title: "Trending Now",       Icon: Flame,      img: "/images/hero5.jpg", filter: (m: Movie) => !!m.is_trending },
  { id: "col6", title: "New Arrivals",       Icon: Zap,        img: "/images/hero6.jpg", filter: (m: Movie) => parseInt(m.release_year ?? "0") >= new Date().getFullYear() - 1 },
];

// ── Scrollable Row ────────────────────────────────────────────────────────────

function ScrollableRow({ movies, onPlay, isSmall }: { movies: CardMovie[]; onPlay: (m: CardMovie) => void; isSmall: boolean }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const t = setTimeout(checkScroll, 80);
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => { clearTimeout(t); el.removeEventListener("scroll", checkScroll); ro.disconnect(); };
  }, [checkScroll, movies.length]);

  const scroll = (dir: "left" | "right") => {
    rowRef.current?.scrollBy({ left: dir === "right" ? 620 : -620, behavior: "smooth" });
  };

  const CARD_W = isSmall ? 150 : 190;

  return (
    <div style={{ position: "relative" }}>
      {!isSmall && canLeft && (
        <button
          onClick={() => scroll("left")} aria-label="Scroll left"
          className="dj-chevron-btn"
          style={{ position: "absolute", left: -20, top: "50%", transform: "translateY(-60%)", zIndex: 10 }}
        >
          <ChevronLeft size={17} strokeWidth={2.2} />
        </button>
      )}
      {!isSmall && canRight && (
        <button
          onClick={() => scroll("right")} aria-label="Scroll right"
          className="dj-chevron-btn"
          style={{ position: "absolute", right: -20, top: "50%", transform: "translateY(-60%)", zIndex: 10 }}
        >
          <ChevronRight size={17} strokeWidth={2.2} />
        </button>
      )}
      <div
        ref={rowRef}
        className="dj-row-scroll"
        style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none", paddingRight: isSmall ? `${CARD_W * 0.4}px` : 4 }}
      >
        {movies.map(m => <DiscoverCard key={m.id} movie={m} onPlay={onPlay} isSmall={isSmall} />)}
      </div>
      {isSmall && (
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 8, width: 60, background: "linear-gradient(90deg, transparent, var(--dj-bg-base))", pointerEvents: "none" }} />
      )}
    </div>
  );
}

// ── Discover Card ─────────────────────────────────────────────────────────────

function DiscoverCard({ movie, onPlay, isSmall }: { movie: CardMovie; onPlay: (m: CardMovie) => void; isSmall: boolean }) {
  const [hovered, setHovered] = useState(false);
  const { paidMovieIds } = usePremiumGate();
  const isPaid   = paidMovieIds.includes(movie.id);
  const isLocked = movie.premium && !isPaid;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", width: isSmall ? 150 : 190, minWidth: isSmall ? 150 : 190,
        borderRadius: 12, overflow: "hidden", background: "var(--dj-bg-elevated)",
        cursor: "pointer", flexShrink: 0,
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        boxShadow: hovered ? "0 16px 48px rgba(0,0,0,0.75)" : "0 4px 18px rgba(0,0,0,0.42)",
        transition: "transform 0.28s ease, box-shadow 0.28s ease",
      }}
    >
      <Link href={`/dashboard/movies/${movie.id}`} style={{ textDecoration: "none", display: "block" }}>
        <div style={{ position: "relative", paddingTop: "150%", overflow: "hidden" }}>
          <img
            src={movie.img} alt={movie.title}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: hovered ? "scale(1.07)" : "scale(1)", transition: "transform 0.45s ease" }}
          />
          <div style={{ position: "absolute", inset: 0, background: hovered ? "linear-gradient(0deg, rgba(4,4,4,0.98) 0%, rgba(4,4,4,0.3) 48%, rgba(4,4,4,0.05) 100%)" : "linear-gradient(0deg, rgba(4,4,4,0.93) 0%, rgba(4,4,4,0.12) 50%, rgba(4,4,4,0.0) 100%)", transition: "background 0.28s" }} />

          {!movie.premium && (
            <span className="dj-badge dj-badge--free">FREE</span>
          )}
          {movie.premium && isPaid && (
            <span className="dj-badge dj-badge--owned">✓ OWNED</span>
          )}
          {isLocked && (
            <span className="dj-badge dj-badge--lock" style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Lock size={6} /> KES 10
            </span>
          )}
          {movie.is_trending && (
            <span className="dj-badge dj-badge--hot" style={{ top: (movie.premium || !movie.premium) ? 28 : 8, display: "flex", alignItems: "center", gap: 3 }}>
              <Flame size={6} /> HOT
            </span>
          )}

          <span style={{ position: "absolute", top: 8, right: 8, display: "flex", alignItems: "center", gap: 3, fontSize: 10, padding: "3px 7px", background: "rgba(0,0,0,0.6)", borderRadius: 5, color: "#f5c518", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", backdropFilter: "blur(4px)" }}>
            <Star size={8} fill="#f5c518" strokeWidth={0} /> {movie.rating}
          </span>

          {hovered && (
            <button
              onClick={e => { e.preventDefault(); onPlay(movie); }}
              className="dj-card-play-btn"
              style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 50, height: 50, border: "none", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 2, animation: "popIn 0.15s ease-out" }}
            >
              {isLocked ? <Lock size={20} color="#fff" /> : <Play size={20} fill="#fff" color="#fff" style={{ marginLeft: 2 }} />}
            </button>
          )}

          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 10px 10px" }}>
            <span style={{ display: "block", fontSize: 8, color: "var(--dj-accent)", letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, marginBottom: 4 }}>
              {movie.genre}
            </span>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: isSmall ? "0.8rem" : "0.88rem", color: "#fff", letterSpacing: "0.04em", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {movie.title}
            </h3>
            <span style={{ fontSize: 10, color: "var(--dj-text-muted)", fontFamily: "'DM Sans', sans-serif" }}>
              {movie.year}{movie.duration ? ` · ${movie.duration}` : ""}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────

function SectionHead({ eyebrow, title, count, viewAll }: { eyebrow?: string; title: string; count?: number; viewAll?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18 }}>
      <div>
        {eyebrow && (
          <span style={{ fontSize: 9, letterSpacing: "0.46em", textTransform: "uppercase", color: "var(--dj-accent)", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", display: "block", marginBottom: 4 }}>
            {eyebrow}
          </span>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="dj-section-bar" />
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.1rem,2.5vw,1.55rem)", letterSpacing: "0.07em", color: "var(--dj-text-primary)", margin: 0 }}>
            {title}
          </h2>
          {count != null && count > 0 && (
            <span style={{ fontSize: 9, color: "var(--dj-text-muted)", fontFamily: "'DM Sans', sans-serif" }}>{count} films</span>
          )}
        </div>
      </div>
      {viewAll && (
        <Link href={viewAll} style={{ fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--dj-text-secondary)", textDecoration: "none", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
          View All <ChevronRight size={12} />
        </Link>
      )}
    </div>
  );
}

// ── Movie Row ─────────────────────────────────────────────────────────────────

function MovieRow({ eyebrow, title, movies, onPlay, viewAll, isSmall }: { eyebrow?: string; title: string; movies: CardMovie[]; onPlay: (m: CardMovie) => void; viewAll?: string; isSmall: boolean }) {
  if (!movies.length) return null;
  return (
    <section style={{ marginBottom: 48 }}>
      <SectionHead eyebrow={eyebrow} title={title} count={movies.length} viewAll={viewAll} />
      <ScrollableRow movies={movies} onPlay={onPlay} isSmall={isSmall} />
    </section>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonRow({ isSmall }: { isSmall: boolean }) {
  const w = isSmall ? 150 : 190;
  const h = isSmall ? 225 : 285;
  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 18, alignItems: "center" }}>
        <div className="dj-sk" style={{ width: 3, height: 18, borderRadius: 2 }} />
        <div className="dj-sk" style={{ width: 200, height: 20, borderRadius: 4 }} />
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ position: "relative", width: w, minWidth: w, height: h, borderRadius: 12, overflow: "hidden", background: "var(--dj-bg-elevated)", flexShrink: 0 }}>
            <div className="dj-shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Movie of the Day ──────────────────────────────────────────────────────────

function MovieOfTheDay({ movie, onPlay }: { movie: CardMovie; onPlay: () => void }) {
  const { paidMovieIds } = usePremiumGate();
  const isPaid   = paidMovieIds.includes(movie.id);
  const isLocked = movie.premium && !isPaid;

  return (
    <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", background: "var(--dj-bg-elevated)", marginBottom: 44 }}>
      <img src={movie.img} alt={movie.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.3) saturate(1.3)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(130deg, rgba(8,8,8,0.93) 0%, rgba(8,8,8,0.5) 55%, var(--dj-accent-glow) 100%)" }} />
      <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, background: "radial-gradient(circle, var(--dj-sidebar-glow-top) 0%, transparent 70%)", animation: "discoPulse 5s ease-in-out infinite" }} />

      <div style={{ position: "relative", padding: "clamp(22px,4vw,44px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Star size={10} color="#f5c518" fill="#f5c518" />
          <span style={{ fontSize: 9, letterSpacing: "0.52em", textTransform: "uppercase", color: "#f5c518", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>Movie of the Day</span>
          <span style={{ fontSize: 9, color: "var(--dj-text-muted)", fontFamily: "'DM Sans', sans-serif" }}>
            · {new Date().toLocaleDateString("en-KE", { weekday: "long", month: "short", day: "numeric" })}
          </span>
        </div>

        <div style={{ display: "flex", gap: "clamp(14px,3vw,32px)", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ position: "relative", width: "clamp(70px,10vw,115px)", aspectRatio: "2/3", borderRadius: 10, overflow: "hidden", flexShrink: 0, boxShadow: "0 20px 52px rgba(0,0,0,0.72)" }}>
            <img src={movie.img} alt={movie.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
              {movie.premium && !isPaid && (
                <span className="dj-meta-badge dj-meta-badge--lock"><Lock size={7} /> KES 10</span>
              )}
              {movie.premium && isPaid && (
                <span className="dj-meta-badge dj-meta-badge--owned">✓ OWNED</span>
              )}
              {movie.is_trending && (
                <span className="dj-meta-badge dj-meta-badge--trending"><Flame size={7} /> TRENDING</span>
              )}
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem,4.5vw,3.2rem)", color: "var(--dj-text-primary)", letterSpacing: "0.03em", lineHeight: 1, margin: "0 0 10px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
              {movie.title}
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", marginBottom: 12 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#f5c518", fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>
                <Star size={11} fill="#f5c518" strokeWidth={0} /> {movie.rating}
              </span>
              <span style={{ fontSize: 12, color: "var(--dj-text-secondary)", fontFamily: "'DM Sans', sans-serif" }}>{movie.genre}</span>
              <span style={{ fontSize: 12, color: "var(--dj-text-secondary)", fontFamily: "'DM Sans', sans-serif" }}>{movie.year}</span>
              {movie.duration && <span style={{ fontSize: 12, color: "var(--dj-text-secondary)", fontFamily: "'DM Sans', sans-serif" }}>{movie.duration}</span>}
              {movie.views != null && (
                <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, color: "var(--dj-text-secondary)", fontFamily: "'DM Sans', sans-serif" }}>
                  <Eye size={10} /> {movie.views.toLocaleString()}
                </span>
              )}
            </div>
            {movie.description && (
              <p style={{ fontSize: "clamp(11px,1.4vw,13px)", color: "var(--dj-text-secondary)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.65, margin: "0 0 18px", maxWidth: 440, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                {movie.description}
              </p>
            )}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={onPlay} className="dj-btn-primary">
                {isLocked ? <Lock size={13} /> : <Play size={13} fill="currentColor" />}
                {isLocked ? "Unlock — KES 10" : "Play Now"}
              </button>
              <Link href={`/dashboard/movies/${movie.id}`} className="dj-btn-ghost">
                More Info
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Mood Picker ───────────────────────────────────────────────────────────────

function MoodPicker({ active, onChange }: { active: string | null; onChange: (id: string | null) => void }) {
  return (
    <div style={{ marginBottom: 44 }}>
      <SectionHead title="What's Your Mood?" />
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {MOODS.map(m => {
          const isActive = active === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onChange(isActive ? null : m.id)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                padding: "14px 20px", minWidth: 84,
                background: isActive ? "var(--dj-nav-active-bg)" : "var(--dj-bg-surface)",
                border: `1px solid ${isActive ? "var(--dj-border-accent)" : "var(--dj-border-subtle)"}`,
                borderRadius: 12, cursor: "pointer", transition: "all 0.18s",
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "var(--dj-nav-hover-bg)"; }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "var(--dj-bg-surface)"; }}
            >
              <m.Icon size={18} color={isActive ? "var(--dj-accent)" : "var(--dj-icon-inactive)"} strokeWidth={1.5} />
              <span style={{ fontSize: 11, color: isActive ? "var(--dj-text-primary)" : "var(--dj-text-secondary)", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>{m.label}</span>
              <span style={{ fontSize: 9, color: "var(--dj-text-muted)", fontFamily: "'DM Sans', sans-serif" }}>{m.desc}</span>
            </button>
          );
        })}
        {active && (
          <button onClick={() => onChange(null)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "14px 16px", background: "transparent", border: "1px solid var(--dj-border-subtle)", borderRadius: 12, color: "var(--dj-text-muted)", fontSize: 11, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
            <RotateCcw size={11} /> Clear
          </button>
        )}
      </div>
    </div>
  );
}

// ── Collections ───────────────────────────────────────────────────────────────

function Collections({ allMovies, onCollectionClick }: { allMovies: Movie[]; onCollectionClick: (movies: Movie[], title: string) => void }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <SectionHead title="Collections" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(196px, 1fr))", gap: 10 }}>
        {COLLECTIONS.map(col => {
          const count = allMovies.filter(col.filter).length;
          return (
            <button
              key={col.id}
              onClick={() => onCollectionClick(allMovies.filter(col.filter), col.title)}
              className="dj-col-btn"
              style={{ position: "relative", overflow: "hidden", display: "flex", alignItems: "center", gap: 14, padding: "18px 18px", background: "var(--dj-bg-elevated)", border: "1px solid var(--dj-border-subtle)", borderRadius: 13, cursor: "pointer", textAlign: "left", transition: "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s" }}
            >
              <img src={col.img} alt="" aria-hidden className="dj-col-img" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.42) saturate(1.4)", transition: "transform 0.38s ease, filter 0.38s ease" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(110deg, rgba(8,8,10,0.75) 0%, rgba(8,8,10,0.42) 100%)" }} />
              <div style={{ position: "relative", width: 42, height: 42, borderRadius: 10, background: "var(--dj-nav-hover-bg)", border: "1px solid var(--dj-border-medium)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <col.Icon size={19} color="var(--dj-icon-hovered)" strokeWidth={1.5} />
              </div>
              <div style={{ position: "relative" }}>
                <p style={{ fontSize: 13, color: "var(--dj-text-primary)", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, margin: "0 0 4px", letterSpacing: "0.02em" }}>{col.title}</p>
                <p style={{ fontSize: 10, color: "var(--dj-text-secondary)", fontFamily: "'DM Sans', sans-serif", margin: 0 }}>{count > 0 ? `${count} films` : "—"}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Search Results ────────────────────────────────────────────────────────────

function SearchResults({ query, results, onPlay, onClose, isSmall }: { query: string; results: CardMovie[]; onPlay: (m: CardMovie) => void; onClose: () => void; isSmall: boolean }) {
  return (
    <div style={{ marginBottom: 44 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 10 }}>
        <div>
          <p style={{ fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase", color: "var(--dj-accent)", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, margin: "0 0 4px" }}>Search Results</p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.1rem,2.5vw,1.45rem)", letterSpacing: "0.06em", color: "var(--dj-text-primary)", margin: 0 }}>
            "{query}" — {results.length} found
          </h2>
        </div>
        <button onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "var(--dj-bg-surface)", border: "1px solid var(--dj-border-subtle)", borderRadius: 8, color: "var(--dj-text-secondary)", fontSize: 11, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
          <X size={11} /> Clear
        </button>
      </div>
      {results.length === 0 ? (
        <div style={{ textAlign: "center", padding: "56px 20px" }}>
          <Film size={36} color="var(--dj-text-muted)" strokeWidth={1} style={{ marginBottom: 12 }} />
          <p style={{ fontSize: 13, color: "var(--dj-text-muted)", fontFamily: "'DM Sans', sans-serif" }}>No movies match your search</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isSmall ? 146 : 184}px, 1fr))`, gap: 12 }}>
          {results.map(m => <DiscoverCard key={m.id} movie={m} onPlay={onPlay} isSmall={isSmall} />)}
        </div>
      )}
    </div>
  );
}

// ── Collection View ───────────────────────────────────────────────────────────

function CollectionView({ title, movies, onBack, onPlay, isSmall }: { title: string; movies: CardMovie[]; onBack: () => void; onPlay: (m: CardMovie) => void; isSmall: boolean }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 13px", background: "var(--dj-bg-surface)", border: "1px solid var(--dj-border-subtle)", borderRadius: 8, color: "var(--dj-text-secondary)", fontSize: 11, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
          <ChevronLeft size={12} /> Back
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="dj-section-bar" />
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.1rem,2.5vw,1.55rem)", letterSpacing: "0.07em", color: "var(--dj-text-primary)", margin: 0 }}>{title}</h2>
          <span style={{ fontSize: 9, color: "var(--dj-text-muted)", fontFamily: "'DM Sans', sans-serif" }}>{movies.length} films</span>
        </div>
      </div>
      {movies.length === 0 ? (
        <div style={{ textAlign: "center", padding: "56px 0", color: "var(--dj-text-muted)", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
          No movies in this collection yet.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isSmall ? 146 : 184}px, 1fr))`, gap: 12 }}>
          {movies.map(m => <DiscoverCard key={m.id} movie={m} onPlay={onPlay} isSmall={isSmall} />)}
        </div>
      )}
    </div>
  );
}

// ── Surprise Highlight ────────────────────────────────────────────────────────

function SurpriseHighlight({ movie, onPlay }: { movie: CardMovie; onPlay: () => void }) {
  const { paidMovieIds } = usePremiumGate();
  const isPaid   = paidMovieIds.includes(movie.id);
  const isLocked = movie.premium && !isPaid;

  return (
    <div style={{ marginBottom: 44, padding: "18px 20px", background: "var(--dj-nav-active-bg)", border: "1px solid var(--dj-border-accent)", borderRadius: 14, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
      <Shuffle size={22} color="var(--dj-accent)" strokeWidth={1.5} style={{ flexShrink: 0, opacity: 0.8 }} />
      <div style={{ flex: 1, minWidth: 140 }}>
        <p style={{ fontSize: 9, letterSpacing: "0.42em", textTransform: "uppercase", color: "var(--dj-accent)", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, margin: "0 0 3px" }}>Surprise Pick</p>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", color: "var(--dj-text-primary)", letterSpacing: "0.05em", margin: "0 0 3px" }}>{movie.title}</h3>
        <p style={{ fontSize: 11, color: "var(--dj-text-secondary)", fontFamily: "'DM Sans', sans-serif", margin: 0 }}>{movie.genre} · {movie.year} · ★ {movie.rating}</p>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button onClick={onPlay} className="dj-btn-primary" style={{ gap: 7, padding: "9px 18px", fontSize: 11, letterSpacing: "0.08em" }}>
          {isLocked ? <Lock size={12} /> : <Play size={12} fill="currentColor" />}
          {isLocked ? "Unlock" : "Play"}
        </button>
        <Link href={`/dashboard/movies/${movie.id}`} className="dj-btn-ghost" style={{ padding: "9px 14px" }}>
          Info
        </Link>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DiscoverPage() {
  const layout = useDashboardLayout();
  const { user } = useAuth();
  const { isMobile, isSmall, sidebarCollapsed, setSidebarCollapsed, scrolled } = layout;

  const userName = user?.name || user?.email?.split("@")[0] || "Guest";
  const userObj  = { name: userName, email: user?.email ?? "" };

  const trending   = useTrendingMovies(24);
  const latest     = useLatestMovies(24);
  const topRated   = useTopRated(24);
  const featured   = useFeaturedMovies(6);
  const mostViewed = useMostViewed(24);
  const allMovies  = useMovies();

  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const srcList   = featured.movies.length > 0 ? featured.movies : allMovies.movies;
  const motdRaw   = srcList.length > 0 ? srcList[dayOfYear % srcList.length] : null;
  const motd      = motdRaw ? toCard(motdRaw) : null;

  const { requestPlay } = usePremiumGate();

  const [activeMood, setActiveMood] = useState<string | null>(null);
  const activeMoodData = MOODS.find(m => m.id === activeMood);
  const moodMovies = useMovies(
    activeMood && activeMoodData && activeMoodData.genres.length > 0
      ? { genre: activeMoodData.genres[0] }
      : undefined
  );

  const [searchVal,     setSearchVal]     = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const searchResults: CardMovie[] = searchVal.trim().length > 0
    ? allMovies.movies.filter(m => {
        const q = searchVal.toLowerCase();
        return m.title.toLowerCase().includes(q)
          || m.genre.some((g: string) => g.toLowerCase().includes(q))
          || (Array.isArray(m.tags) && m.tags.some((t: string) => t.toLowerCase().includes(q)))
          || (m.description ?? "").toLowerCase().includes(q)
          || (m.ai_summary ?? "").toLowerCase().includes(q);
      }).map(toCard)
    : [];

  const [collectionView, setCollectionView] = useState<{ movies: CardMovie[]; title: string } | null>(null);
  const [randomMovie, setRandomMovie] = useState<CardMovie | null>(null);

  const { playerState, openPlayer, closePlayer } = useVideoPlayer();
  const [currentPlayId, setCurrentPlayId] = useState<string | null>(null);
  const { trackView } = useMovie(currentPlayId);

  useEffect(() => { movieService.warmCache(); }, []);

  useEffect(() => {
    if (playerState.open && currentPlayId) trackView();
  }, [playerState.open, currentPlayId, trackView]);

  const handlePlay = useCallback((movie: CardMovie) => {
    const videoUrl = movie.video_url ?? allMovies.movies.find(m => m.$id === movie.id)?.video_url;
    requestPlay({
      movieId:    movie.id,
      movieTitle: movie.title,
      posterUrl:  movie.img,
      isPremium:  movie.premium,
      onUnlocked: (_movieId: string) => {
        if (!videoUrl) return;
        setCurrentPlayId(movie.id);
        openPlayer(videoUrl, movie.title, movie.genre, movie.img);
      },
    });
  }, [allMovies.movies, requestPlay, openPlayer]);

  const handleShuffle = useCallback(() => {
    const list = allMovies.movies;
    if (!list.length) return;
    const r = toCard(list[Math.floor(Math.random() * list.length)]);
    setRandomMovie(r);
    handlePlay(r);
  }, [allMovies.movies, handlePlay]);

  const handleCollectionClick = useCallback((movies: Movie[], title: string) => {
    setCollectionView({ movies: movies.map(toCard), title });
    setActiveMood(null);
    setSearchVal("");
  }, []);

  const isSearching      = searchVal.trim().length > 0;
  const isCollectionView = !!collectionView;
  const initialLoading   = trending.loading && latest.loading && allMovies.movies.length === 0;

  return (
    <>
      {playerState.open && (
        <VideoPlayer src={playerState.src} title={playerState.title} subtitle={playerState.subtitle} poster={playerState.poster} onClose={closePlayer} autoPlay />
      )}

      <div style={{ display: "flex", height: "100svh", background: "var(--dj-bg-base)", overflow: "hidden" }}>
        {!isSmall && (
          <DashboardSidebar user={userObj} collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
        )}

        <div id="discover-col" style={{ flex: 1, minWidth: 0, height: "100svh", overflowY: "auto", overflowX: "hidden" }}>
          {/* Top bar */}
          <header style={{
            position: "sticky", top: 0, zIndex: 800,
            display: "flex", alignItems: "center", gap: 12,
            padding: "0 clamp(16px,3vw,28px)", height: 64,
            background: scrolled ? "rgba(var(--dj-bg-base-rgb, 8,8,8), 0.97)" : "rgba(var(--dj-bg-base-rgb, 8,8,8), 0.82)",
            backdropFilter: "blur(22px)",
            borderBottom: "1px solid var(--dj-border-subtle)",
            flexShrink: 0, transition: "background 0.3s",
          }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.15rem,2.5vw,1.75rem)", color: "var(--dj-text-primary)", letterSpacing: "0.1em", margin: 0, flexShrink: 0 }}>
              Discover
            </h1>

            <div style={{ flex: 1, maxWidth: 480 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 14px",
                background: searchFocused ? "var(--dj-nav-hover-bg)" : "var(--dj-bg-surface)",
                border: `1px solid ${searchFocused ? "var(--dj-border-accent)" : "var(--dj-border-subtle)"}`,
                borderRadius: 10, transition: "all 0.2s",
              }}>
                <Search size={13} color={searchFocused ? "var(--dj-accent)" : "var(--dj-icon-inactive)"} strokeWidth={1.8} />
                <input
                  value={searchVal}
                  onChange={e => { setSearchVal(e.target.value); setCollectionView(null); setActiveMood(null); }}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search movies, genres…"
                  style={{ flex: 1, background: "transparent", border: "none", color: "var(--dj-text-primary)", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none" }}
                />
                {searchVal && (
                  <button onClick={() => setSearchVal("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--dj-icon-inactive)", display: "flex" }}>
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={handleShuffle}
              className="dj-shuffle-btn"
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--dj-nav-active-bg)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--dj-bg-surface)"; }}
            >
              <Shuffle size={14} />
              {!isSmall && "Surprise Me"}
            </button>
          </header>

          {initialLoading ? (
            <div style={{ padding: "32px clamp(16px,3vw,28px)" }}>
              <div style={{ position: "relative", height: 280, borderRadius: 18, overflow: "hidden", background: "var(--dj-bg-elevated)", marginBottom: 44 }}><div className="dj-shimmer" /></div>
              <SkeletonRow isSmall={isSmall} />
              <SkeletonRow isSmall={isSmall} />
            </div>
          ) : (
            <div style={{ padding: `clamp(20px,3vw,36px) clamp(16px,3vw,28px) ${isSmall ? "120px" : "80px"}` }}>

              {isSearching ? (
                <SearchResults query={searchVal} results={searchResults} onPlay={handlePlay} onClose={() => setSearchVal("")} isSmall={isSmall} />

              ) : isCollectionView ? (
                <CollectionView title={collectionView!.title} movies={collectionView!.movies} onBack={() => setCollectionView(null)} onPlay={handlePlay} isSmall={isSmall} />

              ) : (
                <>
                  {motd && <MovieOfTheDay movie={motd} onPlay={() => handlePlay(motd)} />}
                  <MoodPicker active={activeMood} onChange={mood => { setActiveMood(mood); setCollectionView(null); }} />
                  {activeMood && (
                    moodMovies.loading ? <SkeletonRow isSmall={isSmall} /> : (
                      <MovieRow eyebrow={`${activeMoodData?.label} picks`} title={activeMoodData?.desc ?? ""} movies={moodMovies.movies.map(toCard)} onPlay={handlePlay} viewAll="/dashboard/movies" isSmall={isSmall} />
                    )
                  )}
                  {!activeMood && <Collections allMovies={allMovies.movies} onCollectionClick={handleCollectionClick} />}
                  {randomMovie && !activeMood && <SurpriseHighlight movie={randomMovie} onPlay={() => handlePlay(randomMovie)} />}
                  {trending.loading ? <SkeletonRow isSmall={isSmall} /> : (
                    <MovieRow eyebrow="Most Watched This Week" title="Trending Now" movies={trending.movies.map(toCard)} onPlay={handlePlay} viewAll="/dashboard/movies" isSmall={isSmall} />
                  )}
                  {allMovies.movies.filter(m => !m.premium_only).length > 0 && (
                    <MovieRow eyebrow="No Subscription Needed" title="Free to Watch" movies={allMovies.movies.filter(m => !m.premium_only).map(toCard)} onPlay={handlePlay} viewAll="/dashboard/movies" isSmall={isSmall} />
                  )}
                  {latest.loading ? <SkeletonRow isSmall={isSmall} /> : (
                    <MovieRow eyebrow="Just Added" title="New Arrivals" movies={latest.movies.map(toCard)} onPlay={handlePlay} viewAll="/dashboard/movies" isSmall={isSmall} />
                  )}
                  <div className="dj-divider" />
                  {topRated.loading ? <SkeletonRow isSmall={isSmall} /> : (
                    <MovieRow eyebrow="Highest Rated" title="Top Rated" movies={topRated.movies.map(toCard)} onPlay={handlePlay} viewAll="/dashboard/movies" isSmall={isSmall} />
                  )}
                  {!mostViewed.loading && mostViewed.movies.length > 0 && (
                    <MovieRow eyebrow="All-Time Most Popular" title="Most Viewed" movies={mostViewed.movies.map(toCard)} onPlay={handlePlay} viewAll="/dashboard/movies" isSmall={isSmall} />
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {isSmall && <MobileBottomNav />}
      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html, body { background: var(--dj-bg-base); color: var(--dj-text-primary); margin: 0; padding: 0; overflow: hidden; }
        #discover-col::-webkit-scrollbar { display: none; }
        #discover-col { scrollbar-width: none; }
        .dj-row-scroll::-webkit-scrollbar { display: none; }
        .dj-row-scroll { scrollbar-width: none; }

        /* Section accent bar */
        .dj-section-bar {
          width: 3px; height: 18px;
          background: var(--dj-accent);
          box-shadow: 0 0 8px var(--dj-accent-glow);
          border-radius: 2px; flex-shrink: 0;
        }

        /* Divider */
        .dj-divider {
          width: 100%; height: 1px;
          background: linear-gradient(90deg, transparent, var(--dj-border-accent), transparent);
          margin: 0 0 48px;
        }

        /* Chevron nav buttons */
        .dj-chevron-btn {
          width: 38px; height: 38px;
          background: var(--dj-bg-elevated);
          border: 1px solid var(--dj-border-medium);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--dj-text-primary);
          box-shadow: 0 4px 24px rgba(0,0,0,0.8);
          transition: background 0.16s, transform 0.16s;
        }
        .dj-chevron-btn:hover {
          background: var(--dj-accent);
          border-color: var(--dj-accent);
          transform: scale(1.1);
        }

        /* Card play button */
        .dj-card-play-btn {
          background: var(--dj-accent);
          box-shadow: 0 0 36px var(--dj-accent-glow);
        }

        /* Primary button */
        .dj-btn-primary {
          display: flex; align-items: center; gap: 8px;
          padding: 11px 24px;
          background: var(--dj-accent);
          border: none; border-radius: 9px;
          color: var(--dj-text-on-accent);
          font-size: 11px; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; font-family: "'DM Sans', sans-serif";
          cursor: pointer;
          box-shadow: 0 4px 22px var(--dj-accent-glow);
          transition: opacity 0.15s, transform 0.15s;
        }
        .dj-btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }

        /* Ghost button */
        .dj-btn-ghost {
          display: flex; align-items: center; gap: 6px;
          padding: 11px 18px;
          background: var(--dj-bg-surface);
          border: 1px solid var(--dj-border-medium);
          border-radius: 9px;
          color: var(--dj-text-secondary);
          font-size: 11px; font-weight: 600; letter-spacing: 0.07em;
          text-transform: uppercase; font-family: "'DM Sans', sans-serif";
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
        }
        .dj-btn-ghost:hover { background: var(--dj-nav-hover-bg); color: var(--dj-text-primary); }

        /* Shuffle button */
        .dj-shuffle-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 9px 16px;
          background: var(--dj-bg-surface);
          border: 1px solid var(--dj-border-accent);
          border-radius: 10px;
          color: var(--dj-accent);
          font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; font-family: "'DM Sans', sans-serif";
          cursor: pointer; flex-shrink: 0; transition: background 0.18s;
        }

        /* Small badges on cards */
        .dj-badge {
          position: absolute; top: 8px; left: 8px;
          font-size: 7px; padding: 2px 7px;
          border-radius: 3px; font-weight: 700;
          font-family: "'DM Sans', sans-serif"; letter-spacing: 0.22em;
        }
        .dj-badge--free  { background: rgba(34,197,94,0.2);  border: 1px solid rgba(74,222,128,0.35); color: #4ade80; }
        .dj-badge--owned { background: rgba(16,185,129,0.2); border: 1px solid rgba(16,185,129,0.38); color: #10b981; }
        .dj-badge--lock  { background: var(--dj-nav-active-bg); border: 1px solid var(--dj-border-accent); color: var(--dj-accent-light); }
        .dj-badge--hot   { background: var(--dj-nav-active-bg); border: 1px solid var(--dj-border-accent); color: var(--dj-accent-light); }

        /* Meta badges (MOTD) */
        .dj-meta-badge {
          display: flex; align-items: center; gap: 3px;
          font-size: 8px; padding: 3px 8px;
          border-radius: 3px; font-weight: 700;
          font-family: "'DM Sans', sans-serif"; letter-spacing: 0.3em;
          border: 1px solid transparent;
        }
        .dj-meta-badge--lock     { background: var(--dj-nav-active-bg);      border-color: var(--dj-border-accent);            color: var(--dj-accent);  }
        .dj-meta-badge--owned    { background: rgba(16,185,129,0.12);         border-color: rgba(16,185,129,0.25);              color: #10b981;           }
        .dj-meta-badge--trending { background: var(--dj-nav-active-bg);       border-color: var(--dj-border-accent);            color: var(--dj-accent);  }

        /* Shimmer skeleton */
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
          background: var(--dj-bg-elevated);
          position: relative; overflow: hidden; display: block;
        }
        .dj-sk::after {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0) 100%);
          background-size: 700px 100%;
          animation: djShimmer 1.6s ease-in-out infinite;
        }

        @keyframes discoPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.18); }
        }
        @keyframes popIn {
          from { transform: translate(-50%,-50%) scale(0.65); opacity: 0; }
          to   { transform: translate(-50%,-50%) scale(1);    opacity: 1; }
        }

        .dj-col-btn:hover {
          transform: translateY(-3px) !important;
          box-shadow: 0 14px 42px rgba(0,0,0,0.68) !important;
          border-color: var(--dj-border-medium) !important;
        }
        .dj-col-btn:hover .dj-col-img {
          transform: scale(1.07) !important;
          filter: brightness(0.56) saturate(1.55) !important;
        }
      `}</style>
    </>
  );
}