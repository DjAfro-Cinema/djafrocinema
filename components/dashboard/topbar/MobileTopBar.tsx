"use client";

import Link from "next/link";
import { Search, Bell } from "lucide-react";

interface MobileTopBarProps {
  onSearchOpen: () => void;
  notifCount?: number;
  userName: string;
}

export default function MobileTopBar({
  onSearchOpen,
  notifCount = 0,
  userName,
}: MobileTopBarProps) {
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
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "1.2rem",
        letterSpacing: "0.1em",
        display: "flex",
        alignItems: "baseline",
        gap: 2,
        lineHeight: 1,
      }}>
        <span style={{ color: "#e50914" }}>DJ</span>
        <span style={{ color: "#e8e8e8" }}>AFRO</span>
        <span style={{ color: "rgba(255,255,255,0.25)", marginLeft: 4, fontSize: "0.95rem" }}>CINEMA</span>
      </div>

      {/* Right actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Search */}
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

        {/* Notifications */}
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

        {/* Avatar */}
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
            flexShrink: 0,
          }}
        >
          {userName[0]?.toUpperCase()}
        </Link>
      </div>
    </header>
  );
}