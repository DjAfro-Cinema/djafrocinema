"use client";

import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { useRouter } from "next/navigation";
import { X, Check, Palette, Settings } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import type { ThemeId } from "@/types/theme.types";

// ── THEME META ──────────────────────────────────────────────────────────────

const THEME_META: Record<ThemeId, {
  label: string; sub: string; accent: string;
  bg: string; surface: string; textOnAccent: string;
}> = {
  netflix:  { label: "Netflix Dark",   sub: "Crimson on black",      accent: "#e50914", bg: "#070709", surface: "#0f0f12", textOnAccent: "#fff" },
  hulu:     { label: "Hulu Dark",      sub: "Electric green",        accent: "#1ce783", bg: "#0a0d0a", surface: "#101510", textOnAccent: "#050d05" },
  prime:    { label: "Prime Dark",     sub: "Sky blue",              accent: "#00a8e1", bg: "#08090d", surface: "#0e1018", textOnAccent: "#fff" },
  amber:    { label: "Amber Dark",     sub: "Warm gold",             accent: "#f5a623", bg: "#090806", surface: "#120f0a", textOnAccent: "#1a0f00" },
  hbo:      { label: "HBO Dark",       sub: "AMOLED + gold",         accent: "#d4a843", bg: "#000000", surface: "#050505", textOnAccent: "#0a0600" },
  rosegold: { label: "Rose Gold Dark", sub: "Blush-copper luxury",   accent: "#e8927c", bg: "#0a0807", surface: "#130e0d", textOnAccent: "#1a0805" },
  cyber:    { label: "Cyberpunk Teal", sub: "Electric teal-cyan",    accent: "#00e5cc", bg: "#030a09", surface: "#071210", textOnAccent: "#001a17" },
};

const THEME_ORDER: ThemeId[] = ["netflix", "hulu", "prime", "amber", "hbo", "rosegold", "cyber"];

// ── PUBLIC HANDLE ────────────────────────────────────────────────────────────

export interface ThemeToggleHandle {
  openDrawer: () => void;
}

// ── COG SVG ─────────────────────────────────────────────────────────────────

function CogIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}

// ── THEME CARD ──────────────────────────────────────────────────────────────

function ThemeCard({ id, active, onSelect }: { id: ThemeId; active: boolean; onSelect: (id: ThemeId) => void }) {
  const meta = THEME_META[id];
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={() => onSelect(id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        width: "100%", padding: "11px 12px", borderRadius: 14,
        border: active
          ? `1.5px solid ${meta.accent}88`
          : hovered ? "1.5px solid rgba(255,255,255,0.08)" : "1.5px solid rgba(255,255,255,0.03)",
        background: active ? `${meta.accent}0e` : hovered ? "rgba(255,255,255,0.025)" : "transparent",
        cursor: "pointer", transition: "all 0.15s ease", textAlign: "left",
      }}
    >
      {/* Swatch */}
      <div style={{
        width: 46, height: 32, borderRadius: 8, flexShrink: 0,
        background: meta.bg, border: "1px solid rgba(255,255,255,0.06)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 10, background: meta.surface }} />
        {[6, 14, 22].map(top => (
          <div key={top} style={{
            position: "absolute", left: 3, top, width: 4, height: 4,
            borderRadius: "50%", background: `${meta.accent}55`,
          }} />
        ))}
        <div style={{
          position: "absolute", left: 3, top: 6, width: 4, height: 4,
          borderRadius: "50%", background: meta.accent,
          boxShadow: `0 0 5px ${meta.accent}`,
        }} />
        <div style={{ position: "absolute", left: 14, top: 7, right: 3, height: 2, borderRadius: 2, background: "rgba(255,255,255,0.12)" }} />
        <div style={{ position: "absolute", left: 14, top: 13, right: 6, height: 2, borderRadius: 2, background: "rgba(255,255,255,0.07)" }} />
        <div style={{ position: "absolute", left: 14, top: 19, right: 9, height: 2, borderRadius: 2, background: "rgba(255,255,255,0.05)" }} />
        <div style={{
          position: "absolute", bottom: 5, right: 4, height: 5, width: 14,
          borderRadius: 3, background: meta.accent, opacity: 0.85,
        }} />
      </div>

      {/* Labels */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12.5, fontWeight: active ? 650 : 500,
          color: active ? meta.accent : "rgba(255,255,255,0.82)",
          fontFamily: "'DM Sans', sans-serif",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          letterSpacing: "-0.01em",
        }}>{meta.label}</div>
        <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.22)", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
          {meta.sub}
        </div>
      </div>

      {/* Active badge */}
      {active ? (
        <div style={{
          width: 18, height: 18, borderRadius: "50%", background: meta.accent,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Check size={10} color={meta.textOnAccent} strokeWidth={3} />
        </div>
      ) : (
        <div style={{
          width: 18, height: 18, borderRadius: "50%",
          border: "1.5px solid rgba(255,255,255,0.10)", flexShrink: 0,
          transition: "border-color 0.15s",
          borderColor: hovered ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.10)",
        }} />
      )}
    </button>
  );
}

// ── MAIN COMPONENT ──────────────────────────────────────────────────────────

const ThemeToggle = forwardRef<ThemeToggleHandle>(function ThemeToggle(_props, ref) {
  const { theme, setThemeId } = useTheme();
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const btnRef    = useRef<HTMLButtonElement>(null);
  const router    = useRouter();

  const acc = theme.tokens.accent;
  const activeMeta = THEME_META[theme.id as ThemeId];

  useImperativeHandle(ref, () => ({
    openDrawer: () => setOpen(true),
  }));

  // Outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        drawerRef.current && !drawerRef.current.contains(e.target as Node) &&
        btnRef.current    && !btnRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  function handleSelect(id: ThemeId) {
    setThemeId(id);
    setTimeout(() => setOpen(false), 250);
  }

  function handleGoToSettings() {
    setOpen(false);
    router.push("/dashboard/settings");
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        @keyframes dj-spin-infinite {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes dj-fab-in {
          from { opacity: 0; transform: translateX(100%); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes dj-pulse-ring {
          0%   { box-shadow: 0 0 0 0 ${acc}44; }
          70%  { box-shadow: 0 0 0 8px ${acc}00; }
          100% { box-shadow: 0 0 0 0 ${acc}00; }
        }

        .dj-fab {
          position: fixed;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          z-index: 960;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 16px 10px 14px;
          border-radius: 24px 0 0 24px;
          border: 1px solid rgba(255,255,255,0.08);
          border-right: none;
          background: rgba(10,10,14,0.96);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          cursor: pointer;
          color: rgba(255,255,255,0.45);
          transition: background 0.18s, border-color 0.18s, color 0.18s, padding 0.18s;
          animation: dj-fab-in 0.5s cubic-bezier(0.25,1,0.5,1) both,
                     dj-pulse-ring 3.5s ease-out 1.5s 2;
        }
        .dj-fab:hover {
          background: rgba(18,18,24,0.99);
          border-color: ${acc}55;
          color: ${acc};
          padding-right: 20px;
        }
        .dj-fab--open {
          background: ${acc}14 !important;
          border-color: ${acc}77 !important;
          color: ${acc} !important;
          padding-right: 20px !important;
        }
        .dj-fab-cog {
          display: flex; align-items: center; justify-content: center;
          animation: dj-spin-infinite 4s linear infinite;
          flex-shrink: 0;
        }
        .dj-fab-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          white-space: nowrap;
          line-height: 1;
        }

        .dj-backdrop {
          position: fixed; inset: 0; z-index: 958;
          background: rgba(0,0,0,0);
          pointer-events: none;
          transition: background 0.28s ease;
        }
        .dj-backdrop--vis {
          background: rgba(0,0,0,0.60);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          pointer-events: all;
        }

        .dj-drawer {
          position: fixed;
          top: 10px; right: 0; bottom: 10px;
          z-index: 959;
          width: 280px;
          border-radius: 28px 0 0 28px;
          background: #0a0a0e;
          border: 1px solid rgba(255,255,255,0.055);
          border-right: none;
          box-shadow: -8px 0 48px rgba(0,0,0,0.70);
          display: flex; flex-direction: column; overflow: hidden;
          transform: translateX(105%);
          transition: transform 0.30s cubic-bezier(0.25,1,0.5,1);
          will-change: transform;
        }
        .dj-drawer--open { transform: translateX(0); }

        .dj-drawer-topline {
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent 0%, ${acc}55 40%, transparent 100%);
          pointer-events: none; z-index: 1;
        }

        .dj-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 16px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.042);
          flex-shrink: 0;
        }
        .dj-head-left { display: flex; align-items: center; gap: 10px; }
        .dj-head-icon {
          width: 32px; height: 32px; border-radius: 9px;
          background: ${acc}15; border: 1px solid ${acc}30;
          display: flex; align-items: center; justify-content: center;
          color: ${acc}; flex-shrink: 0;
        }
        .dj-head-title {
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px; font-weight: 700;
          color: rgba(255,255,255,0.90);
          letter-spacing: -0.01em;
        }
        .dj-head-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: 10px; color: rgba(255,255,255,0.20); margin-top: 1px;
        }
        .dj-close-btn {
          width: 28px; height: 28px; border-radius: 8px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: rgba(255,255,255,0.28);
          transition: all 0.14s; padding: 0; flex-shrink: 0;
        }
        .dj-close-btn:hover { background: rgba(255,255,255,0.09); color: rgba(255,255,255,0.80); }

        .dj-body {
          flex: 1; padding: 10px 10px;
          display: flex; flex-direction: column; gap: 3px;
          overflow-y: auto; overflow-x: hidden; scrollbar-width: none;
        }
        .dj-body::-webkit-scrollbar { display: none; }
        .dj-section-lbl {
          font-family: 'DM Sans', sans-serif;
          font-size: 8px; font-weight: 700;
          letter-spacing: 0.26em; text-transform: uppercase;
          color: rgba(255,255,255,0.12);
          padding: 8px 4px 4px; user-select: none;
        }

        /* ── Settings row — mobile only ── */
        .dj-settings-row {
          display: none;
        }
        .dj-settings-btn {
          display: flex; align-items: center; gap: 12px;
          width: 100%; padding: 11px 12px; border-radius: 14px;
          border: 1.5px solid rgba(255,255,255,0.06);
          background: transparent;
          cursor: pointer; transition: all 0.15s ease; text-align: left;
          color: rgba(255,255,255,0.50);
        }
        .dj-settings-btn:hover {
          border-color: rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.80);
        }
        .dj-settings-icon {
          width: 46px; height: 32px; border-radius: 8px; flex-shrink: 0;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.30);
          transition: color 0.15s;
        }
        .dj-settings-btn:hover .dj-settings-icon {
          color: rgba(255,255,255,0.60);
        }
        .dj-settings-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 12.5px; font-weight: 500;
          letter-spacing: -0.01em;
        }

        .dj-footer {
          border-top: 1px solid rgba(255,255,255,0.042);
          padding: 12px 16px 16px; flex-shrink: 0;
        }
        .dj-footer-swatch {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 5px 12px 5px 7px;
        }
        .dj-footer-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: ${acc}; flex-shrink: 0;
        }
        .dj-footer-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 10.5px; color: rgba(255,255,255,0.28);
        }
        .dj-footer-name {
          font-weight: 600; color: ${acc};
        }

        @media (max-width: 767px) {
          .dj-fab { gap: 6px; padding: 9px 14px 9px 12px; }
          .dj-drawer { width: min(280px, 86vw); }
          .dj-settings-row { display: flex; flex-direction: column; gap: 3px; }
        }
      `}</style>

      {/* Backdrop */}
      <div className={`dj-backdrop${open ? " dj-backdrop--vis" : ""}`} onClick={() => setOpen(false)} />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`dj-drawer${open ? " dj-drawer--open" : ""}`}
        role="dialog" aria-modal="true" aria-label="Theme switcher"
      >
        <div className="dj-drawer-topline" />

        <div className="dj-head">
          <div className="dj-head-left">
            <div className="dj-head-icon"><Palette size={15} strokeWidth={1.8} /></div>
            <div>
              <div className="dj-head-title">Appearance</div>
              <div className="dj-head-sub">Choose your theme</div>
            </div>
          </div>
          <button className="dj-close-btn" onClick={() => setOpen(false)} aria-label="Close">
            <X size={13} strokeWidth={2} />
          </button>
        </div>

        <div className="dj-body">
          <div className="dj-section-lbl">Themes — {THEME_ORDER.length} available</div>

          {THEME_ORDER.map(id => (
            <ThemeCard key={id} id={id} active={theme.id === id} onSelect={handleSelect} />
          ))}

          {/* Settings — mobile only, sits right after the last theme card */}
          <div className="dj-settings-row">
            <div className="dj-section-lbl" style={{ paddingTop: 14 }}>Navigation</div>
            <button className="dj-settings-btn" onClick={handleGoToSettings}>
              <div className="dj-settings-icon">
                <Settings size={14} strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="dj-settings-label">Settings</div>
                <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.18)", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
                  Account, preferences & more
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="dj-footer">
          <div className="dj-footer-swatch">
            <div className="dj-footer-dot" style={{ background: acc }} />
            <span className="dj-footer-text">
              Active: <span className="dj-footer-name">{activeMeta?.label ?? theme.id}</span>
            </span>
          </div>
        </div>
      </div>

      {/* FAB */}
      <button
        ref={btnRef}
        className={`dj-fab${open ? " dj-fab--open" : ""}`}
        onClick={() => setOpen(prev => !prev)}
        aria-label={open ? "Close theme switcher" : "Open theme switcher"}
        title="Appearance"
      >
        <span className="dj-fab-cog"><CogIcon size={17} /></span>
        <span className="dj-fab-label">Theme</span>
      </button>
    </>
  );
});

export default ThemeToggle;