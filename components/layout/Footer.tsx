import Image from "next/image";

const FOOTER_LINKS = {
  Movies: ["Action", "Romance", "Bollywood", "Thriller", "Comedy", "Epic"],
  Platform: ["How It Works", "Install App", "Premium Movies", "Free Movies"],
  Support: ["WhatsApp Us", "Request a Movie", "Report an Issue", "Contact Us"],
};

const SOCIAL = [
  {
    label: "TikTok",
    href: "https://tiktok.com/@djafrocinema",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.52V6.76a4.85 4.85 0 01-1.02-.07z" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/254700000000",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2C6.48 2 2 6.48 2 12c0 1.8.48 3.5 1.32 4.97L2 22l5.25-1.37A9.94 9.94 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm4.37 13.96c-.24.12-1.41.7-1.63.78-.22.08-.38.12-.54-.12s-.62-.78-.76-.94c-.14-.16-.28-.18-.52-.06-.24.12-.99.36-1.88-1.17-.14-.24-.01-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.46-.39-.4-.53-.41l-.46-.01c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 1.99s.86 2.31.98 2.47c.12.16 1.68 2.56 4.07 3.6.57.24 1.02.39 1.36.5.57.18 1.09.15 1.5.09.46-.07 1.41-.58 1.61-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M21.58 7.19a2.75 2.75 0 00-1.94-1.95C18 4.9 12 4.9 12 4.9s-6 0-7.64.34a2.75 2.75 0 00-1.94 1.95C2.07 8.84 2.07 12 2.07 12s0 3.16.35 4.81a2.75 2.75 0 001.94 1.94C6 19.1 12 19.1 12 19.1s6 0 7.64-.35a2.75 2.75 0 001.94-1.94c.35-1.65.35-4.81.35-4.81s0-3.16-.35-4.81zM9.75 15.02v-6.04L15.5 12l-5.75 3.02z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="relative bg-[#080808] border-t border-white/5 overflow-hidden">
      {/* Top gradient fade */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e50914]/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Main footer content */}
        <div className="py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="relative w-9 h-9">
                <Image
                  src="/logo.png"
                  alt="DjAfro Cinema"
                  fill
                  className="object-contain"
                  style={{ filter: "drop-shadow(0 0 6px #e5091466)" }}
                />
              </div>
              <div className="flex flex-col leading-none">
                <span
                  className="text-white text-xl tracking-wider"
                  style={{ fontFamily: "var(--font-display)", letterSpacing: "0.12em" }}
                >
                  DJAFRO
                </span>
                <span className="text-[#e50914] text-[9px] tracking-[0.4em] uppercase font-semibold -mt-0.5">
                  CINEMA
                </span>
              </div>
            </div>

            <p className="text-white/35 text-sm leading-relaxed max-w-xs mb-6">
              East Africa's premier movie streaming platform. DJ Afro dubbed movies, Bollywood, and African cinema — all in one place.
            </p>

            {/* Stats */}
            <div className="flex gap-6 mb-8">
              {[
                { num: "1,200+", label: "Downloads" },
                { num: "500+", label: "Movies" },
                { num: "Kenya 🇰🇪", label: "Based In" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col">
                  <span className="text-white font-bold text-base" style={{ fontFamily: "var(--font-display)", letterSpacing: "0.04em" }}>{s.num}</span>
                  <span className="text-white/25 text-[10px] uppercase tracking-widest mt-0.5">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Socials */}
            <div className="flex items-center gap-3">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full border border-white/10 hover:border-[#e50914]/50 flex items-center justify-center text-white/40 hover:text-white transition-all duration-200 hover:shadow-[0_0_12px_#e5091422]"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white text-xs uppercase tracking-[0.3em] font-semibold mb-5">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-white/35 hover:text-white text-sm transition-colors duration-150"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/20 text-xs">
            © {new Date().getFullYear()} DjAfro Cinema. Built in Kenya 🇰🇪 with ❤️
          </p>
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Use", "Cookie Policy"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-white/20 hover:text-white/50 text-xs transition-colors duration-150"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}