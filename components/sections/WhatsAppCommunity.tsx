"use client";

import { useEffect, useRef, useState } from "react";

const WHATSAPP_LINK = "https://whatsapp.com/channel/0029Vb7ysbU3GJOobmCMxx0d";

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M12 22a10 10 0 100-20 10 10 0 000 20zm0-18a8 8 0 110 16A8 8 0 0112 4zm-.5 4a.75.75 0 011.5 0v4.25l2.88 1.44a.75.75 0 01-.67 1.34l-3.25-1.63A.75.75 0 0111.5 10.5V8z"/>
      </svg>
    ),
    title: "Instant Notifications",
    desc: "First to know when new movies drop — every single time.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M12 2a5 5 0 110 10A5 5 0 0112 2zm0 12c5.33 0 8 2.67 8 4v2H4v-2c0-1.33 2.67-4 8-4z"/>
      </svg>
    ),
    title: "10,000+ Members",
    desc: "East Africa's largest online cinema community, all on one channel.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"/>
      </svg>
    ),
    title: "Request Any Movie",
    desc: "Can't find what you want? Drop a request — we deliver.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
      </svg>
    ),
    title: "Order & Stream",
    desc: "Order premium titles directly via WhatsApp — no hassle.",
  },
];

export default function WhatsAppCommunity() {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="wac-section">

      {/* ── FULL-BLEED MOVIE BACKGROUND ── */}
      <div className="wac-bg" aria-hidden>
        <img
          src="/images/hero1.jpg"
          alt=""
          className="wac-bg-img"
          loading="lazy"
        />
        {/* Layered cinematic overlays */}
        <div className="wac-overlay-base" />
        <div className="wac-overlay-vignette" />
        <div className="wac-overlay-green" />
        <div className="wac-overlay-bottom" />
        <div className="wac-overlay-left" />
      </div>

      {/* Film-grain texture */}
      <div className="wac-grain" aria-hidden />

      {/* Horizontal scan lines — cinematic touch */}
      <div className="wac-scanlines" aria-hidden />

      {/* Vertical accent bar */}
      <div className="wac-vert-bar" aria-hidden />

      {/* ── CONTENT ── */}
      <div ref={ref} className="wac-wrap">

        {/* ═══ LEFT: Main messaging ═══ */}
        <div className="wac-left">

          {/* Eyebrow */}
          <div
            className="wac-eyebrow"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateY(12px)",
              transition: "opacity .6s ease .05s, transform .6s ease .05s",
            }}
          >
            <span className="wac-eyebrow-icon">
              <svg viewBox="0 0 48 48" fill="#25d366" width="14" height="14">
                <path d="M24 4C12.95 4 4 12.95 4 24c0 3.6.96 7 2.63 9.94L4 44l10.42-2.7A19.88 19.88 0 0024 44c11.05 0 20-8.95 20-20S35.05 4 24 4zm8.74 27.08c-.48-.24-2.83-1.4-3.27-1.55-.44-.16-.76-.24-1.08.24-.32.48-1.23 1.55-1.51 1.87-.28.32-.56.36-1.04.12a13.1 13.1 0 01-3.87-2.38 14.5 14.5 0 01-2.68-3.33c-.28-.48-.03-.74.21-.98.22-.22.48-.56.72-.84.24-.28.32-.48.48-.8.16-.32.08-.6-.04-.84-.12-.24-1.08-2.6-1.48-3.56-.38-.93-.78-.8-1.07-.82l-.91-.02c-.32 0-.84.12-1.28.6-.44.48-1.67 1.63-1.67 3.98s1.71 4.62 1.95 4.94c.24.32 3.36 5.13 8.14 7.2 1.14.49 2.03.78 2.72.99 1.14.36 2.18.31 3 .19.92-.14 2.83-1.16 3.23-2.28.4-1.12.4-2.08.28-2.28-.12-.2-.44-.32-.92-.56z" />
              </svg>
            </span>
            <span className="wac-eyebrow-text">Live on WhatsApp · Free to Join</span>
          </div>

          {/* Headline */}
          <h2
            className="wac-headline"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateY(30px)",
              transition: "opacity .75s ease .1s, transform .75s cubic-bezier(.22,1,.36,1) .1s",
            }}
          >
            <span className="wac-hl-top">JOIN THE</span>
            <span className="wac-hl-mid">
              COMMUNITY
              <span className="wac-hl-dot" />
            </span>
            <span className="wac-hl-bot">
              <span className="wac-hl-accent">10K+</span> FANS
            </span>
          </h2>

          {/* Body copy */}
          <p
            className="wac-body"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateY(18px)",
              transition: "opacity .7s ease .22s, transform .7s ease .22s",
            }}
          >
            Be part of East Africa's biggest movie community on WhatsApp.
            Get new releases, request your favourite films, order titles on demand,
            and vibe with <em className="wac-em">thousands of cinema lovers</em> just like you.
            Zero cost. Infinite movies.
          </p>

          {/* Member count badge */}
          <div
            className="wac-badge"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateY(14px)",
              transition: "opacity .65s ease .32s, transform .65s ease .32s",
            }}
          >
            <div className="wac-badge-avatars">
              {["F", "M", "A", "K", "T"].map((l, i) => (
                <span
                  key={i}
                  className="wac-avatar"
                  style={{ marginLeft: i > 0 ? "-8px" : "0", zIndex: 5 - i }}
                >
                  {l}
                </span>
              ))}
              <span className="wac-avatar wac-avatar-more">+</span>
            </div>
            <div className="wac-badge-text">
              <span className="wac-badge-num">10,000+</span>
              <span className="wac-badge-sub">members already watching</span>
            </div>
          </div>

          {/* Primary CTA */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateY(18px)",
              transition: "opacity .7s ease .4s, transform .7s ease .4s",
            }}
          >
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className={`wac-cta ${hovered ? "wac-cta-hov" : ""}`}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              {/* WhatsApp icon */}
              <span className="wac-cta-icon">
                <svg viewBox="0 0 48 48" fill="currentColor" width="18" height="18">
                  <path d="M24 4C12.95 4 4 12.95 4 24c0 3.6.96 7 2.63 9.94L4 44l10.42-2.7A19.88 19.88 0 0024 44c11.05 0 20-8.95 20-20S35.05 4 24 4zm8.74 27.08c-.48-.24-2.83-1.4-3.27-1.55-.44-.16-.76-.24-1.08.24-.32.48-1.23 1.55-1.51 1.87-.28.32-.56.36-1.04.12a13.1 13.1 0 01-3.87-2.38 14.5 14.5 0 01-2.68-3.33c-.28-.48-.03-.74.21-.98.22-.22.48-.56.72-.84.24-.28.32-.48.48-.8.16-.32.08-.6-.04-.84-.12-.24-1.08-2.6-1.48-3.56-.38-.93-.78-.8-1.07-.82l-.91-.02c-.32 0-.84.12-1.28.6-.44.48-1.67 1.63-1.67 3.98s1.71 4.62 1.95 4.94c.24.32 3.36 5.13 8.14 7.2 1.14.49 2.03.78 2.72.99 1.14.36 2.18.31 3 .19.92-.14 2.83-1.16 3.23-2.28.4-1.12.4-2.08.28-2.28-.12-.2-.44-.32-.92-.56z" />
                </svg>
              </span>
              <span className="wac-cta-label">Join the Channel</span>
              <span className="wac-cta-arrow">
                <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                </svg>
              </span>
              <span className="wac-cta-shimmer" aria-hidden />
            </a>

            {/* Secondary action */}
            <div className="wac-secondary">
              <span className="wac-secondary-or">or</span>
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="wac-secondary-link">
                <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"/>
                </svg>
                Request a Movie
              </a>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT: Feature cards ═══ */}
        <div className="wac-right">

          {/* Decorative top label */}
          <div
            className="wac-right-label"
            style={{
              opacity: visible ? 1 : 0,
              transition: "opacity .6s ease .35s",
            }}
          >
            <span className="wac-right-line" />
            <span className="wac-right-label-text">What you get</span>
            <span className="wac-right-line" />
          </div>

          {/* Feature grid */}
          <div className="wac-features">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="wac-feat"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "none" : "translateY(28px)",
                  transition: `opacity .6s ease ${i * 100 + 450}ms, transform .6s cubic-bezier(.22,1,.36,1) ${i * 100 + 450}ms`,
                }}
              >
                <span className="wac-feat-icon">{f.icon}</span>
                <div>
                  <div className="wac-feat-title">{f.title}</div>
                  <div className="wac-feat-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div
            className="wac-stats"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateY(16px)",
              transition: "opacity .65s ease .88s, transform .65s ease .88s",
            }}
          >
            {[
              { v: "10K+", l: "Members" },
              { v: "500+", l: "Movies" },
              { v: "Free", l: "Always" },
            ].map((s, i) => (
              <div key={i} className="wac-stat">
                <div className="wac-stat-v">{s.v}</div>
                <div className="wac-stat-l">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ STYLES ══ */}
      <style>{`

        .wac-section {
          position: relative;
          min-height: 700px;
          padding: 110px 0 120px;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── Background image + overlays ── */
        .wac-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .wac-bg-img {
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center 30%;
          display: block;
        }
        /* Deep dark base — cinema feel */
        .wac-overlay-base {
          position: absolute; inset: 0;
          background: rgba(4, 5, 4, 0.72);
        }
        /* Vignette edges */
        .wac-overlay-vignette {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,.85) 100%);
        }
        /* Subtle WhatsApp green tint from top */
        .wac-overlay-green {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 60% 20%, rgba(37,211,102,.07) 0%, transparent 60%);
        }
        /* Heavy bottom fade — blends into next section */
        .wac-overlay-bottom {
          position: absolute; bottom: 0; left: 0; right: 0;
          height: 55%;
          background: linear-gradient(to bottom, transparent 0%, rgba(4,5,4,.95) 100%);
        }
        /* Left editorial fade */
        .wac-overlay-left {
          position: absolute; top: 0; left: 0; bottom: 0;
          width: 55%;
          background: linear-gradient(to right, rgba(4,5,4,.82) 0%, transparent 100%);
        }

        /* Film grain */
        .wac-grain {
          position: absolute; inset: 0; z-index: 1;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          opacity: .55;
          pointer-events: none;
          mix-blend-mode: overlay;
        }

        /* Subtle horizontal scan lines */
        .wac-scanlines {
          position: absolute; inset: 0; z-index: 1;
          background: repeating-linear-gradient(
            to bottom,
            transparent,
            transparent 3px,
            rgba(0,0,0,.04) 3px,
            rgba(0,0,0,.04) 4px
          );
          pointer-events: none;
        }

        /* Thin vertical green accent bar on far right */
        .wac-vert-bar {
          position: absolute; top: 10%; right: 0; bottom: 10%;
          width: 2px; z-index: 2;
          background: linear-gradient(to bottom, transparent, rgba(37,211,102,.5) 50%, transparent);
        }

        /* ── Layout ── */
        .wac-wrap {
          position: relative; z-index: 10;
          max-width: 1280px; margin: 0 auto; padding: 0 48px;
          display: grid;
          grid-template-columns: 1fr 440px;
          gap: 80px;
          align-items: center;
        }
        @media (max-width: 1024px) {
          .wac-wrap { grid-template-columns: 1fr; gap: 52px; padding: 0 32px; }
        }
        @media (max-width: 600px) {
          .wac-wrap { padding: 0 20px; }
          .wac-section { padding: 80px 0 90px; }
        }

        /* ── LEFT ── */
        .wac-eyebrow {
          display: flex; align-items: center; gap: 9px; margin-bottom: 24px;
        }
        .wac-eyebrow-icon {
          display: flex; align-items: center; justify-content: center;
          width: 26px; height: 26px; border-radius: 50%;
          background: rgba(37,211,102,.12);
          border: 1px solid rgba(37,211,102,.22);
          flex-shrink: 0;
        }
        .wac-eyebrow-text {
          font-size: 9.5px; letter-spacing: .44em; text-transform: uppercase;
          color: #25d366; font-weight: 600;
        }

        .wac-headline {
          display: flex; flex-direction: column;
          margin: 0 0 28px;
          font-family: var(--font-display);
          line-height: .88;
        }
        .wac-hl-top {
          font-size: clamp(2rem, 4vw, 3.8rem);
          color: rgba(255,255,255,.5); letter-spacing: .22em;
        }
        .wac-hl-mid {
          position: relative;
          font-size: clamp(3.8rem, 8vw, 7.5rem);
          color: #fff; letter-spacing: .04em;
        }
        .wac-hl-dot {
          display: inline-block;
          width: 10px; height: 10px; border-radius: 50%;
          background: #25d366;
          vertical-align: top;
          margin-left: 4px;
          box-shadow: 0 0 16px rgba(37,211,102,.8);
          animation: wac-pulse 2s ease-in-out infinite;
        }
        @keyframes wac-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: .6; transform: scale(.7); }
        }
        .wac-hl-bot {
          font-size: clamp(2rem, 4vw, 3.8rem);
          color: rgba(255,255,255,.5); letter-spacing: .22em;
        }
        .wac-hl-accent {
          color: #25d366;
        }

        .wac-body {
          font-size: 14.5px; line-height: 1.82;
          color: rgba(255,255,255,.4); max-width: 440px; margin-bottom: 32px;
        }
        .wac-em {
          font-style: normal; color: rgba(255,255,255,.72); font-weight: 500;
        }

        /* Member badge */
        .wac-badge {
          display: flex; align-items: center; gap: 14px;
          margin-bottom: 34px;
          padding: 12px 18px;
          background: rgba(37,211,102,.04);
          border: 1px solid rgba(37,211,102,.14);
          border-radius: 4px;
          backdrop-filter: blur(8px);
          width: fit-content;
        }
        .wac-badge-avatars { display: flex; align-items: center; }
        .wac-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          background: linear-gradient(135deg, #1a6b3a, #25d366);
          border: 2px solid rgba(4,5,4,.9);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: #fff;
          font-family: 'DM Sans', sans-serif;
          position: relative;
        }
        .wac-avatar-more {
          background: rgba(37,211,102,.18);
          color: #25d366;
          font-size: 13px;
        }
        .wac-badge-num {
          font-family: var(--font-display);
          font-size: 1.3rem; color: #25d366; letter-spacing: .06em;
          display: block; line-height: 1;
        }
        .wac-badge-sub {
          font-size: 9px; letter-spacing: .18em; text-transform: uppercase;
          color: rgba(255,255,255,.3); display: block; margin-top: 2px;
        }

        /* CTA */
        .wac-cta {
          position: relative; overflow: hidden;
          display: inline-flex; align-items: center; gap: 12px;
          padding: 16px 32px; border-radius: 3px;
          text-decoration: none;
          background: #25d366;
          color: #fff;
          font-size: 10.5px; font-weight: 700;
          letter-spacing: .28em; text-transform: uppercase;
          font-family: 'DM Sans', sans-serif;
          box-shadow: 0 0 32px rgba(37,211,102,.28), 0 4px 20px rgba(0,0,0,.5);
          transition: box-shadow .25s, transform .15s, background .2s;
        }
        .wac-cta:hover, .wac-cta-hov {
          background: #1fba57;
          box-shadow: 0 0 55px rgba(37,211,102,.55), 0 8px 30px rgba(0,0,0,.6);
          transform: translateY(-2px);
        }
        .wac-cta:active { transform: scale(.97); }
        .wac-cta-icon {
          display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; border-radius: 50%;
          background: rgba(255,255,255,.18); flex-shrink: 0;
        }
        .wac-cta-label { flex: 1; }
        .wac-cta-arrow {
          display: flex; align-items: center;
          opacity: .7;
          transition: transform .2s, opacity .2s;
        }
        .wac-cta:hover .wac-cta-arrow { transform: translateX(4px); opacity: 1; }
        .wac-cta-shimmer {
          position: absolute; inset: 0;
          background: linear-gradient(108deg, transparent 30%, rgba(255,255,255,.2) 50%, transparent 70%);
          transform: translateX(-120%);
          transition: transform .6s ease;
          pointer-events: none;
        }
        .wac-cta:hover .wac-cta-shimmer { transform: translateX(120%); }

        /* Secondary */
        .wac-secondary {
          display: flex; align-items: center; gap: 12px; margin-top: 16px;
        }
        .wac-secondary-or {
          font-size: 10px; color: rgba(255,255,255,.2); letter-spacing: .2em;
        }
        .wac-secondary-link {
          display: flex; align-items: center; gap: 6px;
          font-size: 10px; letter-spacing: .2em; text-transform: uppercase;
          color: rgba(255,255,255,.36); text-decoration: none;
          font-weight: 500;
          transition: color .2s;
          border-bottom: 1px solid rgba(255,255,255,.1);
          padding-bottom: 2px;
        }
        .wac-secondary-link:hover { color: rgba(37,211,102,.8); border-color: rgba(37,211,102,.3); }

        /* ── RIGHT ── */
        .wac-right-label {
          display: flex; align-items: center; gap: 12px; margin-bottom: 22px;
        }
        .wac-right-line {
          flex: 1; height: 1px; background: rgba(255,255,255,.08);
        }
        .wac-right-label-text {
          font-size: 8.5px; letter-spacing: .4em; text-transform: uppercase;
          color: rgba(255,255,255,.2); white-space: nowrap;
        }

        /* Feature cards */
        .wac-features {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2px;
          background: rgba(255,255,255,.04);
          border-radius: 5px;
          overflow: hidden;
          margin-bottom: 2px;
        }
        @media (max-width: 540px) {
          .wac-features { grid-template-columns: 1fr; }
        }

        .wac-feat {
          display: flex; align-items: flex-start; gap: 13px;
          padding: 20px 18px;
          background: rgba(8,12,8,.65);
          backdrop-filter: blur(6px);
          transition: background .22s;
        }
        .wac-feat:hover { background: rgba(14,20,14,.8); }

        .wac-feat-icon {
          color: #25d366; flex-shrink: 0;
          margin-top: 2px; opacity: .85;
        }
        .wac-feat-title {
          font-family: var(--font-display);
          font-size: 1.05rem; color: #fff;
          letter-spacing: .07em; line-height: 1; margin-bottom: 6px;
        }
        .wac-feat-desc {
          font-size: 11.5px; color: rgba(255,255,255,.35);
          line-height: 1.5;
        }

        /* Stats */
        .wac-stats {
          display: flex;
          background: rgba(37,211,102,.04);
          border: 1px solid rgba(37,211,102,.1);
          border-radius: 4px;
          overflow: hidden;
          margin-top: 14px;
        }
        .wac-stat {
          flex: 1; padding: 14px 0; text-align: center;
          border-right: 1px solid rgba(37,211,102,.08);
        }
        .wac-stat:last-child { border-right: none; }
        .wac-stat-v {
          font-family: var(--font-display);
          font-size: 1.6rem; color: #25d366;
          letter-spacing: .06em; line-height: 1; margin-bottom: 3px;
        }
        .wac-stat-l {
          font-size: 8px; letter-spacing: .3em; text-transform: uppercase;
          color: rgba(255,255,255,.22);
        }
      `}</style>
    </section>
  );
}