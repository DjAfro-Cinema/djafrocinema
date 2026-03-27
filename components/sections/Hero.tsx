"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── SLIDE DATA ────────────────────────────────────────────────────────────────
// Images: /images/hero1.jpg → /images/hero6.jpg  (place in /public/images/)
const SLIDES = [
  {
    image: "/images/hero1.jpg",
    title: "Anaconda Rising",
    genre: "Action · Adventure",
    year: "2024",
    rating: "8.4",
    tag: "EXCLUSIVE",
    description:
      "The Amazon's deadliest legend comes to life. An epic dubbed adventure that slithers into your heart — only on DjAfro Cinema.",
    accent: "#e50914",
    kenBurns: "zoom-in-right",   // zoom direction variant
  },
  {
    image: "/images/hero2.jpg",
    title: "Baahubali: The Lost Kingdom",
    genre: "Epic · Fantasy",
    year: "2024",
    rating: "9.1",
    tag: "DUBBED",
    description:
      "The epic that redefined Indian cinema, now fully dubbed for East Africa. Kingdoms, betrayal, and destiny await on DjAfro Cinema.",
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
      "Marvel's anti-hero team takes center stage in this thrilling new chapter of the MCU — now dubbed and streaming on DjAfro Cinema.",
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
      "The iconic Bollywood superhero's most beloved adventure, now fully dubbed for East Africa. Experience the legend of Krish on DjAfro Cinema.",
    accent: "#e50914",
    kenBurns: "zoom-out",
  },
];

const STATS = [
  { num: "1,200+", label: "App Downloads" },
  { num: "500+",   label: "Movies Dubbed" },
  { num: "10K+",   label: "Loyal Fans" },
];

const AUTO_INTERVAL = 6000;

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function HeroImage() {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [kenKey, setKenKey] = useState(0);          // restart Ken Burns on slide change
  const [progressKey, setProgressKey] = useState(0); // restart progress bar
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const progressRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback(
    (idx: number, dir: "next" | "prev" = "next") => {
      if (transitioning) return;
      setTransitioning(true);
      setDirection(dir);
      setCurrent(idx);
      setKenKey((k) => k + 1);
      setProgressKey((k) => k + 1);
      setTimeout(() => setTransitioning(false), 1000);
    },
    [transitioning]
  );

  const next = useCallback(() => goTo((current + 1) % SLIDES.length, "next"), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + SLIDES.length) % SLIDES.length, "prev"), [current, goTo]);

  // Auto-advance
  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(next, AUTO_INTERVAL);
    return () => clearTimeout(timerRef.current);
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

  return (
    <section
      id="featured"
      className="relative w-full overflow-hidden"
      style={{ minHeight: "100svh" }}
    >
      {/* ── BACKGROUND SLIDES ──────────────────────────────────────────────── */}
      {SLIDES.map((s, i) => {
        const isActive = i === current;
        return (
          <div
            key={i}
            aria-hidden={!isActive}
            className="absolute inset-0"
            style={{
              zIndex: isActive ? 2 : 1,
              opacity: isActive ? 1 : 0,
              transition: "opacity 1.1s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            {/* Ken Burns image */}
            <div
              key={isActive ? `kb-${kenKey}` : `kb-idle-${i}`}
              className="absolute inset-0 bg-cover bg-center will-change-transform"
              style={{
                backgroundImage: `url(${s.image})`,
                animation: isActive
                  ? s.kenBurns === "zoom-in-right"
                    ? "kbZoomInRight 8s ease-in-out forwards"
                    : s.kenBurns === "zoom-in-left"
                    ? "kbZoomInLeft 8s ease-in-out forwards"
                    : "kbZoomOut 8s ease-in-out forwards"
                  : "none",
              }}
            />

            {/* Deep cinematic gradient layers */}
            <div className="absolute inset-0" style={{ background: "linear-gradient(105deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.15) 100%)" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,8,8,1) 0%, rgba(8,8,8,0.7) 18%, transparent 50%)" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(8,8,8,0.55) 0%, transparent 25%)" }} />

            {/* Accent colour wash — very subtle */}
            <div
              className="absolute inset-0 transition-opacity duration-1000"
              style={{
                background: `radial-gradient(ellipse 60% 50% at 80% 50%, ${s.accent}18 0%, transparent 70%)`,
                opacity: isActive ? 1 : 0,
              }}
            />
          </div>
        );
      })}

      {/* ── FILM GRAIN ─────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none z-[3] opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "180px",
        }}
      />

      {/* ── SCAN LINES (subtle) ─────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none z-[3] opacity-[0.025]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)",
        }}
      />

      {/* ── MAIN CONTENT ───────────────────────────────────────────────────── */}
      <div className="relative z-[10] flex flex-col justify-end min-h-screen pb-24 sm:pb-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-10 w-full">

          {/* Left content column */}
          <div className="max-w-xl xl:max-w-2xl">

            {/* TAG badge */}
            <div
              key={`tag-${current}`}
              className="inline-flex items-center gap-2 mb-4 hero-fadein"
              style={{ "--delay": "0ms" } as React.CSSProperties}
            >
              <span
                className="text-[10px] font-black tracking-[0.35em] px-3 py-1 rounded-sm uppercase"
                style={{
                  color: slide.accent,
                  background: `${slide.accent}18`,
                  border: `1px solid ${slide.accent}40`,
                  boxShadow: `0 0 14px ${slide.accent}22`,
                }}
              >
                {slide.tag}
              </span>
              <span className="w-6 h-px bg-white/20" />
              <span className="text-[10px] text-white/35 uppercase tracking-[0.25em] font-medium">{slide.genre}</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span className="text-[10px] text-white/30 tracking-widest">{slide.year}</span>
            </div>

            {/* Title */}
            <h1
              key={`title-${current}`}
              className="text-white leading-[0.92] mb-5 hero-fadein tracking-tight"
              style={{
                "--delay": "80ms",
                fontFamily: "var(--font-display, 'Georgia, serif')",
                fontSize: "clamp(2.8rem, 7.5vw, 6.5rem)",
                textShadow: `0 2px 40px rgba(0,0,0,0.6), 0 0 80px ${slide.accent}22`,
                letterSpacing: "-0.01em",
              } as React.CSSProperties}
            >
              {slide.title}
            </h1>

            {/* Rating bar */}
            <div
              key={`rating-${current}`}
              className="flex items-center gap-3 mb-5 hero-fadein"
              style={{ "--delay": "140ms" } as React.CSSProperties}
            >
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => {
                  const filled = i < Math.round(parseFloat(slide.rating) / 2);
                  return (
                    <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={filled ? slide.accent : "rgba(255,255,255,0.15)"}>
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  );
                })}
              </div>
              <span className="text-xs font-bold" style={{ color: slide.accent }}>{slide.rating}</span>
              <span className="text-white/20 text-xs">/ 10</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span className="text-white/30 text-xs uppercase tracking-wider">IMDb Rating</span>
            </div>

            {/* Description */}
            <p
              key={`desc-${current}`}
              className="text-white/60 leading-relaxed max-w-md mb-10 hero-fadein"
              style={{
                "--delay": "200ms",
                fontSize: "clamp(0.9rem, 1.5vw, 1.05rem)",
              } as React.CSSProperties}
            >
              {slide.description}
            </p>

            {/* CTA buttons */}
            <div
              key={`cta-${current}`}
              className="flex flex-wrap items-center gap-3 mb-14 hero-fadein"
              style={{ "--delay": "280ms" } as React.CSSProperties}
            >
              {/* Primary */}
              <button
                className="group relative overflow-hidden flex items-center gap-3 px-7 py-3.5 rounded text-white font-black text-xs uppercase tracking-[0.2em] transition-all duration-200 active:scale-[0.97] focus:outline-none"
                style={{
                  background: slide.accent,
                  boxShadow: `0 0 0 0 ${slide.accent}`,
                  transition: "box-shadow 0.3s ease, transform 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 0 32px 6px ${slide.accent}55`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 0 ${slide.accent}`;
                }}
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Now
                <span className="absolute inset-0 -translate-x-full skew-x-[-15deg] bg-white/20 group-hover:translate-x-[200%] transition-transform duration-600 ease-in-out" />
              </button>

              {/* Secondary */}
              <button className="group flex items-center gap-3 px-7 py-3.5 rounded text-white/75 hover:text-white font-bold text-xs uppercase tracking-[0.2em] border border-white/15 hover:border-white/40 backdrop-blur-sm transition-all duration-200 active:scale-[0.97] focus:outline-none">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
                </svg>
                More Info
              </button>

              {/* Watchlist */}
              <button className="group w-11 h-11 flex items-center justify-center rounded border border-white/15 hover:border-white/35 backdrop-blur-sm transition-all duration-200 focus:outline-none">
                <svg className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </button>
            </div>

            {/* Stats */}
            <div
              key={`stats-${current}`}
              className="flex items-center gap-0 hero-fadein"
              style={{ "--delay": "360ms" } as React.CSSProperties}
            >
              {STATS.map((s, i) => (
                <div key={s.label} className="flex items-center">
                  <div className="flex flex-col leading-none pr-6">
                    <span
                      className="text-xl sm:text-2xl font-black text-white tracking-tight"
                      style={{ fontFamily: "var(--font-display, Georgia, serif)" }}
                    >
                      {s.num}
                    </span>
                    <span className="text-white/35 text-[10px] uppercase tracking-[0.2em] mt-1">{s.label}</span>
                  </div>
                  {i < STATS.length - 1 && (
                    <div className="h-8 w-px bg-white/10 mr-6" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── SLIDE SELECTOR — right side vertical ────────────────────────── */}
        <div className="absolute right-5 sm:right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2.5 items-end">
          {SLIDES.map((s, i) => {
            const isActive = i === current;
            return (
              <button
                key={i}
                onClick={() => goTo(i, i > current ? "next" : "prev")}
                className="group flex items-center gap-2 focus:outline-none"
                aria-label={`Slide ${i + 1}: ${s.title}`}
              >
                {/* Thumbnail preview on hover */}
                <span
                  className="overflow-hidden rounded transition-all duration-300 opacity-0 group-hover:opacity-100"
                  style={{
                    width: isActive ? 0 : 56,
                    height: 36,
                    backgroundImage: `url(${s.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    border: `1px solid ${isActive ? s.accent : "rgba(255,255,255,0.15)"}`,
                  }}
                />
                {/* Pip */}
                <span
                  className="rounded-full transition-all duration-400 ease-out"
                  style={{
                    width: isActive ? 28 : 6,
                    height: isActive ? 4 : 6,
                    background: isActive ? slide.accent : "rgba(255,255,255,0.25)",
                    boxShadow: isActive ? `0 0 10px ${slide.accent}` : "none",
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* ── PROGRESS BAR (bottom) ───────────────────────────────────────── */}
        <div className="absolute bottom-0 left-0 right-0 z-20 h-[2px] bg-white/[0.06]">
          <div
            key={`progress-${progressKey}`}
            className="h-full rounded-full"
            style={{
              background: slide.accent,
              boxShadow: `0 0 8px ${slide.accent}`,
              animation: `heroProgress ${AUTO_INTERVAL}ms linear forwards`,
            }}
          />
        </div>

        {/* ── PREV / NEXT ARROWS ───────────────────────────────────────────── */}
        <button
          onClick={prev}
          className="absolute left-4 sm:left-8 bottom-1/3 z-20 group w-11 h-11 flex items-center justify-center rounded-full border border-white/10 hover:border-white/30 backdrop-blur-md transition-all duration-200 focus:outline-none"
          aria-label="Previous slide"
        >
          <svg className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <button
          onClick={next}
          className="absolute right-16 sm:right-20 bottom-1/3 z-20 group w-11 h-11 flex items-center justify-center rounded-full border border-white/10 hover:border-white/30 backdrop-blur-md transition-all duration-200 focus:outline-none"
          aria-label="Next slide"
        >
          <svg className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>

        {/* ── SLIDE COUNT ─────────────────────────────────────────────────── */}
        <div className="absolute bottom-6 right-5 sm:right-8 z-20 flex items-baseline gap-1">
          <span className="text-white font-black text-lg leading-none" style={{ fontFamily: "var(--font-display, Georgia)" }}>
            {String(current + 1).padStart(2, "0")}
          </span>
          <span className="text-white/25 text-xs leading-none"> / {String(SLIDES.length).padStart(2, "0")}</span>
        </div>

        {/* ── SCROLL INDICATOR ────────────────────────────────────────────── */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center gap-2">
          <span className="text-white/20 text-[9px] uppercase tracking-[0.5em]">Scroll</span>
          <div className="w-px h-9 bg-gradient-to-b from-white/20 to-transparent animate-scroll-line" />
        </div>
      </div>

      {/* ── KEYFRAMES ───────────────────────────────────────────────────────── */}
      <style>{`
        /* Ken Burns variants */
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

        /* Staggered fade-up for content */
        @keyframes heroFadeInUp {
          from { opacity: 0; transform: translateY(22px); filter: blur(4px); }
          to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
        }
        .hero-fadein {
          opacity: 0;
          animation: heroFadeInUp 0.75s cubic-bezier(0.22,1,0.36,1) both;
          animation-delay: var(--delay, 0ms);
        }

        /* Progress bar */
        @keyframes heroProgress {
          from { width: 0%; }
          to   { width: 100%; }
        }

        /* Scroll line pulse */
        @keyframes scrollLinePulse {
          0%, 100% { opacity: 0.3; transform: scaleY(0.7); }
          50%       { opacity: 0.8; transform: scaleY(1); }
        }
        .animate-scroll-line {
          animation: scrollLinePulse 2s ease-in-out infinite;
          transform-origin: top;
        }
      `}</style>
    </section>
  );
}