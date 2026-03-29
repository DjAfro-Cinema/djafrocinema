"use client";

// components/payment/PaymentModal.tsx
// Mount ONCE in dashboard layout via DashboardGateWrapper. Never inside cards.
// Reads all state from PremiumGateContext.
//
// Fixes applied:
//  ✅ Phone submission: prepends "0" → formatPhone gets "07XXXXXXXX" → valid
//  ✅ "Try Again" resets state to "locked" instead of reloading the page
//  ✅ Desktop: wider (540px), taller, cinematic poster strip
//  ✅ Mobile: slides up from bottom, covers exactly 3/4 of screen
//  ✅ Lottie for awaiting_pin, polling, success states
//  ✅ Removed cliché copy lines
//  ✅ canSubmit logic tightened

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X, Lock, Shield, Star, Zap, CheckCircle,
  AlertCircle, Play, Users, RefreshCw, Smartphone,
} from "lucide-react";
import { usePremiumGate } from "@/context/PremiumGateContext";

// ─────────────────────────────────────────────────────────────────────────────
// Lottie — SSR-safe dynamic import
// ─────────────────────────────────────────────────────────────────────────────

function LottiePlayer({
  url,
  loop = true,
  style,
}: {
  url: string;
  loop?: boolean;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const anim = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    let dead = false;
    import("lottie-web").then((m) => {
      if (dead || !ref.current) return;
      anim.current?.destroy();
      anim.current = m.default.loadAnimation({
        container: ref.current!,
        renderer: "svg",
        loop,
        autoplay: true,
        path: url,
      }) as unknown as { destroy: () => void };
    });
    return () => {
      dead = true;
      anim.current?.destroy();
      anim.current = null;
    };
  }, [url, loop]);

  return <div ref={ref} style={style} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Selling points (cliché-free)
// ─────────────────────────────────────────────────────────────────────────────

const SELLS = [
  { Icon: Star,     text: "Unlock once, watch forever — no expiry, no re-purchasing." },
  { Icon: Zap,      text: "One-time payment. No subscriptions, no recurring charges." },
  { Icon: Shield,   text: "100% secure M-Pesa transaction. Fully encrypted." },
  { Icon: Users,    text: "One purchase, your whole household enjoys — share freely." },
  { Icon: Smartphone, text: "Works on all your devices — phone, tablet, or laptop." },
];

// ─────────────────────────────────────────────────────────────────────────────
// Lottie JSON URLs
// ─────────────────────────────────────────────────────────────────────────────

const LOTTIE = {
  // Phone / waiting animation
  phone: "https://lottie.host/9e56e2b9-41c2-4773-b5e4-4eeda21c2eba/bKlyb2oTsp.json",
  // Success checkmark
  success: "https://lottie.host/d3e91b93-0777-467c-b071-3fe3e7b5e52c/mfknWrNYkC.json",
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function PaymentModal() {
  const { gateStatus, submitPhone, dismiss } = usePremiumGate();
  const { state, movie, error } = gateStatus;

  const [phone, setPhone]   = useState("");
  const [dots, setDots]     = useState(".");
  const [ready, setReady]   = useState(false);
  const [sellIdx]           = useState(() => Math.floor(Math.random() * SELLS.length));

  const isOpen     = state !== "idle";
  const canDismiss = state === "locked" || state === "failed";

  // Hydration guard
  useEffect(() => setReady(true), []);

  // Animated dots for loading states
  useEffect(() => {
    if (!["awaiting_pin", "polling", "checking"].includes(state)) return;
    const t = setInterval(
      () => setDots((d) => (d.length >= 3 ? "." : d + ".")),
      550
    );
    return () => clearInterval(t);
  }, [state]);

  // Clear phone when modal re-opens to locked state
  useEffect(() => {
    if (state === "locked") setPhone("");
  }, [state]);

  // Auto-navigate on success after 3s (user can also click Watch Now)
  useEffect(() => {
    if (state !== "success") return;
    const t = setTimeout(() => {
      movie?.onUnlocked?.(movie.movieId);
      dismiss();
    }, 3500);
    return () => clearTimeout(t);
  }, [state, movie, dismiss]);

  if (!ready || !isOpen) return null;

  // Phone must be exactly 9 digits starting with 7 or 1 (after +254 prefix)
  const phoneDigits = phone.replace(/\D/g, "");
  const canSubmit =
    state === "locked" &&
    phoneDigits.length === 9 &&
    (phoneDigits[0] === "7" || phoneDigits[0] === "1");

  const handleSubmit = () => {
    if (!canSubmit) return;
    // Prepend "0" → "07XXXXXXXX" → formatPhone converts to "2547XXXXXXXX" ✅
    submitPhone("0" + phoneDigits);
  };

  const sell     = SELLS[sellIdx];
  const SellIcon = sell.Icon;

  return createPortal(
    <>
      <style>{CSS}</style>

      {/* ── Backdrop ── */}
      <div
        className="pm-bd"
        onClick={canDismiss ? dismiss : undefined}
      />

      {/* ── Sheet ── */}
      <div className="pm-sheet" role="dialog" aria-modal="true">

        {/* Close button */}
        {canDismiss && (
          <button className="pm-x" onClick={dismiss} aria-label="Close">
            <X size={15} />
          </button>
        )}

        {/* ════════════════════════════════════
            STATE: checking
        ════════════════════════════════════ */}
        {state === "checking" && (
          <div className="pm-mid pm-mid-tall">
            <div className="pm-spin" />
            <p className="pm-ssub" style={{ marginTop: 20 }}>
              Verifying access{dots}
            </p>
          </div>
        )}

        {/* ════════════════════════════════════
            STATE: locked  — payment form
        ════════════════════════════════════ */}
        {state === "locked" && movie && (
          <>
            {/* Cinematic poster strip */}
            {movie.posterUrl && (
              <div className="pm-strip">
                <img
                  src={movie.posterUrl}
                  alt=""
                  className="pm-poster"
                />
                {/* Noise grain overlay */}
                <div className="pm-grain" />
                <div className="pm-veil" />
                {/* Lock badge */}
                <div className="pm-lock-wrap">
                  <div className="pm-lock-ring">
                    <Lock size={22} color="#fff" strokeWidth={2.5} />
                  </div>
                  <span className="pm-lock-label">Premium</span>
                </div>
                {/* Movie title over strip */}
                <div className="pm-strip-title">
                  <span className="pm-badge">
                    <Zap size={9} color="#f59e0b" fill="#f59e0b" />
                    PREMIUM MOVIE
                  </span>
                  <h2 className="pm-title">{movie.movieTitle}</h2>
                </div>
              </div>
            )}

            <div className="pm-body">
              {/* Unlock price line */}
              <p className="pm-sub">
                Unlock for{" "}
                <strong className="pm-price">KES 10</strong>
                {" "}— yours forever, no expiry.
              </p>

              {/* Selling point */}
              <div className="pm-sell">
                <SellIcon
                  size={14}
                  color="#e50914"
                  style={{ flexShrink: 0, marginTop: 1 }}
                />
                <span>{sell.text}</span>
              </div>

              {/* Trust badges */}
              <div className="pm-trust">
                <span className="pm-ti">
                  <CheckCircle size={10} color="#10b981" /> Instant unlock
                </span>
                <span className="pm-ti">
                  <Shield size={10} color="#10b981" /> Secure M-Pesa
                </span>
                <span className="pm-ti">
                  <Star size={10} color="#10b981" /> Own forever
                </span>
              </div>

              {/* Phone input */}
              <p className="pm-lbl">M-Pesa number</p>
              <div className="pm-phone-row">
                <div className="pm-pfx">
                  <span style={{ fontSize: 18, lineHeight: 1 }}>🇰🇪</span>
                  <span className="pm-pfx-txt">+254</span>
                </div>
                <input
                  className="pm-inp"
                  type="tel"
                  inputMode="numeric"
                  placeholder="7XX XXX XXX"
                  maxLength={9}
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  autoFocus
                />
              </div>
              <p className="pm-hint">
                You&apos;ll receive an M-Pesa prompt — enter your PIN to confirm.
              </p>

              {/* CTA */}
              <button
                className={`pm-btn ${canSubmit ? "pm-btn-on" : "pm-btn-off"}`}
                disabled={!canSubmit}
                onClick={handleSubmit}
              >
                <Lock size={14} />
                Pay KES 10 &amp; Unlock Forever
              </button>
              <p className="pm-disc">
                One-time only. No subscriptions. No hidden charges.
              </p>
            </div>
          </>
        )}

        {/* ════════════════════════════════════
            STATE: awaiting_pin
        ════════════════════════════════════ */}
        {state === "awaiting_pin" && (
          <div className="pm-mid pm-mid-tall">
            <LottiePlayer
              url={LOTTIE.phone}
              loop
              style={{ width: 130, height: 130 }}
            />
            <h2 className="pm-stitle">Check your phone{dots}</h2>
            <p className="pm-ssub">
              An M-Pesa prompt has been sent to your number.
              <br />
              Enter your <strong style={{ color: "#fff" }}>M-Pesa PIN</strong> to confirm KES 10.
            </p>
            <div className="pm-mpill">
              <span className="pm-pdot" />
              Waiting for PIN confirmation
            </div>
          </div>
        )}

        {/* ════════════════════════════════════
            STATE: polling
        ════════════════════════════════════ */}
        {state === "polling" && (
          <div className="pm-mid pm-mid-tall">
            <LottiePlayer
              url={LOTTIE.phone}
              loop
              style={{ width: 130, height: 130 }}
            />
            <h2 className="pm-stitle">Confirming payment{dots}</h2>
            <p className="pm-ssub">
              Verifying with M-Pesa. Keep this screen open
              <br />— this usually takes a few seconds.
            </p>
            <div className="pm-track">
              <div className="pm-slide" />
            </div>
            <p className="pm-caution">Do not close this screen</p>
          </div>
        )}

        {/* ════════════════════════════════════
            STATE: success
        ════════════════════════════════════ */}
        {state === "success" && (
          <div className="pm-mid pm-mid-tall">
            <LottiePlayer
              url={LOTTIE.success}
              loop={false}
              style={{ width: 150, height: 150 }}
            />
            <h2 className="pm-stitle pm-green">Payment Confirmed!</h2>
            <p className="pm-ssub">
              You now own{" "}
              <strong style={{ color: "#fff" }}>{movie?.movieTitle}</strong>{" "}
              forever.
            </p>
            <button
              className="pm-btn pm-btn-on pm-btn-green"
              onClick={() => {
                movie?.onUnlocked?.(movie.movieId);
                dismiss();
              }}
            >
              <Play size={14} fill="#fff" />
              Watch Now
            </button>
          </div>
        )}

        {/* ════════════════════════════════════
            STATE: failed
        ════════════════════════════════════ */}
        {state === "failed" && (
          <div className="pm-mid pm-mid-tall">
            <div className="pm-err-ring">
              <AlertCircle size={32} color="#e50914" />
            </div>
            <h2 className="pm-stitle pm-red">Payment Failed</h2>
            <p className="pm-ssub">
              {error ?? "Something went wrong. Please try again."}
            </p>
            <button
              className="pm-btn pm-btn-on"
              style={{ marginBottom: 10 }}
              onClick={dismiss}   // dismiss → context resets to idle → user can click play again → modal re-opens at "locked"
            >
              <RefreshCw size={13} />
              Try Again
            </button>
            <button className="pm-ghost" onClick={dismiss}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </>,
    document.body
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────────────────────

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');

/* ── Backdrop ── */
.pm-bd {
  position: fixed; inset: 0; z-index: 8999;
  background: rgba(0,0,0,0.80);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  animation: pmFi .25s ease both;
}
@keyframes pmFi { from{opacity:0} to{opacity:1} }

/* ── Sheet — MOBILE first: slides up, covers 75% ── */
.pm-sheet {
  position: fixed; z-index: 9000;
  left: 0; right: 0; bottom: 0;
  height: 75svh;
  background: #0c0c10;
  border: 1px solid rgba(255,255,255,0.07);
  border-bottom: none;
  border-radius: 24px 24px 0 0;
  overflow: hidden;
  overflow-y: auto;
  scrollbar-width: none;
  animation: pmUp .38s cubic-bezier(.32,.72,0,1) both;
  box-shadow: 0 -24px 80px rgba(0,0,0,0.7);
}
.pm-sheet::-webkit-scrollbar { display: none; }
@keyframes pmUp {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}

/* ── Sheet — DESKTOP: centered modal, bigger ── */
@media (min-width: 640px) {
  .pm-sheet {
    left: 50%; top: 50%;
    right: auto; bottom: auto;
    width: 540px;
    max-height: 88svh;
    height: auto;
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.09);
    box-shadow:
      0 0 0 1px rgba(229,9,20,0.08),
      0 40px 120px rgba(0,0,0,0.85),
      0 0 60px rgba(229,9,20,0.06);
    transform: translate(-50%, -50%);
    animation: pmZi .32s cubic-bezier(.32,.72,0,1) both;
  }
  @keyframes pmZi {
    from { opacity:0; transform:translate(-50%,-47%) scale(.96); }
    to   { opacity:1; transform:translate(-50%,-50%) scale(1); }
  }
}

/* ── Close button ── */
.pm-x {
  position: absolute; top: 13px; right: 13px; z-index: 20;
  width: 30px; height: 30px; border-radius: 50%;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.11);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: rgba(255,255,255,0.45);
  transition: background .15s, color .15s;
}
.pm-x:hover { background: rgba(255,255,255,0.14); color: #fff; }

/* ── Poster strip ── */
.pm-strip {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
  flex-shrink: 0;
}
@media (min-width: 640px) {
  .pm-strip { height: 220px; }
}
.pm-poster {
  width: 100%; height: 100%;
  object-fit: cover;
  object-position: center 18%;
  filter: brightness(.45) saturate(1.2);
  transform: scale(1.04);
}
/* CSS noise grain via SVG filter */
.pm-grain {
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-size: 180px;
}
.pm-veil {
  position: absolute; inset: 0; z-index: 2;
  background: linear-gradient(
    to bottom,
    rgba(12,12,16,0.1) 0%,
    rgba(12,12,16,0.5) 55%,
    rgba(12,12,16,1) 100%
  );
}
/* Lock badge centred */
.pm-lock-wrap {
  position: absolute; inset: 0; z-index: 3;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 8px;
  padding-bottom: 40px;
}
.pm-lock-ring {
  width: 56px; height: 56px; border-radius: 50%;
  background: rgba(229,9,20,0.9);
  border: 2.5px solid rgba(255,255,255,0.18);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 32px rgba(229,9,20,0.55), 0 0 0 8px rgba(229,9,20,0.1);
  animation: pmLockPop .5s cubic-bezier(.22,1,.36,1) both;
}
@keyframes pmLockPop {
  from { transform: scale(0.6); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}
.pm-lock-label {
  font-family: 'Outfit', sans-serif;
  font-size: 10px; font-weight: 700;
  letter-spacing: .25em; text-transform: uppercase;
  color: rgba(255,255,255,0.35);
}
/* Movie title pinned bottom of strip */
.pm-strip-title {
  position: absolute; bottom: 0; left: 0; right: 0; z-index: 4;
  padding: 0 20px 16px;
}
.pm-badge {
  display: inline-flex; align-items: center; gap: 5px;
  background: rgba(245,158,11,0.12);
  border: 1px solid rgba(245,158,11,0.28);
  border-radius: 99px; padding: 3px 10px;
  font-family: 'Outfit', sans-serif;
  font-size: 9px; font-weight: 700; letter-spacing: .1em;
  color: #f59e0b; margin-bottom: 7px;
}
.pm-title {
  font-family: 'Syne', sans-serif;
  font-size: clamp(1.25rem, 4vw, 1.6rem);
  font-weight: 800; color: #fff;
  margin: 0; letter-spacing: -.02em; line-height: 1.1;
  text-shadow: 0 2px 20px rgba(0,0,0,0.6);
}

/* ── Body ── */
.pm-body { padding: 16px 20px 32px; }
@media (min-width: 640px) { .pm-body { padding: 20px 28px 36px; } }

.pm-sub {
  font-family: 'Outfit', sans-serif;
  font-size: 13.5px; color: rgba(255,255,255,0.42);
  margin: 0 0 14px; line-height: 1.6;
}
.pm-price { color: #e50914; font-weight: 700; }

/* Selling point card */
.pm-sell {
  display: flex; align-items: flex-start; gap: 10px;
  background: rgba(229,9,20,0.04);
  border: 1px solid rgba(229,9,20,0.12);
  border-radius: 12px; padding: 12px 14px; margin-bottom: 14px;
  font-family: 'Outfit', sans-serif;
  font-size: 12.5px; color: rgba(255,255,255,0.58); line-height: 1.55;
}

/* Trust row */
.pm-trust {
  display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px;
}
.pm-ti {
  display: flex; align-items: center; gap: 5px;
  font-family: 'Outfit', sans-serif;
  font-size: 10.5px; color: rgba(255,255,255,0.28);
}

/* Phone label */
.pm-lbl {
  font-family: 'Outfit', sans-serif;
  font-size: 10px; font-weight: 700;
  color: rgba(255,255,255,0.28);
  letter-spacing: .07em; text-transform: uppercase;
  margin: 0 0 8px;
}

/* Phone row */
.pm-phone-row {
  display: flex; align-items: center;
  background: rgba(255,255,255,0.04);
  border: 1.5px solid rgba(255,255,255,0.09);
  border-radius: 12px; overflow: hidden;
  margin-bottom: 8px;
  transition: border-color .18s, background .18s;
}
.pm-phone-row:focus-within {
  border-color: rgba(229,9,20,0.5);
  background: rgba(229,9,20,0.03);
}
.pm-pfx {
  display: flex; align-items: center; gap: 6px;
  padding: 0 13px; height: 52px; flex-shrink: 0;
  border-right: 1px solid rgba(255,255,255,0.07);
}
.pm-pfx-txt {
  font-family: 'Outfit', sans-serif;
  font-size: 13px; font-weight: 600;
  color: rgba(255,255,255,0.48);
}
.pm-inp {
  flex: 1; height: 52px; padding: 0 14px;
  background: transparent; border: none; outline: none;
  font-family: 'Outfit', sans-serif;
  font-size: 17px; font-weight: 600;
  color: #fff; letter-spacing: .04em;
  caret-color: #e50914;
}
.pm-inp::placeholder { color: rgba(255,255,255,0.18); }

.pm-hint {
  font-family: 'Outfit', sans-serif;
  font-size: 10.5px; color: rgba(255,255,255,0.18);
  margin: 0 0 18px; line-height: 1.55;
}

/* ── CTA button ── */
.pm-btn {
  width: 100%; height: 52px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-family: 'Outfit', sans-serif;
  font-size: 14px; font-weight: 700; letter-spacing: .02em;
  border: none; cursor: pointer;
  transition: transform .13s, box-shadow .13s, background .15s;
  margin-bottom: 10px;
}
.pm-btn-on {
  background: #e50914; color: #fff;
  box-shadow: 0 6px 28px rgba(229,9,20,0.4);
}
.pm-btn-on:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 36px rgba(229,9,20,0.55);
}
.pm-btn-on:active { transform: scale(.98); }
.pm-btn-off {
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.2);
  cursor: not-allowed;
  box-shadow: none;
}
.pm-btn-green {
  background: #10b981 !important;
  box-shadow: 0 6px 28px rgba(16,185,129,0.38) !important;
}
.pm-btn-green:hover { background: #059669 !important; }

.pm-ghost {
  width: 100%; height: 44px; border-radius: 12px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.28);
  font-family: 'Outfit', sans-serif; font-size: 13px;
  cursor: pointer; transition: background .15s, color .15s;
}
.pm-ghost:hover {
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.55);
}
.pm-disc {
  font-family: 'Outfit', sans-serif;
  font-size: 10px; color: rgba(255,255,255,0.1);
  text-align: center; margin: 0; line-height: 1.6;
}

/* ── Centered state panels ── */
.pm-mid {
  display: flex; flex-direction: column;
  align-items: center; text-align: center;
  padding: 28px 24px 36px; gap: 0;
}
.pm-mid-tall {
  min-height: 320px;
  justify-content: center;
}
@media (min-width: 640px) {
  .pm-mid { padding: 40px 36px 48px; }
  .pm-mid-tall { min-height: 400px; }
}

.pm-stitle {
  font-family: 'Syne', sans-serif;
  font-size: 1.3rem; font-weight: 800;
  color: #fff; margin: 0 0 10px;
  letter-spacing: -.02em;
}
.pm-green { color: #10b981 !important; }
.pm-red   { color: #e50914 !important; }

.pm-ssub {
  font-family: 'Outfit', sans-serif;
  font-size: 13.5px; color: rgba(255,255,255,0.38);
  line-height: 1.7; margin: 0 0 22px;
  max-width: 340px;
}

/* Waiting pill */
.pm-mpill {
  display: flex; align-items: center; gap: 9px;
  background: rgba(16,185,129,0.08);
  border: 1px solid rgba(16,185,129,0.22);
  border-radius: 99px; padding: 8px 18px;
  font-family: 'Outfit', sans-serif;
  font-size: 11px; font-weight: 600; color: #10b981;
}
.pm-pdot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #10b981;
  animation: pmPulse 1.2s ease-in-out infinite;
}
@keyframes pmPulse {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:.3; transform:scale(.6); }
}

/* Progress track */
.pm-track {
  width: 80%; max-width: 260px;
  height: 3px; border-radius: 99px;
  background: rgba(255,255,255,0.06);
  overflow: hidden; margin-top: 8px;
}
.pm-slide {
  height: 100%; width: 35%;
  background: linear-gradient(90deg, transparent, #e50914, transparent);
  animation: pmSlide 1.5s ease-in-out infinite;
}
@keyframes pmSlide {
  0%   { transform: translateX(-200%); }
  100% { transform: translateX(500%); }
}

.pm-caution {
  font-family: 'Outfit', sans-serif;
  font-size: 10px; color: rgba(255,255,255,0.16);
  margin: 14px 0 0; letter-spacing: .04em;
}

/* Error ring */
.pm-err-ring {
  width: 72px; height: 72px; border-radius: 50%;
  background: rgba(229,9,20,0.08);
  border: 1px solid rgba(229,9,20,0.22);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 20px;
  animation: pmLockPop .4s cubic-bezier(.22,1,.36,1) both;
}

/* Spinner (checking state) */
@keyframes pmSpin { to { transform: rotate(360deg); } }
.pm-spin {
  width: 44px; height: 44px; border-radius: 50%;
  border: 3px solid rgba(255,255,255,0.06);
  border-top-color: #e50914;
  animation: pmSpin .75s linear infinite;
}
`;