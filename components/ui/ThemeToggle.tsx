"use client";

import { useState, useEffect, useRef } from "react";
import { X, Check, Palette } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import type { ThemeId } from "@/types/theme.types";

// ── THEME META ─────────────────────────────────────────────────────────────

const THEME_META: Record<
  ThemeId,
  { label: string; sub: string; accent: string; bg: string; surface: string }
> = {
  netflix: {
    label:   "Netflix Dark",
    sub:     "Classic crimson",
    accent:  "#e50914",
    bg:      "#070709",
    surface: "#0f0f12",
  },
  hulu: {
    label:   "Hulu Dark",
    sub:     "Electric green",
    accent:  "#1ce783",
    bg:      "#0a0d0a",
    surface: "#101510",
  },
  prime: {
    label:   "Prime Dark",
    sub:     "Sky blue",
    accent:  "#00a8e1",
    bg:      "#08090d",
    surface: "#0e1018",
  },
  amber: {
    label:   "Amber Dark",
    sub:     "Warm gold",
    accent:  "#f5a623",
    bg:      "#090806",
    surface: "#120f0a",
  },
  amoled: {
    label:   "AMOLED Dark",
    sub:     "Pure black",
    accent:  "#c084fc",
    bg:      "#000000",
    surface: "#080808",
  },
};

const THEME_ORDER: ThemeId[] = ["netflix", "hulu", "prime", "amber", "amoled"];

// ── COG SVG ────────────────────────────────────────────────────────────────

function CogIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}

// ── THEME CARD ─────────────────────────────────────────────────────────────

function ThemeCard({
  id,
  active,
  onSelect,
}: {
  id: ThemeId;
  active: boolean;
  onSelect: (id: ThemeId) => void;
}) {
  const meta = THEME_META[id];
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={() => onSelect(id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:        "flex",
        alignItems:     "center",
        gap:            14,
        width:          "100%",
        padding:        "13px 14px",
        borderRadius:   12,
        border:         active
          ? `1.5px solid ${meta.accent}`
          : hovered
          ? "1.5px solid rgba(255,255,255,0.09)"
          : "1.5px solid rgba(255,255,255,0.04)",
        background: active
          ? `${meta.accent}12`
          : hovered
          ? "rgba(255,255,255,0.03)"
          : "rgba(255,255,255,0.01)",
        cursor:     "pointer",
        transition: "all 0.16s ease",
        textAlign:  "left",
      }}
    >
      {/* Swatch */}
      <div style={{
        width:        52,
        height:       36,
        borderRadius: 8,
        background:   meta.bg,
        border:       "1px solid rgba(255,255,255,0.07)",
        flexShrink:   0,
        position:     "relative",
        overflow:     "hidden",
      }}>
        <div style={{
          position:   "absolute",
          bottom:     0, left: 0, right: 0,
          height:     "42%",
          background: meta.surface,
        }} />
        <div style={{
          position:     "absolute",
          top:          "50%",
          left:         "50%",
          transform:    "translate(-50%, -62%)",
          width:        9,
          height:       9,
          borderRadius: "50%",
          background:   meta.accent,
          boxShadow:    `0 0 7px ${meta.accent}`,
        }} />
      </div>

      {/* Labels */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize:     13,
          fontWeight:   active ? 600 : 500,
          color:        active ? meta.accent : "rgba(255,255,255,0.80)",
          fontFamily:   "'DM Sans', sans-serif",
          whiteSpace:   "nowrap",
          overflow:     "hidden",
          textOverflow: "ellipsis",
          letterSpacing: "0.01em",
        }}>
          {meta.label}
        </div>
        <div style={{
          fontSize:   11,
          color:      "rgba(255,255,255,0.24)",
          fontFamily: "'DM Sans', sans-serif",
          marginTop:  3,
        }}>
          {meta.sub}
        </div>
      </div>

      {/* Active check */}
      {active && (
        <div style={{
          width:          20,
          height:         20,
          borderRadius:   "50%",
          background:     meta.accent,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          flexShrink:     0,
          boxShadow:      `0 0 10px ${meta.accent}88`,
        }}>
          <Check size={11} color="#fff" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}

// ── DRAWER BORDER RADIUS ───────────────────────────────────────────────────
// Mirrors the sidebar exactly — rounded on the joining side only.
// Sidebar: "0 32px 32px 0" (left panel, right side rounded)
// Drawer:  "32px 0 0 32px" (right panel, left side rounded)
const DRAWER_RADIUS = "32px 0 0 32px";

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────

export default function ThemeToggle() {
  const { theme, setThemeId } = useTheme();
  const [open, setOpen] = useState(false);
  const [spin, setSpin] = useState(false);
  const drawerRef       = useRef<HTMLDivElement>(null);
  const btnRef          = useRef<HTMLButtonElement>(null);

  const acc = theme.tokens.accent;

  // Outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (
        drawerRef.current && !drawerRef.current.contains(e.target as Node) &&
        btnRef.current    && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  function toggle() {
    setSpin(true);
    setTimeout(() => setSpin(false), 500);
    setOpen(prev => !prev);
  }

  function handleSelect(id: ThemeId) {
    setThemeId(id);
    setTimeout(() => setOpen(false), 300);
  }

  return (
    <>
      <style>{`
        @keyframes dj-cog-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(180deg); }
        }
        @keyframes dj-fab-pulse {
          0%   { box-shadow: 0 0 0 0    ${acc}55; }
          70%  { box-shadow: 0 0 0 10px ${acc}00; }
          100% { box-shadow: 0 0 0 0    ${acc}00; }
        }
        @keyframes dj-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes dj-flicker {
          0%, 94%, 100% { opacity: 1; }
          95%            { opacity: 0.93; }
          97%            { opacity: 1; }
          98.5%          { opacity: 0.96; }
        }
        @keyframes dj-dot-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.5; transform: scale(0.78); }
        }

        /* FAB */
        .dj-fab {
          position: fixed;
          right: 20px;
          bottom: 92px;
          z-index: 960;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.09);
          background: rgba(12,12,16,0.94);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: rgba(255,255,255,0.48);
          padding: 0;
          transition: background 0.18s, border-color 0.18s, color 0.18s, transform 0.18s;
          animation: dj-fab-pulse 3s ease-out 1.2s 2;
        }
        .dj-fab:hover {
          background: rgba(20,20,26,0.98);
          border-color: ${acc}66;
          color: ${acc};
          transform: scale(1.08);
        }
        .dj-fab--open {
          background: ${acc}1a !important;
          border-color: ${acc}99 !important;
          color: ${acc} !important;
          transform: scale(1.04) !important;
        }
        .dj-fab-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .dj-fab-icon--spin {
          animation: dj-cog-spin 0.45s cubic-bezier(0.34,1.2,0.64,1) forwards;
        }

        /* Backdrop */
        .dj-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0);
          z-index: 958;
          pointer-events: none;
          transition: background 0.3s ease, backdrop-filter 0.3s ease;
        }
        .dj-backdrop--vis {
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          pointer-events: all;
        }

        /* Drawer */
        .dj-drawer {
          position: fixed;
          top: 10px;
          right: 0;
          bottom: 10px;
          z-index: 959;
          width: 288px;
          border-radius: ${DRAWER_RADIUS};
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transform: translateX(100%);
          transition: transform 0.32s cubic-bezier(0.25, 1, 0.5, 1);
          will-change: transform;
        }
        .dj-drawer--open {
          transform: translateX(0);
        }

        /* Drawer bg layers */
        .dj-drawer-bg {
          position: absolute;
          inset: 0;
          border-radius: ${DRAWER_RADIUS};
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }
        .dj-drawer-base {
          position: absolute;
          inset: 0;
          background: linear-gradient(160deg, #111115 0%, #0b0b0e 55%, #0e0b0b 100%);
          animation: dj-flicker 9s ease-in-out infinite;
        }
        .dj-drawer-noise {
          position: absolute;
          inset: 0;
          opacity: 0.04;
        }
        .dj-drawer-glow-top {
          position: absolute;
          top: -40px;
          right: -20px;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle, ${acc}18 0%, transparent 70%);
          pointer-events: none;
        }
        .dj-drawer-glow-bot {
          position: absolute;
          bottom: 60px;
          left: -30px;
          width: 160px;
          height: 160px;
          border-radius: 50%;
          background: radial-gradient(circle, ${acc}0d 0%, transparent 70%);
          pointer-events: none;
        }
        .dj-drawer-border {
          position: absolute;
          inset: 0;
          border-radius: ${DRAWER_RADIUS};
          border: 1px solid rgba(255,255,255,0.055);
          border-right: none;
          pointer-events: none;
        }
        .dj-drawer-shadow {
          position: absolute;
          inset: 0;
          border-radius: ${DRAWER_RADIUS};
          box-shadow: -6px 0 40px rgba(0,0,0,0.65), inset 1px 0 0 rgba(255,255,255,0.02);
          pointer-events: none;
        }

        /* Shimmer hairlines */
        .dj-hairline-top {
          position: absolute;
          top: 0;
          left: 0;
          right: 15%;
          height: 1px;
          z-index: 1;
          background: linear-gradient(90deg, transparent 0%, ${acc}88 25%, rgba(255,180,180,0.9) 55%, ${acc}bb 80%, transparent 100%);
          background-size: 200% 100%;
          animation: dj-shimmer 3.5s ease-in-out infinite;
          pointer-events: none;
          box-shadow: 0 0 10px ${acc}55;
        }
        .dj-hairline-bot {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 15%;
          height: 1px;
          z-index: 1;
          background: linear-gradient(90deg, transparent 0%, ${acc}66 25%, rgba(255,180,180,0.7) 55%, ${acc}99 80%, transparent 100%);
          background-size: 200% 100%;
          animation: dj-shimmer 3.5s ease-in-out infinite;
          animation-delay: 1.75s;
          pointer-events: none;
          box-shadow: 0 0 8px ${acc}44;
        }

        /* Content */
        .dj-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        /* Head */
        .dj-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 22px 18px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.045);
          flex-shrink: 0;
        }
        .dj-head-left {
          display: flex;
          align-items: center;
          gap: 11px;
        }
        .dj-head-icon {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: ${acc}18;
          border: 1px solid ${acc}33;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${acc};
          flex-shrink: 0;
        }
        .dj-head-title {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: rgba(255,255,255,0.90);
          letter-spacing: -0.01em;
        }
        .dj-head-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          color: rgba(255,255,255,0.20);
          margin-top: 2px;
        }
        .dj-close-btn {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: rgba(255,255,255,0.28);
          transition: all 0.14s;
          padding: 0;
          flex-shrink: 0;
        }
        .dj-close-btn:hover {
          background: rgba(255,255,255,0.09);
          color: rgba(255,255,255,0.80);
        }

        /* Body */
        .dj-body {
          flex: 1;
          padding: 12px 12px;
          display: flex;
          flex-direction: column;
          gap: 5px;
          overflow-y: auto;
          overflow-x: hidden;
          scrollbar-width: none;
        }
        .dj-body::-webkit-scrollbar { display: none; }

        .dj-section-lbl {
          font-family: 'DM Sans', sans-serif;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.12);
          padding: 6px 4px 4px;
          user-select: none;
        }

        /* Footer */
        .dj-footer {
          border-top: 1px solid rgba(255,255,255,0.045);
          padding: 14px 18px 20px;
          flex-shrink: 0;
        }
        .dj-footer-row {
          display: flex;
          align-items: center;
          gap: 9px;
        }
        .dj-footer-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: ${acc};
          box-shadow: 0 0 8px ${acc};
          flex-shrink: 0;
          animation: dj-dot-pulse 2s ease-in-out infinite;
        }
        .dj-footer-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          color: rgba(255,255,255,0.26);
        }
        .dj-footer-name {
          font-weight: 600;
          color: ${acc};
        }

        /* Mobile */
        @media (max-width: 767px) {
          .dj-fab {
            right: 16px;
            bottom: 84px;
          }
          .dj-drawer {
            top: 0;
            bottom: 0;
            width: min(300px, 84vw);
            border-radius: 28px 0 0 28px;
          }
          .dj-drawer-bg,
          .dj-drawer-border,
          .dj-drawer-shadow {
            border-radius: 28px 0 0 28px;
          }
        }
      `}</style>

      {/* Backdrop */}
      <div
        className={`dj-backdrop${open ? " dj-backdrop--vis" : ""}`}
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`dj-drawer${open ? " dj-drawer--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Theme switcher"
      >
        {/* Background */}
        <div className="dj-drawer-bg">
          <div className="dj-drawer-base" />
          <svg className="dj-drawer-noise" xmlns="http://www.w3.org/2000/svg">
            <filter id="dj-noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#dj-noise)" />
          </svg>
          <div className="dj-drawer-glow-top" />
          <div className="dj-drawer-glow-bot" />
          <div className="dj-drawer-border" />
          <div className="dj-drawer-shadow" />
        </div>

        {/* Shimmer hairlines */}
        <div className="dj-hairline-top" />
        <div className="dj-hairline-bot" />

        {/* Content */}
        <div className="dj-content">

          {/* Head */}
          <div className="dj-head">
            <div className="dj-head-left">
              <div className="dj-head-icon">
                <Palette size={16} strokeWidth={1.8} />
              </div>
              <div>
                <div className="dj-head-title">Appearance</div>
                <div className="dj-head-sub">Choose your theme</div>
              </div>
            </div>
            <button
              className="dj-close-btn"
              onClick={() => setOpen(false)}
              aria-label="Close theme panel"
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>

          {/* Body */}
          <div className="dj-body">
            <div className="dj-section-lbl">Themes</div>
            {THEME_ORDER.map(id => (
              <ThemeCard
                key={id}
                id={id}
                active={theme.id === id}
                onSelect={handleSelect}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="dj-footer">
            <div className="dj-footer-row">
              <div className="dj-footer-dot" />
              <span className="dj-footer-label">
                Active:{" "}
                <span className="dj-footer-name">
                  {THEME_META[theme.id as ThemeId]?.label ?? theme.id}
                </span>
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* FAB */}
      <button
        ref={btnRef}
        className={`dj-fab${open ? " dj-fab--open" : ""}`}
        onClick={toggle}
        aria-label={open ? "Close theme switcher" : "Open theme switcher"}
        title="Appearance"
      >
        <span className={`dj-fab-icon${spin ? " dj-fab-icon--spin" : ""}`}>
          <CogIcon size={20} />
        </span>
      </button>
    </>
  );
}