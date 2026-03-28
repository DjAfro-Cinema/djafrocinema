"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Play, Info, Plus, Check, Star, ChevronLeft, ChevronRight } from "lucide-react";

export interface BannerMovie {
  id: string;
  title: string;
  genre: string;
  year: string;
  rating: string;
  tag: string;
  description: string;
  img: string;
  dubbed?: boolean;
  duration?: string;
  kenBurns?: "zoom-in-right" | "zoom-in-left" | "zoom-out";
}

interface MovieBannerProps {
  movies: BannerMovie[];
  onPlay?: (movie: BannerMovie) => void;
  onMoreInfo?: (movie: BannerMovie) => void;
  autoInterval?: number;
  compact?: boolean;
}

export default function MovieBanner({
  movies,
  onPlay,
  onMoreInfo,
  autoInterval = 6000,
  compact = false,
}: MovieBannerProps) {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [kenKey, setKenKey] = useState(0);
  const [progressKey, setProgressKey] = useState(0);
  const [inLib, setInLib] = useState<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const goTo = useCallback((idx: number) => {
    if (transitioning) return;
    setTransitioning(true);
    setCurrent(idx);
    setKenKey(k => k + 1);
    setProgressKey(k => k + 1);
    setTimeout(() => setTransitioning(false), 900);
  }, [transitioning]);

  const next = useCallback(() => goTo((current + 1) % movies.length), [current, goTo, movies.length]);
  const prev = useCallback(() => goTo((current - 1 + movies.length) % movies.length), [current, goTo, movies.length]);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(next, autoInterval);
    return () => clearTimeout(timerRef.current);
  }, [current, next, autoInterval]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [next, prev]);

  if (!movies.length) return null;

  const slide = movies[current];
  const minH = compact ? "min(52vh, 400px)" : "min(80vh, 680px)";

  return (
    <section style={{
      position: "relative",
      width: "100%",
      minHeight: minH,
      overflow: "hidden",
      marginBottom: 36,
    }}>
      {/* Background slides */}
      {movies.map((s, i) => {
        const isActive = i === current;
        const kb = s.kenBurns ?? "zoom-in-right";
        return (
          <div
            key={i}
            aria-hidden={!isActive}
            style={{
              position: "absolute", inset: 0,
              zIndex: isActive ? 2 : 1,
              opacity: isActive ? 1 : 0,
              transition: "opacity 1s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            <div
              key={isActive ? `kb-${kenKey}` : `idle-${i}`}
              style={{
                position: "absolute", inset: 0,
                backgroundImage: `url(${s.img})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                willChange: "transform",
                animation: isActive
                  ? kb === "zoom-in-right"
                    ? "djBannerKbRight 8s ease-in-out forwards"
                    : kb === "zoom-in-left"
                    ? "djBannerKbLeft 8s ease-in-out forwards"
                    : "djBannerKbOut 8s ease-in-out forwards"
                  : "none",
              }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.15) 100%)" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,10,1) 0%, rgba(8,8,10,0.7) 18%, transparent 50%)" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(8,8,10,0.5) 0%, transparent 22%)" }} />
          </div>
        );
      })}

      {/* Content */}
      <div style={{
        position: "relative", zIndex: 10,
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
        minHeight: minH,
        padding: compact ? "24px 32px 36px" : "36px 44px 48px",
      }}>
        <div style={{ maxWidth: 540 }}>

          {/* Tag + meta */}
          <div
            key={`tag-${current}`}
            style={{
              display: "flex", alignItems: "center", gap: 10, marginBottom: 14,
              animation: "djBannerFadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both",
            }}
          >
            <span style={{
              fontSize: 8.5, fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
              letterSpacing: "0.35em", textTransform: "uppercase",
              padding: "3px 9px",
              color: "#e50914",
              background: "rgba(229,9,20,0.12)",
              border: "1px solid rgba(229,9,20,0.28)",
            }}>{slide.tag}</span>
            <span style={{ width: 20, height: 1, background: "rgba(255,255,255,0.18)" }} />
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.25em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>{slide.genre}</span>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.18)" }} />
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "0.15em", fontFamily: "'DM Sans', sans-serif" }}>{slide.year}</span>
            {slide.dubbed && (
              <span style={{
                fontSize: 8, fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                letterSpacing: "0.2em", padding: "2px 7px",
                background: "rgba(37,211,102,0.1)", color: "#25d366",
                border: "1px solid rgba(37,211,102,0.22)",
              }}>DUBBED</span>
            )}
          </div>

          {/* Title */}
          <h1
            key={`title-${current}`}
            style={{
              fontSize: compact ? "clamp(2rem,5vw,3.2rem)" : "clamp(2.4rem,6vw,4.8rem)",
              fontFamily: "'Bebas Neue', sans-serif",
              color: "#fff", letterSpacing: "0.02em", lineHeight: 0.92,
              marginBottom: 14,
              textShadow: "0 2px 30px rgba(0,0,0,0.5)",
              animation: "djBannerFadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.07s both",
            }}
          >{slide.title}</h1>

          {/* Rating */}
          <div
            key={`rating-${current}`}
            style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
              animation: "djBannerFadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.12s both",
            }}
          >
            <div style={{ display: "flex", gap: 2 }}>
              {Array.from({ length: 5 }).map((_, i) => {
                const filled = i < Math.round(parseFloat(slide.rating) / 2);
                return <Star key={i} size={10} fill={filled ? "#e50914" : "rgba(255,255,255,0.1)"} color={filled ? "#e50914" : "rgba(255,255,255,0.1)"} />;
              })}
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#e50914", fontFamily: "'DM Sans', sans-serif" }}>{slide.rating}</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", fontFamily: "'DM Sans', sans-serif" }}>/ 10</span>
            {slide.duration && (
              <>
                <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.2)" }} />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", fontFamily: "'DM Sans', sans-serif" }}>{slide.duration}</span>
              </>
            )}
          </div>

          {/* Description */}
          <p
            key={`desc-${current}`}
            style={{
              fontSize: "clamp(0.8rem,1.2vw,0.9rem)",
              color: "rgba(255,255,255,0.5)",
              lineHeight: 1.65, maxWidth: 430,
              marginBottom: 24,
              fontFamily: "'DM Sans', sans-serif",
              animation: "djBannerFadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.18s both",
            }}
          >{slide.description}</p>

          {/* CTAs */}
          <div
            key={`cta-${current}`}
            style={{
              display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10,
              animation: "djBannerFadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.25s both",
            }}
          >
            <button
              onClick={() => onPlay?.(slide)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "11px 26px",
                background: "#e50914", border: "none", cursor: "pointer",
                color: "#fff", fontSize: 10.5,
                fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                letterSpacing: "0.2em", textTransform: "uppercase",
                boxShadow: "0 0 30px rgba(229,9,20,0.4)",
                transition: "box-shadow 0.25s",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 0 50px rgba(229,9,20,0.65)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 0 30px rgba(229,9,20,0.4)"}
            >
              <Play size={13} fill="#fff" />
              Watch Now
            </button>

            <button
              onClick={() => onMoreInfo?.(slide)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "11px 20px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)", cursor: "pointer",
                color: "rgba(255,255,255,0.7)", fontSize: 10.5,
                fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                letterSpacing: "0.2em", textTransform: "uppercase",
                backdropFilter: "blur(8px)",
                transition: "border-color 0.2s, color 0.2s",
              }}
            >
              <Info size={13} />
              More Info
            </button>

            <button
              onClick={() => setInLib(s => {
                const n = new Set(s);
                n.has(slide.id) ? n.delete(slide.id) : n.add(slide.id);
                return n;
              })}
              style={{
                width: 42, height: 42,
                background: inLib.has(slide.id) ? "rgba(37,211,102,0.1)" : "rgba(255,255,255,0.06)",
                border: `1px solid ${inLib.has(slide.id) ? "rgba(37,211,102,0.28)" : "rgba(255,255,255,0.12)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {inLib.has(slide.id)
                ? <Check size={15} color="#25d366" />
                : <Plus size={15} color="rgba(255,255,255,0.5)" />
              }
            </button>
          </div>
        </div>

        {/* Slide pips — right side */}
        <div style={{
          position: "absolute", right: 24, top: "50%",
          transform: "translateY(-50%)", zIndex: 20,
          display: "flex", flexDirection: "column", gap: 8,
        }}>
          {movies.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: 4,
                height: i === current ? 24 : 6,
                border: "none", cursor: "pointer",
                background: i === current ? "#e50914" : "rgba(255,255,255,0.2)",
                boxShadow: i === current ? "0 0 8px #e50914" : "none",
                transition: "all 0.35s cubic-bezier(0.22,1,0.36,1)",
              }}
            />
          ))}
        </div>

        {/* Arrows */}
        <button
          onClick={prev}
          style={{
            position: "absolute", left: 16, bottom: "36%",
            width: 38, height: 38,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(10px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "rgba(255,255,255,0.45)",
            transition: "all 0.2s", zIndex: 20,
          }}
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={next}
          style={{
            position: "absolute", right: 46, bottom: "36%",
            width: 38, height: 38,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(10px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "rgba(255,255,255,0.45)",
            transition: "all 0.2s", zIndex: 20,
          }}
        >
          <ChevronRight size={16} />
        </button>

        {/* Slide counter */}
        <div style={{
          position: "absolute", bottom: 16, right: 16, zIndex: 20,
          display: "flex", alignItems: "baseline", gap: 3,
        }}>
          <span style={{ fontSize: 20, fontFamily: "'Bebas Neue', sans-serif", color: "#fff", letterSpacing: "0.08em", lineHeight: 1 }}>
            {String(current + 1).padStart(2, "0")}
          </span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", fontFamily: "'DM Sans', sans-serif" }}>/ {String(movies.length).padStart(2, "0")}</span>
        </div>

        {/* Progress bar */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 20, height: 2, background: "rgba(255,255,255,0.04)" }}>
          <div
            key={`progress-${progressKey}`}
            style={{
              height: "100%", background: "#e50914",
              animation: `djBannerProgress ${autoInterval}ms linear forwards`,
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes djBannerKbRight { 0%{transform:scale(1.06) translateX(-1.5%)} 100%{transform:scale(1.15) translateX(0.5%)} }
        @keyframes djBannerKbLeft  { 0%{transform:scale(1.06) translateX(1.5%)}  100%{transform:scale(1.15) translateX(-0.5%)} }
        @keyframes djBannerKbOut   { 0%{transform:scale(1.15)} 100%{transform:scale(1.04)} }
        @keyframes djBannerFadeUp  { from{opacity:0;transform:translateY(18px);filter:blur(3px)} to{opacity:1;transform:translateY(0);filter:blur(0)} }
        @keyframes djBannerProgress { from{width:0%} to{width:100%} }
      `}</style>
    </section>
  );
}