"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Play, Info, Plus, Check, Star, ChevronLeft, ChevronRight, Lock, CheckCircle2 } from "lucide-react";
import PremiumPlayButton from "@/components/payment/Premiumplaybutton";
import { usePremiumGate } from "@/context/PremiumGateContext";
import { useTheme } from "@/context/ThemeContext";

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
  premium?: boolean;
}

interface MovieBannerProps {
  movies: BannerMovie[];
  userId: string;
  paidMovieIds?: string[];
  onPlay?: (movie: BannerMovie) => void;
  onMoreInfo?: (movie: BannerMovie) => void;
  autoInterval?: number;
  compact?: boolean;
}

// Preload an image URL into the browser cache immediately
function preloadImage(src: string) {
  if (typeof window === "undefined" || !src) return;
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = src;
  // Only add if not already preloading this URL
  if (!document.head.querySelector(`link[rel="preload"][href="${src}"]`)) {
    document.head.appendChild(link);
  }
}

export default function MovieBanner({
  movies,
  userId,
  paidMovieIds: seedPaidIds = [],
  onPlay,
  onMoreInfo,
  autoInterval = 6000,
  compact = false,
}: MovieBannerProps) {
  const router = useRouter();
  const { t } = useTheme();

  const { paidMovieIds: contextPaidIds } = usePremiumGate();
  const paidSet = new Set([...seedPaidIds, ...contextPaidIds]);

  const [current, setCurrent]             = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [kenKey, setKenKey]               = useState(0);
  const [tickKey, setTickKey]             = useState(0);
  const [inLib, setInLib]                 = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile]           = useState(false);
  // Track which slide indices have been "revealed" (image loaded at least once)
  const [revealed, setRevealed]           = useState<Set<number>>(new Set([0]));
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Preload first image + next two immediately on mount for instant display
  useEffect(() => {
    if (!movies.length) return;
    // Preload current + next 2 slides aggressively
    const toPreload = [0, 1, 2].filter((i) => i < movies.length);
    toPreload.forEach((i) => preloadImage(movies[i].img));
  }, [movies]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 480);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const goTo = useCallback((idx: number) => {
    if (transitioning) return;
    setTransitioning(true);
    setCurrent(idx);
    setKenKey((k) => k + 1);
    setTickKey((k) => k + 1);
    setRevealed((prev) => new Set([...prev, idx]));

    // Preload the NEXT slide's image ahead of time
    const nextIdx = (idx + 1) % movies.length;
    const prevIdx = (idx - 1 + movies.length) % movies.length;
    preloadImage(movies[nextIdx].img);
    preloadImage(movies[prevIdx].img);

    setTimeout(() => setTransitioning(false), 900);
  }, [transitioning, movies]);

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

  const slide    = movies[current];
  const minH     = compact ? "min(52vh, 400px)" : "min(80vh, 680px)";
  const isPaid   = paidSet.has(slide.id);
  const isLocked = slide.premium && !isPaid;

  const handleMoreInfo = (movie: BannerMovie) => {
    if (onMoreInfo) onMoreInfo(movie);
    else router.push(`/dashboard/movies/${movie.id}`);
  };

  const handlePlay = (movieId: string) => {
    const movie = movies.find((m) => m.id === movieId);
    if (!movie) return;
    if (onPlay) onPlay(movie);
    else router.push(`/dashboard/watch/${movieId}`);
  };

  return (
    <section style={{ position: "relative", width: "100%", minHeight: minH, overflow: "hidden", marginBottom: 36 }}>

      {/* Background slides */}
      {movies.map((s, i) => {
        const isActive  = i === current;
        const isAdjacent = Math.abs(i - current) <= 1 ||
          (current === 0 && i === movies.length - 1) ||
          (current === movies.length - 1 && i === 0);
        const kb = s.kenBurns ?? "zoom-in-right";

        // Only render slides that are active, adjacent, or have been seen before
        // This avoids mounting many Image components at once on first load
        const shouldRender = isActive || isAdjacent || revealed.has(i);

        return (
          <div key={i} aria-hidden={!isActive} style={{
            position: "absolute", inset: 0, zIndex: isActive ? 2 : 1,
            opacity: isActive ? 1 : 0,
            transition: "opacity 1s cubic-bezier(0.4,0,0.2,1)",
          }}>
            {shouldRender && (
              <div
                key={isActive ? `kb-${kenKey}` : `idle-${i}`}
                style={{
                  position: "absolute", inset: 0,
                  willChange: isActive ? "transform" : "auto",
                  animation: isActive
                    ? kb === "zoom-in-right" ? "djBannerKbRight 8s ease-in-out forwards"
                    : kb === "zoom-in-left"  ? "djBannerKbLeft 8s ease-in-out forwards"
                    : "djBannerKbOut 8s ease-in-out forwards"
                    : "none",
                }}
              >
                <Image
                  src={s.img}
                  alt={s.title}
                  fill
                  // Hero (first/active) loads with high priority; others lazy
                  priority={i === 0}
                  loading={i === 0 ? "eager" : "lazy"}
                  // fetchpriority drives the browser's resource scheduler
                  {...(i === 0 ? { fetchPriority: "high" } : { fetchPriority: isAdjacent ? "low" : "auto" })}
                  sizes="(max-width: 768px) 100vw, 100vw"
                  style={{
                    objectFit: "cover",
                    objectPosition: "center",
                    // Keeps layout stable while image streams in
                    backgroundColor: "rgba(0,0,0,0.3)",
                  }}
                  // Quality: hero gets full quality, others slightly compressed
                  quality={i === 0 ? 90 : 75}
                  draggable={false}
                  // Mark image as revealed once loaded so we keep it mounted
                  onLoad={() => setRevealed((prev) => new Set([...prev, i]))}
                />
              </div>
            )}
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(105deg, ${t.overlay} 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.15) 100%)` }} />
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${t.bgBase} 0%, rgba(0,0,0,0.7) 18%, transparent 50%)` }} />
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 22%)` }} />
          </div>
        );
      })}

      {/* Content */}
      <div style={{
        position: "relative", zIndex: 10,
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
        minHeight: minH,
        padding: isMobile
          ? "20px 16px 44px"
          : compact ? "24px 32px 48px" : "36px 44px 56px",
      }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 28, maxWidth: 760 }}>

          {/* Poster card — desktop only */}
          {!isMobile && (
            <div
              key={`poster-${current}`}
              className="banner-poster-card"
              style={{
                flexShrink: 0,
                width: compact ? 100 : 130,
                height: compact ? 148 : 192,
                borderRadius: 10, overflow: "hidden",
                boxShadow: `0 16px 48px rgba(0,0,0,0.7), 0 0 0 1px ${t.borderSubtle}`,
                animation: "djBannerFadeUp 0.65s cubic-bezier(0.22,1,0.36,1) both",
                position: "relative",
                // Placeholder background while poster loads
                backgroundColor: "rgba(255,255,255,0.05)",
              }}
            >
              <Image
                src={slide.img}
                alt={slide.title}
                fill
                sizes="130px"
                // Poster reuses the already-cached banner image — loads instantly
                priority={current === 0}
                loading={current === 0 ? "eager" : "lazy"}
                quality={80}
                style={{ objectFit: "cover" }}
                draggable={false}
              />
              {isLocked && (
                <div style={{
                  position: "absolute", inset: 0,
                  background: "rgba(0,0,0,0.45)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%",
                    background: t.accent,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `0 0 20px ${t.accentGlow}`,
                  }}>
                    <Lock size={14} color={t.textOnAccent} />
                  </div>
                </div>
              )}
              {slide.premium && isPaid && (
                <div style={{
                  position: "absolute", top: 7, right: 7,
                  width: 22, height: 22, borderRadius: "50%",
                  background: `rgba(16,185,129,0.9)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <CheckCircle2 size={12} color="#fff" />
                </div>
              )}
            </div>
          )}

          {/* Text + CTAs */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Tag + meta — desktop only */}
            {!isMobile && (
              <div key={`tag-${current}`} style={{
                display: "flex", alignItems: "center", gap: 10, marginBottom: 14,
                animation: "djBannerFadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both",
              }}>
                <span style={{
                  fontSize: 8.5, fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                  letterSpacing: "0.35em", textTransform: "uppercase", padding: "3px 9px",
                  color: t.accent, background: `${t.accent}1a`, border: `1px solid ${t.borderAccent}`,
                }}>{slide.tag}</span>

                {slide.premium && (
                  <span style={{
                    fontSize: 8, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase",
                    padding: "3px 8px", borderRadius: 4,
                    background: isPaid ? "rgba(16,185,129,0.12)" : `${t.accent}1a`,
                    color: isPaid ? t.success : t.accent,
                    border: isPaid ? `1px solid rgba(16,185,129,0.28)` : `1px solid ${t.borderAccent}`,
                    display: "flex", alignItems: "center", gap: 4,
                    transition: "all 0.3s ease",
                  }}>
                    {isPaid ? <CheckCircle2 size={8} /> : <Lock size={8} />}
                    {isPaid ? "Owned" : "KES 10"}
                  </span>
                )}

                <span style={{ width: 20, height: 1, background: t.borderMedium }} />
                <span style={{ fontSize: 9, color: t.textMuted, letterSpacing: "0.25em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>{slide.genre}</span>
                <span style={{ width: 3, height: 3, borderRadius: "50%", background: t.borderMedium }} />
                <span style={{ fontSize: 9, color: t.textMuted, letterSpacing: "0.15em", fontFamily: "'DM Sans', sans-serif" }}>{slide.year}</span>
              </div>
            )}

            {/* Title */}
            <h1 key={`title-${current}`} style={{
              fontSize: isMobile
                ? "clamp(1.7rem,7vw,2.4rem)"
                : compact ? "clamp(2rem,5vw,3.2rem)" : "clamp(2.4rem,6vw,4.8rem)",
              fontFamily: "var(--font-display)", color: t.textPrimary, letterSpacing: "0.02em",
              lineHeight: 0.92,
              marginBottom: isMobile ? 10 : 14,
              textShadow: "0 2px 30px rgba(0,0,0,0.5)",
              animation: "djBannerFadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.07s both",
            }}>{slide.title}</h1>

            {/* Rating — always shown, but simplified on mobile */}
            <div key={`rating-${current}`} style={{
              display: "flex", alignItems: "center", gap: 8,
              marginBottom: isMobile ? 16 : 12,
              animation: "djBannerFadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.12s both",
            }}>
              <div style={{ display: "flex", gap: 2 }}>
                {Array.from({ length: 5 }).map((_, i) => {
                  const filled = i < Math.round(parseFloat(slide.rating) / 2);
                  return <Star key={i} size={isMobile ? 11 : 10}
                    fill={filled ? t.accent : t.borderSubtle}
                    color={filled ? t.accent : t.borderSubtle} />;
                })}
              </div>
              <span style={{ fontSize: isMobile ? 13 : 12, fontWeight: 700, color: t.accent, fontFamily: "'DM Sans', sans-serif" }}>{slide.rating}</span>
              <span style={{ fontSize: 11, color: t.textMuted, fontFamily: "'DM Sans', sans-serif" }}>/ 10</span>
              {!isMobile && slide.duration && (
                <>
                  <span style={{ width: 3, height: 3, borderRadius: "50%", background: t.borderMedium }} />
                  <span style={{ fontSize: 11, color: t.textSecondary, fontFamily: "'DM Sans', sans-serif" }}>{slide.duration}</span>
                </>
              )}
              {isMobile && slide.premium && isPaid && (
                <span style={{
                  fontSize: 8, fontWeight: 700, letterSpacing: "0.18em",
                  padding: "2px 7px", borderRadius: 4,
                  background: "rgba(16,185,129,0.12)",
                  color: t.success,
                  border: `1px solid rgba(16,185,129,0.28)`,
                  display: "flex", alignItems: "center", gap: 3,
                }}>
                  <CheckCircle2 size={7} /> Owned
                </span>
              )}
              {isMobile && isLocked && (
                <span style={{
                  fontSize: 8, fontWeight: 700, letterSpacing: "0.18em",
                  padding: "2px 7px", borderRadius: 4,
                  background: `${t.accent}1a`,
                  color: t.accent,
                  border: `1px solid ${t.borderAccent}`,
                  display: "flex", alignItems: "center", gap: 3,
                }}>
                  <Lock size={7} /> KES 10
                </span>
              )}
            </div>

            {/* Description — desktop only */}
            {!isMobile && (
              <p key={`desc-${current}`} style={{
                fontSize: "clamp(0.8rem,1.2vw,0.9rem)",
                color: t.textSecondary, lineHeight: 1.65, maxWidth: 430, marginBottom: 24,
                fontFamily: "'DM Sans', sans-serif",
                animation: "djBannerFadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.18s both",
              }}>{slide.description}</p>
            )}

            {/* CTAs */}
            <div key={`cta-${current}`} style={{
              display: "flex", flexWrap: "wrap", alignItems: "center",
              gap: isMobile ? 8 : 10,
              animation: "djBannerFadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.25s both",
            }}>
              <PremiumPlayButton
                movieId={slide.id}
                movieTitle={slide.title}
                posterUrl={slide.img}
                isPremium={slide.premium ?? false}
                isPaid={isPaid}
                userId={userId}
                onPlay={handlePlay}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: isMobile ? "10px 20px" : "11px 26px",
                  background: t.accent, border: "none", cursor: "pointer",
                  color: t.textOnAccent,
                  fontSize: isMobile ? 11 : 10.5,
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                  letterSpacing: "0.2em", textTransform: "uppercase",
                  boxShadow: `0 0 30px ${t.accentGlow}`,
                  transition: "box-shadow 0.25s",
                  borderRadius: isMobile ? 8 : 0,
                }}
              >
                {isLocked ? <Lock size={13} /> : <Play size={13} fill={t.textOnAccent} />}
                {isLocked ? "Unlock — KES 10" : "Watch Now"}
              </PremiumPlayButton>

              <button
                onClick={() => handleMoreInfo(slide)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: isMobile ? "10px 16px" : "11px 20px",
                  background: t.navHoverBg,
                  border: `1px solid ${t.borderMedium}`,
                  cursor: "pointer", color: t.textSecondary,
                  fontSize: isMobile ? 11 : 10.5,
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                  letterSpacing: "0.2em", textTransform: "uppercase",
                  backdropFilter: "blur(8px)",
                  transition: "border-color 0.2s, color 0.2s, background 0.2s",
                  borderRadius: isMobile ? 8 : 0,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = t.bgElevated;
                  (e.currentTarget as HTMLElement).style.color = t.textPrimary;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = t.navHoverBg;
                  (e.currentTarget as HTMLElement).style.color = t.textSecondary;
                }}
              >
                <Info size={13} />
                {!isMobile && "More Info"}
              </button>

              <button
                onClick={() => setInLib((s) => {
                  const n = new Set(s);
                  n.has(slide.id) ? n.delete(slide.id) : n.add(slide.id);
                  return n;
                })}
                style={{
                  width: 40, height: 40,
                  background: inLib.has(slide.id) ? "rgba(37,211,102,0.1)" : t.navHoverBg,
                  border: `1px solid ${inLib.has(slide.id) ? "rgba(37,211,102,0.28)" : t.borderMedium}`,
                  borderRadius: isMobile ? 8 : 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "all 0.2s",
                }}
              >
                {inLib.has(slide.id) ? <Check size={15} color={t.success} /> : <Plus size={15} color={t.textSecondary} />}
              </button>
            </div>
          </div>
        </div>

        {/* Slide pips — desktop only */}
        {!isMobile && (
          <div style={{ position: "absolute", right: 24, top: "50%", transform: "translateY(-50%)", zIndex: 20, display: "flex", flexDirection: "column", gap: 8 }}>
            {movies.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} style={{
                width: 4, height: i === current ? 24 : 6,
                border: "none", cursor: "pointer",
                background: i === current ? t.accent : t.borderMedium,
                boxShadow: i === current ? `0 0 8px ${t.accent}` : "none",
                transition: "all 0.35s cubic-bezier(0.22,1,0.36,1)",
              }} />
            ))}
          </div>
        )}

        {/* Arrows — desktop only */}
        {!isMobile && (
          <>
            <button onClick={prev} style={{
              position: "absolute", left: 16, bottom: "36%", width: 38, height: 38,
              background: t.navHoverBg, border: `1px solid ${t.borderSubtle}`,
              backdropFilter: "blur(10px)", display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer", color: t.textSecondary,
              transition: "all 0.2s", zIndex: 20,
            }}>
              <ChevronLeft size={16} />
            </button>
            <button onClick={next} style={{
              position: "absolute", right: 46, bottom: "36%", width: 38, height: 38,
              background: t.navHoverBg, border: `1px solid ${t.borderSubtle}`,
              backdropFilter: "blur(10px)", display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer", color: t.textSecondary,
              transition: "all 0.2s", zIndex: 20,
            }}>
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {/* Slide counter — desktop only */}
        {!isMobile && (
          <div style={{ position: "absolute", bottom: 20, right: 16, zIndex: 20, display: "flex", alignItems: "baseline", gap: 3 }}>
            <span style={{ fontSize: 20, fontFamily: "var(--font-display)", color: t.textPrimary, letterSpacing: "0.08em", lineHeight: 1 }}>
              {String(current + 1).padStart(2, "0")}
            </span>
            <span style={{ fontSize: 11, color: t.textMuted, fontFamily: "'DM Sans', sans-serif" }}>/ {String(movies.length).padStart(2, "0")}</span>
          </div>
        )}

        {/* Pill ticker — always shown */}
        <div style={{
          position: "absolute", bottom: isMobile ? 10 : 16,
          left: "50%", transform: "translateX(-50%)",
          zIndex: 20, display: "flex", alignItems: "center", gap: 6,
        }}>
          {movies.map((_, i) => {
            const isActive = i === current;
            return (
              <button key={i} onClick={() => goTo(i)} style={{
                height: 3, width: isActive ? 48 : 16, borderRadius: 99,
                border: "none", cursor: "pointer", padding: 0,
                background: isActive ? "transparent" : t.borderMedium,
                position: "relative", overflow: "hidden",
                transition: "width 0.35s cubic-bezier(0.22,1,0.36,1)",
              }}>
                {isActive && (
                  <span key={`fill-${tickKey}`} style={{
                    position: "absolute", inset: 0, borderRadius: 99,
                    background: t.accent, transformOrigin: "left center",
                    animation: `djTickerFill ${autoInterval}ms linear forwards`,
                  }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes djBannerKbRight  { 0%{transform:scale(1.06) translateX(-1.5%)} 100%{transform:scale(1.15) translateX(0.5%)} }
        @keyframes djBannerKbLeft   { 0%{transform:scale(1.06) translateX(1.5%)}  100%{transform:scale(1.15) translateX(-0.5%)} }
        @keyframes djBannerKbOut    { 0%{transform:scale(1.15)} 100%{transform:scale(1.04)} }
        @keyframes djBannerFadeUp   { from{opacity:0;transform:translateY(18px);filter:blur(3px)} to{opacity:1;transform:translateY(0);filter:blur(0)} }
        @keyframes djTickerFill     { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        @media (max-width: 1024px) { .banner-poster-card { display: none !important; } }
      `}</style>
    </section>
  );
}