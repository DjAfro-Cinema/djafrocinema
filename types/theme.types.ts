// ─────────────────────────────────────────────────────────────────────────────
// THEME TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type ThemeId =
  | "netflix"
  | "hulu"
  | "prime"
  | "amber"
  | "amoled";

export interface ThemeTokens {
  // ── Identity ────────────────────────────────────────────────────────────────
  /** Primary brand / accent colour (buttons, active states, highlights) */
  accent: string;
  /** Lighter tint of accent for glows / hover states */
  accentLight: string;
  /** Darker shade of accent for pressed / depth */
  accentDark: string;
  /** Accent as rgba string for glow effects, e.g. "rgba(229,9,20,0.4)" */
  accentGlow: string;

  // ── Backgrounds ─────────────────────────────────────────────────────────────
  /** True page / root background */
  bgBase: string;
  /** Slightly elevated surface (cards, sections) */
  bgSurface: string;
  /** Even more elevated surface (modals, drawers) */
  bgElevated: string;
  /** Sidebar / panel background */
  bgSidebar: string;
  /** Sidebar gradient (CSS value, e.g. "linear-gradient(...)") */
  bgSidebarGradient: string;

  // ── Text ────────────────────────────────────────────────────────────────────
  /** Primary body text */
  textPrimary: string;
  /** Secondary / muted text */
  textSecondary: string;
  /** Placeholder / hint text */
  textMuted: string;
  /** Text on accent-coloured elements (e.g. solid buttons) */
  textOnAccent: string;

  // ── Borders ─────────────────────────────────────────────────────────────────
  /** Subtle dividers and card outlines */
  borderSubtle: string;
  /** Medium-emphasis borders */
  borderMedium: string;
  /** Accent-tinted border (focused inputs, active cards) */
  borderAccent: string;

  // ── Interactive states ───────────────────────────────────────────────────────
  /** Nav item hover background */
  navHoverBg: string;
  /** Nav item active background */
  navActiveBg: string;
  /** Nav item active left-bar gradient */
  navActiveBar: string;
  /** Icon colour — inactive */
  iconInactive: string;
  /** Icon colour — hovered */
  iconHovered: string;
  /** Icon colour — active */
  iconActive: string;

  // ── Semantic colours ─────────────────────────────────────────────────────────
  success: string;
  warning: string;
  danger: string;
  info: string;

  // ── Overlays ─────────────────────────────────────────────────────────────────
  /** Semi-transparent backdrop for modals/drawers */
  overlay: string;
  /** Sidebar ambient glow (top) */
  sidebarGlowTop: string;
  /** Sidebar ambient glow (bottom) */
  sidebarGlowBottom: string;
}

export interface AppTheme {
  id: ThemeId;
  name: string;
  description: string;
  tokens: ThemeTokens;
}

export interface ThemeContextValue {
  /** Currently active theme */
  theme: AppTheme;
  /** Shortcut to theme.tokens */
  t: ThemeTokens;
  /** Change the active theme */
  setThemeId: (id: ThemeId) => void;
  /** All available themes */
  themes: AppTheme[];
}