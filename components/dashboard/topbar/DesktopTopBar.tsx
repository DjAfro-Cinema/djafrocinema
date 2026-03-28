"use client";

import Link from "next/link";
import { Search, X, Bell } from "lucide-react";

interface DesktopTopBarProps {
  scrolled: boolean;
  searchOpen: boolean;
  searchVal: string;
  onSearchOpen: () => void;
  onSearchClose: () => void;
  onSearchChange: (v: string) => void;
  notifCount?: number;
  userName: string;
}

export default function DesktopTopBar({
  scrolled,
  searchOpen,
  searchVal,
  onSearchOpen,
  onSearchClose,
  onSearchChange,
  notifCount = 0,
  userName,
}: DesktopTopBarProps) {
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
        WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none",
        transition: "background 0.3s, border-bottom 0.3s",
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
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "rgba(255,255,255,0.3)", display: "flex", padding: 0,
              }}
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
              fontSize: 12.5,
              fontFamily: "'DM Sans', sans-serif",
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

      {/* Right actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Notifications */}
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

        {/* Avatar */}
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
            flexShrink: 0,
          }}
        >
          {userName[0]?.toUpperCase()}
        </Link>
      </div>
    </header>
  );
}