"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/* ─── Data ─── */
const FOOTER_LINKS = {
  Movies: ["Action", "Romance", "Bollywood", "Thriller", "Comedy", "Epic"],
  Platform: ["How It Works", "Install App", "Premium Movies", "Free Movies"],
  Support: ["WhatsApp Channel", "Request a Movie", "Report an Issue", "Contact Us"],
};

const SOCIAL = [
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@djafro.cinema?_r=1&_t=ZS-95Fgsk7Qsmz",
    color: "#ff0050",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.52V6.76a4.85 4.85 0 01-1.02-.07z" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: "https://www.whatsapp.com/channel/0029Vb7ysbU3GJOobmCMxx0d",
    color: "#25d366",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M12 2C6.48 2 2 6.48 2 12c0 1.8.48 3.5 1.32 4.97L2 22l5.25-1.37A9.94 9.94 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm4.37 13.96c-.24.12-1.41.7-1.63.78-.22.08-.38.12-.54-.12s-.62-.78-.76-.94c-.14-.16-.28-.18-.52-.06-.24.12-.99.36-1.88-1.17-.14-.24-.01-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.46-.39-.4-.53-.41l-.46-.01c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 1.99s.86 2.31.98 2.47c.12.16 1.68 2.56 4.07 3.6.57.24 1.02.39 1.36.5.57.18 1.09.15 1.5.09.46-.07 1.41-.58 1.61-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@DjafroCinema-x4i",
    color: "#ff0000",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M21.58 7.19a2.75 2.75 0 00-1.94-1.95C18 4.9 12 4.9 12 4.9s-6 0-7.64.34a2.75 2.75 0 00-1.94 1.95C2.07 8.84 2.07 12 2.07 12s0 3.16.35 4.81a2.75 2.75 0 001.94 1.94C6 19.1 12 19.1 12 19.1s6 0 7.64-.35a2.75 2.75 0 001.94-1.94c.35-1.65.35-4.81.35-4.81s0-3.16-.35-4.81zM9.75 15.02v-6.04L15.5 12l-5.75 3.02z" />
      </svg>
    ),
  },
  {
    label: "Telegram",
    href: "https://t.me/djafrostreambox",
    color: "#0088cc",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.84 5.42-1.19 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.59-1.38-.96-2.23-1.54-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.2-.04-.28-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1.01.54-1.46.53-.48-.01-1.42-.28-2.11-.51-.85-.28-1.53-.43-1.47-.91.03-.24.36-.48.99-.73 3.9-1.7 6.5-2.81 7.8-3.36 3.71-1.61 4.48-1.89 4.98-1.89.11 0 .35.03.51.13.13.08.21.19.23.35.02.13.03.31 0 .48z" />
      </svg>
    ),
  },
  {
    label: "PlayStore",
    href: "https://play.google.com/store/apps/details?id=com.djafro.moviesbox",
    color: "#34a853",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M3 3v18l15-9z" />
      </svg>
    ),
  },
];

export default function Footer() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ob = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.06 }
    );
    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, []);

  return (
    <footer ref={ref} className="ft-root">

      {/* ══ GRADIENT BACKGROUND (No Images) ══ */}
      <div className="ft-bg" aria-hidden>
        <div className="ft-ov-gradient" />
        <div className="ft-ov-dark" />
        <div className="ft-ov-vignette" />
        <div className="ft-ov-red" />
        <div className="ft-ov-scanlines" />
      </div>

      <div className="ft-grain" aria-hidden />
      <div className="ft-hairline" aria-hidden />

      {/* ══ INNER ══ */}
      <div className="ft-inner">

        {/* Top band */}
        <div
          className="ft-top-band"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(22px)",
            transition: "opacity .7s ease .1s, transform .7s ease .1s",
          }}
        >
          <div className="ft-logo-wrap">
            <div className="ft-logo-img-wrap">
              <Image
                src="/logo.png"
                alt="DjAfro Cinema"
                fill
                className="object-contain object-left"
                style={{ filter: "drop-shadow(0 0 12px #e5091488)" }}
              />
            </div>
          </div>

          <div className="ft-band-div" />

          <p className="ft-tagline">
            East Africa's premier<br />movie streaming platform.
          </p>

          <div className="ft-stats">
            {[
              { v: "1,200+", l: "Downloads" },
              { v: "500+",   l: "Movies" },
              { v: "Kenya",  l: "Based In 🇰🇪" },
            ].map((s, i) => (
              <div key={i} className="ft-stat">
                <span className="ft-stat-v">{s.v}</span>
                <span className="ft-stat-l">{s.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main grid */}
        <div className="ft-grid">
          <div
            className="ft-col ft-col-brand"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateY(28px)",
              transition: "opacity .65s ease .2s, transform .65s ease .2s",
            }}
          >
            <p className="ft-col-body">
              DJ Afro dubbed movies, Bollywood hits, and African cinema — all in one place. Install free. Stream instantly.
            </p>

            <div className="ft-contact">
              <div className="ft-contact-label">Get in Touch</div>
              <a href="tel:+254796562713" className="ft-contact-item">
                <span className="ft-contact-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
                    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
                  </svg>
                </span>
                <span>+254 796 562 713</span>
              </a>
              <a href="mailto:chegephil24@gmail.com" className="ft-contact-item">
                <span className="ft-contact-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </span>
                <span>chegephil24@gmail.com</span>
              </a>
            </div>

            <div className="ft-socials">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="ft-social"
                  title={s.label}
                  style={{ "--sc": s.color } as React.CSSProperties}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([title, links], ci) => (
            <div
              key={title}
              className="ft-col"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "none" : "translateY(28px)",
                transition: `opacity .65s ease ${(ci + 1) * 100 + 200}ms, transform .65s ease ${(ci + 1) * 100 + 200}ms`,
              }}
            >
              <div className="ft-col-title">
                <span className="ft-col-title-pip" />
                {title}
              </div>
              <ul className="ft-links">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="ft-link">
                      <span className="ft-link-arrow">›</span>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="ft-bottom"
          style={{ opacity: visible ? 1 : 0, transition: "opacity .7s ease .7s" }}
        >
          <div className="ft-bottom-line" />
          <div className="ft-bottom-row">
            <p className="ft-copy">© {new Date().getFullYear()} DjAfro Cinema. All rights reserved.</p>
            <div className="ft-legal">
              {["Privacy Policy", "Terms of Use", "Cookie Policy"].map((item) => (
                <a key={item} href="#" className="ft-legal-link">{item}</a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`

        .ft-root { position: relative; overflow: hidden; font-family: 'DM Sans', sans-serif; }

        .ft-bg { position: absolute; inset: 0; z-index: 0; }
        
        /* ── Linear Gradient Background (No Images) ── */
        .ft-ov-gradient {
          position: absolute; inset: 0; z-index: 1;
          background: linear-gradient(135deg, 
            rgba(20, 20, 28, 1) 0%,
            rgba(16, 16, 24, 1) 25%,
            rgba(14, 14, 22, 1) 50%,
            rgba(18, 18, 26, 1) 75%,
            rgba(20, 20, 28, 1) 100%
          );
        }

        .ft-ov-dark     { position:absolute; inset:0; z-index:2; background:rgba(4,4,4,.32); }
        .ft-ov-vignette { position:absolute; inset:0; z-index:3; background:radial-gradient(ellipse at center, transparent 15%, rgba(0,0,0,.55) 100%); }
        .ft-ov-red      { position:absolute; inset:0; z-index:4; background:radial-gradient(ellipse at 15% 100%, rgba(229,9,20,.08) 0%, transparent 60%); }
        .ft-ov-scanlines {
          position:absolute; inset:0; z-index:5;
          background:repeating-linear-gradient(to bottom, transparent, transparent 3px, rgba(0,0,0,.015) 3px, rgba(0,0,0,.015) 4px);
          pointer-events:none;
        }

        .ft-grain {
          position:absolute; inset:0; z-index:6;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          background-size:200px 200px; opacity:.35; pointer-events:none; mix-blend-mode:overlay;
        }
        .ft-hairline { position:absolute; top:0; left:0; right:0; height:1px; z-index:7; background:linear-gradient(to right, transparent, #e50914 30%, #e50914 70%, transparent); opacity:.6; }

        .ft-inner { position:relative; z-index:10; max-width:1280px; margin:0 auto; padding:0 48px; }
        @media (max-width:640px) { .ft-inner { padding:0 20px; } }

        .ft-top-band {
          border-bottom:1px solid rgba(255,255,255,.07);
          padding:48px 0 40px;
          display:flex; align-items:center; flex-wrap:wrap; gap:24px 36px;
        }
        @media (max-width:768px) { .ft-top-band { padding:36px 0 32px; gap:20px 24px; } }

        .ft-logo-wrap  { display:flex; align-items:center; flex-shrink:0; }
        .ft-logo-img-wrap { position:relative; width:185px; height:54px; }

        .ft-band-div { width:1px; height:40px; background:rgba(255,255,255,.1); flex-shrink:0; }
        @media (max-width:500px) { .ft-band-div { display:none; } }

        .ft-tagline { font-size:13px; line-height:1.7; color:rgba(255,255,255,.38); max-width:200px; font-weight:500; }

        .ft-stats {
          display:flex; margin-left:auto;
          border:1px solid rgba(229,9,20,.3); border-radius:6px; overflow:hidden;
          background:rgba(229,9,20,.06); backdrop-filter:blur(12px);
          box-shadow: 0 8px 32px rgba(229,9,20,.15);
        }
        @media (max-width:640px) { .ft-stats { margin-left:0; } }
        .ft-stat { display:flex; flex-direction:column; padding:12px 24px; text-align:center; border-right:1px solid rgba(255,255,255,.06); }
        .ft-stat:last-child { border-right:none; }
        .ft-stat-v { font-family:'Bebas Neue',sans-serif; font-size:1.4rem; color:#fff; letter-spacing:.08em; line-height:1; font-weight:700; }
        .ft-stat-l { font-size:9px; letter-spacing:.3em; text-transform:uppercase; color:rgba(255,255,255,.3); margin-top:4px; font-weight:500; }

        .ft-grid { padding:52px 0 44px; display:grid; grid-template-columns:280px repeat(3,1fr); gap:44px 52px; }
        @media (max-width:1024px) { .ft-grid { grid-template-columns:1fr 1fr; gap:40px 36px; } }
        @media (max-width:540px)  { .ft-grid { grid-template-columns:1fr; gap:32px; } }

        .ft-col-body { font-size:13.5px; color:rgba(255,255,255,.36); line-height:1.85; margin-bottom:28px; font-weight:400; }

        .ft-contact { margin-bottom:28px; }
        .ft-contact-label { font-size:9px; letter-spacing:.4em; text-transform:uppercase; color:rgba(229,9,20,.7); margin-bottom:12px; font-weight:700; }
        .ft-contact-item { display:flex; align-items:center; gap:10px; color:rgba(255,255,255,.44); font-size:13px; text-decoration:none; margin-bottom:9px; transition:all .25s; }
        .ft-contact-item:hover { color:rgba(255,255,255,.92); gap:12px; }
        .ft-contact-icon { display:flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:6px; background:rgba(229,9,20,.14); border:1px solid rgba(229,9,20,.28); color:#e50914; flex-shrink:0; transition:all .25s; }
        .ft-contact-item:hover .ft-contact-icon { background:rgba(229,9,20,.25); border-color:rgba(229,9,20,.5); box-shadow:0 0 12px rgba(229,9,20,.3); }

        .ft-socials { display:flex; gap:10px; flex-wrap:wrap; }
        .ft-social { display:flex; align-items:center; justify-content:center; width:40px; height:40px; border-radius:50%; border:1.5px solid rgba(255,255,255,.12); color:rgba(255,255,255,.38); text-decoration:none; transition:all .25s cubic-bezier(.34,.1,.64,.9); }
        .ft-social:hover { 
          color:var(--sc,#fff); 
          border-color:var(--sc,#fff); 
          box-shadow:0 0 20px color-mix(in srgb, var(--sc,#fff) 50%, transparent), inset 0 0 20px color-mix(in srgb, var(--sc,#fff) 20%, transparent); 
          transform:translateY(-4px) scale(1.08);
        }

        .ft-col-title { display:flex; align-items:center; gap:9px; font-size:10px; letter-spacing:.4em; text-transform:uppercase; color:#fff; font-weight:700; margin-bottom:20px; }
        .ft-col-title-pip { width:6px; height:6px; border-radius:50%; background:linear-gradient(135deg, #e50914, #ff4444); box-shadow:0 0 10px rgba(229,9,20,.8); flex-shrink:0; }

        .ft-links { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:9px; }
        .ft-link { display:flex; align-items:center; gap:6px; font-size:13.5px; color:rgba(255,255,255,.34); text-decoration:none; transition:all .2s; }
        .ft-link:hover { color:rgba(255,255,255,.88); gap:12px; }
        .ft-link-arrow { font-size:16px; color:#e50914; opacity:0; transition:all .2s; line-height:1; }
        .ft-link:hover .ft-link-arrow { opacity:1; }

        .ft-bottom { padding-bottom:32px; }
        .ft-bottom-line { height:1px; background:linear-gradient(to right, transparent, rgba(229,9,20,.2) 20%, rgba(229,9,20,.2) 80%, transparent); margin-bottom:24px; }
        .ft-bottom-row { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:14px; }
        .ft-copy { font-size:11.5px; color:rgba(255,255,255,.22); letter-spacing:.05em; font-weight:500; }
        .ft-legal { display:flex; align-items:center; gap:22px; flex-wrap:wrap; }
        .ft-legal-link { font-size:11px; color:rgba(255,255,255,.22); text-decoration:none; letter-spacing:.05em; transition:color .2s; font-weight:500; }
        .ft-legal-link:hover { color:rgba(255,255,255,.62); }
      `}</style>
    </footer>
  );
}