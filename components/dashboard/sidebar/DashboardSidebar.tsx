"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Film, Compass, Library, User,
  Bell, Settings, LogOut, ChevronRight,
  Clapperboard,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

const NAV_MAIN = [
  { label: "Home",     href: "/dashboard",          Icon: Home },
  { label: "Movies",   href: "/dashboard/movies",   Icon: Film },
  { label: "Discover", href: "/dashboard/discover", Icon: Compass },
  { label: "Library",  href: "/dashboard/library",  Icon: Library },
  { label: "Profile",  href: "/dashboard/profile",  Icon: User },
];

const NAV_GENERAL = [
  { label: "Notifications", href: "/dashboard/notifications", Icon: Bell,     badge: 2 },
  { label: "Settings",      href: "/dashboard/settings",      Icon: Settings, badge: 0 },
];

export interface DashboardSidebarProps {
  user?: { name: string; email: string };
  collapsed?: boolean;
  onCollapsedChange?: (v: boolean) => void;
}

const W_EXPANDED  = 200;
const W_COLLAPSED = 60;

// ── PORTAL TOOLTIP ────────────────────────────────────────────────────────────
// Renders into document.body so it's never clipped by overflow:hidden parents

function PortalTooltip({ label, anchorRef }: { label: string; anchorRef: React.RefObject<HTMLElement | null> }) {
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (anchorRef.current) {
      const r = anchorRef.current.getBoundingClientRect();
      setPos({
        top:  r.top + r.height / 2,
        left: r.right + 12,
      });
    }
  }, [anchorRef]);

  if (!mounted) return null;

  return createPortal(
    <div style={{
      position: "fixed",
      top: pos.top,
      left: pos.left,
      transform: "translateY(-50%)",
      background: "#1c1c1f",
      border: "1px solid rgba(255,255,255,0.09)",
      borderRadius: 8,
      padding: "5px 12px",
      whiteSpace: "nowrap",
      fontSize: 12,
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: 500,
      color: "rgba(255,255,255,0.82)",
      pointerEvents: "none",
      zIndex: 99999,
      boxShadow: "0 6px 24px rgba(0,0,0,0.6)",
      letterSpacing: "0.01em",
    }}>
      {/* Arrow */}
      <span style={{
        position: "absolute",
        right: "100%",
        top: "50%",
        transform: "translateY(-50%)",
        width: 0, height: 0,
        borderTop: "5px solid transparent",
        borderBottom: "5px solid transparent",
        borderRight: "6px solid #1c1c1f",
      }} />
      {label}
    </div>,
    document.body
  );
}

// ── NAV ITEM ──────────────────────────────────────────────────────────────────

function NavItem({
  href, label, Icon, active, collapsed, badge = 0,
}: {
  href: string; label: string; Icon: React.ElementType;
  active: boolean; collapsed: boolean; badge?: number;
}) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLAnchorElement>(null);

  return (
    <>
      <Link
        ref={ref}
        href={href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 9,
          padding: collapsed ? "10px 0" : "9px 12px",
          justifyContent: collapsed ? "center" : "flex-start",
          borderRadius: 9,
          textDecoration: "none",
          background: active
            ? "rgba(229,9,20,0.1)"
            : hovered
            ? "rgba(255,255,255,0.04)"
            : "transparent",
          transition: "background 0.13s",
          marginBottom: 1,
        }}
      >
        {active && (
          <span style={{
            position: "absolute",
            left: 0, top: "22%", bottom: "22%",
            width: 2.5,
            borderRadius: "0 3px 3px 0",
            background: "#e50914",
            boxShadow: "0 0 8px rgba(229,9,20,0.7)",
          }} />
        )}

        <div style={{ position: "relative", flexShrink: 0 }}>
          <Icon
            size={15}
            strokeWidth={active ? 2.2 : 1.6}
            color={active ? "#e50914" : hovered ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.32)"}
            style={{ transition: "color 0.13s", display: "block" }}
          />
          {badge > 0 && (
            <span style={{
              position: "absolute",
              top: -5, right: -6,
              minWidth: 14, height: 14,
              borderRadius: 99,
              background: "#e50914",
              color: "#fff",
              fontSize: 7.5, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'DM Sans', sans-serif",
              padding: "0 2px",
            }}>{badge}</span>
          )}
        </div>

        {!collapsed && (
          <span style={{
            flex: 1,
            fontSize: 12.5,
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: active ? 600 : 400,
            color: active ? "#f0f0f0" : hovered ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.38)",
            whiteSpace: "nowrap",
            letterSpacing: "0.01em",
            transition: "color 0.13s",
          }}>{label}</span>
        )}

        {active && !collapsed && (
          <span style={{
            width: 4, height: 4, borderRadius: "50%",
            background: "#e50914",
            boxShadow: "0 0 6px rgba(229,9,20,0.9)",
            flexShrink: 0,
          }} />
        )}
      </Link>

      {/* Portal tooltip — outside all overflow:hidden containers */}
      {collapsed && hovered && <PortalTooltip label={label} anchorRef={ref} />}
    </>
  );
}

// ── FOOTER ROW (profile + signout) ────────────────────────────────────────────

function FooterNavItem({
  label, hovered, onEnter, onLeave, collapsed, anchorRef, children,
}: {
  label: string;
  hovered: boolean;
  onEnter: () => void;
  onLeave: () => void;
  collapsed: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
}) {
  return (
    <>
      <div
        ref={anchorRef as React.RefObject<HTMLDivElement>}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        style={{ position: "relative" }}
      >
        {children}
      </div>
      {collapsed && hovered && <PortalTooltip label={label} anchorRef={anchorRef} />}
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 8.5,
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: 700,
      letterSpacing: "0.22em",
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.14)",
      padding: "10px 12px 4px",
      userSelect: "none",
    }}>
      {children}
    </div>
  );
}

// ── SIDEBAR ───────────────────────────────────────────────────────────────────

export default function DashboardSidebar({
  user = { name: "Mwangi", email: "mwangi@djafro.co.ke" },
  collapsed = false,
  onCollapsedChange,
}: DashboardSidebarProps) {
  const pathname = usePathname() ?? "";
  const [logoutHovered, setLogoutHovered]   = useState(false);
  const [profileHovered, setProfileHovered] = useState(false);
  const [toggleHovered, setToggleHovered]   = useState(false);
  const profileRef = useRef<HTMLElement>(null);
  const logoutRef  = useRef<HTMLElement>(null);

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  const W      = collapsed ? W_COLLAPSED : W_EXPANDED;
  const SPACER = W + 8;

  const initials = user.name
    .split(" ").slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <>
      <aside
        style={{
          position: "fixed",
          top: 8, left: 0, bottom: 8,
          width: W,
          zIndex: 900,
          borderRadius: "0 14px 14px 0",
          background: "linear-gradient(180deg, #111114 0%, #0d0d0f 100%)",
          border: "1px solid rgba(255,255,255,0.05)",
          borderLeft: "none",
          boxShadow: "4px 0 32px rgba(0,0,0,0.5), inset -1px 0 0 rgba(255,255,255,0.025)",
          display: "flex",
          flexDirection: "column",
          // NOTE: overflow must be visible on the aside itself so portal tooltips
          // are never clipped. The inner wrapper handles visual clipping.
          overflow: "visible",
          transition: "width 0.25s cubic-bezier(0.25,1,0.5,1)",
          willChange: "width",
        }}
      >
        {/* Visual clip wrapper — clips the background/border-radius only */}
        <div style={{
          position: "absolute",
          inset: 0,
          borderRadius: "0 14px 14px 0",
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 0,
          background: "linear-gradient(180deg, #111114 0%, #0d0d0f 100%)",
        }} />

        {/* Red hairline */}
        <div style={{
          position: "absolute",
          top: 0, left: "10%", right: "10%",
          height: 1, zIndex: 1,
          background: "linear-gradient(90deg, transparent, rgba(229,9,20,0.5), transparent)",
          pointerEvents: "none",
          borderRadius: "0 14px 0 0",
        }} />

        {/* All interactive content sits above the clip overlay */}
        <div style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}>

          {/* ── LOGO ── */}
          <div style={{
            height: 58,
            display: "flex",
            alignItems: "center",
            padding: collapsed ? "0" : "0 14px",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: 9,
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            flexShrink: 0,
          }}>
            <div style={{
              width: 28, height: 28,
              borderRadius: 8,
              background: "linear-gradient(145deg, #e50914, #7d050c)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 0 0 1px rgba(229,9,20,0.2), 0 4px 12px rgba(229,9,20,0.28)",
            }}>
              <Clapperboard size={12} color="#fff" strokeWidth={2.3} />
            </div>

            <div style={{
              overflow: "hidden",
              opacity: collapsed ? 0 : 1,
              maxWidth: collapsed ? 0 : 140,
              transition: "opacity 0.15s, max-width 0.15s",
              whiteSpace: "nowrap",
              pointerEvents: collapsed ? "none" : "auto",
            }}>
              <span style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 14.5,
                letterSpacing: "0.1em",
                lineHeight: 1,
              }}>
                <span style={{ color: "#e50914" }}>DJ</span>
                <span style={{ color: "#ddd" }}>AFRO</span>
                <span style={{ color: "rgba(255,255,255,0.22)", marginLeft: 4 }}>CINEMA</span>
              </span>
            </div>
          </div>

          {/* ── NAV ── */}
          <nav style={{
            flex: 1,
            padding: collapsed ? "8px 5px" : "8px 7px",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            overflowX: "visible",
            scrollbarWidth: "none",
          }}>
            {!collapsed && <SectionLabel>Main</SectionLabel>}
            {NAV_MAIN.map(item => (
              <NavItem key={item.href} {...item} active={isActive(item.href)} collapsed={collapsed} />
            ))}

            <div style={{ height: 1, background: "rgba(255,255,255,0.045)", margin: "5px 6px" }} />

            {!collapsed && <SectionLabel>General</SectionLabel>}
            {NAV_GENERAL.map(item => (
              <NavItem key={item.href} {...item} active={isActive(item.href)} collapsed={collapsed} />
            ))}
          </nav>

          {/* ── FOOTER ── */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.04)",
            padding: collapsed ? "7px 5px" : "7px 7px",
            flexShrink: 0,
          }}>
            {/* Profile */}
            <FooterNavItem
              label={user.name}
              hovered={profileHovered}
              onEnter={() => setProfileHovered(true)}
              onLeave={() => setProfileHovered(false)}
              collapsed={collapsed}
              anchorRef={profileRef}
            >
              <Link
                href="/dashboard/profile"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: collapsed ? "9px 0" : "8px 10px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: 9,
                  textDecoration: "none",
                  background: profileHovered ? "rgba(255,255,255,0.04)" : "transparent",
                  transition: "background 0.13s",
                  marginBottom: 2,
                }}
              >
                <div style={{
                  width: 28, height: 28,
                  borderRadius: "50%",
                  background: "linear-gradient(145deg, #e50914, #7d050c)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 700, color: "#fff",
                  fontFamily: "'DM Sans', sans-serif",
                  flexShrink: 0,
                  boxShadow: "0 0 0 1.5px rgba(229,9,20,0.25)",
                }}>{initials || "?"}</div>

                {!collapsed && (
                  <div style={{ overflow: "hidden", flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 12, fontWeight: 500,
                      color: "rgba(255,255,255,0.78)",
                      fontFamily: "'DM Sans', sans-serif",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>{user.name}</div>
                    <div style={{
                      fontSize: 9.5, color: "rgba(255,255,255,0.22)",
                      fontFamily: "'DM Sans', sans-serif",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      marginTop: 1,
                    }}>{user.email}</div>
                  </div>
                )}
              </Link>
            </FooterNavItem>

            {/* Sign out */}
            <FooterNavItem
              label="Sign out"
              hovered={logoutHovered}
              onEnter={() => setLogoutHovered(true)}
              onLeave={() => setLogoutHovered(false)}
              collapsed={collapsed}
              anchorRef={logoutRef}
            >
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: collapsed ? "9px 0" : "8px 10px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: 9,
                  background: logoutHovered ? "rgba(229,9,20,0.06)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  width: "100%",
                  transition: "background 0.13s",
                }}
              >
                <LogOut
                  size={14}
                  color={logoutHovered ? "rgba(229,9,20,0.65)" : "rgba(255,255,255,0.2)"}
                  strokeWidth={1.8}
                  style={{ transition: "color 0.13s", flexShrink: 0 }}
                />
                {!collapsed && (
                  <span style={{
                    fontSize: 12,
                    fontFamily: "'DM Sans', sans-serif",
                    color: logoutHovered ? "rgba(229,9,20,0.65)" : "rgba(255,255,255,0.26)",
                    transition: "color 0.13s",
                  }}>Sign out</span>
                )}
              </button>
            </FooterNavItem>
          </div>
        </div>
      </aside>

      {/* ── COLLAPSE TOGGLE ── */}
      <button
        onClick={() => onCollapsedChange?.(!collapsed)}
        onMouseEnter={() => setToggleHovered(true)}
        onMouseLeave={() => setToggleHovered(false)}
        title={collapsed ? "Expand" : "Collapse"}
        style={{
          position: "fixed",
          left: W - 9,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 902,
          width: 18, height: 40,
          borderRadius: 9,
          background: toggleHovered ? "#222225" : "#17171a",
          border: "1px solid rgba(255,255,255,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          color: toggleHovered ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.28)",
          boxShadow: "2px 0 12px rgba(0,0,0,0.4)",
          transition: "left 0.25s cubic-bezier(0.25,1,0.5,1), background 0.13s, color 0.13s",
          padding: 0,
        }}
      >
        <ChevronRight
          size={11}
          style={{
            transform: collapsed ? "rotate(0deg)" : "rotate(180deg)",
            transition: "transform 0.25s cubic-bezier(0.25,1,0.5,1)",
          }}
        />
      </button>

      {/* ── LAYOUT SPACER ── */}
      <div
        aria-hidden
        style={{
          width: SPACER,
          flexShrink: 0,
          transition: "width 0.25s cubic-bezier(0.25,1,0.5,1)",
          pointerEvents: "none",
          minWidth: SPACER,
        }}
      />
    </>
  );
}