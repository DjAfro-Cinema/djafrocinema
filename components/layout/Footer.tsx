"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/* ─── Data ─── */
const BG_IMAGES = [
  "/images/footer1.jpg",
  "/images/footer2.jpg",
  "/images/footer3.jpg",
  "/images/footer4.jpg",
];

const FOOTER_LINKS = {
  Movies: ["Action", "Romance", "Bollywood", "Thriller", "Comedy", "Epic"],
  Platform: ["How It Works", "Install App", "Premium Movies", "Free Movies"],
  Support: ["WhatsApp Us", "Request a Movie", "Report an Issue", "Contact Us"],
};

const SOCIAL = [
  {
    label: "TikTok",
    href: "https://tiktok.com/@djafrocinema",
    color: "#ff0050",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.52V6.76a4.85 4.85 0 01-1.02-.07z" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: "https://whatsapp.com/channel/0029Vb7ysbU3GJOobmCMxx0d",
    color: "#25d366",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17">
        <path d="M12 2C6.48 2 2 6.48 2 12c0 1.8.48 3.5 1.32 4.97L2 22l5.25-1.37A9.94 9.94 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm4.37 13.96c-.24.12-1.41.7-1.63.78-.22.08-.38.12-.54-.12s-.62-.78-.76-.94c-.14-.16-.28-.18-.52-.06-.24.12-.99.36-1.88-1.17-.14-.24-.01-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.46-.39-.4-.53-.41l-.46-.01c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 1.99s.86 2.31.98 2.47c.12.16 1.68 2.56 4.07 3.6.57.24 1.02.39 1.36.5.57.18 1.09.15 1.5.09.46-.07 1.41-.58 1.61-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "#",
    color: "#e50914",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17">
        <path d="M21.58 7.19a2.75 2.75 0 00-1.94-1.95C18 4.9 12 4.9 12 4.9s-6 0-7.64.34a2.75 2.75 0 00-1.94 1.95C2.07 8.84 2.07 12 2.07 12s0 3.16.35 4.81a2.75 2.75 0 001.94 1.94C6 19.1 12 19.1 12 19.1s6 0 7.64-.35a2.75 2.75 0 001.94-1.94c.35-1.65.35-4.81.35-4.81s0-3.16-.35-4.81zM9.75 15.02v-6.04L15.5 12l-5.75 3.02z" />
      </svg>
    ),
  },
];

/* ─── Component ─── */
export default function Footer() {
  const [bgIndex, setBgIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [fading, setFading] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  /* Cycling background every 5 s */
  useEffect(() => {
    const id = setInterval(() => {
      setPrevIndex(bgIndex);
      setFading(true);
      setTimeout(() => {
        setBgIndex((i) => (i + 1) % BG_IMAGES.length);
        setFading(false);
        setPrevIndex(null);
      }, 1200);
    }, 5000);
    return () => clearInterval(id);
  }, [bgIndex]);

  /* Scroll reveal */
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

      {/* ══ CINEMATIC BACKGROUND ══ */}
      <div className="ft-bg" aria-hidden>
        {/* Previous slide fades out */}
        {prevIndex !== null && (
          <img
            key={`prev-${prevIndex}`}
            src={BG_IMAGES[prevIndex]}
            alt=""
            className="ft-bg-img ft-bg-prev"
            style={{ opacity: fading ? 0 : 1 }}
          />
        )}
        {/* Current slide */}
        <img
          key={`curr-${bgIndex}`}
          src={BG_IMAGES[bgIndex]}
          alt=""
          className="ft-bg-img ft-bg-curr"
        />
        {/* Multi-layer overlays */}
        <div className="ft-ov-dark"   />
        <div className="ft-ov-vignette" />
        <div className="ft-ov-red"    />
        <div className="ft-ov-bottom" />
        {/* Animated ken-burns on current */}
        <div className="ft-ov-scanlines" />
      </div>

      {/* Film-grain texture */}
      <div className="ft-grain" aria-hidden />

      {/* Top red hairline */}
      <div className="ft-hairline" aria-hidden />

      {/* Slide indicator dots */}
      <div className="ft-dots" aria-hidden>
        {BG_IMAGES.map((_, i) => (
          <span key={i} className={`ft-dot ${i === bgIndex ? "ft-dot-active" : ""}`} />
        ))}
      </div>

      {/* ══ INNER ══ */}
      <div className="ft-inner">

        {/* ── TOP SECTION: Brand + Stats banner ── */}
        <div
          className="ft-top-band"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(22px)",
            transition: "opacity .7s ease .1s, transform .7s ease .1s",
          }}
        >
          {/* Logo */}
          <div className="ft-logo-wrap">
            <div className="ft-logo-img-wrap">
              <Image
                src="/logo.png"
                alt="DjAfro Cinema"
                fill
                className="object-contain"
                style={{ filter: "drop-shadow(0 0 10px #e5091488)" }}
              />
            </div>
            <div className="ft-logo-text">
              <span className="ft-logo-main">DJAFRO</span>
              <span className="ft-logo-sub">CINEMA</span>
            </div>
          </div>

          {/* Divider */}
          <div className="ft-band-div" />

          {/* Tagline */}
          <p className="ft-tagline">
            East Africa's premier<br />movie streaming platform.
          </p>

          {/* Stats */}
          <div className="ft-stats">
            {[
              { v: "1,200+", l: "Downloads"   },
              { v: "500+",   l: "Movies"      },
              { v: "Kenya",  l: "Based In 🇰🇪" },
            ].map((s, i) => (
              <div key={i} className="ft-stat">
                <span className="ft-stat-v">{s.v}</span>
                <span className="ft-stat-l">{s.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── MAIN GRID ── */}
        <div className="ft-grid">

          {/* Brand / contact column */}
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

            {/* Contact */}
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

            {/* Socials */}
            <div className="ft-socials">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="ft-social"
                  style={{ "--sc": s.color } as React.CSSProperties}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
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

        {/* ── BOTTOM BAR ── */}
        <div
          className="ft-bottom"
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity .7s ease .7s",
          }}
        >
          <div className="ft-bottom-line" />
          <div className="ft-bottom-row">
            <p className="ft-copy">
              © {new Date().getFullYear()} DjAfro Cinema. All rights reserved.
            </p>
            {/* Legal links */}
            <div className="ft-legal">
              {["Privacy Policy", "Terms of Use", "Cookie Policy"].map((item) => (
                <a key={item} href="#" className="ft-legal-link">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ STYLES ══ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

        /* ─ Root ─ */
        .ft-root {
          position: relative;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
        }

        /* ─ Background ─ */
        .ft-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .ft-bg-img {
          position: absolute;
          inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center 35%;
        }
        .ft-bg-prev {
          z-index: 1;
          transition: opacity 1.2s ease;
        }
        .ft-bg-curr {
          z-index: 2;
          animation: ft-kenburns 10s ease-in-out infinite alternate;
        }
        @keyframes ft-kenburns {
          from { transform: scale(1)    translateX(0);     }
          to   { transform: scale(1.06) translateX(-1.5%); }
        }
        .ft-ov-dark {
          position: absolute; inset: 0; z-index: 3;
          background: rgba(4,4,4,.82);
        }
        .ft-ov-vignette {
          position: absolute; inset: 0; z-index: 4;
          background: radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,.9) 100%);
        }
        .ft-ov-red {
          position: absolute; inset: 0; z-index: 5;
          background: radial-gradient(ellipse at 15% 100%, rgba(229,9,20,.07) 0%, transparent 55%);
        }
        .ft-ov-bottom {
          position: absolute; bottom: 0; left: 0; right: 0; z-index: 6;
          height: 40%;
          background: linear-gradient(to bottom, transparent, rgba(4,4,4,.96) 100%);
        }
        .ft-ov-scanlines {
          position: absolute; inset: 0; z-index: 7;
          background: repeating-linear-gradient(
            to bottom,
            transparent,
            transparent 3px,
            rgba(0,0,0,.03) 3px,
            rgba(0,0,0,.03) 4px
          );
          pointer-events: none;
        }

        /* grain */
        .ft-grain {
          position: absolute; inset: 0; z-index: 8;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          opacity: .5;
          pointer-events: none;
          mix-blend-mode: overlay;
        }

        /* top hairline */
        .ft-hairline {
          position: absolute; top: 0; left: 0; right: 0;
          height: 1px; z-index: 9;
          background: linear-gradient(to right, transparent, #e50914 30%, #e50914 70%, transparent);
          opacity: .6;
        }

        /* slide indicator dots */
        .ft-dots {
          position: absolute; top: 18px; right: 32px;
          z-index: 20;
          display: flex; gap: 6px; align-items: center;
        }
        .ft-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: rgba(255,255,255,.18);
          transition: background .4s, transform .4s;
        }
        .ft-dot-active {
          background: #e50914;
          transform: scale(1.4);
          box-shadow: 0 0 8px #e50914;
        }

        /* ─ Inner ─ */
        .ft-inner {
          position: relative; z-index: 10;
          max-width: 1280px; margin: 0 auto;
          padding: 0 48px;
        }
        @media (max-width: 640px) {
          .ft-inner { padding: 0 20px; }
        }

        /* ─ Top band ─ */
        .ft-top-band {
          border-bottom: 1px solid rgba(255,255,255,.06);
          padding: 44px 0 36px;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 24px 36px;
        }
        @media (max-width: 768px) {
          .ft-top-band { padding: 32px 0 28px; gap: 20px 24px; }
        }

        /* Logo */
        .ft-logo-wrap {
          display: flex; align-items: center; gap: 11px; flex-shrink: 0;
        }
        .ft-logo-img-wrap {
          position: relative; width: 40px; height: 40px;
        }
        .ft-logo-main {
          display: block;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.45rem; letter-spacing: .14em;
          color: #fff; line-height: 1;
        }
        .ft-logo-sub {
          display: block;
          font-size: 8px; letter-spacing: .45em;
          text-transform: uppercase; color: #e50914;
          font-weight: 700; margin-top: -1px;
        }

        /* divider */
        .ft-band-div {
          width: 1px; height: 36px;
          background: rgba(255,255,255,.1);
          flex-shrink: 0;
        }
        @media (max-width: 500px) { .ft-band-div { display: none; } }

        /* tagline */
        .ft-tagline {
          font-size: 12px; line-height: 1.65;
          color: rgba(255,255,255,.32);
          max-width: 180px;
        }

        /* stats */
        .ft-stats {
          display: flex; gap: 0;
          margin-left: auto;
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 4px;
          overflow: hidden;
          background: rgba(255,255,255,.02);
        }
        @media (max-width: 640px) { .ft-stats { margin-left: 0; } }
        .ft-stat {
          display: flex; flex-direction: column;
          padding: 10px 20px; text-align: center;
          border-right: 1px solid rgba(255,255,255,.06);
        }
        .ft-stat:last-child { border-right: none; }
        .ft-stat-v {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.35rem; color: #fff; letter-spacing: .06em; line-height: 1;
        }
        .ft-stat-l {
          font-size: 8px; letter-spacing: .28em; text-transform: uppercase;
          color: rgba(255,255,255,.25); margin-top: 3px;
        }

        /* ─ Main grid ─ */
        .ft-grid {
          padding: 48px 0 40px;
          display: grid;
          grid-template-columns: 260px repeat(3, 1fr);
          gap: 40px 48px;
        }
        @media (max-width: 1024px) {
          .ft-grid { grid-template-columns: 1fr 1fr; gap: 36px 32px; }
        }
        @media (max-width: 540px) {
          .ft-grid { grid-template-columns: 1fr; gap: 28px; }
        }

        /* column */
        .ft-col {}
        .ft-col-body {
          font-size: 13px; color: rgba(255,255,255,.32);
          line-height: 1.8; margin-bottom: 26px;
        }

        /* contact */
        .ft-contact { margin-bottom: 24px; }
        .ft-contact-label {
          font-size: 8.5px; letter-spacing: .38em; text-transform: uppercase;
          color: rgba(255,255,255,.2); margin-bottom: 10px;
        }
        .ft-contact-item {
          display: flex; align-items: center; gap: 9px;
          color: rgba(255,255,255,.4); font-size: 12.5px;
          text-decoration: none; margin-bottom: 8px;
          transition: color .2s;
        }
        .ft-contact-item:hover { color: rgba(255,255,255,.85); }
        .ft-contact-icon {
          display: flex; align-items: center; justify-content: center;
          width: 24px; height: 24px; border-radius: 50%;
          background: rgba(229,9,20,.12); border: 1px solid rgba(229,9,20,.2);
          color: #e50914; flex-shrink: 0;
        }

        /* socials */
        .ft-socials { display: flex; gap: 9px; }
        .ft-social {
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px; border-radius: 50%;
          border: 1px solid rgba(255,255,255,.1);
          color: rgba(255,255,255,.35);
          text-decoration: none;
          transition: color .22s, border-color .22s, box-shadow .22s, transform .15s;
        }
        .ft-social:hover {
          color: var(--sc, #fff);
          border-color: var(--sc, #fff);
          box-shadow: 0 0 16px color-mix(in srgb, var(--sc, #fff) 40%, transparent);
          transform: translateY(-3px);
        }

        /* column title */
        .ft-col-title {
          display: flex; align-items: center; gap: 8px;
          font-size: 9px; letter-spacing: .38em; text-transform: uppercase;
          color: #fff; font-weight: 700; margin-bottom: 18px;
        }
        .ft-col-title-pip {
          width: 5px; height: 5px; border-radius: 50%;
          background: #e50914;
          box-shadow: 0 0 8px rgba(229,9,20,.7);
          flex-shrink: 0;
        }

        /* links */
        .ft-links { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
        .ft-link {
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; color: rgba(255,255,255,.3);
          text-decoration: none;
          transition: color .18s, gap .18s;
        }
        .ft-link:hover { color: rgba(255,255,255,.8); gap: 9px; }
        .ft-link-arrow {
          font-size: 15px; color: #e50914; opacity: 0;
          transition: opacity .18s;
          line-height: 1;
        }
        .ft-link:hover .ft-link-arrow { opacity: 1; }

        /* ─ Bottom bar ─ */
        .ft-bottom { padding-bottom: 28px; }
        .ft-bottom-line {
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(255,255,255,.08) 30%, rgba(255,255,255,.08) 70%, transparent);
          margin-bottom: 22px;
        }
        .ft-bottom-row {
          display: flex; align-items: center;
          justify-content: space-between; flex-wrap: wrap; gap: 12px;
        }
        .ft-copy {
          font-size: 11px; color: rgba(255,255,255,.18);
          letter-spacing: .06em;
        }
        .ft-legal { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
        .ft-legal-link {
          font-size: 10.5px; color: rgba(255,255,255,.18);
          text-decoration: none;
          letter-spacing: .06em;
          transition: color .18s;
        }
        .ft-legal-link:hover { color: rgba(255,255,255,.5); }
      `}</style>
    </footer>
  );
}