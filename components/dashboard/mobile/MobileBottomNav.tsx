"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

// ── Custom SVG icons — no generic lucide shapes ───────────────────────────────

function IconHome({ active }: { active: boolean }) {
  const c = active ? "#ff3d3d" : "rgba(255,255,255,0.32)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H15v-5h-6v5H4a1 1 0 01-1-1V10.5z"
        stroke={c} strokeWidth={active ? 1.8 : 1.4} strokeLinejoin="round"
        fill={active ? "rgba(229,9,20,0.12)" : "none"} />
      <path d="M9 22V16h6v6" stroke={c} strokeWidth={active ? 1.8 : 1.4} strokeLinecap="round" />
    </svg>
  );
}

function IconFilm({ active }: { active: boolean }) {
  const c = active ? "#ff3d3d" : "rgba(255,255,255,0.32)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="4" width="20" height="16" rx="2"
        stroke={c} strokeWidth={active ? 1.8 : 1.4}
        fill={active ? "rgba(229,9,20,0.10)" : "none"} />
      <path d="M7 4v16M17 4v16" stroke={c} strokeWidth={active ? 1.8 : 1.4} />
      <path d="M2 8.5h3M2 15.5h3M19 8.5h3M19 15.5h3" stroke={c} strokeWidth={active ? 2 : 1.6} strokeLinecap="round" />
      <path d="M10.5 9.5l4 2.5-4 2.5V9.5z" fill={c} />
    </svg>
  );
}

function IconCompass({ active }: { active: boolean }) {
  const c = active ? "#ff3d3d" : "rgba(255,255,255,0.32)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={c} strokeWidth={active ? 1.8 : 1.4}
        fill={active ? "rgba(229,9,20,0.08)" : "none"} />
      <path d="M16.5 7.5l-2.8 5.6-5.2 1.4 2.8-5.6 5.2-1.4z"
        stroke={c} strokeWidth={active ? 1.6 : 1.3} strokeLinejoin="round"
        fill={active ? "rgba(229,9,20,0.25)" : "none"} />
      <circle cx="12" cy="12" r="1.2" fill={c} />
    </svg>
  );
}

function IconLibrary({ active }: { active: boolean }) {
  const c = active ? "#ff3d3d" : "rgba(255,255,255,0.32)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="5" height="16" rx="1"
        stroke={c} strokeWidth={active ? 1.8 : 1.4}
        fill={active ? "rgba(229,9,20,0.12)" : "none"} />
      <rect x="10" y="4" width="4" height="16" rx="1"
        stroke={c} strokeWidth={active ? 1.8 : 1.4}
        fill={active ? "rgba(229,9,20,0.08)" : "none"} />
      <path d="M16.5 4.5l3.8 15.2" stroke={c} strokeWidth={active ? 1.8 : 1.4} strokeLinecap="round" />
      <path d="M17 7.5l3 1M17.5 10.5l3 1" stroke={c} strokeWidth={1.2} strokeLinecap="round" />
    </svg>
  );
}

function IconProfile({ active }: { active: boolean }) {
  const c = active ? "#ff3d3d" : "rgba(255,255,255,0.32)";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.5" stroke={c} strokeWidth={active ? 1.8 : 1.4}
        fill={active ? "rgba(229,9,20,0.12)" : "none"} />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
        stroke={c} strokeWidth={active ? 1.8 : 1.4} strokeLinecap="round" />
    </svg>
  );
}

// ── Tab config ────────────────────────────────────────────────────────────────

const TABS = [
  { label: "Home",     href: "/dashboard",          Icon: IconHome    },
  { label: "Movies",   href: "/dashboard/movies",   Icon: IconFilm    },
  { label: "Discover", href: "/dashboard/discover", Icon: IconCompass },
  { label: "Library",  href: "/dashboard/library",  Icon: IconLibrary },
  { label: "Profile",  href: "/dashboard/profile",  Icon: IconProfile },
];

// ── Component ────────────────────────────────────────────────────────────────

export default function MobileBottomNav() {
  const pathname = usePathname() ?? "";
  const [pressed, setPressed] = useState<string | null>(null);

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  return (
    <>
      <style>{`
        @keyframes arcPulse {
          0%, 100% { opacity: 1; transform: translateX(-50%) scaleX(1); }
          50%       { opacity: 0.6; transform: translateX(-50%) scaleX(0.7); }
        }
        @keyframes glowBreathe {
          0%, 100% { opacity: 0.7; }
          50%       { opacity: 1; }
        }
        @keyframes dotPop {
          0%   { transform: translateX(-50%) scale(0); opacity: 0; }
          60%  { transform: translateX(-50%) scale(1.3); opacity: 1; }
          100% { transform: translateX(-50%) scale(1); opacity: 1; }
        }
        @keyframes tabPress {
          0%   { transform: scale(1); }
          40%  { transform: scale(0.88); }
          100% { transform: scale(1); }
        }
        @keyframes navSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes grainShift {
          0%   { transform: translate(0,0); }
          20%  { transform: translate(-1px,1px); }
          40%  { transform: translate(1px,-1px); }
          60%  { transform: translate(-1px,0); }
          80%  { transform: translate(1px,1px); }
          100% { transform: translate(0,0); }
        }
      `}</style>

      {/* Spacer so content isn't hidden behind nav */}
      <div style={{ height: "calc(72px + env(safe-area-inset-bottom))" }} aria-hidden />

      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 900,
          paddingBottom: "env(safe-area-inset-bottom)",
          animation: "navSlideUp 0.5s cubic-bezier(0.34,1.2,0.64,1) both",
        }}
      >
        {/* Outer container — floating pill */}
        <div style={{
          margin: "0 10px 10px",
          borderRadius: 28,
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 -2px 40px rgba(0,0,0,0.7), 0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)",
        }}>

          {/* Glass base */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(160deg, rgba(18,16,16,0.97) 0%, rgba(10,10,13,0.98) 60%, rgba(14,10,10,0.97) 100%)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
          }} />

          {/* Film grain overlay */}
          <div style={{
            position: "absolute", inset: -50,
            opacity: 0.035,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            animation: "grainShift 0.15s steps(1) infinite",
            pointerEvents: "none",
          }} />

          {/* Red ambient glow center */}
          <div style={{
            position: "absolute",
            bottom: -20, left: "50%", transform: "translateX(-50%)",
            width: 200, height: 80, borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(229,9,20,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
            animation: "glowBreathe 3s ease-in-out infinite",
          }} />

          {/* Top edge shimmer */}
          <div style={{
            position: "absolute", top: 0, left: "10%", right: "10%", height: 1,
            background: "linear-gradient(90deg, transparent, rgba(229,9,20,0.6) 30%, rgba(255,100,100,0.9) 50%, rgba(229,9,20,0.6) 70%, transparent)",
            pointerEvents: "none",
          }} />

          {/* Tab row */}
          <div style={{
            position: "relative", zIndex: 2,
            display: "flex",
            alignItems: "stretch",
            height: 64,
          }}>
            {TABS.map(({ label, href, Icon }) => {
              const active = isActive(href);
              const isPressed = pressed === href;

              return (
                <Link
                  key={href}
                  href={href}
                  onPointerDown={() => setPressed(href)}
                  onPointerUp={() => setPressed(null)}
                  onPointerLeave={() => setPressed(null)}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                    textDecoration: "none",
                    position: "relative",
                    WebkitTapHighlightColor: "transparent",
                    userSelect: "none",
                    animation: isPressed ? "tabPress 0.25s ease forwards" : "none",
                  }}
                >
                  {/* Active top arc indicator */}
                  {active && (
                    <span style={{
                      position: "absolute",
                      top: 0,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 36,
                      height: 3,
                      borderRadius: "0 0 6px 6px",
                      background: "linear-gradient(90deg, rgba(229,9,20,0.4), #ff3d3d, rgba(229,9,20,0.4))",
                      boxShadow: "0 0 10px rgba(229,9,20,0.9), 0 0 24px rgba(229,9,20,0.5)",
                      animation: "arcPulse 2.5s ease-in-out infinite",
                    }} />
                  )}

                  {/* Active glow blob behind icon */}
                  {active && (
                    <span style={{
                      position: "absolute",
                      top: "50%", left: "50%",
                      transform: "translate(-50%, -55%)",
                      width: 48, height: 48,
                      borderRadius: "50%",
                      background: "radial-gradient(circle, rgba(229,9,20,0.18) 0%, transparent 70%)",
                      animation: "glowBreathe 2s ease-in-out infinite",
                      pointerEvents: "none",
                    }} />
                  )}

                  {/* Icon */}
                  <div style={{
                    position: "relative", zIndex: 1,
                    transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                    transform: active ? "translateY(-1px) scale(1.08)" : "scale(1)",
                  }}>
                    <Icon active={active} />
                  </div>

                  {/* Label */}
                  <span style={{
                    fontSize: 9,
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: active ? 700 : 400,
                    letterSpacing: active ? "0.08em" : "0.04em",
                    textTransform: "uppercase",
                    color: active ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.22)",
                    transition: "color 0.18s, letter-spacing 0.18s",
                    position: "relative", zIndex: 1,
                    lineHeight: 1,
                  }}>
                    {label}
                  </span>

                  {/* Active dot under label */}
                  {active && (
                    <span style={{
                      position: "absolute",
                      bottom: 6, left: "50%",
                      width: 3, height: 3, borderRadius: "50%",
                      background: "#e50914",
                      boxShadow: "0 0 6px rgba(229,9,20,1)",
                      animation: "dotPop 0.35s cubic-bezier(0.34,1.56,0.64,1) both",
                    }} />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}