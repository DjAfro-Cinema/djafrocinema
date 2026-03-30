"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Play, Plus, Star, Check, Lock, Info, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import PremiumPlayButton from "@/components/payment/Premiumplaybutton";
import { usePremiumGate } from "@/context/PremiumGateContext";
import { useTheme } from "@/context/ThemeContext";

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
  userId?: string;
  isPaid?: boolean;
}

interface MovieCardProps {
  movie: MovieCardData;
  size?: "sm" | "md" | "lg";
  userId: string;
  isPaid?: boolean;
  // Index in row — cards near the start load eagerly, rest lazy
  index?: number;
  onPlay?: (movie: MovieCardData) => void;
  onAddToLibrary?: (movie: MovieCardData) => void;
}

const SIZES = {
  sm: { width: 140, height: 200 },
  md: { width: 180, height: 260 },
  lg: { width: 220, height: 310 },
};

// How many cards per row load eagerly (visible without scrolling)
const EAGER_THRESHOLD = 4;

export default function MovieCard({
  movie,
  size = "md",
  userId,
  isPaid: seedIsPaid = false,
  index = 0,
  onPlay,
  onAddToLibrary,
}: MovieCardProps) {
  const router = useRouter();
  const { t } = useTheme();
  const [hovered, setHovered] = useState(false);
  const [inLib, setInLib]     = useState(movie.inLibrary ?? false);
  // Track whether the card is in the viewport for intersection-observer lazy load
  const [visible, setVisible] = useState(index < EAGER_THRESHOLD);
  const cardRef               = useRef<HTMLDivElement>(null);
  const dim = SIZES[size];

  const { paidMovieIds: contextPaidIds } = usePremiumGate();
  const isPaid = seedIsPaid || contextPaidIds.includes(movie.id);

  const showPaidBadge = movie.premium && isPaid;
  const showLock      = movie.premium && !isPaid;

  // Intersection Observer: reveal image only when card scrolls into view
  useEffect(() => {
    // Cards near the start are already marked visible — skip observer
    if (index < EAGER_THRESHOLD) return;

    const el = cardRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect(); // Once visible, never unload
        }
      },
      {
        // rootMargin: pre-load images 200px before they scroll into view
        rootMargin: "0px 200px 0px 200px",
        threshold: 0,
      }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [index]);

  const handlePlay = (movieId: string) => {
    onPlay?.(movie);
    if (!onPlay) router.push(`/dashboard/watch/${movieId}`);
  };

  // Eager for first few cards in a row, lazy for the rest
  const imgPriority = index < EAGER_THRESHOLD;
  const imgLoading  = imgPriority ? ("eager" as const) : ("lazy" as const);

  return (
    <>
      <style>{`
        .movie-card-${movie.id} {
          width: ${dim.width}px;
          height: ${dim.height}px;
          flex-shrink: 0;
        }
        @media (max-width: 768px) {
          .movie-card-${movie.id} {
            width: calc(50vw - 20px);
            height: auto;
            aspect-ratio: ${dim.width} / ${dim.height};
            flex-shrink: 0;
          }
        }
      `}</style>

      <div
        ref={cardRef}
        className={`movie-card-${movie.id}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: "relative",
          cursor: "pointer",
          overflow: "hidden",
          borderRadius: 10,
          // Solid placeholder background shown while image loads — prevents layout shift
          backgroundColor: "rgba(255,255,255,0.04)",
          transform: hovered ? "scale(1.05) translateY(-8px)" : "scale(1) translateY(0)",
          transition: "transform 0.45s cubic-bezier(0.22,1,0.36,1), box-shadow 0.45s ease",
          boxShadow: hovered
            ? `0 32px 64px rgba(0,0,0,0.8), 0 0 0 1.5px ${t.borderAccent}`
            : "0 8px 24px rgba(0,0,0,0.5)",
          zIndex: hovered ? 20 : 1,
        }}
      >
        {/* Only mount <Image> once the card is visible in the viewport */}
        {visible && (
          <Image
            src={movie.img}
            alt={movie.title}
            fill
            // More specific sizes = browser fetches smaller srcset variant = faster
            sizes={`(max-width: 768px) 50vw, ${dim.width}px`}
            className="object-cover"
            priority={imgPriority}
            loading={imgLoading}
            // Slightly compress non-hero card images; imperceptible at card size
            quality={imgPriority ? 80 : 70}
            style={{
              transform: hovered ? "scale(1.08)" : "scale(1)",
              transition: "transform 0.6s ease",
            }}
            draggable={false}
          />
        )}

        {/* Gradients */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.05) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0.2) 100%)", opacity: hovered ? 1 : 0, transition: "opacity 0.35s ease" }} />

        {/* ── Top badges ── */}
        <div style={{ position: "absolute", top: 10, left: 10, right: 10, display: "flex", justifyContent: "space-between", alignItems: "flex-start", zIndex: 3 }}>
          {showPaidBadge ? (
            <span style={{
              fontSize: 7.5, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase",
              padding: "3px 7px", borderRadius: 4,
              background: "rgba(16,185,129,0.15)", color: t.success,
              border: `1px solid rgba(16,185,129,0.3)`,
              display: "flex", alignItems: "center", gap: 3,
              transition: "all 0.3s ease",
            }}>
              <CheckCircle2 size={7} /> Owned
            </span>
          ) : (
            <span style={{
              fontSize: 7.5, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase",
              padding: "3px 7px", borderRadius: 4,
              background: movie.premium ? `${t.accent}26` : t.navHoverBg,
              color: movie.premium ? t.accent : t.textSecondary,
              border: movie.premium ? `1px solid ${t.borderAccent}` : `1px solid ${t.borderSubtle}`,
              display: "flex", alignItems: "center", gap: 3,
              transition: "all 0.3s ease",
            }}>
              {movie.premium && <Lock size={7} />}
              {movie.premium ? "Premium" : "Free"}
            </span>
          )}

          {movie.rank && movie.rank <= 10 && (
            <span style={{
              fontSize: 7, padding: "2px 6px", borderRadius: 4,
              background: `${t.accent}26`, color: t.accent,
              border: `1px solid ${t.borderAccent}`,
            }}>
              #{movie.rank}
            </span>
          )}
        </div>

        {/* Lock vignette */}
        {showLock && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 2,
            background: "rgba(0,0,0,0.18)",
            backdropFilter: "blur(0.5px)",
            pointerEvents: "none",
          }} />
        )}

        {/* KES 10 price tag */}
        {showLock && !hovered && (
          <div style={{
            position: "absolute", bottom: 38, right: 8, zIndex: 4,
            background: t.accent,
            padding: "2px 7px", borderRadius: 4,
            fontSize: 8, fontWeight: 700, color: t.textOnAccent,
            letterSpacing: "0.05em",
          }}>
            KES 10
          </div>
        )}

        {/* ── Resting title ── */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "10px 12px", zIndex: 3,
          opacity: hovered ? 0 : 1, transition: "opacity 0.25s ease",
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: t.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {movie.title}
          </div>
          {movie.progress !== undefined && movie.progress > 0 && (
            <div style={{ marginTop: 5, height: 2, background: t.borderSubtle, borderRadius: 2 }}>
              <div style={{ height: "100%", width: `${movie.progress}%`, background: t.accent, borderRadius: 2 }} />
            </div>
          )}
        </div>

        {/* ── Hover panel ── */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 4,
          opacity: hovered ? 1 : 0, transition: "opacity 0.3s ease",
          display: "flex", flexDirection: "column", justifyContent: "flex-end",
          padding: "14px 12px",
        }}>
          <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase", color: t.accent, marginBottom: 4 }}>
            {movie.genre}
          </span>
          <div style={{ fontSize: 16, color: t.textPrimary, letterSpacing: "0.06em", lineHeight: 1, marginBottom: 5 }}>
            {movie.title}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
            <span style={{ fontSize: 10, color: t.textSecondary }}>{movie.year}</span>
            {movie.duration && (
              <>
                <span style={{ width: 2, height: 2, borderRadius: "50%", background: t.borderMedium }} />
                <span style={{ fontSize: 10, color: t.textSecondary }}>{movie.duration}</span>
              </>
            )}
            <span style={{ width: 2, height: 2, borderRadius: "50%", background: t.borderMedium }} />
            <span style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 10, color: t.warning, fontWeight: 600 }}>
              <Star size={8} fill={t.warning} color={t.warning} /> {movie.rating}
            </span>
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            <PremiumPlayButton
              movieId={movie.id}
              movieTitle={movie.title}
              posterUrl={movie.img}
              isPremium={movie.premium}
              isPaid={isPaid}
              userId={userId}
              onPlay={handlePlay}
              style={{
                flex: 1, height: 32,
                background: isPaid || !movie.premium ? t.accent : `${t.accent}bf`,
                border: "none", borderRadius: 6,
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 5, cursor: "pointer", color: t.textOnAccent,
                fontSize: 9.5, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase",
                transition: "background 0.3s ease",
              }}
            >
              {showLock ? <Lock size={10} /> : <Play size={11} fill={t.textOnAccent} />}
              {showLock ? "Unlock" : "Watch"}
            </PremiumPlayButton>

            <button
              onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/movies/${movie.id}`); }}
              style={{
                width: 32, height: 32, borderRadius: 6,
                background: t.navHoverBg, border: `1px solid ${t.borderMedium}`,
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              }}
              title="More Info"
            >
              <Info size={13} color={t.textSecondary} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setInLib((v) => !v);
                onAddToLibrary?.(movie);
              }}
              style={{
                width: 32, height: 32, borderRadius: 6,
                background: inLib ? "rgba(37,211,102,0.12)" : t.navHoverBg,
                border: `1px solid ${inLib ? "rgba(37,211,102,0.3)" : t.borderSubtle}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}
            >
              {inLib ? <Check size={13} color={t.success} /> : <Plus size={13} color={t.textSecondary} />}
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
  userId: string;
  paidMovieIds?: string[];
  onPlay?: (movie: MovieCardData) => void;
  onAddToLibrary?: (movie: MovieCardData) => void;
  viewAllHref?: string;
}

export function MovieRow({
  title,
  eyebrow,
  movies,
  size = "md",
  userId,
  paidMovieIds = [],
  onPlay,
  onAddToLibrary,
  viewAllHref = "/dashboard/movies",
}: MovieRowProps) {
  const router    = useRouter();
  const { t }     = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);
  const SCROLL_AMT = (SIZES[size].width + 12) * 3;

  const { paidMovieIds: contextPaidIds } = usePremiumGate();
  const mergedPaidIds = [...new Set([...paidMovieIds, ...contextPaidIds])];

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "right" ? SCROLL_AMT : -SCROLL_AMT, behavior: "smooth" });
  };

  if (!movies.length) return null;

  const chevron = (side: "left" | "right"): React.CSSProperties => ({
    position: "absolute", top: "50%", [side]: 8,
    transform: "translateY(-50%)", zIndex: 30,
    width: 36, height: 36, borderRadius: "50%",
    background: t.bgElevated,
    border: `1px solid ${t.borderMedium}`,
    backdropFilter: "blur(8px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", color: t.textSecondary, transition: "background 0.2s",
  });

  return (
    <div style={{ marginBottom: 44 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          {eyebrow && (
            <span style={{ fontSize: 9, letterSpacing: "0.45em", textTransform: "uppercase", color: t.accent, fontWeight: 700, display: "block", marginBottom: 4 }}>
              {eyebrow}
            </span>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 3, height: 18, background: t.accent, borderRadius: 2, boxShadow: `0 0 8px ${t.accentGlow}` }} />
            <h2 style={{ fontSize: "clamp(1.2rem,2.5vw,1.6rem)", fontFamily: "var(--font-display)", letterSpacing: "0.07em", color: t.textPrimary, margin: 0 }}>
              {title}
            </h2>
          </div>
        </div>
        <button
          onClick={() => router.push(viewAllHref)}
          style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: t.textMuted, background: "none", border: "none", fontWeight: 600, cursor: "pointer" }}
        >
          View All →
        </button>
      </div>

      <div style={{ position: "relative", paddingTop: 10, paddingBottom: 18 }}>
        <button className="row-chevron" onClick={() => scroll("left")} style={chevron("left")} aria-label="Scroll left">
          <ChevronLeft size={16} />
        </button>
        <button className="row-chevron" onClick={() => scroll("right")} style={chevron("right")} aria-label="Scroll right">
          <ChevronRight size={16} />
        </button>

        <div ref={scrollRef} style={{ display: "flex", gap: 12, overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none", paddingLeft: 2, paddingRight: 2 }}>
          {movies.map((movie, i) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              size={size}
              userId={userId}
              isPaid={mergedPaidIds.includes(movie.id)}
              // Pass index so first N cards load eagerly, rest lazy
              index={i}
              onPlay={onPlay}
              onAddToLibrary={onAddToLibrary}
            />
          ))}
        </div>
      </div>

      <style>{`
        div::-webkit-scrollbar { display: none; }
        @media (max-width: 768px) { .row-chevron { display: none !important; } }
        .row-chevron:hover { background: var(--dj-accent) !important; color: var(--dj-text-on-accent) !important; }
      `}</style>
    </div>
  );
}

// ── MOVIE GRID ────────────────────────────────────────────────────────────────

interface MovieGridProps {
  movies: MovieCardData[];
  size?: "sm" | "md" | "lg";
  userId: string;
  paidMovieIds?: string[];
  onPlay?: (movie: MovieCardData) => void;
  columns?: number;
}

export function MovieGrid({ movies, size = "md", userId, paidMovieIds = [], onPlay, columns }: MovieGridProps) {
  const w = SIZES[size].width;
  const { paidMovieIds: contextPaidIds } = usePremiumGate();
  const mergedPaidIds = [...new Set([...paidMovieIds, ...contextPaidIds])];

  return (
    <>
      <style>{`
        .movie-grid {
          display: grid;
          grid-template-columns: ${columns ? `repeat(${columns}, 1fr)` : `repeat(auto-fill, minmax(${w}px, 1fr))`};
          gap: 14px;
        }
        @media (max-width: 768px) {
          .movie-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px; }
        }
      `}</style>
      <div className="movie-grid">
        {movies.map((movie, i) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            size={size}
            userId={userId}
            isPaid={mergedPaidIds.includes(movie.id)}
            // First 8 in grid load eagerly (above fold), rest lazy
            index={i}
            onPlay={onPlay}
          />
        ))}
      </div>
    </>
  );
}