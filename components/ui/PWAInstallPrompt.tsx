"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePWAInstall, INSTALLED_KEY } from "@/hooks/Usepwainstall";

// ── Storage keys ────────────────────────────────────────────────────────────
const STORAGE_KEY_COUNT     = "pwa_prompt_show_count";   // number of times shown today
const STORAGE_KEY_LAST_SHOW = "pwa_prompt_last_show";    // timestamp of last show
const STORAGE_KEY_DATE      = "pwa_prompt_date";         // YYYY-MM-DD of current day

// ── Timing config ────────────────────────────────────────────────────────────
const INITIAL_DELAY_MS  = 2 * 60 * 1000;        // 2 min after page load before first show
const COOLDOWN_MS       = 3 * 60 * 60 * 1000;   // 3 hr cooldown between shows (5 shows spread across ~12hr day)
const MAX_SHOWS_PER_DAY = 5;

type Platform = "android" | "ios" | "desktop" | null;

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) return "ios";
  if (/android/i.test(ua)) return "android";
  return "desktop";
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

/** Returns { count, lastShow } for today, resetting if it's a new day. */
function getTodayStats(): { count: number; lastShow: number | null } {
  const storedDate = localStorage.getItem(STORAGE_KEY_DATE);
  const today = todayStr();
  if (storedDate !== today) {
    // New day — reset
    localStorage.setItem(STORAGE_KEY_DATE, today);
    localStorage.setItem(STORAGE_KEY_COUNT, "0");
    localStorage.removeItem(STORAGE_KEY_LAST_SHOW);
  }
  const count    = parseInt(localStorage.getItem(STORAGE_KEY_COUNT) || "0", 10);
  const lastShow = localStorage.getItem(STORAGE_KEY_LAST_SHOW)
    ? Number(localStorage.getItem(STORAGE_KEY_LAST_SHOW))
    : null;
  return { count, lastShow };
}

function recordShow() {
  const { count } = getTodayStats();
  localStorage.setItem(STORAGE_KEY_COUNT, String(count + 1));
  localStorage.setItem(STORAGE_KEY_LAST_SHOW, String(Date.now()));
  localStorage.setItem(STORAGE_KEY_DATE, todayStr());
}

// ── SVG Icons ────────────────────────────────────────────────────────────────
const IconBolt = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const IconStar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconDownload = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const IconClose = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconShare = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);
const IconPlus = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconCheck = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ── Main Component ───────────────────────────────────────────────────────────
export default function PWAInstallPrompt() {
  const [platform, setPlatform]     = useState<Platform>(null);
  const [show, setShow]             = useState(false);
  const [visible, setVisible]       = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled]   = useState(false);
  const lottieRef      = useRef<HTMLDivElement>(null);
  const lottieInstance = useRef<any>(null);

  const { deferredPrompt, isInstalled: alreadyInstalled, triggerInstall } = usePWAInstall();

  // ── Lottie ─────────────────────────────────────────────────────────────────
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

  // ── Slide-in animation ─────────────────────────────────────────────────────
  useEffect(() => {
    if (show) {
      const t = setTimeout(() => setVisible(true), 60);
      return () => clearTimeout(t);
    }
    setVisible(false);
  }, [show]);

  // ── Core: decide whether / when to show ────────────────────────────────────
  /**
   * Returns the delay (ms) until the next show, or null if we should not show.
   * "Now" means delay=0 isn't quite right — we still honour the initial 5-min
   * page-load delay, which is handled by the caller.
   */
  function getShowDelay(): number | null {
    if (typeof window === "undefined") return null;
    if (window.matchMedia("(display-mode: standalone)").matches) return null;
    if (localStorage.getItem(INSTALLED_KEY)) return null;

    const { count, lastShow } = getTodayStats();
    if (count >= MAX_SHOWS_PER_DAY) return null;

    if (lastShow === null) {
      // Never shown today — use initial delay from page-load (handled in caller)
      return 0;
    }

    const elapsed   = Date.now() - lastShow;
    const remaining = COOLDOWN_MS - elapsed;
    return remaining > 0 ? remaining : 0;
  }

  // Schedules a single show, then after it's dismissed, schedules the next.
  function scheduleShow(additionalDelay: number) {
    const delay = additionalDelay;
    const timer = setTimeout(() => {
      if (localStorage.getItem(INSTALLED_KEY)) return;
      if (window.matchMedia("(display-mode: standalone)").matches) return;

      const { count } = getTodayStats();
      if (count >= MAX_SHOWS_PER_DAY) return;

      recordShow();
      setShow(true);
    }, delay);
    return timer;
  }

  // ── Initial gate (iOS — no deferred prompt needed) ─────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    const detected = detectPlatform();
    setPlatform(detected);

    if (detected !== "ios") return; // Android/Desktop handled in the next effect

    const cooldownDelay = getShowDelay();
    if (cooldownDelay === null) return;

    // First show: wait for initial page-load delay; subsequent: cooldown
    const { lastShow } = getTodayStats();
    const delay = lastShow === null ? INITIAL_DELAY_MS : cooldownDelay;

    const timer = scheduleShow(delay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Android / Desktop: wait for deferred prompt ────────────────────────────
  useEffect(() => {
    if (!deferredPrompt) return;
    if (alreadyInstalled) return;
    if (!platform || platform === "ios") return;

    const cooldownDelay = getShowDelay();
    if (cooldownDelay === null) return;

    const { lastShow } = getTodayStats();
    const delay = lastShow === null ? INITIAL_DELAY_MS : cooldownDelay;

    const timer = scheduleShow(delay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deferredPrompt, alreadyInstalled, platform]);

  // ── Hide if installed externally ───────────────────────────────────────────
  useEffect(() => {
    if (alreadyInstalled && show) {
      setVisible(false);
      setTimeout(() => setShow(false), 480);
    }
  }, [alreadyInstalled, show]);

  // ── Dismiss handler — schedule next show after cooldown ───────────────────
  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => {
      setShow(false);

      // Schedule next show after cooldown (if quota remaining)
      const nextDelay = getShowDelay();
      if (nextDelay !== null) {
        const waitMs = nextDelay === 0 ? COOLDOWN_MS : nextDelay;
        setTimeout(() => {
          if (!localStorage.getItem(INSTALLED_KEY) &&
              !window.matchMedia("(display-mode: standalone)").matches) {
            const { count } = getTodayStats();
            if (count < MAX_SHOWS_PER_DAY) {
              recordShow();
              setShow(true);
            }
          }
        }, waitMs);
      }
    }, 480);
  };

  // ── Install handler ────────────────────────────────────────────────────────
  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    const outcome = await triggerInstall();
    setInstalling(false);
    if (outcome === "accepted") {
      setInstalled(true);
      setTimeout(() => { setVisible(false); setTimeout(() => setShow(false), 480); }, 2200);
    }
  };

  if (!show) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');

        /* ── Wrapper ── */
        .pci-wrap {
          position: fixed;
          z-index: 9200;
          bottom: 0; left: 0; right: 0;
          padding: 0 6px 8px;
          transform: translateY(calc(100% + 12px));
          opacity: 0;
          transition:
            transform 0.52s cubic-bezier(0.34, 1.44, 0.64, 1),
            opacity   0.32s ease;
          pointer-events: none;
        }
        @media (min-width: 600px) {
          .pci-wrap {
            bottom: 24px; right: 24px;
            left: auto; padding: 0;
            width: 370px;
            transform: translateY(20px);
          }
        }
        .pci-wrap.in {
          transform: translateY(0);
          opacity: 1;
          pointer-events: auto;
        }

        /* ── Card ── */
        .pci-card {
          background: #0b0b0b;
          border-radius: 5px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.07);
          box-shadow:
            0 24px 60px rgba(0,0,0,0.88),
            0 0 0 1px rgba(229,9,20,0.09),
            inset 0 1px 0 rgba(255,255,255,0.05);
          font-family: 'DM Sans', sans-serif;
          position: relative;
        }

        .pci-ribbon-top {
          height: 3px;
          background: linear-gradient(90deg,
            transparent 0%, rgba(229,9,20,0.5) 18%,
            #e50914 50%, rgba(229,9,20,0.5) 82%, transparent 100%
          );
        }

        .pci-corner {
          position: absolute; top: 3px; right: 0;
          width: 0; height: 0; border-style: solid;
          border-width: 0 52px 52px 0;
          border-color: transparent #e50914 transparent transparent;
          z-index: 10;
        }
        .pci-corner span {
          position: absolute; top: 8px; right: -46px;
          font-family: 'DM Sans', sans-serif;
          font-size: 7px; font-weight: 700;
          color: #fff; letter-spacing: 0.1em;
          text-transform: uppercase;
          transform: rotate(45deg);
        }

        /* ── Hero — SMALLER on mobile ── */
        .pci-hero {
          position: relative;
          height: 110px;          /* mobile */
          background: #070707;
          overflow: hidden;
        }
        @media (min-width: 600px) { .pci-hero { height: 200px; } }

        .pci-hero::before {
          content: '';
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 85% 50% at 50% 115%, rgba(229,9,20,0.28) 0%, transparent 65%),
            radial-gradient(ellipse 45% 35% at 10% -5%,  rgba(160,0,40,0.07) 0%, transparent 55%);
          z-index: 1;
        }
        .pci-hero::after {
          content: '';
          position: absolute; inset: 0;
          background: repeating-linear-gradient(
            0deg, transparent, transparent 3px,
            rgba(0,0,0,0.07) 3px, rgba(0,0,0,0.07) 4px
          );
          z-index: 2; pointer-events: none;
        }

        .pci-vignette {
          position: absolute; inset: 0; z-index: 3;
          background: linear-gradient(180deg, transparent 35%, rgba(11,11,11,0.8) 100%);
        }

        .pci-lottie-wrap {
          position: absolute; inset: 0; z-index: 4;
          display: flex; align-items: center; justify-content: center;
        }
        .pci-lottie {
          width: 110px; height: 110px;   /* mobile */
          filter:
            drop-shadow(0 0 28px rgba(229,9,20,0.48))
            drop-shadow(0 0 8px rgba(229,9,20,0.18));
        }
        @media (min-width: 600px) { .pci-lottie { width: 210px; height: 210px; } }

        .pci-close {
          position: absolute; top: 8px; left: 8px; z-index: 6;
          width: 30px; height: 30px;
          border-radius: 4px;
          background: rgba(0,0,0,0.7);
          border: 1px solid rgba(255,255,255,0.11);
          color: rgba(255,255,255,0.55);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: background 0.16s, color 0.16s, border-color 0.16s;
          backdrop-filter: blur(6px);
        }
        .pci-close:hover {
          background: rgba(229,9,20,0.22);
          color: #fff; border-color: rgba(229,9,20,0.42);
        }

        /* ── Body — tighter on mobile ── */
        .pci-body { padding: 9px 11px 11px; }
        @media (min-width: 600px) { .pci-body { padding: 15px 15px 17px; } }

        .pci-logorow {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 8px;
        }
        @media (min-width: 600px) { .pci-logorow { gap: 12px; margin-bottom: 12px; } }

        .pci-logo-img {
          position: relative; flex-shrink: 0;
          height: 26px; width: 90px;  /* mobile */
        }
        @media (min-width: 600px) { .pci-logo-img { height: 34px; width: 118px; } }

        .pci-tagline {
          font-size: 9.5px;            /* mobile */
          color: rgba(255,255,255,0.33);
          font-style: italic;
          line-height: 1.5;
          letter-spacing: 0.005em;
        }
        @media (min-width: 600px) { .pci-tagline { font-size: 11px; } }

        .pci-pills {
          display: flex; gap: 5px; flex-wrap: wrap;
          margin-bottom: 9px;
        }
        @media (min-width: 600px) { .pci-pills { gap: 6px; margin-bottom: 13px; } }

        .pci-pill {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 8px;           /* mobile */
          border-radius: 3px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          font-size: 9px; font-weight: 500;   /* mobile */
          color: rgba(255,255,255,0.5);
          letter-spacing: 0.01em;
          user-select: none;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
        }
        @media (min-width: 600px) { .pci-pill { font-size: 10.5px; padding: 4px 10px; } }
        .pci-pill:hover {
          background: rgba(229,9,20,0.08);
          border-color: rgba(229,9,20,0.24);
          color: rgba(255,255,255,0.78);
        }
        .pci-pill svg { color: #e50914; }

        /* ── Install button ── */
        .pci-btn {
          width: 100%; height: 38px;   /* mobile */
          border-radius: 4px;
          background: linear-gradient(135deg, #e50914 0%, #c00811 100%);
          border: none; color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700; font-size: 11px;   /* mobile */
          letter-spacing: 0.09em; text-transform: uppercase;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(229,9,20,0.36), inset 0 1px 0 rgba(255,255,255,0.13);
          position: relative; overflow: hidden;
        }
        @media (min-width: 600px) { .pci-btn { height: 46px; font-size: 12px; } }
        .pci-btn::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 55%);
          opacity: 0; transition: opacity 0.18s;
        }
        .pci-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 30px rgba(229,9,20,0.5), inset 0 1px 0 rgba(255,255,255,0.13); }
        .pci-btn:hover::after { opacity: 1; }
        .pci-btn:active { transform: scale(0.985); }
        .pci-btn.busy { pointer-events: none; opacity: 0.78; }
        .pci-btn.done {
          background: linear-gradient(135deg, #15803d 0%, #166534 100%);
          box-shadow: 0 4px 20px rgba(22,163,74,0.38);
          pointer-events: none;
        }

        .pci-sheen {
          position: absolute; top: 0; left: -100%; width: 55%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.13), transparent);
          animation: pci-sheen 2.8s ease 1s infinite;
        }
        @keyframes pci-sheen { 0% { left:-80%; } 42% { left:130%; } 100% { left:130%; } }

        .pci-spinner {
          width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,0.26);
          border-top-color: #fff;
          border-radius: 50%;
          animation: pci-spin 0.65s linear infinite;
        }
        @keyframes pci-spin { to { transform: rotate(360deg); } }

        /* ── iOS steps ── */
        .pci-divider { display:flex; align-items:center; gap:8px; margin-bottom:7px; }
        @media (min-width: 600px) { .pci-divider { margin-bottom: 10px; } }
        .pci-divider-line { flex:1; height:1px; background:rgba(255,255,255,0.06); }
        .pci-divider-label {
          font-size: 8px; color: rgba(255,255,255,0.2);
          letter-spacing: 0.1em; text-transform: uppercase;
        }

        .pci-steps { display:flex; flex-direction:column; gap:6px; }
        @media (min-width: 600px) { .pci-steps { gap: 8px; } }
        .pci-step  { display:flex; align-items:center; gap:9px; }
        .pci-step-num {
          width: 20px; height: 20px; border-radius: 3px; flex-shrink: 0;
          background: rgba(229,9,20,0.11);
          border: 1px solid rgba(229,9,20,0.21);
          color: #e50914; font-size: 9px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }
        @media (min-width: 600px) { .pci-step-num { width: 22px; height: 22px; font-size: 10px; } }
        .pci-step-text { font-size: 10px; color: rgba(255,255,255,0.5); line-height: 1.45; }
        @media (min-width: 600px) { .pci-step-text { font-size: 11.5px; } }
        .pci-step-text strong { color: rgba(255,255,255,0.84); font-weight: 600; }
        .pci-step-icon {
          display: inline-flex; align-items: center; vertical-align: -2px;
          color: rgba(255,255,255,0.5); margin: 0 2px;
        }

        .pci-ribbon-bot {
          height: 2px;
          background: linear-gradient(90deg,
            transparent, rgba(229,9,20,0.2) 28%,
            rgba(229,9,20,0.45) 50%, rgba(229,9,20,0.2) 72%, transparent
          );
        }
      `}</style>

      <div
        className={`pci-wrap${visible ? " in" : ""}`}
        role="dialog"
        aria-label="Install DjAfro Cinema app"
      >
        <div className="pci-card">

          <div className="pci-ribbon-top" />
          <div className="pci-corner"><span>Free</span></div>

          <div className="pci-hero">
            <div className="pci-vignette" />
            <div className="pci-lottie-wrap">
              <div ref={lottieRef} className="pci-lottie" />
            </div>
            <button className="pci-close" onClick={handleDismiss} aria-label="Dismiss">
              <IconClose />
            </button>
          </div>

          <div className="pci-body">

            <div className="pci-logorow">
              <div className="pci-logo-img">
                <Image
                  src="/logo.png"
                  alt="DjAfro Cinema"
                  fill
                  className="object-contain object-left"
                  style={{
                    filter: "drop-shadow(0 0 8px rgba(229,9,20,0.5)) drop-shadow(0 0 20px rgba(229,9,20,0.2))",
                  }}
                />
              </div>
              <p className="pci-tagline">
                Your cinematic streaming<br />experience on your home screen
              </p>
            </div>

            <div className="pci-pills">
              <span className="pci-pill"><IconBolt />Instant Load</span>
              <span className="pci-pill"><IconStar />Works Offline</span>
            </div>

            {(platform === "android" || platform === "desktop") && deferredPrompt && (
              <button
                onClick={handleInstall}
                className={`pci-btn${installing ? " busy" : ""}${installed ? " done" : ""}`}
              >
                {!installing && !installed && <span className="pci-sheen" />}
                {installed
                  ? <><IconCheck />  Installed — Enjoy!</>
                  : installing
                  ? <><span className="pci-spinner" /> Installing…</>
                  : <><IconDownload /> Install App — It&apos;s Free</>}
              </button>
            )}

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

          <div className="pci-ribbon-bot" />
        </div>
      </div>
    </>
  );
}