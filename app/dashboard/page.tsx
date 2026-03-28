"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, X, Bell, Film, Home, Compass, Library, User } from "lucide-react";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import MobileBottomNav from "@/components/dashboard/mobile/MobileBottomNav";
import DashboardSidebar from "@/components/dashboard/sidebar/DashboardSidebar";
import MovieBanner from "@/components/dashboard/movie-banner/MovieBanner";
import { MovieRow, MovieGrid } from "@/components/dashboard/movie-card/MovieCard";
import type { MovieCardData } from "@/components/dashboard/movie-card/MovieCard";
import type { BannerMovie } from "@/components/dashboard/movie-banner/MovieBanner";

// ── MOCK DATA ─────────────────────────────────────────────────────────────────

const BANNER_MOVIES: BannerMovie[] = [
  {
    id: "b1",
    img: "/images/hero1.jpg",
    title: "Anaconda Rising",
    genre: "Action · Adventure",
    year: "2024",
    rating: "8.4",
    tag: "EXCLUSIVE",
    description:
      "The Amazon's deadliest legend comes to life. An epic dubbed adventure that slithers into your heart — only on DjAfro Cinema.",
    kenBurns: "zoom-in-right",
  },
  {
    id: "b2",
    img: "/images/hero2.jpg",
    title: "Baahubali: The Lost Kingdom",
    genre: "Epic · Fantasy",
    year: "2024",
    rating: "9.1",
    tag: "DUBBED",
    dubbed: true,
    description:
      "The epic that redefined Indian cinema, now fully dubbed for East Africa. Kingdoms, betrayal, and destiny await.",
    kenBurns: "zoom-in-left",
  },
  {
    id: "b3",
    img: "/images/hero4.jpg",
    title: "John Wick: Chapter 4",
    genre: "Action · Crime",
    year: "2024",
    rating: "9.0",
    tag: "TOP RATED",
    description:
      "The legend continues. Keanu Reeves returns in the most stylish, action-packed chapter yet.",
    kenBurns: "zoom-in-right",
  },
];

const CONTINUE_WATCHING: MovieCardData[] = [
  { id: "c1", title: "Baahubali: The Beginning", genre: "Epic",     year: 2015, rating: "9.1", premium: true,  img: "/images/movie2.jpg",  progress: 65 },
  { id: "c2", title: "John Wick 4",              genre: "Action",   year: 2023, rating: "8.9", premium: true,  img: "/images/movie3.jpg",  progress: 30 },
  { id: "c3", title: "Rampage",                  genre: "Thriller", year: 2023, rating: "8.1", premium: false, img: "/images/movie4.jpg",  progress: 88 },
  { id: "c4", title: "Krish III",                genre: "Sci-Fi",   year: 2013, rating: "8.8", premium: true,  img: "/images/movie5.webp", progress: 12 },
  { id: "c5", title: "Ghost City",               genre: "Crime",    year: 2023, rating: "8.7", premium: true,  img: "/images/movie8.jpg",  progress: 55 },
];

const TRENDING: MovieCardData[] = [
  { id: "t1", title: "Thunderbolts*",   genre: "Marvel",    year: 2024, rating: "7.9", premium: true,  img: "/images/movie6.jpg",  rank: 1 },
  { id: "t2", title: "Anaconda Rising", genre: "Adventure", year: 2024, rating: "8.4", premium: false, img: "/images/movie7.jpg",  rank: 2 },
  { id: "t3", title: "Ghost Rider",     genre: "Drama",     year: 2024, rating: "8.2", premium: false, img: "/images/movie10.jpg", rank: 3 },
  { id: "t4", title: "The Meg",         genre: "Mystery",   year: 2024, rating: "7.9", premium: false, img: "/images/movie12.jpg", rank: 4 },
  { id: "t5", title: "Red 2",           genre: "Crime",     year: 2023, rating: "8.5", premium: false, img: "/images/movie9.jpg",  rank: 5 },
  { id: "t6", title: "Kick",            genre: "Romance",   year: 2023, rating: "7.8", premium: true,  img: "/images/movie11.jpg", rank: 6 },
];

const DUBBED_PICKS: MovieCardData[] = [
  { id: "d1", title: "Baahubali: The Beginning", genre: "Epic",    year: 2015, rating: "9.1", premium: true, img: "/images/movie2.jpg",  dubbed: true },
  { id: "d2", title: "Krish III",                genre: "Sci-Fi",  year: 2013, rating: "8.8", premium: true, img: "/images/movie5.webp", dubbed: true },
  { id: "d3", title: "Ghost City",               genre: "Crime",   year: 2023, rating: "8.7", premium: true, img: "/images/movie8.jpg",  dubbed: true },
  { id: "d4", title: "Kick",                     genre: "Romance", year: 2023, rating: "7.8", premium: true, img: "/images/movie11.jpg", dubbed: true },
  { id: "d5", title: "John Wick 4",              genre: "Action",  year: 2023, rating: "8.9", premium: true, img: "/images/movie3.jpg",  dubbed: true },
];

const FREE_MOVIES: MovieCardData[] = [
  { id: "f1", title: "Rampage",         genre: "Thriller",  year: 2023, rating: "8.1", premium: false, img: "/images/movie4.jpg"  },
  { id: "f2", title: "Anaconda Rising", genre: "Adventure", year: 2024, rating: "8.4", premium: false, img: "/images/movie7.jpg"  },
  { id: "f3", title: "Red 2",           genre: "Crime",     year: 2023, rating: "8.5", premium: false, img: "/images/movie9.jpg"  },
  { id: "f4", title: "Ghost Rider",     genre: "Drama",     year: 2024, rating: "8.2", premium: false, img: "/images/movie10.jpg" },
  { id: "f5", title: "The Meg",         genre: "Mystery",   year: 2024, rating: "7.9", premium: false, img: "/images/movie12.jpg" },
];

const GENRES = ["All", "Action", "Bollywood", "Sci-Fi", "Crime", "Adventure", "Thriller", "Marvel"];

const USER = { name: "Mwangi", email: "mwangi@djafro.co.ke" };


// ── MOBILE TOP BAR (no hamburger — sidebar doesn't exist on mobile) ───────────

function MobileTopBar({
  onSearchOpen,
  notifCount = 0,
  userName,
}: {
  onSearchOpen: () => void;
  notifCount?: number;
  userName: string;
}) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 800,
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        background: "rgba(8,8,10,0.97)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "1.25rem",
        letterSpacing: "0.1em",
        display: "flex",
        gap: 3,
        lineHeight: 1,
      }}>
        <span style={{ color: "#e50914" }}>DJ</span>
        <span style={{ color: "#e8e8e8" }}>AFRO</span>
        <span style={{ color: "rgba(255,255,255,0.28)", marginLeft: 4 }}>CINEMA</span>
      </div>

      {/* Right actions — search + avatar only. No hamburger. */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          onClick={onSearchOpen}
          style={{
            width: 36, height: 36,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 10,
            cursor: "pointer",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          <Search size={15} strokeWidth={1.8} />
        </button>

        <Link
          href="/dashboard/notifications"
          style={{
            width: 36, height: 36,
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative",
            textDecoration: "none",
            color: "rgba(255,255,255,0.5)",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 10,
          }}
        >
          <Bell size={15} strokeWidth={1.8} />
          {notifCount > 0 && (
            <span style={{
              position: "absolute", top: 6, right: 6,
              width: 7, height: 7,
              background: "#e50914",
              borderRadius: "50%",
              boxShadow: "0 0 6px rgba(229,9,20,0.7)",
            }} />
          )}
        </Link>

        <Link
          href="/dashboard/profile"
          style={{
            width: 32, height: 32,
            borderRadius: "50%",
            background: "linear-gradient(145deg, #e50914, #8b060d)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, color: "#fff",
            textDecoration: "none",
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: "0 0 0 2px rgba(229,9,20,0.2)",
            letterSpacing: "0.03em",
          }}
        >
          {userName[0]?.toUpperCase()}
        </Link>
      </div>
    </header>
  );
}

// ── DESKTOP TOP BAR (no XP chip) ─────────────────────────────────────────────

function DesktopTopBar({
  scrolled,
  searchOpen,
  searchVal,
  onSearchOpen,
  onSearchClose,
  onSearchChange,
  notifCount,
  userName,
}: {
  scrolled: boolean;
  searchOpen: boolean;
  searchVal: string;
  onSearchOpen: () => void;
  onSearchClose: () => void;
  onSearchChange: (v: string) => void;
  notifCount: number;
  userName: string;
}) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 800,
        height: 62,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        background: scrolled ? "rgba(8,8,10,0.97)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none",
        transition: "background 0.3s, backdrop-filter 0.3s, border-bottom 0.3s",
        flexShrink: 0,
      }}
    >
      {/* Search */}
      <div style={{ flex: 1, maxWidth: 380 }}>
        {searchOpen ? (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 14px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(229,9,20,0.25)",
            borderRadius: 10,
          }}>
            <Search size={13} color="rgba(255,255,255,0.3)" strokeWidth={1.8} />
            <input
              autoFocus
              value={searchVal}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Search movies, genres…"
              style={{
                flex: 1, background: "transparent", border: "none",
                color: "#fff", fontSize: 13,
                fontFamily: "'DM Sans', sans-serif", outline: "none",
              }}
            />
            <button
              onClick={onSearchClose}
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", display: "flex" }}
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <button
            onClick={onSearchOpen}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 14px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 10,
              cursor: "pointer",
              color: "rgba(255,255,255,0.28)",
              fontSize: 12.5, fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <Search size={13} strokeWidth={1.8} />
            <span>Search movies…</span>
            <kbd style={{
              marginLeft: 8, fontSize: 9, padding: "2px 6px",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 5, color: "rgba(255,255,255,0.18)",
              fontFamily: "monospace", background: "transparent",
            }}>⌘K</kbd>
          </button>
        )}
      </div>

      {/* Right — notification + avatar only, no XP */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Link
          href="/dashboard/notifications"
          style={{
            width: 38, height: 38,
            borderRadius: 11,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", textDecoration: "none",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          <Bell size={16} strokeWidth={1.8} />
          {notifCount > 0 && (
            <span style={{
              position: "absolute", top: -4, right: -4,
              minWidth: 18, height: 18,
              borderRadius: 99,
              background: "#e50914",
              color: "#fff",
              fontSize: 9, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: "0 0 10px rgba(229,9,20,0.5)",
            }}>{notifCount}</span>
          )}
        </Link>

        <Link
          href="/dashboard/profile"
          style={{
            width: 36, height: 36,
            borderRadius: "50%",
            background: "linear-gradient(145deg, #e50914, #8b060d)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: "#fff",
            textDecoration: "none",
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: "0.02em",
            boxShadow: "0 0 0 2px rgba(229,9,20,0.2), 0 4px 12px rgba(229,9,20,0.22)",
          }}
        >
          {userName[0]?.toUpperCase()}
        </Link>
      </div>
    </header>
  );
}

// ── MOBILE SEARCH OVERLAY ─────────────────────────────────────────────────────

function MobileSearchOverlay({
  open,
  val,
  onChange,
  onClose,
}: {
  open: boolean;
  val: string;
  onChange: (v: string) => void;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 2000,
      background: "rgba(8,8,10,0.97)",
      backdropFilter: "blur(20px)",
      display: "flex", flexDirection: "column",
      padding: "20px 16px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <div style={{
          flex: 1, display: "flex", alignItems: "center", gap: 10,
          padding: "12px 16px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(229,9,20,0.22)",
          borderRadius: 12,
        }}>
          <Search size={15} color="rgba(255,255,255,0.35)" strokeWidth={1.8} />
          <input
            autoFocus
            value={val}
            onChange={e => onChange(e.target.value)}
            placeholder="Search movies, genres…"
            style={{
              flex: 1, background: "transparent", border: "none",
              color: "#fff", fontSize: 15,
              fontFamily: "'DM Sans', sans-serif", outline: "none",
            }}
          />
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "rgba(255,255,255,0.4)", fontSize: 13,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Cancel
        </button>
      </div>
      <p style={{
        fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase",
        color: "rgba(255,255,255,0.18)", marginBottom: 12,
        fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
      }}>Popular</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {["Action", "Drama", "Bollywood", "Nollywood", "Thriller", "Romance"].map(t => (
          <button key={t} onClick={() => onChange(t)} style={{
            padding: "8px 14px",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 99,
            background: "rgba(255,255,255,0.03)",
            color: "rgba(255,255,255,0.45)", fontSize: 12,
            fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
          }}>{t}</button>
        ))}
      </div>
    </div>
  );
}

// ── SECTION HEADER ────────────────────────────────────────────────────────────

function SectionHead({
  eyebrow,
  title,
  viewAll,
}: {
  eyebrow?: string;
  title: string;
  viewAll?: string;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-end",
      justifyContent: "space-between",
      marginBottom: 18,
    }}>
      <div>
        {eyebrow && (
          <span style={{
            fontSize: 9, letterSpacing: "0.45em", textTransform: "uppercase",
            color: "#e50914", fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            display: "block", marginBottom: 4,
          }}>{eyebrow}</span>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 3, height: 18,
            background: "#e50914",
            boxShadow: "0 0 8px rgba(229,9,20,0.5)",
          }} />
          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(1.2rem, 2.5vw, 1.7rem)",
            letterSpacing: "0.07em",
            color: "#fff",
            margin: 0,
          }}>{title}</h2>
        </div>
      </div>
      {viewAll && (
        <Link href={viewAll} style={{
          fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase",
          color: "rgba(255,255,255,0.28)", textDecoration: "none",
          fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
        }}>
          View All →
        </Link>
      )}
    </div>
  );
}

// ── GREETING ──────────────────────────────────────────────────────────────────

function Greeting({ name }: { name: string }) {
  const h = new Date().getHours();
  const greet = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  return (
    <div style={{
      display: "flex", alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap", gap: 14,
      marginBottom: 32,
    }}>
      <div>
        <p style={{
          fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase",
          color: "rgba(255,255,255,0.28)", margin: "0 0 5px",
          fontFamily: "'DM Sans', sans-serif",
        }}>{greet},</p>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(2rem, 4vw, 2.8rem)",
          color: "#fff", letterSpacing: "0.04em",
          lineHeight: 1, margin: 0,
        }}>{name} 👋</h1>
      </div>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        background: "rgba(229,9,20,0.07)",
        border: "1px solid rgba(229,9,20,0.18)",
        padding: "8px 15px",
        borderRadius: 8,
      }}>
        <span style={{
          width: 6, height: 6,
          background: "#e50914", borderRadius: "50%",
          boxShadow: "0 0 7px rgba(229,9,20,0.7)",
          animation: "djPulse 2s ease-in-out infinite",
          display: "inline-block",
        }} />
        <span style={{
          fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase",
          color: "rgba(255,255,255,0.55)", fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif",
        }}>7 New Dubbed Films This Week</span>
      </div>
    </div>
  );
}

// ── STATS ─────────────────────────────────────────────────────────────────────

function StatsWidget({ isMobile }: { isMobile: boolean }) {
  const items = [
    { emoji: "🎬", val: "42",    label: "Watched",    sub: "movies" },
    { emoji: "⭐", val: "11",    label: "Favourites", sub: "saved"  },
    { emoji: "🔥", val: "7",     label: "Streak",     sub: "days"   },
    { emoji: "🎁", val: "2,400", label: "XP Points",  sub: "earned" },
  ];
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)",
      gap: 2,
      background: "rgba(255,255,255,0.035)",
      borderRadius: 4,
      overflow: "hidden",
      marginBottom: 44,
    }}>
      {items.map(s => (
        <div key={s.label} style={{
          background: "#0c0c0e",
          padding: "20px 16px 16px",
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: 3,
        }}>
          <span style={{ fontSize: "1.25rem", marginBottom: 3 }}>{s.emoji}</span>
          <span style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "1.85rem", color: "#fff",
            letterSpacing: "0.05em", lineHeight: 1,
          }}>{s.val}</span>
          <span style={{
            fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.28)", fontFamily: "'DM Sans', sans-serif",
          }}>{s.label}</span>
          <span style={{
            fontSize: 10, color: "rgba(255,255,255,0.14)",
            fontFamily: "'DM Sans', sans-serif",
          }}>{s.sub}</span>
        </div>
      ))}
    </div>
  );
}

// ── GENRE FILTER ──────────────────────────────────────────────────────────────

function GenreFilter({ active, onChange }: { active: string; onChange: (g: string) => void }) {
  return (
    <div style={{
      display: "flex", gap: 8, overflowX: "auto",
      paddingBottom: 4, marginBottom: 24,
      scrollbarWidth: "none",
    }}>
      {GENRES.map(g => (
        <button key={g} onClick={() => onChange(g)} style={{
          flexShrink: 0,
          fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase",
          padding: "7px 18px",
          cursor: "pointer", fontWeight: 600,
          border: `1px solid ${active === g ? "#e50914" : "rgba(255,255,255,0.09)"}`,
          background: active === g ? "#e50914" : "transparent",
          color: active === g ? "#fff" : "rgba(255,255,255,0.32)",
          fontFamily: "'DM Sans', sans-serif",
          transition: "all 0.18s",
          borderRadius: 4,
        }}>{g}</button>
      ))}
    </div>
  );
}

// ── SKELETON ─────────────────────────────────────────────────────────────────

function SkeletonBanner() {
  return (
    <div style={{
      position: "relative", width: "100%",
      height: "min(80vh, 680px)",
      background: "#0c0c0e", overflow: "hidden",
    }}>
      <div className="dj-shimmer" />
    </div>
  );
}

function SkeletonRow() {
  return (
    <div style={{ marginBottom: 44 }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 18, alignItems: "center" }}>
        <div className="dj-sk" style={{ width: 3, height: 18 }} />
        <div className="dj-sk" style={{ width: 180, height: 22 }} />
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{
            position: "relative", width: 180, minWidth: 180,
            height: 260, background: "#0e0e10",
            overflow: "hidden", flexShrink: 0,
          }}>
            <div className="dj-shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const layout       = useDashboardLayout();
  const [loading, setLoading]       = useState(true);
  const [activeGenre, setActiveGenre] = useState("All");

  const {
    isMobile, isTablet, isSmall,
    sidebarCollapsed, setSidebarCollapsed,
    searchOpen, setSearchOpen,
    searchVal, setSearchVal,
    scrolled,
  } = layout;

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1600);
    return () => clearTimeout(t);
  }, []);

  const handlePlay = useCallback((movie: MovieCardData | BannerMovie) => {
    // wire to your VideoPlayer here
    console.log("play", "title" in movie ? movie.title : "");
  }, []);

  const filteredMovies =
    activeGenre === "All"
      ? [...TRENDING, ...FREE_MOVIES]
      : [...TRENDING, ...FREE_MOVIES].filter(
          m => m.genre.toLowerCase() === activeGenre.toLowerCase()
        );

  return (
    <>
      {/* Mobile search overlay */}
      {isMobile && (
        <MobileSearchOverlay
          open={searchOpen}
          val={searchVal}
          onChange={setSearchVal}
          onClose={() => { setSearchOpen(false); setSearchVal(""); }}
        />
      )}

      {/* ── ROOT ── */}
      <div style={{
        display: "flex",
        height: "100svh",
        background: "#080808",
        overflow: "hidden",
      }}>

        {/*
         * Desktop sidebar — NEVER rendered on mobile or tablet.
         * It renders its own layout spacer div next to it,
         * so the content column just uses flex:1 and everything aligns.
         */}
       {!isSmall && (
          <DashboardSidebar
            user={USER}
            collapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
          />
        )}
        {/* ── SCROLLABLE CONTENT COLUMN ── */}
        <div
          id="dj-content-col"
          style={{
            flex: 1,
            minWidth: 0,
            height: "100svh",
            overflowY: "auto",
            overflowX: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Top bar */}
          {isSmall ? (
            <MobileTopBar
              onSearchOpen={() => setSearchOpen(true)}
              notifCount={2}
              userName={USER.name}
            />
          ) : (
            <DesktopTopBar
              scrolled={scrolled}
              searchOpen={searchOpen}
              searchVal={searchVal}
              onSearchOpen={() => setSearchOpen(true)}
              onSearchClose={() => { setSearchOpen(false); setSearchVal(""); }}
              onSearchChange={setSearchVal}
              notifCount={2}
              userName={USER.name}
            />
          )}

          {/* Body */}
          {loading ? (
            <>
              <SkeletonBanner />
              <div style={{ padding: "40px 28px 0" }}>
                <SkeletonRow />
                <SkeletonRow />
              </div>
            </>
          ) : (
            <>
              {/* Hero banner — full-bleed within the content column */}
              <MovieBanner
                movies={BANNER_MOVIES}
                onPlay={handlePlay as (m: BannerMovie) => void}
              />

              {/* Padded inner content */}
              <div style={{
                padding: isSmall ? "28px 16px 100px" : "40px 28px 80px",
              }}>
                <Greeting name={USER.name} />
                <StatsWidget isMobile={isMobile} />

                {/* Continue Watching */}
                <section style={{ marginBottom: 48 }}>
                  <SectionHead eyebrow="Pick Up Where You Left" title="Continue Watching" viewAll="/dashboard/library" />
                  <MovieRow title="" movies={CONTINUE_WATCHING} onPlay={handlePlay as (m: MovieCardData) => void} />
                </section>

                {/* Trending */}
                <section style={{ marginBottom: 48 }}>
                  <SectionHead eyebrow="Most Watched This Week" title="Trending Now" viewAll="/dashboard/movies" />
                  <MovieRow title="" movies={TRENDING} onPlay={handlePlay as (m: MovieCardData) => void} />
                </section>

                {/* Divider */}
                <div style={{
                  width: "100%", height: 1,
                  background: "linear-gradient(90deg, transparent, rgba(229,9,20,0.22), transparent)",
                  margin: "0 0 44px",
                }} />

                {/* Dubbed Picks */}
                <section style={{ marginBottom: 48 }}>
                  <SectionHead eyebrow="DJ Afro Exclusive" title="Dubbed Picks" viewAll="/dashboard/movies?filter=dubbed" />
                  <MovieRow title="" movies={DUBBED_PICKS} onPlay={handlePlay as (m: MovieCardData) => void} />
                </section>

                {/* Free Movies */}
                <section style={{ marginBottom: 48 }}>
                  <SectionHead eyebrow="No Subscription Needed" title="Free to Watch" viewAll="/dashboard/movies?filter=free" />
                  <MovieRow title="" movies={FREE_MOVIES} onPlay={handlePlay as (m: MovieCardData) => void} />
                </section>

                {/* Genre Explorer */}
                <section style={{ marginBottom: 80 }}>
                  <SectionHead eyebrow="Find Something New" title="Explore by Genre" />
                  <GenreFilter active={activeGenre} onChange={setActiveGenre} />
                  <MovieGrid
                    movies={filteredMovies}
                    onPlay={handlePlay as (m: MovieCardData) => void}
                  />
                </section>
              </div>
            </>
          )}
        </div>

     {/* Mobile bottom tab nav */}
     {isSmall && <MobileBottomNav />}
      </div>

      {/* ── GLOBAL STYLES ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html, body { background: #080808; color: #fff; margin: 0; padding: 0; overflow: hidden; }

        #dj-content-col::-webkit-scrollbar { display: none; }
        #dj-content-col { scrollbar-width: none; }
        ::-webkit-scrollbar { width: 0; height: 0; }

        @keyframes djShimmer {
          0%   { background-position: -700px 0; }
          100% { background-position:  700px 0; }
        }
        .dj-shimmer {
          position: absolute; inset: 0;
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0)   0%,
            rgba(255,255,255,0.04) 50%,
            rgba(255,255,255,0)   100%
          );
          background-size: 700px 100%;
          animation: djShimmer 1.6s ease-in-out infinite;
        }
        .dj-sk {
          background: rgba(255,255,255,0.05);
          position: relative; overflow: hidden; display: block;
        }
        .dj-sk::after {
          content: "";
          position: absolute; inset: 0;
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0)   0%,
            rgba(255,255,255,0.04) 50%,
            rgba(255,255,255,0)   100%
          );
          background-size: 700px 100%;
          animation: djShimmer 1.6s ease-in-out infinite;
        }

        @keyframes djPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }

        .dj-nav-item:hover {
          background: rgba(255,255,255,0.04) !important;
        }
        .dj-nav-item[data-active="true"]:hover {
          background: rgba(229,9,20,0.13) !important;
        }
      `}</style>
    </>
  );
}