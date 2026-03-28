"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Search, X, Zap, TrendingUp, Star, Mic2, Crown, Play,
  Flame, Sparkles, Clock, Eye, ChevronRight, RotateCcw,
  Shuffle, Heart,
} from "lucide-react";
import DashboardSidebar from "@/components/dashboard/sidebar/DashboardSidebar";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";

// ── DATA ──────────────────────────────────────────────────────────────────────

const ALL_MOVIES = [
  { id: "m1",  title: "John Wick 4",               genre: "Action",    year: 2023, rating: "8.9", premium: true,  img: "/images/movie3.jpg",  duration: "2h 49m", views: "4.2M", description: "A legendary assassin fights his way through the criminal underworld.", tags: ["Intense","Stylish","Epic"] },
  { id: "m2",  title: "Thunderbolts*",             genre: "Marvel",    year: 2024, rating: "7.9", premium: true,  img: "/images/movie6.jpg",  duration: "2h 7m",  views: "3.8M", description: "Marvel's ragtag group of antiheroes on a dangerous mission.", tags: ["Superhero","Action","Comedy"] },
  { id: "m3",  title: "Ghost Rider",               genre: "Action",    year: 2024, rating: "8.2", premium: false, img: "/images/movie10.jpg", duration: "1h 50m", views: "2.1M", description: "The spirit of vengeance returns in a blaze of hellfire.", tags: ["Supernatural","Dark"] },
  { id: "m4",  title: "Rampage",                   genre: "Thriller",  year: 2023, rating: "8.1", premium: false, img: "/images/movie4.jpg",  duration: "1h 47m", views: "1.9M", description: "A primatologist must stop three mutated animals from destroying Chicago.", tags: ["Monsters","Action"] },
  { id: "m5",  title: "Red 2",                     genre: "Action",    year: 2023, rating: "8.5", premium: false, img: "/images/movie9.jpg",  duration: "1h 56m", views: "2.4M", description: "Retired CIA operative Frank Moses reunites his team for a global manhunt.", tags: ["Spy","Comedy"] },
  { id: "m6",  title: "The Meg",                   genre: "Thriller",  year: 2024, rating: "7.9", premium: false, img: "/images/movie12.jpg", duration: "1h 53m", views: "2.8M", description: "A deep-sea crew faces a prehistoric megalodon shark.", tags: ["Ocean","Survival"] },
  { id: "m7",  title: "Baahubali: The Beginning",  genre: "Bollywood", year: 2015, rating: "9.1", premium: true,  dubbed: true, img: "/images/movie2.jpg",  duration: "2h 39m", views: "12.4M", description: "An epic tale of kingdoms, love, and betrayal in ancient India.", tags: ["Epic","Fantasy","Dubbed"] },
  { id: "m8",  title: "Krish III",                 genre: "Sci-Fi",    year: 2013, rating: "8.8", premium: true,  dubbed: true, img: "/images/movie5.webp", duration: "2h 44m", views: "5.6M",  description: "India's greatest superhero battles a genetic villain.", tags: ["Superhero","Dubbed"] },
  { id: "m9",  title: "Kick",                      genre: "Bollywood", year: 2023, rating: "7.8", premium: true,  dubbed: true, img: "/images/movie11.jpg", duration: "2h 28m", views: "3.2M",  description: "A thrill-seeking daredevil becomes a vigilante to help the poor.", tags: ["Comedy","Romance","Dubbed"] },
  { id: "m10", title: "Ghost City",                genre: "Action",    year: 2023, rating: "8.7", premium: true,  dubbed: true, img: "/images/movie8.jpg",  duration: "1h 58m", views: "3.9M",  description: "A cop uncovers supernatural secrets beneath a criminal empire.", tags: ["Crime","Dubbed"] },
  { id: "m11", title: "Anaconda Rising",           genre: "Adventure", year: 2024, rating: "8.4", premium: false, img: "/images/movie7.jpg",  duration: "1h 45m", views: "3.3M",  description: "The Amazon's most terrifying predator awakens.", tags: ["Nature","Survival"] },
  { id: "m12", title: "Baahubali: The Conclusion", genre: "Bollywood", year: 2017, rating: "9.2", premium: true,  dubbed: true, img: "/images/movie1.jpg",  duration: "2h 47m", views: "18.1M", description: "The epic conclusion answers the greatest question in Indian cinema.", tags: ["Epic","War","Dubbed"] },
  { id: "m13", title: "Fast X",                    genre: "Action",    year: 2023, rating: "8.0", premium: true,  img: "/images/movie3.jpg",  duration: "2h 21m", views: "6.1M",  description: "Dominic Toretto faces his most formidable foe yet.", tags: ["Cars","Family"] },
  { id: "m14", title: "Avatar 2",                  genre: "Sci-Fi",    year: 2022, rating: "7.8", premium: true,  img: "/images/movie8.jpg",  duration: "3h 12m", views: "11.2M", description: "Jake Sully's family faces new threats from the RDA corporation.", tags: ["Epic","Visual"] },
  { id: "m15", title: "RRR",                       genre: "Bollywood", year: 2022, rating: "9.0", premium: true,  dubbed: true, img: "/images/movie11.jpg", duration: "3h 2m",  views: "9.8M",  description: "Two Indian revolutionaries fight British rule in a spectacular saga.", tags: ["History","Epic","Dubbed"] },
  { id: "m16", title: "Top Gun: Maverick",         genre: "Action",    year: 2022, rating: "8.3", premium: true,  img: "/images/movie1.jpg",  duration: "2h 11m", views: "8.6M",  description: "Maverick returns to train the next generation of Top Gun graduates.", tags: ["Military","Action"] },
  { id: "m17", title: "Extraction 2",              genre: "Action",    year: 2023, rating: "8.3", premium: true,  img: "/images/movie10.jpg", duration: "2h 2m",  views: "4.8M",  description: "Tyler Rake returns for a breathtaking mission across Europe.", tags: ["War","Brutal"] },
  { id: "m18", title: "Vikram",                    genre: "Bollywood", year: 2022, rating: "8.4", premium: true,  dubbed: true, img: "/images/movie2.jpg",  duration: "2h 54m", views: "7.2M",  description: "A black ops mission uncovers a sinister conspiracy.", tags: ["Crime","Dubbed"] },
  { id: "m19", title: "Devotion",                  genre: "Drama",     year: 2023, rating: "7.4", premium: false, img: "/images/movie9.jpg",  duration: "2h 18m", views: "890K",  description: "Two elite fighter pilots during the Korean War.", tags: ["War","True Story"] },
  { id: "m20", title: "Nope",                      genre: "Thriller",  year: 2022, rating: "7.1", premium: false, img: "/images/movie7.jpg",  duration: "2h 10m", views: "1.2M",  description: "Ranchers encounter a mysterious force in the California skies.", tags: ["Mystery","Horror"] },
];

// Movie of the Day — rotate by day-of-year
const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
const MOVIE_OF_DAY = ALL_MOVIES[dayOfYear % ALL_MOVIES.length];

const MOODS = [
  { id: "hype",     emoji: "🔥", label: "Hype",      desc: "Action-packed",  genres: ["Action","Marvel","Adventure"] },
  { id: "chill",    emoji: "🧘", label: "Chill",      desc: "Easy watching",  genres: ["Drama","Comedy"] },
  { id: "epic",     emoji: "⚔️", label: "Epic",       desc: "Grand stories",  genres: ["Bollywood"] },
  { id: "mystery",  emoji: "🔍", label: "Suspense",   desc: "Edge of seat",   genres: ["Thriller"] },
  { id: "sci",      emoji: "🚀", label: "Sci-Fi",     desc: "Future worlds",  genres: ["Sci-Fi"] },
  { id: "dubbed",   emoji: "🎙️", label: "DJ Afro",    desc: "Dubbed classics", genres: [] },
];

const COLLECTIONS = [
  { id: "col1", title: "DJ Afro Essentials",    emoji: "🎙️", count: 8,  filter: (m: typeof ALL_MOVIES[0]) => !!m.dubbed,                     accent: "#f5c518" },
  { id: "col2", title: "Free Tonight",          emoji: "🆓", count: 7,  filter: (m: typeof ALL_MOVIES[0]) => !m.premium,                     accent: "#22c55e" },
  { id: "col3", title: "Hall of Fame",          emoji: "🏆", count: 5,  filter: (m: typeof ALL_MOVIES[0]) => parseFloat(m.rating) >= 9.0,    accent: "#e50914" },
  { id: "col4", title: "Under 2 Hours",         emoji: "⏱️", count: 6,  filter: (m: typeof ALL_MOVIES[0]) => m.duration.startsWith("1h"),     accent: "#3b82f6" },
];

const USER = { name: "Mwangi", email: "mwangi@djafro.co.ke" };

// ── MINI PLAYER ───────────────────────────────────────────────────────────────

function MiniPlayer({ movie, onClose }: { movie: typeof ALL_MOVIES[0]; onClose: () => void }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => setProgress(p => Math.min(100, p + 0.25)), 300);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing]);

  return (
    <div style={{
      position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)",
      zIndex: 1000,
      width: "min(500px, calc(100vw - 32px))",
      background: "rgba(10,10,12,0.97)",
      backdropFilter: "blur(24px)",
      border: "1px solid rgba(229,9,20,0.2)",
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 24px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.04)",
    }}>
      {/* Progress bar */}
      <div style={{ height: 3, background: "rgba(255,255,255,0.08)" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: "#e50914", transition: "width 0.3s linear" }} />
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 14px" }}>
        {/* Thumb */}
        <div style={{ position: "relative", width: 52, height: 72, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
          <img src={movie.img} alt={movie.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)" }} />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem", color: "#fff", letterSpacing: "0.06em", margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {movie.title}
          </h4>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif", margin: "0 0 8px" }}>
            {movie.genre} · {movie.duration}
          </p>
          {/* Mini seek */}
          <div
            style={{ height: 2, background: "rgba(255,255,255,0.1)", borderRadius: 1, cursor: "pointer" }}
            onClick={e => {
              const r = e.currentTarget.getBoundingClientRect();
              setProgress(((e.clientX - r.left) / r.width) * 100);
            }}
          >
            <div style={{ height: "100%", width: `${progress}%`, background: "#e50914", borderRadius: 1 }} />
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          <button
            onClick={() => setPlaying(p => !p)}
            style={{ width: 40, height: 40, background: "#e50914", border: "none", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 0 20px rgba(229,9,20,0.4)" }}
          >
            {playing
              ? <span style={{ width: 10, height: 12, display: "flex", gap: 3 }}><span style={{ flex: 1, background: "#fff", borderRadius: 1 }} /><span style={{ flex: 1, background: "#fff", borderRadius: 1 }} /></span>
              : <Play size={16} fill="#fff" color="#fff" style={{ marginLeft: 2 }} />
            }
          </button>
          <Link
            href={`/dashboard/movies/${movie.id}`}
            style={{ width: 36, height: 36, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.5)", textDecoration: "none" }}
          >
            <ChevronRight size={14} />
          </Link>
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MOVIE OF THE DAY ──────────────────────────────────────────────────────────

function MovieOfTheDay({ movie, onPlay }: { movie: typeof ALL_MOVIES[0]; onPlay: () => void }) {
  return (
    <div style={{
      position: "relative",
      borderRadius: 16,
      overflow: "hidden",
      background: "#0c0c0e",
      marginBottom: 40,
    }}>
      {/* BG */}
      <img
        src={movie.img}
        alt={movie.title}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.28) saturate(1.2)" }}
      />
      {/* Gradient */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(8,8,8,0.92) 0%, rgba(8,8,8,0.4) 60%, rgba(229,9,20,0.05) 100%)" }} />

      {/* Animated glow */}
      <div style={{ position: "absolute", top: -60, right: -60, width: 280, height: 280, background: "radial-gradient(circle, rgba(229,9,20,0.12) 0%, transparent 70%)", animation: "discoPulse 4s ease-in-out infinite" }} />

      <div style={{ position: "relative", padding: "clamp(24px,4vw,40px)" }}>
        {/* Label */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Sparkles size={13} color="#f5c518" />
          <span style={{ fontSize: 9, letterSpacing: "0.5em", textTransform: "uppercase", color: "#f5c518", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
            Movie of the Day
          </span>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", fontFamily: "'DM Sans', sans-serif" }}>
            · {new Date().toLocaleDateString("en-KE", { weekday: "long", month: "short", day: "numeric" })}
          </span>
        </div>

        <div style={{ display: "flex", gap: "clamp(16px,3vw,32px)", alignItems: "flex-end", flexWrap: "wrap" }}>
          {/* Poster thumb */}
          <div style={{ position: "relative", width: "clamp(80px,12vw,120px)", aspectRatio: "2/3", borderRadius: 10, overflow: "hidden", flexShrink: 0, boxShadow: "0 20px 60px rgba(0,0,0,0.7)" }}>
            <img src={movie.img} alt={movie.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
              {movie.dubbed && (
                <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 8, padding: "3px 8px", background: "rgba(255,180,0,0.15)", border: "1px solid rgba(255,180,0,0.3)", borderRadius: 3, color: "rgba(255,200,50,0.9)", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.3em" }}>
                  <Mic2 size={8} /> DUBBED
                </span>
              )}
              {movie.premium && (
                <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 8, padding: "3px 8px", background: "rgba(245,197,24,0.12)", border: "1px solid rgba(245,197,24,0.25)", borderRadius: 3, color: "#f5c518", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.3em" }}>
                  <Crown size={8} /> PREMIUM
                </span>
              )}
            </div>

            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.8rem,4vw,3rem)", color: "#fff", letterSpacing: "0.04em", lineHeight: 1, margin: "0 0 10px" }}>
              {movie.title}
            </h2>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", marginBottom: 14 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#f5c518", fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>
                <Star size={12} fill="#f5c518" /> {movie.rating}
              </span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif" }}>{movie.year}</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif" }}>{movie.duration}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif" }}>
                <Eye size={11} /> {movie.views}
              </span>
            </div>

            <p style={{ fontSize: "clamp(12px,1.5vw,13px)", color: "rgba(255,255,255,0.45)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, margin: "0 0 18px", maxWidth: 420 }}>
              {movie.description}
            </p>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={onPlay}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 24px", background: "#e50914", border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", cursor: "pointer", boxShadow: "0 4px 20px rgba(229,9,20,0.4)" }}
              >
                <Play size={14} fill="#fff" /> Play Now
              </button>
              <Link
                href={`/dashboard/movies/${movie.id}`}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "11px 20px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", textDecoration: "none" }}
              >
                More Info
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MOOD PICKER ───────────────────────────────────────────────────────────────

function MoodPicker({ active, onChange }: { active: string | null; onChange: (id: string | null) => void }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ width: 3, height: 18, background: "#e50914", boxShadow: "0 0 8px rgba(229,9,20,0.5)" }} />
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", letterSpacing: "0.07em", color: "#fff", margin: 0 }}>
          What's Your Mood?
        </h2>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {MOODS.map(m => (
          <button
            key={m.id}
            onClick={() => onChange(active === m.id ? null : m.id)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              padding: "14px 20px",
              background: active === m.id ? "rgba(229,9,20,0.15)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${active === m.id ? "rgba(229,9,20,0.4)" : "rgba(255,255,255,0.07)"}`,
              borderRadius: 12,
              cursor: "pointer",
              transition: "all 0.18s",
              minWidth: 80,
            }}
          >
            <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>{m.emoji}</span>
            <span style={{ fontSize: 11, color: active === m.id ? "#fff" : "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
              {m.label}
            </span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", fontFamily: "'DM Sans', sans-serif" }}>
              {m.desc}
            </span>
          </button>
        ))}
        {active && (
          <button
            onClick={() => onChange(null)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "14px 16px", background: "transparent", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, color: "rgba(255,255,255,0.2)", fontSize: 11, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}
          >
            <RotateCcw size={11} /> Clear
          </button>
        )}
      </div>
    </div>
  );
}

// ── COLLECTION CARDS ──────────────────────────────────────────────────────────

function Collections({ onCollectionClick }: { onCollectionClick: (filter: (m: typeof ALL_MOVIES[0]) => boolean, title: string) => void }) {
  return (
    <div style={{ marginBottom: 44 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <div style={{ width: 3, height: 18, background: "#e50914", boxShadow: "0 0 8px rgba(229,9,20,0.5)" }} />
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", letterSpacing: "0.07em", color: "#fff", margin: 0 }}>
          Collections
        </h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
        {COLLECTIONS.map(col => (
          <button
            key={col.id}
            onClick={() => onCollectionClick(col.filter, col.title)}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "16px 18px",
              background: "rgba(255,255,255,0.03)",
              border: `1px solid rgba(255,255,255,0.06)`,
              borderLeft: `3px solid ${col.accent}`,
              borderRadius: 10,
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.18s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; }}
          >
            <span style={{ fontSize: "1.5rem" }}>{col.emoji}</span>
            <div>
              <p style={{ fontSize: 13, color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, margin: "0 0 3px" }}>{col.title}</p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif", margin: 0 }}>{col.count} films</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── DISCOVER CARD (compact, horizontal-scroll row) ────────────────────────────

function DiscoverCard({ movie, onPlay }: { movie: typeof ALL_MOVIES[0]; onPlay: (m: typeof ALL_MOVIES[0]) => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        width: 180, minWidth: 180,
        borderRadius: 10,
        overflow: "hidden",
        background: "#0c0c0e",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      <Link href={`/dashboard/movies/${movie.id}`} style={{ textDecoration: "none", display: "block" }}>
        <div style={{ position: "relative", paddingTop: "148%", overflow: "hidden" }}>
          <img
            src={movie.img}
            alt={movie.title}
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
              transform: hovered ? "scale(1.07)" : "scale(1)",
              transition: "transform 0.45s ease",
            }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(8,8,8,0.95) 0%, transparent 55%)", opacity: hovered ? 1 : 0.65, transition: "opacity 0.3s" }} />

          {/* Badges */}
          <div style={{ position: "absolute", top: 8, left: 8, display: "flex", flexDirection: "column", gap: 4 }}>
            {movie.dubbed && (
              <span style={{ fontSize: 7, padding: "2px 6px", background: "rgba(255,180,0,0.15)", border: "1px solid rgba(255,180,0,0.3)", borderRadius: 3, color: "rgba(255,200,50,0.9)", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.25em", display: "flex", alignItems: "center", gap: 2 }}>
                <Mic2 size={7} /> DUB
              </span>
            )}
            {!movie.premium && (
              <span style={{ fontSize: 7, padding: "2px 6px", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 3, color: "#22c55e", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.25em" }}>
                FREE
              </span>
            )}
          </div>

          {/* Play on hover */}
          {hovered && (
            <button
              onClick={e => { e.preventDefault(); onPlay(movie); }}
              style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 44, height: 44, background: "#e50914", border: "none", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 0 24px rgba(229,9,20,0.5)" }}
            >
              <Play size={18} fill="#fff" color="#fff" />
            </button>
          )}

          {/* Bottom */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 10px 8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
              <span style={{ fontSize: 8, color: "#e50914", letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>{movie.genre}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 2, color: "#f5c518", fontSize: 10, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>
                <Star size={8} fill="#f5c518" /> {movie.rating}
              </span>
            </div>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "0.9rem", color: "#fff", letterSpacing: "0.04em", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {movie.title}
            </h3>
          </div>
        </div>
      </Link>
    </div>
  );
}

// ── HORIZONTAL ROW ────────────────────────────────────────────────────────────

function MovieRow({
  title, eyebrow, movies, onPlay,
}: {
  title: string;
  eyebrow?: string;
  movies: typeof ALL_MOVIES;
  onPlay: (m: typeof ALL_MOVIES[0]) => void;
}) {
  if (!movies.length) return null;
  return (
    <section style={{ marginBottom: 44 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          {eyebrow && (
            <span style={{ fontSize: 9, letterSpacing: "0.45em", textTransform: "uppercase", color: "#e50914", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", display: "block", marginBottom: 4 }}>
              {eyebrow}
            </span>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 3, height: 18, background: "#e50914", boxShadow: "0 0 8px rgba(229,9,20,0.5)" }} />
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.2rem,2.5vw,1.6rem)", letterSpacing: "0.07em", color: "#fff", margin: 0 }}>
              {title}
            </h2>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", fontFamily: "'DM Sans', sans-serif" }}>{movies.length} films</span>
          </div>
        </div>
        <Link href="/dashboard/movies" style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", textDecoration: "none", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
          View All →
        </Link>
      </div>
      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none" }}>
        {movies.map(m => <DiscoverCard key={m.id} movie={m} onPlay={onPlay} />)}
      </div>
    </section>
  );
}

// ── SEARCH RESULTS ────────────────────────────────────────────────────────────

function SearchResults({
  query,
  results,
  onPlay,
  onClose,
}: {
  query: string;
  results: typeof ALL_MOVIES;
  onPlay: (m: typeof ALL_MOVIES[0]) => void;
  onClose: () => void;
}) {
  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase", color: "#e50914", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, margin: "0 0 4px" }}>
            Search Results
          </p>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", letterSpacing: "0.06em", color: "#fff", margin: 0 }}>
            "{query}" — {results.length} found
          </h2>
        </div>
        <button onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
          <X size={11} /> Clear
        </button>
      </div>

      {results.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 20px" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🎬</div>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.25)", fontFamily: "'DM Sans', sans-serif" }}>No movies match your search</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
          {results.map(m => <DiscoverCard key={m.id} movie={m} onPlay={onPlay} />)}
        </div>
      )}
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function DiscoverPage() {
  const layout = useDashboardLayout();
  const { isSmall, sidebarCollapsed, setSidebarCollapsed, scrolled } = layout;

  const [searchVal,      setSearchVal]      = useState("");
  const [searchFocused,  setSearchFocused]  = useState(false);
  const [activeMood,     setActiveMood]     = useState<string | null>(null);
  const [miniPlayer,     setMiniPlayer]     = useState<typeof ALL_MOVIES[0] | null>(null);
  const [collectionView, setCollectionView] = useState<{ filter: (m: typeof ALL_MOVIES[0]) => boolean; title: string } | null>(null);
  const [randomMovie,    setRandomMovie]    = useState<typeof ALL_MOVIES[0] | null>(null);
  const [loading,        setLoading]        = useState(true);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTimeout(() => setLoading(false), 700); }, []);

  // Mood-filtered movies
  const moodMovies = activeMood
    ? ALL_MOVIES.filter(m => {
        const mood = MOODS.find(mo => mo.id === activeMood);
        if (!mood) return false;
        if (mood.id === "dubbed") return !!m.dubbed;
        return mood.genres.includes(m.genre);
      })
    : [];

  // Search results
  const searchResults = searchVal.trim().length > 0
    ? ALL_MOVIES.filter(m => {
        const q = searchVal.toLowerCase();
        return m.title.toLowerCase().includes(q)
          || m.genre.toLowerCase().includes(q)
          || m.tags?.some((t: string) => t.toLowerCase().includes(q))
          || m.description.toLowerCase().includes(q);
      })
    : [];

  // Collection view movies
  const collectionMovies = collectionView ? ALL_MOVIES.filter(collectionView.filter) : [];

  const handlePlay = useCallback((movie: typeof ALL_MOVIES[0]) => {
    setMiniPlayer(movie);
  }, []);

  const handleShuffle = useCallback(() => {
    const r = ALL_MOVIES[Math.floor(Math.random() * ALL_MOVIES.length)];
    setRandomMovie(r);
    setMiniPlayer(r);
  }, []);

  const isSearching = searchVal.trim().length > 0;

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
          id="discover-col"
          style={{ flex: 1, minWidth: 0, height: "100svh", overflowY: "auto", overflowX: "hidden" }}
        >
          {/* ── TOP BAR ── */}
          <header style={{
            position: "sticky", top: 0, zIndex: 800,
            display: "flex", alignItems: "center", gap: 12,
            padding: "0 clamp(16px,3vw,28px)",
            height: 64,
            background: scrolled ? "rgba(8,8,10,0.97)" : "rgba(8,8,10,0.8)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            flexShrink: 0,
          }}>
            {/* Title */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(1.3rem,2.5vw,1.8rem)", color: "#fff", letterSpacing: "0.1em", margin: 0 }}>
                Discover
              </h1>
            </div>

            {/* Search bar — takes remaining space */}
            <div style={{ flex: 1, maxWidth: 480 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 14px",
                background: searchFocused ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${searchFocused ? "rgba(229,9,20,0.3)" : "rgba(255,255,255,0.07)"}`,
                borderRadius: 10,
                transition: "all 0.2s",
              }}>
                <Search size={14} color={searchFocused ? "#e50914" : "rgba(255,255,255,0.25)"} strokeWidth={1.8} />
                <input
                  ref={searchRef}
                  value={searchVal}
                  onChange={e => { setSearchVal(e.target.value); setCollectionView(null); setActiveMood(null); }}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="Search movies, genres, moods…"
                  style={{
                    flex: 1, background: "transparent", border: "none",
                    color: "#fff", fontSize: 13,
                    fontFamily: "'DM Sans', sans-serif", outline: "none",
                  }}
                />
                {searchVal && (
                  <button onClick={() => setSearchVal("")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.25)", display: "flex" }}>
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Shuffle button */}
            <button
              onClick={handleShuffle}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "9px 16px",
                background: "rgba(229,9,20,0.1)",
                border: "1px solid rgba(229,9,20,0.2)",
                borderRadius: 10,
                color: "#e50914", fontSize: 11, fontWeight: 700,
                letterSpacing: "0.1em", textTransform: "uppercase",
                fontFamily: "'DM Sans', sans-serif",
                cursor: "pointer",
                flexShrink: 0,
                transition: "all 0.18s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(229,9,20,0.2)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(229,9,20,0.1)"; }}
            >
              <Shuffle size={13} />
              {!isSmall && "Surprise Me"}
            </button>
          </header>

          {/* ── BODY ── */}
          {loading ? (
            <div style={{ padding: "40px clamp(16px,3vw,28px)" }}>
              {[300, 200, 180].map((w, i) => (
                <div key={i} style={{ height: i === 0 ? 260 : 22, width: "100%", maxWidth: w * 2, background: "rgba(255,255,255,0.04)", borderRadius: 10, marginBottom: 20, position: "relative", overflow: "hidden" }}>
                  <div className="dj-shimmer" />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "clamp(20px,3vw,36px) clamp(16px,3vw,28px) clamp(80px,12vh,120px)" }}>

              {/* ── SEARCH MODE ── */}
              {isSearching ? (
                <SearchResults query={searchVal} results={searchResults} onPlay={handlePlay} onClose={() => setSearchVal("")} />
              ) : collectionView ? (
                /* ── COLLECTION VIEW ── */
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                    <button
                      onClick={() => setCollectionView(null)}
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}
                    >
                      ← Back
                    </button>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 3, height: 18, background: "#e50914", boxShadow: "0 0 8px rgba(229,9,20,0.5)" }} />
                      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.5rem", letterSpacing: "0.07em", color: "#fff", margin: 0 }}>{collectionView.title}</h2>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "'DM Sans', sans-serif" }}>{collectionMovies.length} films</span>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
                    {collectionMovies.map(m => <DiscoverCard key={m.id} movie={m} onPlay={handlePlay} />)}
                  </div>
                </div>
              ) : (
                /* ── NORMAL DISCOVER MODE ── */
                <>
                  {/* Movie of the Day */}
                  <MovieOfTheDay movie={MOVIE_OF_DAY} onPlay={() => handlePlay(MOVIE_OF_DAY)} />

                  {/* Mood Picker */}
                  <MoodPicker active={activeMood} onChange={mood => { setActiveMood(mood); setCollectionView(null); }} />

                  {/* Mood results */}
                  {activeMood && (
                    <MovieRow
                      eyebrow={MOODS.find(m => m.id === activeMood)?.label + " picks"}
                      title={`${MOODS.find(m => m.id === activeMood)?.emoji} ${MOODS.find(m => m.id === activeMood)?.desc}`}
                      movies={moodMovies}
                      onPlay={handlePlay}
                    />
                  )}

                  {/* Collections */}
                  {!activeMood && (
                    <Collections onCollectionClick={(filter, title) => { setCollectionView({ filter, title }); setActiveMood(null); }} />
                  )}

                  {/* Surprise pick highlight */}
                  {randomMovie && !activeMood && (
                    <div style={{ marginBottom: 44, padding: "20px 22px", background: "rgba(229,9,20,0.06)", border: "1px solid rgba(229,9,20,0.15)", borderRadius: 14, display: "flex", gap: 16, alignItems: "center" }}>
                      <span style={{ fontSize: "1.8rem", flexShrink: 0 }}>🎲</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase", color: "#e50914", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, margin: "0 0 3px" }}>Surprise Pick</p>
                        <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.25rem", color: "#fff", letterSpacing: "0.06em", margin: "0 0 4px" }}>{randomMovie.title}</h3>
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif", margin: 0 }}>{randomMovie.genre} · {randomMovie.year} · ⭐ {randomMovie.rating}</p>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        <button onClick={() => handlePlay(randomMovie)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", background: "#e50914", border: "none", borderRadius: 7, color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
                          <Play size={12} fill="#fff" /> Play
                        </button>
                        <Link href={`/dashboard/movies/${randomMovie.id}`} style={{ display: "flex", alignItems: "center", padding: "9px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, color: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "'DM Sans', sans-serif", textDecoration: "none" }}>
                          Info
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Rows */}
                  <MovieRow
                    eyebrow="Most Watched This Week"
                    title="Trending Now"
                    movies={ALL_MOVIES.filter(m => parseFloat(m.rating) >= 8.5).slice(0, 8)}
                    onPlay={handlePlay}
                  />

                  <MovieRow
                    eyebrow="DJ Afro Exclusive"
                    title="Dubbed Picks"
                    movies={ALL_MOVIES.filter(m => m.dubbed).slice(0, 8)}
                    onPlay={handlePlay}
                  />

                  <MovieRow
                    eyebrow="No Subscription Needed"
                    title="Free to Watch"
                    movies={ALL_MOVIES.filter(m => !m.premium)}
                    onPlay={handlePlay}
                  />

                  <MovieRow
                    eyebrow="New & Noteworthy"
                    title="Latest Releases"
                    movies={[...ALL_MOVIES].sort((a, b) => b.year - a.year).slice(0, 8)}
                    onPlay={handlePlay}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mini player */}
      {miniPlayer && <MiniPlayer movie={miniPlayer} onClose={() => setMiniPlayer(null)} />}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html, body { background: #080808; color: #fff; margin: 0; padding: 0; overflow: hidden; }
        #discover-col::-webkit-scrollbar { display: none; }
        #discover-col { scrollbar-width: none; }
        ::-webkit-scrollbar { width: 0; height: 0; }

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
        @keyframes discoPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.15); }
        }
      `}</style>
    </>
  );
}