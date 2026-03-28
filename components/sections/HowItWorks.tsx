"use client";

import { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────
   STEP DATA
───────────────────────────────────────── */
const STEPS = [
  {
    num: "01",
    tag: "Zero Setup",
    title: "Install\nthe App",
    desc: "Add DjAfro Cinema to your phone, desktop, or smart TV — no App Store, no Play Store, no nonsense. One tap and you're in.",
    cta: "How to Install →",
    icon: (
      <svg viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="14" y="4" width="28" height="48" rx="4" />
        <path d="M22 44h12" strokeWidth="2" stroke="#e50914" />
        <path d="M28 14v16" />
        <path d="M20 24l8 8 8-8" />
        <circle cx="28" cy="10" r="1.5" fill="#e50914" stroke="none" />
      </svg>
    ),
  },
  {
    num: "02",
    tag: "Vast Library",
    title: "Browse\n& Discover",
    desc: "Hundreds of DJ Afro dubbed films, Bollywood blockbusters, and East African cinema. Filter by genre, mood, or year.",
    cta: "Browse Movies →",
    icon: (
      <svg viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="24" cy="24" r="14" />
        <path d="M34 34l10 10" strokeWidth="2" stroke="#e50914" />
        <path d="M20 24h8M24 20v8" />
        <path d="M14 24a10 10 0 0010-10" strokeWidth="0.8" strokeDasharray="2 2" />
      </svg>
    ),
  },
  {
    num: "03",
    tag: "10 KSh Only",
    title: "Unlock\nPremium",
    desc: "Hundreds of movies are completely free. Premium films unlock instantly for just 10 KSh — pay with M-Pesa, no card needed.",
    cta: "See Pricing →",
    icon: (
      <svg viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 26V20a8 8 0 0116 0v6" />
        <rect x="12" y="26" width="32" height="24" rx="3" />
        <circle cx="28" cy="38" r="4" fill="#e50914" stroke="none" />
        <path d="M28 38v4" stroke="#fff" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    num: "04",
    tag: "Every Screen",
    title: "Stream\nAnywhere",
    desc: "Phone, laptop, smart TV — even on slow connections. Your watch history syncs across every device, every time.",
    cta: "Supported Devices →",
    icon: (
      <svg viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="10" width="36" height="24" rx="3" />
        <path d="M14 34v6M8 40h20" />
        <rect x="40" y="22" width="12" height="18" rx="2" />
        <path d="M43 38h6" stroke="#e50914" strokeWidth="1.5" />
      </svg>
    ),
  },
];

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */
export default function HowItWorks() {
  const [visible, setVisible] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works" className="hiw-section">

      {/* ── Ambient top line (matches FeaturedCarousel) ── */}
      <div className="hiw-ambient-line" />

      {/* ── Background ghost text ── */}
      <div className="hiw-ghost-text" aria-hidden>HOW IT WORKS</div>

      {/* ── Atmospheric red orbs ── */}
      <div className="hiw-orb hiw-orb-1" aria-hidden />
      <div className="hiw-orb hiw-orb-2" aria-hidden />

      {/* ── Vertical reel strip — left ── */}
      <div className="hiw-reel hiw-reel-left" aria-hidden>
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="hiw-reel-hole" />
        ))}
      </div>

      {/* ── Vertical reel strip — right ── */}
      <div className="hiw-reel hiw-reel-right" aria-hidden>
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="hiw-reel-hole" />
        ))}
      </div>

      <div ref={sectionRef} className="hiw-inner">

        {/* ══════════════ HEADER ══════════════ */}
        <div
          className="hiw-header"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          <div className="hiw-eyebrow">
            <div className="hiw-eyebrow-line" />
            <span className="hiw-eyebrow-text">Simple & Fast</span>
            <div className="hiw-eyebrow-line" />
          </div>

          <h2 className="hiw-title">
            START WATCHING <span className="hiw-title-outline">IN MINUTES</span>
          </h2>

          <p className="hiw-subtitle">
            No credit card. No App Store. No nonsense.{" "}
            <span className="hiw-subtitle-accent">Built for how Kenyans actually watch movies.</span>
          </p>
        </div>

        {/* ══════════════ TIMELINE CONNECTOR (desktop) ══════════════ */}
        <div
          className="hiw-timeline"
          aria-hidden
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 1s ease 0.4s",
          }}
        >
          <div className="hiw-timeline-track" />
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="hiw-timeline-node"
              style={{ left: `${(i / (STEPS.length - 1)) * 100}%` }}
            />
          ))}
        </div>

        {/* ══════════════ STEPS GRID ══════════════ */}
        <div className="hiw-grid">
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className={`hiw-card ${activeStep === i ? "hiw-card-active" : ""}`}
              onMouseEnter={() => setActiveStep(i)}
              onMouseLeave={() => setActiveStep(null)}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(48px)",
                transition: `opacity 0.65s ease ${i * 130 + 200}ms, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${i * 130 + 200}ms`,
              }}
            >
              {/* Ghost step number — large behind card */}
              <div className="hiw-card-ghost" aria-hidden>{step.num}</div>

              {/* Top accent bar */}
              <div className="hiw-card-topbar" />

              {/* Step tag */}
              <div className="hiw-card-tag">{step.tag}</div>

              {/* Icon */}
              <div className="hiw-card-icon">
                {step.icon}
              </div>

              {/* Step number pill */}
              <div className="hiw-card-num">{step.num}</div>

              {/* Title — two lines, Bebas */}
              <h3 className="hiw-card-title">
                {step.title.split("\n").map((line, j) => (
                  <span key={j}>
                    {j === 1 ? <span className="hiw-card-title-red">{line}</span> : line}
                    {j === 0 && "\n"}
                  </span>
                ))}
              </h3>

              {/* Separator */}
              <div className="hiw-card-sep" />

              {/* Description */}
              <p className="hiw-card-desc">{step.desc}</p>

              {/* CTA text link */}
              <div className="hiw-card-cta">{step.cta}</div>

              {/* Bottom glow on hover */}
              <div className="hiw-card-glow" aria-hidden />
            </div>
          ))}
        </div>

        {/* ══════════════ BOTTOM STATS BAR ══════════════ */}
        <div
          className="hiw-stats"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.7s ease 0.8s, transform 0.7s ease 0.8s",
          }}
        >
          {[
            { value: "500+", label: "Movies Available" },
            { value: "10 KSh", label: "Premium Unlock" },
            { value: "Any Device", label: "Works Everywhere" },
            { value: "1,200+", label: "Active Users" },
          ].map((stat, i) => (
            <div key={i} className="hiw-stat">
              {i > 0 && <div className="hiw-stat-divider" />}
              <div className="hiw-stat-value">{stat.value}</div>
              <div className="hiw-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

      </div>

      {/* ══════════════ STYLES ══════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');

        /* ── Section shell ── */
        .hiw-section {
          position: relative;
          background: #080808;
          padding: 96px 0 108px;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── Ambient top line — matches FeaturedCarousel ── */
        .hiw-ambient-line {
          position: absolute;
          top: 0; left: 50%; transform: translateX(-50%);
          width: 800px; height: 2px;
          background: linear-gradient(90deg, transparent, #e50914, transparent);
          opacity: 0.5;
        }

        /* ── Ghost heading behind everything ── */
        .hiw-ghost-text {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(5rem, 18vw, 15rem);
          color: #fff;
          opacity: 0.016;
          letter-spacing: 0.12em;
          white-space: nowrap;
          pointer-events: none;
          user-select: none;
        }

        /* ── Red atmospheric orbs ── */
        .hiw-orb {
          position: absolute;
          border-radius: 50%;
          background: #e50914;
          filter: blur(80px);
          pointer-events: none;
        }
        .hiw-orb-1 {
          width: 500px; height: 500px;
          top: -120px; right: -100px;
          opacity: 0.028;
        }
        .hiw-orb-2 {
          width: 380px; height: 380px;
          bottom: -80px; left: -60px;
          opacity: 0.022;
        }

        /* ── Film reel strips ── */
        .hiw-reel {
          position: absolute;
          top: 0; bottom: 0;
          width: 22px;
          background: #0d0d0d;
          border: 1px solid rgba(255,255,255,0.035);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px 0;
          gap: 10px;
          z-index: 1;
        }
        .hiw-reel-left  { left: 0; border-left: none; border-right-color: rgba(255,255,255,0.04); }
        .hiw-reel-right { right: 0; border-right: none; border-left-color: rgba(255,255,255,0.04); }
        .hiw-reel-hole {
          width: 10px; height: 8px;
          background: #1a1a1a;
          border-radius: 2px;
          border: 1px solid rgba(255,255,255,0.055);
          flex-shrink: 0;
        }

        /* ── Inner content wrapper ── */
        .hiw-inner {
          position: relative;
          z-index: 2;
          max-width: 1300px;
          margin: 0 auto;
          padding: 0 48px;
        }

        /* ── Header ── */
        .hiw-header {
          text-align: center;
          margin-bottom: 60px;
        }
        .hiw-eyebrow {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          margin-bottom: 18px;
        }
        .hiw-eyebrow-line {
          width: 40px; height: 1px;
          background: linear-gradient(90deg, transparent, #e50914);
        }
        .hiw-eyebrow-line:last-child {
          background: linear-gradient(90deg, #e50914, transparent);
        }
        .hiw-eyebrow-text {
          font-size: 9px;
          letter-spacing: 0.52em;
          text-transform: uppercase;
          color: #e50914;
          font-weight: 600;
        }
        .hiw-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.6rem, 6vw, 4.5rem);
          color: #fff;
          letter-spacing: 0.07em;
          line-height: 0.95;
          margin: 0 0 18px;
        }
        .hiw-title-outline {
          color: transparent;
          -webkit-text-stroke: 1px rgba(255,255,255,0.22);
        }
        .hiw-subtitle {
          font-size: 14px;
          color: rgba(255,255,255,0.38);
          max-width: 480px;
          margin: 0 auto;
          line-height: 1.7;
        }
        .hiw-subtitle-accent {
          color: rgba(255,255,255,0.62);
        }

        /* ── Timeline connector (desktop) ── */
        .hiw-timeline {
          position: relative;
          height: 2px;
          margin: 0 0 -1px;
          display: none;
        }
        @media (min-width: 1024px) { .hiw-timeline { display: block; } }
        .hiw-timeline-track {
          position: absolute;
          top: 50%; left: 4%;
          width: 92%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(229,9,20,0.4) 20%, rgba(229,9,20,0.4) 80%, transparent);
          transform: translateY(-50%);
        }
        .hiw-timeline-node {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #e50914;
          box-shadow: 0 0 12px rgba(229,9,20,0.8);
        }

        /* ── Cards grid ── */
        .hiw-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2px;
          background: rgba(255,255,255,0.04);
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 2px;
        }
        @media (min-width: 640px)  { .hiw-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .hiw-grid { grid-template-columns: repeat(4, 1fr); } }

        /* ── Single card ── */
        .hiw-card {
          position: relative;
          background: #0a0a0a;
          padding: 44px 32px 36px;
          overflow: hidden;
          cursor: default;
          transition: background 0.3s ease;
        }
        .hiw-card-active { background: #0f0f0f; }

        /* Ghost number */
        .hiw-card-ghost {
          position: absolute;
          bottom: -12px; right: -8px;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 7rem;
          color: #e50914;
          opacity: 0.055;
          letter-spacing: -0.04em;
          line-height: 1;
          pointer-events: none;
          user-select: none;
          transition: opacity 0.3s;
        }
        .hiw-card-active .hiw-card-ghost { opacity: 0.09; }

        /* Top accent bar */
        .hiw-card-topbar {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, #e50914, transparent);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .hiw-card-active .hiw-card-topbar { transform: scaleX(1); }

        /* Tag */
        .hiw-card-tag {
          display: inline-block;
          font-size: 8px;
          letter-spacing: 0.45em;
          text-transform: uppercase;
          font-weight: 700;
          color: #e50914;
          border: 1px solid rgba(229,9,20,0.28);
          background: rgba(229,9,20,0.07);
          padding: 3px 9px 2px;
          border-radius: 2px;
          margin-bottom: 24px;
        }

        /* Icon */
        .hiw-card-icon {
          width: 56px; height: 56px;
          color: rgba(255,255,255,0.55);
          margin-bottom: 20px;
          transition: color 0.3s, transform 0.4s cubic-bezier(0.22,1,0.36,1);
        }
        .hiw-card-active .hiw-card-icon {
          color: rgba(255,255,255,0.85);
          transform: translateY(-3px) scale(1.05);
        }

        /* Step number pill */
        .hiw-card-num {
          font-size: 9px;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: #e50914;
          font-weight: 700;
          margin-bottom: 10px;
        }

        /* Title */
        .hiw-card-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(1.7rem, 2.5vw, 2.1rem);
          color: #fff;
          letter-spacing: 0.05em;
          line-height: 1;
          white-space: pre-line;
          margin: 0 0 16px;
        }
        .hiw-card-title-red { color: #e50914; }

        /* Separator */
        .hiw-card-sep {
          width: 28px; height: 1px;
          background: rgba(229,9,20,0.4);
          margin-bottom: 14px;
          transition: width 0.4s ease;
        }
        .hiw-card-active .hiw-card-sep { width: 52px; }

        /* Description */
        .hiw-card-desc {
          font-size: 13px;
          color: rgba(255,255,255,0.42);
          line-height: 1.72;
          margin: 0 0 20px;
          transition: color 0.3s;
        }
        .hiw-card-active .hiw-card-desc { color: rgba(255,255,255,0.6); }

        /* CTA */
        .hiw-card-cta {
          font-size: 10px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: rgba(229,9,20,0.5);
          font-weight: 600;
          transition: color 0.3s, letter-spacing 0.3s;
          cursor: pointer;
        }
        .hiw-card-active .hiw-card-cta {
          color: #e50914;
          letter-spacing: 0.3em;
        }

        /* Bottom glow */
        .hiw-card-glow {
          position: absolute;
          bottom: -60px; left: 50%;
          transform: translateX(-50%);
          width: 200px; height: 100px;
          background: #e50914;
          border-radius: 50%;
          filter: blur(40px);
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }
        .hiw-card-active .hiw-card-glow { opacity: 0.08; }

        /* ── Stats bar ── */
        .hiw-stats {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          background: #0d0d0d;
          border: 1px solid rgba(255,255,255,0.05);
          border-top: 1px solid rgba(229,9,20,0.12);
          border-radius: 0 0 6px 6px;
          padding: 28px 0;
          flex-wrap: wrap;
        }
        .hiw-stat {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px 40px;
          flex: 1;
          min-width: 140px;
        }
        .hiw-stat-divider {
          position: absolute;
          left: 0; top: 50%;
          transform: translateY(-50%);
          width: 1px; height: 32px;
          background: rgba(255,255,255,0.07);
        }
        .hiw-stat-value {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2rem;
          color: #fff;
          letter-spacing: 0.05em;
          line-height: 1;
        }
        .hiw-stat-label {
          font-size: 9px;
          letter-spacing: 0.38em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          font-weight: 500;
        }

        /* ── Responsive padding ── */
        @media (max-width: 640px) {
          .hiw-inner { padding: 0 28px; }
          .hiw-card  { padding: 32px 24px 28px; }
          .hiw-stat  { padding: 8px 20px; min-width: 120px; }
        }
      `}</style>
    </section>
  );
}