"use client";

// components/payment/PaymentModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// CINEMATIC FULL-SCREEN PAYMENT MODAL
//
// Desktop  → full viewport takeover. Split layout: poster fill left, form right.
// Mobile   → bottom sheet, 90svh, slides up with spring.
// Theme    → reads accent / bg / border tokens from ThemeContext CSS vars.
// Lottie   → /public/animations/payment.json  (waiting / phone prompt)
//              /public/animations/success.json (confetti / check)
//              loaded via lottie-web (SSR-safe dynamic import)
// Phone    → accepts 07XX XXX XXX  and  01XX XXX XXX  freely.
//             No forced prefix — users type what they know.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X, Lock, Shield, Star, Zap, CheckCircle,
  AlertCircle, Play, Smartphone, RefreshCw,
  Sparkles, Crown, BadgePercent,
  Phone,
} from "lucide-react";
import { usePremiumGate } from "@/context/PremiumGateContext";
import { useTheme } from "@/context/ThemeContext";

// ─────────────────────────────────────────────────────────────────────────────
// Lottie — SSR-safe
// ─────────────────────────────────────────────────────────────────────────────

function LottiePlayer({ path, loop = true, style }: {
  path: string; loop?: boolean; style?: React.CSSProperties;
}) {
  const ref  = useRef<HTMLDivElement>(null);
  const anim = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => {
    let dead = false;
    import("lottie-web").then((m) => {
      if (dead || !ref.current) return;
      anim.current?.destroy();
      anim.current = m.default.loadAnimation({
        container: ref.current!,
        renderer: "svg",
        loop,
        autoplay: true,
        path,
      }) as unknown as { destroy: () => void };
    });
    return () => { dead = true; anim.current?.destroy(); anim.current = null; };
  }, [path, loop]);

  return <div ref={ref} style={style} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Diagonal ribbon
// ─────────────────────────────────────────────────────────────────────────────

function Ribbon({ label, accent }: { label: string; accent: string }) {
  return (
    <div style={{
      position: "absolute", top: 22, right: -28, zIndex: 30,
      width: 140, textAlign: "center",
      transform: "rotate(35deg)",
      background: accent,
      padding: "5px 0",
      fontSize: 9, fontWeight: 800, letterSpacing: "0.18em",
      textTransform: "uppercase", color: "#fff",
      fontFamily: "'Bebas Neue', 'DM Sans', sans-serif",
      boxShadow: `0 2px 12px ${accent}66`,
      pointerEvents: "none",
    }}>{label}</div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Perks list
// ─────────────────────────────────────────────────────────────────────────────

const PERKS = [
  { icon: Crown,       text: "Own forever — no expiry, ever." },
  { icon: Zap,         text: "One-time KES 10. Zero subscriptions." },
  { icon: Shield,      text: "100% secure M-Pesa. Encrypted end-to-end." },
  { icon: Smartphone,    text: "Works on all your devices instantly." },
  { icon: BadgePercent,text: "Early adopter pricing — price goes up soon." },
];

// ─────────────────────────────────────────────────────────────────────────────
// Animated dots helper
// ─────────────────────────────────────────────────────────────────────────────

function useDots(active: boolean) {
  const [dots, setDots] = useState(".");
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setDots(d => d.length >= 3 ? "." : d + "."), 550);
    return () => clearInterval(t);
  }, [active]);
  return dots;
}

// ─────────────────────────────────────────────────────────────────────────────
// Phone format utils
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Accept any of:
 *   07XXXXXXXX  (10 digits, starts 07)
 *   01XXXXXXXX  (10 digits, starts 01)
 *   7XXXXXXXX   (9 digits,  starts 7)
 *   1XXXXXXXX   (9 digits,  starts 1)
 *   2547XXXXXXXX / 2541XXXXXXXX (12 digits)
 * Returns "254XXXXXXXXX" for the API.
 */
function normalizePhone(raw: string): string | null {
  const d = raw.replace(/\D/g, "");
  if (d.startsWith("254") && d.length === 12) return d;
  if ((d.startsWith("07") || d.startsWith("01")) && d.length === 10) return "254" + d.slice(1);
  if ((d.startsWith("7")  || d.startsWith("1"))  && d.length === 9)  return "254" + d;
  return null;
}

function isValidPhone(raw: string): boolean {
  return normalizePhone(raw) !== null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function PaymentModal() {
  const { gateStatus, submitPhone, dismiss } = usePremiumGate();
  const { t } = useTheme();
  const { state, movie, error } = gateStatus;

  const [phone, setPhone] = useState("");
  const [ready, setReady] = useState(false);
  const [perkIdx]         = useState(() => Math.floor(Math.random() * PERKS.length));

  const isLoading = ["awaiting_pin", "polling", "checking"].includes(state);
  const dots      = useDots(isLoading);
  const isOpen    = state !== "idle";
  const canDismiss = state === "locked" || state === "failed";
  const canSubmit  = state === "locked" && isValidPhone(phone);

  // Hydration guard
  useEffect(() => setReady(true), []);

  // Reset phone on re-open
  useEffect(() => { if (state === "locked") setPhone(""); }, [state]);

  // Auto-navigate after success
  useEffect(() => {
    if (state !== "success") return;
    const t = setTimeout(() => { movie?.onUnlocked?.(movie.movieId); dismiss(); }, 3800);
    return () => clearTimeout(t);
  }, [state, movie, dismiss]);

  if (!ready || !isOpen) return null;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const normalized = normalizePhone(phone)!;
    submitPhone(normalized);
  };

  const Perk = PERKS[perkIdx];

  return createPortal(
    <>
      <style>{CSS(t.accent, t.accentGlow, t.bgBase, t.bgSurface, t.bgElevated,
                   t.borderSubtle, t.borderMedium, t.borderAccent,
                   t.textPrimary, t.textSecondary, t.textMuted, t.textOnAccent,
                   t.navActiveBg, t.navHoverBg)}</style>

      {/* Backdrop */}
      <div className="pm-bd" onClick={canDismiss ? dismiss : undefined} />

      {/* Root sheet */}
      <div className="pm-root" role="dialog" aria-modal="true" aria-label="Unlock movie">

        {/* ══════════════════════════════════════
            DESKTOP SPLIT — left poster, right form
            MOBILE    — single column scroll
        ══════════════════════════════════════ */}

        {/* ── Left: Cinematic poster panel (desktop only) ── */}
        {movie?.posterUrl && (
          <div className="pm-left">
            <img src={movie.posterUrl} alt="" className="pm-poster-img" />
            {/* Grain */}
            <div className="pm-grain" />
            {/* Gradient veil */}
            <div className="pm-left-veil" />
            {/* Ribbon */}
            <div style={{ position: "absolute", top: 0, right: 0, overflow: "hidden", width: 110, height: 110, zIndex: 30 }}>
              <Ribbon label="50% OFF" accent={t.accent} />
            </div>
            {/* Movie meta pinned bottom */}
            <div className="pm-left-meta">
              <span className="pm-genre-chip">
                <Star size={9} fill={t.accent} color={t.accent} />
                PREMIUM FILM
              </span>
              <h2 className="pm-left-title">{movie.movieTitle}</h2>
              <p className="pm-left-sub">One-time unlock · Yours forever</p>
            </div>
          </div>
        )}

        {/* ── Right: form / state panel ── */}
        <div className="pm-right">

          {/* Close */}
          {canDismiss && (
            <button className="pm-close" onClick={dismiss} aria-label="Close">
              <X size={14} strokeWidth={2.5} />
            </button>
          )}

          {/* ══ STATE: checking ══ */}
          {state === "checking" && (
            <div className="pm-center-state">
              <div className="pm-spinner" />
              <p className="pm-state-sub" style={{ marginTop: 20 }}>Verifying access{dots}</p>
            </div>
          )}

          {/* ══ STATE: locked — payment form ══ */}
          {state === "locked" && movie && (
            <div className="pm-form-wrap">

              {/* Mobile-only poster header */}
              {movie.posterUrl && (
                <div className="pm-mobile-strip">
                  <img src={movie.posterUrl} alt="" className="pm-mobile-poster" />
                  <div className="pm-mobile-veil" />
                  <div style={{ position: "absolute", top: 0, right: 0, overflow: "hidden", width: 90, height: 90, zIndex: 20 }}>
                    <Ribbon label="50% OFF" accent={t.accent} />
                  </div>
                  <div className="pm-mobile-meta">
                    <span className="pm-genre-chip">
                      <Star size={8} fill={t.accent} color={t.accent} />
                      PREMIUM
                    </span>
                    <h2 className="pm-mobile-title">{movie.movieTitle}</h2>
                  </div>
                </div>
              )}

              {/* Form scrollable body */}
              <div className="pm-form-body">

                {/* Price headline */}
                <div className="pm-price-row">
                  <div className="pm-price-badge">
                    <span className="pm-price-old">KES 20</span>
                    <span className="pm-price-new">KES 10</span>
                    <span className="pm-price-save">50% OFF</span>
                  </div>
                  <p className="pm-price-desc">Unlock once. Watch forever — no expiry, no re-purchasing.</p>
                </div>

                {/* Single perk highlight */}
                <div className="pm-perk-card">
                  <Perk.icon size={15} color={t.accent} style={{ flexShrink: 0 }} />
                  <span>{Perk.text}</span>
                </div>

                {/* Trust row */}
                <div className="pm-trust-row">
                  <span className="pm-trust-item"><CheckCircle size={10} color="#10b981" /> Instant</span>
                  <span className="pm-trust-item"><Shield     size={10} color="#10b981" /> Secure</span>
                  <span className="pm-trust-item"><Star       size={10} color="#10b981" /> Forever</span>
                  <span className="pm-trust-item"><Smartphone size={10} color="#10b981" /> All devices</span>
                </div>

                {/* Divider */}
                <div className="pm-divider" />

                {/* Phone label */}
                <p className="pm-field-label">M-Pesa number</p>

                {/* Phone input — free entry, flag emoji only decoration */}
                <div className="pm-phone-box">
                  <div className="pm-phone-flag">
                    <span style={{ fontSize: 20, lineHeight: 1 }}>🇰🇪</span>
                  </div>
                  <input
                    className="pm-phone-input"
                    type="tel"
                    inputMode="numeric"
                    placeholder="07XX XXX XXX or 01XX XXX XXX"
                    maxLength={15}
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                    autoFocus
                  />
                  {phone.length > 0 && (
                    <div className="pm-phone-status">
                      {isValidPhone(phone)
                        ? <CheckCircle size={16} color="#10b981" />
                        : <AlertCircle size={16} color="rgba(255,255,255,0.2)" />
                      }
                    </div>
                  )}
                </div>
                <p className="pm-field-hint">
                  Enter your M-Pesa number — 07XX, 01XX, or with +254 prefix. You'll receive a PIN prompt on your phone.
                </p>

                {/* CTA */}
                <button
                  className={`pm-cta ${canSubmit ? "pm-cta-on" : "pm-cta-off"}`}
                  disabled={!canSubmit}
                  onClick={handleSubmit}
                >
                  <Lock size={15} strokeWidth={2.5} />
                  Pay KES 10 &amp; Unlock Forever
                </button>

                <p className="pm-disclaimer">
                  One-time only · No subscriptions · No hidden charges · Secured by M-Pesa
                </p>
              </div>
            </div>
          )}

          {/* ══ STATE: awaiting_pin ══ */}
          {state === "awaiting_pin" && (
            <div className="pm-center-state">
              <LottiePlayer
                path="/animations/payment.json"
                loop
                style={{ width: 160, height: 160 }}
              />
              <h3 className="pm-state-title">Check your phone{dots}</h3>
              <p className="pm-state-sub">
                An M-Pesa prompt has been sent.<br />
                Enter your <strong style={{ color: t.textPrimary }}>M-Pesa PIN</strong> to confirm KES 10.
              </p>
              <div className="pm-waiting-pill">
                <span className="pm-pulse-dot" />
                Waiting for PIN confirmation
              </div>
            </div>
          )}

          {/* ══ STATE: polling ══ */}
          {state === "polling" && (
            <div className="pm-center-state">
              <LottiePlayer
                path="/animations/payment.json"
                loop
                style={{ width: 160, height: 160 }}
              />
              <h3 className="pm-state-title">Confirming payment{dots}</h3>
              <p className="pm-state-sub">
                Verifying with M-Pesa — keep this screen open.<br />
                This usually takes a few seconds.
              </p>
              <div className="pm-progress-track">
                <div className="pm-progress-slide" />
              </div>
              <p className="pm-caution">Do not close this screen</p>
            </div>
          )}

          {/* ══ STATE: success ══ */}
          {state === "success" && (
            <div className="pm-center-state">
              <LottiePlayer
                path="/animations/success.json"
                loop={false}
                style={{ width: 180, height: 180 }}
              />
              <h3 className="pm-state-title pm-success-text">Payment Confirmed!</h3>
              <p className="pm-state-sub">
                You now own <strong style={{ color: t.textPrimary }}>{movie?.movieTitle}</strong> forever.
                <br />Welcome to the experience.
              </p>
              <button
                className="pm-cta pm-cta-on pm-cta-green"
                onClick={() => { movie?.onUnlocked?.(movie.movieId); dismiss(); }}
              >
                <Play size={15} fill="#fff" color="#fff" />
                Watch Now
              </button>
            </div>
          )}

          {/* ══ STATE: failed ══ */}
          {state === "failed" && (
            <div className="pm-center-state">
              <div className="pm-error-ring">
                <AlertCircle size={34} color="#e50914" />
              </div>
              <h3 className="pm-state-title pm-error-text">Payment Failed</h3>
              <p className="pm-state-sub">
                {error ?? "Something went wrong. Please try again."}
              </p>
              <button className="pm-cta pm-cta-on" style={{ marginBottom: 12 }} onClick={dismiss}>
                <RefreshCw size={14} /> Try Again
              </button>
              <button className="pm-ghost" onClick={dismiss}>Cancel</button>
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CSS factory — injects theme tokens
// ─────────────────────────────────────────────────────────────────────────────

function CSS(
  accent: string, accentGlow: string,
  bgBase: string, bgSurface: string, bgElevated: string,
  borderSubtle: string, borderMedium: string, borderAccent: string,
  textPrimary: string, textSecondary: string, textMuted: string, textOnAccent: string,
  navActiveBg: string, navHoverBg: string,
): string {
  return `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');

/* ─── Backdrop ─── */
.pm-bd {
  position: fixed; inset: 0; z-index: 8800;
  background: rgba(0,0,0,0.88);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  animation: pmFadeIn .3s ease both;
}
@keyframes pmFadeIn { from{opacity:0} to{opacity:1} }

/* ─── Root: mobile = bottom sheet ─── */
.pm-root {
  position: fixed;
  left: 0; right: 0; bottom: 0;
  z-index: 8900;
  height: 90svh;
  background: ${bgBase};
  border-radius: 28px 28px 0 0;
  border: 1px solid ${borderSubtle};
  border-bottom: none;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: pmSlideUp .42s cubic-bezier(.22,1,.36,1) both;
  box-shadow: 0 -32px 100px rgba(0,0,0,0.75), 0 0 0 1px ${borderSubtle};
}
@keyframes pmSlideUp {
  from { transform: translateY(100%); opacity: 0.4; }
  to   { transform: translateY(0);    opacity: 1; }
}

/* ─── Desktop: fullscreen split modal ─── */
@media (min-width: 768px) {
  .pm-root {
    top: 50%; left: 50%;
    bottom: auto; right: auto;
    width: min(900px, 92vw);
    height: min(620px, 90svh);
    border-radius: 24px;
    border: 1px solid ${borderMedium};
    box-shadow:
      0 0 0 1px ${borderAccent},
      0 40px 140px rgba(0,0,0,0.9),
      0 0 80px ${accentGlow};
    transform: translate(-50%, -50%);
    flex-direction: row;
    animation: pmZoomIn .36s cubic-bezier(.22,1,.36,1) both;
  }
  @keyframes pmZoomIn {
    from { opacity:0; transform: translate(-50%,-48%) scale(.95); }
    to   { opacity:1; transform: translate(-50%,-50%) scale(1); }
  }
}

/* ─── Left poster panel (desktop only) ─── */
.pm-left {
  display: none;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}
@media (min-width: 768px) {
  .pm-left {
    display: block;
    width: 340px;
    height: 100%;
    border-radius: 24px 0 0 24px;
    border-right: 1px solid ${borderSubtle};
  }
}
.pm-poster-img {
  width: 100%; height: 100%;
  object-fit: cover;
  object-position: center 15%;
  filter: brightness(.42) saturate(1.3);
  transform: scale(1.05);
  display: block;
}
.pm-grain {
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 160px;
}
.pm-left-veil {
  position: absolute; inset: 0; z-index: 2;
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0.05) 0%,
    rgba(0,0,0,0.3) 45%,
    ${bgBase}dd 100%
  );
}
.pm-left-meta {
  position: absolute; bottom: 0; left: 0; right: 0;
  z-index: 5; padding: 0 28px 32px;
}
.pm-left-title {
  font-family: 'Syne', sans-serif;
  font-size: clamp(1.4rem, 3vw, 2rem);
  font-weight: 800; color: ${textPrimary};
  margin: 0 0 5px; line-height: 1.08;
  letter-spacing: -.025em;
  text-shadow: 0 3px 24px rgba(0,0,0,0.7);
}
.pm-left-sub {
  font-family: 'Outfit', sans-serif;
  font-size: 11px; color: ${textMuted};
  letter-spacing: .04em; margin: 0;
}

/* ─── Genre chip ─── */
.pm-genre-chip {
  display: inline-flex; align-items: center; gap: 5px;
  background: ${navActiveBg};
  border: 1px solid ${borderAccent};
  border-radius: 99px; padding: 4px 12px;
  font-family: 'Outfit', sans-serif;
  font-size: 8.5px; font-weight: 700;
  letter-spacing: .14em; text-transform: uppercase;
  color: ${accent}; margin-bottom: 9px;
}

/* ─── Right panel ─── */
.pm-right {
  flex: 1; min-width: 0;
  position: relative;
  overflow-y: auto; overflow-x: hidden;
  scrollbar-width: none;
  display: flex; flex-direction: column;
}
.pm-right::-webkit-scrollbar { display: none; }

/* ─── Close button ─── */
.pm-close {
  position: absolute; top: 16px; right: 16px; z-index: 20;
  width: 32px; height: 32px; border-radius: 50%;
  background: rgba(255,255,255,0.06);
  border: 1px solid ${borderMedium};
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: ${textMuted};
  transition: background .15s, color .15s;
}
.pm-close:hover { background: rgba(255,255,255,0.12); color: ${textPrimary}; }

/* ─── Mobile poster strip (hidden on desktop) ─── */
.pm-mobile-strip {
  position: relative;
  width: 100%; height: 180px;
  overflow: hidden; flex-shrink: 0;
}
@media (min-width: 768px) { .pm-mobile-strip { display: none; } }
.pm-mobile-poster {
  width: 100%; height: 100%;
  object-fit: cover; object-position: center 18%;
  filter: brightness(.38) saturate(1.2);
  transform: scale(1.04);
  display: block;
}
.pm-mobile-veil {
  position: absolute; inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0.1) 0%,
    ${bgBase}ee 100%
  );
}
.pm-mobile-meta {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 0 20px 16px; z-index: 10;
}
.pm-mobile-title {
  font-family: 'Syne', sans-serif;
  font-size: 1.4rem; font-weight: 800;
  color: ${textPrimary}; margin: 0;
  line-height: 1.1; letter-spacing: -.02em;
  text-shadow: 0 2px 20px rgba(0,0,0,0.7);
}

/* ─── Form wrapper ─── */
.pm-form-wrap {
  display: flex; flex-direction: column;
  flex: 1; min-height: 0;
}
.pm-form-body {
  padding: 22px 24px 36px;
  display: flex; flex-direction: column; gap: 0;
}
@media (min-width: 768px) {
  .pm-form-body {
    padding: 32px 36px 40px;
    justify-content: center;
    flex: 1;
  }
}

/* ─── Price row ─── */
.pm-price-row { margin-bottom: 16px; }
.pm-price-badge {
  display: flex; align-items: center; gap: 10px; margin-bottom: 6px;
}
.pm-price-old {
  font-family: 'Outfit', sans-serif;
  font-size: 14px; color: ${textMuted};
  text-decoration: line-through; font-weight: 500;
}
.pm-price-new {
  font-family: 'Bebas Neue', 'Outfit', sans-serif;
  font-size: 36px; color: ${accent};
  letter-spacing: .03em; line-height: 1;
  text-shadow: 0 0 20px ${accentGlow};
}
.pm-price-save {
  background: ${accent};
  color: ${textOnAccent};
  font-family: 'Outfit', sans-serif;
  font-size: 9px; font-weight: 800;
  letter-spacing: .12em; text-transform: uppercase;
  padding: 4px 10px; border-radius: 99px;
  box-shadow: 0 2px 12px ${accentGlow};
}
.pm-price-desc {
  font-family: 'Outfit', sans-serif;
  font-size: 12px; color: ${textSecondary};
  margin: 0; line-height: 1.6;
}

/* ─── Perk card ─── */
.pm-perk-card {
  display: flex; align-items: flex-start; gap: 11px;
  background: ${navActiveBg};
  border: 1px solid ${borderAccent};
  border-radius: 14px; padding: 13px 16px;
  margin-bottom: 14px;
  font-family: 'Outfit', sans-serif;
  font-size: 12.5px; color: ${textSecondary};
  line-height: 1.55;
}

/* ─── Trust row ─── */
.pm-trust-row {
  display: flex; flex-wrap: wrap; gap: 8px;
  margin-bottom: 20px;
}
.pm-trust-item {
  display: flex; align-items: center; gap: 5px;
  font-family: 'Outfit', sans-serif;
  font-size: 10px; color: ${textMuted};
  background: ${navHoverBg};
  border: 1px solid ${borderSubtle};
  border-radius: 99px; padding: 4px 10px;
}

/* ─── Divider ─── */
.pm-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, ${borderMedium}, transparent);
  margin-bottom: 20px;
}

/* ─── Field label ─── */
.pm-field-label {
  font-family: 'Outfit', sans-serif;
  font-size: 9.5px; font-weight: 700;
  text-transform: uppercase; letter-spacing: .1em;
  color: ${textMuted}; margin: 0 0 8px;
}

/* ─── Phone box ─── */
.pm-phone-box {
  display: flex; align-items: center;
  background: ${bgSurface};
  border: 1.5px solid ${borderMedium};
  border-radius: 14px; overflow: hidden;
  margin-bottom: 8px;
  transition: border-color .18s, background .18s, box-shadow .18s;
}
.pm-phone-box:focus-within {
  border-color: ${accent};
  background: ${bgElevated};
  box-shadow: 0 0 0 3px ${accentGlow};
}
.pm-phone-flag {
  display: flex; align-items: center; justify-content: center;
  padding: 0 14px; height: 56px; flex-shrink: 0;
  border-right: 1px solid ${borderSubtle};
}
.pm-phone-input {
  flex: 1; height: 56px; padding: 0 14px;
  background: transparent; border: none; outline: none;
  font-family: 'Outfit', sans-serif;
  font-size: 17px; font-weight: 600;
  color: ${textPrimary}; letter-spacing: .04em;
  caret-color: ${accent};
}
.pm-phone-input::placeholder { color: ${textMuted}; font-weight: 400; font-size: 13px; }
.pm-phone-status {
  padding: 0 16px; display: flex; align-items: center;
}
.pm-field-hint {
  font-family: 'Outfit', sans-serif;
  font-size: 10.5px; color: ${textMuted};
  margin: 0 0 20px; line-height: 1.6;
}

/* ─── CTA button ─── */
.pm-cta {
  width: 100%; height: 56px; border-radius: 16px;
  display: flex; align-items: center; justify-content: center; gap: 9px;
  font-family: 'Outfit', sans-serif;
  font-size: 14px; font-weight: 800; letter-spacing: .04em;
  border: none; cursor: pointer;
  transition: transform .13s, box-shadow .18s, background .15s, opacity .15s;
  margin-bottom: 12px;
  text-transform: uppercase;
}
.pm-cta-on {
  background: ${accent};
  color: ${textOnAccent};
  box-shadow: 0 6px 30px ${accentGlow}, 0 2px 0 rgba(255,255,255,0.08) inset;
}
.pm-cta-on:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 40px ${accentGlow};
}
.pm-cta-on:active { transform: scale(.98); }
.pm-cta-off {
  background: ${bgElevated};
  color: ${textMuted};
  cursor: not-allowed;
  border: 1px solid ${borderSubtle};
}
.pm-cta-green {
  background: #10b981 !important;
  box-shadow: 0 6px 28px rgba(16,185,129,0.4) !important;
}
.pm-cta-green:hover { background: #059669 !important; }

.pm-ghost {
  width: 100%; height: 46px; border-radius: 12px;
  background: transparent;
  border: 1px solid ${borderMedium};
  color: ${textMuted};
  font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 500;
  cursor: pointer;
  transition: background .15s, color .15s, border-color .15s;
}
.pm-ghost:hover {
  background: ${navHoverBg};
  border-color: ${borderMedium};
  color: ${textSecondary};
}

.pm-disclaimer {
  font-family: 'Outfit', sans-serif;
  font-size: 9.5px; color: ${textMuted};
  text-align: center; margin: 0; line-height: 1.7;
  opacity: .6;
}

/* ─── Centered state panels ─── */
.pm-center-state {
  flex: 1;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center; padding: 32px 28px 40px;
  gap: 0;
  min-height: 320px;
}
@media (min-width: 768px) {
  .pm-center-state { padding: 0 44px; min-height: unset; height: 100%; }
}

.pm-state-title {
  font-family: 'Syne', sans-serif;
  font-size: 1.5rem; font-weight: 800;
  color: ${textPrimary}; margin: 0 0 10px;
  letter-spacing: -.02em;
}
.pm-state-sub {
  font-family: 'Outfit', sans-serif;
  font-size: 13px; color: ${textSecondary};
  line-height: 1.75; margin: 0 0 24px;
  max-width: 320px;
}
.pm-success-text { color: #10b981 !important; }
.pm-error-text   { color: #e50914 !important; }

/* Waiting pill */
.pm-waiting-pill {
  display: flex; align-items: center; gap: 10px;
  background: rgba(16,185,129,0.07);
  border: 1px solid rgba(16,185,129,0.22);
  border-radius: 99px; padding: 9px 20px;
  font-family: 'Outfit', sans-serif;
  font-size: 11.5px; font-weight: 600; color: #10b981;
}
.pm-pulse-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #10b981;
  animation: pmPulse 1.2s ease-in-out infinite;
}
@keyframes pmPulse {
  0%,100%{ opacity:1; transform:scale(1); }
  50%    { opacity:.2; transform:scale(.55); }
}

/* Progress bar */
.pm-progress-track {
  width: 75%; max-width: 260px; height: 3px;
  border-radius: 99px; background: ${borderSubtle};
  overflow: hidden; margin: 4px 0 0;
}
.pm-progress-slide {
  height: 100%; width: 30%;
  background: linear-gradient(90deg, transparent, ${accent}, transparent);
  animation: pmSlide 1.6s ease-in-out infinite;
}
@keyframes pmSlide {
  0%   { transform: translateX(-200%); }
  100% { transform: translateX(500%); }
}
.pm-caution {
  font-family: 'Outfit', sans-serif;
  font-size: 10px; color: ${textMuted};
  margin: 14px 0 0; letter-spacing: .04em;
  opacity: .5;
}

/* Error ring */
.pm-error-ring {
  width: 80px; height: 80px; border-radius: 50%;
  background: rgba(229,9,20,0.07);
  border: 1px solid rgba(229,9,20,0.22);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 22px;
  animation: pmPop .4s cubic-bezier(.22,1,.36,1) both;
}
@keyframes pmPop {
  from { transform:scale(.6); opacity:0; }
  to   { transform:scale(1); opacity:1; }
}

/* Spinner */
@keyframes pmSpin { to{ transform:rotate(360deg); } }
.pm-spinner {
  width: 48px; height: 48px; border-radius: 50%;
  border: 3px solid ${borderSubtle};
  border-top-color: ${accent};
  animation: pmSpin .75s linear infinite;
}
`;
}