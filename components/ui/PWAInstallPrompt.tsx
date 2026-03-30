"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Platform = "android" | "ios" | "desktop" | null;

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) return "ios";
  if (/android/i.test(ua)) return "android";
  return "desktop";
}

const DISMISSED_KEY = "pwa-prompt-dismissed";
const INSTALLED_KEY  = "pwa-installed";
const DISMISS_COOLDOWN_MS = 1 * 60 * 1000; // 1 minute

// ── SVG Icons ──────────────────────────────────────────────────────────────
const IconBolt = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const IconStar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconDownload = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const IconClose = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconShare = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);
const IconPlus = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconCheck = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ── Main Component ─────────────────────────────────────────────────────────
export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform]   = useState<Platform>(null);
  const [show, setShow]           = useState(false);
  const [visible, setVisible]     = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled]   = useState(false);
  const lottieRef      = useRef<HTMLDivElement>(null);
  const lottieInstance = useRef<any>(null);

  // Load Lottie dynamically – zero SSR issues on Vercel
  useEffect(() => {
    if (!show || !lottieRef.current) return;
    import("lottie-web").then((lottie) => {
      if (!lottieRef.current) return;
      lottieInstance.current?.destroy();
      lottieInstance.current = lottie.default.loadAnimation({
        container: lottieRef.current!,
        renderer:  "svg",
        loop:      true,
        autoplay:  true,
        path:      "/animations/install.json",
      });
    });
    return () => { lottieInstance.current?.destroy(); lottieInstance.current = null; };
  }, [show]);

  // Spring-in animation after show becomes true
  useEffect(() => {
    if (show) {
      const t = setTimeout(() => setVisible(true), 60);
      return () => clearTimeout(t);
    }
    setVisible(false);
  }, [show]);

  // Gate logic: standalone check, installed flag, dismiss cooldown (1 min)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(display-mode: standalone)").matches) return; // already PWA
    if (localStorage.getItem(INSTALLED_KEY)) return;                     // user installed

    const detected = detectPlatform();
    setPlatform(detected);

    const dismissed = localStorage.getItem(DISMISSED_KEY);
    const inCooldown = dismissed && Date.now() - Number(dismissed) < DISMISS_COOLDOWN_MS;

    if (detected === "ios") {
      if (!inCooldown) {
        setTimeout(() => setShow(true), 4000);
      } else {
        const remaining = DISMISS_COOLDOWN_MS - (Date.now() - Number(dismissed!));
        const t = setTimeout(() => setShow(true), remaining + 4000);
        return () => clearTimeout(t);
      }
      return;
    }

    // Android / Desktop: ALWAYS capture the event, show only when cooldown passed
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!inCooldown) {
        setTimeout(() => setShow(true), 4000);
      } else {
        const remaining = DISMISS_COOLDOWN_MS - (Date.now() - Number(dismissed!));
        setTimeout(() => setShow(true), remaining + 4000);
      }
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => {
      setShow(false);
      localStorage.setItem(DISMISSED_KEY, String(Date.now()));
      // Re-show after cooldown in this session
      setTimeout(() => {
        if (!localStorage.getItem(INSTALLED_KEY) &&
            !window.matchMedia("(display-mode: standalone)").matches) {
          setShow(true);
        }
      }, DISMISS_COOLDOWN_MS);
    }, 480);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
      localStorage.setItem(INSTALLED_KEY, "1");
      setTimeout(() => { setVisible(false); setTimeout(() => setShow(false), 480); }, 2200);
    } else {
      setInstalling(false);
    }
  };

  if (!show) return null;

  return (
    <>
      {/* ── Styles ─────────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');

        /* Wrapper — mobile: bottom sheet; desktop: bottom-right card */
        .pci-wrap {
          position: fixed;
          z-index: 9200;
          bottom: 0; left: 0; right: 0;
          padding: 0 8px 10px;
          transform: translateY(calc(100% + 12px));
          opacity: 0;
          transition:
            transform 0.52s cubic-bezier(0.34, 1.44, 0.64, 1),
            opacity   0.32s ease;
          pointer-events: none;
        }
        @media (min-width: 600px) {
          .pci-wrap {
            bottom: 28px; right: 28px;
            left: auto; padding: 0;
            width: 390px;
            transform: translateY(28px);
          }
        }
        .pci-wrap.in {
          transform: translateY(0);
          opacity: 1;
          pointer-events: auto;
        }

        /* Card */
        .pci-card {
          background: #0b0b0b;
          border-radius: 5px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.07);
          box-shadow:
            0 28px 70px rgba(0,0,0,0.88),
            0 0 0 1px rgba(229,9,20,0.09),
            inset 0 1px 0 rgba(255,255,255,0.05);
          font-family: 'DM Sans', sans-serif;
          position: relative;
        }

        /* Top ribbon stripe */
        .pci-ribbon-top {
          height: 3px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(229,9,20,0.5) 18%,
            #e50914 50%,
            rgba(229,9,20,0.5) 82%,
            transparent 100%
          );
        }

        /* Corner ribbon */
        .pci-corner {
          position: absolute;
          top: 3px; right: 0;
          width: 0; height: 0;
          border-style: solid;
          border-width: 0 58px 58px 0;
          border-color: transparent #e50914 transparent transparent;
          z-index: 10;
        }
        .pci-corner span {
          position: absolute;
          top: 9px; right: -51px;
          font-family: 'DM Sans', sans-serif;
          font-size: 7.5px;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          transform: rotate(45deg);
        }

        /* ── Hero ── */
        .pci-hero {
          position: relative;
          height: 150px;
          background: #070707;
          overflow: hidden;
        }
        @media (min-width: 600px) { .pci-hero { height: 215px; } }

        /* red glow */
        .pci-hero::before {
          content: '';
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 85% 50% at 50% 115%, rgba(229,9,20,0.3) 0%, transparent 65%),
            radial-gradient(ellipse 45% 35% at 10% -5%,  rgba(160,0,40,0.08) 0%, transparent 55%);
          z-index: 1;
        }
        /* scanline texture */
        .pci-hero::after {
          content: '';
          position: absolute; inset: 0;
          background: repeating-linear-gradient(
            0deg, transparent, transparent 3px,
            rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px
          );
          z-index: 2;
          pointer-events: none;
        }

        /* fade into body */
        .pci-vignette {
          position: absolute; inset: 0; z-index: 3;
          background: linear-gradient(180deg, transparent 35%, rgba(11,11,11,0.82) 100%);
        }

        /* Lottie */
        .pci-lottie-wrap {
          position: absolute; inset: 0; z-index: 4;
          display: flex; align-items: center; justify-content: center;
        }
        .pci-lottie {
          width: 160px; height: 160px;
          filter:
            drop-shadow(0 0 32px rgba(229,9,20,0.5))
            drop-shadow(0 0 10px rgba(229,9,20,0.2));
        }
        @media (min-width: 600px) { .pci-lottie { width: 225px; height: 225px; } }

        /* Close btn — top-left for visibility, larger tap target on mobile */
        .pci-close {
          position: absolute; top: 10px; left: 10px; z-index: 6;
          width: 34px; height: 34px;
          border-radius: 4px;
          background: rgba(0,0,0,0.72);
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.6);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: background 0.16s, color 0.16s, border-color 0.16s;
          backdrop-filter: blur(6px);
        }
        .pci-close:hover {
          background: rgba(229,9,20,0.25);
          color: #fff;
          border-color: rgba(229,9,20,0.45);
        }

        /* ── Body ── */
        .pci-body { padding: 12px 14px 14px; }
        @media (min-width: 600px) { .pci-body { padding: 16px 16px 18px; } }

        /* Logo row */
        .pci-logorow {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 10px;
        }
        @media (min-width: 600px) { .pci-logorow { margin-bottom: 13px; } }

        .pci-logo-img {
          position: relative;
          flex-shrink: 0;
          height: 32px; width: 110px;
        }
        @media (min-width: 600px) { .pci-logo-img { height: 36px; width: 124px; } }

        .pci-tagline {
          font-size: 10.5px;
          color: rgba(255,255,255,0.36);
          font-style: italic;
          line-height: 1.5;
          letter-spacing: 0.005em;
        }
        @media (min-width: 600px) { .pci-tagline { font-size: 11px; } }

        /* Feature pills */
        .pci-pills {
          display: flex; gap: 6px; flex-wrap: wrap;
          margin-bottom: 11px;
        }
        @media (min-width: 600px) { .pci-pills { margin-bottom: 14px; } }

        .pci-pill {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 9px;
          border-radius: 3px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          font-size: 10px; font-weight: 500;
          color: rgba(255,255,255,0.55);
          letter-spacing: 0.01em;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
          user-select: none;
        }
        @media (min-width: 600px) { .pci-pill { font-size: 10.5px; padding: 5px 10px; } }
        .pci-pill:hover {
          background: rgba(229,9,20,0.08);
          border-color: rgba(229,9,20,0.25);
          color: rgba(255,255,255,0.8);
        }
        .pci-pill svg { color: #e50914; }

        /* Install button */
        .pci-btn {
          width: 100%; height: 44px;
          border-radius: 4px;
          background: linear-gradient(135deg, #e50914 0%, #c00811 100%);
          border: none; color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700; font-size: 12px;
          letter-spacing: 0.1em; text-transform: uppercase;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 9px;
          transition: transform 0.2s, box-shadow 0.2s, background 0.3s;
          box-shadow: 0 4px 22px rgba(229,9,20,0.38), inset 0 1px 0 rgba(255,255,255,0.14);
          position: relative; overflow: hidden;
        }
        @media (min-width: 600px) { .pci-btn { height: 48px; font-size: 12.5px; } }
        .pci-btn::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 55%);
          opacity: 0; transition: opacity 0.18s;
        }
        .pci-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 32px rgba(229,9,20,0.52), inset 0 1px 0 rgba(255,255,255,0.14); }
        .pci-btn:hover::after { opacity: 1; }
        .pci-btn:active { transform: scale(0.984); }
        .pci-btn.busy { pointer-events: none; opacity: 0.78; }
        .pci-btn.done {
          background: linear-gradient(135deg, #15803d 0%, #166534 100%);
          box-shadow: 0 4px 22px rgba(22,163,74,0.4);
          pointer-events: none;
        }

        /* sheen sweep */
        .pci-sheen {
          position: absolute; top: 0; left: -100%; width: 55%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.13), transparent);
          animation: pci-sheen 2.8s ease 1s infinite;
        }
        @keyframes pci-sheen { 0% { left:-80%; } 42% { left:130%; } 100% { left:130%; } }

        .pci-spinner {
          width: 17px; height: 17px;
          border: 2px solid rgba(255,255,255,0.28);
          border-top-color: #fff;
          border-radius: 50%;
          animation: pci-spin 0.65s linear infinite;
        }
        @keyframes pci-spin { to { transform: rotate(360deg); } }

        /* iOS steps */
        .pci-divider { display:flex; align-items:center; gap:9px; margin-bottom:9px; }
        @media (min-width: 600px) { .pci-divider { margin-bottom: 11px; } }
        .pci-divider-line { flex:1; height:1px; background:rgba(255,255,255,0.06); }
        .pci-divider-label {
          font-size: 9px; color: rgba(255,255,255,0.2);
          letter-spacing: 0.1em; text-transform: uppercase;
        }

        .pci-steps { display:flex; flex-direction:column; gap:8px; }
        @media (min-width: 600px) { .pci-steps { gap: 9px; } }
        .pci-step  { display:flex; align-items:center; gap:10px; }
        .pci-step-num {
          width:22px; height:22px; border-radius:3px; flex-shrink:0;
          background: rgba(229,9,20,0.12);
          border: 1px solid rgba(229,9,20,0.22);
          color: #e50914; font-size:10px; font-weight:700;
          display:flex; align-items:center; justify-content:center;
        }
        .pci-step-text { font-size:11px; color:rgba(255,255,255,0.52); line-height:1.45; }
        @media (min-width: 600px) { .pci-step-text { font-size: 11.5px; } }
        .pci-step-text strong { color:rgba(255,255,255,0.86); font-weight:600; }
        .pci-step-icon {
          display:inline-flex; align-items:center; vertical-align:-2px;
          color:rgba(255,255,255,0.52); margin:0 2px;
        }

        /* Bottom ribbon */
        .pci-ribbon-bot {
          height: 2px;
          background: linear-gradient(90deg,
            transparent,
            rgba(229,9,20,0.22) 28%,
            rgba(229,9,20,0.48) 50%,
            rgba(229,9,20,0.22) 72%,
            transparent
          );
        }
      `}</style>

      {/* ── Modal — no forced overlay, user can still interact with page ── */}
      <div
        className={`pci-wrap${visible ? " in" : ""}`}
        role="dialog"
        aria-label="Install DjAfro Cinema app"
      >
        <div className="pci-card">

          {/* Top ribbon */}
          <div className="pci-ribbon-top" />

          {/* Corner badge */}
          <div className="pci-corner"><span>Free</span></div>

          {/* Hero with Lottie */}
          <div className="pci-hero">
            <div className="pci-vignette" />
            <div className="pci-lottie-wrap">
              <div ref={lottieRef} className="pci-lottie" />
            </div>
            {/* Close button — top-left, clearly visible */}
            <button className="pci-close" onClick={handleDismiss} aria-label="Dismiss">
              <IconClose />
            </button>
          </div>

          {/* Body */}
          <div className="pci-body">

            {/* Logo + tagline */}
            <div className="pci-logorow">
              <div className="pci-logo-img">
                <Image
                  src="/logo.png"
                  alt="DjAfro Cinema"
                  fill
                  className="object-contain object-left"
                  style={{
                    filter:
                      "drop-shadow(0 0 10px rgba(229,9,20,0.55)) drop-shadow(0 0 22px rgba(229,9,20,0.22))",
                  }}
                />
              </div>
              <p className="pci-tagline">
                Your cinematic streaming<br />experience on your home screen
              </p>
            </div>

            {/* Pills */}
            <div className="pci-pills">
              <span className="pci-pill"><IconBolt />Instant Load</span>
              <span className="pci-pill"><IconStar />Works Offline</span>
            </div>

            {/* Android / Desktop install button */}
            {(platform === "android" || platform === "desktop") && deferredPrompt && (
              <button
                onClick={handleInstall}
                className={`pci-btn${installing ? " busy" : ""}${installed ? " done" : ""}`}
              >
                {!installing && !installed && <span className="pci-sheen" />}
                {installed   ? <><IconCheck />  Installed — Enjoy!</>       :
                 installing  ? <><span className="pci-spinner" /> Installing…</> :
                               <><IconDownload /> Install App — It&apos;s Free</>}
              </button>
            )}

            {/* iOS steps */}
            {platform === "ios" && (
              <>
                <div className="pci-divider">
                  <div className="pci-divider-line" />
                  <span className="pci-divider-label">How to install on iOS</span>
                  <div className="pci-divider-line" />
                </div>
                <div className="pci-steps">
                  <div className="pci-step">
                    <div className="pci-step-num">1</div>
                    <div className="pci-step-text">
                      Tap the <span className="pci-step-icon"><IconShare /></span>{" "}
                      <strong>Share</strong> button at the bottom of Safari
                    </div>
                  </div>
                  <div className="pci-step">
                    <div className="pci-step-num">2</div>
                    <div className="pci-step-text">
                      Scroll and tap <span className="pci-step-icon"><IconPlus /></span>{" "}
                      <strong>Add to Home Screen</strong>
                    </div>
                  </div>
                  <div className="pci-step">
                    <div className="pci-step-num">3</div>
                    <div className="pci-step-text">
                      Tap <strong>Add</strong> — enjoy the full cinematic experience
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Bottom ribbon */}
          <div className="pci-ribbon-bot" />
        </div>
      </div>
    </>
  );
}