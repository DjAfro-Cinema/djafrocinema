"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  Settings, X, ChevronLeft, Star, Crown, Mic2, Heart,
  Share2, Download, Clock, Eye, Calendar, Check,
  Subtitles, Rewind, FastForward, Film, Lock,
} from "lucide-react";
import DashboardSidebar from "@/components/dashboard/sidebar/DashboardSidebar";
import MobileBottomNav from "@/components/dashboard/mobile/MobileBottomNav";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useMovie } from "@/hooks/useMovie";
import { movieService } from "@/services/movie.service";
import { databases } from "@/lib/appwrite";
import type { Movie } from "@/types/movie.types";
import { usePremiumGate } from "@/context/PremiumGateContext";
import { useTheme } from "@/context/ThemeContext";
import PremiumPlayButton from "@/components/payment/Premiumplaybutton";

// ── STAR RATING WIDGET ────────────────────────────────────────────────────────

function StarRating({
  movieId,
  currentRating,
  onRated,
}: {
  movieId: string;
  currentRating: number;
  onRated?: (newRating: number) => void;
}) {
  const { t } = useTheme();
  const [hover,      setHover]      = useState(0);
  const [selected,   setSelected]   = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`djafro_rating_${movieId}`);
    if (saved) setSelected(parseInt(saved));
  }, [movieId]);

  const handleRate = async (stars: number) => {
    if (submitting || submitted) return;
    setSelected(stars);
    setSubmitting(true);
    localStorage.setItem(`djafro_rating_${movieId}`, String(stars));
    try {
      const DB  = process.env.NEXT_PUBLIC_DATABASE_ID!;
      const COL = process.env.NEXT_PUBLIC_MOVIES_COLLECTION_ID!;
      const doc = await databases.getDocument(DB, COL, movieId);
      const newRating = Math.round(((doc.rating ?? 0) * 0.9 + stars * 0.1) * 10) / 10;
      await databases.updateDocument(DB, COL, movieId, { rating: newRating });
      movieService.invalidateCache();
      onRated?.(newRating);
      setSubmitted(true);
    } catch {
      // Non-critical
    } finally {
      setSubmitting(false);
    }
  };

  const display = hover || selected || 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <p style={{ fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase", color: t.textMuted, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, margin: 0 }}>
        {submitted ? "Thanks for rating!" : "Rate this movie"}
      </p>
      <div style={{ display: "flex", gap: 4 }}>
        {Array.from({ length: 5 }).map((_, i) => {
          const val    = i + 1;
          const filled = val <= display;
          return (
            <button
              key={i}
              onMouseEnter={() => !submitted && setHover(val)}
              onMouseLeave={() => !submitted && setHover(0)}
              onClick={() => handleRate(val)}
              disabled={submitted || submitting}
              style={{ width: 36, height: 36, background: filled ? t.navActiveBg : t.navHoverBg, border: `1px solid ${filled ? t.borderAccent : t.borderSubtle}`, borderRadius: 8, cursor: submitted ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s", transform: filled ? "scale(1.1)" : "scale(1)" }}
            >
              <Star size={16} fill={filled ? t.accent : "transparent"} color={filled ? t.accent : t.textMuted} />
            </button>
          );
        })}
      </div>
      {selected > 0 && (
        <p style={{ fontSize: 11, color: t.textMuted, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
          You rated: {selected}/5 stars
        </p>
      )}
    </div>
  );
}

// ── VIDEO PLAYER ──────────────────────────────────────────────────────────────

function VideoPlayer({ movie, onClose }: { movie: Movie; onClose: () => void }) {
  const { t } = useTheme();
  const [playing,      setPlaying]      = useState(false);
  const [muted,        setMuted]        = useState(false);
  const [volume,       setVolume]       = useState(0.8);
  const [progress,     setProgress]     = useState(0);
  const [elapsed,      setElapsed]      = useState(0);
  const [fullscreen,   setFullscreen]   = useState(false);
  const [showCtrl,     setShowCtrl]     = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [quality,      setQuality]      = useState("1080p");
  const [subtitles,    setSubtitles]    = useState(false);
  const [buffered,     setBuffered]     = useState(35);
  const hideTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSec = 7200;

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setElapsed(p => { const n = p + 1; setProgress((n / totalSec) * 100); return n; });
        setBuffered(p => Math.min(100, p + 0.05));
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, totalSec]);

  function resetHideTimer() {
    setShowCtrl(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => { if (playing) setShowCtrl(false); }, 3200);
  }

  function fmt(sec: number) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return h > 0 ? `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}` : `${m}:${String(s).padStart(2,"0")}`;
  }

  function seek(pct: number) { setProgress(pct); setElapsed(Math.floor((pct / 100) * totalSec)); }

  function toggleFullscreen() {
    if (!document.fullscreenElement) { containerRef.current?.requestFullscreen(); setFullscreen(true); }
    else { document.exitFullscreen(); setFullscreen(false); }
  }

  const skipSec = 10;

  if (movie.video_url) {
    return (
      <div ref={containerRef} style={{ position: "relative", width: "100%", background: "#000", aspectRatio: "16/9", overflow: "hidden", borderRadius: fullscreen ? 0 : 12 }}>
        <video src={movie.video_url} poster={movie.poster_url ?? undefined} controls autoPlay style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, width: 36, height: 36, background: `${t.bgElevated}99`, border: `1px solid ${t.borderSubtle}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: t.textSecondary, zIndex: 10 }}>
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={resetHideTimer}
      onClick={() => { if (!showSettings) { setPlaying(p => !p); resetHideTimer(); } }}
      style={{ position: "relative", width: "100%", background: "#000", aspectRatio: "16/9", overflow: "hidden", cursor: showCtrl ? "default" : "none", borderRadius: fullscreen ? 0 : 12 }}
    >
      <img src={movie.poster_url ?? ""} alt={movie.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: playing ? "brightness(0.55)" : "brightness(0.35)" }} />
      {!playing && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 72, height: 72, background: t.accent, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 50px ${t.accentGlow}` }}>
            <Play size={28} fill={t.textOnAccent} color={t.textOnAccent} />
          </div>
        </div>
      )}
      {subtitles && playing && (
        <div style={{ position: "absolute", bottom: 80, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.7)", padding: "6px 18px", borderRadius: 4, color: t.textPrimary, fontSize: 15, fontFamily: "'DM Sans', sans-serif", textAlign: "center", backdropFilter: "blur(4px)" }}>
          Maisha si mchezo… mwisho wake ni jana.
        </div>
      )}
      {showSettings && (
        <div onClick={e => e.stopPropagation()} style={{ position: "absolute", bottom: 72, right: 16, width: 220, background: t.bgElevated, border: `1px solid ${t.borderSubtle}`, borderRadius: 12, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.9)", zIndex: 10 }}>
          <div style={{ padding: "14px 16px 8px" }}>
            <p style={{ fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase", color: t.textMuted, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, margin: "0 0 8px" }}>Quality</p>
            {["4K Ultra", "1080p", "720p", "480p"].map(q => (
              <button key={q} onClick={() => setQuality(q)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", background: "transparent", border: "none", color: q === quality ? t.textPrimary : t.textSecondary, fontSize: 12, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", textAlign: "left" }}>
                {q}{q === quality && <Check size={12} color={t.accent} />}
              </button>
            ))}
          </div>
          <div style={{ height: 1, background: t.borderSubtle }} />
          <div style={{ padding: "8px 16px 14px" }}>
            <p style={{ fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase", color: t.textMuted, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, margin: "8px 0 8px" }}>Subtitles</p>
            {["Off", "English", "Swahili"].map(s => (
              <button key={s} onClick={() => setSubtitles(s !== "Off")} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", background: "transparent", border: "none", color: t.textSecondary, fontSize: 12, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", textAlign: "left" }}>
                {s}
                {(s === "Off" && !subtitles) || (s !== "Off" && subtitles && s === "English") ? <Check size={12} color={t.accent} /> : null}
              </button>
            ))}
          </div>
        </div>
      )}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 35%, transparent 65%, rgba(0,0,0,0.5) 100%)", opacity: showCtrl ? 1 : 0, transition: "opacity 0.3s", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "16px", pointerEvents: showCtrl ? "auto" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: t.textSecondary, fontFamily: "'DM Sans', sans-serif", margin: "0 0 2px" }}>{movie.genre[0]}</p>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", color: t.textPrimary, letterSpacing: "0.06em", margin: 0 }}>{movie.title}</h3>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ fontSize: 10, letterSpacing: "0.25em", color: t.accent, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, background: t.navActiveBg, border: `1px solid ${t.borderAccent}`, padding: "4px 10px", borderRadius: 4 }}>{quality}</span>
            <button onClick={e => { e.stopPropagation(); onClose(); }} style={{ width: 34, height: 34, background: t.navHoverBg, border: `1px solid ${t.borderSubtle}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: t.textSecondary }}>
              <X size={14} />
            </button>
          </div>
        </div>
        <div onClick={e => e.stopPropagation()}>
          <div style={{ marginBottom: 12 }}>
            <div
              style={{ position: "relative", height: 4, background: t.borderMedium, borderRadius: 2, cursor: "pointer" }}
              onClick={e => { const r = e.currentTarget.getBoundingClientRect(); seek(((e.clientX - r.left) / r.width) * 100); }}
            >
              <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${buffered}%`, background: t.borderMedium, borderRadius: 2 }} />
              <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${progress}%`, background: t.accent, borderRadius: 2 }}>
                <div style={{ position: "absolute", right: -6, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, background: t.accent, borderRadius: "50%", boxShadow: `0 0 10px ${t.accentGlow}` }} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontSize: 11, color: t.textSecondary, fontFamily: "'DM Sans', sans-serif" }}>{fmt(elapsed)}</span>
              <span style={{ fontSize: 11, color: t.textMuted, fontFamily: "'DM Sans', sans-serif" }}>{movie.duration ?? "—"}</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button onClick={() => seek(Math.max(0, progress - (skipSec / totalSec) * 100))} style={{ width: 36, height: 36, background: "transparent", border: "none", cursor: "pointer", color: t.textSecondary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Rewind size={16} />
              </button>
              <button onClick={() => { setPlaying(p => !p); resetHideTimer(); }} style={{ width: 44, height: 44, background: t.accent, border: "none", borderRadius: "50%", cursor: "pointer", color: t.textOnAccent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 20px ${t.accentGlow}` }}>
                {playing ? <Pause size={18} fill={t.textOnAccent} /> : <Play size={18} fill={t.textOnAccent} />}
              </button>
              <button onClick={() => seek(Math.min(100, progress + (skipSec / totalSec) * 100))} style={{ width: 36, height: 36, background: "transparent", border: "none", cursor: "pointer", color: t.textSecondary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FastForward size={16} />
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button onClick={() => setMuted(p => !p)} style={{ width: 32, height: 32, background: "transparent", border: "none", cursor: "pointer", color: t.textSecondary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>
                <input type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume} onChange={e => { setVolume(parseFloat(e.target.value)); setMuted(false); }} style={{ width: 70, accentColor: t.accent, cursor: "pointer" }} />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => setSubtitles(p => !p)} style={{ width: 34, height: 34, background: subtitles ? t.navActiveBg : "transparent", border: `1px solid ${subtitles ? t.borderAccent : t.borderSubtle}`, borderRadius: 8, cursor: "pointer", color: subtitles ? t.accent : t.textSecondary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Subtitles size={14} />
              </button>
              <button onClick={() => setShowSettings(p => !p)} style={{ width: 34, height: 34, background: showSettings ? t.navActiveBg : "transparent", border: `1px solid ${showSettings ? t.borderAccent : t.borderSubtle}`, borderRadius: 8, cursor: "pointer", color: showSettings ? t.accent : t.textSecondary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Settings size={14} />
              </button>
              <button onClick={toggleFullscreen} style={{ width: 34, height: 34, background: "transparent", border: `1px solid ${t.borderSubtle}`, borderRadius: 8, cursor: "pointer", color: t.textSecondary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {fullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── RELATED CARD ──────────────────────────────────────────────────────────────

function RelatedCard({ movie }: { movie: Movie }) {
  const router = useRouter();
  const { t } = useTheme();
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={() => router.push(`/dashboard/movies/${movie.$id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 12px", background: hovered ? t.navHoverBg : "transparent", border: "1px solid", borderColor: hovered ? t.borderAccent : t.borderSubtle, borderRadius: 10, transition: "all 0.18s", cursor: "pointer" }}
    >
      <div style={{ position: "relative", width: 72, height: 100, flexShrink: 0, borderRadius: 7, overflow: "hidden" }}>
        <img src={movie.poster_url ?? ""} alt={movie.title} style={{ width: "100%", height: "100%", objectFit: "cover", transform: hovered ? "scale(1.06)" : "scale(1)", transition: "transform 0.4s" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: hovered ? 1 : 0, transition: "opacity 0.2s", background: "rgba(0,0,0,0.4)" }}>
          {movie.premium_only ? <Lock size={18} color="#fff" /> : <Play size={18} fill="#fff" color="#fff" />}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", color: t.textPrimary, letterSpacing: "0.05em", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {movie.title}
        </h4>
        <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 9, color: t.accent, letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>{movie.genre[0]}</span>
          <span style={{ fontSize: 9, color: t.textMuted, fontFamily: "'DM Sans', sans-serif" }}>{movie.release_year}</span>
        </div>
        <span style={{ display: "flex", alignItems: "center", gap: 4, color: t.warning, fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
          <Star size={9} fill={t.warning} color={t.warning} /> {movie.rating.toFixed(1)}
        </span>
      </div>
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function MovieDetailPage() {
  const params  = useParams();
  const router  = useRouter();
  const layout  = useDashboardLayout();
  const { user } = useAuth();
  const { t } = useTheme();

  const movieId = params?.id as string;
  const { movie, loading, error, related, relatedLoading, trackView } = useMovie(movieId);

  const userName = user?.name || user?.email?.split("@")[0] || "Guest";
  const userObj  = { name: userName, email: user?.email ?? "" };

  const { isSmall, sidebarCollapsed, setSidebarCollapsed } = layout;
  const { requestPlay, paidMovieIds } = usePremiumGate();

  const [playerOpen, setPlayerOpen] = useState(false);
  const [liked,      setLiked]      = useState(false);
  const [activeTab,  setActiveTab]  = useState<"overview" | "cast" | "similar">("overview");
  const [liveRating, setLiveRating] = useState<number | null>(null);

  const isPaid   = movie ? paidMovieIds.includes(movie.$id) : false;
  const isLocked = movie ? !!movie.premium_only && !isPaid : false;

  useEffect(() => {
    if (playerOpen) trackView();
  }, [playerOpen, trackView]);

  const handlePlayRequest = useCallback(() => {
    if (!movie) return;
    requestPlay({
      movieId:    movie.$id,
      movieTitle: movie.title,
      posterUrl:  movie.poster_url ?? undefined,
      isPremium:  !!movie.premium_only,
      onUnlocked: (_movieId: string) => {
        setPlayerOpen(true);
      },
    });
  }, [movie, requestPlay]);

  const handleClosePlayer = useCallback(() => setPlayerOpen(false), []);

  if (!loading && !movie && !error) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100svh", background: t.bgBase, flexDirection: "column", gap: 16 }}>
        <Film size={48} color={t.textMuted} />
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", color: t.textMuted, letterSpacing: "0.1em" }}>Movie Not Found</h2>
        <Link href="/dashboard/movies" style={{ color: t.accent, fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>← Back to Movies</Link>
      </div>
    );
  }

  const displayRating = liveRating ?? movie?.rating ?? 0;

  return (
    <>
      <div style={{ display: "flex", height: "100svh", background: t.bgBase, overflow: "hidden" }}>
        {!isSmall && (
          <DashboardSidebar user={userObj} collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
        )}

        <div id="movie-detail-col" style={{ flex: 1, minWidth: 0, height: "100svh", overflowY: "auto", overflowX: "hidden" }}>
          {loading ? (
            <div>
              <div style={{ position: "relative", aspectRatio: "16/9", background: t.bgSurface, overflow: "hidden" }}>
                <div className="dj-shimmer" />
              </div>
              <div style={{ padding: "32px clamp(16px,4vw,48px)" }}>
                {[200, 140, 280, 100].map((w, i) => (
                  <div key={i} style={{ height: i === 0 ? 36 : 16, width: w, background: t.bgElevated, borderRadius: 4, marginBottom: 14, position: "relative", overflow: "hidden" }}>
                    <div className="dj-shimmer" />
                  </div>
                ))}
              </div>
            </div>
          ) : movie ? (
            <>
              {/* ── HERO / PLAYER AREA ── */}
              <div style={{ position: "relative", width: "100%", background: "#000" }}>
                {playerOpen ? (
                  <VideoPlayer movie={movie} onClose={handleClosePlayer} />
                ) : (
                  <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", overflow: "hidden" }}>
                    <img src={movie.poster_url ?? ""} alt={movie.title} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.35) saturate(1.1)" }} />
                    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(0deg, ${t.bgBase} 0%, rgba(0,0,0,0.2) 60%, transparent 100%)` }} />
                    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, ${t.overlay} 0%, transparent 60%)` }} />

                    <button onClick={() => router.back()} style={{ position: "absolute", top: 20, left: 20, display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "rgba(0,0,0,0.5)", border: `1px solid ${t.borderSubtle}`, borderRadius: 8, color: t.textSecondary, fontSize: 12, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", backdropFilter: "blur(8px)" }}>
                      <ChevronLeft size={14} /> Back
                    </button>

                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
                      <PremiumPlayButton
                        movieId={movie.$id}
                        movieTitle={movie.title}
                        posterUrl={movie.poster_url ?? undefined}
                        isPremium={!!movie.premium_only}
                        isPaid={isPaid}
                        userId=""
                        onPlay={handlePlayRequest}
                        style={{ width: 80, height: 80, background: isLocked ? `${t.accent}bf` : t.accent, border: "none", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: `0 0 60px ${t.accentGlow}` }}
                      >
                        {isLocked ? <Lock size={32} color={t.textOnAccent} /> : <Play size={32} fill={t.textOnAccent} color={t.textOnAccent} />}
                      </PremiumPlayButton>
                    </div>

                    {isLocked && (
                      <div style={{ position: "absolute", top: "calc(50% + 52px)", left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
                        <span style={{ fontSize: 11, color: t.textSecondary, fontFamily: "'DM Sans', sans-serif", background: "rgba(0,0,0,0.5)", padding: "4px 12px", borderRadius: 20, backdropFilter: "blur(4px)" }}>
                          Unlock for KES 10
                        </span>
                      </div>
                    )}

                    <div style={{ position: "absolute", bottom: 20, right: 20, display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", borderRadius: 6, border: `1px solid ${t.borderSubtle}` }}>
                      <Clock size={11} color={t.textMuted} />
                      <span style={{ fontSize: 11, color: t.textSecondary, fontFamily: "'DM Sans', sans-serif" }}>{movie.duration ?? "—"}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* ── CONTENT GRID ── */}
              <div style={{ display: "grid", gridTemplateColumns: isSmall ? "1fr" : "1fr 320px", gap: "clamp(20px,3vw,40px)", padding: "clamp(20px,4vw,40px) clamp(16px,4vw,48px) 80px", maxWidth: 1280 }}>

                {/* LEFT COLUMN */}
                <div>
                  {/* Badges */}
                  <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                    {movie.premium_only && !isPaid && (
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, letterSpacing: "0.35em", padding: "4px 10px", background: t.navActiveBg, border: `1px solid ${t.borderAccent}`, borderRadius: 4, color: t.accent, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
                        <Lock size={9} /> PREMIUM — KES 10
                      </span>
                    )}
                    {movie.premium_only && isPaid && (
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, letterSpacing: "0.35em", padding: "4px 10px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 4, color: t.success, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
                        ✓ OWNED
                      </span>
                    )}
                    {movie.genre.map(g => (
                      <span key={g} style={{ fontSize: 9, letterSpacing: "0.35em", padding: "4px 10px", background: t.navActiveBg, border: `1px solid ${t.borderAccent}`, borderRadius: 4, color: t.accent, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase" }}>
                        {g}
                      </span>
                    ))}
                  </div>

                  {/* Title */}
                  <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem,5vw,3.8rem)", color: t.textPrimary, letterSpacing: "0.04em", lineHeight: 1, margin: "0 0 16px" }}>
                    {movie.title}
                  </h1>

                  {/* Meta row */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", marginBottom: 24 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, color: t.warning, fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>
                      <Star size={14} fill={t.warning} color={t.warning} /> {displayRating.toFixed(1)} / 10
                    </span>
                    <div style={{ width: 1, height: 16, background: t.borderMedium }} />
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: t.textSecondary, fontFamily: "'DM Sans', sans-serif" }}>
                      <Calendar size={13} /> {movie.release_year ?? "—"}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: t.textSecondary, fontFamily: "'DM Sans', sans-serif" }}>
                      <Clock size={13} /> {movie.duration ?? "—"}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: t.textSecondary, fontFamily: "'DM Sans', sans-serif" }}>
                      <Eye size={13} /> {movie.view_count.toLocaleString()} views
                    </span>
                  </div>

                  {/* CTA buttons */}
                  <div style={{ display: "flex", gap: 10, marginBottom: 36, flexWrap: "wrap" }}>
                    <PremiumPlayButton
                      movieId={movie.$id}
                      movieTitle={movie.title}
                      posterUrl={movie.poster_url ?? undefined}
                      isPremium={!!movie.premium_only}
                      isPaid={isPaid}
                      userId=""
                      onPlay={handlePlayRequest}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 30px", background: t.accent, border: "none", borderRadius: 8, color: t.textOnAccent, fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", cursor: "pointer", boxShadow: `0 4px 20px ${t.accentGlow}` }}
                    >
                      {isLocked ? <Lock size={16} /> : <Play size={16} fill={t.textOnAccent} />}
                      {isLocked ? "Unlock — KES 10" : "Watch Now"}
                    </PremiumPlayButton>

                    <button onClick={() => setLiked(p => !p)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "13px 20px", background: liked ? t.navActiveBg : t.navHoverBg, border: `1px solid ${liked ? t.borderAccent : t.borderSubtle}`, borderRadius: 8, color: liked ? t.accent : t.textSecondary, fontSize: 13, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.2s" }}>
                      <Heart size={15} fill={liked ? t.accent : "transparent"} color={liked ? t.accent : t.textSecondary} /> {liked ? "Liked" : "Like"}
                    </button>
                    <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "13px 20px", background: t.navHoverBg, border: `1px solid ${t.borderSubtle}`, borderRadius: 8, color: t.textSecondary, fontSize: 13, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
                      <Share2 size={15} /> Share
                    </button>
                    {movie.download_enabled && !movie.premium_only && (
                      <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "13px 20px", background: t.navHoverBg, border: `1px solid ${t.borderSubtle}`, borderRadius: 8, color: t.textSecondary, fontSize: 13, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
                        <Download size={15} /> Download
                      </button>
                    )}
                  </div>

                  {/* Tabs */}
                  <div style={{ borderBottom: `1px solid ${t.borderSubtle}`, marginBottom: 24, display: "flex", gap: 0 }}>
                    {(["overview", "cast", "similar"] as const).map(tab => (
                      <button key={tab} onClick={() => setActiveTab(tab)} style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", fontWeight: 600, padding: "12px 20px", background: "transparent", border: "none", borderBottom: activeTab === tab ? `2px solid ${t.accent}` : "2px solid transparent", color: activeTab === tab ? t.textPrimary : t.textMuted, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.18s", marginBottom: -1 }}>
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* Tab: Overview */}
                  {activeTab === "overview" && (
                    <div>
                      <p style={{ fontSize: 14, color: t.textSecondary, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.8, margin: "0 0 28px" }}>
                        {movie.description ?? movie.ai_summary ?? "No description available."}
                      </p>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16, marginBottom: 28 }}>
                        {[
                          { label: "Year",      value: movie.release_year ?? "—" },
                          { label: "Duration",  value: movie.duration ?? "—" },
                          { label: "Views",     value: movie.view_count.toLocaleString() },
                          { label: "Rating",    value: `${displayRating.toFixed(1)} / 10` },
                          { label: "Downloads", value: movie.download_count.toLocaleString() },
                          { label: "Genre",     value: movie.genre.join(", ") },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <p style={{ fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase", color: t.textMuted, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, margin: "0 0 5px" }}>{label}</p>
                            <p style={{ fontSize: 13, color: t.textSecondary, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>{value}</p>
                          </div>
                        ))}
                      </div>
                      {movie.tags.length > 0 && (
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
                          {movie.tags.map(tag => (
                            <span key={tag} style={{ fontSize: 10, padding: "5px 14px", background: t.navHoverBg, border: `1px solid ${t.borderSubtle}`, borderRadius: 4, color: t.textMuted, fontFamily: "'DM Sans', sans-serif" }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div style={{ padding: "24px 20px", background: t.navHoverBg, border: `1px solid ${t.borderSubtle}`, borderRadius: 12 }}>
                        <StarRating movieId={movie.$id} currentRating={displayRating} onRated={r => setLiveRating(r)} />
                      </div>
                    </div>
                  )}

                  {/* Tab: Cast */}
                  {activeTab === "cast" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {movie.tags.length > 0 ? movie.tags.map((tag, i) => (
                        <div key={tag} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", background: t.navHoverBg, border: `1px solid ${t.borderSubtle}`, borderRadius: 10 }}>
                          <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(145deg, ${t.accent}, ${t.accentDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: t.textOnAccent, fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>
                            {tag[0].toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontSize: 13, color: t.textPrimary, fontFamily: "'DM Sans', sans-serif", margin: "0 0 2px", fontWeight: 600 }}>{tag}</p>
                            <p style={{ fontSize: 10, color: t.textMuted, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
                              {i === 0 ? "Lead Role" : "Supporting Role"}
                            </p>
                          </div>
                        </div>
                      )) : (
                        <p style={{ color: t.textMuted, fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>No cast information available.</p>
                      )}
                    </div>
                  )}

                  {/* Tab: Similar */}
                  {activeTab === "similar" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {relatedLoading ? (
                        <p style={{ color: t.textMuted, fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>Loading…</p>
                      ) : related.length > 0 ? (
                        related.map(m => <RelatedCard key={m.$id} movie={m} />)
                      ) : (
                        <p style={{ color: t.textMuted, fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>No similar movies found.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN */}
                {!isSmall && (
                  <div>
                    <div style={{ position: "sticky", top: 80 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                        <div style={{ width: 3, height: 16, background: t.accent, boxShadow: `0 0 8px ${t.accentGlow}` }} />
                        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: t.textPrimary, letterSpacing: "0.08em", margin: 0 }}>Up Next</h3>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {relatedLoading ? (
                          Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} style={{ height: 80, background: t.bgSurface, borderRadius: 10, position: "relative", overflow: "hidden" }}>
                              <div className="dj-shimmer" />
                            </div>
                          ))
                        ) : (
                          related.slice(0, 6).map(m => <RelatedCard key={m.$id} movie={m} />)
                        )}
                      </div>

                      <div style={{ marginTop: 24, padding: "20px 18px", background: t.navHoverBg, border: `1px solid ${t.borderSubtle}`, borderRadius: 12 }}>
                        <StarRating movieId={movie.$id} currentRating={displayRating} onRated={r => setLiveRating(r)} />
                      </div>

                      {/* Premium upsell */}
                      {movie.premium_only && !isPaid && (
                        <div style={{ marginTop: 16, padding: "20px 18px", background: `linear-gradient(135deg, ${t.navActiveBg}, rgba(0,0,0,0.1))`, border: `1px solid ${t.borderAccent}`, borderRadius: 12 }}>
                          <Crown size={20} color={t.warning} style={{ marginBottom: 8 }} />
                          <h4 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", color: t.textPrimary, letterSpacing: "0.07em", margin: "0 0 6px" }}>Unlock This Film</h4>
                          <p style={{ fontSize: 11, color: t.textSecondary, fontFamily: "'DM Sans', sans-serif", margin: "0 0 14px", lineHeight: 1.5 }}>
                            One-time payment of KES 10. Yours forever — no expiry, no subscription.
                          </p>
                          <PremiumPlayButton
                            movieId={movie.$id}
                            movieTitle={movie.title}
                            posterUrl={movie.poster_url ?? undefined}
                            isPremium
                            isPaid={false}
                            userId=""
                            onPlay={handlePlayRequest}
                            style={{ width: "100%", padding: "10px", background: t.accent, border: "none", borderRadius: 7, color: t.textOnAccent, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                          >
                            <Lock size={12} /> Pay KES 10 &amp; Watch
                          </PremiumPlayButton>
                        </div>
                      )}

                      {/* Non-premium upsell */}
                      {!movie.premium_only && (
                        <div style={{ marginTop: 16, padding: "20px 18px", background: `linear-gradient(135deg, ${t.navActiveBg}, rgba(0,0,0,0.1))`, border: `1px solid ${t.borderAccent}`, borderRadius: 12 }}>
                          <Crown size={20} color={t.warning} style={{ marginBottom: 8 }} />
                          <h4 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", color: t.textPrimary, letterSpacing: "0.07em", margin: "0 0 6px" }}>Go Premium</h4>
                          <p style={{ fontSize: 11, color: t.textSecondary, fontFamily: "'DM Sans', sans-serif", margin: "0 0 14px", lineHeight: 1.5 }}>
                            Unlock all dubbed films, HD streaming, and download access.
                          </p>
                          <button style={{ width: "100%", padding: "10px", background: t.accent, border: "none", borderRadius: 7, color: t.textOnAccent, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
                            Browse Premium Films
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>

      {isSmall && <MobileBottomNav />}

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html, body { background: var(--dj-bg-base); color: var(--dj-text-primary); margin: 0; padding: 0; overflow: hidden; }
        #movie-detail-col::-webkit-scrollbar { display: none; }
        #movie-detail-col { scrollbar-width: none; }
        @keyframes djShimmer {
          0%   { background-position: -700px 0; }
          100% { background-position:  700px 0; }
        }
        .dj-shimmer {
          position: absolute; inset: 0;
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0) 100%);
          background-size: 700px 100%;
          animation: djShimmer 1.6s ease-in-out infinite;
        }
        input[type="range"] { -webkit-appearance: none; height: 3px; border-radius: 2px; background: var(--dj-border-medium); }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; background: var(--dj-accent); cursor: pointer; }
      `}</style>
    </>
  );
}