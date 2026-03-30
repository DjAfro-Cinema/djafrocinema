"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Palette, Type, Share2, AlertCircle, Bell,
  ChevronRight, Check, X, Copy, ExternalLink,
  MessageCircle, Send, Monitor, Smartphone,
  Globe, Shield, Info, Minus, Plus,
  Volume2, VolumeX, Play, Wifi, WifiOff,
  Moon, Sun, Zap, Eye, EyeOff,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import DashboardSidebar from "@/components/dashboard/sidebar/DashboardSidebar";
import MobileBottomNav from "@/components/dashboard/mobile/MobileBottomNav";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const WHATSAPP_SUPPORT = "https://wa.me/254711263923";
const APP_URL = typeof window !== "undefined" ? window.location.origin : "https://djafro.tv";
const FONT_SIZE_KEY = "djafro_font_size";
const AUTOPLAY_KEY  = "djafro_autoplay";
const MUTE_KEY      = "djafro_mute_trailers";
const QUALITY_KEY   = "djafro_quality";

const FONT_SIZES = [
  { id: "sm",  label: "Small",   scale: 0.875 },
  { id: "md",  label: "Medium",  scale: 1     },
  { id: "lg",  label: "Large",   scale: 1.125 },
  { id: "xl",  label: "X-Large", scale: 1.25  },
];

const QUALITY_OPTIONS = [
  { id: "auto", label: "Auto",  desc: "Adjusts to your connection" },
  { id: "1080", label: "1080p", desc: "Full HD — best quality"     },
  { id: "720",  label: "720p",  desc: "HD — balanced"              },
  { id: "480",  label: "480p",  desc: "SD — saves data"            },
];

// ─────────────────────────────────────────────────────────────────────────────
// SECTION HEADER
// ─────────────────────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="sh">
      <div className="sh-ico"><Icon size={13} strokeWidth={1.8} /></div>
      <span className="sh-lbl">{label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SETTING ROW  (simple toggle / chevron row)
// ─────────────────────────────────────────────────────────────────────────────
function SettingRow({
  icon: Icon, title, subtitle, right, onClick, danger,
}: {
  icon: React.ElementType; title: string; subtitle?: string;
  right?: React.ReactNode; onClick?: () => void; danger?: boolean;
}) {
  return (
    <div
      className={`srow${onClick ? " srow--click" : ""}${danger ? " srow--danger" : ""}`}
      onClick={onClick}
    >
      <div className="srow-ico"><Icon size={14} strokeWidth={1.8} /></div>
      <div className="srow-body">
        <p className="srow-t">{title}</p>
        {subtitle && <p className="srow-s">{subtitle}</p>}
      </div>
      {right && <div className="srow-right">{right}</div>}
      {onClick && !right && <ChevronRight size={14} className="srow-caret" />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOGGLE
// ─────────────────────────────────────────────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      className={`toggle${on ? " toggle--on" : ""}`}
      onClick={e => { e.stopPropagation(); onChange(!on); }}
      aria-pressed={on}
    >
      <span className="toggle-knob" />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// THEME CARD
// ─────────────────────────────────────────────────────────────────────────────
function ThemeCard({
  th, active, onSelect,
}: {
  th: { id: string; name: string; description: string; tokens: { accent: string; bgBase: string; bgSurface: string; accentGlow: string; accentLight: string } };
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={`tcard${active ? " tcard--on" : ""}`}
      onClick={onSelect}
      style={{
        "--tc-accent": th.tokens.accent,
        "--tc-bg": th.tokens.bgBase,
        "--tc-surf": th.tokens.bgSurface,
        "--tc-glow": th.tokens.accentGlow,
        "--tc-light": th.tokens.accentLight,
      } as React.CSSProperties}
    >
      {/* mini UI preview */}
      <div className="tcard-preview">
        <div className="tcp-bg" />
        <div className="tcp-sidebar">
          <div className="tcp-dot" />
          <div className="tcp-dot" />
          <div className="tcp-dot" />
          <div className="tcp-dot tcp-dot--accent" />
        </div>
        <div className="tcp-content">
          <div className="tcp-bar tcp-bar--w70" />
          <div className="tcp-bar tcp-bar--w45" />
          <div className="tcp-hero" />
          <div className="tcp-bar tcp-bar--w55" />
        </div>
        {active && (
          <div className="tcard-check">
            <Check size={9} />
          </div>
        )}
      </div>
      <div className="tcard-foot">
        <span className="tcard-dot" />
        <span className="tcard-name">{th.name}</span>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARE DRAWER
// ─────────────────────────────────────────────────────────────────────────────
function ShareDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  function copyLink() {
    navigator.clipboard.writeText(APP_URL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  }

  async function nativeShare() {
    try {
      await navigator.share({
        title: "DjAfro — Stream Movies & Shows",
        text: "Watch the latest movies and shows on DjAfro. Check it out!",
        url: APP_URL,
      });
    } catch { /* user cancelled */ }
  }

  const shareTargets = [
    {
      label: "WhatsApp",
      color: "#25D366",
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodeURIComponent(`🎬 Watch movies on DjAfro!\n${APP_URL}`)}`,
    },
    {
      label: "Telegram",
      color: "#2AABEE",
      icon: Send,
      href: `https://t.me/share/url?url=${encodeURIComponent(APP_URL)}&text=${encodeURIComponent("🎬 Watch movies on DjAfro!")}`,
    },
    {
      label: "X / Twitter",
      color: "#fff",
      icon: Globe,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`🎬 Just found DjAfro — the best way to stream movies!\n${APP_URL}`)}`,
    },
    {
      label: "Facebook",
      color: "#1877F2",
      icon: Globe,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(APP_URL)}`,
    },
  ];

  return (
    <>
      <div className={`drawer-backdrop${open ? " drawer-backdrop--vis" : ""}`} onClick={onClose} />
      <div className={`drawer${open ? " drawer--open" : ""}`}>
        <div className="drawer-head">
          <p className="drawer-title">Share DjAfro</p>
          <button className="drawer-close" onClick={onClose}><X size={15} /></button>
        </div>
        <div className="drawer-body">
          <p className="drawer-hint">
            Share the app with friends so they can enjoy movies too!
          </p>

          {/* Link copy */}
          <div className="share-link-box">
            <span className="share-link-url">{APP_URL}</span>
            <button className={`copy-btn${copied ? " copy-btn--done" : ""}`} onClick={copyLink}>
              {copied ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> Copy Link</>}
            </button>
          </div>

          {/* Native share (mobile) */}
          {canNativeShare && (
            <button className="native-share-btn" onClick={nativeShare}>
              <Share2 size={14} /> Share via…
            </button>
          )}

          {/* Share targets */}
          <p className="share-targets-lbl">Share on</p>
          <div className="share-targets">
            {shareTargets.map(t => (
              <a
                key={t.label}
                href={t.href}
                target="_blank"
                rel="noreferrer"
                className="share-target"
                style={{ "--st-color": t.color } as React.CSSProperties}
              >
                <div className="st-ico"><t.icon size={16} /></div>
                <span className="st-lbl">{t.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORT DRAWER
// ─────────────────────────────────────────────────────────────────────────────
function ReportDrawer({ open, onClose, user }: {
  open: boolean; onClose: () => void;
  user: { name?: string; email?: string } | null;
}) {
  const [type, setType]   = useState("bug");
  const [desc, setDesc]   = useState("");
  const [sent, setSent]   = useState(false);
  const [focused, setFocused] = useState(false);

  const types = [
    { id: "bug",       label: "Bug / Broken feature" },
    { id: "playback",  label: "Video not playing"    },
    { id: "missing",   label: "Missing content"      },
    { id: "account",   label: "Account issue"        },
    { id: "other",     label: "Other"                },
  ];

  function send() {
    if (!desc.trim()) return;
    const msg = `🐛 *Issue Report — DjAfro*\n\n*Type:* ${types.find(t => t.id === type)?.label}\n*User:* ${user?.name ?? "Guest"} (${user?.email ?? "n/a"})\n\n*Description:*\n${desc.trim()}`;
    const url = `https://wa.me/254711263923?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    setSent(true);
    setTimeout(() => { setSent(false); setDesc(""); onClose(); }, 2000);
  }

  return (
    <>
      <div className={`drawer-backdrop${open ? " drawer-backdrop--vis" : ""}`} onClick={onClose} />
      <div className={`drawer${open ? " drawer--open" : ""}`}>
        <div className="drawer-head">
          <p className="drawer-title">Report an Issue</p>
          <button className="drawer-close" onClick={onClose}><X size={15} /></button>
        </div>
        <div className="drawer-body">
          <p className="drawer-hint">
            Found something broken? Tell us and we'll fix it ASAP.
            Reports go directly to our WhatsApp.
          </p>

          {/* Type selector */}
          <div className="field-wrap">
            <label className="field-lbl">Issue type</label>
            <div className="select-wrap">
              <select
                className="field-select"
                value={type}
                onChange={e => setType(e.target.value)}
              >
                {types.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
              <ChevronDown size={13} className="select-caret" />
            </div>
          </div>

          {/* Description */}
          <div className="field-wrap">
            <label className="field-lbl">Describe the issue *</label>
            <textarea
              className={`field-textarea${focused ? " field-textarea--on" : ""}`}
              placeholder="e.g. Movie X stops at 00:45, error message says…"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              rows={4}
            />
          </div>

          <p className="report-note">
            <MessageCircle size={11} />
            This will open WhatsApp with your report pre-filled. You can send directly.
          </p>
        </div>
        <div className="drawer-foot">
          <button className="act-btn act-btn--ghost" onClick={onClose}>Cancel</button>
          <button
            className={`act-btn act-btn--solid${sent ? " act-btn--done" : ""}`}
            onClick={send}
            disabled={!desc.trim() || sent}
          >
            {sent
              ? <><Check size={12} /> Opening WhatsApp…</>
              : <><Send size={12} /> Send Report</>}
          </button>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const layout = useDashboardLayout();
  const { user } = useAuth();
  const { theme, themes, setThemeId } = useTheme();
  const router = useRouter();

  const {
    isMobile, isSmall,
    sidebarCollapsed, setSidebarCollapsed,
  } = layout;

  // ── Persisted prefs ──────────────────────────────────────────────────────
  const [fontSize,      setFontSizeState]   = useState("md");
  const [autoplay,      setAutoplayState]   = useState(true);
  const [muteTrailers,  setMuteState]       = useState(false);
  const [quality,       setQualityState]    = useState("auto");

  // Load from localStorage once
  useEffect(() => {
    if (typeof window === "undefined") return;
    const fs = localStorage.getItem(FONT_SIZE_KEY);
    const ap = localStorage.getItem(AUTOPLAY_KEY);
    const mt = localStorage.getItem(MUTE_KEY);
    const q  = localStorage.getItem(QUALITY_KEY);
    if (fs) setFontSizeState(fs);
    if (ap !== null) setAutoplayState(ap === "true");
    if (mt !== null) setMuteState(mt === "true");
    if (q) setQualityState(q);
  }, []);

  // Apply font size to root
  useEffect(() => {
    const fs = FONT_SIZES.find(f => f.id === fontSize);
    if (fs) document.documentElement.style.setProperty("--dj-font-scale", String(fs.scale));
  }, [fontSize]);

  function setFontSize(id: string) {
    setFontSizeState(id);
    localStorage.setItem(FONT_SIZE_KEY, id);
  }
  function setAutoplay(v: boolean) {
    setAutoplayState(v);
    localStorage.setItem(AUTOPLAY_KEY, String(v));
  }
  function setMute(v: boolean) {
    setMuteState(v);
    localStorage.setItem(MUTE_KEY, String(v));
  }
  function setQuality(id: string) {
    setQualityState(id);
    localStorage.setItem(QUALITY_KEY, id);
  }

  // ── Drawer state ─────────────────────────────────────────────────────────
  const [shareOpen,  setShareOpen]  = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const displayName  = user?.name  ?? "Guest";
  const displayEmail = user?.email ?? "";

  return (
    <>
      <style>{CSS}</style>

      <div className="root">
        {!isSmall && (
          <DashboardSidebar
            user={{ name: displayName, email: displayEmail }}
            collapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
          />
        )}

        <div className="col">
          <div className="page">

            {/* ── PAGE HEADER ── */}
            <div className="page-header" style={{ padding: isSmall ? "28px 16px 20px" : "36px 40px 24px" }}>
              <div className="ph-eyebrow">
                <span className="ph-dot" />
                SETTINGS
              </div>
              <h1 className="ph-title">Preferences</h1>
              <p className="ph-sub">Customize your DjAfro experience</p>
            </div>

            <div className="settings-body" style={{ padding: isSmall ? "0 16px 120px" : "0 40px 80px" }}>

              {/* ══ APPEARANCE ══════════════════════════════════════════════ */}
              <div className="settings-section">
                <SectionHeader icon={Palette} label="Appearance" />

                {/* Theme picker */}
                <div className="card">
                  <p className="card-lbl">Color Theme</p>
                  <div className={`theme-grid${isMobile ? " theme-grid--2col" : ""}`}>
                    {themes.map(th => (
                      <ThemeCard
                        key={th.id}
                        th={th}
                        active={th.id === theme.id}
                        onSelect={() => setThemeId(th.id as Parameters<typeof setThemeId>[0])}
                      />
                    ))}
                  </div>
                  <p className="card-hint">
                    <span className="hint-dot" />
                    Active: <strong>{theme.name}</strong> — {theme.description}
                  </p>
                </div>

                {/* Font size */}
                <div className="card">
                  <p className="card-lbl">Text Size</p>
                  <div className="font-row">
                    {FONT_SIZES.map(f => (
                      <button
                        key={f.id}
                        className={`font-chip${fontSize === f.id ? " font-chip--on" : ""}`}
                        onClick={() => setFontSize(f.id)}
                      >
                        <span className="font-chip-letter" style={{ fontSize: `${f.scale * 13}px` }}>Aa</span>
                        <span className="font-chip-lbl">{f.label}</span>
                        {fontSize === f.id && <Check size={9} className="font-chip-check" />}
                      </button>
                    ))}
                  </div>
                  <p className="card-hint">
                    <span className="hint-dot" />
                    Changes text size across the entire app
                  </p>
                </div>
              </div>

              {/* ══ PLAYBACK ════════════════════════════════════════════════ */}
              <div className="settings-section">
                <SectionHeader icon={Play} label="Playback" />
                <div className="card card--rows">
                  <SettingRow
                    icon={Play}
                    title="Autoplay next episode"
                    subtitle="Automatically plays the next episode when one ends"
                    right={<Toggle on={autoplay} onChange={setAutoplay} />}
                  />
                  <SettingRow
                    icon={muteTrailers ? VolumeX : Volume2}
                    title="Mute trailers"
                    subtitle="Trailers and previews will play silently"
                    right={<Toggle on={muteTrailers} onChange={setMute} />}
                  />
                </div>

                {/* Quality */}
                <div className="card">
                  <p className="card-lbl">Streaming Quality</p>
                  <div className="quality-grid">
                    {QUALITY_OPTIONS.map(q => (
                      <button
                        key={q.id}
                        className={`quality-chip${quality === q.id ? " quality-chip--on" : ""}`}
                        onClick={() => setQuality(q.id)}
                      >
                        <span className="qc-label">{q.label}</span>
                        <span className="qc-desc">{q.desc}</span>
                        {quality === q.id && <Check size={9} className="qc-check" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ══ SHARE & SUPPORT ═════════════════════════════════════════ */}
              <div className="settings-section">
                <SectionHeader icon={Share2} label="Share & Support" />
                <div className="card card--rows">
                  <SettingRow
                    icon={Share2}
                    title="Share DjAfro"
                    subtitle="Invite friends to watch movies with you"
                    onClick={() => setShareOpen(true)}
                  />
                  <SettingRow
                    icon={AlertCircle}
                    title="Report an Issue"
                    subtitle="Send a bug report directly via WhatsApp"
                    onClick={() => setReportOpen(true)}
                  />
                  <SettingRow
                    icon={MessageCircle}
                    title="Contact Support"
                    subtitle="Chat with us on WhatsApp +254 711 263 923"
                    onClick={() => window.open(WHATSAPP_SUPPORT, "_blank")}
                  />
                </div>
              </div>

              {/* ══ ABOUT ═══════════════════════════════════════════════════ */}
              <div className="settings-section">
                <SectionHeader icon={Info} label="About" />
                <div className="about-card">
                  <div className="about-logo">
                    <span className="about-logo-text">DjAfro</span>
                    <span className="about-version">v1.0</span>
                  </div>
                  <p className="about-desc">
                    Your favourite African streaming platform. Watch the latest movies,
                    series, and exclusive content from across the continent.
                  </p>
                  <div className="about-links">
                    <a href="/privacy"      className="about-link" target="_blank" rel="noreferrer">Privacy Policy</a>
                    <span className="about-sep">·</span>
                    <a href="/terms"        className="about-link" target="_blank" rel="noreferrer">Terms of Use</a>
                    <span className="about-sep">·</span>
                    <a href={APP_URL}       className="about-link" target="_blank" rel="noreferrer">Visit Site</a>
                  </div>
                  <p className="about-copy">© {new Date().getFullYear()} DjAfro. All rights reserved.</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {isSmall && <MobileBottomNav />}
      </div>

      <ShareDrawer  open={shareOpen}  onClose={() => setShareOpen(false)}  />
      <ReportDrawer open={reportOpen} onClose={() => setReportOpen(false)} user={user} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CSS — 100% theme-aware via var(--dj-*)
// ─────────────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; }

.root { display: flex; height: 100svh; background: var(--dj-bg-base); overflow: hidden; color: var(--dj-text-primary); }

.col {
  flex: 1; min-width: 0; height: 100svh;
  overflow-y: auto; overflow-x: hidden;
  display: flex; flex-direction: column;
  scrollbar-width: none;
}
.col::-webkit-scrollbar { display: none; }
.page { flex: 1; }

/* ── Page header ── */
.page-header {
  position: relative;
  border-bottom: 1px solid var(--dj-border-subtle);
}
.page-header::before {
  content: '';
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 60% 120% at 20% 50%, var(--dj-sidebar-glow-top), transparent 70%);
  pointer-events: none;
}
.ph-eyebrow {
  display: flex; align-items: center; gap: 8px;
  font-family: 'Outfit', sans-serif;
  font-size: 9px; font-weight: 700;
  letter-spacing: 0.25em; color: var(--dj-text-muted);
  margin-bottom: 8px;
}
.ph-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--dj-accent);
  box-shadow: 0 0 8px var(--dj-accent-glow);
  animation: pulse-dot 2s ease-in-out infinite;
}
@keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.75)} }
.ph-title {
  font-family: 'Syne', sans-serif;
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  font-weight: 800; color: var(--dj-text-primary);
  margin: 0 0 4px; letter-spacing: -0.04em; line-height: 1;
}
.ph-sub {
  font-family: 'Outfit', sans-serif;
  font-size: 12px; color: var(--dj-text-muted); margin: 0;
}

/* ── Settings body ── */
.settings-body { display: flex; flex-direction: column; gap: 6px; padding-top: 24px !important; }

.settings-section { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }

/* ── Section header ── */
.sh {
  display: flex; align-items: center; gap: 9px;
  margin-bottom: 2px;
}
.sh-ico {
  width: 26px; height: 26px; border-radius: 6px;
  background: color-mix(in srgb, var(--dj-accent) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--dj-accent) 20%, transparent);
  display: flex; align-items: center; justify-content: center;
  color: var(--dj-accent);
}
.sh-lbl {
  font-family: 'Outfit', sans-serif;
  font-size: 9px; font-weight: 700;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--dj-text-muted);
}

/* ── Card ── */
.card {
  background: color-mix(in srgb, var(--dj-text-primary) 2%, transparent);
  border: 1px solid var(--dj-border-subtle);
  border-radius: 12px; padding: 16px;
}
.card--rows { padding: 4px 0; }
.card-lbl {
  font-family: 'Outfit', sans-serif;
  font-size: 9px; font-weight: 700;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--dj-text-muted); margin: 0 0 12px;
}
.card-hint {
  display: flex; align-items: center; gap: 6px;
  font-family: 'Outfit', sans-serif;
  font-size: 10px; color: var(--dj-text-muted);
  margin: 10px 0 0;
}
.card-hint strong { color: var(--dj-accent); font-weight: 600; }
.hint-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--dj-accent); flex-shrink: 0;
}

/* ── Setting row ── */
.srow {
  display: flex; align-items: center; gap: 12px;
  padding: 11px 16px;
  border-bottom: 1px solid var(--dj-border-subtle);
  transition: background .14s, padding-left .14s;
}
.srow:last-child { border-bottom: none; }
.srow--click { cursor: pointer; }
.srow--click:hover { background: var(--dj-nav-hover-bg); padding-left: 22px; }
.srow--danger .srow-t { color: var(--dj-danger) !important; }
.srow--danger .srow-ico { color: var(--dj-danger) !important; background: color-mix(in srgb, var(--dj-danger) 8%, transparent) !important; }
.srow-ico {
  width: 32px; height: 32px; flex-shrink: 0; border-radius: 8px;
  background: var(--dj-nav-hover-bg);
  display: flex; align-items: center; justify-content: center;
  color: var(--dj-icon-inactive);
}
.srow-body { flex: 1; min-width: 0; }
.srow-t {
  font-family: 'Outfit', sans-serif;
  font-size: 12.5px; font-weight: 600;
  color: var(--dj-text-secondary); margin: 0 0 1px;
}
.srow-s {
  font-family: 'Outfit', sans-serif;
  font-size: 10px; color: var(--dj-text-muted); margin: 0; line-height: 1.4;
}
.srow-right { flex-shrink: 0; }
.srow-caret { color: var(--dj-text-muted); flex-shrink: 0; }

/* ── Toggle ── */
.toggle {
  width: 40px; height: 22px; border-radius: 11px;
  background: var(--dj-border-medium);
  border: none; cursor: pointer; padding: 0;
  position: relative; transition: background .2s;
  flex-shrink: 0;
}
.toggle--on { background: var(--dj-accent); }
.toggle-knob {
  position: absolute; top: 3px; left: 3px;
  width: 16px; height: 16px; border-radius: 50%;
  background: #fff;
  transition: transform .2s cubic-bezier(.4,0,.2,1);
  box-shadow: 0 1px 4px rgba(0,0,0,0.3);
}
.toggle--on .toggle-knob { transform: translateX(18px); }

/* ── Theme cards grid ── */
.theme-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px; margin-bottom: 4px;
}
.theme-grid--2col { grid-template-columns: repeat(2, 1fr); }
@media (max-width: 520px) {
  .theme-grid:not(.theme-grid--2col) { grid-template-columns: repeat(3, 1fr); }
}

.tcard {
  background: none; border: none; cursor: pointer; padding: 0;
  display: flex; flex-direction: column; gap: 6px;
  transition: transform .15s;
}
.tcard:hover { transform: translateY(-2px); }

.tcard-preview {
  position: relative; border-radius: 8px; overflow: hidden;
  aspect-ratio: 4/3;
  border: 2px solid var(--dj-border-subtle);
  transition: border-color .15s, box-shadow .15s;
}
.tcard--on .tcard-preview {
  border-color: var(--tc-accent, var(--dj-accent));
  box-shadow: 0 0 0 1px var(--tc-accent, var(--dj-accent)),
              0 4px 16px var(--tc-glow, var(--dj-accent-glow));
}

.tcp-bg {
  position: absolute; inset: 0;
  background: var(--tc-bg, #070709);
}
.tcp-sidebar {
  position: absolute; left: 0; top: 0; bottom: 0; width: 28%;
  background: var(--tc-surf, #0f0f12);
  display: flex; flex-direction: column;
  align-items: center; padding: 6px 0; gap: 4px;
}
.tcp-dot {
  width: 8px; height: 8px; border-radius: 2px;
  background: rgba(255,255,255,0.1);
}
.tcp-dot--accent { background: var(--tc-accent, var(--dj-accent)); }
.tcp-content {
  position: absolute; left: 30%; right: 0; top: 0; bottom: 0;
  padding: 6px 6px; display: flex; flex-direction: column; gap: 4px;
}
.tcp-bar {
  height: 4px; border-radius: 2px;
  background: rgba(255,255,255,0.08);
}
.tcp-bar--w70 { width: 70%; }
.tcp-bar--w45 { width: 45%; }
.tcp-bar--w55 { width: 55%; }
.tcp-hero {
  flex: 1; border-radius: 3px;
  background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, var(--tc-accent, var(--dj-accent)) 200%);
  margin: 2px 0;
}

.tcard-check {
  position: absolute; top: 5px; right: 5px;
  width: 16px; height: 16px; border-radius: 50%;
  background: var(--tc-accent, var(--dj-accent));
  display: flex; align-items: center; justify-content: center;
  color: #fff;
}
.tcard-foot {
  display: flex; align-items: center; gap: 5px; padding: 0 1px;
}
.tcard-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--tc-accent, var(--dj-accent));
  flex-shrink: 0;
}
.tcard-name {
  font-family: 'Outfit', sans-serif;
  font-size: 9.5px; font-weight: 600;
  color: var(--dj-text-secondary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* ── Font chips ── */
.font-row { display: flex; gap: 8px; }
.font-chip {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  gap: 4px; padding: 10px 6px; border-radius: 8px;
  background: var(--dj-nav-hover-bg);
  border: 1px solid var(--dj-border-subtle);
  cursor: pointer; position: relative;
  transition: all .14s;
}
.font-chip:hover { border-color: var(--dj-border-accent); }
.font-chip--on {
  border-color: var(--dj-accent);
  background: color-mix(in srgb, var(--dj-accent) 8%, transparent);
}
.font-chip-letter {
  font-family: 'Syne', sans-serif; font-weight: 700;
  color: var(--dj-text-primary); line-height: 1;
}
.font-chip-lbl {
  font-family: 'Outfit', sans-serif;
  font-size: 9px; font-weight: 600;
  color: var(--dj-text-muted); text-transform: uppercase; letter-spacing: 0.06em;
}
.font-chip-check {
  position: absolute; top: 5px; right: 5px;
  color: var(--dj-accent);
}

/* ── Quality grid ── */
.quality-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 7px; }
.quality-chip {
  display: flex; flex-direction: column; gap: 2px;
  padding: 10px 12px; border-radius: 8px;
  background: var(--dj-nav-hover-bg);
  border: 1px solid var(--dj-border-subtle);
  cursor: pointer; text-align: left; position: relative;
  transition: all .14s;
}
.quality-chip:hover { border-color: var(--dj-border-accent); }
.quality-chip--on {
  border-color: var(--dj-accent);
  background: color-mix(in srgb, var(--dj-accent) 8%, transparent);
}
.qc-label {
  font-family: 'Syne', sans-serif;
  font-size: 13px; font-weight: 700; color: var(--dj-text-primary);
}
.qc-desc {
  font-family: 'Outfit', sans-serif;
  font-size: 9.5px; color: var(--dj-text-muted); line-height: 1.4;
}
.qc-check {
  position: absolute; top: 8px; right: 8px;
  color: var(--dj-accent);
}

/* ── About card ── */
.about-card {
  background: color-mix(in srgb, var(--dj-text-primary) 2%, transparent);
  border: 1px solid var(--dj-border-subtle);
  border-radius: 12px; padding: 20px;
  display: flex; flex-direction: column; gap: 10px;
}
.about-logo { display: flex; align-items: baseline; gap: 9px; }
.about-logo-text {
  font-family: 'Syne', sans-serif;
  font-size: 1.4rem; font-weight: 800;
  color: var(--dj-accent); letter-spacing: -0.04em;
}
.about-version {
  font-family: 'Outfit', sans-serif;
  font-size: 10px; font-weight: 600;
  color: var(--dj-text-muted);
  background: var(--dj-nav-hover-bg);
  border: 1px solid var(--dj-border-subtle);
  border-radius: 4px; padding: 2px 7px;
}
.about-desc {
  font-family: 'Outfit', sans-serif;
  font-size: 11.5px; color: var(--dj-text-muted);
  line-height: 1.65; margin: 0;
}
.about-links {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
}
.about-link {
  font-family: 'Outfit', sans-serif;
  font-size: 11px; font-weight: 600;
  color: var(--dj-text-secondary); text-decoration: none;
  transition: color .14s;
}
.about-link:hover { color: var(--dj-accent); }
.about-sep { color: var(--dj-border-medium); font-size: 11px; }
.about-copy {
  font-family: 'Outfit', sans-serif;
  font-size: 10px; color: var(--dj-text-muted); margin: 0;
}

/* ── Buttons ── */
.act-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 17px; border-radius: 7px;
  font-family: 'Outfit', sans-serif;
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.06em; text-transform: uppercase;
  cursor: pointer; border: none; white-space: nowrap;
  text-decoration: none; transition: all .14s;
}
.act-btn--ghost {
  background: var(--dj-nav-hover-bg);
  border: 1px solid var(--dj-border-subtle);
  color: var(--dj-text-secondary);
}
.act-btn--ghost:hover { background: var(--dj-nav-active-bg); color: var(--dj-text-primary); }
.act-btn--solid { background: var(--dj-accent); color: var(--dj-text-on-accent); }
.act-btn--solid:hover { background: var(--dj-accent-light); transform: translateY(-1px); }
.act-btn--solid:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
.act-btn--done { background: var(--dj-success) !important; color: #fff !important; }

/* ── Drawers ── */
.drawer-backdrop {
  position: fixed; inset: 0;
  background: var(--dj-overlay); backdrop-filter: blur(8px);
  z-index: 90; opacity: 0; pointer-events: none;
  transition: opacity .24s;
}
.drawer-backdrop--vis { opacity: 1; pointer-events: all; }
.drawer {
  position: fixed; right: 0; top: 0; bottom: 0;
  width: min(430px, 100vw);
  background: var(--dj-bg-surface);
  border-left: 1px solid var(--dj-border-subtle);
  z-index: 91; display: flex; flex-direction: column;
  transform: translateX(100%);
  transition: transform .3s cubic-bezier(.4,0,.2,1);
}
.drawer--open { transform: translateX(0); }
.drawer-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 20px 16px;
  border-bottom: 1px solid var(--dj-border-subtle);
}
.drawer-title {
  font-family: 'Syne', sans-serif;
  font-size: 0.98rem; font-weight: 700; color: var(--dj-text-primary); margin: 0;
  letter-spacing: -0.02em;
}
.drawer-close {
  width: 28px; height: 28px; border-radius: 6px;
  background: var(--dj-nav-hover-bg);
  border: 1px solid var(--dj-border-subtle);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--dj-icon-inactive);
  transition: all .14s;
}
.drawer-close:hover { background: var(--dj-nav-active-bg); color: var(--dj-text-primary); }
.drawer-body {
  flex: 1; padding: 18px;
  display: flex; flex-direction: column; gap: 14px;
  overflow-y: auto; scrollbar-width: none;
}
.drawer-body::-webkit-scrollbar { display: none; }
.drawer-foot {
  padding: 13px 18px;
  border-top: 1px solid var(--dj-border-subtle);
  display: flex; gap: 8px; justify-content: flex-end;
}
.drawer-hint {
  font-family: 'Outfit', sans-serif;
  font-size: 11.5px; color: var(--dj-text-muted); line-height: 1.65; margin: 0;
}

/* ── Share drawer ── */
.share-link-box {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 10px 9px 12px; border-radius: 8px;
  background: var(--dj-nav-hover-bg);
  border: 1px solid var(--dj-border-subtle);
}
.share-link-url {
  flex: 1; font-family: 'Outfit', sans-serif;
  font-size: 11px; color: var(--dj-text-secondary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.copy-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 12px; border-radius: 6px; flex-shrink: 0;
  background: var(--dj-accent); color: var(--dj-text-on-accent);
  border: none; cursor: pointer;
  font-family: 'Outfit', sans-serif;
  font-size: 10px; font-weight: 700;
  letter-spacing: 0.06em; text-transform: uppercase;
  transition: all .14s;
}
.copy-btn:hover { background: var(--dj-accent-light); }
.copy-btn--done { background: var(--dj-success) !important; }

.native-share-btn {
  width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 11px; border-radius: 8px;
  background: var(--dj-nav-hover-bg);
  border: 1px solid var(--dj-border-medium);
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  font-size: 12px; font-weight: 700;
  color: var(--dj-text-secondary);
  letter-spacing: 0.06em; text-transform: uppercase;
  transition: all .14s;
}
.native-share-btn:hover { background: var(--dj-nav-active-bg); color: var(--dj-text-primary); }

.share-targets-lbl {
  font-family: 'Outfit', sans-serif;
  font-size: 9px; font-weight: 700;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--dj-text-muted); margin: 0;
}
.share-targets { display: grid; grid-template-columns: repeat(2, 1fr); gap: 7px; }
.share-target {
  display: flex; align-items: center; gap: 10px;
  padding: 11px 12px; border-radius: 8px;
  background: var(--dj-nav-hover-bg);
  border: 1px solid var(--dj-border-subtle);
  text-decoration: none; cursor: pointer;
  transition: all .14s;
}
.share-target:hover {
  border-color: var(--st-color, var(--dj-accent));
  background: color-mix(in srgb, var(--st-color, var(--dj-accent)) 6%, transparent);
}
.st-ico {
  width: 30px; height: 30px; flex-shrink: 0; border-radius: 7px;
  background: color-mix(in srgb, var(--st-color, var(--dj-accent)) 10%, transparent);
  display: flex; align-items: center; justify-content: center;
  color: var(--st-color, var(--dj-accent));
}
.st-lbl {
  font-family: 'Outfit', sans-serif;
  font-size: 12px; font-weight: 600;
  color: var(--dj-text-secondary);
}

/* ── Report drawer ── */
.field-wrap { display: flex; flex-direction: column; gap: 5px; }
.field-lbl {
  font-family: 'Outfit', sans-serif;
  font-size: 9px; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--dj-text-muted);
}
.select-wrap { position: relative; }
.field-select {
  width: 100%; height: 40px; padding: 0 36px 0 12px;
  background: var(--dj-nav-hover-bg);
  border: 1px solid var(--dj-border-subtle); border-radius: 7px;
  font-family: 'Outfit', sans-serif;
  font-size: 12.5px; color: var(--dj-text-primary);
  outline: none; cursor: pointer;
  appearance: none; -webkit-appearance: none;
  transition: border-color .14s;
}
.field-select:focus { border-color: var(--dj-border-accent); }
.field-select option { background: var(--dj-bg-surface); color: var(--dj-text-primary); }
.select-caret {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  color: var(--dj-text-muted); pointer-events: none;
}
.field-textarea {
  width: 100%; padding: 10px 12px;
  background: var(--dj-nav-hover-bg);
  border: 1px solid var(--dj-border-subtle); border-radius: 7px;
  font-family: 'Outfit', sans-serif;
  font-size: 12.5px; color: var(--dj-text-primary);
  outline: none; resize: none;
  caret-color: var(--dj-accent);
  transition: border-color .14s;
  line-height: 1.55;
}
.field-textarea::placeholder { color: var(--dj-text-muted); }
.field-textarea--on { border-color: var(--dj-border-accent); }
.report-note {
  display: flex; align-items: center; gap: 7px;
  font-family: 'Outfit', sans-serif;
  font-size: 10.5px; color: var(--dj-text-muted); margin: 0; line-height: 1.5;
}
`;