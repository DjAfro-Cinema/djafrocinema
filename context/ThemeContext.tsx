"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ThemeId, ThemeContextValue, ThemeTokens } from "@/types/theme.types";
import { THEMES, DEFAULT_THEME_ID, getThemeById } from "@/lib/themes";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "djafro_theme";

// ─────────────────────────────────────────────────────────────────────────────
// CSS VARIABLE INJECTION
// Maps each token key to a --dj-* CSS custom property so any component
// can consume the active theme via CSS without needing React context.
// ─────────────────────────────────────────────────────────────────────────────

const TOKEN_TO_CSS_VAR: Record<keyof ThemeTokens, string> = {
  accent:              "--dj-accent",
  accentLight:         "--dj-accent-light",
  accentDark:          "--dj-accent-dark",
  accentGlow:          "--dj-accent-glow",

  bgBase:              "--dj-bg-base",
  bgSurface:           "--dj-bg-surface",
  bgElevated:          "--dj-bg-elevated",
  bgSidebar:           "--dj-bg-sidebar",
  bgSidebarGradient:   "--dj-bg-sidebar-gradient",

  textPrimary:         "--dj-text-primary",
  textSecondary:       "--dj-text-secondary",
  textMuted:           "--dj-text-muted",
  textOnAccent:        "--dj-text-on-accent",

  borderSubtle:        "--dj-border-subtle",
  borderMedium:        "--dj-border-medium",
  borderAccent:        "--dj-border-accent",

  navHoverBg:          "--dj-nav-hover-bg",
  navActiveBg:         "--dj-nav-active-bg",
  navActiveBar:        "--dj-nav-active-bar",
  iconInactive:        "--dj-icon-inactive",
  iconHovered:         "--dj-icon-hovered",
  iconActive:          "--dj-icon-active",

  success:             "--dj-success",
  warning:             "--dj-warning",
  danger:              "--dj-danger",
  info:                "--dj-info",

  overlay:             "--dj-overlay",
  sidebarGlowTop:      "--dj-sidebar-glow-top",
  sidebarGlowBottom:   "--dj-sidebar-glow-bottom",
};

function applyTokensToRoot(tokens: ThemeTokens): void {
  const root = document.documentElement;
  (Object.keys(tokens) as Array<keyof ThemeTokens>).forEach((key) => {
    root.style.setProperty(TOKEN_TO_CSS_VAR[key], tokens[key]);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>(() => {
    // During SSR there is no localStorage — default to netflix
    if (typeof window === "undefined") return DEFAULT_THEME_ID;
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    return stored && THEMES.some((t) => t.id === stored) ? stored : DEFAULT_THEME_ID;
  });

  // Derive active theme object
  const theme = useMemo(() => getThemeById(themeId), [themeId]);

  // Inject CSS variables whenever theme changes
  useEffect(() => {
    applyTokensToRoot(theme.tokens);
    // Also set a data-attribute so raw CSS selectors can target the theme
    document.documentElement.setAttribute("data-theme", theme.id);
  }, [theme]);

  const setThemeId = useCallback((id: ThemeId) => {
    setThemeIdState(id);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, id);
    }
  }, []);

  const value: ThemeContextValue = useMemo(
    () => ({ theme, t: theme.tokens, setThemeId, themes: THEMES }),
    [theme, setThemeId]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }
  return ctx;
}