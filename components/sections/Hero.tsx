"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

// ─── SLIDE DATA ────────────────────────────────────────────────────────────────
const SLIDES = [
  {
    image: "/images/hero1.jpg",
    title: "Anaconda Rising",
    genre: "Action · Adventure",
    year: "2024",
    rating: "8.4",
    tag: "EXCLUSIVE",
    description:
      "The Amazon's deadliest legend comes to life. An epic DjAfro adventure that slithers into your heart — only on DjAfro Cinema.",
    accent: "#e50914",
    kenBurns: "zoom-in-right",
  },
  {
    image: "/images/hero2.jpg",
    title: "Baahubali: The Lost Kingdom",
    genre: "Epic · Fantasy",
    year: "2024",
    rating: "9.1",
    tag: "DjAfro",
    description:
      "The epic that redefined Indian cinema, now fully DjAfro for East Africa. Kingdoms, betrayal, and destiny await on DjAfro Cinema.",
    accent: "#e50914",
    kenBurns: "zoom-in-left",
  },
  {
    image: "/images/hero3.jpg",
    title: "Rampage",
    genre: "Action · Thriller",
    year: "2023",
    rating: "8.1",
    tag: "TRENDING",
    description:
      "Dwayne Johnson faces off against giant monsters in this adrenaline-pumping blockbuster — now Streaming.",
    accent: "#e50914",
    kenBurns: "zoom-out",
  },
  {
    image: "/images/hero4.jpg",
    title: "John Wick: Chapter 4",
    genre: "Action · Crime",
    year: "2024",
    rating: "9.0",
    tag: "TOP RATED",
    description:
      "The legend continues. Keanu Reeves returns in the most stylish, action-packed chapter yet — watch now on DjAfro Cinema.",
    accent: "#e50914",
    kenBurns: "zoom-in-right",
  },
  {
    image: "/images/hero5.jpg",
    title: "Thunderbolts*",
    genre: "Action · Superhero",
    year: "2024",
    rating: "7.1",
    tag: "NEW",
    description:
      "Marvel's anti-hero team takes center stage in this thrilling new chapter of the MCU — now DjAfro and streaming on DjAfro Cinema.",
    accent: "#e50914",
    kenBurns: "zoom-in-left",
  },
  {
    image: "/images/hero6.jpg",
    title: "Krish III",
    genre: "Action · Sci-Fi",
    year: "2013",
    rating: "8.8",
    tag: "CLASSIC",
    description:
      "The iconic Bollywood superhero's most beloved adventure, now fully DjAfro for East Africa. Experience the legend of Krish on DjAfro Cinema.",
    accent: "#e50914",
    kenBurns: "zoom-out",
  },
];

const STATS = [
  { num: "1,200+", label: "App Downloads" },
  { num: "500+",   label: "Movies DjAfro" },
  { num: "10K+",   label: "Loyal Fans" },
];

const AUTO_INTERVAL = 6000;

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function HeroImage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [kenKey, setKenKey] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));
  const [firstImageReady, setFirstImageReady] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track which images have started preloading
  const preloadedRef = useRef<Set<number>>(new Set());

  // ── Preload first image immediately, then trickle the rest ────────────────
  useEffect(() => {
    // Preload slide 0 immediately — highest priority
    const first = new window.Image();
    first.src = SLIDES[0].image;
    first.onload = () => {
      setFirstImageReady(true);
      setLoadedImages((prev) => new Set([...prev, 0]));
    };
    first.onerror = () => setFirstImageReady(true); // show something regardless
    preloadedRef.current.add(0);

    // Preload remaining images sequentially with slight delay
    // so first image bandwidth is not competed with
    SLIDES.slice(1).forEach((s, idx) => {
      const i = idx + 1;
      if (preloadedRef.current.has(i)) return;
      preloadedRef.current.add(i);
      const delay = 800 + i * 400; // stagger: 1.2s, 1.6s, 2.0s ...
      setTimeout(() => {
        const img = new window.Image();
        img.src = s.image;
        img.onload = () => setLoadedImages((prev) => new Set([...prev, i]));
      }, delay);
    });
  }, []);

  const goTo = useCallback(
    (idx: number) => {
      if (transitioning || idx === current) return;
      setTransitioning(true);
      setCurrent(idx);
      setKenKey((k) => k + 1);
      setTimeout(() => setTransitioning(false), 1000);
    },
    [transitioning, current]
  );

  const next = useCallback(
    () => goTo((current + 1) % SLIDES.length),
    [current, goTo]
  );
  const prev = useCallback(
    () => goTo((current - 1 + SLIDES.length) % SLIDES.length),
    [current, goTo]
  );

  // Auto-advance
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(next, AUTO_INTERVAL);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, next]);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const slide = SLIDES[current];

  const handleCTA = () => router.push("/auth");

  return (
    <section
      id="featured"
      className="hero-root"
    >
      {/* ── BACKGROUND: dark fallback shown instantly while first image loads ── */}
      <div className="hero-bg-fallback" />

      {/* ── BACKGROUND SLIDES ──────────────────────────────────────────────── */}
      {SLIDES.map((s, i) => {
        const isActive = i === current;
        const isLoaded = loadedImages.has(i);
        return (
          <div
            key={i}
            aria-hidden={!isActive}
            className="hero-slide-layer"
            style={{ opacity: isActive && isLoaded ? 1 : 0 }}
          >
            <div
              key={isActive ? `kb-${kenKey}` : `kb-idle-${i}`}
              className="hero-kb"
              style={{
                backgroundImage: isLoaded ? `url(${s.image})` : "none",
                animationName: isActive && isLoaded
                  ? s.kenBurns === "zoom-in-right"
                    ? "kbZoomInRight"
                    : s.kenBurns === "zoom-in-left"
                    ? "kbZoomInLeft"
                    : "kbZoomOut"
                  : "none",
              }}
            />
            <div className="hero-ov1" />
            <div className="hero-ov2" />
            <div className="hero-ov3" />
            <div
              className="hero-accent-wash"
              style={{ background: `radial-gradient(ellipse 60% 50% at 80% 50%, ${s.accent}18 0%, transparent 70%)` }}
            />
          </div>
        );
      })}

      {/* ── GRAIN + SCANLINES ──────────────────────────────────────────────── */}
      <div className="hero-grain" />
      <div className="hero-scanlines" />

      {/* ── MAIN CONTENT ───────────────────────────────────────────────────── */}
      <div className="hero-content-wrap">
        <div className="hero-content-inner">
          <div className="hero-left-col">

            {/* TAG badge */}
            <div key={`tag-${current}`} className="hero-tag-row hero-fadein" style={{ "--delay": "0ms" } as React.CSSProperties}>
              <span className="hero-badge" style={{ color: slide.accent, background: `${slide.accent}18`, border: `1px solid ${slide.accent}40`, boxShadow: `0 0 14px ${slide.accent}22` }}>
                {slide.tag}
              </span>
              <span className="hero-tag-sep" />
              <span className="hero-tag-genre">{slide.genre}</span>
              <span className="hero-tag-dot" />
              <span className="hero-tag-year">{slide.year}</span>
            </div>

            {/* Title */}
            <h1
              key={`title-${current}`}
              className="hero-title hero-fadein"
              style={{ "--delay": "80ms", textShadow: `0 2px 40px rgba(0,0,0,0.6), 0 0 80px ${slide.accent}22` } as React.CSSProperties}
            >
              {slide.title}
            </h1>

            {/* Rating */}
            <div key={`rating-${current}`} className="hero-rating hero-fadein" style={{ "--delay": "140ms" } as React.CSSProperties}>
              <div className="hero-stars">
                {Array.from({ length: 5 }).map((_, i) => {
                  const filled = i < Math.round(parseFloat(slide.rating) / 2);
                  return (
                    <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill={filled ? slide.accent : "rgba(255,255,255,0.15)"}>
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  );
                })}
              </div>
              <span className="hero-rating-num" style={{ color: slide.accent }}>{slide.rating}</span>
              <span className="hero-rating-total">/ 10</span>
              <span className="hero-tag-dot" />
              <span className="hero-rating-label">IMDb Rating</span>
            </div>

            {/* Description */}
            <p key={`desc-${current}`} className="hero-desc hero-fadein" style={{ "--delay": "200ms" } as React.CSSProperties}>
              {slide.description}
            </p>

            {/* CTA buttons */}
            <div key={`cta-${current}`} className="hero-ctas hero-fadein" style={{ "--delay": "280ms" } as React.CSSProperties}>
              <button
                className="hero-btn-primary"
                style={{ background: slide.accent }}
                onClick={handleCTA}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 32px 6px ${slide.accent}55`; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                Watch Now
                <span className="hero-btn-shimmer" />
              </button>

              <button className="hero-btn-secondary" onClick={handleCTA}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
                </svg>
                More Info
              </button>

              <button className="hero-btn-icon" aria-label="Add to watchlist">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </button>
            </div>

            {/* Stats */}
            <div key={`stats-${current}`} className="hero-stats hero-fadein" style={{ "--delay": "360ms" } as React.CSSProperties}>
              {STATS.map((s, i) => (
                <div key={s.label} className="hero-stat-item">
                  <div className="hero-stat-content">
                    <span className="hero-stat-num">{s.num}</span>
                    <span className="hero-stat-label">{s.label}</span>
                  </div>
                  {i < STATS.length - 1 && <div className="hero-stat-divider" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── DOT/SQUARE SLIDE INDICATORS — replaces progress bar ────────────── */}
      <div className="hero-dots">
        {SLIDES.map((_, i) => {
          const isActive = i === current;
          return (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="hero-dot-btn"
            >
              <span
                className="hero-dot"
                style={{
                  background: isActive ? slide.accent : "rgba(255,255,255,0.25)",
                  boxShadow: isActive ? `0 0 8px ${slide.accent}` : "none",
                  width: isActive ? 24 : 6,
                  borderRadius: isActive ? 3 : "50%",
                }}
              />
              {/* Animated fill on active dot */}
              {isActive && (
                <span
                  key={`fill-${current}`}
                  className="hero-dot-fill"
                  style={{ background: slide.accent }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ── PREV / NEXT ARROWS — smaller on mobile, not obstructing ─────────── */}
      <button onClick={prev} className="hero-arrow hero-arrow-left" aria-label="Previous slide">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <button onClick={next} className="hero-arrow hero-arrow-right" aria-label="Next slide">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>

      {/* ── SLIDE COUNT ─────────────────────────────────────────────────────── */}
      <div className="hero-count">
        <span className="hero-count-current">{String(current + 1).padStart(2, "0")}</span>
        <span className="hero-count-total"> / {String(SLIDES.length).padStart(2, "0")}</span>
      </div>

      {/* ── SCROLL INDICATOR ────────────────────────────────────────────────── */}
      <div className="hero-scroll-hint">
        <span className="hero-scroll-label">Scroll</span>
        <div className="hero-scroll-line" />
      </div>

      {/* ── ALL STYLES ──────────────────────────────────────────────────────── */}
      <style>{`
        /* ── ROOT ── */
        .hero-root {
          position: relative;
          width: 100%;
          overflow: hidden;
          min-height: 100svh;
          background: #080808;
        }

        /* Dark fallback shown instantly — no blank white flash */
        .hero-bg-fallback {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #0a0a0c 0%, #111114 100%);
          z-index: 0;
        }

        /* ── SLIDE LAYERS ── */
        .hero-slide-layer {
          position: absolute;
          inset: 0;
          z-index: 1;
          transition: opacity 1.1s cubic-bezier(0.4,0,0.2,1);
        }
        .hero-kb {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          will-change: transform;
          animation-duration: 8s;
          animation-timing-function: ease-in-out;
          animation-fill-mode: forwards;
        }
        .hero-ov1 { position: absolute; inset: 0; background: linear-gradient(105deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.15) 100%); }
        .hero-ov2 { position: absolute; inset: 0; background: linear-gradient(to top, rgba(8,8,8,1) 0%, rgba(8,8,8,0.7) 18%, transparent 50%); }
        .hero-ov3 { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(8,8,8,0.55) 0%, transparent 25%); }
        .hero-accent-wash { position: absolute; inset: 0; }
        .hero-grain {
          position: absolute; inset: 0; pointer-events: none; z-index: 3;
          opacity: 0.035; mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 180px;
        }
        .hero-scanlines {
          position: absolute; inset: 0; pointer-events: none; z-index: 3; opacity: 0.025;
          background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px);
        }

        /* ── CONTENT LAYOUT ── */
        .hero-content-wrap {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          min-height: 100svh;
          /* Bottom padding scales with screen — keeps text off the progress dots */
          padding-bottom: clamp(80px, 10vh, 120px);
        }
        .hero-content-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 clamp(16px, 4vw, 64px);
          width: 100%;
        }
        .hero-left-col {
          /* Width caps so text never runs into the right-side controls */
          max-width: min(580px, 62vw);
        }

        /* ── TAG ROW ── */
        .hero-tag-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: clamp(10px, 1.5vh, 16px);
          flex-wrap: wrap;
        }
        .hero-badge {
          font-size: clamp(8px, 0.9vw, 10px);
          font-weight: 900;
          letter-spacing: 0.35em;
          padding: 3px 10px;
          border-radius: 2px;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .hero-tag-sep { width: 20px; height: 1px; background: rgba(255,255,255,0.2); flex-shrink: 0; }
        .hero-tag-genre { font-size: clamp(8px, 0.9vw, 10px); color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.25em; font-weight: 500; white-space: nowrap; }
        .hero-tag-dot { width: 3px; height: 3px; border-radius: 50%; background: rgba(255,255,255,0.2); flex-shrink: 0; }
        .hero-tag-year { font-size: clamp(8px, 0.9vw, 10px); color: rgba(255,255,255,0.3); letter-spacing: 0.2em; white-space: nowrap; }

        /* ── TITLE ── */
        .hero-title {
          font-family: var(--font-display, 'Bebas Neue', Georgia, serif);
          /*
            THIS IS THE KEY FIX:
            clamp(min, preferred, max)
            - min: never smaller than 1.8rem (readable on tiny phone)
            - preferred: 5.5vw — scales with viewport width
            - max: 5rem — hard cap so it never bleeds into the navbar on 15" laptops
          */
          font-size: clamp(1.9rem, 5.5vw, 5rem);
          color: #fff;
          line-height: 0.93;
          letter-spacing: -0.01em;
          margin-bottom: clamp(10px, 1.5vh, 20px);
        }

        /* ── RATING ── */
        .hero-rating {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: clamp(8px, 1.2vh, 16px);
          flex-wrap: wrap;
        }
        .hero-stars { display: flex; gap: 2px; }
        .hero-rating-num { font-size: clamp(10px, 1vw, 12px); font-weight: 700; }
        .hero-rating-total { font-size: clamp(9px, 0.9vw, 11px); color: rgba(255,255,255,0.2); }
        .hero-rating-label { font-size: clamp(9px, 0.9vw, 11px); color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.15em; }

        /* ── DESCRIPTION ── */
        .hero-desc {
          color: rgba(255,255,255,0.58);
          line-height: 1.65;
          margin-bottom: clamp(16px, 2.5vh, 36px);
          font-size: clamp(0.78rem, 1.2vw, 1rem);
          /* Clamp lines so it never becomes a wall of text */
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* ── CTA BUTTONS ── */
        .hero-ctas {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: clamp(6px, 1vw, 12px);
          margin-bottom: clamp(16px, 2.5vh, 48px);
        }
        .hero-btn-primary {
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: clamp(9px, 1.1vh, 14px) clamp(16px, 2vw, 28px);
          border: none;
          border-radius: 4px;
          color: #fff;
          font-weight: 900;
          font-size: clamp(9px, 0.85vw, 11px);
          letter-spacing: 0.22em;
          text-transform: uppercase;
          cursor: pointer;
          transition: box-shadow 0.3s ease, transform 0.15s ease;
          white-space: nowrap;
        }
        .hero-btn-primary:active { transform: scale(0.97); }
        .hero-btn-shimmer {
          position: absolute; inset: 0;
          background: linear-gradient(108deg, transparent 30%, rgba(255,255,255,0.22) 50%, transparent 70%);
          transform: translateX(-120%);
          transition: transform 0.55s ease;
          pointer-events: none;
        }
        .hero-btn-primary:hover .hero-btn-shimmer { transform: translateX(120%); }
        .hero-btn-secondary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: clamp(9px, 1.1vh, 14px) clamp(16px, 2vw, 28px);
          border-radius: 4px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.75);
          font-weight: 700;
          font-size: clamp(9px, 0.85vw, 11px);
          letter-spacing: 0.22em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
          backdrop-filter: blur(6px);
          white-space: nowrap;
        }
        .hero-btn-secondary:hover { border-color: rgba(255,255,255,0.4); color: #fff; }
        .hero-btn-secondary:active { transform: scale(0.97); }
        .hero-btn-icon {
          width: clamp(36px, 3vw, 44px);
          height: clamp(36px, 3vw, 44px);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          transition: all 0.2s;
          backdrop-filter: blur(6px);
          flex-shrink: 0;
        }
        .hero-btn-icon:hover { border-color: rgba(255,255,255,0.35); color: #fff; }

        /* ── STATS ── */
        .hero-stats {
          display: flex;
          align-items: center;
          gap: 0;
        }
        .hero-stat-item { display: flex; align-items: center; }
        .hero-stat-content {
          display: flex;
          flex-direction: column;
          padding-right: clamp(12px, 1.8vw, 24px);
        }
        .hero-stat-num {
          font-family: var(--font-display, 'Bebas Neue', Georgia, serif);
          font-size: clamp(1.1rem, 2vw, 1.7rem);
          color: #fff;
          letter-spacing: 0.04em;
          line-height: 1;
          font-weight: 900;
        }
        .hero-stat-label {
          font-size: clamp(8px, 0.75vw, 10px);
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          margin-top: 3px;
          white-space: nowrap;
        }
        .hero-stat-divider {
          width: 1px;
          height: clamp(24px, 3vh, 32px);
          background: rgba(255,255,255,0.1);
          margin-right: clamp(12px, 1.8vw, 24px);
          flex-shrink: 0;
        }

        /* ── DOT INDICATORS (replaces progress bar) ── */
        .hero-dots {
          position: absolute;
          bottom: clamp(20px, 3vh, 32px);
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .hero-dot-btn {
          position: relative;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px 2px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hero-dot {
          display: block;
          height: 4px;
          transition: width 0.4s cubic-bezier(0.22,1,0.36,1), background 0.3s, border-radius 0.4s, box-shadow 0.3s;
          border-radius: 50%;
        }
        /* Animated fill overlay on active dot */
        .hero-dot-fill {
          position: absolute;
          left: 2px;
          top: 50%;
          transform: translateY(-50%);
          height: 4px;
          border-radius: 3px;
          width: 0%;
          animation: dotFill ${AUTO_INTERVAL}ms linear forwards;
        }
        @keyframes dotFill {
          from { width: 0%; }
          to   { width: 24px; }
        }

        /* ── ARROWS ── */
        .hero-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: center;
          /* Smaller on mobile — not obstructing */
          width: clamp(32px, 3vw, 44px);
          height: clamp(32px, 3vw, 44px);
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(0,0,0,0.3);
          color: rgba(255,255,255,0.45);
          cursor: pointer;
          backdrop-filter: blur(8px);
          transition: all 0.2s;
        }
        .hero-arrow:hover { border-color: rgba(255,255,255,0.35); color: #fff; background: rgba(0,0,0,0.5); }
        .hero-arrow:active { transform: translateY(-50%) scale(0.94); }
        .hero-arrow-left  { left: clamp(8px, 1.5vw, 24px); }
        /* Right arrow: pushed in from edge to not overlap the pip indicators */
        .hero-arrow-right { right: clamp(8px, 1.5vw, 24px); }

        /* On mobile — arrows are small and tucked to the very edges */
        @media (max-width: 640px) {
          .hero-arrow {
            top: auto;
            bottom: clamp(56px, 10vh, 80px);
            transform: none;
            width: 32px;
            height: 32px;
            opacity: 0.6;
          }
          .hero-arrow:active { transform: scale(0.94); }
          .hero-arrow-left  { left: 12px; }
          .hero-arrow-right { right: 12px; }
        }

        /* ── SLIDE COUNT ── */
        .hero-count {
          position: absolute;
          bottom: clamp(20px, 3vh, 32px);
          right: clamp(12px, 2vw, 32px);
          z-index: 20;
          display: flex;
          align-items: baseline;
          gap: 2px;
        }
        .hero-count-current {
          font-family: var(--font-display, 'Bebas Neue', Georgia, serif);
          font-size: clamp(1rem, 1.5vw, 1.3rem);
          color: #fff;
          font-weight: 900;
          line-height: 1;
        }
        .hero-count-total {
          font-size: clamp(9px, 0.85vw, 11px);
          color: rgba(255,255,255,0.25);
          line-height: 1;
        }

        /* ── SCROLL HINT (desktop only) ── */
        .hero-scroll-hint {
          position: absolute;
          bottom: clamp(20px, 4vh, 40px);
          left: 50%;
          /* Offset so it doesn't sit on the dots */
          margin-left: clamp(60px, 8vw, 100px);
          transform: translateX(-50%);
          z-index: 20;
          display: none;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        @media (min-width: 1024px) { .hero-scroll-hint { display: flex; } }
        .hero-scroll-label { font-size: 9px; color: rgba(255,255,255,0.2); text-transform: uppercase; letter-spacing: 0.5em; }
        .hero-scroll-line {
          width: 1px;
          height: 36px;
          background: linear-gradient(to bottom, rgba(255,255,255,0.2), transparent);
          animation: scrollPulse 2s ease-in-out infinite;
          transform-origin: top;
        }
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.3; transform: scaleY(0.7); }
          50%       { opacity: 0.8; transform: scaleY(1); }
        }

        /* ── KEN BURNS KEYFRAMES ── */
        @keyframes kbZoomInRight {
          0%   { transform: scale(1.08) translateX(-1.5%); }
          100% { transform: scale(1.18) translateX(0.5%); }
        }
        @keyframes kbZoomInLeft {
          0%   { transform: scale(1.08) translateX(1.5%); }
          100% { transform: scale(1.18) translateX(-0.5%); }
        }
        @keyframes kbZoomOut {
          0%   { transform: scale(1.18); }
          100% { transform: scale(1.06); }
        }

        /* ── CONTENT FADE-IN ── */
        @keyframes heroFadeInUp {
          from { opacity: 0; transform: translateY(20px); filter: blur(3px); }
          to   { opacity: 1; transform: translateY(0);   filter: blur(0); }
        }
        .hero-fadein {
          opacity: 0;
          animation: heroFadeInUp 0.7s cubic-bezier(0.22,1,0.36,1) both;
          animation-delay: var(--delay, 0ms);
        }

        /* ── MOBILE LAYOUT OVERRIDES ── */
        @media (max-width: 768px) {
          .hero-left-col {
            max-width: 100%;
          }
          /* Give text column breathing room from the arrows */
          .hero-content-inner {
            padding: 0 clamp(14px, 5vw, 28px);
          }
          /* Tighter bottom padding on mobile — dots live lower */
          .hero-content-wrap {
            padding-bottom: clamp(90px, 14vh, 120px);
          }
          /* Hide slide count on small phones — too cluttered */
          .hero-count { display: none; }
        }

        /* ── VERY SMALL PHONES (< 380px) ── */
        @media (max-width: 380px) {
          .hero-title { font-size: clamp(1.65rem, 8.5vw, 2.4rem); }
          .hero-desc { -webkit-line-clamp: 2; }
          .hero-stats { display: none; }
        }

        /* ── TALL DESKTOP / 4K ── */
        @media (min-width: 1600px) {
          .hero-left-col { max-width: 700px; }
        }
      `}</style>
    </section>
  );
}