"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTrendingMovies } from "@/hooks/useTrendingMovies";
import type { Movie } from "@/types/movie.types";

// ─── SKELETON CARD ─────────────────────────────────────────────────────────────
function SkeletonRow({ idx }: { idx: number }) {
  return (
    <div
      className="tr-row tr-skeleton"
      style={{ animationDelay: `${idx * 80}ms` }}
    >
      <div className="tr-rank-col">
        <div className="skel-block" style={{ width: 28, height: 28 }} />
      </div>
      <div className="tr-poster-wrap">
        <div className="skel-block" style={{ width: "100%", height: "100%", borderRadius: 3 }} />
      </div>
      <div className="tr-info-col">
        <div className="skel-block" style={{ width: "38%", height: 8, marginBottom: 10 }} />
        <div className="skel-block" style={{ width: "72%", height: 18, marginBottom: 8 }} />
        <div className="skel-block" style={{ width: "52%", height: 8 }} />
      </div>
      <div className="tr-stat-col">
        <div className="skel-block" style={{ width: 36, height: 28 }} />
      </div>
    </div>
  );
}

// ─── SINGLE ROW ────────────────────────────────────────────────────────────────
function TrendingRow({
  movie,
  rank,
  inView,
  onNavigate,
}: {
  movie: Movie;
  rank: number;
  inView: boolean;
  onNavigate: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const rankStr = String(rank).padStart(2, "0");

  // Derive a "views" label from view_count
  const viewLabel =
    movie.view_count >= 1000
      ? `${(movie.view_count / 1000).toFixed(1)}K`
      : String(movie.view_count);

  const genre = Array.isArray(movie.genre) ? movie.genre[0] ?? "Movie" : "Movie";

  return (
    <div
      className={`tr-row${hovered ? " tr-hov" : ""}${inView ? " tr-in" : " tr-out"}`}
      style={{ transitionDelay: `${(rank - 1) * 65}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onNavigate}
    >
      {/* ── Rank watermark ── */}
      <div
        className="tr-wm"
        style={{
          color: hovered ? "#e50914" : "#fff",
          opacity: hovered ? 0.06 : 0.025,
        }}
      >
        {rankStr}
      </div>

      {/* ── Rank number ── */}
      <div className="tr-rank-col">
        <span
          className="tr-rank-num"
          style={{ color: hovered ? "#e50914" : "rgba(255,255,255,0.18)" }}
        >
          {rankStr}
        </span>
        {rank <= 3 && (
          <span className="tr-rank-crown" style={{ opacity: hovered ? 1 : 0.4 }}>
            {rank === 1 ? "◆" : rank === 2 ? "◇" : "▸"}
          </span>
        )}
      </div>

      {/* ── Poster ── */}
      <div className={`tr-poster-wrap${hovered ? " tr-poster-hov" : ""}`}>
        {!imgLoaded && <div className="tr-poster-skel" />}
        {movie.poster_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={movie.poster_url}
            alt={movie.title}
            className="tr-poster-img"
            loading="lazy"
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            style={{ opacity: imgLoaded ? 1 : 0 }}
          />
        )}
        {!movie.poster_url && (
          <div className="tr-poster-fallback">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(255,255,255,0.15)">
              <path d="M18 3H6a3 3 0 00-3 3v12a3 3 0 003 3h12a3 3 0 003-3V6a3 3 0 00-3-3zM8 5v14l11-7z" />
            </svg>
          </div>
        )}
        <div className="tr-poster-grad" />
        {movie.premium_only && <div className="tr-poster-dot" />}
      </div>

      {/* ── Info ── */}
      <div className="tr-info-col">
        {/* Genre + year row */}
        <div className="tr-meta-row">
          <span className="tr-genre">{genre}</span>
          <span className="tr-meta-sep">·</span>
          <span className="tr-year">{movie.release_year ?? "—"}</span>
          {movie.premium_only && <span className="tr-premium-tag">PREMIUM</span>}
        </div>

        {/* Title */}
        <div
          className="tr-title"
          style={{ color: hovered ? "#fff" : "rgba(255,255,255,0.75)" }}
        >
          {movie.title}
        </div>

        {/* Description — slides in on hover, hidden on mobile */}
        <div
          className="tr-desc-wrap"
          style={{ maxHeight: hovered ? "44px" : "0px", opacity: hovered ? 1 : 0 }}
        >
          <div className="tr-desc">
            {movie.ai_summary ?? movie.description ?? ""}
          </div>
        </div>

        {/* Tags */}
        {movie.tags?.length > 0 && (
          <div
            className="tr-tags-wrap"
            style={{ maxHeight: hovered ? "24px" : "0px", opacity: hovered ? 1 : 0 }}
          >
            {movie.tags.slice(0, 3).map((t) => (
              <span key={t} className="tr-tag">{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* ── Stats + Play ── */}
      <div className="tr-stat-col">
        {/* Rating */}
        <div className="tr-rating-block">
          <span
            className="tr-rating-num"
            style={{ color: hovered ? "#fff" : "rgba(255,255,255,0.45)" }}
          >
            {movie.rating > 0 ? movie.rating.toFixed(1) : "—"}
          </span>
          {/* Rating pips — 5 bars */}
          <div className="tr-pips">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="tr-pip"
                style={{
                  background:
                    i < Math.round(movie.rating / 2)
                      ? "#e50914"
                      : "rgba(255,255,255,0.1)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Views — hidden on small mobile, shown md+ */}
        <div className="tr-views">
          <span className="tr-views-num">{viewLabel}</span>
          <span className="tr-views-label">views</span>
        </div>

        {/* Play button */}
        <button
          className="tr-play-btn"
          style={{
            background: hovered ? "#e50914" : "rgba(255,255,255,0.05)",
            border: hovered ? "none" : "1px solid rgba(255,255,255,0.09)",
            transform: hovered ? "scale(1.1)" : "scale(0.88)",
            opacity: hovered ? 1 : 0.38,
            boxShadow: hovered
              ? "0 0 28px rgba(229,9,20,0.55), 0 0 60px rgba(229,9,20,0.15)"
              : "none",
          }}
          onClick={(e) => {
            e.stopPropagation();
            onNavigate();
          }}
          aria-label={`Play ${movie.title}`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>

      <div className="tr-row-sep" />
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function TrendingSection() {
  const router = useRouter();
  const { movies, loading, error } = useTrendingMovies(8);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold: 0.08 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  const goAuth = () => router.push("/auth");

  return (
    <section id="trending-section" ref={sectionRef}>
      {/* ── Atmosphere ── */}
      <div className="tr-veil" />
      <div className="tr-grain" />
      <div className="tr-scanlines" />
      <div className="tr-top-glow" />

      <div className="tr-content">

        {/* ── HEADER ── */}
        <div className="tr-header">
          <div className="tr-eyebrow">
            <div className="tr-eyebrow-bar" />
            <span className="tr-eyebrow-text">◈ LIVE RANKINGS ◈</span>
          </div>

          <div className="tr-header-row">
            <h2 className="tr-heading">
              TRENDING
              <br />
              <em>THIS WEEK</em>
            </h2>
            <div className="tr-live-badge">
              <span className="tr-live-dot" />
              <span className="tr-live-label">LIVE</span>
            </div>
          </div>

          <div className="tr-header-rule" />
        </div>

        {/* ── ROWS ── */}
        <div className="tr-list">
          {loading && [...Array(5)].map((_, i) => <SkeletonRow key={i} idx={i} />)}

          {error && (
            <div className="tr-error">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
              </svg>
              <span>Could not load trending movies</span>
            </div>
          )}

          {!loading && !error && movies.length === 0 && (
            <div className="tr-error">No trending movies right now — check back soon.</div>
          )}

          {!loading && !error && movies.map((movie, idx) => (
            <TrendingRow
              key={movie.$id}
              movie={movie}
              rank={idx + 1}
              inView={inView}
              onNavigate={goAuth}
            />
          ))}
        </div>

        {/* ── CTA ── */}
        <div className="tr-cta">
          <div className="tr-cta-top-line" />
          <div className="tr-cta-left">
            <div className="tr-cta-eyebrow">◈ DJ AFRO STREAMING</div>
            <div className="tr-cta-heading">DISCOVER YOUR NEXT OBSESSION</div>
          </div>
          <button onClick={goAuth} className="tr-cta-btn">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z" />
            </svg>
            Stream Now — Free
          </button>
        </div>

      </div>

      {/* ── ALL STYLES ── */}
      <style>{`

        /* ─── ROOT ─── */
        #trending-section {
          position: relative;
          background-image: url('/images/bg.jpg');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
        }

        /* Atmosphere layers */
        #trending-section .tr-veil {
          position: absolute; inset: 0; pointer-events: none;
          background:
            linear-gradient(to bottom,
              rgba(7,7,7,0.97) 0%,
              rgba(7,7,7,0.82) 15%,
              rgba(7,7,7,0.82) 85%,
              rgba(7,7,7,0.97) 100%);
        }
        #trending-section .tr-grain {
          position: absolute; inset: 0; pointer-events: none;
          opacity: 0.038;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 180px;
        }
        #trending-section .tr-scanlines {
          position: absolute; inset: 0; pointer-events: none; opacity: 0.02;
          background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 3px);
        }
        #trending-section .tr-top-glow {
          position: absolute; top: -120px; left: 50%; transform: translateX(-50%);
          width: 900px; height: 280px; pointer-events: none;
          background: radial-gradient(ellipse, rgba(229,9,20,0.12) 0%, transparent 65%);
        }

        /* ─── CONTENT WRAPPER ─── */
        .tr-content {
          position: relative; z-index: 10;
          padding: clamp(56px, 8vh, 96px) 0 clamp(64px, 9vh, 108px);
        }

        /* ─── HEADER ─── */
        .tr-header {
          padding: 0 clamp(16px, 4vw, 48px);
          margin-bottom: clamp(32px, 5vh, 56px);
        }
        .tr-eyebrow {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 16px;
        }
        .tr-eyebrow-bar {
          width: 1px; height: 32px;
          background: linear-gradient(to bottom, transparent, #e50914, transparent);
          flex-shrink: 0;
        }
        .tr-eyebrow-text {
          font-size: 9px; letter-spacing: 0.55em; text-transform: uppercase;
          color: #e50914; font-weight: 700;
        }
        .tr-header-row {
          display: flex; align-items: flex-end;
          justify-content: space-between; flex-wrap: wrap; gap: 12px;
        }
        .tr-heading {
          margin: 0;
          font-family: var(--font-display, 'Bebas Neue', Georgia, serif);
          font-size: clamp(42px, 7.5vw, 88px);
          line-height: 0.88; letter-spacing: 0.05em; color: #fff;
        }
        .tr-heading em {
          font-style: normal; display: block;
          color: transparent;
          -webkit-text-stroke: 1.5px rgba(229,9,20,0.4);
          font-size: 0.82em;
        }
        .tr-live-badge {
          display: flex; align-items: center; gap: 8px;
          background: rgba(229,9,20,0.07);
          border: 1px solid rgba(229,9,20,0.18);
          border-radius: 3px; padding: 8px 16px;
          margin-bottom: 6px; flex-shrink: 0;
        }
        .tr-live-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #e50914;
          animation: trPulse 1.6s ease-in-out infinite;
          flex-shrink: 0;
        }
        .tr-live-label {
          font-size: 9px; letter-spacing: 0.4em; text-transform: uppercase;
          color: rgba(255,255,255,0.42); font-weight: 600;
        }
        .tr-header-rule {
          margin-top: 20px; height: 1px;
          background: linear-gradient(90deg, #e50914 0%, rgba(229,9,20,0.22) 35%, transparent 70%);
        }

        /* ─── ROW LIST ─── */
        .tr-list {
          padding: 0 clamp(16px, 4vw, 48px);
          display: flex; flex-direction: column; gap: 3px;
        }

        /* ─── ERROR / EMPTY ─── */
        .tr-error {
          display: flex; align-items: center; gap: 10px;
          color: rgba(255,255,255,0.3); font-size: 13px;
          padding: 32px 0;
        }

        /* ─── SKELETON ─── */
        .tr-skeleton {
          animation: skelFadeIn 0.4s ease both;
        }
        @keyframes skelFadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        .skel-block {
          background: linear-gradient(90deg, #1a1a1a 0%, #242424 50%, #1a1a1a 100%);
          background-size: 200% 100%;
          border-radius: 2px;
          animation: skelShimmer 1.5s ease infinite;
        }
        @keyframes skelShimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ─── SINGLE ROW ─── */
        .tr-row {
          position: relative;
          display: grid;
          /* rank | poster | info | stats */
          grid-template-columns: clamp(44px, 4.5vw, 68px) clamp(44px, 5vw, 64px) 1fr auto;
          align-items: center;
          gap: 0 clamp(12px, 1.8vw, 22px);
          padding: clamp(12px, 1.5vh, 18px) clamp(12px, 1.5vw, 20px);
          border-radius: 3px;
          border: 1px solid rgba(255,255,255,0.035);
          border-left: 2px solid transparent;
          cursor: pointer;
          overflow: hidden;
          transition:
            background 0.35s ease,
            border-color 0.35s ease,
            border-left-color 0.35s ease,
            opacity 0.55s ease,
            transform 0.5s cubic-bezier(0.22,1,0.36,1);
        }
        .tr-row.tr-hov {
          background: linear-gradient(90deg, rgba(229,9,20,0.06) 0%, rgba(255,255,255,0.012) 100%);
          border-color: rgba(229,9,20,0.14);
          border-left-color: #e50914;
        }
        .tr-row.tr-in  { opacity: 1; transform: translateX(0); }
        .tr-row.tr-out { opacity: 0; transform: translateX(-20px); }

        /* ─── WATERMARK ─── */
        .tr-wm {
          position: absolute;
          left: clamp(32px, 4vw, 52px); top: 50%;
          transform: translateY(-50%);
          font-family: var(--font-display, 'Bebas Neue', Georgia, serif);
          font-size: clamp(72px, 10vw, 130px);
          letter-spacing: -0.04em; line-height: 1;
          pointer-events: none; user-select: none;
          transition: color 0.35s, opacity 0.35s;
          z-index: 0;
        }

        /* ─── RANK COLUMN ─── */
        .tr-rank-col {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 4px; position: relative; z-index: 2;
        }
        .tr-rank-num {
          font-family: var(--font-display, 'Bebas Neue', Georgia, serif);
          font-size: clamp(18px, 2.2vw, 27px);
          letter-spacing: 0.04em; line-height: 1;
          transition: color 0.3s;
        }
        .tr-rank-crown {
          font-size: 8px; color: #e50914;
          transition: opacity 0.3s;
        }

        /* ─── POSTER ─── */
        .tr-poster-wrap {
          position: relative; z-index: 2;
          /* 2:3 aspect ratio — standard movie poster */
          aspect-ratio: 2 / 3;
          border-radius: 3px; overflow: hidden;
          background: #111;
          transition: transform 0.4s cubic-bezier(0.22,1,0.36,1), box-shadow 0.4s ease;
          flex-shrink: 0;
        }
        .tr-poster-wrap.tr-poster-hov {
          transform: scale(1.06) translateY(-3px);
          box-shadow: 0 16px 44px rgba(0,0,0,0.85), 0 0 0 1px rgba(229,9,20,0.35);
        }
        .tr-poster-skel {
          position: absolute; inset: 0;
          background: linear-gradient(90deg, #111 0%, #1c1c1c 50%, #111 100%);
          background-size: 200% 100%;
          animation: skelShimmer 1.5s ease infinite;
        }
        .tr-poster-img {
          width: 100%; height: 100%; object-fit: cover;
          display: block; transition: opacity 0.4s ease;
        }
        .tr-poster-grad {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%);
        }
        .tr-poster-dot {
          position: absolute; top: 5px; right: 5px;
          width: 5px; height: 5px; border-radius: 50%;
          background: #e50914; box-shadow: 0 0 6px #e50914;
        }
        .tr-poster-fallback {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          background: #161616;
        }

        /* ─── INFO COLUMN ─── */
        .tr-info-col {
          position: relative; z-index: 2;
          display: flex; flex-direction: column; gap: 5px;
          min-width: 0; /* important: allows text-overflow to work */
        }
        .tr-meta-row {
          display: flex; align-items: center; gap: 7px; flex-wrap: wrap;
        }
        .tr-genre {
          font-size: clamp(7px, 0.75vw, 9px);
          letter-spacing: 0.4em; text-transform: uppercase;
          color: #e50914; font-weight: 700;
          white-space: nowrap;
        }
        .tr-meta-sep {
          color: rgba(255,255,255,0.15); font-size: 9px;
        }
        .tr-year {
          font-size: clamp(8px, 0.8vw, 10px);
          color: rgba(255,255,255,0.25); letter-spacing: 0.1em;
        }
        .tr-premium-tag {
          font-size: 6px; letter-spacing: 0.3em; text-transform: uppercase;
          color: #e50914; border: 1px solid rgba(229,9,20,0.25);
          background: rgba(229,9,20,0.07); padding: 2px 6px; border-radius: 1px;
          font-weight: 700; white-space: nowrap;
        }
        .tr-title {
          font-family: var(--font-display, 'Bebas Neue', Georgia, serif);
          font-size: clamp(16px, 2vw, 24px);
          letter-spacing: 0.04em; line-height: 1;
          transition: color 0.3s;
          /* Prevent wrapping on small screens */
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        /* Desc slide-down */
        .tr-desc-wrap {
          overflow: hidden;
          transition: max-height 0.4s cubic-bezier(0.22,1,0.36,1), opacity 0.35s;
        }
        .tr-desc {
          font-size: clamp(10px, 1vw, 12px);
          color: rgba(255,255,255,0.35); line-height: 1.55;
          /* Clamp to 2 lines */
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          overflow: hidden;
        }
        /* Tags slide-down */
        .tr-tags-wrap {
          display: flex; gap: 5px; flex-wrap: nowrap; overflow: hidden;
          transition: max-height 0.4s 0.04s cubic-bezier(0.22,1,0.36,1), opacity 0.35s 0.04s;
        }
        .tr-tag {
          font-size: 7px; letter-spacing: 0.25em; text-transform: uppercase;
          color: rgba(255,255,255,0.24);
          border: 1px solid rgba(255,255,255,0.07);
          padding: 2px 7px; border-radius: 1px; white-space: nowrap;
        }

        /* ─── STATS COLUMN ─── */
        .tr-stat-col {
          position: relative; z-index: 2;
          display: flex; flex-direction: column;
          align-items: flex-end; gap: 8px;
          flex-shrink: 0;
        }
        .tr-rating-block {
          display: flex; flex-direction: column; align-items: flex-end; gap: 4px;
        }
        .tr-rating-num {
          font-family: var(--font-display, 'Bebas Neue', Georgia, serif);
          font-size: clamp(20px, 2.4vw, 28px);
          letter-spacing: 0.02em; line-height: 1;
          transition: color 0.3s;
        }
        .tr-pips {
          display: flex; gap: 2px;
        }
        .tr-pip {
          width: 9px; height: 2px; border-radius: 1px;
          transition: background 0.3s;
        }
        .tr-views {
          display: flex; flex-direction: column; align-items: flex-end; gap: 1px;
        }
        .tr-views-num {
          font-size: clamp(10px, 1vw, 12px);
          color: rgba(255,255,255,0.3); font-weight: 600; letter-spacing: 0.05em;
        }
        .tr-views-label {
          font-size: 7px; letter-spacing: 0.28em; text-transform: uppercase;
          color: rgba(255,255,255,0.14);
        }
        .tr-play-btn {
          width: clamp(32px, 3vw, 40px);
          height: clamp(32px, 3vw, 40px);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; outline: none;
          transition: background 0.3s, transform 0.3s, opacity 0.3s, box-shadow 0.3s, border 0.3s;
        }
        .tr-play-btn:focus-visible { outline: 2px solid #e50914; }

        .tr-row-sep {
          position: absolute; bottom: 0; left: 0; right: 0;
          height: 1px; background: rgba(255,255,255,0.035);
          pointer-events: none;
        }

        /* ─── CTA ─── */
        .tr-cta {
          margin: clamp(40px, 5vh, 58px) clamp(16px, 4vw, 48px) 0;
          display: flex; align-items: center;
          justify-content: space-between; flex-wrap: wrap; gap: 20px;
          padding: clamp(20px, 3vh, 28px) clamp(20px, 3vw, 36px);
          border-radius: 3px; position: relative; overflow: hidden;
          border: 1px solid rgba(229,9,20,0.15);
          background: linear-gradient(135deg,
            rgba(229,9,20,0.07) 0%,
            rgba(255,255,255,0.01) 55%,
            rgba(229,9,20,0.04) 100%);
        }
        .tr-cta-top-line {
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(229,9,20,0.38), transparent);
        }
        .tr-cta-left { display: flex; flex-direction: column; gap: 5px; }
        .tr-cta-eyebrow {
          font-size: 8px; letter-spacing: 0.55em; text-transform: uppercase;
          color: #e50914; font-weight: 700;
        }
        .tr-cta-heading {
          font-family: var(--font-display, 'Bebas Neue', Georgia, serif);
          font-size: clamp(16px, 2.2vw, 24px);
          color: #fff; letter-spacing: 0.06em;
        }
        .tr-cta-btn {
          display: inline-flex; align-items: center; gap: 10px;
          background: #e50914; color: #fff; border: none;
          font-size: clamp(8px, 0.85vw, 9px); letter-spacing: 0.45em;
          text-transform: uppercase; font-weight: 700;
          padding: clamp(11px, 1.4vh, 14px) clamp(20px, 2.5vw, 32px);
          border-radius: 2px; cursor: pointer; font-family: 'DM Sans', sans-serif;
          box-shadow: 0 0 32px rgba(229,9,20,0.26);
          transition: box-shadow 0.3s, transform 0.3s;
          white-space: nowrap; flex-shrink: 0;
        }
        .tr-cta-btn:hover {
          box-shadow: 0 0 52px rgba(229,9,20,0.54);
          transform: translateY(-2px);
        }

        /* ─── ANIMATIONS ─── */
        @keyframes trPulse {
          0%,100% { opacity: 1; transform: scale(1);   box-shadow: 0 0 8px #e50914; }
          50%      { opacity: .5; transform: scale(.8); box-shadow: 0 0 3px #e50914; }
        }

        /* ─── MOBILE OVERRIDES ─── */
        @media (max-width: 640px) {
          .tr-row {
            /* On mobile: collapse stats column, keep rank+poster+info */
            grid-template-columns: 36px clamp(38px, 12vw, 52px) 1fr;
            gap: 0 10px;
          }
          /* Hide stats on small phones — too cluttered */
          .tr-stat-col { display: none; }
          /* Watermark too large on mobile — shrink */
          .tr-wm { font-size: 64px; left: 26px; opacity: 0.02 !important; }
          /* Desc never shows on mobile hover (touch has no hover) */
          .tr-desc-wrap, .tr-tags-wrap { display: none; }
          /* CTA stack on mobile */
          .tr-cta { flex-direction: column; align-items: flex-start; }
        }

        @media (min-width: 641px) and (max-width: 900px) {
          /* Tablet — show stat col but smaller */
          .tr-stat-col { gap: 6px; }
          .tr-views { display: none; }
        }
      `}</style>
    </section>
  );
}