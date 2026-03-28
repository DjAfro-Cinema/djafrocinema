"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  SkipBack, SkipForward, Settings, X, ChevronLeft,
  Star, Crown, Mic2, Heart, Share2, Download, Clock,
  Eye, Calendar, Film, ChevronRight, RotateCcw, Rewind, FastForward,
  Subtitles, Check,
} from "lucide-react";
import DashboardSidebar from "@/components/dashboard/sidebar/DashboardSidebar";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";

// ── FULL DATASET (same as movies page, keep in sync or extract to shared file) ──

const ALL_MOVIES = [
  { id: "m1",  title: "John Wick 4",              genre: "Action",    year: 2023, rating: "8.9", premium: true,  img: "/images/movie3.jpg",  duration: "2h 49m", durationSec: 10140, views: "4.2M", description: "A legendary assassin fights his way through the criminal underworld's most powerful forces. John Wick uncovers a path to defeating The High Table. But before he can earn his freedom, Wick must face off against a new enemy with powerful alliances across the globe.", tags: ["Intense", "Stylish", "Epic"], cast: ["Keanu Reeves", "Donnie Yen", "Bill Skarsgård"], director: "Chad Stahelski", language: "English", country: "USA" },
  { id: "m2",  title: "Thunderbolts*",            genre: "Marvel",    year: 2024, rating: "7.9", premium: true,  img: "/images/movie6.jpg",  duration: "2h 7m",  durationSec: 7620,  views: "3.8M", description: "Marvel's ragtag group of antiheroes is sent on a dangerous mission that forces them to confront the darkest parts of their pasts. A team of supervillains is assembled to take on a mission for the government.", tags: ["Superhero", "Action", "Comedy"], cast: ["Florence Pugh", "Sebastian Stan", "Wyatt Russell"], director: "Jake Schreier", language: "English", country: "USA" },
  { id: "m3",  title: "Ghost Rider",              genre: "Action",    year: 2024, rating: "8.2", premium: false, img: "/images/movie10.jpg", duration: "1h 50m", durationSec: 6600,  views: "2.1M", description: "The spirit of vengeance returns in a blaze of hellfire. A stunt performer who made a deal with a demon is cursed to become a flaming-skulled motorcyclist at night.", tags: ["Supernatural", "Dark", "Thrilling"], cast: ["Nicolas Cage", "Eva Mendes", "Peter Fonda"], director: "Mark Steven Johnson", language: "English", country: "USA" },
  { id: "m4",  title: "Rampage",                  genre: "Thriller",  year: 2023, rating: "8.1", premium: false, img: "/images/movie4.jpg",  duration: "1h 47m", durationSec: 6420,  views: "1.9M", description: "Primatologist Davis Okoye shares an unshakable bond with George, the extraordinarily intelligent silverback gorilla who has been in his care since birth. When a rogue genetic experiment goes wrong, Davis must secure an antidote to stop these animals from destroying Chicago.", tags: ["Giant Monsters", "Dwayne Johnson"], cast: ["Dwayne Johnson", "Naomie Harris", "Malin Åkerman"], director: "Brad Peyton", language: "English", country: "USA" },
  { id: "m5",  title: "Red 2",                    genre: "Action",    year: 2023, rating: "8.5", premium: false, img: "/images/movie9.jpg",  duration: "1h 56m", durationSec: 6960,  views: "2.4M", description: "Retired black-ops CIA agent Frank Moses reunites his unlikely team of elite operatives for a global quest to track down a missing portable nuclear device.", tags: ["Comedy", "Spy", "Action"], cast: ["Bruce Willis", "John Malkovich", "Mary-Louise Parker"], director: "Dean Parisot", language: "English", country: "USA" },
  { id: "m6",  title: "The Meg",                  genre: "Thriller",  year: 2024, rating: "7.9", premium: false, img: "/images/movie12.jpg", duration: "1h 53m", durationSec: 6780,  views: "2.8M", description: "A deep-sea submersible crew is attacked by a 75-foot Megalodon shark. Rescue diver Jonas Taylor must confront his fears to save the crew from the prehistoric apex predator.", tags: ["Ocean", "Survival", "Monster"], cast: ["Jason Statham", "Li Bingbing", "Rainn Wilson"], director: "Jon Turteltaub", language: "English", country: "USA/China" },
  { id: "m7",  title: "Baahubali: The Beginning", genre: "Bollywood", year: 2015, rating: "9.1", premium: true,  dubbed: true, img: "/images/movie2.jpg",  duration: "2h 39m", durationSec: 9540,  views: "12.4M", description: "In ancient India, an adventurous and daring man becomes involved in a decades-old feud between two warring peoples. He uncovers the story of his ancestors — a legendary warrior and his betrayal by those he trusted most.", tags: ["Epic", "Fantasy", "Dubbed"], cast: ["Prabhas", "Rana Daggubati", "Anushka Shetty"], director: "S. S. Rajamouli", language: "Swahili (DJ Afro Dub)", country: "India" },
  { id: "m8",  title: "Krish III",                genre: "Sci-Fi",    year: 2013, rating: "8.8", premium: true,  dubbed: true, img: "/images/movie5.webp", duration: "2h 44m", durationSec: 9840,  views: "5.6M", description: "India's greatest superhero Krrish faces his most dangerous enemy yet — a brilliant scientist who has genetically engineered an army of mutants to threaten all of humanity.", tags: ["Superhero", "Bollywood", "Dubbed"], cast: ["Hrithik Roshan", "Vivek Oberoi", "Priyanka Chopra"], director: "Rakesh Roshan", language: "Swahili (DJ Afro Dub)", country: "India" },
  { id: "m9",  title: "Kick",                     genre: "Bollywood", year: 2023, rating: "7.8", premium: true,  dubbed: true, img: "/images/movie11.jpg", duration: "2h 28m", durationSec: 8880,  views: "3.2M", description: "A thrill-seeking man searches for a kick in everything he does. After falling in love and becoming a Robin Hood-style thief, he faces a dangerous criminal who threatens everything he cares about.", tags: ["Comedy", "Romance", "Dubbed"], cast: ["Salman Khan", "Jacqueline Fernandez", "Nawazuddin Siddiqui"], director: "Sajid Nadiadwala", language: "Swahili (DJ Afro Dub)", country: "India" },
  { id: "m10", title: "Ghost City",               genre: "Action",    year: 2023, rating: "8.7", premium: true,  dubbed: true, img: "/images/movie8.jpg",  duration: "1h 58m", durationSec: 7080,  views: "3.9M", description: "An undercover police officer uncovers supernatural secrets lurking beneath the criminal empire of a city of ghosts. He must navigate between the living and the dead to bring justice.", tags: ["Crime", "Supernatural", "Dubbed"], cast: ["Jackie Chan", "Aaron Kwok", "Leon Lai"], director: "Benny Chan", language: "Swahili (DJ Afro Dub)", country: "Hong Kong" },
  { id: "m11", title: "Anaconda Rising",          genre: "Adventure", year: 2024, rating: "8.4", premium: false, img: "/images/movie7.jpg",  duration: "1h 45m", durationSec: 6300,  views: "3.3M", description: "Deep in the Amazon rainforest, a team of researchers awakens the most terrifying predator the world has ever seen. Survival becomes their only mission as the legendary anaconda hunts them.", tags: ["Nature", "Survival", "Exclusive"], cast: ["Jennifer Lopez", "Ice Cube", "Jon Voight"], director: "Luis Llosa", language: "English", country: "USA" },
  { id: "m12", title: "Baahubali: The Conclusion",genre: "Bollywood", year: 2017, rating: "9.2", premium: true,  dubbed: true, img: "/images/movie1.jpg",  duration: "2h 47m", durationSec: 10020, views: "18.1M", description: "The much-awaited conclusion to the Baahubali saga finally answers the legendary question: Why did Kattappa kill Baahubali? The epic climax of the greatest Indian film franchise is here, fully dubbed by DJ Afro.", tags: ["Epic", "War", "Dubbed"], cast: ["Prabhas", "Rana Daggubati", "Ramya Krishnan"], director: "S. S. Rajamouli", language: "Swahili (DJ Afro Dub)", country: "India" },
  { id: "m23", title: "RRR",                      genre: "Bollywood", year: 2022, rating: "9.0", premium: true,  dubbed: true, img: "/images/movie11.jpg", duration: "3h 2m",  durationSec: 10920, views: "9.8M", description: "A fictional story about two legendary revolutionaries and their journey away from home before they began to fight for their country. RRR is a magnum opus that redefined Indian cinema. Fully dubbed by DJ Afro.", tags: ["Epic", "History", "Dubbed"], cast: ["N. T. Rama Rao Jr.", "Ram Charan", "Alia Bhatt"], director: "S. S. Rajamouli", language: "Swahili (DJ Afro Dub)", country: "India" },
];

type Movie = typeof ALL_MOVIES[number] & { dubbed?: boolean };

const USER = { name: "Mwangi", email: "mwangi@djafro.co.ke" };

// ── VIDEO PLAYER ──────────────────────────────────────────────────────────────

function VideoPlayer({ movie, onClose }: { movie: Movie; onClose: () => void }) {
  const [playing,     setPlaying]     = useState(false);
  const [muted,       setMuted]       = useState(false);
  const [volume,      setVolume]      = useState(0.8);
  const [progress,    setProgress]    = useState(0); // 0-100
  const [elapsed,     setElapsed]     = useState(0); // seconds
  const [fullscreen,  setFullscreen]  = useState(false);
  const [showCtrl,    setShowCtrl]    = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [quality,     setQuality]     = useState("1080p");
  const [subtitles,   setSubtitles]   = useState(false);
  const [liked,       setLiked]       = useState(false);
  const [buffered,    setBuffered]    = useState(35);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSec = movie.durationSec ?? 7200;

  // Fake playback progress
  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setElapsed(p => {
          const next = p + 1;
          setProgress((next / totalSec) * 100);
          return next;
        });
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
    return h > 0
      ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      : `${m}:${String(s).padStart(2, "0")}`;
  }

  function seek(pct: number) {
    setProgress(pct);
    setElapsed(Math.floor((pct / 100) * totalSec));
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  }

  const skipAmt = 10;

  return (
    <div
      ref={containerRef}
      onMouseMove={resetHideTimer}
      onClick={() => { if (!showSettings) { setPlaying(p => !p); resetHideTimer(); } }}
      style={{
        position: "relative",
        width: "100%",
        background: "#000",
        aspectRatio: "16/9",
        overflow: "hidden",
        cursor: showCtrl ? "default" : "none",
        borderRadius: fullscreen ? 0 : 12,
      }}
    >
      {/* Fake video — movie poster with overlay */}
      <img
        src={movie.img}
        alt={movie.title}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: playing ? "brightness(0.55)" : "brightness(0.35)" }}
      />

      {/* Center play/pause indicator */}
      {!playing && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            width: 72, height: 72,
            background: "rgba(229,9,20,0.9)",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 50px rgba(229,9,20,0.4)",
          }}>
            <Play size={28} fill="#fff" color="#fff" />
          </div>
        </div>
      )}

      {/* Subtitle fake bar */}
      {subtitles && playing && (
        <div style={{
          position: "absolute", bottom: 80, left: "50%", transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.7)", padding: "6px 18px", borderRadius: 4,
          color: "#fff", fontSize: 15, fontFamily: "'DM Sans', sans-serif", textAlign: "center",
          backdropFilter: "blur(4px)",
        }}>
          Maisha si mchezo… mwisho wake ni jana.
        </div>
      )}

      {/* Settings panel */}
      {showSettings && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: "absolute", bottom: 72, right: 16,
            width: 220,
            background: "rgba(12,12,14,0.97)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.9)",
            zIndex: 10,
          }}
        >
          {/* Quality */}
          <div style={{ padding: "14px 16px 8px" }}>
            <p style={{ fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, margin: "0 0 8px" }}>Quality</p>
            {["4K Ultra", "1080p", "720p", "480p"].map(q => (
              <button
                key={q}
                onClick={() => setQuality(q)}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", background: "transparent", border: "none", color: q === quality ? "#fff" : "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", textAlign: "left" }}
              >
                {q}
                {q === quality && <Check size={12} color="#e50914" />}
              </button>
            ))}
          </div>
          <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />
          {/* Subtitles */}
          <div style={{ padding: "8px 16px 14px" }}>
            <p style={{ fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, margin: "8px 0 8px" }}>Subtitles</p>
            {["Off", "English", "Swahili"].map(s => (
              <button
                key={s}
                onClick={() => setSubtitles(s !== "Off")}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", textAlign: "left" }}
              >
                {s}
                {(s === "Off" && !subtitles) || (s !== "Off" && subtitles && s === "English") ? <Check size={12} color="#e50914" /> : null}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Controls overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 35%, transparent 65%, rgba(0,0,0,0.5) 100%)",
        opacity: showCtrl ? 1 : 0,
        transition: "opacity 0.3s",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: "16px",
        pointerEvents: showCtrl ? "auto" : "none",
      }}>
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif", margin: "0 0 2px" }}>{movie.genre}</p>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.3rem", color: "#fff", letterSpacing: "0.06em", margin: 0 }}>{movie.title}</h3>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ fontSize: 10, letterSpacing: "0.25em", color: "#e50914", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, background: "rgba(229,9,20,0.12)", border: "1px solid rgba(229,9,20,0.25)", padding: "4px 10px", borderRadius: 4 }}>{quality}</span>
            <button
              onClick={e => { e.stopPropagation(); onClose(); }}
              style={{ width: 34, height: 34, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.6)" }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Bottom controls */}
        <div onClick={e => e.stopPropagation()}>
          {/* Progress bar */}
          <div style={{ marginBottom: 12 }}>
            <div
              style={{ position: "relative", height: 4, background: "rgba(255,255,255,0.15)", borderRadius: 2, cursor: "pointer" }}
              onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                seek(((e.clientX - rect.left) / rect.width) * 100);
              }}
            >
              {/* Buffered */}
              <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${buffered}%`, background: "rgba(255,255,255,0.2)", borderRadius: 2 }} />
              {/* Played */}
              <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${progress}%`, background: "#e50914", borderRadius: 2 }}>
                <div style={{ position: "absolute", right: -6, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, background: "#e50914", borderRadius: "50%", boxShadow: "0 0 10px rgba(229,9,20,0.6)" }} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif" }}>{fmt(elapsed)}</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif" }}>{movie.duration}</span>
            </div>
          </div>

          {/* Control buttons */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {/* Left controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button onClick={() => seek(Math.max(0, progress - (skipAmt / totalSec) * 100))} style={{ width: 36, height: 36, background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Rewind size={16} />
              </button>
              <button
                onClick={() => { setPlaying(p => !p); resetHideTimer(); }}
                style={{ width: 44, height: 44, background: "#e50914", border: "none", borderRadius: "50%", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(229,9,20,0.4)" }}
              >
                {playing ? <Pause size={18} fill="#fff" /> : <Play size={18} fill="#fff" />}
              </button>
              <button onClick={() => seek(Math.min(100, progress + (skipAmt / totalSec) * 100))} style={{ width: 36, height: 36, background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FastForward size={16} />
              </button>

              {/* Volume */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button onClick={() => setMuted(p => !p)} style={{ width: 32, height: 32, background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>
                <input
                  type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume}
                  onChange={e => { setVolume(parseFloat(e.target.value)); setMuted(false); }}
                  style={{ width: 70, accentColor: "#e50914", cursor: "pointer" }}
                />
              </div>
            </div>

            {/* Right controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => setSubtitles(p => !p)} style={{ width: 34, height: 34, background: subtitles ? "rgba(229,9,20,0.2)" : "transparent", border: `1px solid ${subtitles ? "rgba(229,9,20,0.4)" : "rgba(255,255,255,0.1)"}`, borderRadius: 8, cursor: "pointer", color: subtitles ? "#e50914" : "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Subtitles size={14} />
              </button>
              <button onClick={() => setShowSettings(p => !p)} style={{ width: 34, height: 34, background: showSettings ? "rgba(229,9,20,0.2)" : "transparent", border: `1px solid ${showSettings ? "rgba(229,9,20,0.4)" : "rgba(255,255,255,0.1)"}`, borderRadius: 8, cursor: "pointer", color: showSettings ? "#e50914" : "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Settings size={14} />
              </button>
              <button onClick={toggleFullscreen} style={{ width: 34, height: 34, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, cursor: "pointer", color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={`/dashboard/movies/${movie.id}`} style={{ textDecoration: "none", display: "block" }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 12px", background: hovered ? "rgba(255,255,255,0.04)" : "transparent", border: "1px solid", borderColor: hovered ? "rgba(229,9,20,0.2)" : "rgba(255,255,255,0.05)", borderRadius: 10, transition: "all 0.18s", cursor: "pointer" }}
      >
        <div style={{ position: "relative", width: 72, height: 100, flexShrink: 0, borderRadius: 7, overflow: "hidden" }}>
          <img src={movie.img} alt={movie.title} style={{ width: "100%", height: "100%", objectFit: "cover", transform: hovered ? "scale(1.06)" : "scale(1)", transition: "transform 0.4s" }} />
          {movie.dubbed && (
            <div style={{ position: "absolute", bottom: 4, left: 4, background: "rgba(255,180,0,0.15)", border: "1px solid rgba(255,180,0,0.3)", borderRadius: 3, padding: "2px 5px", display: "flex", alignItems: "center", gap: 3 }}>
              <Mic2 size={7} color="rgba(255,200,50,0.9)" />
            </div>
          )}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: hovered ? 1 : 0, transition: "opacity 0.2s", background: "rgba(0,0,0,0.4)" }}>
            <Play size={18} fill="#fff" color="#fff" />
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.95rem", color: "#fff", letterSpacing: "0.05em", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {movie.title}
          </h4>
          <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 9, color: "#e50914", letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>{movie.genre}</span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", fontFamily: "'DM Sans', sans-serif" }}>{movie.year}</span>
          </div>
          <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#f5c518", fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
            <Star size={9} fill="#f5c518" /> {movie.rating}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function MovieDetailPage() {
  const params   = useParams();
  const router   = useRouter();
  const layout   = useDashboardLayout();
  const { isSmall, sidebarCollapsed, setSidebarCollapsed, scrolled } = layout;

  const [loading,     setLoading]     = useState(true);
  const [playerOpen,  setPlayerOpen]  = useState(false);
  const [liked,       setLiked]       = useState(false);
  const [activeTab,   setActiveTab]   = useState<"overview" | "cast" | "similar">("overview");

  useEffect(() => { setTimeout(() => setLoading(false), 800); }, []);

  const movie = ALL_MOVIES.find(m => m.id === params?.id) as Movie | undefined;
  const related = movie
    ? ALL_MOVIES.filter(m => m.id !== movie.id && (m.genre === movie.genre || m.dubbed === movie.dubbed)).slice(0, 8)
    : [];

  if (!loading && !movie) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100svh", background: "#080808", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: "3rem" }}>🎬</div>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>Movie Not Found</h2>
        <Link href="/dashboard/movies" style={{ color: "#e50914", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>← Back to Movies</Link>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "flex", height: "100svh", background: "#080808", overflow: "hidden" }}>
        {/* Sidebar */}
        {!isSmall && (
          <DashboardSidebar
            user={USER}
            collapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
          />
        )}

        {/* Scrollable content */}
        <div
          id="movie-detail-col"
          style={{ flex: 1, minWidth: 0, height: "100svh", overflowY: "auto", overflowX: "hidden" }}
        >
          {loading || !movie ? (
            // Skeleton
            <div>
              <div style={{ position: "relative", aspectRatio: "16/9", background: "#0c0c0e", overflow: "hidden" }}>
                <div className="dj-shimmer" />
              </div>
              <div style={{ padding: "32px clamp(16px,4vw,48px)" }}>
                {[200, 140, 280, 100].map((w, i) => (
                  <div key={i} style={{ height: i === 0 ? 36 : 16, width: w, background: "rgba(255,255,255,0.05)", borderRadius: 4, marginBottom: 14, position: "relative", overflow: "hidden" }}>
                    <div className="dj-shimmer" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* ── HERO / PLAYER AREA ── */}
              <div style={{ position: "relative", width: "100%", background: "#000" }}>
                {playerOpen ? (
                  <div style={{ padding: "0" }}>
                    <VideoPlayer movie={movie} onClose={() => setPlayerOpen(false)} />
                  </div>
                ) : (
                  // Hero poster
                  <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", overflow: "hidden" }}>
                    <img
                      src={movie.img}
                      alt={movie.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.35) saturate(1.1)" }}
                    />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, #080808 0%, rgba(8,8,8,0.2) 60%, transparent 100%)" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(8,8,8,0.7) 0%, transparent 60%)" }} />

                    {/* Back button */}
                    <button
                      onClick={() => router.back()}
                      style={{ position: "absolute", top: 20, left: 20, display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", backdropFilter: "blur(8px)" }}
                    >
                      <ChevronLeft size={14} /> Back
                    </button>

                    {/* Center play button */}
                    <button
                      onClick={() => setPlayerOpen(true)}
                      style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 80, height: 80, background: "rgba(229,9,20,0.9)", border: "none", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 0 60px rgba(229,9,20,0.5)", transition: "transform 0.2s" }}
                    >
                      <Play size={32} fill="#fff" color="#fff" />
                    </button>

                    {/* Duration overlay bottom-right */}
                    <div style={{ position: "absolute", bottom: 20, right: 20, display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)" }}>
                      <Clock size={11} color="rgba(255,255,255,0.4)" />
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif" }}>{movie.duration}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* ── CONTENT GRID ── */}
              <div style={{
                display: "grid",
                gridTemplateColumns: isSmall ? "1fr" : "1fr 320px",
                gap: "clamp(20px,3vw,40px)",
                padding: "clamp(20px,4vw,40px) clamp(16px,4vw,48px) 80px",
                maxWidth: 1280,
              }}>
                {/* LEFT COLUMN */}
                <div>
                  {/* Badges */}
                  <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                    {movie.premium && (
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, letterSpacing: "0.35em", padding: "4px 10px", background: "rgba(245,197,24,0.1)", border: "1px solid rgba(245,197,24,0.25)", borderRadius: 4, color: "#f5c518", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
                        <Crown size={9} fill="#f5c518" color="#f5c518" /> PREMIUM
                      </span>
                    )}
                    {movie.dubbed && (
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, letterSpacing: "0.35em", padding: "4px 10px", background: "rgba(255,180,0,0.1)", border: "1px solid rgba(255,180,0,0.25)", borderRadius: 4, color: "rgba(255,200,50,0.9)", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
                        <Mic2 size={9} /> DJ AFRO DUBBED
                      </span>
                    )}
                    <span style={{ fontSize: 9, letterSpacing: "0.35em", padding: "4px 10px", background: "rgba(229,9,20,0.08)", border: "1px solid rgba(229,9,20,0.2)", borderRadius: 4, color: "#e50914", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase" }}>
                      {movie.genre}
                    </span>
                  </div>

                  {/* Title */}
                  <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(2rem,5vw,3.8rem)", color: "#fff", letterSpacing: "0.04em", lineHeight: 1, margin: "0 0 16px" }}>
                    {movie.title}
                  </h1>

                  {/* Meta row */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", marginBottom: 24 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#f5c518", fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>
                      <Star size={14} fill="#f5c518" /> {movie.rating} / 10
                    </span>
                    <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.12)" }} />
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif" }}>
                      <Calendar size={13} /> {movie.year}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif" }}>
                      <Clock size={13} /> {movie.duration}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif" }}>
                      <Eye size={13} /> {movie.views} views
                    </span>
                  </div>

                  {/* CTA buttons */}
                  <div style={{ display: "flex", gap: 10, marginBottom: 36, flexWrap: "wrap" }}>
                    <button
                      onClick={() => setPlayerOpen(true)}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 30px", background: "#e50914", border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", cursor: "pointer", boxShadow: "0 4px 20px rgba(229,9,20,0.35)" }}
                    >
                      <Play size={16} fill="#fff" /> Watch Now
                    </button>
                    <button
                      onClick={() => setLiked(p => !p)}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "13px 20px", background: liked ? "rgba(229,9,20,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${liked ? "rgba(229,9,20,0.35)" : "rgba(255,255,255,0.1)"}`, borderRadius: 8, color: liked ? "#e50914" : "rgba(255,255,255,0.5)", fontSize: 13, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.2s" }}
                    >
                      <Heart size={15} fill={liked ? "#e50914" : "transparent"} /> {liked ? "Liked" : "Like"}
                    </button>
                    <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "13px 20px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.5)", fontSize: 13, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
                      <Share2 size={15} /> Share
                    </button>
                    {!movie.premium && (
                      <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "13px 20px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.5)", fontSize: 13, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
                        <Download size={15} /> Download
                      </button>
                    )}
                  </div>

                  {/* Tabs */}
                  <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: 24, display: "flex", gap: 0 }}>
                    {(["overview", "cast", "similar"] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setActiveTab(t)}
                        style={{
                          fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", fontWeight: 600,
                          padding: "12px 20px", background: "transparent", border: "none",
                          borderBottom: activeTab === t ? "2px solid #e50914" : "2px solid transparent",
                          color: activeTab === t ? "#fff" : "rgba(255,255,255,0.3)",
                          fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.18s",
                          marginBottom: -1,
                        }}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* Tab content */}
                  {activeTab === "overview" && (
                    <div>
                      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.8, margin: "0 0 28px" }}>
                        {movie.description}
                      </p>

                      {/* Info grid */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16, marginBottom: 28 }}>
                        {[
                          { label: "Director",  value: movie.director  },
                          { label: "Language",  value: movie.language  },
                          { label: "Country",   value: movie.country   },
                          { label: "Year",      value: String(movie.year) },
                          { label: "Duration",  value: movie.duration  },
                          { label: "Views",     value: movie.views + " total" },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <p style={{ fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, margin: "0 0 5px" }}>{label}</p>
                            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", fontFamily: "'DM Sans', sans-serif", margin: 0 }}>{value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Tags */}
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {movie.tags?.map(tag => (
                          <span key={tag} style={{ fontSize: 10, padding: "5px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif" }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === "cast" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {movie.cast?.map((name, i) => (
                        <div key={name} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10 }}>
                          <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(145deg, #e50914, #8b060d)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>
                            {name[0]}
                          </div>
                          <div>
                            <p style={{ fontSize: 13, color: "#fff", fontFamily: "'DM Sans', sans-serif", margin: "0 0 2px", fontWeight: 600 }}>{name}</p>
                            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
                              {i === 0 ? "Lead Actor" : i === 1 ? "Supporting Lead" : "Supporting Cast"}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div style={{ padding: "12px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10 }}>
                        <p style={{ fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", fontFamily: "'DM Sans', sans-serif", margin: "0 0 6px" }}>Director</p>
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", fontFamily: "'DM Sans', sans-serif", margin: 0, fontWeight: 600 }}>{movie.director}</p>
                      </div>
                    </div>
                  )}

                  {activeTab === "similar" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {related.map(m => <RelatedCard key={m.id} movie={m as Movie} />)}
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN — Related movies (desktop only) */}
                {!isSmall && (
                  <div>
                    <div style={{ position: "sticky", top: 80 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                        <div style={{ width: 3, height: 16, background: "#e50914", boxShadow: "0 0 8px rgba(229,9,20,0.4)" }} />
                        <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.2rem", color: "#fff", letterSpacing: "0.08em", margin: 0 }}>Up Next</h3>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {related.map(m => <RelatedCard key={m.id} movie={m as Movie} />)}
                      </div>

                      {/* Premium upsell (if movie is free) */}
                      {!movie.premium && (
                        <div style={{ marginTop: 24, padding: "20px 18px", background: "linear-gradient(135deg, rgba(229,9,20,0.12), rgba(139,6,13,0.06))", border: "1px solid rgba(229,9,20,0.2)", borderRadius: 12 }}>
                          <Crown size={20} color="#f5c518" style={{ marginBottom: 8 }} />
                          <h4 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.15rem", color: "#fff", letterSpacing: "0.07em", margin: "0 0 6px" }}>Go Premium</h4>
                          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif", margin: "0 0 14px", lineHeight: 1.5 }}>
                            Unlock all dubbed films, HD streaming, and download access.
                          </p>
                          <button style={{ width: "100%", padding: "10px", background: "#e50914", border: "none", borderRadius: 7, color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
                            Upgrade Now
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html, body { background: #080808; color: #fff; margin: 0; padding: 0; overflow: hidden; }
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
        input[type="range"] { -webkit-appearance: none; height: 3px; border-radius: 2px; background: rgba(255,255,255,0.15); }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; background: #e50914; cursor: pointer; }
      `}</style>
    </>
  );
}