"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Play, Plus, Star, Check, Lock, Info, ChevronLeft, ChevronRight } from "lucide-react";

export interface MovieCardData {
  id: string;
  title: string;
  genre: string;
  year: number;
  rating: string;
  duration?: string;
  premium: boolean;
  dubbed?: boolean;
  img: string;
  progress?: number;
  inLibrary?: boolean;
  rank?: number;
}

interface MovieCardProps {
  movie: MovieCardData;
  size?: "sm" | "md" | "lg";
  onPlay?: (movie: MovieCardData) => void;
  onAddToLibrary?: (movie: MovieCardData) => void;
}

const SIZES = {
  sm: { width: 140, height: 200 },
  md: { width: 180, height: 260 },
  lg: { width: 220, height: 310 },
};

// aspect ratios per size so mobile can use % width + aspect-ratio
const ASPECT = {
  sm: 200 / 140,
  md: 260 / 180,
  lg: 310 / 220,
};

export default function MovieCard({ movie, size = "md", onPlay, onAddToLibrary }: MovieCardProps) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const [inLib, setInLib] = useState(movie.inLibrary ?? false);
  const dim = SIZES[size];

  return (
    <>
      <style>{`
        .movie-card {
          width: ${dim.width}px;
          height: ${dim.height}px;
          flex-shrink: 0;
        }
        /* Mobile: 2 per row using aspect-ratio, no fixed height */
        @media (max-width: 768px) {
          .movie-card {
            width: calc(50vw - 20px);
            height: auto;
            aspect-ratio: ${dim.width} / ${dim.height};
            flex-shrink: 0;
          }
        }
      `}</style>
      <div
        className="movie-card"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: "relative",
          cursor: "pointer",
          overflow: "hidden",
          borderRadius: 10,
          transform: hovered ? "scale(1.05) translateY(-8px)" : "scale(1) translateY(0)",
          transition: "transform 0.45s cubic-bezier(0.22,1,0.36,1), box-shadow 0.45s ease",
          boxShadow: hovered
            ? "0 32px 64px rgba(0,0,0,0.8), 0 0 0 1.5px rgba(229,9,20,0.5)"
            : "0 8px 24px rgba(0,0,0,0.5)",
          zIndex: hovered ? 20 : 1,
        }}
      >
        <Image
          src={movie.img}
          alt={movie.title}
          fill
          sizes={`(max-width: 768px) 50vw, ${dim.width}px`}
          className="object-cover"
          style={{ transform: hovered ? "scale(1.08)" : "scale(1)", transition: "transform 0.6s ease" }}
          draggable={false}
        />

        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.05) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0.2) 100%)", opacity: hovered ? 1 : 0, transition: "opacity 0.35s ease" }} />

        {/* Badges */}
        <div style={{ position: "absolute", top: 10, left: 10, right: 10, display: "flex", justifyContent: "space-between", alignItems: "flex-start", zIndex: 3 }}>
          <span style={{
            fontSize: 7.5, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase",
            padding: "3px 7px", borderRadius: 4,
            background: movie.premium ? "#e50914" : "rgba(255,255,255,0.08)",
            color: movie.premium ? "#fff" : "rgba(255,255,255,0.55)",
            border: movie.premium ? "none" : "1px solid rgba(255,255,255,0.12)",
            display: "flex", alignItems: "center", gap: 3,
          }}>
            {movie.premium && <Lock size={7} />}
            {movie.premium ? "Premium" : "Free"}
          </span>
          {movie.rank && movie.rank <= 10 && (
            <span style={{ fontSize: 7, padding: "2px 6px", borderRadius: 4, background: "rgba(229,9,20,0.15)", color: "#e50914", border: "1px solid rgba(229,9,20,0.3)" }}>
              #{movie.rank}
            </span>
          )}
        </div>

        {/* Resting title */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 12px", zIndex: 3, opacity: hovered ? 0 : 1, transition: "opacity 0.25s ease" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {movie.title}
          </div>
          {movie.progress !== undefined && movie.progress > 0 && (
            <div style={{ marginTop: 5, height: 2, background: "rgba(255,255,255,0.1)", borderRadius: 2 }}>
              <div style={{ height: "100%", width: `${movie.progress}%`, background: "#e50914", borderRadius: 2 }} />
            </div>
          )}
        </div>

        {/* Hover panel */}
        <div style={{ position: "absolute", inset: 0, zIndex: 4, opacity: hovered ? 1 : 0, transition: "opacity 0.3s ease", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "14px 12px" }}>
          <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase", color: "#e50914", marginBottom: 4 }}>{movie.genre}</span>
          <div style={{ fontSize: 16, color: "#fff", letterSpacing: "0.06em", lineHeight: 1, marginBottom: 5 }}>{movie.title}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{movie.year}</span>
            {movie.duration && <><span style={{ width: 2, height: 2, borderRadius: "50%", background: "rgba(255,255,255,0.2)" }} /><span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{movie.duration}</span></>}
            <span style={{ width: 2, height: 2, borderRadius: "50%", background: "rgba(255,255,255,0.2)" }} />
            <span style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 10, color: "#c9a84c", fontWeight: 600 }}>
              <Star size={8} fill="#c9a84c" color="#c9a84c" />{movie.rating}
            </span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={(e) => { e.stopPropagation(); onPlay?.(movie); }} style={{ flex: 1, height: 32, background: "#e50914", border: "none", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, cursor: "pointer", color: "#fff", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>
              <Play size={11} fill="#fff" /> Watch
            </button>
            <button onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/movies/${movie.id}`); }} style={{ width: 32, height: 32, borderRadius: 6, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} title="More Info">
              <Info size={13} color="rgba(255,255,255,0.8)" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setInLib(v => !v); onAddToLibrary?.(movie); }} style={{ width: 32, height: 32, borderRadius: 6, background: inLib ? "rgba(37,211,102,0.12)" : "rgba(255,255,255,0.07)", border: `1px solid ${inLib ? "rgba(37,211,102,0.3)" : "rgba(255,255,255,0.12)"}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              {inLib ? <Check size={13} color="#25d366" /> : <Plus size={13} color="rgba(255,255,255,0.6)" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── MOVIE ROW ─────────────────────────────────────────────────────────────────

interface MovieRowProps {
  title: string;
  eyebrow?: string;
  movies: MovieCardData[];
  size?: "sm" | "md" | "lg";
  onPlay?: (movie: MovieCardData) => void;
  onAddToLibrary?: (movie: MovieCardData) => void;
  viewAllHref?: string;
  autoScroll?: boolean;
}

export function MovieRow({ title, eyebrow, movies, size = "md", onPlay, onAddToLibrary, viewAllHref = "/dashboard/movies" }: MovieRowProps) {
  const router    = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const SCROLL_AMT = (SIZES[size].width + 12) * 3;

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "right" ? SCROLL_AMT : -SCROLL_AMT, behavior: "smooth" });
  };

  if (!movies.length) return null;

  const chevron = (side: "left" | "right"): React.CSSProperties => ({
    position: "absolute",
    top: "50%",
    [side]: 8,
    transform: "translateY(-50%)",
    zIndex: 30,
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "rgba(15,15,15,0.85)",
    border: "1px solid rgba(255,255,255,0.15)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "rgba(255,255,255,0.85)",
    transition: "background 0.2s",
  });

  return (
    <div style={{ marginBottom: 44 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          {eyebrow && (
            <span style={{ fontSize: 9, letterSpacing: "0.45em", textTransform: "uppercase", color: "#e50914", fontWeight: 700, display: "block", marginBottom: 4 }}>
              {eyebrow}
            </span>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 3, height: 18, background: "#e50914", borderRadius: 2, boxShadow: "0 0 8px rgba(229,9,20,0.5)" }} />
            <h2 style={{ fontSize: "clamp(1.2rem,2.5vw,1.6rem)", fontFamily: "var(--font-display)", letterSpacing: "0.07em", color: "#fff", margin: 0 }}>{title}</h2>
          </div>
        </div>
        <button onClick={() => router.push(viewAllHref)} style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", background: "none", border: "none", fontWeight: 600, cursor: "pointer" }}>
          View All →
        </button>
      </div>

      <div style={{ position: "relative", paddingTop: 10, paddingBottom: 18 }}>
        <button className="row-chevron" onClick={() => scroll("left")} style={chevron("left")} aria-label="Scroll left"><ChevronLeft size={16} /></button>
        <button className="row-chevron" onClick={() => scroll("right")} style={chevron("right")} aria-label="Scroll right"><ChevronRight size={16} /></button>

        <div
          ref={scrollRef}
          style={{ display: "flex", gap: 12, overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none", paddingLeft: 2, paddingRight: 2 }}
        >
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} size={size} onPlay={onPlay} onAddToLibrary={onAddToLibrary} />
          ))}
        </div>
      </div>

      <style>{`
        div::-webkit-scrollbar { display: none; }
        @media (max-width: 768px) { .row-chevron { display: none !important; } }
        .row-chevron:hover { background: rgba(229,9,20,0.85) !important; }
      `}</style>
    </div>
  );
}

// ── MOVIE GRID — 2 cols on mobile, auto on desktop ────────────────────────────

interface MovieGridProps {
  movies: MovieCardData[];
  size?: "sm" | "md" | "lg";
  onPlay?: (movie: MovieCardData) => void;
  columns?: number;
}

export function MovieGrid({ movies, size = "md", onPlay, columns }: MovieGridProps) {
  const w = SIZES[size].width;
  return (
    <>
      <style>{`
        .movie-grid {
          display: grid;
          grid-template-columns: ${columns ? `repeat(${columns}, 1fr)` : `repeat(auto-fill, minmax(${w}px, 1fr))`};
          gap: 14px;
        }
        @media (max-width: 768px) {
          .movie-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px;
          }
        }
      `}</style>
      <div className="movie-grid">
        {movies.map(movie => (
          <MovieCard key={movie.id} movie={movie} size={size} onPlay={onPlay} />
        ))}
      </div>
    </>
  );
}