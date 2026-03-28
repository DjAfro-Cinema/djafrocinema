"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  Play, Clock, CheckCircle2, Lock, Crown,
  BookOpen, History, Layers, Star,
  ChevronRight, RotateCcw, Download,
  TrendingUp, Zap, Eye,
} from "lucide-react";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import DashboardSidebar from "@/components/dashboard/sidebar/DashboardSidebar";
import MobileBottomNav from "@/components/dashboard/mobile/MobileBottomNav";
import MobileTopBar from "@/components/dashboard/topbar/MobileTopBar";
import DesktopTopBar from "@/components/dashboard/topbar/DesktopTopBar";

// ── TYPES (matching Appwrite schema) ─────────────────────────────────────────

interface Movie {
  $id: string;
  title: string;
  genre: string[];
  poster_url: string;
  duration: string;
  release_year: string;
  rating: number;
  premium_only: boolean;
  quality_options: string[];
  download_enabled: boolean;
  view_count: number;
  is_featured: boolean;
  is_trending: boolean;
}

interface WatchProgress {
  movieId: string;
  progressPercent: number;
  lastWatchedAt: string;
  movie: Movie;
}

interface Payment {
  $id: string;
  movieId: string;
  movieIds: string[];
  amount: number;
  status: string;
  paidAt: string;
  paymentType: string;
  offerType: string;
  currency: string;
  movie: Movie;
}

// ── MOCK DATA (Appwrite schema-shaped) ────────────────────────────────────────

const MOCK_MOVIES: Movie[] = [
  { $id: "m1", title: "Baahubali: The Beginning", genre: ["Epic", "Action"], poster_url: "/images/movie2.jpg",  duration: "2h 39m", release_year: "2015", rating: 9.1, premium_only: true,  quality_options: ["720p","1080p"], download_enabled: true,  view_count: 14200, is_featured: true,  is_trending: false },
  { $id: "m2", title: "John Wick: Chapter 4",     genre: ["Action","Crime"], poster_url: "/images/movie3.jpg",  duration: "2h 49m", release_year: "2023", rating: 8.9, premium_only: true,  quality_options: ["480p","720p","1080p"], download_enabled: true,  view_count: 9800,  is_featured: false, is_trending: true  },
  { $id: "m3", title: "Rampage",                  genre: ["Thriller"],       poster_url: "/images/movie4.jpg",  duration: "1h 47m", release_year: "2023", rating: 8.1, premium_only: false, quality_options: ["480p","720p"],         download_enabled: false, view_count: 6100,  is_featured: false, is_trending: false },
  { $id: "m4", title: "Krish III",                genre: ["Sci-Fi","Action"],poster_url: "/images/movie5.webp", duration: "2h 10m", release_year: "2013", rating: 8.8, premium_only: true,  quality_options: ["720p","1080p"],        download_enabled: true,  view_count: 11500, is_featured: false, is_trending: false },
  { $id: "m5", title: "Ghost City",               genre: ["Crime","Drama"],  poster_url: "/images/movie8.jpg",  duration: "1h 55m", release_year: "2023", rating: 8.7, premium_only: true,  quality_options: ["720p","1080p"],        download_enabled: true,  view_count: 7300,  is_featured: false, is_trending: true  },
  { $id: "m6", title: "Thunderbolts*",            genre: ["Marvel","Action"],poster_url: "/images/movie6.jpg",  duration: "2h 07m", release_year: "2024", rating: 7.9, premium_only: true,  quality_options: ["1080p"],               download_enabled: false, view_count: 18900, is_featured: true,  is_trending: true  },
  { $id: "m7", title: "Anaconda Rising",          genre: ["Adventure"],      poster_url: "/images/movie7.jpg",  duration: "1h 38m", release_year: "2024", rating: 8.4, premium_only: false, quality_options: ["480p","720p"],         download_enabled: true,  view_count: 5200,  is_featured: false, is_trending: false },
  { $id: "m8", title: "Red 2",                    genre: ["Crime","Action"], poster_url: "/images/movie9.jpg",  duration: "1h 56m", release_year: "2023", rating: 8.5, premium_only: false, quality_options: ["720p"],                download_enabled: true,  view_count: 4800,  is_featured: false, is_trending: false },
  { $id: "m9", title: "The Meg",                  genre: ["Thriller"],       poster_url: "/images/movie12.jpg", duration: "1h 53m", release_year: "2024", rating: 7.9, premium_only: false, quality_options: ["480p","720p"],         download_enabled: false, view_count: 6700,  is_featured: false, is_trending: false },
];

const CONTINUE_WATCHING: WatchProgress[] = [
  { movieId: "m1", progressPercent: 65, lastWatchedAt: "2025-03-27T18:30:00Z", movie: MOCK_MOVIES[0] },
  { movieId: "m2", progressPercent: 30, lastWatchedAt: "2025-03-26T21:15:00Z", movie: MOCK_MOVIES[1] },
  { movieId: "m4", progressPercent: 88, lastWatchedAt: "2025-03-25T14:00:00Z", movie: MOCK_MOVIES[3] },
  { movieId: "m5", progressPercent: 12, lastWatchedAt: "2025-03-24T20:45:00Z", movie: MOCK_MOVIES[4] },
  { movieId: "m6", progressPercent: 55, lastWatchedAt: "2025-03-23T19:00:00Z", movie: MOCK_MOVIES[5] },
];

const PAID_MOVIES: Payment[] = [
  { $id: "pay1", movieId: "m1", movieIds: ["m1"], amount: 150, status: "completed", paidAt: "2025-03-10T12:00:00Z", paymentType: "movie", offerType: "single", currency: "KES", movie: MOCK_MOVIES[0] },
  { $id: "pay2", movieId: "m2", movieIds: ["m2"], amount: 150, status: "completed", paidAt: "2025-03-15T09:30:00Z", paymentType: "movie", offerType: "single", currency: "KES", movie: MOCK_MOVIES[1] },
  { $id: "pay3", movieId: "m4", movieIds: ["m4"], amount: 150, status: "completed", paidAt: "2025-03-01T16:45:00Z", paymentType: "movie", offerType: "single", currency: "KES", movie: MOCK_MOVIES[3] },
  { $id: "pay4", movieId: "m5", movieIds: ["m5"], amount: 150, status: "completed", paidAt: "2025-02-20T11:00:00Z", paymentType: "movie", offerType: "single", currency: "KES", movie: MOCK_MOVIES[4] },
  { $id: "pay5", movieId: "m6", movieIds: ["m6"], amount: 200, status: "completed", paidAt: "2025-03-22T08:15:00Z", paymentType: "movie", offerType: "single", currency: "KES", movie: MOCK_MOVIES[5] },
];

const HISTORY: WatchProgress[] = [
  { movieId: "m7", progressPercent: 100, lastWatchedAt: "2025-03-20T22:00:00Z", movie: MOCK_MOVIES[6] },
  { movieId: "m8", progressPercent: 100, lastWatchedAt: "2025-03-18T19:30:00Z", movie: MOCK_MOVIES[7] },
  { movieId: "m3", progressPercent: 100, lastWatchedAt: "2025-03-12T17:00:00Z", movie: MOCK_MOVIES[2] },
  { movieId: "m9", progressPercent: 100, lastWatchedAt: "2025-03-05T20:15:00Z", movie: MOCK_MOVIES[8] },
];

const USER = { name: "Mwangi", email: "mwangi@djafro.co.ke" };

// ── HELPERS ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 36e5);
  const d = Math.floor(diff / 864e5);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-KE", { day: "numeric", month: "short" });
}

function timeLeft(duration: string, percent: number) {
  const match = duration.match(/(\d+)h\s*(\d+)m/);
  if (!match) return "";
  const totalMin = parseInt(match[1]) * 60 + parseInt(match[2]);
  const leftMin = Math.round(totalMin * (1 - percent / 100));
  if (leftMin < 1) return "Done";
  if (leftMin < 60) return `${leftMin}m left`;
  return `${Math.floor(leftMin / 60)}h ${leftMin % 60}m left`;
}

// ── TABS ──────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "continue", label: "Continue",   Icon: Clock,    count: CONTINUE_WATCHING.length },
  { id: "paid",     label: "Collection", Icon: Crown,    count: PAID_MOVIES.length },
  { id: "history",  label: "History",    Icon: History,  count: HISTORY.length },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ── CONTINUE WATCHING CARD ────────────────────────────────────────────────────

function ContinueCard({ item, isMobile }: { item: WatchProgress; isMobile: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        borderRadius: 12,
        overflow: "hidden",
        background: "#0f0f12",
        border: `1px solid ${hovered ? "rgba(229,9,20,0.25)" : "rgba(255,255,255,0.05)"}`,
        transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? "0 12px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(229,9,20,0.12)" : "none",
        cursor: "pointer",
        display: "flex",
        flexDirection: isMobile ? "row" : "column",
        gap: 0,
      }}
    >
      {/* Poster */}
      <div style={{
        position: "relative",
        width: isMobile ? 90 : "100%",
        aspectRatio: isMobile ? "2/3" : "2/3",
        flexShrink: 0,
        background: "#1a1a1e",
      }}>
        <img
          src={item.movie.poster_url}
          alt={item.movie.title}
          style={{
            width: "100%", height: "100%",
            objectFit: "cover",
            display: "block",
            transition: "transform 0.35s",
            transform: hovered ? "scale(1.04)" : "scale(1)",
          }}
          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
        />

        {/* Overlay on hover */}
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.2s",
        }}>
          <div style={{
            width: 40, height: 40,
            borderRadius: "50%",
            background: "#e50914",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 20px rgba(229,9,20,0.6)",
          }}>
            <Play size={16} color="#fff" fill="#fff" style={{ marginLeft: 2 }} />
          </div>
        </div>

        {/* Premium badge */}
        {item.movie.premium_only && (
          <div style={{
            position: "absolute", top: 6, left: 6,
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            borderRadius: 4,
            padding: "2px 6px",
            display: "flex", alignItems: "center", gap: 3,
          }}>
            <Crown size={8} color="#fff" fill="#fff" />
            <span style={{ fontSize: 7.5, fontWeight: 700, color: "#fff", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.05em" }}>PREMIUM</span>
          </div>
        )}

        {/* Progress bar */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: 3,
          background: "rgba(255,255,255,0.1)",
        }}>
          <div style={{
            height: "100%",
            width: `${item.progressPercent}%`,
            background: item.progressPercent >= 90
              ? "linear-gradient(90deg, #22c55e, #16a34a)"
              : "linear-gradient(90deg, #e50914, #ff4d4d)",
            borderRadius: "0 2px 2px 0",
            transition: "width 0.6s ease",
          }} />
        </div>
      </div>

      {/* Info */}
      <div style={{
        padding: isMobile ? "10px 12px" : "10px 12px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        flex: 1,
        minWidth: 0,
      }}>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: isMobile ? 13 : 12.5,
          fontWeight: 600,
          color: "#eee",
          margin: 0,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          lineHeight: 1.3,
        }}>{item.movie.title}</p>

        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 10,
          color: "rgba(255,255,255,0.3)",
          margin: 0,
          letterSpacing: "0.02em",
        }}>{item.movie.genre[0]} · {item.movie.release_year}</p>

        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 4,
        }}>
          <span style={{
            fontSize: 10,
            fontFamily: "'DM Sans', sans-serif",
            color: item.progressPercent >= 90 ? "#22c55e" : "rgba(229,9,20,0.9)",
            fontWeight: 600,
          }}>
            {item.progressPercent >= 90 ? "✓ Almost done" : timeLeft(item.movie.duration, item.progressPercent)}
          </span>
          <span style={{
            fontSize: 9,
            fontFamily: "'DM Sans', sans-serif",
            color: "rgba(255,255,255,0.2)",
          }}>{timeAgo(item.lastWatchedAt)}</span>
        </div>

        {/* Progress text */}
        <div style={{
          fontSize: 9,
          fontFamily: "'DM Sans', sans-serif",
          color: "rgba(255,255,255,0.18)",
          letterSpacing: "0.03em",
        }}>{item.progressPercent}% watched</div>
      </div>
    </div>
  );
}

// ── COLLECTION CARD ───────────────────────────────────────────────────────────

function CollectionCard({ payment, isMobile }: { payment: Payment; isMobile: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        borderRadius: 12,
        overflow: "hidden",
        background: "#0f0f12",
        border: `1px solid ${hovered ? "rgba(229,9,20,0.2)" : "rgba(255,255,255,0.05)"}`,
        transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? "0 12px 32px rgba(0,0,0,0.5)" : "none",
        cursor: "pointer",
        display: "flex",
        flexDirection: isMobile ? "row" : "column",
      }}
    >
      {/* Poster */}
      <div style={{
        position: "relative",
        width: isMobile ? 90 : "100%",
        aspectRatio: isMobile ? "2/3" : "2/3",
        flexShrink: 0,
        background: "#1a1a1e",
      }}>
        <img
          src={payment.movie.poster_url}
          alt={payment.movie.title}
          style={{
            width: "100%", height: "100%",
            objectFit: "cover", display: "block",
            transition: "transform 0.35s",
            transform: hovered ? "scale(1.04)" : "scale(1)",
          }}
          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.2s",
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "#e50914",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 20px rgba(229,9,20,0.6)",
          }}>
            <Play size={16} color="#fff" fill="#fff" style={{ marginLeft: 2 }} />
          </div>
        </div>

        {/* Paid badge */}
        <div style={{
          position: "absolute", top: 6, left: 6,
          background: "rgba(34,197,94,0.18)",
          border: "1px solid rgba(34,197,94,0.3)",
          borderRadius: 4,
          padding: "2px 6px",
          display: "flex", alignItems: "center", gap: 3,
        }}>
          <CheckCircle2 size={8} color="#22c55e" />
          <span style={{ fontSize: 7.5, fontWeight: 700, color: "#22c55e", fontFamily: "'DM Sans', sans-serif" }}>OWNED</span>
        </div>

        {/* Quality badge */}
        {payment.movie.quality_options.includes("1080p") && (
          <div style={{
            position: "absolute", top: 6, right: 6,
            background: "rgba(0,0,0,0.7)",
            borderRadius: 4,
            padding: "2px 5px",
          }}>
            <span style={{ fontSize: 7.5, fontWeight: 700, color: "rgba(255,255,255,0.7)", fontFamily: "'DM Sans', sans-serif" }}>HD</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{
        padding: isMobile ? "10px 12px" : "10px 12px 12px",
        display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0,
      }}>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: isMobile ? 13 : 12.5,
          fontWeight: 600, color: "#eee",
          margin: 0,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{payment.movie.title}</p>

        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 10, color: "rgba(255,255,255,0.3)", margin: 0,
        }}>{payment.movie.genre[0]} · {payment.movie.release_year}</p>

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
          <Star size={9} color="#f59e0b" fill="#f59e0b" />
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif" }}>
            {payment.movie.rating.toFixed(1)}
          </span>
          <span style={{ color: "rgba(255,255,255,0.1)", fontSize: 10 }}>·</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif" }}>
            {payment.movie.duration}
          </span>
        </div>

        <div style={{
          marginTop: "auto",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{
            fontSize: 10, fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
            color: "rgba(255,255,255,0.22)",
          }}>KES {payment.amount}</span>
          <span style={{
            fontSize: 9, color: "rgba(255,255,255,0.18)",
            fontFamily: "'DM Sans', sans-serif",
          }}>{timeAgo(payment.paidAt)}</span>
        </div>

        {payment.movie.download_enabled && (
          <div style={{
            display: "flex", alignItems: "center", gap: 4, marginTop: 2,
          }}>
            <Download size={9} color="rgba(229,9,20,0.5)" />
            <span style={{ fontSize: 9, color: "rgba(229,9,20,0.5)", fontFamily: "'DM Sans', sans-serif" }}>Download available</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── HISTORY CARD ──────────────────────────────────────────────────────────────

function HistoryCard({ item }: { item: WatchProgress }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 16px",
        borderRadius: 12,
        background: hovered ? "rgba(255,255,255,0.03)" : "transparent",
        border: `1px solid ${hovered ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)"}`,
        cursor: "pointer",
        transition: "background 0.15s, border-color 0.15s",
      }}
    >
      {/* Poster thumb */}
      <div style={{
        width: 52, height: 72,
        borderRadius: 8,
        overflow: "hidden",
        flexShrink: 0,
        background: "#1a1a1e",
        position: "relative",
      }}>
        <img
          src={item.movie.poster_url}
          alt={item.movie.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.55)",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.15s",
        }}>
          <RotateCcw size={14} color="#fff" />
        </div>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13.5, fontWeight: 600,
          color: "rgba(255,255,255,0.82)",
          margin: "0 0 3px",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{item.movie.title}</p>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 10.5, color: "rgba(255,255,255,0.28)",
          margin: "0 0 6px",
        }}>{item.movie.genre[0]} · {item.movie.release_year} · {item.movie.duration}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 4,
            background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.2)",
            borderRadius: 4, padding: "2px 7px",
          }}>
            <CheckCircle2 size={9} color="#22c55e" />
            <span style={{ fontSize: 9, color: "#22c55e", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>WATCHED</span>
          </div>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "'DM Sans', sans-serif" }}>
            {timeAgo(item.lastWatchedAt)}
          </span>
        </div>
      </div>

      {/* Rating */}
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: 3, flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Star size={11} color="#f59e0b" fill="#f59e0b" />
          <span style={{
            fontSize: 13, fontFamily: "'Bebas Neue', sans-serif",
            color: "#fff", letterSpacing: "0.05em",
          }}>{item.movie.rating.toFixed(1)}</span>
        </div>
        <ChevronRight size={14} color="rgba(255,255,255,0.18)" />
      </div>
    </div>
  );
}

// ── STATS STRIP ───────────────────────────────────────────────────────────────

function StatsStrip({ isMobile }: { isMobile: boolean }) {
  const totalPaid = PAID_MOVIES.reduce((a, p) => a + p.amount, 0);
  const avgProgress = Math.round(CONTINUE_WATCHING.reduce((a, c) => a + c.progressPercent, 0) / CONTINUE_WATCHING.length);

  const stats = [
    { Icon: Crown,      val: PAID_MOVIES.length,          label: "Owned",       color: "#f59e0b" },
    { Icon: Clock,      val: CONTINUE_WATCHING.length,    label: "In Progress", color: "#e50914" },
    { Icon: Eye,        val: HISTORY.length,              label: "Completed",   color: "#22c55e" },
    { Icon: TrendingUp, val: `${avgProgress}%`,           label: "Avg Progress",color: "#818cf8" },
  ];

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)",
      gap: 1,
      background: "rgba(255,255,255,0.03)",
      borderRadius: 12,
      overflow: "hidden",
      marginBottom: 36,
      border: "1px solid rgba(255,255,255,0.04)",
    }}>
      {stats.map(s => (
        <div key={s.label} style={{
          background: "#0d0d10",
          padding: "16px 12px",
          display: "flex", flexDirection: "column", gap: 6,
        }}>
          <s.Icon size={14} color={s.color} strokeWidth={1.8} />
          <span style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "1.6rem", color: "#fff",
            letterSpacing: "0.05em", lineHeight: 1,
          }}>{s.val}</span>
          <span style={{
            fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.25)", fontFamily: "'DM Sans', sans-serif",
          }}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── EMPTY STATE ───────────────────────────────────────────────────────────────

function EmptyState({ tab }: { tab: TabId }) {
  const map = {
    continue: { icon: "▶", msg: "Nothing in progress yet", sub: "Start watching a movie to track your progress here." },
    paid:     { icon: "👑", msg: "No movies owned yet",     sub: "Purchase a movie to add it to your collection." },
    history:  { icon: "📽", msg: "No watch history yet",    sub: "Movies you finish will appear here." },
  };
  const { icon, msg, sub } = map[tab];
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "60px 24px",
      textAlign: "center",
    }}>
      <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>{icon}</div>
      <p style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "1.4rem", letterSpacing: "0.06em",
        color: "#fff", margin: "0 0 8px",
      }}>{msg}</p>
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 13, color: "rgba(255,255,255,0.28)",
        margin: "0 0 24px", maxWidth: 280,
      }}>{sub}</p>
      <Link href="/dashboard/movies" style={{
        padding: "10px 24px",
        background: "#e50914",
        borderRadius: 8,
        fontSize: 12, fontWeight: 700,
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: "0.06em", textTransform: "uppercase",
        color: "#fff", textDecoration: "none",
      }}>Browse Movies</Link>
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function LibraryPage() {
  const layout = useDashboardLayout();
  const [activeTab, setActiveTab] = useState<TabId>("continue");
  const [loading, setLoading]     = useState(true);

  const {
    isMobile, isSmall,
    sidebarCollapsed, setSidebarCollapsed,
    searchOpen, setSearchOpen,
    searchVal, setSearchVal,
    scrolled,
  } = layout;

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  // Grid columns
  const gridCols = isMobile ? 2 : isSmall ? 3 : 4;

  return (
    <>
      <div style={{
        display: "flex",
        height: "100svh",
        background: "#080808",
        overflow: "hidden",
      }}>
        {/* Sidebar — desktop only */}
        {!isSmall && (
          <DashboardSidebar
            user={USER}
            collapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
          />
        )}

        {/* Content column */}
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

          {/* ── BODY ── */}
          <div style={{ padding: isSmall ? "24px 16px 110px" : "36px 28px 80px" }}>

            {/* Page header */}
            <div style={{ marginBottom: 28 }}>
              <span style={{
                fontSize: 9, letterSpacing: "0.45em", textTransform: "uppercase",
                color: "#e50914", fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif",
                display: "block", marginBottom: 6,
              }}>Your Space</span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 3, height: 22,
                  background: "#e50914",
                  boxShadow: "0 0 10px rgba(229,9,20,0.5)",
                }} />
                <h1 style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                  letterSpacing: "0.06em",
                  color: "#fff", margin: 0, lineHeight: 1,
                }}>My Library</h1>
              </div>
            </div>

            {/* Stats */}
            {!loading && <StatsStrip isMobile={isMobile} />}

            {/* ── TABS ── */}
            <div style={{
              display: "flex",
              gap: 4,
              marginBottom: 28,
              background: "rgba(255,255,255,0.03)",
              borderRadius: 10,
              padding: 4,
              border: "1px solid rgba(255,255,255,0.05)",
            }}>
              {TABS.map(tab => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      padding: isMobile ? "9px 6px" : "9px 12px",
                      borderRadius: 7,
                      border: "none",
                      cursor: "pointer",
                      background: active ? "#e50914" : "transparent",
                      transition: "background 0.18s",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: isMobile ? 11 : 12,
                      fontWeight: active ? 700 : 500,
                      color: active ? "#fff" : "rgba(255,255,255,0.35)",
                      letterSpacing: "0.02em",
                      boxShadow: active ? "0 4px 16px rgba(229,9,20,0.35)" : "none",
                    }}
                  >
                    <tab.Icon size={13} strokeWidth={active ? 2.2 : 1.7} />
                    {!isMobile && <span>{tab.label}</span>}
                    {isMobile && <span>{tab.label}</span>}
                    <span style={{
                      fontSize: 9.5,
                      background: active ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)",
                      borderRadius: 99,
                      padding: "1px 6px",
                      fontWeight: 700,
                      color: active ? "#fff" : "rgba(255,255,255,0.3)",
                      minWidth: 18,
                      textAlign: "center",
                    }}>{tab.count}</span>
                  </button>
                );
              })}
            </div>

            {/* ── TAB CONTENT ── */}
            {loading ? (
              <div style={{
                display: "grid",
                gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                gap: 12,
              }}>
                {Array.from({ length: gridCols * 2 }).map((_, i) => (
                  <div key={i} style={{
                    borderRadius: 12,
                    background: "#0f0f12",
                    aspectRatio: "2/3",
                    overflow: "hidden",
                    position: "relative",
                  }}>
                    <div className="dj-shimmer" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Continue Watching */}
                {activeTab === "continue" && (
                  <div>
                    {CONTINUE_WATCHING.length === 0 ? (
                      <EmptyState tab="continue" />
                    ) : (
                      <>
                        {/* Most urgent — near completion */}
                        {CONTINUE_WATCHING.filter(c => c.progressPercent >= 80).length > 0 && (
                          <div style={{ marginBottom: 28 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                              <Zap size={13} color="#f59e0b" fill="#f59e0b" />
                              <span style={{
                                fontSize: 9.5, letterSpacing: "0.35em", textTransform: "uppercase",
                                color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                              }}>Almost done</span>
                            </div>
                            <div style={{
                              display: "grid",
                              gridTemplateColumns: isMobile ? "1fr" : `repeat(${Math.min(gridCols, CONTINUE_WATCHING.filter(c => c.progressPercent >= 80).length)}, 1fr)`,
                              gap: 10,
                            }}>
                              {CONTINUE_WATCHING.filter(c => c.progressPercent >= 80).map(item => (
                                <ContinueCard key={item.movieId} item={item} isMobile={isMobile} />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Rest */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                          <Clock size={13} color="rgba(255,255,255,0.3)" />
                          <span style={{
                            fontSize: 9.5, letterSpacing: "0.35em", textTransform: "uppercase",
                            color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                          }}>In progress</span>
                        </div>
                        <div style={{
                          display: "grid",
                          gridTemplateColumns: isMobile ? "1fr" : `repeat(${gridCols}, 1fr)`,
                          gap: 10,
                        }}>
                          {CONTINUE_WATCHING.filter(c => c.progressPercent < 80).map(item => (
                            <ContinueCard key={item.movieId} item={item} isMobile={isMobile} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Collection */}
                {activeTab === "paid" && (
                  <div>
                    {PAID_MOVIES.length === 0 ? (
                      <EmptyState tab="paid" />
                    ) : (
                      <>
                        {/* Summary banner */}
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px 16px",
                          background: "rgba(245,158,11,0.06)",
                          border: "1px solid rgba(245,158,11,0.12)",
                          borderRadius: 10,
                          marginBottom: 20,
                          flexWrap: "wrap",
                          gap: 8,
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Crown size={14} color="#f59e0b" />
                            <span style={{
                              fontSize: 12, fontFamily: "'DM Sans', sans-serif",
                              fontWeight: 600, color: "rgba(255,255,255,0.7)",
                            }}>{PAID_MOVIES.length} movies in your collection</span>
                          </div>
                          <span style={{
                            fontSize: 11, fontFamily: "'Bebas Neue', sans-serif",
                            letterSpacing: "0.08em",
                            color: "rgba(255,255,255,0.35)",
                          }}>KES {PAID_MOVIES.reduce((a, p) => a + p.amount, 0).toLocaleString()} total spent</span>
                        </div>

                        <div style={{
                          display: "grid",
                          gridTemplateColumns: isMobile ? "1fr" : `repeat(${gridCols}, 1fr)`,
                          gap: 10,
                        }}>
                          {PAID_MOVIES.map(payment => (
                            <CollectionCard key={payment.$id} payment={payment} isMobile={isMobile} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* History */}
                {activeTab === "history" && (
                  <div>
                    {HISTORY.length === 0 ? (
                      <EmptyState tab="history" />
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {HISTORY.map((item, i) => (
                          <div key={item.movieId} style={{
                            animationDelay: `${i * 40}ms`,
                          }}>
                            <HistoryCard item={item} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile bottom nav */}
        {isSmall && <MobileBottomNav />}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html, body { background: #080808; color: #fff; margin: 0; padding: 0; overflow: hidden; }

        #dj-content-col::-webkit-scrollbar { display: none; }
        #dj-content-col { scrollbar-width: none; }

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
      `}</style>
    </>
  );
}