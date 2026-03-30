"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { Menu, X, Bell, Search, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import DashboardSidebar from "../sidebar/DashboardSidebar";
import { useTheme } from "@/context/ThemeContext";

// ── LAYOUT CONTEXT ────────────────────────────────────────────────────────────
interface LayoutContextValue {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  screenSize: "mobile" | "tablet" | "desktop" | "tv";
  sidebarCollapsed: boolean;
}
const LayoutContext = createContext<LayoutContextValue>({
  sidebarOpen: false,
  setSidebarOpen: () => {},
  screenSize: "desktop",
  sidebarCollapsed: false,
});
export const useLayout = () => useContext(LayoutContext);

interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: { name: string; email: string };
  xp?: number;
  xpMax?: number;
  notifCount?: number;
}

function getScreenSize(w: number): "mobile" | "tablet" | "desktop" | "tv" {
  if (w < 768)  return "mobile";
  if (w < 1024) return "tablet";
  if (w < 1920) return "desktop";
  return "tv";
}

export default function DashboardLayout({
  children,
  user = { name: "Chege", email: "chegephil24@gmail.com" },
  xp = 145,
  xpMax = 300,
  notifCount = 2,
}: DashboardLayoutProps) {
  const { t } = useTheme();

  const [sidebarOpen, setSidebarOpen]           = useState(false);
  const [screenSize, setScreenSize]             = useState<"mobile" | "tablet" | "desktop" | "tv">("desktop");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen]             = useState(false);
  const [searchVal, setSearchVal]               = useState("");
  const [scrolled, setScrolled]                 = useState(false);
  const [mounted, setMounted]                   = useState(false);

  useEffect(() => {
    setMounted(true);
    const update = () => setScreenSize(getScreenSize(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close drawer if user resizes up to desktop
  useEffect(() => {
    if (screenSize !== "mobile" && screenSize !== "tablet") {
      setSidebarOpen(false);
    }
  }, [screenSize]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(v => !v); }
      if (e.key === "Escape") { setSearchOpen(false); setSearchVal(""); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // ── These are the ONLY conditions that control sidebar visibility ──
  const isMobile         = screenSize === "mobile";
  const isTablet         = screenSize === "tablet";
  const isTV             = screenSize === "tv";
  // Sidebar ONLY on desktop and TV — never on mobile or tablet
  const showInlineSidebar = !isMobile && !isTablet;
  // Bottom nav ONLY on mobile — never on tablet, desktop, or TV
  const showBottomNav     = isMobile;

  return (
    <LayoutContext.Provider value={{ sidebarOpen, setSidebarOpen, screenSize, sidebarCollapsed }}>
      <div style={{
        minHeight: "100svh",
        background: t.bgBase,
        display: "flex",
        fontFamily: "'DM Sans', sans-serif",
      }}>

        {/* ── SIDEBAR — desktop/TV ONLY, never rendered on mobile or tablet ── */}
        {showInlineSidebar && (
          <DashboardSidebar
            user={user}
            collapsed={sidebarCollapsed}
            onCollapsedChange={setSidebarCollapsed}
          />
        )}

        {/* ── MAIN CONTENT COLUMN ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

          {/* ── TOP BAR — mobile/tablet only ── */}
          {(isMobile || isTablet) && (
            <header style={{
              position: "sticky", top: 0, zIndex: 800,
              height: 60,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0 16px",
              background: scrolled ? `${t.bgBase}f7` : `${t.bgBase}d9`,
              backdropFilter: scrolled ? "blur(20px)" : "blur(12px)",
              borderBottom: `1px solid ${t.borderSubtle}`,
              transition: "background 0.3s",
            }}>
              {/* Hamburger — tablet only (mobile uses bottom nav, no drawer needed) */}
              {isTablet && (
                <button
                  onClick={() => setSidebarOpen(v => !v)}
                  style={{
                    width: 38, height: 38,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: 10, border: `1px solid ${t.borderSubtle}`,
                    background: "transparent", cursor: "pointer",
                    color: t.textSecondary,
                    transition: "background 0.2s, color 0.2s",
                  }}
                >
                  {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
              )}

              {/* Logo */}
              <div style={{ position: "relative", height: 30, width: 110 }}>
                <Image
                  src="/logo.png"
                  alt="DjAfro Cinema"
                  fill
                  className="object-contain"
                  style={{ filter: `drop-shadow(0 0 8px ${t.accentGlow})` }}
                />
              </div>

              {/* Right actions */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button
                  onClick={() => setSearchOpen(v => !v)}
                  style={{
                    width: 38, height: 38,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: 10, border: `1px solid ${t.borderSubtle}`,
                    background: "transparent", cursor: "pointer",
                    color: t.textSecondary,
                  }}
                >
                  <Search size={16} />
                </button>
                <Link href="/dashboard/notifications" style={{
                  width: 38, height: 38, borderRadius: 10,
                  border: `1px solid ${t.borderSubtle}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative", textDecoration: "none",
                  color: t.textSecondary,
                }}>
                  <Bell size={16} />
                  {notifCount > 0 && (
                    <span style={{
                      position: "absolute", top: 6, right: 6,
                      width: 8, height: 8, borderRadius: "50%",
                      background: t.accent,
                      boxShadow: `0 0 6px ${t.accent}`,
                    }} />
                  )}
                </Link>
              </div>
            </header>
          )}

          {/* ── DESKTOP TOP BAR ── */}
          {showInlineSidebar && (
            <header style={{
              position: "sticky", top: 0, zIndex: 800,
              height: isTV ? 80 : 68,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: isTV ? "0 48px" : "0 28px",
              background: scrolled ? `${t.bgBase}f7` : "transparent",
              backdropFilter: scrolled ? "blur(20px)" : "none",
              borderBottom: scrolled ? `1px solid ${t.borderSubtle}` : "none",
              transition: "background 0.35s, backdrop-filter 0.35s",
            }}>
              {/* Search */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, maxWidth: isTV ? 600 : 400 }}>
                {searchOpen ? (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    flex: 1, padding: "9px 14px",
                    borderRadius: 10, border: `1px solid ${t.borderAccent}`,
                    background: t.navActiveBg,
                  }}>
                    <Search size={14} color={t.textSecondary} />
                    <input
                      autoFocus
                      value={searchVal}
                      onChange={e => setSearchVal(e.target.value)}
                      placeholder="Search movies, genres…"
                      style={{
                        flex: 1, background: "transparent", border: "none",
                        color: t.textPrimary, fontSize: isTV ? 16 : 13,
                        fontFamily: "'DM Sans', sans-serif", outline: "none",
                      }}
                    />
                    <button onClick={() => { setSearchOpen(false); setSearchVal(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted }}>
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSearchOpen(true)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 14px", borderRadius: 10,
                      border: `1px solid ${t.borderSubtle}`,
                      background: t.navHoverBg,
                      cursor: "pointer", color: t.textMuted,
                      fontSize: isTV ? 14 : 12, fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    <Search size={14} />
                    <span>Search movies…</span>
                    <kbd style={{
                      marginLeft: 8, fontSize: 9, padding: "2px 6px",
                      border: `1px solid ${t.borderSubtle}`,
                      borderRadius: 4, color: t.textMuted,
                      fontFamily: "monospace",
                    }}>⌘K</kbd>
                  </button>
                )}
              </div>

              {/* Right */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* XP chip */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 12px", borderRadius: 99,
                  background: t.navActiveBg,
                  border: `1px solid ${t.borderAccent}`,
                }}>
                  <Zap size={12} color={t.accent} />
                  <span style={{ fontSize: isTV ? 14 : 12, fontFamily: "var(--font-display)", letterSpacing: "0.1em", color: t.accent }}>{xp} XP</span>
                </div>

                {/* Notifications */}
                <Link href="/dashboard/notifications" style={{
                  width: isTV ? 46 : 38, height: isTV ? 46 : 38,
                  borderRadius: 10, border: `1px solid ${t.borderSubtle}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative", textDecoration: "none",
                  color: t.textSecondary,
                  transition: "border-color 0.2s, color 0.2s",
                  background: t.navHoverBg,
                }}>
                  <Bell size={isTV ? 20 : 16} />
                  {notifCount > 0 && (
                    <span style={{
                      position: "absolute", top: -4, right: -4,
                      minWidth: 18, height: 18, borderRadius: 99,
                      background: t.accent, color: t.textOnAccent,
                      fontSize: 9, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'DM Sans', sans-serif",
                      boxShadow: `0 0 10px ${t.accentGlow}`,
                    }}>{notifCount}</span>
                  )}
                </Link>

                {/* Avatar */}
                <Link href="/dashboard/profile" style={{
                  width: isTV ? 46 : 38, height: isTV ? 46 : 38,
                  borderRadius: "50%", textDecoration: "none",
                  background: `linear-gradient(135deg, ${t.accent}, ${t.accentDark})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: isTV ? 16 : 13, fontWeight: 700, color: t.textOnAccent,
                  fontFamily: "'DM Sans', sans-serif",
                  boxShadow: `0 0 14px ${t.accentGlow}`,
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </Link>
              </div>
            </header>
          )}

          {/* ── MOBILE SEARCH OVERLAY ── */}
          {isMobile && searchOpen && (
            <div style={{
              position: "fixed", inset: 0, zIndex: 2000,
              background: `${t.bgBase}f5`, backdropFilter: "blur(20px)",
              display: "flex", flexDirection: "column",
              padding: "20px 16px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <div style={{
                  flex: 1, display: "flex", alignItems: "center", gap: 10,
                  padding: "12px 16px", borderRadius: 12,
                  border: `1px solid ${t.borderAccent}`,
                  background: t.navActiveBg,
                }}>
                  <Search size={16} color={t.textSecondary} />
                  <input
                    autoFocus
                    value={searchVal}
                    onChange={e => setSearchVal(e.target.value)}
                    placeholder="Search movies, genres…"
                    style={{
                      flex: 1, background: "transparent", border: "none",
                      color: t.textPrimary, fontSize: 15,
                      fontFamily: "'DM Sans', sans-serif", outline: "none",
                    }}
                  />
                </div>
                <button
                  onClick={() => { setSearchOpen(false); setSearchVal(""); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: t.textSecondary, fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}
                >
                  Cancel
                </button>
              </div>
              <div>
                <p style={{ fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: t.textMuted, marginBottom: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>Popular</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {["Action", "Drama", "Bollywood", "Nollywood", "Thriller", "Romance"].map(tag => (
                    <button key={tag} onClick={() => setSearchVal(tag)} style={{
                      padding: "8px 14px", borderRadius: 99,
                      border: `1px solid ${t.borderSubtle}`,
                      background: t.navHoverBg,
                      color: t.textSecondary, fontSize: 12,
                      fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                    }}>{tag}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── PAGE CONTENT ── */}
          <main style={{
            flex: 1,
            padding: isTV ? "40px 48px" : isMobile ? "20px 16px" : "24px 28px",
            maxWidth: isTV ? 2000 : undefined,
            // Extra bottom padding on mobile so content clears the bottom nav
            paddingBottom: isMobile ? 90 : undefined,
          }}>
            {children}
          </main>
        </div>

        {/* ── BOTTOM NAV — mobile ONLY, never on tablet/desktop/TV ── */}
        {showBottomNav && <MobileBottomNav />}
      </div>
    </LayoutContext.Provider>
  );
}

// ── MOBILE BOTTOM NAV ─────────────────────────────────────────────────────────
import { Home, Film, Compass, Library, User } from "lucide-react";
import { usePathname } from "next/navigation";

const BOTTOM_NAV = [
  { label: "Home",     href: "/dashboard",          icon: Home    },
  { label: "Movies",   href: "/dashboard/movies",   icon: Film    },
  { label: "Discover", href: "/dashboard/discover", icon: Compass },
  { label: "Library",  href: "/dashboard/library",  icon: Library },
  { label: "Profile",  href: "/dashboard/profile",  icon: User    },
];

function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useTheme();

  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      zIndex: 900, height: 72,
      background: `${t.bgSidebar}f7`,
      borderTop: `1px solid ${t.borderSubtle}`,
      backdropFilter: "blur(24px)",
      display: "flex", alignItems: "center",
    }}>
      <div style={{
        position: "absolute", top: 0, left: "15%", right: "15%", height: 1,
        background: `linear-gradient(90deg, transparent, ${t.accent} 50%, transparent)`,
        opacity: 0.45,
      }} />

      {BOTTOM_NAV.map(({ label, href, icon: Icon }) => {
        const active = href === "/dashboard"
          ? pathname === "/dashboard"
          : pathname?.startsWith(href);
        return (
          <Link key={href} href={href} style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 4,
            padding: "8px 4px", textDecoration: "none",
            position: "relative",
            WebkitTapHighlightColor: "transparent",
          }}>
            {active && (
              <span style={{
                position: "absolute", top: 0, left: "30%", right: "30%",
                height: 2, borderRadius: 99,
                background: t.accent,
                boxShadow: `0 0 8px ${t.accent}`,
              }} />
            )}
            <Icon
              size={20}
              color={active ? t.accent : t.iconInactive}
            />
            <span style={{
              fontSize: 9, fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
              letterSpacing: "0.06em", textTransform: "uppercase",
              color: active ? t.textPrimary : t.iconInactive,
            }}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
} 