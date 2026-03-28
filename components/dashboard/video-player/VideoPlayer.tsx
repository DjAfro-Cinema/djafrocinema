"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  SkipBack, SkipForward, X, Settings, Subtitles, ChevronRight,
  Rewind, FastForward,
} from "lucide-react";

export interface VideoPlayerProps {
  src: string;
  title?: string;
  subtitle?: string; // e.g. "Episode 1 · Season 1" or movie genre
  poster?: string;
  onClose?: () => void;
  autoPlay?: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

function formatTime(sec: number): string {
  if (!isFinite(sec)) return "0:00";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

export default function VideoPlayer({
  src,
  title = "Movie Title",
  subtitle,
  poster,
  onClose,
  autoPlay = true,
  onNext,
  onPrev,
  hasNext = false,
  hasPrev = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout>>();

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState("Auto");
  const [showVolume, setShowVolume] = useState(false);

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  useEffect(() => {
    resetHideTimer();
    return () => clearTimeout(hideControlsTimer.current);
  }, [playing, resetHideTimer]);

  // Video event listeners
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTimeUpdate = () => setCurrentTime(v.currentTime);
    const onDurationChange = () => setDuration(v.duration);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onProgress = () => {
      if (v.buffered.length > 0) setBuffered(v.buffered.end(v.buffered.length - 1));
    };
    v.addEventListener("timeupdate", onTimeUpdate);
    v.addEventListener("durationchange", onDurationChange);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("progress", onProgress);
    return () => {
      v.removeEventListener("timeupdate", onTimeUpdate);
      v.removeEventListener("durationchange", onDurationChange);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("progress", onProgress);
    };
  }, []);

  // Fullscreen change
  useEffect(() => {
    const h = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      switch (e.key) {
        case " ": case "k": e.preventDefault(); togglePlay(); break;
        case "ArrowLeft": e.preventDefault(); skip(-10); break;
        case "ArrowRight": e.preventDefault(); skip(10); break;
        case "ArrowUp": e.preventDefault(); adjustVolume(0.1); break;
        case "ArrowDown": e.preventDefault(); adjustVolume(-0.1); break;
        case "m": toggleMute(); break;
        case "f": toggleFullscreen(); break;
        case "Escape": if (!fullscreen) onClose?.(); break;
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [playing, volume, fullscreen]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    playing ? v.pause() : v.play();
  };

  const skip = (secs: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + secs));
  };

  const adjustVolume = (delta: number) => {
    const v = Math.max(0, Math.min(1, volume + delta));
    setVolume(v);
    if (videoRef.current) videoRef.current.volume = v;
    if (v > 0) setMuted(false);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const next = !muted;
    setMuted(next);
    videoRef.current.muted = next;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    if (videoRef.current) videoRef.current.currentTime = pct * duration;
  };

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const buffPct = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={resetHideTimer}
      onClick={togglePlay}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "#000",
        cursor: showControls ? "default" : "none",
      }}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
        onClick={e => e.stopPropagation()}
        onDoubleClick={toggleFullscreen}
      />

      {/* Grain overlay */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
        opacity: 0.018, mixBlendMode: "overlay",
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "180px",
      }} />

      {/* Controls overlay */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "absolute", inset: 0, zIndex: 5,
          display: "flex", flexDirection: "column",
          justifyContent: "space-between",
          opacity: showControls ? 1 : 0,
          transition: "opacity 0.35s ease",
          pointerEvents: showControls ? "auto" : "none",
        }}
      >
        {/* Top bar */}
        <div style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)",
          padding: "20px 24px 40px",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        }}>
          <div>
            <h2 style={{
              fontSize: "clamp(1rem, 3vw, 1.5rem)",
              fontFamily: "var(--font-display)",
              letterSpacing: "0.06em", color: "#fff", margin: 0,
            }}>{title}</h2>
            {subtitle && (
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontFamily: "'DM Sans', sans-serif", margin: "4px 0 0" }}>{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 38, height: 38, borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "rgba(255,255,255,0.7)",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(229,9,20,0.3)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"}
          >
            <X size={16} />
          </button>
        </div>

        {/* Center play/pause */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 32 }}>
          {hasPrev && (
            <button onClick={onPrev} style={iconBtnStyle}>
              <SkipBack size={22} color="rgba(255,255,255,0.7)" />
            </button>
          )}
          <button onClick={togglePlay} style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "rgba(229,9,20,0.85)",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 40px rgba(229,9,20,0.5)",
            transition: "transform 0.15s",
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "scale(1.08)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = "scale(1)"}
          >
            {playing ? <Pause size={26} fill="#fff" color="#fff" /> : <Play size={26} fill="#fff" color="#fff" />}
          </button>
          {hasNext && (
            <button onClick={onNext} style={iconBtnStyle}>
              <SkipForward size={22} color="rgba(255,255,255,0.7)" />
            </button>
          )}
        </div>

        {/* Bottom controls */}
        <div style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 100%)",
          padding: "40px 24px 20px",
        }}>
          {/* Progress bar */}
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            style={{
              height: 4, borderRadius: 99, background: "rgba(255,255,255,0.15)",
              marginBottom: 14, cursor: "pointer", position: "relative",
              transition: "height 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.height = "6px"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.height = "4px"}
          >
            {/* Buffered */}
            <div style={{ position: "absolute", inset: 0, width: `${buffPct}%`, background: "rgba(255,255,255,0.2)", borderRadius: 99 }} />
            {/* Played */}
            <div style={{ position: "absolute", inset: 0, width: `${pct}%`, background: "#e50914", borderRadius: 99, boxShadow: "0 0 6px rgba(229,9,20,0.6)" }} />
            {/* Thumb */}
            <div style={{
              position: "absolute", top: "50%", left: `${pct}%`,
              width: 12, height: 12, borderRadius: "50%",
              background: "#e50914", transform: "translate(-50%, -50%)",
              boxShadow: "0 0 10px rgba(229,9,20,0.8)",
            }} />
          </div>

          {/* Control row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            {/* Left controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {/* Rewind */}
              <button onClick={() => skip(-10)} style={smBtnStyle} title="Rewind 10s">
                <Rewind size={16} color="rgba(255,255,255,0.7)" />
              </button>

              {/* Play/pause */}
              <button onClick={togglePlay} style={smBtnStyle}>
                {playing ? <Pause size={18} fill="rgba(255,255,255,0.85)" color="rgba(255,255,255,0.85)" /> : <Play size={18} fill="rgba(255,255,255,0.85)" color="rgba(255,255,255,0.85)" />}
              </button>

              {/* Forward */}
              <button onClick={() => skip(10)} style={smBtnStyle} title="Forward 10s">
                <FastForward size={16} color="rgba(255,255,255,0.7)" />
              </button>

              {/* Volume */}
              <div
                style={{ position: "relative", display: "flex", alignItems: "center", gap: 6 }}
                onMouseEnter={() => setShowVolume(true)}
                onMouseLeave={() => setShowVolume(false)}
              >
                <button onClick={toggleMute} style={smBtnStyle}>
                  {muted || volume === 0
                    ? <VolumeX size={18} color="rgba(255,255,255,0.7)" />
                    : <Volume2 size={18} color="rgba(255,255,255,0.7)" />
                  }
                </button>
                {showVolume && (
                  <input
                    type="range" min={0} max={1} step={0.05}
                    value={muted ? 0 : volume}
                    onChange={e => { const v = parseFloat(e.target.value); setVolume(v); if (videoRef.current) videoRef.current.volume = v; if (v > 0) setMuted(false); }}
                    style={{ width: 80, accentColor: "#e50914", cursor: "pointer" }}
                  />
                )}
              </div>

              {/* Time */}
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontFamily: "'DM Sans', sans-serif", fontVariantNumeric: "tabular-nums", marginLeft: 4 }}>
                {formatTime(currentTime)} <span style={{ color: "rgba(255,255,255,0.25)" }}>/ {formatTime(duration)}</span>
              </span>
            </div>

            {/* Right controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {/* Settings */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowSettings(v => !v)}
                  style={{ ...smBtnStyle, background: showSettings ? "rgba(255,255,255,0.08)" : "transparent" }}
                  title="Settings"
                >
                  <Settings size={16} color="rgba(255,255,255,0.6)" />
                </button>
                {showSettings && (
                  <div style={{
                    position: "absolute", bottom: "calc(100% + 8px)", right: 0,
                    background: "#141416", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10, padding: 12, minWidth: 180,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.8)", zIndex: 20,
                  }}>
                    <p style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 10, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>Playback Speed</p>
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map(r => (
                      <button key={r} onClick={() => { setPlaybackRate(r); if (videoRef.current) videoRef.current.playbackRate = r; setShowSettings(false); }}
                        style={{
                          width: "100%", padding: "7px 10px", borderRadius: 6,
                          background: playbackRate === r ? "rgba(229,9,20,0.12)" : "transparent",
                          border: playbackRate === r ? "1px solid rgba(229,9,20,0.3)" : "1px solid transparent",
                          color: playbackRate === r ? "#fff" : "rgba(255,255,255,0.5)",
                          fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                          cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between",
                        }}>
                        {r === 1 ? "Normal" : `${r}×`}
                        {playbackRate === r && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#e50914", boxShadow: "0 0 6px #e50914" }} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button onClick={toggleFullscreen} style={smBtnStyle} title={fullscreen ? "Exit fullscreen" : "Fullscreen"}>
                {fullscreen ? <Minimize size={16} color="rgba(255,255,255,0.7)" /> : <Maximize size={16} color="rgba(255,255,255,0.7)" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Button styles
const iconBtnStyle: React.CSSProperties = {
  width: 48, height: 48, borderRadius: "50%",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer",
};

const smBtnStyle: React.CSSProperties = {
  width: 34, height: 34, borderRadius: 8,
  background: "transparent", border: "none",
  display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer",
  transition: "background 0.15s",
};

// ── VIDEO PLAYER TRIGGER HOOK ─────────────────────────────────────────────────
// Use this hook to open the player from any page
import { useState as useS } from "react";

export function useVideoPlayer() {
  const [playerState, setPlayerState] = useState<{
    open: boolean;
    src: string;
    title: string;
    subtitle?: string;
    poster?: string;
  }>({ open: false, src: "", title: "" });

  const openPlayer = (src: string, title: string, subtitle?: string, poster?: string) => {
    setPlayerState({ open: true, src, title, subtitle, poster });
  };

  const closePlayer = () => {
    setPlayerState(s => ({ ...s, open: false }));
  };

  return { playerState, openPlayer, closePlayer };
}