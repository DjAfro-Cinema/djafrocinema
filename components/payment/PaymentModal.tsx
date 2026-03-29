"use client";

// components/payment/PaymentModal.tsx
import { useState, useEffect, useRef } from "react";
import {
  X, Phone, Lock, Star, Zap, Shield,
  CheckCircle, Clock, AlertCircle, Play,
  Sparkles, TrendingUp, Users,
} from "lucide-react";
import type { PaymentGuardState } from "@/hooks/Usepaymentguard";

// ─────────────────────────────────────────────────────────────────────────────
// Lottie (dynamic import to avoid SSR issues)
// ─────────────────────────────────────────────────────────────────────────────

// We use lottie-web directly, mounted after hydration
const LOCK_LOTTIE_URL =
  "https://lottie.host/9e56e2b9-41c2-4773-b5e4-4eeda21c2eba/bKlyb2oTsp.json"; // lock/unlock
const SUCCESS_LOTTIE_URL =
  "https://lottie.host/d3e91b93-0777-467c-b071-3fe3e7b5e52c/mfknWrNYkC.json"; // success checkmark

// ─────────────────────────────────────────────────────────────────────────────
// Selling copy — rotated randomly
// ─────────────────────────────────────────────────────────────────────────────

const SELLING_POINTS = [
  { Icon: Star,       text: "Unlock this movie forever — no expiry, no subscription." },
  { Icon: Zap,        text: "Pay once. Watch anytime, as many times as you want." },
  { Icon: Shield,     text: "Secure M-Pesa payment. Your money is always protected." },
  { Icon: TrendingUp, text: "Join 10,000+ Kenyans already watching DJ Afro movies." },
  { Icon: Users,      text: "Your family can watch too — one purchase, the whole household." },
  { Icon: Sparkles,   text: "Only KES 10 — cheaper than a mandazi. Seriously." },
];

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function LottiePlayer({ url, loop = true, autoplay = true, style }: {
  url: string; loop?: boolean; autoplay?: boolean; style?: React.CSSProperties;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<unknown>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    import("lottie-web").then((lottie) => {
      if (cancelled || !containerRef.current) return;
      // Destroy previous if any
      if (animRef.current) {
        (animRef.current as { destroy: () => void }).destroy();
      }
      animRef.current = lottie.default.loadAnimation({
        container: containerRef.current!,
        renderer: "svg",
        loop,
        autoplay,
        path: url,
      });
    });

    return () => {
      cancelled = true;
      if (animRef.current) {
        (animRef.current as { destroy: () => void }).destroy();
        animRef.current = null;
      }
    };
  }, [url, loop, autoplay]);

  return <div ref={containerRef} style={style} />;
}

function PhoneInput({ value, onChange, disabled }: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="pm-phone-wrap">
      <div className="pm-phone-prefix">
        <span className="pm-flag">🇰🇪</span>
        <span className="pm-prefix-code">+254</span>
      </div>
      <input
        className="pm-phone-input"
        type="tel"
        placeholder="7XX XXX XXX"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, "").slice(0, 9))}
        disabled={disabled}
        maxLength={9}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Modal
// ─────────────────────────────────────────────────────────────────────────────

interface PaymentModalProps {
  guardState: PaymentGuardState;
  userId: string;
  onSubmitPayment: (phone: string, userId: string) => void;
  onDismiss: () => void;
  onProceedToPlay: () => void;
}

export default function PaymentModal({
  guardState,
  userId,
  onSubmitPayment,
  onDismiss,
  onProceedToPlay,
}: PaymentModalProps) {
  const [phone, setPhone] = useState("");
  const [sellingIdx] = useState(() => Math.floor(Math.random() * SELLING_POINTS.length));
  const [mounted, setMounted] = useState(false);
  const [dots, setDots] = useState(".");

  const { state, movieTitle, posterUrl, error } = guardState;

  const isOpen =
    state === "locked" ||
    state === "awaiting_pin" ||
    state === "polling" ||
    state === "success" ||
    state === "failed" ||
    state === "checking";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Animated dots for loading states
  useEffect(() => {
    if (state !== "awaiting_pin" && state !== "polling") return;
    const t = setInterval(() => setDots((d) => (d.length >= 3 ? "." : d + ".")), 600);
    return () => clearInterval(t);
  }, [state]);

  // Auto-proceed 3s after success
  useEffect(() => {
    if (state !== "success") return;
    const t = setTimeout(() => onProceedToPlay(), 3200);
    return () => clearTimeout(t);
  }, [state, onProceedToPlay]);

  if (!isOpen || !mounted) return null;

  const canSubmit =
    phone.length === 9 &&
    state === "locked" &&
    (phone.startsWith("7") || phone.startsWith("1"));

  const selling = SELLING_POINTS[sellingIdx];
  const SellingIcon = selling.Icon;

  return (
    <>
      <style>{CSS}</style>

      {/* Backdrop */}
      <div
        className={`pm-backdrop${isOpen ? " pm-backdrop--in" : ""}`}
        onClick={state === "locked" || state === "failed" ? onDismiss : undefined}
      />

      {/* Modal */}
      <div className={`pm-sheet${isOpen ? " pm-sheet--in" : ""}`}>

        {/* Close */}
        {(state === "locked" || state === "failed") && (
          <button className="pm-close" onClick={onDismiss} aria-label="Close">
            <X size={16} />
          </button>
        )}

        {/* ── LOCKED: main purchase screen ── */}
        {state === "locked" && (
          <>
            {/* Movie poster strip */}
            {posterUrl && (
              <div className="pm-poster-strip">
                <img src={posterUrl} alt={movieTitle ?? ""} className="pm-poster-img" />
                <div className="pm-poster-veil" />
                <div className="pm-poster-lock">
                  <div className="pm-lock-circle">
                    <Lock size={18} color="#fff" />
                  </div>
                </div>
              </div>
            )}

            <div className="pm-body">
              {/* Badge */}
              <div className="pm-badge">
                <Zap size={10} color="#f59e0b" fill="#f59e0b" />
                <span>PREMIUM MOVIE</span>
              </div>

              <h2 className="pm-title">{movieTitle ?? "Premium Movie"}</h2>
              <p className="pm-sub">
                This movie is available for <strong className="pm-price">KES 10</strong> — unlock it forever.
              </p>

              {/* Selling point */}
              <div className="pm-sell-row">
                <SellingIcon size={13} color="#e50914" />
                <span>{selling.text}</span>
              </div>

              {/* Trust signals */}
              <div className="pm-trust-row">
                <div className="pm-trust-item">
                  <CheckCircle size={11} color="#10b981" />
                  <span>Instant unlock</span>
                </div>
                <div className="pm-trust-item">
                  <Shield size={11} color="#10b981" />
                  <span>Secure M-Pesa</span>
                </div>
                <div className="pm-trust-item">
                  <Star size={11} color="#10b981" />
                  <span>Own it forever</span>
                </div>
              </div>

              {/* Phone input */}
              <div className="pm-input-section">
                <label className="pm-label">
                  <Phone size={11} color="rgba(255,255,255,0.4)" />
                  Enter your M-Pesa number
                </label>
                <PhoneInput value={phone} onChange={setPhone} disabled={false} />
                <p className="pm-hint">
                  You will receive an M-Pesa prompt on this number to confirm KES 10.
                </p>
              </div>

              {/* CTA */}
              <button
                className={`pm-cta${canSubmit ? " pm-cta--active" : " pm-cta--disabled"}`}
                disabled={!canSubmit}
                onClick={() => canSubmit && onSubmitPayment(phone, userId)}
              >
                <Lock size={13} />
                Pay KES 10 &amp; Unlock Forever
              </button>

              <p className="pm-disclaimer">
                By paying you agree to our terms. No hidden charges. One-time payment only.
              </p>
            </div>
          </>
        )}

        {/* ── AWAITING PIN: STK push sent ── */}
        {state === "awaiting_pin" && (
          <div className="pm-body pm-body--center">
            <div className="pm-lottie-wrap">
              <LottiePlayer
                url={LOCK_LOTTIE_URL}
                loop
                autoplay
                style={{ width: 120, height: 120 }}
              />
            </div>
            <h2 className="pm-status-title">Check your phone{dots}</h2>
            <p className="pm-status-sub">
              An M-Pesa prompt has been sent to your phone.<br />
              Enter your <strong>M-Pesa PIN</strong> to complete the payment.
            </p>
            <div className="pm-mpesa-badge">
              <span className="pm-mpesa-dot" />
              Waiting for PIN confirmation
            </div>
          </div>
        )}

        {/* ── POLLING: payment processing ── */}
        {state === "polling" && (
          <div className="pm-body pm-body--center">
            <div className="pm-lottie-wrap">
              <LottiePlayer
                url={LOCK_LOTTIE_URL}
                loop
                autoplay
                style={{ width: 120, height: 120 }}
              />
            </div>
            <h2 className="pm-status-title">Confirming payment{dots}</h2>
            <p className="pm-status-sub">
              We received your PIN. Verifying with M-Pesa now.<br />
              This usually takes a few seconds — don&apos;t close this screen.
            </p>
            <div className="pm-progress-bar">
              <div className="pm-progress-fill pm-progress-fill--anim" />
            </div>
          </div>
        )}

        {/* ── SUCCESS ── */}
        {state === "success" && (
          <div className="pm-body pm-body--center">
            <div className="pm-lottie-wrap">
              <LottiePlayer
                url={SUCCESS_LOTTIE_URL}
                loop={false}
                autoplay
                style={{ width: 140, height: 140 }}
              />
            </div>
            <h2 className="pm-status-title pm-status-title--green">Payment Confirmed!</h2>
            <p className="pm-status-sub">
              You now own <strong>{movieTitle}</strong> forever.
              <br />
              Loading your movie in a moment{dots}
            </p>
            <button className="pm-cta pm-cta--active pm-cta--green" onClick={onProceedToPlay}>
              <Play size={13} fill="#fff" />
              Watch Now
            </button>
          </div>
        )}

        {/* ── FAILED ── */}
        {state === "failed" && (
          <div className="pm-body pm-body--center">
            <div className="pm-error-icon">
              <AlertCircle size={32} color="#e50914" />
            </div>
            <h2 className="pm-status-title pm-status-title--red">Payment Failed</h2>
            <p className="pm-status-sub">
              {error ?? "Something went wrong. Please try again."}
            </p>
            <button
              className="pm-cta pm-cta--active"
              onClick={() => {
                // Reset to locked so they can retry
                (guardState as unknown as { state: string }).state = "locked";
                window.location.reload();
              }}
            >
              Try Again
            </button>
            <button className="pm-ghost-btn" onClick={onDismiss}>
              Cancel
            </button>
          </div>
        )}

        {/* ── CHECKING ── */}
        {state === "checking" && (
          <div className="pm-body pm-body--center" style={{ padding: "60px 24px" }}>
            <div className="pm-spinner" />
            <p className="pm-status-sub" style={{ marginTop: 16 }}>Checking access{dots}</p>
          </div>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');

  /* ── Backdrop ── */
  .pm-backdrop {
    position: fixed; inset: 0; z-index: 9000;
    background: rgba(0,0,0,0);
    backdrop-filter: blur(0px);
    transition: background 0.3s ease, backdrop-filter 0.3s ease;
    pointer-events: none;
  }
  .pm-backdrop--in {
    background: rgba(0,0,0,0.72);
    backdrop-filter: blur(8px);
    pointer-events: all;
  }

  /* ── Sheet — bottom drawer on mobile, centered on desktop ── */
  .pm-sheet {
    position: fixed; z-index: 9001;
    background: #0d0d12;
    border: 1px solid rgba(255,255,255,0.07);
    overflow: hidden;
    transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.25s ease;

    /* Mobile: bottom sheet */
    left: 0; right: 0; bottom: 0;
    border-radius: 20px 20px 0 0;
    max-height: 92svh;
    overflow-y: auto;
    scrollbar-width: none;

    transform: translateY(100%);
    opacity: 0;
  }
  .pm-sheet::-webkit-scrollbar { display: none; }
  .pm-sheet--in {
    transform: translateY(0);
    opacity: 1;
  }

  /* Desktop: centered modal */
  @media (min-width: 640px) {
    .pm-sheet {
      left: 50%; top: 50%;
      right: auto; bottom: auto;
      width: 420px;
      max-height: 85svh;
      border-radius: 18px;
      transform: translate(-50%, -48%) scale(0.96);
    }
    .pm-sheet--in {
      transform: translate(-50%, -50%) scale(1);
    }
  }

  /* ── Close button ── */
  .pm-close {
    position: absolute; top: 14px; right: 14px; z-index: 10;
    width: 30px; height: 30px; border-radius: 50%;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.1);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: rgba(255,255,255,0.5);
    transition: background 0.14s, color 0.14s;
  }
  .pm-close:hover { background: rgba(255,255,255,0.12); color: #fff; }

  /* ── Poster strip ── */
  .pm-poster-strip {
    position: relative; width: 100%; height: 160px; overflow: hidden;
  }
  .pm-poster-img {
    width: 100%; height: 100%; object-fit: cover; object-position: center 20%;
    filter: brightness(0.55) saturate(1.2);
  }
  .pm-poster-veil {
    position: absolute; inset: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, #0d0d12 100%);
  }
  .pm-poster-lock {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
  }
  .pm-lock-circle {
    width: 52px; height: 52px; border-radius: 50%;
    background: rgba(229,9,20,0.85);
    border: 3px solid rgba(255,255,255,0.15);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 32px rgba(229,9,20,0.6);
  }

  /* ── Body ── */
  .pm-body { padding: 20px 22px 32px; }
  .pm-body--center {
    display: flex; flex-direction: column;
    align-items: center; text-align: center;
    padding: 32px 24px 40px;
  }

  /* ── Badge ── */
  .pm-badge {
    display: inline-flex; align-items: center; gap: 5px;
    background: rgba(245,158,11,0.1);
    border: 1px solid rgba(245,158,11,0.25);
    border-radius: 99px; padding: 3px 10px;
    font-family: 'Outfit', sans-serif;
    font-size: 9.5px; font-weight: 700;
    letter-spacing: 0.1em; color: #f59e0b;
    margin-bottom: 10px;
  }

  /* ── Title ── */
  .pm-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.4rem; font-weight: 800;
    color: #fff; margin: 0 0 8px;
    letter-spacing: -0.02em; line-height: 1.15;
  }
  .pm-sub {
    font-family: 'Outfit', sans-serif;
    font-size: 13px; color: rgba(255,255,255,0.45);
    margin: 0 0 16px; line-height: 1.6;
  }
  .pm-price { color: #e50914; font-weight: 700; }

  /* ── Selling row ── */
  .pm-sell-row {
    display: flex; align-items: flex-start; gap: 9px;
    background: rgba(229,9,20,0.06);
    border: 1px solid rgba(229,9,20,0.15);
    border-radius: 10px; padding: 11px 13px;
    margin-bottom: 14px;
    font-family: 'Outfit', sans-serif;
    font-size: 12.5px; color: rgba(255,255,255,0.7);
    line-height: 1.5;
  }
  .pm-sell-row svg { flex-shrink: 0; margin-top: 1px; }

  /* ── Trust signals ── */
  .pm-trust-row {
    display: flex; gap: 10px; flex-wrap: wrap;
    margin-bottom: 20px;
  }
  .pm-trust-item {
    display: flex; align-items: center; gap: 5px;
    font-family: 'Outfit', sans-serif;
    font-size: 10.5px; color: rgba(255,255,255,0.35);
  }

  /* ── Input ── */
  .pm-input-section { margin-bottom: 16px; }
  .pm-label {
    display: flex; align-items: center; gap: 6px;
    font-family: 'Outfit', sans-serif;
    font-size: 11px; font-weight: 600;
    color: rgba(255,255,255,0.35);
    letter-spacing: 0.06em; text-transform: uppercase;
    margin-bottom: 9px;
  }
  .pm-phone-wrap {
    display: flex; align-items: center;
    background: rgba(255,255,255,0.05);
    border: 1.5px solid rgba(255,255,255,0.1);
    border-radius: 12px; overflow: hidden;
    transition: border-color 0.15s;
  }
  .pm-phone-wrap:focus-within {
    border-color: rgba(229,9,20,0.5);
    background: rgba(229,9,20,0.03);
  }
  .pm-phone-prefix {
    display: flex; align-items: center; gap: 6px;
    padding: 0 12px;
    border-right: 1px solid rgba(255,255,255,0.07);
    height: 48px; flex-shrink: 0;
  }
  .pm-flag { font-size: 16px; }
  .pm-prefix-code {
    font-family: 'Outfit', sans-serif;
    font-size: 13px; font-weight: 600;
    color: rgba(255,255,255,0.55);
  }
  .pm-phone-input {
    flex: 1; height: 48px; padding: 0 14px;
    background: transparent; border: none; outline: none;
    font-family: 'Outfit', sans-serif;
    font-size: 16px; font-weight: 500;
    color: #fff; letter-spacing: 0.04em;
  }
  .pm-phone-input::placeholder { color: rgba(255,255,255,0.2); }
  .pm-phone-input:disabled { opacity: 0.4; cursor: not-allowed; }
  .pm-hint {
    font-family: 'Outfit', sans-serif;
    font-size: 10.5px; color: rgba(255,255,255,0.2);
    margin: 7px 0 0; line-height: 1.55;
  }

  /* ── CTA button ── */
  .pm-cta {
    width: 100%; height: 50px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    font-family: 'Outfit', sans-serif;
    font-size: 14px; font-weight: 700;
    letter-spacing: 0.02em;
    border: none; cursor: pointer;
    transition: transform 0.14s, box-shadow 0.14s, background 0.14s;
    margin-bottom: 10px;
  }
  .pm-cta--active {
    background: #e50914; color: #fff;
    box-shadow: 0 4px 24px rgba(229,9,20,0.45);
  }
  .pm-cta--active:hover {
    background: #ff1f2b; transform: translateY(-1px);
    box-shadow: 0 6px 28px rgba(229,9,20,0.55);
  }
  .pm-cta--active:active { transform: scale(0.98); }
  .pm-cta--disabled {
    background: rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.2); cursor: not-allowed;
  }
  .pm-cta--green {
    background: #10b981 !important;
    box-shadow: 0 4px 24px rgba(16,185,129,0.35) !important;
  }
  .pm-cta--green:hover { background: #059669 !important; }

  .pm-ghost-btn {
    width: 100%; height: 42px; border-radius: 10px;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.35);
    font-family: 'Outfit', sans-serif;
    font-size: 13px; cursor: pointer;
    transition: background 0.14s, color 0.14s;
  }
  .pm-ghost-btn:hover { background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.6); }

  .pm-disclaimer {
    font-family: 'Outfit', sans-serif;
    font-size: 10px; color: rgba(255,255,255,0.15);
    text-align: center; margin: 0; line-height: 1.6;
  }

  /* ── Status screens ── */
  .pm-lottie-wrap { margin-bottom: 16px; }
  .pm-status-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.25rem; font-weight: 800;
    color: #fff; margin: 0 0 10px; letter-spacing: -0.02em;
  }
  .pm-status-title--green { color: #10b981; }
  .pm-status-title--red { color: #e50914; }
  .pm-status-sub {
    font-family: 'Outfit', sans-serif;
    font-size: 13px; color: rgba(255,255,255,0.4);
    line-height: 1.65; margin: 0 0 22px;
  }

  .pm-mpesa-badge {
    display: flex; align-items: center; gap: 8px;
    background: rgba(16,185,129,0.08);
    border: 1px solid rgba(16,185,129,0.2);
    border-radius: 99px; padding: 7px 16px;
    font-family: 'Outfit', sans-serif;
    font-size: 11px; font-weight: 600;
    color: #10b981;
  }
  .pm-mpesa-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #10b981;
    animation: pulse-dot 1.2s ease-in-out infinite;
  }
  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.7); }
  }

  /* Progress bar */
  .pm-progress-bar {
    width: 100%; height: 3px; border-radius: 99px;
    background: rgba(255,255,255,0.06);
    overflow: hidden; margin-top: 4px;
  }
  @keyframes progress-slide {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(200%); }
  }
  .pm-progress-fill {
    height: 100%; width: 40%;
    background: linear-gradient(90deg, transparent, #e50914, transparent);
    border-radius: 99px;
  }
  .pm-progress-fill--anim {
    animation: progress-slide 1.6s ease-in-out infinite;
  }

  /* Error icon */
  .pm-error-icon {
    width: 70px; height: 70px; border-radius: 50%;
    background: rgba(229,9,20,0.08);
    border: 1px solid rgba(229,9,20,0.2);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 16px;
  }

  /* Spinner */
  @keyframes spin { to { transform: rotate(360deg); } }
  .pm-spinner {
    width: 40px; height: 40px; border-radius: 50%;
    border: 3px solid rgba(255,255,255,0.06);
    border-top-color: #e50914;
    animation: spin 0.75s linear infinite;
  }
`;