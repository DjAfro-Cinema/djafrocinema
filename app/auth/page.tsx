"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// ── BG IMAGES cycling on the visual panel ──────────────────────────────────
const BG_IMAGES = [
  "/images/login1.jpg",
  "/images/login2.jpg",
  "/images/login3.jpg",
  "/images/login4.jpg",
  "/images/login5.jpg",
  "/images/login6.jpg",
];

const BG_VIDEO = "/videos/hero.mp4";

// ── QUOTES cycling on visual panel ─────────────────────────────────────────
const TAGLINES = [
  { line: "The best stories", sub: "are dubbed for you." },
  { line: "Enjoy DjAfro Movies", sub: "available on all devices." },
  { line: "500+ movies.", sub: "DjAfro movies. All yours." },
];

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [bgIdx, setBgIdx] = useState(0);
  const [tagIdx, setTagIdx] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [useVideo, setUseVideo] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Mount animation
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Cycle backgrounds (fallback images)
  useEffect(() => {
    const t = setInterval(() => {
      setBgIdx((i) => (i + 1) % BG_IMAGES.length);
      setTagIdx((i) => (i + 1) % TAGLINES.length);
      setImgLoaded(false);
    }, 5500);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // DEV MODE: just navigate to dashboard
    await new Promise((r) => setTimeout(r, 1100));
    router.push("/dashboard");
  };

  const handleGoogle = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    router.push("/dashboard");
  };

  const tagline = TAGLINES[tagIdx];

  return (
    <>
      {/* ── GLOBAL STYLES ── */}
      <style>{`

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --red: #e50914;
          --red-dim: rgba(229,9,20,0.15);
          --red-glow: rgba(229,9,20,0.35);
          --green: #25d366;
          --bg: #060608;
          --surface: rgba(12,12,16,0.82);
          --border: rgba(255,255,255,0.07);
          --border-focus: rgba(229,9,20,0.55);
          --text: #ffffff;
          --text-muted: rgba(255,255,255,0.38);
          --text-dim: rgba(255,255,255,0.60);
          --font-display: var(--font-display);
          --font-body: 'DM Sans', sans-serif;
          --ease-out: cubic-bezier(0.22,1,0.36,1);
          --ease-in-out: cubic-bezier(0.4,0,0.2,1);
        }

        html, body { height: 100%; background: var(--bg); }

        /* ── PAGE WRAPPER ── */
        .auth-page {
          min-height: 100svh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: var(--font-body);
          background: var(--bg);
          position: relative;
          overflow: hidden;
        }

        /* ── VISUAL PANEL (left) ── */
        .auth-visual {
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        .auth-visual-media {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .auth-visual-video,
        .auth-visual-img {
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
        }
        .auth-visual-img {
          transition: opacity 1.2s var(--ease-out);
        }

        /* Layered overlays */
        .auth-visual-ov1 {
          position: absolute; inset: 0; z-index: 1;
          background: linear-gradient(135deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.40) 60%, rgba(0,0,0,0.15) 100%);
        }
        .auth-visual-ov2 {
          position: absolute; inset: 0; z-index: 1;
          background: linear-gradient(to top, rgba(6,6,8,1) 0%, rgba(6,6,8,0.65) 20%, transparent 55%);
        }
        .auth-visual-ov3 {
          position: absolute; inset: 0; z-index: 1;
          background: linear-gradient(to right, rgba(6,6,8,0.0) 75%, rgba(6,6,8,0.98) 100%);
        }
        /* Red accent wash */
        .auth-visual-accent {
          position: absolute; inset: 0; z-index: 1;
          background: radial-gradient(ellipse 70% 55% at 30% 70%, rgba(229,9,20,0.10) 0%, transparent 70%);
        }

        /* Film grain */
        .auth-grain {
          position: absolute; inset: 0; z-index: 2;
          opacity: 0.03;
          mix-blend-mode: overlay;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 180px;
        }

        /* Logo in visual */
        .auth-visual-logo {
          position: absolute;
          top: 36px; left: 36px;
          z-index: 5;
          display: flex; align-items: center; gap: 10px;
        }
        .auth-logo-icon {
          width: 500px; height: 70px; border-radius: 4px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .auth-logo-text {
          font-family: var(--font-display);
          font-size: 1.35rem; letter-spacing: 0.12em;
          color: #fff;
          line-height: 1;
        }
        .auth-logo-text em {
          font-style: normal;
          color: var(--red);
        }

        /* Bottom content in visual */
        .auth-visual-content {
          position: relative; z-index: 5;
          padding: 0 40px 48px;
        }
        .auth-visual-tag {
          display: inline-flex; align-items: center; gap: 8px;
          margin-bottom: 16px;
          font-size: 9px; font-weight: 600;
          letter-spacing: 0.42em; text-transform: uppercase;
          color: var(--red);
        }
        .auth-visual-tag-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--red);
          box-shadow: 0 0 8px var(--red);
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%,100% { opacity:1; transform: scale(1); }
          50% { opacity:0.5; transform: scale(0.65); }
        }

        .auth-visual-headline {
          font-family: var(--font-display);
          font-size: clamp(2.8rem, 4.5vw, 4.2rem);
          color: #fff;
          letter-spacing: 0.04em;
          line-height: 0.90;
          margin-bottom: 10px;
          transition: opacity 0.6s var(--ease-out), transform 0.6s var(--ease-out);
        }
        .auth-visual-headline em {
          font-style: normal;
          color: transparent;
          -webkit-text-stroke: 1px rgba(255,255,255,0.35);
        }
        .auth-visual-sub {
          font-size: 13px; color: rgba(255,255,255,0.42);
          letter-spacing: 0.04em;
          transition: opacity 0.6s var(--ease-out);
        }

        /* Stats strip */
        .auth-stats {
          display: flex; gap: 0; margin-top: 28px;
          border-top: 1px solid rgba(255,255,255,0.07);
          padding-top: 20px;
        }
        .auth-stat {
          flex: 1;
          padding-right: 20px;
          border-right: 1px solid rgba(255,255,255,0.06);
          margin-right: 20px;
        }
        .auth-stat:last-child { border-right: none; margin-right: 0; }
        .auth-stat-n {
          font-family: var(--font-display);
          font-size: 1.6rem; color: #fff;
          letter-spacing: 0.06em; line-height: 1;
        }
        .auth-stat-l {
          font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase;
          color: rgba(255,255,255,0.25); margin-top: 3px;
        }

        /* Vertical progress bars (slide indicator) */
        .auth-visual-pips {
          position: absolute;
          top: 50%; right: 20px;
          transform: translateY(-50%);
          z-index: 6;
          display: flex; flex-direction: column; gap: 6px;
          align-items: center;
        }
        .auth-pip {
          width: 3px; border-radius: 99px;
          background: rgba(255,255,255,0.18);
          transition: all 0.4s var(--ease-out);
        }
        .auth-pip.active {
          background: var(--red);
          box-shadow: 0 0 8px var(--red);
        }

        /* ── FORM PANEL (right) ── */
        .auth-form-panel {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 48px 40px;
          position: relative;
          background: var(--bg);
          overflow-y: auto;
        }

        /* Top ambient line */
        .auth-form-ambient {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, var(--red) 50%, transparent 100%);
          opacity: 0.45;
        }

        .auth-form-inner {
          width: 100%;
          max-width: 380px;
        }

        /* Mobile logo (hidden on desktop) */
        .auth-mobile-logo {
          display: none;
          align-items: center;
          gap: 10px;
          margin-bottom: 36px;
        }

        /* ── TAB SWITCHER ── */
        .auth-tabs {
          display: flex;
          gap: 0;
          margin-bottom: 36px;
          position: relative;
        }
        .auth-tab {
          flex: 1;
          background: none;
          border: none;
          cursor: pointer;
          padding: 14px 0;
          font-family: var(--font-body);
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: var(--text-muted);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          transition: color 0.25s;
          position: relative;
        }
        .auth-tab.active { color: var(--text); }
        .auth-tab-indicator {
          position: absolute;
          bottom: -1px; height: 2px;
          background: var(--red);
          box-shadow: 0 0 10px var(--red);
          transition: left 0.35s var(--ease-out), width 0.35s var(--ease-out);
          border-radius: 99px;
        }

        /* ── HEADING ── */
        .auth-heading {
          margin-bottom: 28px;
        }
        .auth-heading-title {
          font-family: var(--font-display);
          font-size: clamp(2.4rem, 4vw, 3.2rem);
          color: #fff;
          letter-spacing: 0.05em;
          line-height: 0.88;
          margin-bottom: 8px;
        }
        .auth-heading-sub {
          font-size: 12.5px;
          color: var(--text-muted);
          line-height: 1.5;
        }
        .auth-heading-sub strong {
          color: rgba(255,255,255,0.65);
          font-weight: 500;
        }

        /* ── GOOGLE BUTTON ── */
        .auth-google {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          padding: 14px 20px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.80);
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
          backdrop-filter: blur(8px);
          text-decoration: none;
        }
        .auth-google:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.20);
          color: #fff;
        }
        .auth-google:active { transform: scale(0.985); }
        .auth-google-icon {
          width: 18px; height: 18px; flex-shrink: 0;
        }

        /* Divider */
        .auth-divider {
          display: flex; align-items: center; gap: 14px;
          margin: 20px 0;
        }
        .auth-divider-line {
          flex: 1; height: 1px;
          background: rgba(255,255,255,0.07);
        }
        .auth-divider-text {
          font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase;
          color: rgba(255,255,255,0.2);
        }

        /* ── FORM ── */
        .auth-form { display: flex; flex-direction: column; gap: 14px; }

        .auth-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .auth-label {
          font-size: 9.5px; font-weight: 600;
          letter-spacing: 0.3em; text-transform: uppercase;
          color: rgba(255,255,255,0.35);
        }
        .auth-input-wrap {
          position: relative;
        }
        .auth-input {
          width: 100%;
          padding: 13px 16px;
          border-radius: 6px;
          border: 1px solid var(--border);
          background: rgba(255,255,255,0.03);
          color: #fff;
          font-family: var(--font-body);
          font-size: 14px;
          outline: none;
          transition: border-color 0.22s, background 0.22s, box-shadow 0.22s;
          backdrop-filter: blur(6px);
        }
        .auth-input::placeholder { color: rgba(255,255,255,0.18); }
        .auth-input:focus {
          border-color: var(--border-focus);
          background: rgba(229,9,20,0.04);
          box-shadow: 0 0 0 3px rgba(229,9,20,0.08);
        }
        .auth-input-icon {
          position: absolute;
          right: 14px; top: 50%; transform: translateY(-50%);
          color: rgba(255,255,255,0.22);
          display: flex; align-items: center;
          cursor: pointer;
        }
        .auth-input-icon:hover { color: rgba(255,255,255,0.55); }

        /* ── SUBMIT BUTTON ── */
        .auth-submit {
          position: relative; overflow: hidden;
          width: 100%;
          padding: 15px 20px;
          border-radius: 6px;
          border: none;
          background: var(--red);
          color: #fff;
          font-family: var(--font-body);
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          cursor: pointer;
          margin-top: 6px;
          transition: box-shadow 0.25s, transform 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .auth-submit:hover {
          box-shadow: 0 0 36px rgba(229,9,20,0.55), 0 4px 20px rgba(0,0,0,0.5);
        }
        .auth-submit:active { transform: scale(0.98); }
        .auth-submit:disabled {
          opacity: 0.6; cursor: wait;
        }
        .auth-submit-shimmer {
          position: absolute; inset: 0;
          background: linear-gradient(108deg, transparent 30%, rgba(255,255,255,0.22) 50%, transparent 70%);
          transform: translateX(-120%);
          transition: transform 0.6s ease;
          pointer-events: none;
        }
        .auth-submit:hover .auth-submit-shimmer { transform: translateX(120%); }

        /* Spinner */
        .auth-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── FORGOT / FOOTER ── */
        .auth-forgot {
          text-align: right; margin-top: -4px;
        }
        .auth-forgot a {
          font-size: 11px; color: var(--text-muted);
          text-decoration: none;
          transition: color 0.2s;
        }
        .auth-forgot a:hover { color: var(--red); }

        .auth-footer-note {
          margin-top: 22px;
          text-align: center;
          font-size: 11px; color: var(--text-muted);
          line-height: 1.6;
        }
        .auth-footer-note a {
          color: var(--red); text-decoration: none;
        }
        .auth-footer-note a:hover { text-decoration: underline; }

        /* Legal */
        .auth-legal {
          margin-top: 28px;
          font-size: 9.5px; color: rgba(255,255,255,0.15);
          text-align: center; line-height: 1.6; letter-spacing: 0.02em;
        }
        .auth-legal a { color: rgba(255,255,255,0.25); text-decoration: none; }

        /* ── PAGE MOUNT ANIMATION ── */
        .auth-page { opacity: 0; transition: opacity 0.5s ease; }
        .auth-page.mounted { opacity: 1; }

        .auth-form-inner {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.65s var(--ease-out) 0.15s,
                      transform 0.65s var(--ease-out) 0.15s;
        }
        .auth-page.mounted .auth-form-inner {
          opacity: 1; transform: translateY(0);
        }

        .auth-visual-content {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.75s var(--ease-out) 0.1s,
                      transform 0.75s var(--ease-out) 0.1s;
        }
        .auth-page.mounted .auth-visual-content {
          opacity: 1; transform: translateY(0);
        }

        .auth-visual-logo {
          opacity: 0;
          transition: opacity 0.5s ease 0.05s;
        }
        .auth-page.mounted .auth-visual-logo {
          opacity: 1;
        }

        /* ── FORM TAB TRANSITION ── */
        .auth-form-fields {
          animation: formFade 0.38s var(--ease-out);
        }
        @keyframes formFade {
          from { opacity: 0; transform: translateX(8px); }
          to { opacity: 1; transform: translateX(0); }
        }

        /* ── MOBILE ── */
        @media (max-width: 768px) {
          .auth-page {
            grid-template-columns: 1fr;
            grid-template-rows: auto 1fr;
          }

          .auth-visual {
            height: 260px;
            flex-shrink: 0;
          }

          .auth-visual-pips { right: 12px; }
          .auth-visual-logo { top: 20px; left: 20px; }

          .auth-visual-content {
            padding: 0 24px 28px;
          }
          .auth-visual-headline { font-size: 2.2rem; }
          .auth-visual-sub { font-size: 12px; }
          .auth-stats { display: none; }
          .auth-visual-ov3 { display: none; }

          .auth-form-panel {
            padding: 36px 24px 48px;
            justify-content: flex-start;
          }
          .auth-mobile-logo {
            display: flex;
          }
          .auth-form-inner {
            max-width: 100%;
          }
        }

        @media (max-width: 420px) {
          .auth-form-panel { padding: 28px 18px 40px; }
          .auth-visual { height: 220px; }
        }

        /* Smooth bg image crossfade wrapper */
        .auth-img-stack {
          position: absolute; inset: 0;
        }
        .auth-img-layer {
          position: absolute; inset: 0;
          background-size: cover;
          background-position: center;
          transition: opacity 1.4s var(--ease-out);
        }
      `}</style>

      <div className={`auth-page${mounted ? " mounted" : ""}`}>

        {/* ══════════════════════════════════════════════
            VISUAL PANEL — LEFT
        ══════════════════════════════════════════════ */}
        <div className="auth-visual">

          {/* Media */}
          <div className="auth-visual-media">
            {/* Video (signup side) */}
            {tab === "signup" ? (
              <video
                ref={videoRef}
                className="auth-visual-video"
                src={BG_VIDEO}
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              /* Image carousel for login */
              <div className="auth-img-stack">
                {BG_IMAGES.map((src, i) => (
                  <div
                    key={i}
                    className="auth-img-layer"
                    style={{
                      backgroundImage: `url(${src})`,
                      opacity: i === bgIdx ? 1 : 0,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Overlays */}
          <div className="auth-visual-ov1" />
          <div className="auth-visual-ov2" />
          <div className="auth-visual-ov3" />
          <div className="auth-visual-accent" />
          <div className="auth-grain" />

          {/* Logo */}
          <div className="auth-visual-logo">
            <div className="auth-logo-icon">
             
            </div>
            <Image
                src="/logo.png"
                alt="DjAfro Cinema"
                fill
                className="object-contain object-left"
                priority
                style={{
                  filter:
                    "drop-shadow(0 0 12px rgba(229,9,20,0.6)) drop-shadow(0 0 24px rgba(229,9,20,0.3))",
                  transition: "filter 0.4s ease",
                }}
              />
          </div>

          {/* Slide pips */}
          <div className="auth-visual-pips">
            {BG_IMAGES.map((_, i) => (
              <div
                key={i}
                className={`auth-pip${i === bgIdx ? " active" : ""}`}
                style={{ height: i === bgIdx ? 28 : 6 }}
              />
            ))}
          </div>

          {/* Bottom content */}
          <div className="auth-visual-content">
            <div className="auth-visual-tag">
              <span className="auth-visual-tag-dot" />
              DjAfro Cinema
            </div>

            <h2 className="auth-visual-headline">
              {tagline.line}
              <br />
              <em>{tagline.sub}</em>
            </h2>
            <p className="auth-visual-sub">
              The Best #1 DjAfro cinema platform.
            </p>

            <div className="auth-stats">
              {[
                { n: "500+", l: "Movies Dubbed" },
                { n: "10K+", l: "Fans & Growing" },
                { n: "Free", l: "to Start" },
              ].map((s) => (
                <div key={s.l} className="auth-stat">
                  <div className="auth-stat-n">{s.n}</div>
                  <div className="auth-stat-l">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            FORM PANEL — RIGHT
        ══════════════════════════════════════════════ */}
        <div className="auth-form-panel">
          <div className="auth-form-ambient" />

          <div className="auth-form-inner">

            {/* Mobile logo */}
            <div className="auth-mobile-logo">
              <div className="auth-logo-icon">
                <svg viewBox="0 0 24 24" fill="white" width="18" height="18">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <div className="auth-logo-text" style={{ color: "#fff" }}>
                DJ<span style={{ color: "#e50914" }}>AFRO</span>
              </div>
            </div>

            {/* Tab switcher */}
            <div className="auth-tabs">
              <button
                className={`auth-tab${tab === "login" ? " active" : ""}`}
                onClick={() => setTab("login")}
              >
                Sign In
              </button>
              <button
                className={`auth-tab${tab === "signup" ? " active" : ""}`}
                onClick={() => setTab("signup")}
              >
                Create Account
              </button>
              {/* sliding underline */}
              <div
                className="auth-tab-indicator"
                style={{
                  left: tab === "login" ? "0%" : "50%",
                  width: "50%",
                }}
              />
            </div>

            {/* Heading */}
            <div className="auth-heading">
              {tab === "login" ? (
                <>
                  <div className="auth-heading-title">
                    Welcome<br />Back.
                  </div>
                  <div className="auth-heading-sub">
                    Your movies are waiting. <strong>Sign in to continue.</strong>
                  </div>
                </>
              ) : (
                <>
                  <div className="auth-heading-title">
                    Join the<br />Cinema.
                  </div>
                  <div className="auth-heading-sub">
                    Create your account in seconds.{" "}
                    <strong>No credit card required.</strong>
                  </div>
                </>
              )}
            </div>

            {/* Google */}
            <button className="auth-google" onClick={handleGoogle} disabled={loading}>
              <svg className="auth-google-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="auth-divider">
              <div className="auth-divider-line" />
              <span className="auth-divider-text">or</span>
              <div className="auth-divider-line" />
            </div>

            {/* Form */}
            <div key={tab} className="auth-form-fields">
              <form className="auth-form" onSubmit={handleSubmit}>

                {/* Name — signup only */}
                {tab === "signup" && (
                  <div className="auth-field">
                    <label className="auth-label">Your Name</label>
                    <div className="auth-input-wrap">
                      <input
                        className="auth-input"
                        type="text"
                        placeholder="e.g. Wanjiku"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div className="auth-field">
                  <label className="auth-label">Email</label>
                  <div className="auth-input-wrap">
                    <input
                      className="auth-input"
                      type="email"
                      placeholder="you@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="auth-field">
                  <label className="auth-label">Password</label>
                  <div className="auth-input-wrap">
                    <input
                      className="auth-input"
                      type={showPass ? "text" : "password"}
                      placeholder={tab === "login" ? "Your password" : "Create a password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={tab === "login" ? "current-password" : "new-password"}
                      required
                      style={{ paddingRight: 44 }}
                    />
                    <button
                      type="button"
                      className="auth-input-icon"
                      onClick={() => setShowPass((v) => !v)}
                      tabIndex={-1}
                    >
                      {showPass ? (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot */}
                {tab === "login" && (
                  <div className="auth-forgot">
                    <a href="#">Forgot password?</a>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  className="auth-submit"
                  disabled={loading}
                >
                  <span className="auth-submit-shimmer" />
                  {loading ? (
                    <span className="auth-spinner" />
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      {tab === "login" ? "Sign In & Watch" : "Create Account"}
                    </>
                  )}
                </button>
              </form>

              {/* Quick switch note */}
              <div className="auth-footer-note">
                {tab === "login" ? (
                  <>
                    New here?{" "}
                    <a href="#" onClick={(e) => { e.preventDefault(); setTab("signup"); }}>
                      Create a free account →
                    </a>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <a href="#" onClick={(e) => { e.preventDefault(); setTab("login"); }}>
                      Sign in →
                    </a>
                  </>
                )}
              </div>

              <div className="auth-legal">
                By continuing you agree to our{" "}
                <a href="#">Terms of Service</a> &amp; <a href="#">Privacy Policy</a>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}