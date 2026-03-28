"use client";

import { useEffect, useRef } from "react";

const MOVIES = [
  { title: "Baahubali: The Beginning", genre: "Epic",      year: 2015, rating: "9.1", premium: true,  img: "/images/movie2.jpg"  },
  { title: "John Wick 4",             genre: "Action",    year: 2023, rating: "8.9", premium: true,  img: "/images/movie3.jpg"  },
  { title: "Rampage",                 genre: "Thriller",  year: 2023, rating: "8.1", premium: false, img: "/images/movie4.jpg"  },
  { title: "Krish III",               genre: "Sci-Fi",    year: 2013, rating: "8.8", premium: true,  img: "/images/movie5.webp"  },
  { title: "Thunderbolts*",           genre: "Marvel",    year: 2024, rating: "7.9", premium: true,  img: "/images/movie6.jpg"  },
  { title: "Anaconda Rising",         genre: "Adventure", year: 2024, rating: "8.4", premium: false, img: "/images/movie7.jpg"  },
  { title: "Ghost City",              genre: "Crime",     year: 2023, rating: "8.7", premium: true,  img: "/images/movie8.jpg"  },
  { title: "Red 2",            genre: "Crime",     year: 2023, rating: "8.5", premium: false, img: "/images/movie9.jpg"  },
  { title: "Ghost Rider",            genre: "Drama",     year: 2024, rating: "8.2", premium: false, img: "/images/movie10.jpg" },
  { title: "Kick",             genre: "Romance",   year: 2023, rating: "7.8", premium: true,  img: "/images/movie11.jpg" },
  { title: "The Meg",              genre: "Mystery",   year: 2024, rating: "7.9", premium: false, img: "/images/movie12.jpg" },
];

const SPOTLIGHT = {
  title: "Dunkirk: The Last Stand",
  tag: "Editor's Pick",
  description:
    "Experience the harrowing true story.",
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

function MovieCard({ movie }: { movie: Movie }) {
  return (
    <div className="dj-card" onClick={() => (window.location.href = "/login")}>
      <img
        className="dj-card-img"
        src={movie.img}
        alt={movie.title}
        draggable={false}
      />
      <div className="dj-card-grad" />

      {/* Badge */}
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
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = "/login";
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function ScrollRow({ movies, reverse }: { movies: Movie[]; reverse: boolean }) {
  // Triple the array so the seamless loop works at any container width
  const tripled = [...movies, ...movies, ...movies];

  return (
    <div className="dj-row">
      <div className={`dj-track ${reverse ? "dj-track-reverse" : ""}`}>
        {tripled.map((m, i) => (
          <MovieCard key={`${m.title}-${i}`} movie={m} />
        ))}
      </div>
    </div>
  );
}

export default function FeaturedCarousel() {
  const row1 = MOVIES.slice(0, 7);
  const row2 = MOVIES.slice(4);   // slight overlap for variety

  return (
    <section id="featured" className="dj-section">

      {/* ── TOP AMBIENT LINE ── */}
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
        <a href="/login" className="dj-viewall">
          View All
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      </div>

      {/* ── SPOTLIGHT ── */}
      <div className="dj-spotlight">
        <div className="dj-spotlight-inner" onClick={() => (window.location.href = "/login")}>
          <img
            className="dj-spotlight-img"
            src={SPOTLIGHT.img}
            alt={SPOTLIGHT.title}
            draggable={false}
          />
          <div className="dj-spotlight-overlay">
            <div className="dj-spotlight-content">
              <div className="dj-spotlight-tag">{SPOTLIGHT.tag}</div>
              <div className="dj-spotlight-title">{SPOTLIGHT.title}</div>
              <p className="dj-spotlight-desc">{SPOTLIGHT.description}</p>
              <div className="dj-spotlight-actions">
                <button
                  className="dj-btn-primary"
                  onClick={(e) => { e.stopPropagation(); window.location.href = "/login"; }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Watch Now
                </button>
                <button
                  className="dj-btn-ghost"
                  onClick={(e) => { e.stopPropagation(); window.location.href = "/login"; }}
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
        <ScrollRow movies={row1} reverse={false} />
        <ScrollRow movies={row2} reverse={true} />
      </div>

      {/* ── VIEW ALL BUTTON ── */}
      <div className="dj-footer">
        <a href="/login" className="dj-footer-btn">
          Explore All Movies &nbsp;→
        </a>
      </div>

      {/* ── STYLES ── */}
      <style>{`

        .dj-section {
          background: #080808;
          padding: 80px 0 100px;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          width: 100%;
        }

        /* Top red ambient line */
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
          padding: 0 40px;
          margin-bottom: 52px;
        }
        .dj-eyebrow {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }
        .dj-eyebrow-line {
          width: 28px; height: 1px;
          background: #e50914;
        }
        .dj-eyebrow-text {
          font-size: 10px;
          letter-spacing: 0.45em;
          text-transform: uppercase;
          color: #e50914;
          font-weight: 500;
        }
        .dj-title {
          font-family: var(--font-display);
          font-size: clamp(42px, 6vw, 72px);
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
          font-size: 11px;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          cursor: pointer;
          transition: color 0.3s;
          border: none;
          background: none;
          padding: 0;
          font-family: 'DM Sans', sans-serif;
          text-decoration: none;
        }
        .dj-viewall:hover { color: #fff; }
        .dj-viewall svg { transition: transform 0.3s; }
        .dj-viewall:hover svg { transform: translateX(4px); }

        /* ── SPOTLIGHT ── */
        .dj-spotlight {
          padding: 0 40px;
          margin-bottom: 20px;
        }
        .dj-spotlight-inner {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          height: 220px;
          cursor: pointer;
          transition: box-shadow 0.4s;
        }
        .dj-spotlight-inner:hover {
          box-shadow: 0 0 0 1px #e50914, 0 20px 60px rgba(229,9,20,0.2);
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
          background: linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0.1) 100%);
          display: flex;
          align-items: center;
          padding: 36px;
        }
        .dj-spotlight-content { max-width: 380px; }
        .dj-spotlight-tag {
          font-size: 9px;
          letter-spacing: 0.45em;
          text-transform: uppercase;
          font-weight: 700;
          color: #e50914;
          border: 1px solid rgba(229,9,20,0.3);
          background: rgba(229,9,20,0.1);
          padding: 3px 9px;
          border-radius: 2px;
          display: inline-block;
          margin-bottom: 10px;
        }
        .dj-spotlight-title {
          font-family: var(--font-display);
          font-size: 46px;
          color: #fff;
          letter-spacing: 0.04em;
          line-height: 0.9;
          margin-bottom: 8px;
        }
        .dj-spotlight-desc {
          font-size: 12px;
          color: rgba(255,255,255,0.55);
          line-height: 1.6;
          margin-bottom: 16px;
          max-width: 320px;
        }
        .dj-spotlight-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .dj-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #e50914;
          color: #fff;
          font-size: 10px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          font-weight: 700;
          padding: 10px 20px;
          border: none;
          border-radius: 2px;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: box-shadow 0.3s;
        }
        .dj-btn-primary:hover { box-shadow: 0 0 24px rgba(229,9,20,0.5); }
        .dj-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: rgba(255,255,255,0.5);
          font-size: 10px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          font-weight: 500;
          padding: 10px 18px;
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 2px;
          cursor: pointer;
          background: none;
          font-family: 'DM Sans', sans-serif;
          transition: color 0.2s, border-color 0.2s;
        }
        .dj-btn-ghost:hover { color: #fff; border-color: rgba(255,255,255,0.4); }

        /* ── DIVIDER ── */
        .dj-divider {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 0 40px;
          margin-bottom: 24px;
        }
        .dj-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.06); }
        .dj-divider-label {
          font-size: 9px;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
        }

        /* ── ROWS ── */
        .dj-rows {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 48px;
        }
        .dj-row {
          overflow: hidden;
          padding: 8px 0;
          mask-image: linear-gradient(90deg, transparent 0%, black 5%, black 95%, transparent 100%);
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, black 5%, black 95%, transparent 100%);
        }
        .dj-track {
          display: flex;
          gap: 16px;
          width: max-content;
          animation: djScrollLeft 35s linear infinite;
          will-change: transform;
        }
        .dj-track-reverse {
          animation: djScrollRight 40s linear infinite;
        }
        .dj-track:hover,
        .dj-track-reverse:hover {
          animation-play-state: paused;
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
          width: 200px;
          height: 300px;
          flex-shrink: 0;
          border-radius: 4px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.5s ease;
        }
        .dj-card:hover {
          transform: scale(1.08) translateY(-6px);
          box-shadow: 0 30px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(229,9,20,0.5);
          z-index: 10;
        }
        .dj-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
          display: block;
        }
        .dj-card:hover .dj-card-img { transform: scale(1.06); }
        .dj-card-grad {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%);
        }

        /* Badge */
        .dj-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          font-size: 8px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          font-weight: 700;
          padding: 3px 7px;
          border-radius: 2px;
          z-index: 2;
        }
        .dj-badge-premium { background: #e50914; color: #fff; }
        .dj-badge-free {
          background: rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.6);
          border: 1px solid rgba(255,255,255,0.15);
        }

        /* Base info (visible when not hovered) */
        .dj-card-base {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          padding: 14px;
          transition: opacity 0.35s ease;
        }
        .dj-card:hover .dj-card-base { opacity: 0; }
        .dj-card-title-base {
          font-size: 13px;
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
          background: linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.2) 100%);
          opacity: 0;
          transition: opacity 0.35s ease;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 16px;
        }
        .dj-card:hover .dj-card-hover { opacity: 1; }
        .dj-card-genre {
          font-size: 9px;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: #e50914;
          margin-bottom: 5px;
          font-weight: 500;
        }
        .dj-card-title-hover {
          font-family: var(--font-display);
          font-size: 20px;
          color: #fff;
          letter-spacing: 0.05em;
          line-height: 1;
          margin-bottom: 6px;
        }
        .dj-card-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 10px;
        }
        .dj-card-year { font-size: 11px; color: rgba(255,255,255,0.45); }
        .dj-card-dot { width: 2px; height: 2px; border-radius: 50%; background: rgba(255,255,255,0.2); }
        .dj-card-rating {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 11px;
          color: #c9a84c;
          font-weight: 500;
        }
        .dj-card-play {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: #e50914;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px rgba(229,9,20,0.5);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .dj-card-play:hover {
          transform: scale(1.12);
          box-shadow: 0 0 32px rgba(229,9,20,0.7);
        }

        /* ── FOOTER ── */
        .dj-footer {
          display: flex;
          justify-content: center;
        }
        .dj-footer-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          padding: 14px 40px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 2px;
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          letter-spacing: 0.45em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
          transition: color 0.3s, border-color 0.3s, box-shadow 0.3s;
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