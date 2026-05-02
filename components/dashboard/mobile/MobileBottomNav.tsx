"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Film, Tv2, Compass, Library, User } from "lucide-react";

const TABS = [
  { label: "Home",     href: "/dashboard",          Icon: Home    },
  { label: "Movies",   href: "/dashboard/movies",   Icon: Film    },
  { label: "Series",   href: "/dashboard/series",   Icon: Tv2     },
  { label: "Discover", href: "/dashboard/discover", Icon: Compass },
  { label: "Library",  href: "/dashboard/library",  Icon: Library },
];

export default function MobileBottomNav() {
  const pathname = usePathname() ?? "";

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  const profileActive = pathname.startsWith("/dashboard/profile");

  return (
    <>
      <style>{`
        @keyframes dj-tab-pop {
          0%   { transform: scale(0.88); opacity: 0.5; }
          60%  { transform: scale(1.08); }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes pfloat {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-2px); }
        }
        .dj-tab-active-icon {
          animation: dj-tab-pop 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        .dj-tab-link, .dj-profile-chip {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>

      {/* Floating Profile Chip — sits above nav, anchored right */}
      <Link
        href="/dashboard/profile"
        className="dj-profile-chip"
        style={{
          position: "fixed",
          bottom: "calc(62px + env(safe-area-inset-bottom) + 8px)",
          right: 18,
          zIndex: 901,
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "rgba(20,20,24,0.95)",
          border: profileActive
            ? "1.5px solid rgba(229,9,20,0.9)"
            : "1.5px solid rgba(229,9,20,0.45)",
          boxShadow: profileActive
            ? "0 0 20px rgba(229,9,20,0.5), 0 4px 16px rgba(0,0,0,0.6)"
            : "0 0 14px rgba(229,9,20,0.25), 0 4px 16px rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textDecoration: "none",
          animation: "pfloat 3s ease-in-out infinite",
        }}
      >
        <User
          size={18}
          strokeWidth={profileActive ? 2.2 : 1.5}
          color={profileActive ? "#e50914" : "rgba(255,255,255,0.5)"}
          style={{
            filter: profileActive
              ? "drop-shadow(0 0 4px rgba(229,9,20,0.55))"
              : "none",
          }}
        />
        {/* Notification dot — remove if not needed */}
        <span style={{
          position: "absolute",
          top: 5, right: 5,
          width: 7, height: 7,
          borderRadius: "50%",
          background: "#e50914",
          border: "1.5px solid rgba(9,9,12,1)",
          boxShadow: "0 0 6px rgba(229,9,20,0.8)",
        }} />
      </Link>

      {/* Bottom Nav */}
      <nav
        style={{
          position: "fixed",
          bottom: 0, left: 0, right: 0,
          zIndex: 900,
          paddingBottom: "env(safe-area-inset-bottom)",
          background: "rgba(9,9,12,0.92)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          borderTop: "1px solid rgba(255,255,255,0.055)",
        }}
      >
        <div style={{
          position: "absolute",
          top: 0, left: "20%", right: "20%",
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(229,9,20,0.4) 50%, transparent)",
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
                <div
                  className={active ? "dj-tab-active-icon" : ""}
                  style={{
                    position: "relative",
                    width: 44, height: 30,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 10,
                    background: active ? "rgba(229,9,20,0.16)" : "transparent",
                    transition: "background 0.2s",
                    marginBottom: 4,
                  }}
                >
                  {active && (
                    <div style={{
                      position: "absolute", inset: 0,
                      borderRadius: 10,
                      boxShadow: "inset 0 0 0 1px rgba(229,9,20,0.22)",
                    }} />
                  )}
                  <Icon
                    size={18}
                    strokeWidth={active ? 2.2 : 1.5}
                    color={active ? "#e50914" : "rgba(255,255,255,0.28)"}
                    style={{
                      filter: active
                        ? "drop-shadow(0 0 4px rgba(229,9,20,0.55))"
                        : "none",
                      transition: "color 0.18s, filter 0.18s",
                    }}
                  />
                </div>

                <span style={{
                  fontSize: 9,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: active ? 700 : 400,
                  letterSpacing: active ? "0.04em" : "0.06em",
                  textTransform: "uppercase",
                  color: active
                    ? "rgba(255,255,255,0.88)"
                    : "rgba(255,255,255,0.22)",
                  transition: "color 0.18s, font-weight 0.18s",
                  lineHeight: 1,
                }}>
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