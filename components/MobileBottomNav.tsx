"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Film, Compass, Library, User } from "lucide-react";

const TABS = [
  { label: "Home",     href: "/dashboard",          Icon: Home },
  { label: "Movies",   href: "/dashboard/movies",   Icon: Film },
  { label: "Discover", href: "/dashboard/discover", Icon: Compass },
  { label: "Library",  href: "/dashboard/library",  Icon: Library },
  { label: "Profile",  href: "/dashboard/profile",  Icon: User },
];

export default function MobileBottomNav() {
  const pathname = usePathname() ?? "";

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  return (
    <>
      <style>{`
        @keyframes dj-tab-pop {
          0%   { transform: scale(0.88); opacity: 0.5; }
          60%  { transform: scale(1.08); }
          100% { transform: scale(1);   opacity: 1; }
        }
        .dj-tab-active-icon {
          animation: dj-tab-pop 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        .dj-tab-link {
          -webkit-tap-highlight-color: transparent;
          tap-highlight-color: transparent;
        }
      `}</style>

      {/* Floating nav bar */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 900,
          paddingBottom: "env(safe-area-inset-bottom)",
          background: "rgba(9,9,12,0.92)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          borderTop: "1px solid rgba(255,255,255,0.055)",
        }}
      >
        {/* Subtle red ambient line at the very top */}
        <div style={{
          position: "absolute",
          top: 0, left: "20%", right: "20%",
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(229,9,20,0.4) 50%, transparent)",
          pointerEvents: "none",
        }} />

        <div style={{
          display: "flex",
          alignItems: "flex-end",
          height: 62,
          padding: "0 4px",
        }}>
          {TABS.map(({ label, href, Icon }) => {
            const active = isActive(href);

            return (
              <Link
                key={href}
                href={href}
                className="dj-tab-link"
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0,
                  paddingBottom: 10,
                  paddingTop: 10,
                  textDecoration: "none",
                  position: "relative",
                  userSelect: "none",
                }}
              >
                {/* Icon container with pill bg when active */}
                <div
                  className={active ? "dj-tab-active-icon" : ""}
                  style={{
                    position: "relative",
                    width: 44,
                    height: 30,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 10,
                    background: active ? "rgba(229,9,20,0.16)" : "transparent",
                    transition: "background 0.2s",
                    marginBottom: 4,
                  }}
                >
                  {/* Red glow behind icon when active */}
                  {active && (
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 10,
                      boxShadow: "inset 0 0 0 1px rgba(229,9,20,0.22)",
                    }} />
                  )}

                  <Icon
                    size={18}
                    strokeWidth={active ? 2.2 : 1.5}
                    color={active ? "#e50914" : "rgba(255,255,255,0.28)"}
                    style={{
                      filter: active ? "drop-shadow(0 0 4px rgba(229,9,20,0.55))" : "none",
                      transition: "color 0.18s, filter 0.18s",
                    }}
                  />
                </div>

                {/* Label — always visible, shifts color */}
                <span
                  style={{
                    fontSize: 9,
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: active ? 700 : 400,
                    letterSpacing: active ? "0.04em" : "0.06em",
                    textTransform: "uppercase",
                    color: active ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.22)",
                    transition: "color 0.18s, font-weight 0.18s",
                    lineHeight: 1,
                  }}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}