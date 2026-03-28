"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Film, Compass, Library, User,
  Bell, Settings, LogOut, ChevronLeft,
  Clapperboard,
} from "lucide-react";

// ── NAV CONFIG ────────────────────────────────────────────────────────────────

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

// ── TYPES ─────────────────────────────────────────────────────────────────────

export interface DashboardSidebarProps {
  user?: { name: string; email: string };
  collapsed?: boolean;
  onCollapsedChange?: (v: boolean) => void;
}

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
// Render ONLY on desktop (≥1024px). The page handles the guard.

export default function DashboardSidebar({
  user = { name: "Mwangi", email: "mwangi@djafro.co.ke" },
  collapsed = false,
  onCollapsedChange,
}: DashboardSidebarProps) {
  const pathname = usePathname() ?? "";

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  const SIDEBAR_W   = collapsed ? 72  : 244;
  const GAP         = 10; // px from screen edges
  const SPACER_W    = SIDEBAR_W + GAP * 2; // content margin

  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <>
      {/* ── FLOATING SIDEBAR PANEL ── */}
      <aside
        style={{
          position: "fixed",
          top: GAP,
          left: GAP,
          bottom: GAP,
          width: SIDEBAR_W,
          zIndex: 900,
          borderRadius: 18,
          background: "#111113",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: [
            "0 0 0 1px rgba(0,0,0,0.5)",
            "0 24px 64px rgba(0,0,0,0.6)",
            "0 4px 20px rgba(0,0,0,0.35)",
          ].join(", "),
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transition: "width 0.28s cubic-bezier(0.25,1,0.5,1)",
          willChange: "width",
        }}
      >
        {/* Red accent hairline at top */}
        <div style={{
          position: "absolute",
          top: 0, left: "18%", right: "18%",
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(229,9,20,0.6), transparent)",
          pointerEvents: "none",
        }} />

        {/* ── LOGO ── */}
        <div style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 10,
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          flexShrink: 0,
          overflow: "hidden",
        }}>
          {/* Icon badge */}
          <div style={{
            width: 34, height: 34,
            borderRadius: 10,
            background: "linear-gradient(145deg, #e50914 0%, #8b060d 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 0 0 1px rgba(229,9,20,0.25), 0 6px 18px rgba(229,9,20,0.28)",
          }}>
            <Clapperboard size={15} color="#fff" strokeWidth={2.2} />
          </div>

          {/* Wordmark fades out when collapsed */}
          <div style={{
            overflow: "hidden",
            flex: 1,
            opacity: collapsed ? 0 : 1,
            transition: "opacity 0.18s ease",
            pointerEvents: collapsed ? "none" : "auto",
            whiteSpace: "nowrap",
          }}>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 16,
              letterSpacing: "0.09em",
              lineHeight: 1,
            }}>
              <span style={{ color: "#e50914" }}>DJ</span>
              <span style={{ color: "#e8e8e8" }}>AFRO</span>
              <span style={{ color: "rgba(255,255,255,0.3)", marginLeft: 4 }}>CINEMA</span>
            </div>
          </div>
        </div>

        {/* ── NAV AREA ── */}
        <nav style={{
          flex: 1,
          padding: "8px 8px",
          display: "flex",
          flexDirection: "column",
          gap: 0,
          overflowY: "auto",
          scrollbarWidth: "none",
        }}>
          {/* Main section */}
          {!collapsed && <SectionLabel>Main</SectionLabel>}
          {NAV_MAIN.map(item => (
            <NavLink
              key={item.href}
              {...item}
              active={isActive(item.href)}
              collapsed={collapsed}
            />
          ))}

          <div style={{ height: 1, background: "rgba(255,255,255,0.055)", margin: "8px 6px" }} />

          {/* General section */}
          {!collapsed && <SectionLabel>General</SectionLabel>}
          {NAV_GENERAL.map(item => (
            <NavLink
              key={item.href}
              {...item}
              active={isActive(item.href)}
              collapsed={collapsed}
            />
          ))}
        </nav>

        {/* ── USER FOOTER ── */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          padding: "8px 8px",
          flexShrink: 0,
        }}>
          {/* Profile link */}
          <FooterRow
            as="link"
            href="/dashboard/profile"
            title={collapsed ? user.name : undefined}
            collapsed={collapsed}
          >
            <div style={{
              width: 32, height: 32,
              borderRadius: "50%",
              background: "linear-gradient(145deg, #e50914, #8b060d)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: "#fff",
              fontFamily: "'DM Sans', sans-serif",
              flexShrink: 0,
              boxShadow: "0 0 0 2px rgba(229,9,20,0.18)",
              letterSpacing: "0.03em",
            }}>
              {initials || "?"}
            </div>
            {!collapsed && (
              <div style={{ overflow: "hidden", flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: 500,
                  color: "rgba(255,255,255,0.82)",
                  fontFamily: "'DM Sans', sans-serif",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  lineHeight: 1.3,
                }}>{user.name}</div>
                <div style={{
                  fontSize: 10.5, color: "rgba(255,255,255,0.28)",
                  fontFamily: "'DM Sans', sans-serif",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  lineHeight: 1.4, marginTop: 1,
                }}>{user.email}</div>
              </div>
            )}
          </FooterRow>

          {/* Sign out */}
          <FooterRow as="button" title={collapsed ? "Sign out" : undefined} collapsed={collapsed}>
            <LogOut size={16} color="rgba(255,255,255,0.26)" strokeWidth={1.8} />
            {!collapsed && (
              <span style={{
                fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                fontWeight: 400, color: "rgba(255,255,255,0.3)",
              }}>Sign out</span>
            )}
          </FooterRow>
        </div>
      </aside>

      {/* ── COLLAPSE TOGGLE — pill on the right edge ── */}
      <button
        onClick={() => onCollapsedChange?.(!collapsed)}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        style={{
          position: "fixed",
          // sits right at the edge of the sidebar
          left: GAP + SIDEBAR_W - 11,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 901,
          width: 22,
          height: 48,
          borderRadius: 11,
          background: "#1d1d20",
          border: "1px solid rgba(255,255,255,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          color: "rgba(255,255,255,0.38)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.3)",
          transition:
            "left 0.28s cubic-bezier(0.25,1,0.5,1), background 0.15s, color 0.15s",
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.background = "#262629";
          el.style.color = "rgba(255,255,255,0.75)";
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.background = "#1d1d20";
          el.style.color = "rgba(255,255,255,0.38)";
        }}
      >
        <ChevronLeft
          size={13}
          style={{
            transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.28s cubic-bezier(0.25,1,0.5,1)",
          }}
        />
      </button>

      {/* ── LAYOUT SPACER ── */}
      {/* Pushes the flex content column to the right of the sidebar */}
      <div
        aria-hidden
        style={{
          width: SPACER_W,
          flexShrink: 0,
          transition: "width 0.28s cubic-bezier(0.25,1,0.5,1)",
          pointerEvents: "none",
          minWidth: SPACER_W,
        }}
      />
    </>
  );
}

// ── HELPER COMPONENTS ─────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 9.5,
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: 700,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.18)",
      padding: "10px 12px 5px",
      userSelect: "none",
    }}>
      {children}
    </div>
  );
}

interface NavLinkProps {
  href: string;
  label: string;
  Icon: React.ElementType;
  active: boolean;
  collapsed: boolean;
  badge?: number;
}

function NavLink({ href, label, Icon, active, collapsed, badge = 0 }: NavLinkProps) {
  const baseStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 11,
    padding: collapsed ? "11px 17px" : "10px 12px",
    borderRadius: 10,
    textDecoration: "none",
    position: "relative",
    justifyContent: collapsed ? "center" : "flex-start",
    background: active ? "rgba(229,9,20,0.1)" : "transparent",
    transition: "background 0.15s",
    marginBottom: 1,
  };

  return (
    <Link href={href} title={collapsed ? label : undefined} style={baseStyle}
      onMouseEnter={e => {
        if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = active ? "rgba(229,9,20,0.1)" : "transparent";
      }}
    >
      {/* Active indicator bar */}
      {active && (
        <span style={{
          position: "absolute",
          left: 0, top: "18%", bottom: "18%",
          width: 3,
          borderRadius: "0 3px 3px 0",
          background: "#e50914",
          boxShadow: "0 0 10px rgba(229,9,20,0.65)",
        }} />
      )}

      {/* Icon */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <Icon
          size={17}
          strokeWidth={active ? 2.1 : 1.7}
          color={active ? "#e50914" : "rgba(255,255,255,0.38)"}
        />
        {badge > 0 && (
          <span style={{
            position: "absolute",
            top: -5, right: -6,
            minWidth: 15, height: 15,
            borderRadius: 99,
            background: "#e50914",
            color: "#fff",
            fontSize: 8.5, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'DM Sans', sans-serif",
            padding: "0 2.5px",
          }}>{badge}</span>
        )}
      </div>

      {/* Label */}
      {!collapsed && (
        <span style={{
          fontSize: 13.5,
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: active ? 600 : 400,
          color: active ? "#f0f0f0" : "rgba(255,255,255,0.45)",
          whiteSpace: "nowrap",
          flex: 1,
          lineHeight: 1,
        }}>{label}</span>
      )}

      {/* Active dot */}
      {active && !collapsed && (
        <span style={{
          width: 5, height: 5,
          borderRadius: "50%",
          background: "#e50914",
          boxShadow: "0 0 7px rgba(229,9,20,0.8)",
          flexShrink: 0,
        }} />
      )}
    </Link>
  );
}

// Footer row — shared styles for user + sign-out rows

interface FooterRowProps {
  as: "link" | "button";
  href?: string;
  title?: string;
  collapsed: boolean;
  children: React.ReactNode;
}

function FooterRow({ as, href, title, collapsed, children }: FooterRowProps) {
  const baseStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: collapsed ? "10px 17px" : "9px 12px",
    borderRadius: 10,
    textDecoration: "none",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    width: "100%",
    justifyContent: collapsed ? "center" : "flex-start",
    transition: "background 0.15s",
    marginBottom: 1,
  };

  const hover = (e: React.MouseEvent, enter: boolean) => {
    (e.currentTarget as HTMLElement).style.background = enter
      ? "rgba(255,255,255,0.04)"
      : "transparent";
  };

  if (as === "link" && href) {
    return (
      <Link
        href={href}
        title={title}
        style={baseStyle}
        onMouseEnter={e => hover(e, true)}
        onMouseLeave={e => hover(e, false)}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      title={title}
      style={baseStyle}
      onMouseEnter={e => hover(e, true)}
      onMouseLeave={e => hover(e, false)}
    >
      {children}
    </button>
  );
}