"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePWAInstall } from "@/hooks/Usepwainstall";

const PLATFORMS = [
  {
    name: "Android",
    sub: "Chrome Browser",
    steps: ["Open site in Chrome", 'Tap ⋮  →  "Add to Home Screen"', "Tap Add — you're in"],
    icon: (
      <svg viewBox="0 0 40 40" fill="currentColor" width="28" height="28">
        <path d="M5.8 29.9c0 .9.7 1.6 1.6 1.6H9v5.7a2.5 2.5 0 005 0v-5.7h5v5.7a2.5 2.5 0 005 0v-5.7h1.6c.9 0 1.6-.7 1.6-1.6V14H5.8v15.9zm26.4-22.8 2.1-3.7a.4.4 0 10-.7-.4l-2.2 3.8A21.3 21.3 0 0020 4.7c-3.9 0-7.5 1.1-10.4 3l-2.1-3.7a.4.4 0 10-.7.4l2.1 3.7A20.6 20.6 0 004.7 18h30.6A20.6 20.6 0 0032.2 7.1zM14 15.5a1.6 1.6 0 110-3.2 1.6 1.6 0 010 3.2zm12 0a1.6 1.6 0 110-3.2 1.6 1.6 0 010 3.2z"/>
      </svg>
    ),
    color: "#3ddc84",
    popular: true,
    platform: "android" as const,
  },
  {
    name: "iPhone",
    sub: "Safari Browser",
    steps: ["Open site in Safari", "Tap Share ↑", '"Add to Home Screen" → Add'],
    icon: (
      <svg viewBox="0 0 40 40" fill="currentColor" width="28" height="28">
        <path d="M29.4 21c0-4.2 3.5-6.2 3.7-6.3-2-3-5.1-3.4-6.2-3.4-2.6-.3-5.1 1.5-6.4 1.5-1.3 0-3.3-1.5-5.5-1.4-2.8 0-5.4 1.6-6.8 4.1-3 5.1-1.8 12.7 1.1 16.8 1.5 2.1 3.2 4.5 5.5 4.4 2.2-.1 3-1.4 5.7-1.4 2.7 0 3.4 1.4 5.7 1.4 2.4-.1 3.9-2.2 5.4-4.3 1.7-2.5 2.4-4.9 2.4-5-.1 0-4.6-1.8-4.6-5.9zm-4.3-11c1.2-1.5 2-3.6 1.8-5.7-1.7.1-3.9 1.2-5.1 2.7-1.1 1.3-2.1 3.4-1.8 5.4 1.9.1 3.9-1 5.1-2.4z"/>
      </svg>
    ),
    color: "#b0b8c8",
    popular: false,
    platform: "ios" as const,
  },
  {
    name: "Desktop",
    sub: "Chrome / Edge",
    steps: ["Open in Chrome or Edge", "Click ⊕ in the address bar", "Click Install — done"],
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
        <rect x="3" y="5" width="34" height="22" rx="2"/>
        <path d="M13 27v6M7 33h26M20 16a5 5 0 100-10 5 5 0 000 10z"/>
      </svg>
    ),
    color: "#4285f4",
    popular: false,
    platform: "desktop" as const,
  },
  {
    name: "Smart TV",
    sub: "Built-in Browser",
    steps: ["Open TV browser", "Go to djafrocinema.com", "Bookmark or add to My Apps"],
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
        <rect x="2" y="5" width="36" height="24" rx="2"/>
        <path d="M13 29v5M8 34h24"/>
        <path d="M16 17l7-4v8l-7-4z" fill="currentColor" stroke="none"/>
      </svg>
    ),
    color: "#e50914",
    popular: false,
    platform: null, // Smart TV has no PWA prompt — manual steps only
  },
];

// ── tiny toast ───────────────────────────────────────────────────────────────
function Toast({ msg, color = "#e50914", onDone }: { msg: string; color?: string; onDone: () => void }) {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setVis(true), 30);
    const t2 = setTimeout(() => { setVis(false); setTimeout(onDone, 400); }, 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);
  return (
    <div
      style={{
        position: "fixed", bottom: 28, left: "50%", transform: `translateX(-50%) translateY(${vis ? 0 : 16}px)`,
        opacity: vis ? 1 : 0, transition: "all .38s cubic-bezier(.22,1,.36,1)",
        background: "#0d0d0d", border: "1px solid rgba(255,255,255,.1)",
        boxShadow: `0 8px 32px rgba(0,0,0,.7), 0 0 0 1px ${color}22`,
        color: "#fff", padding: "11px 22px", borderRadius: 4,
        fontSize: 12, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase" as const,
        zIndex: 99999, whiteSpace: "nowrap" as const,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <span style={{ color, marginRight: 8 }}>✓</span>{msg}
    </div>
  );
}

export default function InstallCTA() {
  const [visible, setVisible]     = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [busyIdx, setBusyIdx]     = useState<number | null>(null);
  const [toast, setToast]         = useState<{ msg: string; color: string } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const { isInstalled, deferredPrompt, triggerInstall } = usePWAInstall();

  useEffect(() => {
    const ob = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.12 }
    );
    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, []);

  // Handle clicking any install button
  const handleCardInstall = useCallback(async (
    idx: number,
    platform: typeof PLATFORMS[number]["platform"],
    color: string
  ) => {
    // Smart TV — manual only, nothing to trigger
    if (!platform) return;

    // iOS — no deferred prompt, show the steps (they're already visible in the card)
    if (platform === "ios") {
      setToast({ msg: "Follow the steps above in Safari", color });
      return;
    }

    // Already installed
    if (isInstalled) {
      setToast({ msg: "App already installed on this device", color: "#15803d" });
      return;
    }

    // Android / Desktop with a deferred prompt
    if (deferredPrompt) {
      setBusyIdx(idx);
      const outcome = await triggerInstall();
      setBusyIdx(null);
      if (outcome === "accepted") {
        setToast({ msg: "App installed successfully!", color: "#15803d" });
      }
      return;
    }

    // Fallback — no prompt available yet
    setToast({ msg: "Open this site in Chrome or Edge to install", color });
  }, [isInstalled, deferredPrompt, triggerInstall]);

  // Primary CTA button (left column)
  const handlePrimaryCTA = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isInstalled) {
      setToast({ msg: "App already installed on this device", color: "#15803d" });
      return;
    }
    if (deferredPrompt) {
      const outcome = await triggerInstall();
      if (outcome === "accepted") {
        setToast({ msg: "App installed successfully!", color: "#15803d" });
      }
      return;
    }
    // iOS or no prompt — scroll to cards for manual steps
    const el = document.getElementById("install");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [isInstalled, deferredPrompt, triggerInstall]);

  return (
    <section id="install" className="ic-section">
      {toast && <Toast msg={toast.msg} color={toast.color} onDone={() => setToast(null)} />}

      {/* Diagonal red slash */}
      <div className="ic-slash" aria-hidden />
      {/* Dot grid texture */}
      <div className="ic-dots" aria-hidden />
      {/* Ambient bottom glow */}
      <div className="ic-glow-bottom" aria-hidden />

      <div ref={ref} className="ic-wrap">

        {/* ══════════ LEFT: Editorial column ══════════ */}
        <div
          className="ic-left"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateX(-28px)",
            transition: "opacity .7s ease .1s, transform .7s cubic-bezier(.22,1,.36,1) .1s",
          }}
        >
          <div className="ic-eyebrow">
            <span className="ic-eyebrow-pip" />
            <span className="ic-eyebrow-text">Free Install · Any Device</span>
          </div>

          <h2 className="ic-headline">
            <span className="ic-hl-1">GET</span>
            <span className="ic-hl-2">THE APP</span>
            <span className="ic-hl-3">NOW</span>
          </h2>

          <p className="ic-body">
            No App Store. No Play Store. No monthly fees.
            Install directly to any device and start watching{" "}
            <em className="ic-em">East Africa's biggest movie library</em> in under 60 seconds.
          </p>

          {/* Stats */}
          <div className="ic-stats">
            {[
              { v: "1,200+", l: "Active users"   },
              { v: "0 KSh",  l: "Install cost"   },
              { v: "500+",   l: "Movies ready"   },
            ].map((s, i) => (
              <div key={i} className="ic-stat">
                <div className="ic-stat-v">{s.v}</div>
                <div className="ic-stat-l">{s.l}</div>
              </div>
            ))}
          </div>

          {/* Primary CTA */}
          <a
            href="#"
            onClick={handlePrimaryCTA}
            className="ic-cta"
            style={isInstalled ? {
              background: "linear-gradient(135deg, #15803d 0%, #166534 100%)",
              boxShadow: "0 0 30px rgba(21,128,61,.32), 0 4px 18px rgba(0,0,0,.5)",
            } : undefined}
          >
            <span className="ic-cta-circle">
              {isInstalled ? (
                <svg viewBox="0 0 16 16" fill="currentColor" width="13" height="13">
                  <path d="M13.854 3.646a.5.5 0 010 .708l-7 7a.5.5 0 01-.708 0l-3.5-3.5a.5.5 0 11.708-.708L6.5 10.293l6.646-6.647a.5.5 0 01.708 0z"/>
                </svg>
              ) : (
                <svg viewBox="0 0 16 16" fill="currentColor" width="13" height="13">
                  <path d="M8 1a1 1 0 011 1v7.586l1.793-1.793a1 1 0 111.414 1.414l-3.5 3.5a1 1 0 01-1.414 0l-3.5-3.5a1 1 0 111.414-1.414L7 9.586V2a1 1 0 011-1z"/>
                </svg>
              )}
            </span>
            {isInstalled ? "App Already Installed ✓" : "Install DjAfro Cinema"}
            {!isInstalled && <span className="ic-cta-shimmer" aria-hidden />}
          </a>

          {/* Trust row */}
          <div className="ic-trust">
            {["Works Offline", "No Login Required", "Free Movies Included"].map((t, i) => (
              <span key={i} className="ic-trust-item">
                <span className="ic-trust-pip" />
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* ══════════ RIGHT: All 4 platform cards ══════════ */}
        <div className="ic-right">
          <div className="ic-right-label">Choose your device</div>

          <div className="ic-cards">
            {PLATFORMS.map((p, i) => {
              const isHovered = hoveredIdx === i;
              const isBusy    = busyIdx === i;
              // Show green state only for non-iOS non-TV cards when installed
              const cardInstalled = isInstalled && p.platform !== "ios" && p.platform !== null;
              return (
                <div
                  key={p.name}
                  className={`ic-card ${isHovered ? "ic-card-hov" : ""}`}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  style={{
                    "--c": p.color,
                    opacity: visible ? 1 : 0,
                    transform: visible ? "none" : "translateY(24px)",
                    transition: `opacity .55s ease ${i * 90 + 300}ms, transform .55s cubic-bezier(.22,1,.36,1) ${i * 90 + 300}ms`,
                  } as React.CSSProperties}
                >
                  {/* Left accent bar */}
                  <div className="ic-card-bar" />

                  {/* Icon + name row */}
                  <div className="ic-card-head">
                    <span className="ic-card-icon" style={{ color: p.color }}>{p.icon}</span>
                    <div>
                      <div className="ic-card-name">{p.name}</div>
                      <div className="ic-card-sub">{p.sub}</div>
                    </div>
                    {p.popular && <span className="ic-card-pop">Popular</span>}
                  </div>

                  {/* Steps */}
                  <ol className="ic-steps">
                    {p.steps.map((s, j) => (
                      <li key={j} className="ic-step">
                        <span className="ic-step-n" style={{ color: p.color, borderColor: `${p.color}30`, background: `${p.color}12` }}>{j + 1}</span>
                        <span className="ic-step-t">{s}</span>
                      </li>
                    ))}
                  </ol>

                  {/* Install button */}
                  <button
                    className="ic-install-btn"
                    disabled={isBusy}
                    onClick={() => handleCardInstall(i, p.platform, p.color)}
                    style={{
                      color: cardInstalled
                        ? "#fff"
                        : isHovered ? "#fff" : p.color,
                      background: cardInstalled
                        ? "linear-gradient(135deg, #15803d 0%, #166534 100%)"
                        : isHovered ? p.color : "transparent",
                      borderColor: cardInstalled
                        ? "#15803d"
                        : `${p.color}40`,
                      boxShadow: cardInstalled
                        ? "0 0 22px rgba(21,128,61,.44)"
                        : isHovered ? `0 0 22px ${p.color}44` : "none",
                      opacity: isBusy ? 0.75 : 1,
                    }}
                  >
                    {isBusy
                      ? "Installing…"
                      : cardInstalled
                      ? `Installed ✓`
                      : `Install on ${p.name}`}
                    {/* shimmer ribbon on installable cards */}
                    {!cardInstalled && !isBusy && isHovered && p.platform !== "ios" && p.platform !== null && (
                      <span
                        aria-hidden
                        style={{
                          position: "absolute", inset: 0,
                          background: "linear-gradient(108deg,transparent 30%,rgba(255,255,255,.18) 50%,transparent 70%)",
                          pointerEvents: "none",
                        }}
                      />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Compat strip */}
          <div className="ic-compat">
            <span className="ic-compat-label">Compatible with</span>
            {["Android 8+", "iOS 14+", "Chrome 80+", "Edge 80+", "Any Smart TV"].map((d) => (
              <span key={d} className="ic-chip">{d}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════ STYLES ══════════ */}
      <style>{`

        .ic-section {
          position: relative;
          background: #060606;
          padding: 104px 0 112px;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
        }

        .ic-slash {
          position: absolute;
          top: -30%; left: -8%;
          width: 52%; height: 180%;
          background: linear-gradient(108deg, rgba(229,9,20,.055) 0%, rgba(229,9,20,.02) 45%, transparent 68%);
          transform: skewX(-7deg);
          pointer-events: none;
        }

        .ic-dots {
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,.022) 1px, transparent 1px);
          background-size: 30px 30px;
          pointer-events: none;
        }

        .ic-glow-bottom {
          position: absolute;
          bottom: -60px; left: 50%; transform: translateX(-50%);
          width: 700px; height: 180px;
          background: #e50914;
          border-radius: 50%;
          filter: blur(80px);
          opacity: .038;
          pointer-events: none;
        }

        .ic-wrap {
          position: relative; z-index: 2;
          max-width: 1280px; margin: 0 auto; padding: 0 48px;
          display: grid;
          grid-template-columns: 420px 1fr;
          gap: 88px;
          align-items: start;
        }
        @media (max-width: 960px) {
          .ic-wrap { grid-template-columns: 1fr; gap: 52px; padding: 0 28px; }
        }

        /* ─── LEFT ─── */
        .ic-eyebrow { display:flex; align-items:center; gap:9px; margin-bottom:22px; }
        .ic-eyebrow-pip {
          width:6px; height:6px; border-radius:50%; background:#e50914; flex-shrink:0;
          box-shadow: 0 0 10px rgba(229,9,20,.7);
        }
        .ic-eyebrow-text {
          font-size:9px; letter-spacing:.5em; text-transform:uppercase;
          color:#e50914; font-weight:600;
        }

        .ic-headline {
          display:flex; flex-direction:column; margin:0 0 26px;
          font-family:'Bebas Neue',sans-serif; line-height:.88;
        }
        .ic-hl-1 {
          font-size: clamp(2.8rem,5.5vw,4.8rem);
          color: rgba(255,255,255,.7); letter-spacing:.1em;
        }
        .ic-hl-2 {
          font-size: clamp(4.2rem,9vw,8.5rem);
          color:#fff; letter-spacing:.04em;
        }
        .ic-hl-3 {
          font-size: clamp(2.8rem,5.5vw,4.8rem);
          color:#e50914; letter-spacing:.18em;
        }

        .ic-body {
          font-size:14px; color:rgba(255,255,255,.38);
          line-height:1.8; max-width:380px; margin-bottom:36px;
        }
        .ic-em { font-style:normal; color:rgba(255,255,255,.7); font-weight:500; }

        .ic-stats {
          display:flex; margin-bottom:36px;
          border:1px solid rgba(255,255,255,.055); border-radius:5px; overflow:hidden;
          background:rgba(255,255,255,.018);
        }
        .ic-stat { flex:1; padding:16px 0; text-align:center; border-right:1px solid rgba(255,255,255,.045); }
        .ic-stat:last-child { border-right:none; }
        .ic-stat-v {
          font-family:'Bebas Neue',sans-serif; font-size:1.75rem;
          color:#fff; letter-spacing:.05em; line-height:1; margin-bottom:4px;
        }
        .ic-stat-l {
          font-size:8.5px; letter-spacing:.32em; text-transform:uppercase;
          color:rgba(255,255,255,.26);
        }

        .ic-cta {
          position:relative; overflow:hidden;
          display:inline-flex; align-items:center; gap:14px;
          padding:15px 34px; border-radius:3px; text-decoration:none;
          background:#e50914; color:#fff;
          font-size:10.5px; font-weight:700; letter-spacing:.28em; text-transform:uppercase;
          font-family:'DM Sans',sans-serif;
          box-shadow:0 0 30px rgba(229,9,20,.32), 0 4px 18px rgba(0,0,0,.5);
          transition:box-shadow .25s, transform .15s;
          margin-bottom:22px;
        }
        .ic-cta:hover { box-shadow:0 0 50px rgba(229,9,20,.58), 0 8px 26px rgba(0,0,0,.6); transform:translateY(-2px); }
        .ic-cta:active { transform:scale(.97); }
        .ic-cta-circle {
          display:flex; align-items:center; justify-content:center;
          width:26px; height:26px; border-radius:50%;
          background:rgba(255,255,255,.16); flex-shrink:0;
        }
        .ic-cta-shimmer {
          position:absolute; inset:0;
          background:linear-gradient(108deg,transparent 30%,rgba(255,255,255,.18) 50%,transparent 70%);
          transform:translateX(-120%); transition:transform .58s ease; pointer-events:none;
        }
        .ic-cta:hover .ic-cta-shimmer { transform:translateX(120%); }

        .ic-trust { display:flex; flex-wrap:wrap; gap:14px; }
        .ic-trust-item {
          display:flex; align-items:center; gap:7px;
          font-size:9.5px; letter-spacing:.18em; text-transform:uppercase;
          color:rgba(255,255,255,.28); font-weight:500;
        }
        .ic-trust-pip {
          width:4px; height:4px; border-radius:50%;
          background:rgba(229,9,20,.55); flex-shrink:0;
        }

        /* ─── RIGHT ─── */
        .ic-right-label {
          font-size:9px; letter-spacing:.46em; text-transform:uppercase;
          color:rgba(255,255,255,.2); margin-bottom:14px; font-weight:500;
        }

        .ic-cards {
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:2px;
          background:rgba(255,255,255,.035);
          border-radius:6px;
          overflow:hidden;
          margin-bottom:14px;
        }
        @media (max-width:540px) { .ic-cards { grid-template-columns:1fr; } }

        .ic-card {
          position:relative;
          background:#0d0d0d;
          padding:26px 24px 22px;
          overflow:hidden;
          transition:background .25s;
          cursor:default;
        }
        .ic-card-hov { background:#111; }

        .ic-card-bar {
          position:absolute; top:0; left:0; bottom:0;
          width:2px;
          background:var(--c,#e50914);
          transform:scaleY(0); transform-origin:top;
          transition:transform .38s cubic-bezier(.22,1,.36,1);
          box-shadow:2px 0 12px var(--c,#e50914);
        }
        .ic-card-hov .ic-card-bar { transform:scaleY(1); }

        .ic-card-head {
          display:flex; align-items:center; gap:12px; margin-bottom:18px;
        }
        .ic-card-icon {
          display:flex; align-items:center; justify-content:center;
          width:44px; height:44px; border-radius:10px;
          background:rgba(255,255,255,.04);
          flex-shrink:0;
          transition:transform .3s;
        }
        .ic-card-hov .ic-card-icon { transform:scale(1.08); }

        .ic-card-name {
          font-family:'Bebas Neue',sans-serif;
          font-size:1.25rem; color:#fff; letter-spacing:.06em; line-height:1;
          margin-bottom:2px;
        }
        .ic-card-sub {
          font-size:10px; letter-spacing:.2em; text-transform:uppercase;
          color:rgba(255,255,255,.25);
        }
        .ic-card-pop {
          margin-left:auto; flex-shrink:0;
          font-size:7.5px; letter-spacing:.18em; text-transform:uppercase;
          font-weight:700; color:#fff;
          background:#e50914; padding:3px 7px; border-radius:2px;
        }

        .ic-steps { list-style:none; margin:0 0 20px; padding:0; display:flex; flex-direction:column; gap:9px; }
        .ic-step  { display:flex; align-items:center; gap:10px; }
        .ic-step-n {
          width:20px; height:20px; border-radius:50%; border:1px solid;
          display:flex; align-items:center; justify-content:center;
          font-size:9px; font-weight:700; flex-shrink:0;
        }
        .ic-step-t { font-size:12.5px; color:rgba(255,255,255,.48); line-height:1.4; }
        .ic-card-hov .ic-step-t { color:rgba(255,255,255,.65); }

        .ic-install-btn {
          position: relative;
          width:100%; padding:11px 0; border-radius:3px;
          font-family:'DM Sans',sans-serif;
          font-size:9.5px; font-weight:700; letter-spacing:.22em; text-transform:uppercase;
          border:1px solid; cursor:pointer;
          transition:background .2s, color .2s, box-shadow .2s, transform .14s;
          overflow: hidden;
        }
        .ic-install-btn:hover { filter:brightness(1.08); }
        .ic-install-btn:active { transform:scale(.97); }
        .ic-install-btn:disabled { cursor: not-allowed; }

        .ic-compat { display:flex; flex-wrap:wrap; align-items:center; gap:8px; }
        .ic-compat-label {
          font-size:9px; letter-spacing:.3em; text-transform:uppercase;
          color:rgba(255,255,255,.18); white-space:nowrap;
        }
        .ic-chip {
          font-size:9px; letter-spacing:.14em; text-transform:uppercase;
          color:rgba(255,255,255,.28); border:1px solid rgba(255,255,255,.07);
          padding:3px 9px; border-radius:2px; background:rgba(255,255,255,.02);
        }
      `}</style>
    </section>
  );
}