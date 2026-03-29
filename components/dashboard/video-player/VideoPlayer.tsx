"use client";

/**
 * VideoPlayer.tsx — DjAfro Cinema
 *
 * Supported sources (auto-detected):
 *  - HLS (.m3u8)           → hls.js with tuned buffer config
 *  - MP4 / WebM            → native HTML5
 *  - YouTube               → youtube-nocookie iframe embed
 *  - Dailymotion (any URL) → official embed iframe
 *  - Bunny Stream iframe   → iframe.mediadelivery.net passthrough
 *  - Cloudflare Stream     → player.cloudflare.com passthrough
 *  - Safari native HLS     → bypasses hls.js automatically
 *
 * Features:
 *  ✓ Back button (← chevron top-left) — goes back to movie selection
 *  ✓ Loading spinner with blurred poster background
 *  ✓ Toast notifications (error / warn / info) — auto-dismiss 6s
 *  ✓ "Movie unavailable" friendly error screen with retry
 *  ✓ Keyboard shortcuts: Space/K play, ←→ seek ±10s, ↑↓ volume, M mute, F fullscreen, Esc back
 *  ✓ Fullscreen + Picture-in-Picture
 *  ✓ Playback speed menu
 *  ✓ Volume slider (hover to reveal)
 *  ✓ Progress bar: buffered track + hover time tooltip
 *  ✓ Auto-hide controls after 3.5s
 *  ✓ Clean hls.js destroy on unmount — no memory leaks
 *  ✓ All fonts via CSS variables (--font-display, --font-body)
 *
 * Install: npm install hls.js
 *
 * Usage:
 *  <VideoPlayer
 *    src="https://example.com/video.m3u8"   // or YouTube/Dailymotion URL
 *    title="The Dark Knight"
 *    subtitle="Action · 2008"
 *    poster="/posters/dark-knight.jpg"
 *    onBack={() => router.back()}           // ← back to movie selection
 *    onClose={() => setOpen(false)}         // X closes player
 *  />
 */

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play, Pause, Volume2, VolumeX,
  Maximize, Minimize, SkipBack, SkipForward,
  X, Settings, Rewind, FastForward,
  PictureInPicture2, AlertCircle, Wifi, RefreshCw, ChevronLeft,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface VideoPlayerProps {
  src: string;
  title?: string;
  subtitle?: string;
  poster?: string;
  /** Closes the player entirely (X button) */
  onClose?: () => void;
  /** Goes back to movie selection (← button). Falls back to onClose if not set. */
  onBack?: () => void;
  autoPlay?: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

type SourceType = "hls" | "mp4" | "youtube" | "dailymotion" | "iframe";
type ToastKind  = "error" | "warn" | "info";
interface Toast  { id: string; kind: ToastKind; message: string; }

// ─── Source detection ────────────────────────────────────────────────────────

function detectSource(src: string): SourceType {
  if (!src) return "mp4";
  const u = src.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be") || u.includes("youtube-nocookie.com")) return "youtube";
  if (u.includes("dailymotion.com") || u.includes("dai.ly")) return "dailymotion";
  if (u.includes("iframe.mediadelivery.net") || u.includes("player.cloudflare.com") || u.includes("embed.cloudflarestream.com")) return "iframe";
  if (u.includes(".m3u8") || u.includes("manifest") || u.includes("playlist")) return "hls";
  return "mp4";
}

/** Convert any YouTube URL → youtube-nocookie embed */
function toYouTubeEmbed(src: string): string {
  if (src.includes("youtube-nocookie.com/embed/")) return src;
  if (src.includes("youtube.com/embed/")) return src.replace("youtube.com/embed/", "youtube-nocookie.com/embed/");
  const short = src.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (short) return `https://www.youtube-nocookie.com/embed/${short[1]}?autoplay=1&rel=0`;
  const watch = src.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watch) return `https://www.youtube-nocookie.com/embed/${watch[1]}?autoplay=1&rel=0`;
  return src;
}

/** Convert any Dailymotion URL → official embed URL */
function toDailymotionEmbed(src: string): string {
  if (src.includes("/embed/")) return src;
  const short = src.match(/dai\.ly\/([a-zA-Z0-9]+)/);
  if (short) return `https://www.dailymotion.com/embed/video/${short[1]}?autoplay=1`;
  const id = src.match(/dailymotion\.com\/(?:video\/)?([a-zA-Z0-9]+)/);
  if (id) return `https://www.dailymotion.com/embed/video/${id[1]}?autoplay=1`;
  return src;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

// ─── Toast ───────────────────────────────────────────────────────────────────

function ToastBar({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const col = { error: "#e50914", warn: "#f5a623", info: "#25d366" }[toast.kind];
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 10,
      padding: "12px 16px",
      background: "rgba(14,14,16,0.97)",
      border: `1px solid ${col}33`, borderLeft: `3px solid ${col}`,
      borderRadius: 8, boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
      maxWidth: 340,
      animation: "slideInToast 0.3s cubic-bezier(0.22,1,0.36,1)",
    }}>
      <AlertCircle size={15} color={col} style={{ flexShrink: 0, marginTop: 2 }} />
      <p style={{ margin: 0, flex: 1, fontSize: 12.5, fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>
        {toast.message}
      </p>
      <button onClick={() => onDismiss(toast.id)}
        style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: 0, display: "flex" }}>
        <X size={13} />
      </button>
    </div>
  );
}

// ─── Loading overlay ──────────────────────────────────────────────────────────

function LoadingOverlay({ title, poster }: { title?: string; poster?: string }) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      {poster && (
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${poster})`, backgroundSize: "cover", backgroundPosition: "center",
          filter: "blur(14px) brightness(0.22)", transform: "scale(1.1)",
        }} />
      )}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <div style={{
          width: 56, height: 56,
          border: "3px solid rgba(255,255,255,0.07)", borderTop: "3px solid #e50914",
          borderRadius: "50%", margin: "0 auto 16px",
          animation: "spinLoader 0.75s linear infinite",
        }} />
        <p style={{ fontSize: 13, fontFamily: "var(--font-body)", color: "rgba(255,255,255,0.4)", margin: 0, letterSpacing: "0.04em" }}>
          Loading{title ? ` "${title}"` : ""}…
        </p>
      </div>
    </div>
  );
}

// ─── Error screen ─────────────────────────────────────────────────────────────

function UnavailableScreen({ title, onClose, onBack, onRetry }: {
  title?: string; onClose?: () => void; onBack?: () => void; onRetry?: () => void;
}) {
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 20,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      background: "radial-gradient(ellipse at center, #180808 0%, #080808 100%)",
      padding: 32, textAlign: "center",
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: "50%",
        background: "rgba(229,9,20,0.08)", border: "1px solid rgba(229,9,20,0.16)",
        display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22,
      }}>
        <Wifi size={30} color="rgba(229,9,20,0.6)" />
      </div>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1rem, 3vw, 1.4rem)", color: "#fff", margin: "0 0 10px", letterSpacing: "0.05em" }}>
        {title ? `"${title}"` : "This movie"} isn't available right now
      </h2>
      <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(255,255,255,0.38)", margin: "0 0 28px", maxWidth: 320, lineHeight: 1.8 }}>
        We're having trouble loading this stream. It will be fixed soon —
        try another movie in the meantime and come back later.
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        {onRetry && (
          <button onClick={onRetry} style={outlineBtn}>
            <RefreshCw size={13} /> Retry
          </button>
        )}
        <button onClick={onBack ?? onClose} style={outlineBtn}>
          <ChevronLeft size={14} /> Choose Another Movie
        </button>
      </div>
    </div>
  );
}

// ─── Iframe player (YouTube / Dailymotion / Bunny / Cloudflare) ──────────────

function IframePlayer({ embedSrc, title, poster, onClose, onBack, toasts, dismissToast }: {
  embedSrc: string; title?: string; poster?: string;
  onClose?: () => void; onBack?: () => void;
  toasts: Toast[]; dismissToast: (id: string) => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const goBack = onBack ?? onClose;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#000" }}>
      {!loaded && <LoadingOverlay title={title} poster={poster} />}

      <iframe
        src={embedSrc}
        style={{ width: "100%", height: "100%", border: "none", display: "block" }}
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowFullScreen
        title={title}
        onLoad={() => setLoaded(true)}
      />

      {/* Top gradient bar — back + title + close */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.78) 0%, transparent 100%)",
        padding: "14px 16px",
        display: "flex", alignItems: "center", gap: 10,
        pointerEvents: "none",
      }}>
        <button onClick={goBack} style={{ ...circleBtn, pointerEvents: "auto" }} title="Back">
          <ChevronLeft size={19} color="rgba(255,255,255,0.85)" />
        </button>

        {title && (
          <span style={{
            flex: 1, minWidth: 0,
            fontFamily: "var(--font-display)", fontSize: "clamp(0.85rem, 2vw, 1.1rem)",
            color: "#fff", letterSpacing: "0.05em",
            textShadow: "0 2px 10px rgba(0,0,0,0.9)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {title}
          </span>
        )}

        <button onClick={onClose} style={{ ...circleBtn, pointerEvents: "auto" }} title="Close">
          <X size={16} color="rgba(255,255,255,0.8)" />
        </button>
      </div>

      {/* Toasts */}
      <div style={{ position: "absolute", bottom: 24, right: 16, zIndex: 30, display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none" }}>
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: "auto" }}>
            <ToastBar toast={t} onDismiss={dismissToast} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main VideoPlayer ─────────────────────────────────────────────────────────

export default function VideoPlayer({
  src,
  title = "",
  subtitle,
  poster,
  onClose,
  onBack,
  autoPlay = true,
  onNext,
  onPrev,
  hasNext = false,
  hasPrev = false,
}: VideoPlayerProps) {
  const videoRef     = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef  = useRef<HTMLDivElement>(null);
  const hlsRef       = useRef<{ destroy: () => void; startLoad: () => void; recoverMediaError: () => void } | null>(null);
  const hideTimer    = useRef<ReturnType<typeof setTimeout>>(undefined);
  const toastIdx     = useRef(0);
  const retryCount   = useRef(0);
  const MAX_RETRIES  = 3;

  const [playing, setPlaying]           = useState(false);
  const [currentTime, setCurrentTime]   = useState(0);
  const [duration, setDuration]         = useState(0);
  const [volume, setVolume]             = useState(1);
  const [muted, setMuted]               = useState(false);
  const [fullscreen, setFullscreen]     = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered]         = useState(0);
  const [loading, setLoading]           = useState(true);
  const [fatalError, setFatalError]     = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showVolume, setShowVolume]     = useState(false);
  const [toasts, setToasts]             = useState<Toast[]>([]);
  const [seekHoverPct, setSeekHoverPct] = useState<number | null>(null);

  const sourceType = detectSource(src);
  const goBack     = onBack ?? onClose;

  // ── Toasts ──────────────────────────────────────────────────────────────

  const addToast = useCallback((kind: ToastKind, message: string) => {
    const id = String(++toastIdx.current);
    setToasts(t => [...t.slice(-3), { id, kind, message }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 6000);
  }, []);

  const dismissToast = useCallback((id: string) => setToasts(t => t.filter(x => x.id !== id)), []);

  // ── Auto-hide controls ───────────────────────────────────────────────────

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 3500);
  }, []);

  useEffect(() => {
    if (!playing) setShowControls(true);
    else resetHideTimer();
    return () => clearTimeout(hideTimer.current);
  }, [playing, resetHideTimer]);

  // ── HLS init ────────────────────────────────────────────────────────────

  const initHls = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }

    try {
      const Hls = (await import("hls.js")).default;

      if (!Hls.isSupported()) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src; video.load(); return;
        }
        setFatalError(true);
        addToast("error", "Your browser doesn't support HLS streaming.");
        return;
      }

      const hls = new Hls({
        maxBufferLength: 30, maxMaxBufferLength: 60, backBufferLength: 30,
        maxBufferHole: 0.5, lowLatencyMode: false, enableWorker: true,
        startLevel: -1, abrEwmaFastVoD: 3, abrEwmaSlowVoD: 9,
        manifestLoadingMaxRetry: 6, manifestLoadingRetryDelay: 1000,
        levelLoadingMaxRetry: 6,   levelLoadingRetryDelay: 1000,
        fragLoadingMaxRetry: 6,    fragLoadingRetryDelay: 1000,
        nudgeMaxRetry: 5, nudgeOffset: 0.1, highBufferWatchdogPeriod: 3,
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
        retryCount.current = 0;
        if (autoPlay) video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_e: unknown, data: { fatal?: boolean; type?: string; details?: string }) => {
        if (!data.fatal) return;
        if (data.type === "networkError") {
          if (retryCount.current < MAX_RETRIES) {
            retryCount.current++;
            addToast("warn", `Connection issue — retrying… (${retryCount.current}/${MAX_RETRIES})`);
            hls.startLoad();
          } else { setFatalError(true); addToast("error", "Stream unavailable. Please try another movie."); }
        } else if (data.type === "mediaError") {
          if (retryCount.current < MAX_RETRIES) {
            retryCount.current++;
            addToast("warn", "Playback error — recovering…");
            hls.recoverMediaError();
          } else { setFatalError(true); addToast("error", "Playback failed. This stream may be broken."); }
        } else {
          setFatalError(true); addToast("error", `Fatal error: ${data.details ?? "unknown"}`);
        }
      });

      hlsRef.current = hls;
    } catch {
      setFatalError(true); addToast("error", "Could not load the video player.");
    }
  }, [src, autoPlay, addToast]);

  // ── MP4 init ────────────────────────────────────────────────────────────

  const initMp4 = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.src = src;
    video.load();
    if (autoPlay) video.play().catch(() => {});
  }, [src, autoPlay]);

  // ── Mount / src change ───────────────────────────────────────────────────

  useEffect(() => {
    if (sourceType === "youtube" || sourceType === "dailymotion" || sourceType === "iframe") return;
    setLoading(true); setFatalError(false); retryCount.current = 0;
    if (sourceType === "hls") initHls(); else initMp4();
    return () => {
      hlsRef.current?.destroy(); hlsRef.current = null;
      const v = videoRef.current;
      if (v) { v.pause(); v.removeAttribute("src"); v.load(); }
    };
  }, [src, sourceType, initHls, initMp4]);

  // ── Video events ────────────────────────────────────────────────────────

  useEffect(() => {
    const v = videoRef.current; if (!v) return;
    const onTimeUpdate = () => setCurrentTime(v.currentTime);
    const onDuration   = () => setDuration(v.duration);
    const onPlay       = () => setPlaying(true);
    const onPause      = () => setPlaying(false);
    const onWaiting    = () => setLoading(true);
    const onCanPlay    = () => setLoading(false);
    const onProgress   = () => { if (v.buffered.length) setBuffered(v.buffered.end(v.buffered.length - 1)); };
    const onError      = () => { setFatalError(true); addToast("error", "Could not load this video."); };
    const onStalled    = () => addToast("warn", "Stream stalled — buffering…");
    v.addEventListener("timeupdate", onTimeUpdate); v.addEventListener("durationchange", onDuration);
    v.addEventListener("play", onPlay);             v.addEventListener("pause", onPause);
    v.addEventListener("waiting", onWaiting);       v.addEventListener("canplay", onCanPlay);
    v.addEventListener("progress", onProgress);     v.addEventListener("error", onError);
    v.addEventListener("stalled", onStalled);
    return () => {
      v.removeEventListener("timeupdate", onTimeUpdate); v.removeEventListener("durationchange", onDuration);
      v.removeEventListener("play", onPlay);             v.removeEventListener("pause", onPause);
      v.removeEventListener("waiting", onWaiting);       v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("progress", onProgress);     v.removeEventListener("error", onError);
      v.removeEventListener("stalled", onStalled);
    };
  }, [addToast]);

  // ── Fullscreen ───────────────────────────────────────────────────────────

  useEffect(() => {
    const h = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  // ── Keyboard ────────────────────────────────────────────────────────────

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case " ": case "k": e.preventDefault(); togglePlay(); break;
        case "ArrowLeft":   e.preventDefault(); skip(-10); break;
        case "ArrowRight":  e.preventDefault(); skip(10);  break;
        case "ArrowUp":     e.preventDefault(); adjustVol(0.1);  break;
        case "ArrowDown":   e.preventDefault(); adjustVol(-0.1); break;
        case "m": toggleMute(); break;
        case "f": toggleFS();   break;
        case "Escape": if (!document.fullscreenElement) goBack?.(); break;
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  // ── Controls ─────────────────────────────────────────────────────────────

  const togglePlay = () => { const v = videoRef.current; if (!v) return; playing ? v.pause() : v.play().catch(() => {}); };
  const skip = (s: number) => { if (!videoRef.current) return; videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + s)); };
  const adjustVol = (d: number) => {
    const v = Math.max(0, Math.min(1, volume + d));
    setVolume(v);
    if (videoRef.current) videoRef.current.volume = v;
    if (v > 0) setMuted(false);
  };
  const toggleMute = () => { if (!videoRef.current) return; setMuted(m => { videoRef.current!.muted = !m; return !m; }); };
  const toggleFS   = () => { if (!document.fullscreenElement) containerRef.current?.requestFullscreen?.(); else document.exitFullscreen(); };
  const togglePiP  = async () => {
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else if (videoRef.current) await videoRef.current.requestPictureInPicture();
    } catch { addToast("warn", "Picture-in-picture not supported in this browser."); }
  };
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    if (videoRef.current) videoRef.current.currentTime = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * duration;
  };
  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    setSeekHoverPct(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * 100);
  };
  const setRate = (r: number) => { setPlaybackRate(r); if (videoRef.current) videoRef.current.playbackRate = r; setShowSettings(false); };
  const handleRetry = () => { retryCount.current = 0; setFatalError(false); setLoading(true); if (sourceType === "hls") initHls(); else initMp4(); };

  const pct     = duration > 0 ? (currentTime / duration) * 100 : 0;
  const buffPct = duration > 0 ? (buffered  / duration) * 100 : 0;

  // ── Iframe branch ────────────────────────────────────────────────────────

  if (sourceType === "youtube" || sourceType === "dailymotion" || sourceType === "iframe") {
    const embedSrc =
      sourceType === "youtube"     ? toYouTubeEmbed(src) :
      sourceType === "dailymotion" ? toDailymotionEmbed(src) :
      src;
    return <IframePlayer embedSrc={embedSrc} title={title} poster={poster} onClose={onClose} onBack={onBack} toasts={toasts} dismissToast={dismissToast} />;
  }

  // ── Native video player ──────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @keyframes spinLoader   { to { transform: rotate(360deg); } }
        @keyframes slideInToast { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>

      <div
        ref={containerRef}
        onMouseMove={resetHideTimer}
        onTouchStart={resetHideTimer}
        style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#000", cursor: showControls ? "default" : "none" }}
      >
        <video
          ref={videoRef}
          poster={poster}
          playsInline
          onClick={togglePlay}
          onDoubleClick={toggleFS}
          style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
        />

        {/* Film grain */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
          opacity: 0.022, mixBlendMode: "overlay",
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px",
        }} />

        {loading   && !fatalError && <LoadingOverlay title={title} poster={poster} />}
        {fatalError && <UnavailableScreen title={title} onClose={onClose} onBack={onBack} onRetry={handleRetry} />}

        {!fatalError && (
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: "absolute", inset: 0, zIndex: 5,
              display: "flex", flexDirection: "column", justifyContent: "space-between",
              opacity: showControls ? 1 : 0,
              transition: "opacity 0.4s ease",
              pointerEvents: showControls ? "auto" : "none",
            }}
          >
            {/* Top bar */}
            <div style={{
              background: "linear-gradient(to bottom, rgba(0,0,0,0.82) 0%, transparent 100%)",
              padding: "15px 17px 50px",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              {/* ← Back */}
              <button onClick={goBack} style={{ ...circleBtn, flexShrink: 0 }} title="Back">
                <ChevronLeft size={19} color="rgba(255,255,255,0.85)" />
              </button>

              {/* Title */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{
                  fontSize: "clamp(0.9rem, 2.5vw, 1.35rem)",
                  fontFamily: "var(--font-display)", letterSpacing: "0.06em",
                  color: "#fff", margin: 0,
                  textShadow: "0 2px 12px rgba(0,0,0,0.8)",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{title}</h2>
                {subtitle && (
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", fontFamily: "var(--font-body)", margin: "3px 0 0" }}>{subtitle}</p>
                )}
              </div>

              {/* X Close */}
              <button
                onClick={onClose}
                style={{ ...circleBtn, flexShrink: 0 }}
                title="Close"
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(229,9,20,0.3)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; }}
              >
                <X size={16} color="rgba(255,255,255,0.8)" />
              </button>
            </div>

            {/* Center: prev / rewind / big play / forward / next */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 22 }}>
              {hasPrev && <button onClick={onPrev} style={centerBtn}><SkipBack size={20} color="rgba(255,255,255,0.75)" /></button>}
              <button onClick={() => skip(-10)} style={centerBtn} title="-10s"><Rewind size={18} color="rgba(255,255,255,0.75)" /></button>
              <button
                onClick={togglePlay}
                style={{
                  width: 68, height: 68, borderRadius: "50%",
                  background: "rgba(229,9,20,0.9)", border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", boxShadow: "0 0 50px rgba(229,9,20,0.4)",
                  transition: "transform 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.1)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
              >
                {playing ? <Pause size={27} fill="#fff" color="#fff" /> : <Play size={27} fill="#fff" color="#fff" />}
              </button>
              <button onClick={() => skip(10)} style={centerBtn} title="+10s"><FastForward size={18} color="rgba(255,255,255,0.75)" /></button>
              {hasNext && <button onClick={onNext} style={centerBtn}><SkipForward size={20} color="rgba(255,255,255,0.75)" /></button>}
            </div>

            {/* Bottom */}
            <div style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)", padding: "50px 18px 16px" }}>
              {/* Progress */}
              <div
                ref={progressRef}
                onClick={handleProgressClick}
                onMouseMove={handleProgressHover}
                onMouseLeave={() => setSeekHoverPct(null)}
                style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.14)", marginBottom: 12, cursor: "pointer", position: "relative", transition: "height 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.height = "6px"; }}
              >
                <div style={{ position: "absolute", inset: 0, width: `${buffPct}%`, background: "rgba(255,255,255,0.2)", borderRadius: 99 }} />
                <div style={{ position: "absolute", inset: 0, width: `${pct}%`,     background: "#e50914", borderRadius: 99, boxShadow: "0 0 8px rgba(229,9,20,0.6)" }} />
                <div style={{ position: "absolute", top: "50%", left: `${pct}%`, width: 13, height: 13, borderRadius: "50%", background: "#e50914", transform: "translate(-50%,-50%)", boxShadow: "0 0 12px rgba(229,9,20,0.85)" }} />
                {seekHoverPct !== null && (
                  <div style={{ position: "absolute", bottom: "calc(100% + 8px)", left: `${seekHoverPct}%`, transform: "translateX(-50%)", background: "rgba(0,0,0,0.88)", color: "#fff", fontSize: 11, fontFamily: "var(--font-body)", padding: "3px 7px", borderRadius: 4, pointerEvents: "none", whiteSpace: "nowrap" }}>
                    {formatTime((seekHoverPct / 100) * duration)}
                  </div>
                )}
              </div>

              {/* Control row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                {/* Left */}
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <button onClick={() => skip(-10)} style={smBtn} title="Back 10s"><Rewind size={15} color="rgba(255,255,255,0.7)" /></button>
                  <button onClick={togglePlay} style={smBtn}>
                    {playing ? <Pause size={17} fill="rgba(255,255,255,0.85)" color="rgba(255,255,255,0.85)" /> : <Play size={17} fill="rgba(255,255,255,0.85)" color="rgba(255,255,255,0.85)" />}
                  </button>
                  <button onClick={() => skip(10)} style={smBtn} title="Fwd 10s"><FastForward size={15} color="rgba(255,255,255,0.7)" /></button>

                  {/* Volume */}
                  <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 4 }}
                    onMouseEnter={() => setShowVolume(true)} onMouseLeave={() => setShowVolume(false)}>
                    <button onClick={toggleMute} style={smBtn}>
                      {muted || volume === 0 ? <VolumeX size={17} color="rgba(255,255,255,0.7)" /> : <Volume2 size={17} color="rgba(255,255,255,0.7)" />}
                    </button>
                    {showVolume && (
                      <input type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume}
                        onChange={e => { const v = parseFloat(e.target.value); setVolume(v); if (videoRef.current) videoRef.current.volume = v; if (v > 0) setMuted(false); }}
                        style={{ width: 80, accentColor: "#e50914", cursor: "pointer" }}
                      />
                    )}
                  </div>

                  {/* Time */}
                  <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.48)", fontFamily: "var(--font-body)", fontVariantNumeric: "tabular-nums", marginLeft: 4, whiteSpace: "nowrap" }}>
                    {formatTime(currentTime)}<span style={{ color: "rgba(255,255,255,0.2)" }}> / {formatTime(duration)}</span>
                  </span>
                </div>

                {/* Right */}
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <button onClick={togglePiP} style={smBtn} title="Picture in Picture"><PictureInPicture2 size={15} color="rgba(255,255,255,0.6)" /></button>

                  {/* Speed */}
                  <div style={{ position: "relative" }}>
                    <button onClick={() => setShowSettings(v => !v)} style={{ ...smBtn, background: showSettings ? "rgba(255,255,255,0.08)" : "transparent" }} title="Speed">
                      <Settings size={15} color="rgba(255,255,255,0.6)" />
                    </button>
                    {showSettings && (
                      <div style={{ position: "absolute", bottom: "calc(100% + 8px)", right: 0, background: "#0e0e10", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "10px 8px", minWidth: 156, boxShadow: "0 20px 60px rgba(0,0,0,0.9)", zIndex: 30 }}>
                        <p style={{ fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(255,255,255,0.26)", margin: "0 0 8px 4px", fontFamily: "var(--font-body)", fontWeight: 700 }}>Speed</p>
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map(r => (
                          <button key={r} onClick={() => setRate(r)} style={{
                            width: "100%", padding: "7px 10px", borderRadius: 6,
                            background: playbackRate === r ? "rgba(229,9,20,0.12)" : "transparent",
                            border: playbackRate === r ? "1px solid rgba(229,9,20,0.28)" : "1px solid transparent",
                            color: playbackRate === r ? "#fff" : "rgba(255,255,255,0.42)",
                            fontSize: 12.5, fontFamily: "var(--font-body)", fontWeight: 500,
                            cursor: "pointer", textAlign: "left",
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                          }}>
                            {r === 1 ? "Normal" : `${r}×`}
                            {playbackRate === r && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#e50914", boxShadow: "0 0 6px #e50914" }} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button onClick={toggleFS} style={smBtn} title={fullscreen ? "Exit fullscreen" : "Fullscreen"}>
                    {fullscreen ? <Minimize size={15} color="rgba(255,255,255,0.7)" /> : <Maximize size={15} color="rgba(255,255,255,0.7)" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toasts */}
        <div style={{ position: "absolute", bottom: 90, right: 16, zIndex: 40, display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", pointerEvents: "none" }}>
          {toasts.map(t => <div key={t.id} style={{ pointerEvents: "auto" }}><ToastBar toast={t} onDismiss={dismissToast} /></div>)}
        </div>
      </div>
    </>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const circleBtn: React.CSSProperties = {
  width: 38, height: 38, borderRadius: "50%",
  background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
  display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", transition: "background 0.2s",
};

const centerBtn: React.CSSProperties = {
  width: 48, height: 48, borderRadius: "50%",
  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
  display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer",
};

const smBtn: React.CSSProperties = {
  width: 34, height: 34, borderRadius: 8,
  background: "transparent", border: "none",
  display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", transition: "background 0.15s",
};

const outlineBtn: React.CSSProperties = {
  height: 40, padding: "0 18px",
  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 6, cursor: "pointer",
  color: "rgba(255,255,255,0.6)",
  fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600,
  letterSpacing: "0.12em", textTransform: "uppercase",
  display: "flex", alignItems: "center", gap: 7,
  transition: "all 0.2s",
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useVideoPlayer() {
  const [state, setState] = useState<{
    open: boolean; src: string; title: string; subtitle?: string; poster?: string;
  }>({ open: false, src: "", title: "" });

  const openPlayer  = (src: string, title: string, subtitle?: string, poster?: string) =>
    setState({ open: true, src, title, subtitle, poster });
  const closePlayer = () => setState(s => ({ ...s, open: false }));

  return { playerState: state, openPlayer, closePlayer };
}