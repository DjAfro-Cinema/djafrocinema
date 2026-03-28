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
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 900,
        // Respects iPhone home indicator
        paddingBottom: "env(safe-area-inset-bottom)",
        background: "rgba(10,10,12,0.96)",
        backdropFilter: "blur(32px)",
        WebkitBackdropFilter: "blur(32px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "stretch",
      }}
    >
      {TABS.map(({ label, href, Icon }) => {
        const active = isActive(href);

        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              padding: "10px 4px 12px",
              textDecoration: "none",
              position: "relative",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {/* Active pill background behind icon */}
            {active && (
              <span
                style={{
                  position: "absolute",
                  top: 8,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 40,
                  height: 32,
                  borderRadius: 10,
                  background: "rgba(229,9,20,0.14)",
                  border: "1px solid rgba(229,9,20,0.18)",
                }}
              />
            )}

            <Icon
              size={20}
              strokeWidth={active ? 2.2 : 1.5}
              color={active ? "#e50914" : "rgba(255,255,255,0.3)"}
              style={{ position: "relative", zIndex: 1, transition: "color 0.15s" }}
            />
            <span
              style={{
                fontSize: 9,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: active ? 700 : 400,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.25)",
                transition: "color 0.15s",
                position: "relative",
                zIndex: 1,
              }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}