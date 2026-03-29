"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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

export default function MovieCard({
  movie,
  size = "md",
  onPlay,
  onAddToLibrary,
}: MovieCardProps) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const [inLib, setInLib] = useState(movie.inLibrary ?? false);
  const dim = SIZES[size];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: dim.width,
        height: dim.height,
        flexShrink: 0,
        position: "relative",
        cursor: "pointer",
        overflow: "hidden",
        transform: hovered ? "scale(1.05) translateY(-8px)" : "scale(1) translateY(0)",
        transition: "transform 0.45s cubic-bezier(0.22,1,0.36,1), box-shadow 0.45s ease",
        boxShadow: hovered
          ? "0 32px 64px rgba(0,0,0,0.8), 0 0 0 1.5px rgba(229,9,20,0.5)"
          : "0 8px 24px rgba(0,0,0,0.5)",
        zIndex: hovered ? 20 : 1,
      }}
    >
      {/* Poster */}
      <Image
        src={movie.img}
        alt={movie.title}
        fill
        sizes={`${dim.width}px`}
        className="object-cover"
        style={{
          transform: hovered ? "scale(1.08)" : "scale(1)",
          transition: "transform 0.6s ease",
        }}
        draggable={false}
      />

      {/* Dark gradient — always */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.05) 100%)",
      }} />

      {/* Hover: stronger overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0.2) 100%)",
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.35s ease",
      }} />

      {/* Top badges */}
      <div style={{
        position: "absolute", top: 10, left: 10, right: 10,
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        zIndex: 3,
      }}>
        <span style={{
          fontSize: 7.5,
          fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
          fontWeight: 700,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          padding: "3px 7px",
          background: movie.premium ? "#e50914" : "rgba(255,255,255,0.08)",
          color: movie.premium ? "#fff" : "rgba(255,255,255,0.55)",
          border: movie.premium ? "none" : "1px solid rgba(255,255,255,0.12)",
          display: "flex", alignItems: "center", gap: 3,
        }}>
          {movie.premium && <Lock size={7} />}
          {movie.premium ? "Premium" : "Free"}
        </span>

        {movie.rank && movie.rank <= 10 && (
          <span style={{
            fontSize: 7,
            fontFamily: "var(--font-display)",
            letterSpacing: "0.1em",
            padding: "2px 6px",
            background: "rgba(229,9,20,0.15)",
            color: "#e50914",
            border: "1px solid rgba(229,9,20,0.3)",
          }}>#{movie.rank}</span>
        )}
      </div>

      {/* Bottom info — not hovered */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "10px 12px",
        zIndex: 3,
        opacity: hovered ? 0 : 1,
        transition: "opacity 0.25s ease",
      }}>
        <div style={{
          fontSize: 12,
          fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
          fontWeight: 600,
          color: "#fff",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>{movie.title}</div>

        {movie.progress !== undefined && movie.progress > 0 && (
          <div style={{ marginTop: 5, height: 2, background: "rgba(255,255,255,0.1)" }}>
            <div style={{ height: "100%", width: `${movie.progress}%`, background: "#e50914" }} />
          </div>
        )}
      </div>

      {/* Hover panel */}
      <div style={{
        position: "absolute", inset: 0,
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.3s ease",
        zIndex: 4,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "14px 12px",
      }}>
        <span style={{
          fontSize: 8,
          fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
          fontWeight: 700,
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          color: "#e50914",
          marginBottom: 4,
        }}>{movie.genre}</span>

        <div style={{
          fontSize: 16,
          fontFamily: "var(--font-display)",
          color: "#fff",
          letterSpacing: "0.06em",
          lineHeight: 1,
          marginBottom: 5,
        }}>{movie.title}</div>

        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}>{movie.year}</span>
          {movie.duration && (
            <>
              <span style={{ width: 2, height: 2, borderRadius: "50%", background: "rgba(255,255,255,0.2)" }} />
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}>{movie.duration}</span>
            </>
          )}
          <span style={{ width: 2, height: 2, borderRadius: "50%", background: "rgba(255,255,255,0.2)" }} />
          <span style={{
            display: "flex", alignItems: "center", gap: 2,
            fontSize: 10, color: "#c9a84c",
            fontFamily: "var(--font-body, 'DM Sans', sans-serif)", fontWeight: 600,
          }}>
            <Star size={8} fill="#c9a84c" color="#c9a84c" />{movie.rating}
          </span>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 6 }}>
          {/* Watch */}
          <button
            onClick={(e) => { e.stopPropagation(); onPlay?.(movie); }}
            style={{
              flex: 1, height: 32, background: "#e50914", border: "none",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              cursor: "pointer", color: "#fff", fontSize: 9.5,
              fontFamily: "var(--font-body, 'DM Sans', sans-serif)", fontWeight: 700,
              letterSpacing: "0.2em", textTransform: "uppercase",
            }}
          >
            <Play size={11} fill="#fff" /> Watch
          </button>

          {/* More Info — navigates to detail page */}
          <button
            onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/movies/${movie.id}`); }}
            style={{
              width: 32, height: 32,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "all 0.2s",
            }}
            title="More Info"
          >
            <Info size={13} color="rgba(255,255,255,0.8)" />
          </button>

          {/* Library toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setInLib(v => !v);
              onAddToLibrary?.(movie);
            }}
            style={{
              width: 32, height: 32,
              background: inLib ? "rgba(37,211,102,0.12)" : "rgba(255,255,255,0.07)",
              border: `1px solid ${inLib ? "rgba(37,211,102,0.3)" : "rgba(255,255,255,0.12)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "all 0.2s",
            }}
          >
            {inLib ? <Check size={13} color="#25d366" /> : <Plus size={13} color="rgba(255,255,255,0.6)" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── AUTO-SCROLLING MOVIE ROW ──────────────────────────────────────────────────

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

export function MovieRow({
  title,
  eyebrow,
  movies,
  size = "md",
  onPlay,
  onAddToLibrary,
  viewAllHref = "/dashboard/movies",
  autoScroll = true,
}: MovieRowProps) {
  const router = useRouter();
  const trackRef  = useRef<HTMLDivElement>(null);
  const animRef   = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const posRef    = useRef(0);
  const SPEED     = 0.5; // px per frame — slow & subtle

  // Duplicate movies for seamless infinite loop
  const doubled = [...movies, ...movies];

  const startScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const halfW = el.scrollWidth / 2;

    const tick = () => {
      if (!pausedRef.current) {
        posRef.current += SPEED;
        if (posRef.current >= halfW) posRef.current = 0;
        el.style.transform = `translateX(-${posRef.current}px)`;
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (!autoScroll) return;
    startScroll();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [autoScroll, startScroll]);

  // Pause on hover / touch
  const pause = () => { pausedRef.current = true; };
  const resume = () => { pausedRef.current = false; };

  // Manual chevron scroll (nudge by card width)
  const nudge = (dir: "left" | "right") => {
    const cardW = SIZES[size].width + 12;
    posRef.current = Math.max(0, posRef.current + (dir === "right" ? cardW * 2 : -cardW * 2));
  };

  if (!movies.length) return null;

  return (
    <div style={{ marginBottom: 44 }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18,
      }}>
        <div>
          {eyebrow && (
            <span style={{
              fontSize: 9, letterSpacing: "0.45em", textTransform: "uppercase",
              color: "#e50914", fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
              display: "block", marginBottom: 4,
            }}>{eyebrow}</span>
          )}
          {title && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 3, height: 18, background: "#e50914", boxShadow: "0 0 8px rgba(229,9,20,0.5)" }} />
              <h2 style={{
                fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)",
                fontFamily: "var(--font-display)", letterSpacing: "0.07em", color: "#fff", margin: 0,
              }}>{title}</h2>
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Desktop chevrons */}
          <div style={{ display: "flex", gap: 4 }}>
            <button
              onClick={() => nudge("left")}
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "rgba(255,255,255,0.4)", transition: "all 0.2s",
              }}
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => nudge("right")}
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "rgba(255,255,255,0.4)", transition: "all 0.2s",
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <button
            onClick={() => router.push(viewAllHref)}
            style={{
              fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.28)", background: "none", border: "none",
              fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
            }}
          >
            View All →
          </button>
        </div>
      </div>

      {/* Scroll track — clips overflow */}
      <div
        style={{ overflow: "hidden", position: "relative", paddingTop: 8, paddingBottom: 16 }}
        onMouseEnter={pause}
        onMouseLeave={resume}
        onTouchStart={pause}
        onTouchEnd={resume}
      >
        {/* Touch-scrollable on mobile via natural scroll; auto-scroll on desktop */}
        <div
          ref={trackRef}
          style={{
            display: "flex",
            gap: 12,
            willChange: "transform",
            // On mobile: let it scroll naturally
            overflowX: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {doubled.map((movie, i) => (
            <MovieCard
              key={`${movie.id}-${i}`}
              movie={movie}
              size={size}
              onPlay={onPlay}
              onAddToLibrary={onAddToLibrary}
            />
          ))}
        </div>
      </div>

      <style>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

// ── MOVIE GRID ────────────────────────────────────────────────────────────────

interface MovieGridProps {
  movies: MovieCardData[];
  size?: "sm" | "md" | "lg";
  onPlay?: (movie: MovieCardData) => void;
  columns?: number;
}

export function MovieGrid({ movies, size = "md", onPlay, columns }: MovieGridProps) {
  const w = SIZES[size].width;
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: columns
        ? `repeat(${columns}, 1fr)`
        : `repeat(auto-fill, minmax(${w}px, 1fr))`,
      gap: 14,
    }}>
      {movies.map(movie => (
        <MovieCard key={movie.id} movie={movie} size={size} onPlay={onPlay} />
      ))}
    </div>
  );
}