import type { AppTheme, ThemeTokens } from "@/types/theme.types";

function glow(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─── 1. NETFLIX DARK ─────────────────────────────────────────────────────────
const netflixTokens: ThemeTokens = {
  accent:      "#e50914",
  accentLight: "#ff3d47",
  accentDark:  "#a5000c",
  accentGlow:  glow("#e50914", 0.4),
  bgBase:              "#070709",
  bgSurface:           "#0f0f12",
  bgElevated:          "#141418",
  bgSidebar:           "#0b0b0e",
  bgSidebarGradient:   "linear-gradient(160deg,#111115 0%,#0b0b0e 55%,#0e0b0b 100%)",
  textPrimary:   "rgba(255,255,255,0.92)",
  textSecondary: "rgba(255,255,255,0.55)",
  textMuted:     "rgba(255,255,255,0.22)",
  textOnAccent:  "#ffffff",
  borderSubtle: "rgba(255,255,255,0.055)",
  borderMedium: "rgba(255,255,255,0.09)",
  borderAccent: "rgba(229,9,20,0.38)",
  navHoverBg:  "rgba(255,255,255,0.045)",
  navActiveBg: "rgba(229,9,20,0.10)",
  navActiveBar:"linear-gradient(180deg,#ff5555,#e50914)",
  iconInactive:"rgba(255,255,255,0.28)",
  iconHovered: "rgba(255,255,255,0.65)",
  iconActive:  "#ff5555",
  success: "#10b981", warning: "#f59e0b", danger: "#e50914", info: "#3b82f6",
  overlay:           "rgba(0,0,0,0.72)",
  sidebarGlowTop:    glow("#e50914", 0.09),
  sidebarGlowBottom: glow("#e50914", 0.05),
};

// ─── 2. HULU DARK ─────────────────────────────────────────────────────────────
const huluTokens: ThemeTokens = {
  accent:      "#1ce783",
  accentLight: "#4df5a1",
  accentDark:  "#0fa85e",
  accentGlow:  glow("#1ce783", 0.38),
  bgBase:            "#0a0d0a",
  bgSurface:         "#101510",
  bgElevated:        "#151c15",
  bgSidebar:         "#0c100c",
  bgSidebarGradient: "linear-gradient(160deg,#111811 0%,#0c100c 55%,#0d110d 100%)",
  textPrimary:   "rgba(255,255,255,0.92)",
  textSecondary: "rgba(255,255,255,0.52)",
  textMuted:     "rgba(255,255,255,0.20)",
  textOnAccent:  "#050d05",
  borderSubtle: "rgba(255,255,255,0.052)",
  borderMedium: "rgba(255,255,255,0.085)",
  borderAccent: "rgba(28,231,131,0.36)",
  navHoverBg:  "rgba(28,231,131,0.05)",
  navActiveBg: "rgba(28,231,131,0.09)",
  navActiveBar:"linear-gradient(180deg,#4df5a1,#1ce783)",
  iconInactive:"rgba(255,255,255,0.26)",
  iconHovered: "rgba(255,255,255,0.62)",
  iconActive:  "#1ce783",
  success: "#1ce783", warning: "#f59e0b", danger: "#ef4444", info: "#38bdf8",
  overlay:           "rgba(0,0,0,0.75)",
  sidebarGlowTop:    glow("#1ce783", 0.07),
  sidebarGlowBottom: glow("#1ce783", 0.04),
};

// ─── 3. PRIME DARK ────────────────────────────────────────────────────────────
const primeTokens: ThemeTokens = {
  accent:      "#00a8e1",
  accentLight: "#33c0f5",
  accentDark:  "#0078a8",
  accentGlow:  glow("#00a8e1", 0.38),
  bgBase:            "#08090d",
  bgSurface:         "#0e1018",
  bgElevated:        "#131620",
  bgSidebar:         "#0a0c14",
  bgSidebarGradient: "linear-gradient(160deg,#0f1220 0%,#0a0c14 55%,#0a0e15 100%)",
  textPrimary:   "rgba(255,255,255,0.92)",
  textSecondary: "rgba(255,255,255,0.52)",
  textMuted:     "rgba(255,255,255,0.20)",
  textOnAccent:  "#ffffff",
  borderSubtle: "rgba(255,255,255,0.055)",
  borderMedium: "rgba(255,255,255,0.09)",
  borderAccent: "rgba(0,168,225,0.36)",
  navHoverBg:  "rgba(0,168,225,0.05)",
  navActiveBg: "rgba(0,168,225,0.09)",
  navActiveBar:"linear-gradient(180deg,#33c0f5,#00a8e1)",
  iconInactive:"rgba(255,255,255,0.26)",
  iconHovered: "rgba(255,255,255,0.62)",
  iconActive:  "#33c0f5",
  success: "#10b981", warning: "#f59e0b", danger: "#ef4444", info: "#00a8e1",
  overlay:           "rgba(0,0,0,0.78)",
  sidebarGlowTop:    glow("#00a8e1", 0.07),
  sidebarGlowBottom: glow("#00a8e1", 0.04),
};

// ─── 4. AMBER DARK ────────────────────────────────────────────────────────────
const amberTokens: ThemeTokens = {
  accent:      "#f5a623",
  accentLight: "#ffc14a",
  accentDark:  "#c07d0d",
  accentGlow:  glow("#f5a623", 0.38),
  bgBase:            "#090806",
  bgSurface:         "#120f0a",
  bgElevated:        "#18130d",
  bgSidebar:         "#0d0b07",
  bgSidebarGradient: "linear-gradient(160deg,#14110a 0%,#0d0b07 55%,#100d08 100%)",
  textPrimary:   "rgba(255,245,228,0.92)",
  textSecondary: "rgba(255,235,190,0.50)",
  textMuted:     "rgba(255,225,170,0.20)",
  textOnAccent:  "#1a0f00",
  borderSubtle: "rgba(255,220,140,0.06)",
  borderMedium: "rgba(255,210,120,0.10)",
  borderAccent: "rgba(245,166,35,0.38)",
  navHoverBg:  "rgba(245,166,35,0.06)",
  navActiveBg: "rgba(245,166,35,0.10)",
  navActiveBar:"linear-gradient(180deg,#ffc14a,#f5a623)",
  iconInactive:"rgba(255,220,150,0.26)",
  iconHovered: "rgba(255,235,190,0.65)",
  iconActive:  "#ffc14a",
  success: "#22c55e", warning: "#f5a623", danger: "#ef4444", info: "#38bdf8",
  overlay:           "rgba(0,0,0,0.78)",
  sidebarGlowTop:    glow("#f5a623", 0.08),
  sidebarGlowBottom: glow("#f5a623", 0.04),
};

// ─── 5. HBO DARK — true AMOLED black, HBO signature gold/platinum ─────────────
// Pure #000000 base. HBO's brand palette: deep charcoal UI, gold-white accent.
const hboTokens: ThemeTokens = {
  accent:      "#d4a843",         // HBO gold
  accentLight: "#f0cc7a",
  accentDark:  "#9c7520",
  accentGlow:  glow("#d4a843", 0.35),
  bgBase:            "#000000",   // true AMOLED
  bgSurface:         "#050505",
  bgElevated:        "#0a0a0a",
  bgSidebar:         "#000000",
  bgSidebarGradient: "linear-gradient(160deg,#080808 0%,#000000 60%,#050500 100%)",
  textPrimary:   "rgba(255,252,242,0.95)",
  textSecondary: "rgba(255,240,200,0.45)",
  textMuted:     "rgba(255,235,180,0.18)",
  textOnAccent:  "#0a0600",
  borderSubtle: "rgba(255,230,150,0.045)",
  borderMedium: "rgba(255,220,130,0.08)",
  borderAccent: "rgba(212,168,67,0.35)",
  navHoverBg:  "rgba(212,168,67,0.055)",
  navActiveBg: "rgba(212,168,67,0.10)",
  navActiveBar:"linear-gradient(180deg,#f0cc7a,#d4a843)",
  iconInactive:"rgba(255,230,160,0.24)",
  iconHovered: "rgba(255,240,200,0.60)",
  iconActive:  "#f0cc7a",
  success: "#10b981", warning: "#d4a843", danger: "#ef4444", info: "#38bdf8",
  overlay:           "rgba(0,0,0,0.92)",
  sidebarGlowTop:    glow("#d4a843", 0.07),
  sidebarGlowBottom: glow("#d4a843", 0.04),
};

// ─── 6. ROSE GOLD DARK — blush-copper luxury on near-black ───────────────────
const rosegoldTokens: ThemeTokens = {
  accent:      "#e8927c",         // warm rose-copper
  accentLight: "#f4b4a2",
  accentDark:  "#c0614a",
  accentGlow:  glow("#e8927c", 0.38),
  bgBase:            "#0a0807",
  bgSurface:         "#130e0d",
  bgElevated:        "#1a1210",
  bgSidebar:         "#0d0a09",
  bgSidebarGradient: "linear-gradient(160deg,#161009 0%,#0d0a09 55%,#120d0c 100%)",
  textPrimary:   "rgba(255,240,232,0.92)",
  textSecondary: "rgba(255,210,195,0.48)",
  textMuted:     "rgba(255,195,180,0.18)",
  textOnAccent:  "#1a0805",
  borderSubtle: "rgba(255,190,170,0.055)",
  borderMedium: "rgba(255,180,155,0.09)",
  borderAccent: "rgba(232,146,124,0.36)",
  navHoverBg:  "rgba(232,146,124,0.055)",
  navActiveBg: "rgba(232,146,124,0.10)",
  navActiveBar:"linear-gradient(180deg,#f4b4a2,#e8927c)",
  iconInactive:"rgba(255,200,180,0.26)",
  iconHovered: "rgba(255,220,205,0.65)",
  iconActive:  "#f4b4a2",
  success: "#10b981", warning: "#f5a623", danger: "#ef4444", info: "#38bdf8",
  overlay:           "rgba(0,0,0,0.80)",
  sidebarGlowTop:    glow("#e8927c", 0.08),
  sidebarGlowBottom: glow("#e8927c", 0.04),
};

// ─── 7. CYBERPUNK TEAL — electric teal-cyan on pitch black ───────────────────
const cyberTokens: ThemeTokens = {
  accent:      "#00e5cc",         // electric teal
  accentLight: "#40ffee",
  accentDark:  "#009e8d",
  accentGlow:  glow("#00e5cc", 0.40),
  bgBase:            "#030a09",
  bgSurface:         "#071210",
  bgElevated:        "#0c1a18",
  bgSidebar:         "#040d0b",
  bgSidebarGradient: "linear-gradient(160deg,#091614 0%,#040d0b 55%,#051210 100%)",
  textPrimary:   "rgba(210,255,250,0.92)",
  textSecondary: "rgba(160,240,230,0.48)",
  textMuted:     "rgba(120,220,210,0.20)",
  textOnAccent:  "#001a17",
  borderSubtle: "rgba(0,229,204,0.055)",
  borderMedium: "rgba(0,229,204,0.09)",
  borderAccent: "rgba(0,229,204,0.38)",
  navHoverBg:  "rgba(0,229,204,0.055)",
  navActiveBg: "rgba(0,229,204,0.09)",
  navActiveBar:"linear-gradient(180deg,#40ffee,#00e5cc)",
  iconInactive:"rgba(160,240,230,0.26)",
  iconHovered: "rgba(200,250,245,0.65)",
  iconActive:  "#40ffee",
  success: "#10b981", warning: "#f59e0b", danger: "#ef4444", info: "#00e5cc",
  overlay:           "rgba(0,0,0,0.80)",
  sidebarGlowTop:    glow("#00e5cc", 0.09),
  sidebarGlowBottom: glow("#00e5cc", 0.05),
};

// ─── REGISTRY ─────────────────────────────────────────────────────────────────
export const THEMES: AppTheme[] = [
  { id: "netflix",  name: "Netflix Dark",    description: "Signature crimson on near-black",     tokens: netflixTokens  },
  { id: "hulu",     name: "Hulu Dark",       description: "Electric green on deep charcoal",     tokens: huluTokens     },
  { id: "prime",    name: "Prime Dark",      description: "Sky blue on navy-black",              tokens: primeTokens    },
  { id: "amber",    name: "Amber Dark",      description: "Warm golden on espresso-black",       tokens: amberTokens    },
  { id: "hbo",      name: "HBO Dark",        description: "True AMOLED black with HBO gold",     tokens: hboTokens      },
  { id: "rosegold", name: "Rose Gold Dark",  description: "Blush-copper luxury on near-black",   tokens: rosegoldTokens },
  { id: "cyber",    name: "Cyberpunk Teal",  description: "Electric teal-cyan on pitch black",   tokens: cyberTokens    },
];

export const DEFAULT_THEME_ID = "netflix" as const;

export function getThemeById(id: string): AppTheme {
  return THEMES.find((th) => th.id === id) ?? THEMES[0];
}