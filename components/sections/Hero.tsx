"use client";

import { useEffect, useRef, useState } from "react";

const SLIDES = [
  {
    title: "The Last Kingdom",
    genre: "Action · Adventure",
    year: "2024",
    rating: "8.4",
    description: "A warrior's journey across war-torn lands — dubbed in pure DJ Afro style.",
    bg: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=1920&q=80",
    accent: "#e50914",
  },
  {
    title: "Bollywood Nights",
    genre: "Romance · Drama",
    year: "2024",
    rating: "7.9",
    description: "Love, betrayal, and music in the heart of Mumbai. Exclusively dubbed.",
    bg: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=1920&q=80",
    accent: "#ff6b35",
  },
  {
    title: "Nairobi Heat",
    genre: "Thriller · Crime",
    year: "2023",
    rating: "8.1",
    description: "East Africa's most gripping crime saga. Now streaming on DjAfro Cinema.",
    bg: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80",
    accent: "#00c8ff",
  },
  {
    title: "Savanna Warriors",
    genre: "Epic · War",
    year: "2024",
    rating: "9.0",
    description: "The legend that shook a continent. Witness the full dubbed experience.",
    bg: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1920&q=80",
    accent: "#ffd700",
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const goTo = (idx: number) => {
    if (transitioning || idx === current) return;
    setTransitioning(true);
    setPrev(current);
    setCurrent(idx);
    setTimeout(() => { setTransitioning(false); setPrev(null); }, 900);
  };

  // Auto-advance
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      goTo((current + 1) % SLIDES.length);
    }, 5500);
    return () => clearTimeout(timerRef.current);
  }, [current]);

  const slide = SLIDES[current];

  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden"
      style={{ minHeight: "100svh" }}
    >
      {/* ── BACKGROUNDS ── */}
      {SLIDES.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            opacity: i === current ? 1 : 0,
            zIndex: i === current ? 1 : 0,
          }}
        >
          {/* Movie poster bg */}
          <div
            className="absolute inset-0 bg-cover bg-center scale-105"
            style={{
              backgroundImage: `url(${s.bg})`,
              transform: i === current ? "scale(1.03)" : "scale(1)",
              transition: "transform 8s ease",
            }}
          />
          {/* Multi-layered gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/60 via-transparent to-transparent" />
        </div>
      ))}

      {/* ── NOISE TEXTURE OVERLAY ── */}
      <div
        className="absolute inset-0 pointer-events-none z-[2] opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px",
        }}
      />

      {/* ── CONTENT ── */}
      <div className="relative z-[10] flex flex-col justify-end min-h-screen pb-20 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full">
          <div className="max-w-xl xl:max-w-2xl">

            {/* Genre + rating row */}
            <div
              key={`meta-${current}`}
              className="flex items-center gap-4 mb-5 animate-fadeInUp"
              style={{ animationDelay: "0ms" }}
            >
              <span className="text-xs uppercase tracking-[0.3em] text-white/50 font-medium">{slide.genre}</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span className="text-xs text-white/40 tracking-widest">{slide.year}</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span
                className="text-xs font-bold tracking-wider px-2 py-0.5 rounded"
                style={{ color: slide.accent, border: `1px solid ${slide.accent}44`, background: `${slide.accent}11` }}
              >
                ★ {slide.rating}
              </span>
            </div>

            {/* Movie title */}
            <h1
              key={`title-${current}`}
              className="text-white leading-none mb-6 animate-fadeInUp"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(3rem, 8vw, 6.5rem)",
                letterSpacing: "0.04em",
                textShadow: `0 0 80px ${slide.accent}33`,
                animationDelay: "80ms",
              }}
            >
              {slide.title}
            </h1>

            {/* Description */}
            <p
              key={`desc-${current}`}
              className="text-white/60 text-base sm:text-lg leading-relaxed max-w-md mb-10 animate-fadeInUp"
              style={{ animationDelay: "160ms" }}
            >
              {slide.description}
            </p>

            {/* CTAs */}
            <div
              key={`cta-${current}`}
              className="flex flex-wrap items-center gap-4 animate-fadeInUp"
              style={{ animationDelay: "240ms" }}
            >
              <button
                className="group relative overflow-hidden flex items-center gap-3 px-8 py-4 rounded text-white font-bold text-sm uppercase tracking-widest transition-all duration-200 active:scale-95"
                style={{
                  background: slide.accent,
                  boxShadow: `0 0 30px ${slide.accent}55`,
                }}
              >
                {/* Play icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Now
                <span className="absolute inset-0 -translate-x-full skew-x-[-12deg] bg-white/15 group-hover:translate-x-full transition-transform duration-500" />
              </button>

              <button className="flex items-center gap-3 px-8 py-4 rounded text-white/80 hover:text-white font-bold text-sm uppercase tracking-widest border border-white/20 hover:border-white/50 backdrop-blur-sm transition-all duration-200 active:scale-95">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4m0 4h.01" />
                </svg>
                More Info
              </button>
            </div>

            {/* Stats row */}
            <div
              key={`stats-${current}`}
              className="flex items-center gap-8 mt-12 animate-fadeInUp"
              style={{ animationDelay: "320ms" }}
            >
              {[
                { num: "1,200+", label: "App Downloads" },
                { num: "500+", label: "Movies" },
                { num: "10K+", label: "Fans" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col leading-none">
                  <span
                    className="text-2xl font-black text-white"
                    style={{ fontFamily: "var(--font-display)", letterSpacing: "0.05em" }}
                  >
                    {s.num}
                  </span>
                  <span className="text-white/40 text-xs uppercase tracking-widest mt-1">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── SLIDE DOTS + THUMBNAILS ── */}
        <div className="absolute right-6 sm:right-10 bottom-1/4 z-20 flex flex-col gap-3">
          {SLIDES.map((s, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="group flex flex-col items-end gap-1.5 focus:outline-none"
              aria-label={`Go to slide ${i + 1}`}
            >
              <div
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-6 h-1.5 bg-[#e50914] shadow-[0_0_8px_#e50914]"
                    : "w-1.5 h-1.5 bg-white/30 group-hover:bg-white/60"
                }`}
              />
            </button>
          ))}
        </div>

        {/* ── SCROLL INDICATOR ── */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-bounce-slow">
          <span className="text-white/30 text-[10px] uppercase tracking-[0.4em]">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.7s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50%       { transform: translateX(-50%) translateY(6px); }
        }
        .animate-bounce-slow { animation: bounce-slow 2.4s ease-in-out infinite; }
      `}</style>
    </section>
  );
}