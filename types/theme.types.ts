// ─────────────────────────────────────────────────────────────────────────────
// THEME TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type ThemeId =
  | "netflix"
  | "hulu"
  | "prime"
  | "amber"
  | "hbo"        // renamed from amoled → HBO Dark
  | "rosegold"   // NEW — Rose Gold Dark
  | "cyber";     // NEW — Cyberpunk Teal

export interface ThemeTokens {
  accent: string;
  accentLight: string;
  accentDark: string;
  accentGlow: string;

  bgBase: string;
  bgSurface: string;
  bgElevated: string;
  bgSidebar: string;
  bgSidebarGradient: string;

  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textOnAccent: string;

  borderSubtle: string;
  borderMedium: string;
  borderAccent: string;

  navHoverBg: string;
  navActiveBg: string;
  navActiveBar: string;
  iconInactive: string;
  iconHovered: string;
  iconActive: string;

  success: string;
  warning: string;
  danger: string;
  info: string;

  overlay: string;
  sidebarGlowTop: string;
  sidebarGlowBottom: string;
}

export interface AppTheme {
  id: ThemeId;
  name: string;
  description: string;
  tokens: ThemeTokens;
}

export interface ThemeContextValue {
  theme: AppTheme;
  t: ThemeTokens;
  setThemeId: (id: ThemeId) => void;
  themes: AppTheme[];
}