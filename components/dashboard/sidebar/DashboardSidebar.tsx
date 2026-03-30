"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Film,
  Compass,
  BookOpen,
  User,
  Settings,
  LogOut,
  ChevronRight,
  Star,
  Palette,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";
import ThemeToggle, { type ThemeToggleHandle } from "@/components/ui/ThemeToggle";

// ── NAV CONFIG ────────────────────────────────────────────────────────────────

const NAV_MAIN = [
  { label: "Home",     href: "/dashboard",          Icon: Home     },
  { label: "Movies",   href: "/dashboard/movies",   Icon: Film     },
  { label: "Discover", href: "/dashboard/discover", Icon: Compass  },
  { label: "Library",  href: "/dashboard/library",  Icon: BookOpen },
  { label: "Profile",  href: "/dashboard/profile",  Icon: User     },
];

const NAV_GENERAL = [
  { label: "Settings", href: "/dashboard/settings", Icon: Settings, badge: 0 },
];

export interface DashboardSidebarProps {
  user?: { name: string; email: string; avStyle?: string; avSeed?: string };
  collapsed?: boolean;
  onCollapsedChange?: (v: boolean) => void;
}

const W_EXPANDED  = 178;
const W_COLLAPSED = 52;
const BORDER_RADIUS = "0 32px 32px 0";

function dicebearUrl(style: string, seed: string) {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=0a0a0f`;
}

// ── PORTAL TOOLTIP ─────────────────────────────────────────────────────────────

function PortalTooltip({
  label,
  anchorRef,
}: {
  label: string;
  anchorRef: React.RefObject<HTMLElement | null>;
}) {
  const { t } = useTheme();
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (anchorRef.current) {
      const r = anchorRef.current.getBoundingClientRect();
      setPos({ top: r.top + r.height / 2, left: r.right + 14 });
    }
  }, [anchorRef]);

  if (!mounted) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        transform: "translateY(-50%)",
        background: t.bgElevated,
        border: `1px solid ${t.borderAccent}`,
        borderRadius: 8,
        padding: "6px 14px",
        whiteSpace: "nowrap",
        fontSize: 11.5,
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 500,
        color: t.textPrimary,
        pointerEvents: "none",
        zIndex: 99999,
        boxShadow: `0 8px 32px rgba(0,0,0,0.7), 0 0 0 1px ${t.borderSubtle}`,
        letterSpacing: "0.02em",
        backdropFilter: "blur(12px)",
        animation: "tooltipIn 0.15s cubic-bezier(0.34,1.56,0.64,1) forwards",
      }}
    >
      <style>{`
        @keyframes tooltipIn {
          from { opacity: 0; transform: translateY(-50%) translateX(-6px); }
          to   { opacity: 1; transform: translateY(-50%) translateX(0); }
        }
      `}</style>
      <span style={{
        position: "absolute", right: "100%", top: "50%",
        transform: "translateY(-50%)",
        width: 0, height: 0,
        borderTop: "5px solid transparent",
        borderBottom: "5px solid transparent",
        borderRight: `6px solid ${t.borderAccent}`,
      }} />
      <span style={{
        position: "absolute", right: "calc(100% - 1px)", top: "50%",
        transform: "translateY(-50%)",
        width: 0, height: 0,
        borderTop: "4px solid transparent",
        borderBottom: "4px solid transparent",
        borderRight: `5px solid ${t.bgElevated}`,
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
  const { t } = useTheme();
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
          gap: 10,
          padding: collapsed ? "11px 0" : "9px 13px",
          justifyContent: collapsed ? "center" : "flex-start",
          borderRadius: 10,
          textDecoration: "none",
          background: active
            ? t.navActiveBg
            : hovered
            ? t.navHoverBg
            : "transparent",
          transition: "background 0.18s ease, transform 0.15s ease",
          marginBottom: 1,
          transform: hovered && !active ? "translateX(2px)" : "translateX(0)",
          overflow: "hidden",
        }}
      >
        {active && (
          <span style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(90deg, ${t.navActiveBg} 0%, transparent 70%)`,
            borderRadius: 10, pointerEvents: "none",
          }} />
        )}
        {active && (
          <span style={{
            position: "absolute", left: 0, top: "18%", bottom: "18%",
            width: 3, borderRadius: "0 4px 4px 0",
            background: t.navActiveBar,
            boxShadow: `0 0 10px ${t.accentGlow}, 0 0 20px ${t.accentGlow}`,
          }} />
        )}

        <div style={{ position: "relative", flexShrink: 0 }}>
          <Icon
            size={16}
            strokeWidth={active ? 2.2 : 1.6}
            color={active ? t.iconActive : hovered ? t.iconHovered : t.iconInactive}
            style={{
              transition: "color 0.18s ease, filter 0.18s ease",
              filter: active ? `drop-shadow(0 0 6px ${t.accentGlow})` : "none",
              display: "block",
            }}
          />
          {badge > 0 && (
            <span style={{
              position: "absolute", top: -5, right: -6,
              minWidth: 15, height: 15, borderRadius: 99,
              background: t.navActiveBar,
              color: t.textOnAccent, fontSize: 8, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'DM Sans', sans-serif", padding: "0 3px",
              boxShadow: `0 0 8px ${t.accentGlow}`,
              animation: "badgePulse 2s ease-in-out infinite",
            }}>{badge}</span>
          )}
        </div>

        {!collapsed && (
          <span style={{
            flex: 1, fontSize: 12.5, fontFamily: "'DM Sans', sans-serif",
            fontWeight: active ? 600 : 400,
            color: active ? t.textPrimary : hovered ? t.textSecondary : t.iconInactive,
            whiteSpace: "nowrap", letterSpacing: "0.015em",
            transition: "color 0.18s ease",
          }}>{label}</span>
        )}

        {active && !collapsed && (
          <span style={{
            width: 5, height: 5, borderRadius: "50%",
            background: t.accent,
            boxShadow: `0 0 8px ${t.accentGlow}, 0 0 16px ${t.accentGlow}`,
            flexShrink: 0,
            animation: "dotPulse 2s ease-in-out infinite",
          }} />
        )}
      </Link>

      {collapsed && hovered && <PortalTooltip label={label} anchorRef={ref} />}
    </>
  );
}

// ── PALETTE BUTTON (triggers ThemeToggle drawer) ──────────────────────────────
// This is a button (not a Link) that fires the theme drawer open.

function PaletteNavItem({
  collapsed, onOpen,
}: {
  collapsed: boolean;
  onOpen: () => void;
}) {
  const { t, theme } = useTheme();
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={ref}
        onClick={onOpen}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title="Change theme"
        aria-label="Open theme switcher"
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: collapsed ? "11px 0" : "9px 13px",
          justifyContent: collapsed ? "center" : "flex-start",
          borderRadius: 10,
          background: hovered ? t.navHoverBg : "transparent",
          border: "none",
          cursor: "pointer",
          width: "100%",
          transition: "background 0.18s ease, transform 0.15s ease",
          marginBottom: 1,
          transform: hovered ? "translateX(2px)" : "translateX(0)",
          overflow: "hidden",
        }}
      >
        {/* Accent dot preview — shows current theme colour */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <Palette
            size={16}
            strokeWidth={1.6}
            color={hovered ? t.iconHovered : t.iconInactive}
            style={{
              transition: "color 0.18s ease",
              display: "block",
            }}
          />
          {/* Small coloured dot on icon to hint current theme */}
          <span style={{
            position: "absolute", top: -3, right: -4,
            width: 6, height: 6, borderRadius: "50%",
            background: t.accent,
            boxShadow: `0 0 6px ${t.accentGlow}`,
            border: `1px solid ${t.bgSidebar}`,
          }} />
        </div>

        {!collapsed && (
          <span style={{
            flex: 1, fontSize: 12.5, fontFamily: "'DM Sans', sans-serif",
            fontWeight: 400,
            color: hovered ? t.textSecondary : t.iconInactive,
            whiteSpace: "nowrap", letterSpacing: "0.015em",
            transition: "color 0.18s ease",
          }}>Appearance</span>
        )}

        {/* Theme name pill — only shown expanded */}
        {!collapsed && (
          <span style={{
            fontSize: 9, fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700, letterSpacing: "0.06em",
            color: t.accent,
            background: `${t.accent}18`,
            border: `1px solid ${t.accent}30`,
            borderRadius: 20,
            padding: "2px 7px",
            flexShrink: 0,
            textTransform: "uppercase",
            transition: "opacity 0.18s",
            opacity: hovered ? 1 : 0.7,
          }}>
            {theme.id}
          </span>
        )}
      </button>

      {collapsed && hovered && <PortalTooltip label="Appearance" anchorRef={ref} />}
    </>
  );
}

// ── FOOTER WRAPPER ────────────────────────────────────────────────────────────

function FooterNavItem({
  label, hovered, onEnter, onLeave, collapsed, anchorRef, children,
}: {
  label: string; hovered: boolean; onEnter: () => void; onLeave: () => void;
  collapsed: boolean; anchorRef: React.RefObject<HTMLElement | null>;
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
  const { t } = useTheme();
  return (
    <div style={{
      fontSize: 8, fontFamily: "'DM Sans', sans-serif",
      fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase",
      color: t.textMuted, padding: "10px 13px 5px", userSelect: "none",
    }}>
      {children}
    </div>
  );
}

// ── SIDEBAR ───────────────────────────────────────────────────────────────────

export default function DashboardSidebar({
  user: userProp = { name: "Mwangi", email: "mwangi@djafro.co.ke" },
  collapsed = false,
  onCollapsedChange,
}: DashboardSidebarProps) {
  const pathname   = usePathname() ?? "";
  const router     = useRouter();
  const { logout, user: authUser } = useAuth();
  const { t } = useTheme();

  // Ref to ThemeToggle so the Palette nav item can open it
  const themeToggleRef = useRef<ThemeToggleHandle>(null);

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

  const avStyle   = (authUser?.prefs?.avStyle as string) ?? userProp.avStyle ?? "bottts";
  const avSeed    = (authUser?.prefs?.avSeed  as string) ?? userProp.avSeed  ?? (authUser?.$id ?? "djafro");
  const avatarUrl = dicebearUrl(avStyle, avSeed);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <>
      <style>{`
        @keyframes dotPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.55; transform: scale(0.8); }
        }
        @keyframes badgePulse {
          0%, 100% { box-shadow: 0 0 8px var(--dj-accent-glow); }
          50% { box-shadow: 0 0 14px var(--dj-accent-glow); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-100%); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes filmFlicker {
          0%, 94%, 100% { opacity: 1; }
          95% { opacity: 0.93; }
          97% { opacity: 1; }
          98.5% { opacity: 0.96; }
        }
        .nav-scroll::-webkit-scrollbar { display: none; }
        .nav-scroll { scrollbar-width: none; }
        .sidebar-avatar {
          border-radius: 50%;
          overflow: hidden;
          background: var(--dj-bg-elevated);
          border: 2px solid var(--dj-border-accent);
          box-shadow: 0 0 12px var(--dj-accent-glow);
          flex-shrink: 0;
          display: block;
        }
      `}</style>

      {/* ThemeToggle rendered here — ref gives us openDrawer() */}
      <ThemeToggle ref={themeToggleRef} />

      <aside
        style={{
          position: "fixed",
          top: 10, left: 0, bottom: 10,
          width: W,
          zIndex: 900,
          borderRadius: BORDER_RADIUS,
          overflow: "visible",
          transition: "width 0.3s cubic-bezier(0.25, 1, 0.5, 1)",
          willChange: "width",
          animation: "slideInLeft 0.45s cubic-bezier(0.34, 1.2, 0.64, 1) both",
        }}
      >
        {/* ── BACKGROUND ── */}
        <div style={{
          position: "absolute", inset: 0,
          borderRadius: BORDER_RADIUS,
          overflow: "hidden", pointerEvents: "none", zIndex: 0,
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: t.bgSidebarGradient,
            animation: "filmFlicker 9s ease-in-out infinite",
          }} />

          <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.04, pointerEvents:"none" }} xmlns="http://www.w3.org/2000/svg">
            <filter id="sg">
              <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch"/>
              <feColorMatrix type="saturate" values="0"/>
            </filter>
            <rect width="100%" height="100%" filter="url(#sg)"/>
          </svg>

          <div style={{
            position:"absolute", top:-40, left:-20,
            width:180, height:180, borderRadius:"50%",
            background:`radial-gradient(circle, ${t.sidebarGlowTop} 0%, transparent 70%)`,
          }} />
          <div style={{
            position:"absolute", bottom:60, right:-30,
            width:140, height:140, borderRadius:"50%",
            background:`radial-gradient(circle, ${t.sidebarGlowBottom} 0%, transparent 70%)`,
          }} />

          <div style={{
            position:"absolute", inset:0,
            borderRadius: BORDER_RADIUS,
            border:`1px solid ${t.borderSubtle}`,
            borderLeft:"none", pointerEvents:"none",
          }} />
          <div style={{
            position:"absolute", inset:0,
            borderRadius: BORDER_RADIUS,
            boxShadow:`6px 0 40px rgba(0,0,0,0.6), inset -1px 0 0 ${t.borderSubtle}`,
            pointerEvents:"none",
          }} />
        </div>

        {/* ── CONTENT ── */}
        <div style={{
          position:"relative", zIndex:2,
          display:"flex", flexDirection:"column", height:"100%",
        }}>

          {/* ── LOGO ── */}
          <div style={{
            height: 64,
            display:"flex", alignItems:"center",
            padding: collapsed ? "0" : "0 16px",
            justifyContent: collapsed ? "center" : "flex-start",
            borderBottom:`1px solid ${t.borderSubtle}`,
            flexShrink: 0,
          }}>
            {collapsed ? (
              <div style={{
                width: 36, height: 36, position:"relative",
                filter: `drop-shadow(0 0 10px ${t.accentGlow})`,
                transition: "transform 0.2s ease",
                flexShrink: 0,
              }}>
                <Image src="/logo2.png" alt="D" fill className="object-contain" priority />
              </div>
            ) : (
              <div style={{
                position:"relative", height:42,
                width:"auto", minWidth:110, maxWidth:185,
                flex:"1 1 auto",
                filter:`drop-shadow(0 0 12px ${t.accentGlow}) drop-shadow(0 0 24px ${t.sidebarGlowTop})`,
                transition:"opacity 0.2s ease",
              }}>
                <Image src="/logo.png" alt="DjAfro Cinema" fill className="object-contain object-left" priority />
              </div>
            )}
          </div>

          {/* ── NAV ── */}
          <nav className="nav-scroll" style={{
            flex:1,
            padding: collapsed ? "10px 6px" : "10px 8px",
            display:"flex", flexDirection:"column",
            overflowY:"auto", overflowX:"visible",
          }}>
            {!collapsed && <SectionLabel>Main</SectionLabel>}
            {NAV_MAIN.map(item => (
              <NavItem key={item.href} {...item} active={isActive(item.href)} collapsed={collapsed} />
            ))}

            <div style={{
              height:1,
              background:`linear-gradient(90deg, transparent, ${t.borderAccent}, ${t.borderSubtle}, transparent)`,
              margin:"8px 8px",
            }} />

            {!collapsed && <SectionLabel>General</SectionLabel>}

            {NAV_GENERAL.map(item => (
              <NavItem key={item.href} {...item} active={isActive(item.href)} collapsed={collapsed} />
            ))}

            {/* ── PALETTE / APPEARANCE ── */}
            <PaletteNavItem
              collapsed={collapsed}
              onOpen={() => themeToggleRef.current?.openDrawer()}
            />
          </nav>

          {/* ── FOOTER ── */}
          <div style={{
            borderTop:`1px solid ${t.borderSubtle}`,
            padding: collapsed ? "8px 6px" : "8px 8px",
            flexShrink:0,
          }}>
            {/* Profile */}
            <FooterNavItem
              label={userProp.name}
              hovered={profileHovered}
              onEnter={() => setProfileHovered(true)}
              onLeave={() => setProfileHovered(false)}
              collapsed={collapsed}
              anchorRef={profileRef}
            >
              <Link href="/dashboard/profile" style={{
                display:"flex", alignItems:"center", gap:10,
                padding: collapsed ? "10px 0" : "8px 10px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius:10, textDecoration:"none",
                background: profileHovered ? t.navHoverBg : "transparent",
                transition:"background 0.18s", marginBottom:2,
              }}>
                <img
                  src={avatarUrl}
                  alt={userProp.name}
                  width={30}
                  height={30}
                  className="sidebar-avatar"
                />

                {!collapsed && (
                  <div style={{ overflow:"hidden", flex:1, minWidth:0 }}>
                    <div style={{
                      fontSize:12, fontWeight:600,
                      color: t.textPrimary,
                      fontFamily:"'DM Sans', sans-serif",
                      whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                    }}>{userProp.name}</div>
                    <div style={{
                      fontSize:9.5, color: t.textMuted,
                      fontFamily:"'DM Sans', sans-serif",
                      whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", marginTop:1,
                    }}>{userProp.email}</div>
                  </div>
                )}
                {!collapsed && (
                  <Star size={11} color={t.borderAccent} strokeWidth={2} style={{ flexShrink:0 }} />
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
                onClick={handleLogout}
                style={{
                  display:"flex", alignItems:"center", gap:10,
                  padding: collapsed ? "10px 0" : "8px 10px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius:10,
                  background: logoutHovered ? `${t.danger}12` : "transparent",
                  border:"none", cursor:"pointer", width:"100%",
                  transition:"background 0.18s",
                }}
              >
                <LogOut
                  size={15}
                  color={logoutHovered ? t.danger : t.iconInactive}
                  strokeWidth={1.8}
                  style={{
                    transition:"color 0.18s, transform 0.18s", flexShrink:0,
                    transform: logoutHovered ? "translateX(2px)" : "translateX(0)",
                  }}
                />
                {!collapsed && (
                  <span style={{
                    fontSize:12, fontFamily:"'DM Sans', sans-serif",
                    color: logoutHovered ? t.danger : t.iconInactive,
                    transition:"color 0.18s",
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
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        style={{
          position:"fixed",
          left: W - 10,
          top:"50%",
          transform:"translateY(-50%)",
          zIndex:902,
          width:20, height:44,
          borderRadius:10,
          background: toggleHovered ? t.bgElevated : t.bgSurface,
          border:`1px solid ${toggleHovered ? t.borderAccent : t.borderSubtle}`,
          display:"flex", alignItems:"center", justifyContent:"center",
          cursor:"pointer",
          color: toggleHovered ? t.accent : t.iconInactive,
          boxShadow: toggleHovered
            ? `3px 0 16px ${t.accentGlow}, 0 0 0 1px ${t.borderAccent}`
            : "3px 0 16px rgba(0,0,0,0.5)",
          transition:"left 0.3s cubic-bezier(0.25,1,0.5,1), background 0.18s, color 0.18s, box-shadow 0.18s",
          padding:0,
        }}
      >
        <ChevronRight
          size={11}
          style={{
            transform: collapsed ? "rotate(0deg)" : "rotate(180deg)",
            transition:"transform 0.3s cubic-bezier(0.25,1,0.5,1)",
          }}
        />
      </button>

      {/* ── LAYOUT SPACER ── */}
      <div
        aria-hidden
        style={{
          width: SPACER, flexShrink:0,
          transition:"width 0.3s cubic-bezier(0.25,1,0.5,1)",
          pointerEvents:"none", minWidth:SPACER,
        }}
      />
    </>
  );
}