"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type ScreenSize = "mobile" | "tablet" | "desktop" | "tv";

function getScreenSize(w: number): ScreenSize {
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  if (w < 1920) return "desktop";
  return "tv";
}

export interface DashboardLayoutState {
  screenSize: ScreenSize;
  isMobile: boolean;
  isTablet: boolean;
  isSmall: boolean;   // mobile || tablet
  isDesktop: boolean;
  isTV: boolean;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  drawerOpen: boolean;
  setDrawerOpen: (v: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  searchVal: string;
  setSearchVal: (v: string) => void;
  scrolled: boolean;
  /** Width the sidebar occupies (desktop only). Use as margin-left on content column. */
  sidebarWidth: number;
  /** Padding offset for sidebar (12px gap on each side + sidebar width) */
  contentMarginLeft: number;
}

export function useDashboardLayout(): DashboardLayoutState {
  const [screenSize, setScreenSize] = useState<ScreenSize>("desktop");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Screen size watcher
  useEffect(() => {
    setMounted(true);
    const update = () => setScreenSize(getScreenSize(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Close drawer when resizing to desktop
  useEffect(() => {
    if (screenSize !== "mobile" && screenSize !== "tablet") {
      setDrawerOpen(false);
    }
  }, [screenSize]);

  // Lock body scroll when mobile drawer open
  useEffect(() => {
    const isSmall = screenSize === "mobile" || screenSize === "tablet";
    document.body.style.overflow = drawerOpen && isSmall ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen, screenSize]);

  // Keyboard: ⌘K = search, Escape = close
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(v => !v);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchVal("");
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // Scroll tracking on the content column
  useEffect(() => {
    const el = document.getElementById("dj-content-col");
    if (!el) return;
    const h = () => setScrolled(el.scrollTop > 8);
    el.addEventListener("scroll", h, { passive: true });
    return () => el.removeEventListener("scroll", h);
  }, [mounted]);

  const isMobile = screenSize === "mobile";
  const isTablet = screenSize === "tablet";
  const isSmall = isMobile || isTablet;
  const isDesktop = screenSize === "desktop";
  const isTV = screenSize === "tv";

  // sidebar occupies: 12px left gap + W + 12px right gap
  const sidebarW = sidebarCollapsed ? 68 : 240;
  const sidebarWidth = sidebarW;
  const contentMarginLeft = isSmall ? 0 : sidebarW + 24; // 12px left + 12px right gap

  return {
    screenSize,
    isMobile,
    isTablet,
    isSmall,
    isDesktop,
    isTV,
    sidebarCollapsed,
    setSidebarCollapsed,
    drawerOpen,
    setDrawerOpen,
    searchOpen,
    setSearchOpen,
    searchVal,
    setSearchVal,
    scrolled,
    sidebarWidth,
    contentMarginLeft,
  };
}