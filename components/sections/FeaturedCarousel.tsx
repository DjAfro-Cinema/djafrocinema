"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// ─── DATA ──────────────────────────────────────────────────────────────────────
const MOVIES = [
  { title: "Baahubali: The Beginning", genre: "Epic",      year: 2015, rating: "9.1", premium: true,  img: "/images/movie2.jpg"  },
  { title: "John Wick 4",             genre: "Action",    year: 2023, rating: "8.9", premium: true,  img: "/images/movie3.jpg"  },
  { title: "Rampage",                 genre: "Thriller",  year: 2023, rating: "8.1", premium: false, img: "/images/movie4.jpg"  },
  { title: "Krish III",               genre: "Sci-Fi",    year: 2013, rating: "8.8", premium: true,  img: "/images/movie5.webp" },
  { title: "Thunderbolts*",           genre: "Marvel",    year: 2024, rating: "7.9", premium: true,  img: "/images/movie6.jpg"  },
  { title: "Anaconda Rising",         genre: "Adventure", year: 2024, rating: "8.4", premium: false, img: "/images/movie7.jpg"  },
  { title: "Ghost City",              genre: "Crime",     year: 2023, rating: "8.7", premium: true,  img: "/images/movie8.jpg"  },
  { title: "Red 2",                   genre: "Crime",     year: 2023, rating: "8.5", premium: false, img: "/images/movie9.jpg"  },
  { title: "Ghost Rider",             genre: "Drama",     year: 2024, rating: "8.2", premium: false, img: "/images/movie10.jpg" },
  { title: "Kick",                    genre: "Romance",   year: 2023, rating: "7.8", premium: true,  img: "/images/movie11.jpg" },
  { title: "The Meg",                 genre: "Mystery",   year: 2024, rating: "7.9", premium: false, img: "/images/movie12.jpg" },
];

const SPOTLIGHT = {
  title: "Dunkirk: The Last Stand",
  tag: "Editor's Pick",
  description: "Experience the harrowing true story of survival against impossible odds.",
  img: "/images/movie1.jpg",
};

interface Movie {
  title: string;
  genre: string;
  year: number;
  rating: string;
  premium: boolean;
  img: string;
}

// ─── MOVIE CARD ────────────────────────────────────────────────────────────────
function MovieCard({ movie, onNavigate }: { movie: Movie; onNavigate: () => void }) {
  return (
    <div className="dj-card" onClick={onNavigate}>
      {/* Use native img — these are in an infinite scroll track, Next/Image doesn't help here */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="dj-card-img"
        src={movie.img}
        alt={movie.title}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
      <div className="dj-card-grad" />

      <div className={`dj-badge ${movie.premium ? "dj-badge-premium" : "dj-badge-free"}`}>
        {movie.premium ? "Premium" : "Free"}
      </div>

      {/* Always-visible bottom title */}
      <div className="dj-card-base">
        <div className="dj-card-title-base">{movie.title}</div>
      </div>

      {/* Hover overlay */}
      <div className="dj-card-hover">
        <div className="dj-card-genre">{movie.genre}</div>
        <div className="dj-card-title-hover">{movie.title}</div>
        <div className="dj-card-meta">
          <span className="dj-card-year">{movie.year}</span>
          <span className="dj-card-dot" />
          <span className="dj-card-rating">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {movie.rating}
          </span>
        </div>
        <button
          className="dj-card-play"
          onClick={(e) => { e.stopPropagation(); onNavigate(); }}
          aria-label={`Play ${movie.title}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── SCROLL ROW ────────────────────────────────────────────────────────────────
function ScrollRow({ movies, reverse, onNavigate }: { movies: Movie[]; reverse: boolean; onNavigate: () => void }) {
  const tripled = [...movies, ...movies, ...movies];
  return (
    <div className="dj-row">
      <div className={`dj-track ${reverse ? "dj-track-reverse" : ""}`}>
        {tripled.map((m, i) => (
          <MovieCard key={`${m.title}-${i}`} movie={m} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function FeaturedCarousel() {
  const router = useRouter();
  const [spotlightLoaded, setSpotlightLoaded] = useState(false);

  const row1 = MOVIES.slice(0, 7);
  const row2 = MOVIES.slice(4);

  const goAuth = () => router.push("/auth");

  return (
    <section id="featured" className="dj-section">

      <div className="dj-ambient-line" />

      {/* ── HEADER ── */}
      <div className="dj-header">
        <div>
          <div className="dj-eyebrow">
            <div className="dj-eyebrow-line" />
            <span className="dj-eyebrow-text">Now Streaming</span>
          </div>
          <h2 className="dj-title">
            FEATURED <span>MOVIES</span>
          </h2>
        </div>
        <button onClick={goAuth} className="dj-viewall">
          View All
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* ── SPOTLIGHT / EDITOR'S PICK ── */}
      <div className="dj-spotlight">
        <div className="dj-spotlight-inner" onClick={goAuth}>
          {/* Skeleton shown until image loads */}
          {!spotlightLoaded && <div className="dj-spotlight-skeleton" />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="dj-spotlight-img"
            src={SPOTLIGHT.img}
            alt={SPOTLIGHT.title}
            draggable={false}
            onLoad={() => setSpotlightLoaded(true)}
            style={{ opacity: spotlightLoaded ? 1 : 0, transition: "opacity 0.5s ease" }}
          />
          <div className="dj-spotlight-overlay">
            <div className="dj-spotlight-content">
              <div className="dj-spotlight-tag">{SPOTLIGHT.tag}</div>
              <div className="dj-spotlight-title">{SPOTLIGHT.title}</div>
              {/* Hide description on mobile to keep it clean */}
              <p className="dj-spotlight-desc">{SPOTLIGHT.description}</p>
              <div className="dj-spotlight-actions">
                <button
                  className="dj-btn-primary"
                  onClick={(e) => { e.stopPropagation(); goAuth(); }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Watch Now
                </button>
                <button
                  className="dj-btn-ghost"
                  onClick={(e) => { e.stopPropagation(); goAuth(); }}
                >
                  More Info
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── DIVIDER ── */}
      <div className="dj-divider">
        <div className="dj-divider-line" />
        <span className="dj-divider-label">Scroll to explore</span>
        <div className="dj-divider-line" />
      </div>

      {/* ── SCROLLING ROWS ── */}
      <div className="dj-rows">
        <ScrollRow movies={row1} reverse={false} onNavigate={goAuth} />
        <ScrollRow movies={row2} reverse={true}  onNavigate={goAuth} />
      </div>

      {/* ── VIEW ALL BUTTON ── */}
      <div className="dj-footer">
        <button onClick={goAuth} className="dj-footer-btn">
          Explore All Movies &nbsp;→
        </button>
      </div>

      {/* ── STYLES ── */}
      <style>{`
        .dj-section {
          background: #080808;
          padding: clamp(48px, 7vh, 80px) 0 clamp(60px, 8vh, 100px);
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          width: 100%;
        }

        .dj-ambient-line {
          position: absolute;
          top: 0; left: 50%; transform: translateX(-50%);
          width: 800px; height: 2px;
          background: linear-gradient(90deg, transparent, #e50914, transparent);
          opacity: 0.6;
        }

        /* ── HEADER ── */
        .dj-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          padding: 0 clamp(16px, 4vw, 40px);
          margin-bottom: clamp(28px, 4vh, 52px);
          gap: 12px;
        }
        .dj-eyebrow {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }
        .dj-eyebrow-line { width: 28px; height: 1px; background: #e50914; }
        .dj-eyebrow-text {
          font-size: 10px;
          letter-spacing: 0.45em;
          text-transform: uppercase;
          color: #e50914;
          font-weight: 500;
        }
        .dj-title {
          font-family: var(--font-display, 'Bebas Neue', Georgia, serif);
          font-size: clamp(28px, 5.5vw, 72px);
          color: #fff;
          letter-spacing: 0.06em;
          line-height: 0.9;
          margin: 0;
        }
        .dj-title span {
          color: transparent;
          -webkit-text-stroke: 1px rgba(255,255,255,0.25);
        }
        .dj-viewall {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: clamp(9px, 1vw, 11px);
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          cursor: pointer;
          transition: color 0.3s;
          border: none;
          background: none;
          padding: 0;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .dj-viewall:hover { color: #fff; }
        .dj-viewall svg { transition: transform 0.3s; flex-shrink: 0; }
        .dj-viewall:hover svg { transform: translateX(4px); }

        /* ── SPOTLIGHT ── */
        .dj-spotlight {
          padding: 0 clamp(16px, 4vw, 40px);
          margin-bottom: 20px;
        }
        .dj-spotlight-inner {
          position: relative;
          border-radius: 6px;
          overflow: hidden;
          /* Height scales with viewport — fits both mobile and desktop */
          height: clamp(160px, 22vw, 260px);
          cursor: pointer;
          transition: box-shadow 0.4s;
          background: #111;
        }
        .dj-spotlight-inner:hover {
          box-shadow: 0 0 0 1px #e50914, 0 20px 60px rgba(229,9,20,0.2);
        }
        .dj-spotlight-skeleton {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, #111 0%, #1a1a1a 50%, #111 100%);
          background-size: 200% 100%;
          animation: skelShimmer 1.4s ease infinite;
        }
        @keyframes skelShimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .dj-spotlight-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 30%;
          transition: transform 0.8s ease;
          display: block;
        }
        .dj-spotlight-inner:hover .dj-spotlight-img { transform: scale(1.03); }
        .dj-spotlight-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.1) 100%);
          display: flex;
          align-items: center;
          padding: clamp(16px, 3vw, 36px);
        }
        .dj-spotlight-content {
          /* On mobile this is narrower so text fits */
          max-width: clamp(200px, 55vw, 400px);
        }
        .dj-spotlight-tag {
          font-size: clamp(7px, 0.8vw, 9px);
          letter-spacing: 0.45em;
          text-transform: uppercase;
          font-weight: 700;
          color: #e50914;
          border: 1px solid rgba(229,9,20,0.3);
          background: rgba(229,9,20,0.1);
          padding: 2px 8px;
          border-radius: 2px;
          display: inline-block;
          margin-bottom: 8px;
        }
        .dj-spotlight-title {
          font-family: var(--font-display, 'Bebas Neue', Georgia, serif);
          font-size: clamp(20px, 3.5vw, 46px);
          color: #fff;
          letter-spacing: 0.04em;
          line-height: 0.92;
          margin-bottom: 6px;
        }
        /* Hide description on small screens — title + buttons are enough */
        .dj-spotlight-desc {
          font-size: clamp(10px, 1.1vw, 12px);
          color: rgba(255,255,255,0.55);
          line-height: 1.55;
          margin-bottom: 14px;
          max-width: 320px;
        }
        @media (max-width: 540px) {
          .dj-spotlight-desc { display: none; }
        }
        .dj-spotlight-actions {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }
        .dj-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: #e50914;
          color: #fff;
          font-size: clamp(8px, 0.85vw, 10px);
          letter-spacing: 0.28em;
          text-transform: uppercase;
          font-weight: 700;
          padding: clamp(7px, 1vh, 10px) clamp(12px, 1.5vw, 20px);
          border: none;
          border-radius: 2px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: box-shadow 0.3s;
          white-space: nowrap;
        }
        .dj-btn-primary:hover { box-shadow: 0 0 24px rgba(229,9,20,0.55); }
        .dj-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: rgba(255,255,255,0.5);
          font-size: clamp(8px, 0.85vw, 10px);
          letter-spacing: 0.28em;
          text-transform: uppercase;
          font-weight: 500;
          padding: clamp(7px, 1vh, 10px) clamp(12px, 1.5vw, 18px);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 2px;
          cursor: pointer;
          background: none;
          font-family: 'DM Sans', sans-serif;
          transition: color 0.2s, border-color 0.2s;
          white-space: nowrap;
        }
        .dj-btn-ghost:hover { color: #fff; border-color: rgba(255,255,255,0.4); }

        /* ── DIVIDER ── */
        .dj-divider {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 0 clamp(16px, 4vw, 40px);
          margin-bottom: 20px;
        }
        .dj-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.06); }
        .dj-divider-label {
          font-size: 9px;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
          white-space: nowrap;
        }

        /* ── SCROLL ROWS ── */
        .dj-rows {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 44px;
        }
        .dj-row {
          overflow: hidden;
          padding: 8px 0;
          mask-image: linear-gradient(90deg, transparent 0%, black 4%, black 96%, transparent 100%);
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, black 4%, black 96%, transparent 100%);
        }
        .dj-track {
          display: flex;
          gap: 14px;
          width: max-content;
          animation: djScrollLeft 38s linear infinite;
          will-change: transform;
        }
        .dj-track-reverse {
          animation: djScrollRight 44s linear infinite;
        }
        /* Pause on hover — desktop only */
        @media (hover: hover) {
          .dj-track:hover,
          .dj-track-reverse:hover {
            animation-play-state: paused;
          }
        }
        @keyframes djScrollLeft {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        @keyframes djScrollRight {
          0%   { transform: translateX(-33.333%); }
          100% { transform: translateX(0); }
        }

        /* ── CARD ── */
        .dj-card {
          position: relative;
          /* Card size scales a bit with viewport */
          width: clamp(140px, 14vw, 200px);
          height: clamp(210px, 21vw, 300px);
          flex-shrink: 0;
          border-radius: 4px;
          overflow: hidden;
          cursor: pointer;
          background: #111;
          transition: transform 0.45s cubic-bezier(0.22,1,0.36,1), box-shadow 0.45s ease;
        }
        /* Only scale on hover for pointer devices — no accidental scale on touch */
        @media (hover: hover) {
          .dj-card:hover {
            transform: scale(1.08) translateY(-6px);
            box-shadow: 0 28px 56px rgba(0,0,0,0.7), 0 0 0 1px rgba(229,9,20,0.5);
            z-index: 10;
          }
        }
        .dj-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
          display: block;
        }
        @media (hover: hover) {
          .dj-card:hover .dj-card-img { transform: scale(1.05); }
        }
        .dj-card-grad {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.05) 100%);
        }

        /* Badge */
        .dj-badge {
          position: absolute;
          top: 10px; right: 10px;
          font-size: 7px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          font-weight: 700;
          padding: 3px 7px;
          border-radius: 2px;
          z-index: 2;
        }
        .dj-badge-premium { background: #e50914; color: #fff; }
        .dj-badge-free {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.55);
          border: 1px solid rgba(255,255,255,0.12);
        }

        /* Base title */
        .dj-card-base {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          padding: 12px;
          transition: opacity 0.3s ease;
        }
        @media (hover: hover) {
          .dj-card:hover .dj-card-base { opacity: 0; }
        }
        .dj-card-title-base {
          font-size: clamp(11px, 1.1vw, 13px);
          font-weight: 500;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Hover overlay */
        .dj-card-hover {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.15) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 14px;
        }
        @media (hover: hover) {
          .dj-card:hover .dj-card-hover { opacity: 1; }
        }
        .dj-card-genre {
          font-size: 8px;
          letter-spacing: 0.38em;
          text-transform: uppercase;
          color: #e50914;
          margin-bottom: 4px;
          font-weight: 500;
        }
        .dj-card-title-hover {
          font-family: var(--font-display, 'Bebas Neue', Georgia, serif);
          font-size: clamp(16px, 1.6vw, 20px);
          color: #fff;
          letter-spacing: 0.05em;
          line-height: 1;
          margin-bottom: 6px;
        }
        .dj-card-meta {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-bottom: 9px;
        }
        .dj-card-year { font-size: 10px; color: rgba(255,255,255,0.4); }
        .dj-card-dot { width: 2px; height: 2px; border-radius: 50%; background: rgba(255,255,255,0.2); }
        .dj-card-rating {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 10px;
          color: #c9a84c;
          font-weight: 500;
        }
        .dj-card-play {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: #e50914;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 18px rgba(229,9,20,0.5);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .dj-card-play:hover {
          transform: scale(1.12);
          box-shadow: 0 0 28px rgba(229,9,20,0.7);
        }

        /* ── FOOTER ── */
        .dj-footer {
          display: flex;
          justify-content: center;
          padding: 0 clamp(16px, 4vw, 40px);
        }
        .dj-footer-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: clamp(11px, 1.5vh, 14px) clamp(24px, 4vw, 40px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 2px;
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(9px, 0.9vw, 10px);
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
          cursor: pointer;
          background: none;
          transition: color 0.3s, border-color 0.3s, box-shadow 0.3s;
          white-space: nowrap;
        }
        .dj-footer-btn:hover {
          color: #fff;
          border-color: rgba(229,9,20,0.5);
          box-shadow: 0 0 20px rgba(229,9,20,0.15);
        }
      `}</style>
    </section>
  );
}