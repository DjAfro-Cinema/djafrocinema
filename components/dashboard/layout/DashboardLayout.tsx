"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { Menu, X, Bell, Search, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import DashboardSidebar from "../sidebar/DashboardSidebar";

// ── LAYOUT CONTEXT ───────────────────────────────────────────────────────────
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
  if (w < 768) return "mobile";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop" | "tv">("desktop");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

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

  // Close drawer on mobile route change
  useEffect(() => {
    if (screenSize === "mobile") setSidebarOpen(false);
  }, [screenSize]);

  // Lock body scroll when mobile drawer open
  useEffect(() => {
    document.body.style.overflow = sidebarOpen && screenSize === "mobile" ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen, screenSize]);

  // Keyboard shortcut: Cmd/Ctrl+K = search
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(v => !v); }
      if (e.key === "Escape") { setSearchOpen(false); setSearchVal(""); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const isMobile = screenSize === "mobile";
  const isTablet = screenSize === "tablet";
  const isTV = screenSize === "tv";

  // On mobile/tablet, sidebar is a drawer overlay
  // On desktop/TV, sidebar is fixed inline
  const showInlineSidebar = !isMobile && !isTablet;

  return (
    <LayoutContext.Provider value={{ sidebarOpen, setSidebarOpen, screenSize, sidebarCollapsed }}>
      <div style={{
        minHeight: "100svh",
        background: "#060608",
        display: "flex",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {/* ── INLINE SIDEBAR (desktop / TV) ── */}
        {showInlineSidebar && (
          <DashboardSidebar user={user} xp={xp} xpMax={xpMax} />
        )}

        {/* ── MOBILE/TABLET DRAWER BACKDROP ── */}
        {(isMobile || isTablet) && (
          <div
            aria-hidden
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 1100,
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(6px)",
              opacity: sidebarOpen ? 1 : 0,
              pointerEvents: sidebarOpen ? "auto" : "none",
              transition: "opacity 0.3s ease",
            }}
          />
        )}

        {/* ── MOBILE/TABLET DRAWER ── */}
        {(isMobile || isTablet) && (
          <div style={{
            position: "fixed", top: 0, left: 0, bottom: 0,
            zIndex: 1200,
            width: isMobile ? "80vw" : 280,
            maxWidth: 320,
            transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1)",
          }}>
            <DashboardSidebar user={user} xp={xp} xpMax={xpMax} />
          </div>
        )}

        {/* ── MAIN CONTENT COLUMN ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

          {/* ── TOP BAR (mobile/tablet) ── */}
          {(isMobile || isTablet) && (
            <header style={{
              position: "sticky", top: 0, zIndex: 800,
              height: 60,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0 16px",
              background: scrolled ? "rgba(6,6,8,0.97)" : "rgba(6,6,8,0.85)",
              backdropFilter: scrolled ? "blur(20px)" : "blur(12px)",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              transition: "background 0.3s",
            }}>
              {/* Hamburger */}
              <button
                onClick={() => setSidebarOpen(v => !v)}
                style={{
                  width: 38, height: 38,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)",
                  background: "transparent", cursor: "pointer",
                  color: "rgba(255,255,255,0.6)",
                  transition: "background 0.2s, color 0.2s",
                }}
              >
                {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
              </button>

              {/* Logo */}
              <div style={{ position: "relative", height: 30, width: 110 }}>
                <Image
                  src="/logo.png"
                  alt="DjAfro Cinema"
                  fill
                  className="object-contain"
                  style={{ filter: "drop-shadow(0 0 8px rgba(229,9,20,0.4))" }}
                />
              </div>

              {/* Right actions */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button
                  onClick={() => setSearchOpen(v => !v)}
                  style={{
                    width: 38, height: 38,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)",
                    background: "transparent", cursor: "pointer",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  <Search size={16} />
                </button>
                <Link href="/dashboard/notifications" style={{
                  width: 38, height: 38, borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative", textDecoration: "none",
                  color: "rgba(255,255,255,0.6)",
                }}>
                  <Bell size={16} />
                  {notifCount > 0 && (
                    <span style={{
                      position: "absolute", top: 6, right: 6,
                      width: 8, height: 8, borderRadius: "50%",
                      background: "#e50914",
                      boxShadow: "0 0 6px #e50914",
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
              background: scrolled ? "rgba(6,6,8,0.97)" : "transparent",
              backdropFilter: scrolled ? "blur(20px)" : "none",
              borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none",
              transition: "background 0.35s, backdrop-filter 0.35s",
            }}>
              {/* Search */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, maxWidth: isTV ? 600 : 400 }}>
                {searchOpen ? (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    flex: 1, padding: "9px 14px",
                    borderRadius: 10, border: "1px solid rgba(229,9,20,0.3)",
                    background: "rgba(229,9,20,0.05)",
                  }}>
                    <Search size={14} color="rgba(255,255,255,0.4)" />
                    <input
                      autoFocus
                      value={searchVal}
                      onChange={e => setSearchVal(e.target.value)}
                      placeholder="Search movies, genres…"
                      style={{
                        flex: 1, background: "transparent", border: "none",
                        color: "#fff", fontSize: isTV ? 16 : 13,
                        fontFamily: "'DM Sans', sans-serif", outline: "none",
                      }}
                    />
                    <button onClick={() => { setSearchOpen(false); setSearchVal(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)" }}>
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSearchOpen(true)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 14px", borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.07)",
                      background: "rgba(255,255,255,0.02)",
                      cursor: "pointer", color: "rgba(255,255,255,0.3)",
                      fontSize: isTV ? 14 : 12, fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    <Search size={14} />
                    <span>Search movies…</span>
                    <kbd style={{
                      marginLeft: 8, fontSize: 9, padding: "2px 6px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 4, color: "rgba(255,255,255,0.2)",
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
                  background: "rgba(229,9,20,0.08)",
                  border: "1px solid rgba(229,9,20,0.15)",
                }}>
                  <Zap size={12} color="#e50914" />
                  <span style={{ fontSize: isTV ? 14 : 12, fontFamily: "var(--font-display)", letterSpacing: "0.1em", color: "#e50914" }}>{xp} XP</span>
                </div>

                {/* Notifications */}
                <Link href="/dashboard/notifications" style={{
                  width: isTV ? 46 : 38, height: isTV ? 46 : 38,
                  borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative", textDecoration: "none",
                  color: "rgba(255,255,255,0.55)",
                  transition: "border-color 0.2s, color 0.2s",
                  background: "rgba(255,255,255,0.02)",
                }}>
                  <Bell size={isTV ? 20 : 16} />
                  {notifCount > 0 && (
                    <span style={{
                      position: "absolute", top: -4, right: -4,
                      minWidth: 18, height: 18, borderRadius: 99,
                      background: "#e50914", color: "#fff",
                      fontSize: 9, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'DM Sans', sans-serif",
                      boxShadow: "0 0 10px rgba(229,9,20,0.6)",
                    }}>{notifCount}</span>
                  )}
                </Link>

                {/* Avatar */}
                <Link href="/dashboard/profile" style={{
                  width: isTV ? 46 : 38, height: isTV ? 46 : 38,
                  borderRadius: "50%", textDecoration: "none",
                  background: "linear-gradient(135deg, #e50914, #c20710)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: isTV ? 16 : 13, fontWeight: 700, color: "#fff",
                  fontFamily: "'DM Sans', sans-serif",
                  boxShadow: "0 0 14px rgba(229,9,20,0.35)",
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
              background: "rgba(6,6,8,0.96)", backdropFilter: "blur(20px)",
              display: "flex", flexDirection: "column",
              padding: "20px 16px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <div style={{
                  flex: 1, display: "flex", alignItems: "center", gap: 10,
                  padding: "12px 16px", borderRadius: 12,
                  border: "1px solid rgba(229,9,20,0.3)",
                  background: "rgba(229,9,20,0.05)",
                }}>
                  <Search size={16} color="rgba(255,255,255,0.4)" />
                  <input
                    autoFocus
                    value={searchVal}
                    onChange={e => setSearchVal(e.target.value)}
                    placeholder="Search movies, genres…"
                    style={{
                      flex: 1, background: "transparent", border: "none",
                      color: "#fff", fontSize: 15,
                      fontFamily: "'DM Sans', sans-serif", outline: "none",
                    }}
                  />
                </div>
                <button
                  onClick={() => { setSearchOpen(false); setSearchVal(""); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}
                >
                  Cancel
                </button>
              </div>
              <div>
                <p style={{ fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginBottom: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>Popular</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {["Action", "Drama", "Bollywood", "Nollywood", "Thriller", "Romance"].map(t => (
                    <button key={t} onClick={() => setSearchVal(t)} style={{
                      padding: "8px 14px", borderRadius: 99,
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.03)",
                      color: "rgba(255,255,255,0.5)", fontSize: 12,
                      fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                    }}>{t}</button>
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
            paddingBottom: isMobile ? 90 : undefined, // space for bottom bar on mobile
          }}>
            {children}
          </main>
        </div>

        {/* ── MOBILE BOTTOM NAV ── */}
        {isMobile && (
          <MobileBottomNav />
        )}
      </div>
    </LayoutContext.Provider>
  );
}

// ── MOBILE BOTTOM NAV ────────────────────────────────────────────────────────
import { Home, Film, Compass, Library, User } from "lucide-react";
import { usePathname } from "next/navigation";

const BOTTOM_NAV = [
  { label: "Home",     href: "/dashboard",         icon: Home },
  { label: "Movies",   href: "/dashboard/movies",  icon: Film },
  { label: "Discover", href: "/dashboard/discover", icon: Compass },
  { label: "Library",  href: "/dashboard/library", icon: Library },
  { label: "Profile",  href: "/dashboard/profile", icon: User },
];

function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      zIndex: 900, height: 72,
      background: "rgba(6,6,8,0.97)",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      backdropFilter: "blur(24px)",
      display: "flex", alignItems: "center",
    }}>
      {/* Red ambient line */}
      <div style={{
        position: "absolute", top: 0, left: "15%", right: "15%", height: 1,
        background: "linear-gradient(90deg, transparent, #e50914 50%, transparent)",
        opacity: 0.45,
      }} />

      {BOTTOM_NAV.map(({ label, href, icon: Icon }) => {
        const active = href === "/dashboard" ? pathname === "/dashboard" : pathname?.startsWith(href);
        return (
          <Link key={href} href={href} style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 4,
            padding: "8px 4px", textDecoration: "none",
            position: "relative",
          }}>
            {active && (
              <span style={{
                position: "absolute", top: 0, left: "30%", right: "30%",
                height: 2, borderRadius: 99,
                background: "#e50914",
                boxShadow: "0 0 8px #e50914",
              }} />
            )}
            <Icon
              size={20}
              color={active ? "#e50914" : "rgba(255,255,255,0.35)"}
            />
            <span style={{
              fontSize: 9, fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
              letterSpacing: "0.06em", textTransform: "uppercase",
              color: active ? "#fff" : "rgba(255,255,255,0.3)",
            }}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}