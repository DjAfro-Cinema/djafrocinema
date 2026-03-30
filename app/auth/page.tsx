"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";

// ── BG IMAGES cycling on the visual panel ──────────────────────────────────
const BG_IMAGES = [
  "/images/login1.jpg",
  "/images/login2.jpg",
  "/images/login3.jpg",
  "/images/login4.jpg",
  "/images/login5.jpg",
  "/images/login6.jpg",
];

// ── QUOTES cycling on visual panel ─────────────────────────────────────────
const TAGLINES = [
  { line: "The best stories", sub: "are dubbed for you." },
  { line: "Enjoy DjAfro Movies", sub: "available on all devices." },
  { line: "500+ movies.", sub: "DjAfro movies. All yours." },
];

const LOTTIE_SUCCESS = "https://assets10.lottiefiles.com/packages/lf20_jbrw3hcz.json";
const LOTTIE_ERROR   = "https://assets4.lottiefiles.com/packages/lf20_qpwbiyxf.json";

// ── Sub-modes for the form panel ───────────────────────────────────────────
type FormMode =
  | "default"
  | "forgot"
  | "otp-email"
  | "otp-verify";

export default function AuthPage() {
  const router = useRouter();
  const {
    user,
    loading: authLoading,
    error,
    success,
    login,
    signup,
    otpUserId,
    otpEmail,
    sendEmailOTP,
    verifyEmailOTP,
    resetOTP,
    sendPasswordReset,
    clearMessages,
  } = useAuth();

  const [tab, setTab]           = useState<"login" | "signup">("login");
  const [mode, setMode]         = useState<FormMode>("default");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");
  const [loading, setLoading]   = useState(false);
  const [bgIdx, setBgIdx]       = useState(0);
  const [nextBgIdx, setNextBgIdx] = useState(1);
  const [tagIdx, setTagIdx]     = useState(0);
  const [showPass, setShowPass] = useState(false);
  const [mounted, setMounted]   = useState(false);
  const [imagesReady, setImagesReady] = useState(false);

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState("");

  // OTP
  const [otpInputEmail, setOtpInputEmail] = useState("");
  const [otpCode, setOtpCode]             = useState("");

  // Lottie refs
  const successLottieRef  = useRef<HTMLDivElement>(null);
  const errorLottieRef    = useRef<HTMLDivElement>(null);
  const lottieSuccessInst = useRef<{ destroy: () => void } | null>(null);
  const lottieErrorInst   = useRef<{ destroy: () => void } | null>(null);

  // ── Preload all images eagerly on mount ─────────────────────────────────
  useEffect(() => {
    let loaded = 0;
    const total = BG_IMAGES.length;
    BG_IMAGES.forEach((src) => {
      const img = new window.Image();
      img.src = src;
      img.onload = img.onerror = () => {
        loaded++;
        if (loaded === total) setImagesReady(true);
      };
    });
    // Show UI after short delay even if images are slow
    const fallback = setTimeout(() => setImagesReady(true), 800);
    return () => clearTimeout(fallback);
  }, []);

  // ── Redirect if already logged in ──────────────────────────────────────
  useEffect(() => {
    if (user && !authLoading) router.replace("/dashboard");
  }, [user, authLoading, router]);

  // ── Mount animation ─────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  // ── Cycle backgrounds — pre-stage next image ────────────────────────────
  useEffect(() => {
    const t = setInterval(() => {
      setBgIdx((i) => {
        const next = (i + 1) % BG_IMAGES.length;
        setNextBgIdx((next + 1) % BG_IMAGES.length);
        return next;
      });
      setTagIdx((i) => (i + 1) % TAGLINES.length);
    }, 6000);
    return () => clearInterval(t);
  }, []);

  // ── Lottie helpers ──────────────────────────────────────────────────────
  const playSuccessLottie = useCallback(async () => {
    if (!successLottieRef.current) return;
    try {
      const lottie = await import("lottie-web");
      lottieSuccessInst.current?.destroy();
      lottieSuccessInst.current = lottie.default.loadAnimation({
        container: successLottieRef.current,
        renderer: "svg", loop: false, autoplay: true, path: LOTTIE_SUCCESS,
      });
    } catch { /* silent */ }
  }, []);

  const playErrorLottie = useCallback(async () => {
    if (!errorLottieRef.current) return;
    try {
      const lottie = await import("lottie-web");
      lottieErrorInst.current?.destroy();
      lottieErrorInst.current = lottie.default.loadAnimation({
        container: errorLottieRef.current,
        renderer: "svg", loop: false, autoplay: true, path: LOTTIE_ERROR,
      });
    } catch { /* silent */ }
  }, []);

  // ── React to success / error ────────────────────────────────────────────
  useEffect(() => {
    if (success) {
      playSuccessLottie();
      if (!success.toLowerCase().includes("sent") && !success.toLowerCase().includes("check")) {
        const t = setTimeout(() => { clearMessages(); router.replace("/dashboard"); }, 2000);
        return () => clearTimeout(t);
      }
    }
  }, [success, playSuccessLottie, clearMessages, router]);

  useEffect(() => {
    if (error) {
      playErrorLottie();
      const t = setTimeout(() => clearMessages(), 5000);
      return () => clearTimeout(t);
    }
  }, [error, playErrorLottie, clearMessages]);

  // ── Sync OTP step ───────────────────────────────────────────────────────
  useEffect(() => {
    if (otpUserId && mode === "otp-email") {
      setMode("otp-verify");
    }
  }, [otpUserId, mode]);

  // ── Cleanup lottie ──────────────────────────────────────────────────────
  useEffect(() => {
    return () => { lottieSuccessInst.current?.destroy(); lottieErrorInst.current?.destroy(); };
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      if (tab === "login") {
        await login(email, password);
      } else {
        await signup(email, password, name);
      }
    } catch { /* errors handled in context */ } finally { setLoading(false); }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setLoading(true);
    try { await sendPasswordReset(forgotEmail); } catch { /* handled */ } finally { setLoading(false); }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInputEmail) return;
    setLoading(true);
    try { await sendEmailOTP(otpInputEmail); } catch { /* handled */ } finally { setLoading(false); }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) return;
    setLoading(true);
    try { await verifyEmailOTP(otpCode); } catch { /* handled */ } finally { setLoading(false); }
  };

  const goBack = () => {
    setMode("default");
    resetOTP();
    clearMessages();
    setForgotEmail("");
    setOtpInputEmail("");
    setOtpCode("");
  };

  const tagline   = TAGLINES[tagIdx];
  const isLoading = loading || authLoading;

  // ── Shared toast block ──────────────────────────────────────────────────
  const Toast = () => (
    <>
      {success && (
        <div className="auth-toast success">
          <div className="auth-toast-lottie" ref={successLottieRef} />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="auth-toast error">
          <div className="auth-toast-lottie-error" ref={errorLottieRef} />
          <span>{error}</span>
        </div>
      )}
    </>
  );

  // ── Back button ─────────────────────────────────────────────────────────
  const BackBtn = ({ label = "Back to Sign In" }: { label?: string }) => (
    <button className="auth-back-btn" onClick={goBack}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M19 12H5M12 5l-7 7 7 7"/>
      </svg>
      {label}
    </button>
  );

  return (
    <>
      {/* Preload next image in the background — invisible, no layout cost */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={BG_IMAGES[nextBgIdx]}
        alt=""
        aria-hidden
        style={{ position: "fixed", width: 1, height: 1, opacity: 0, pointerEvents: "none", top: 0, left: 0 }}
      />

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --red: #e50914; --red-dim: rgba(229,9,20,0.15); --red-glow: rgba(229,9,20,0.35);
          --green: #25d366; --bg: #060608; --surface: rgba(12,12,16,0.82);
          --border: rgba(255,255,255,0.07); --border-focus: rgba(229,9,20,0.55);
          --text: #ffffff; --text-muted: rgba(255,255,255,0.38); --text-dim: rgba(255,255,255,0.60);
          --font-body: 'Outfit', system-ui, sans-serif;
          --ease-out: cubic-bezier(0.22,1,0.36,1); --ease-in-out: cubic-bezier(0.4,0,0.2,1);
        }
        html, body { height: 100%; background: var(--bg); }

        /* ── PAGE LAYOUT ── */
        .auth-page {
          font-family: var(--font-body);
          min-height: 100svh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: var(--bg);
          position: relative;
          overflow: hidden;
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        .auth-page.mounted { opacity: 1; }

        /* ── VISUAL PANEL ── */
        .auth-visual {
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }
        .auth-img-stack {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .auth-img-layer {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          will-change: opacity;
          transition: opacity 1.2s var(--ease-out);
        }
        /* Skeleton shimmer before images load */
        .auth-img-skeleton {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #0c0c10 0%, #141418 50%, #0c0c10 100%);
          background-size: 200% 200%;
          animation: shimmer 2s ease infinite;
          z-index: 0;
          transition: opacity 0.5s ease;
        }
        .auth-img-skeleton.hidden { opacity: 0; pointer-events: none; }
        @keyframes shimmer {
          0% { background-position: 0% 0%; }
          50% { background-position: 100% 100%; }
          100% { background-position: 0% 0%; }
        }

        /* Overlays */
        .auth-visual-ov1 { position: absolute; inset: 0; z-index: 1; background: linear-gradient(135deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.40) 60%, rgba(0,0,0,0.15) 100%); }
        .auth-visual-ov2 { position: absolute; inset: 0; z-index: 1; background: linear-gradient(to top, rgba(6,6,8,1) 0%, rgba(6,6,8,0.65) 20%, transparent 55%); }
        .auth-visual-ov3 { position: absolute; inset: 0; z-index: 1; background: linear-gradient(to right, rgba(6,6,8,0.0) 75%, rgba(6,6,8,0.98) 100%); }
        .auth-visual-accent { position: absolute; inset: 0; z-index: 1; background: radial-gradient(ellipse 70% 55% at 30% 70%, rgba(229,9,20,0.10) 0%, transparent 70%); }
        .auth-grain { position: absolute; inset: 0; z-index: 2; opacity: 0.03; mix-blend-mode: overlay; pointer-events: none; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); background-size: 180px; }

        /* Logo */
        .auth-visual-logo {
          position: absolute; top: 36px; left: 36px; z-index: 5;
          display: flex; align-items: center;
          width: 200px; height: 54px;
          opacity: 0; transition: opacity 0.5s ease 0.05s;
        }
        .auth-page.mounted .auth-visual-logo { opacity: 1; }

        /* Progress pips */
        .auth-visual-pips {
          position: absolute; top: 50%; right: 20px;
          transform: translateY(-50%);
          z-index: 6; display: flex; flex-direction: column;
          gap: 6px; align-items: center;
        }
        .auth-pip { width: 3px; border-radius: 99px; background: rgba(255,255,255,0.18); transition: all 0.4s var(--ease-out); }
        .auth-pip.active { background: var(--red); box-shadow: 0 0 8px var(--red); }

        /* Visual content */
        .auth-visual-content {
          position: relative; z-index: 5; padding: 0 40px 48px;
          opacity: 0; transform: translateY(20px);
          transition: opacity 0.75s var(--ease-out) 0.1s, transform 0.75s var(--ease-out) 0.1s;
        }
        .auth-page.mounted .auth-visual-content { opacity: 1; transform: translateY(0); }
        .auth-visual-tag { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 16px; font-size: 9px; font-weight: 600; letter-spacing: 0.42em; text-transform: uppercase; color: var(--red); }
        .auth-visual-tag-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--red); box-shadow: 0 0 8px var(--red); animation: pulse-dot 2s ease-in-out infinite; }
        @keyframes pulse-dot { 0%,100% { opacity:1; transform: scale(1); } 50% { opacity:0.5; transform: scale(0.65); } }
        .auth-visual-headline { font-family: var(--font-display, 'Bebas Neue', sans-serif); font-size: clamp(2.8rem, 4.5vw, 4.2rem); color: #fff; letter-spacing: 0.04em; line-height: 0.90; margin-bottom: 10px; }
        .auth-visual-headline em { font-style: normal; color: transparent; -webkit-text-stroke: 1px rgba(255,255,255,0.35); }
        .auth-visual-sub { font-size: 13px; color: rgba(255,255,255,0.42); letter-spacing: 0.04em; }
        .auth-stats { display: flex; gap: 0; margin-top: 28px; border-top: 1px solid rgba(255,255,255,0.07); padding-top: 20px; }
        .auth-stat { flex: 1; padding-right: 20px; border-right: 1px solid rgba(255,255,255,0.06); margin-right: 20px; }
        .auth-stat:last-child { border-right: none; margin-right: 0; }
        .auth-stat-n { font-family: var(--font-display, 'Bebas Neue', sans-serif); font-size: 1.6rem; color: #fff; letter-spacing: 0.06em; line-height: 1; }
        .auth-stat-l { font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(255,255,255,0.25); margin-top: 3px; }

        /* ── FORM PANEL ── */
        .auth-form-panel {
          display: flex; flex-direction: column; justify-content: center; align-items: center;
          padding: 48px 40px; position: relative; background: var(--bg); overflow-y: auto;
        }
        .auth-form-ambient { position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent 0%, var(--red) 50%, transparent 100%); opacity: 0.45; }
        .auth-form-inner {
          width: 100%; max-width: 380px;
          opacity: 0; transform: translateY(24px);
          transition: opacity 0.65s var(--ease-out) 0.15s, transform 0.65s var(--ease-out) 0.15s;
        }
        .auth-page.mounted .auth-form-inner { opacity: 1; transform: translateY(0); }

        /* Tabs */
        .auth-tabs { display: flex; gap: 0; margin-bottom: 36px; position: relative; }
        .auth-tab { flex: 1; background: none; border: none; cursor: pointer; padding: 14px 0; font-family: var(--font-body); font-size: 10.5px; font-weight: 600; letter-spacing: 0.35em; text-transform: uppercase; color: var(--text-muted); border-bottom: 1px solid rgba(255,255,255,0.07); transition: color 0.25s; position: relative; }
        .auth-tab.active { color: var(--text); }
        .auth-tab-indicator { position: absolute; bottom: -1px; height: 2px; background: var(--red); box-shadow: 0 0 10px var(--red); transition: left 0.35s var(--ease-out), width 0.35s var(--ease-out); border-radius: 99px; }

        /* Heading */
        .auth-heading { margin-bottom: 28px; }
        .auth-heading-title { font-family: var(--font-display, 'Bebas Neue', sans-serif); font-size: clamp(2.4rem, 4vw, 3.2rem); color: #fff; letter-spacing: 0.05em; line-height: 0.88; margin-bottom: 8px; }
        .auth-heading-sub { font-family: var(--font-body); font-size: 12.5px; color: var(--text-muted); line-height: 1.5; }
        .auth-heading-sub strong { color: crimson; font-weight: 500; }

        /* OTP button */
        .auth-otp-btn { font-family: var(--font-body); display: flex; align-items: center; justify-content: center; gap: 12px; width: 100%; padding: 14px 20px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.10); background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.80); font-size: 13px; font-weight: 500; cursor: pointer; transition: background 0.2s, border-color 0.2s, color 0.2s; }
        .auth-otp-btn:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.20); color: #fff; }
        .auth-otp-btn:active { transform: scale(0.985); }
        .auth-otp-btn:disabled { opacity: 0.5; cursor: wait; }

        /* Divider */
        .auth-divider { display: flex; align-items: center; gap: 14px; margin: 20px 0; }
        .auth-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
        .auth-divider-text { font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(255,255,255,0.2); }

        /* Form fields */
        .auth-form { display: flex; flex-direction: column; gap: 14px; }
        .auth-field { display: flex; flex-direction: column; gap: 6px; }
        .auth-label { font-size: 9.5px; font-weight: 600; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(255,255,255,0.35); }
        .auth-input-wrap { position: relative; }
        .auth-input { width: 100%; padding: 13px 16px; border-radius: 6px; border: 1px solid var(--border); background: rgba(255,255,255,0.03); color: #fff; font-family: var(--font-body); font-size: 14px; outline: none; transition: border-color 0.22s, background 0.22s, box-shadow 0.22s; }
        .auth-input::placeholder { color: rgba(255,255,255,0.18); }
        .auth-input:focus { border-color: var(--border-focus); background: rgba(229,9,20,0.04); box-shadow: 0 0 0 3px rgba(229,9,20,0.08); }
        .auth-input-otp { text-align: center; font-size: 22px; letter-spacing: 0.5em; padding: 14px 16px; }
        .auth-input-icon { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.22); display: flex; align-items: center; cursor: pointer; background: none; border: none; }
        .auth-input-icon:hover { color: rgba(255,255,255,0.55); }

        /* Submit */
        .auth-submit { position: relative; overflow: hidden; width: 100%; padding: 15px 20px; border-radius: 6px; border: none; background: var(--red); color: #fff; font-family: var(--font-body); font-size: 10.5px; font-weight: 700; letter-spacing: 0.32em; text-transform: uppercase; cursor: pointer; margin-top: 6px; transition: box-shadow 0.25s, transform 0.15s; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .auth-submit:hover { box-shadow: 0 0 36px rgba(229,9,20,0.55), 0 4px 20px rgba(0,0,0,0.5); }
        .auth-submit:active { transform: scale(0.98); }
        .auth-submit:disabled { opacity: 0.6; cursor: wait; }
        .auth-submit-shimmer { position: absolute; inset: 0; background: linear-gradient(108deg, transparent 30%, rgba(255,255,255,0.22) 50%, transparent 70%); transform: translateX(-120%); transition: transform 0.6s ease; pointer-events: none; }
        .auth-submit:hover .auth-submit-shimmer { transform: translateX(120%); }
        .auth-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Forgot */
        .auth-forgot { text-align: right; margin-top: -4px; }
        .auth-forgot a { font-size: 11px; color: var(--text-muted); text-decoration: none; transition: color 0.2s; cursor: pointer; }
        .auth-forgot a:hover { color: var(--red); }

        /* Footer */
        .auth-footer-note { margin-top: 22px; text-align: center; font-size: 11px; color: var(--text-muted); line-height: 1.6; }
        .auth-footer-note a { color: var(--red); text-decoration: none; cursor: pointer; }
        .auth-footer-note a:hover { text-decoration: underline; }
        .auth-legal { margin-top: 28px; font-size: 9.5px; color: rgba(255,255,255,0.15); text-align: center; line-height: 1.6; letter-spacing: 0.02em; }
        .auth-legal a { color: rgba(255,255,255,0.25); text-decoration: none; }

        /* Animations */
        .auth-form-fields { animation: formFade 0.38s var(--ease-out); }
        .auth-forgot-panel, .auth-otp-panel { animation: formFade 0.38s var(--ease-out); }
        @keyframes formFade { from { opacity: 0; transform: translateX(8px); } to { opacity: 1; transform: translateX(0); } }

        /* Toast */
        .auth-toast { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 8px; font-size: 12.5px; line-height: 1.45; margin-bottom: 16px; animation: toastIn 0.35s var(--ease-out); }
        @keyframes toastIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .auth-toast.success { background: rgba(37,211,102,0.10); border: 1px solid rgba(37,211,102,0.25); color: #25d366; }
        .auth-toast.error { background: rgba(229,9,20,0.10); border: 1px solid rgba(229,9,20,0.25); color: #ff6b6b; }
        .auth-toast-lottie { width: 36px; height: 36px; flex-shrink: 0; }
        .auth-toast-lottie-error { width: 36px; height: 36px; flex-shrink: 0; }

        /* Back button */
        .auth-back-btn { background: none; border: none; color: rgba(255,255,255,0.35); font-size: 11px; cursor: pointer; display: flex; align-items: center; gap: 6px; margin-bottom: 20px; padding: 0; font-family: var(--font-body); letter-spacing: 0.02em; transition: color 0.2s; }
        .auth-back-btn:hover { color: rgba(255,255,255,0.7); }

        /* OTP resend */
        .auth-otp-resend { margin-top: 12px; text-align: center; font-size: 11px; color: var(--text-muted); }
        .auth-otp-resend a { color: var(--red); cursor: pointer; text-decoration: none; }
        .auth-otp-resend a:hover { text-decoration: underline; }

        /* ════════════════════════════════════════
           MOBILE STYLES
        ════════════════════════════════════════ */
        @media (max-width: 768px) {
          .auth-page {
            grid-template-columns: 1fr;
            grid-template-rows: auto 1fr;
            min-height: 100svh;
          }

          /* Visual panel — compact but not cramped */
          .auth-visual {
            height: 300px;
            flex-shrink: 0;
            /* No bottom rounding — form panel's top rounding creates the effect */
          }

          /* Hide right-edge fade (no adjacent column on mobile) */
          .auth-visual-ov3 { display: none; }
          .auth-visual-pips { right: 12px; }
          .auth-visual-logo { top: 18px; left: 18px; width: 160px; height: 44px; }
          .auth-visual-content { padding: 0 20px 24px; }
          .auth-visual-headline { font-size: clamp(1.8rem, 7vw, 2.4rem); }
          .auth-visual-sub { font-size: 11.5px; }
          .auth-stats { display: none; }
          .auth-visual-tag { font-size: 8px; }

          /* Form panel — rounded top corners, sits flush below visual */
          .auth-form-panel {
            padding: 32px 20px 48px;
            justify-content: flex-start;
            border-radius: 40px 40px 0 0;
            margin-top: -20px; /* overlap the visual slightly */
            position: relative;
            z-index: 10;
            background: var(--bg);
            /* Subtle top border glow */
            box-shadow: 0 -1px 0 rgba(229,9,20,0.3), 0 -24px 48px rgba(6,6,8,0.9);
          }
          .auth-form-ambient { border-radius: 20px 20px 0 0; }
          .auth-form-inner { max-width: 100%; }

          /* Heading — slightly smaller on mobile but still bold */
          .auth-heading-title { font-size: clamp(2rem, 9vw, 2.8rem); }
        }

        @media (max-width: 420px) {
          .auth-visual { height: 260px; }
          .auth-form-panel { padding: 28px 18px 44px; }
          .auth-heading-title { font-size: clamp(1.8rem, 8.5vw, 2.5rem); }
        }
      `}</style>

      <div className={`auth-page${mounted ? " mounted" : ""}`}>

        {/* ══ VISUAL PANEL — LEFT / TOP ══ */}
        <div className="auth-visual">
          {/* Skeleton shimmer while images load */}
          <div className={`auth-img-skeleton${imagesReady ? " hidden" : ""}`} />

          {/* Cycling background images — both login and signup use images (no video) */}
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

          <div className="auth-visual-ov1" />
          <div className="auth-visual-ov2" />
          <div className="auth-visual-ov3" />
          <div className="auth-visual-accent" />
          <div className="auth-grain" />

          {/* Logo — Next/Image with fill inside positioned container */}
          <div className="auth-visual-logo">
            <Image
              src="/logo.png"
              alt="DjAfro Cinema"
              fill
              priority
              sizes="200px"
              className="object-contain object-left"
              style={{
                filter: "drop-shadow(0 0 12px rgba(229,9,20,0.6)) drop-shadow(0 0 24px rgba(229,9,20,0.3))",
              }}
            />
          </div>

          {/* Slide indicator pips */}
          <div className="auth-visual-pips">
            {BG_IMAGES.map((_, i) => (
              <div
                key={i}
                className={`auth-pip${i === bgIdx ? " active" : ""}`}
                style={{ height: i === bgIdx ? 28 : 6 }}
              />
            ))}
          </div>

          <div className="auth-visual-content">
            <div className="auth-visual-tag">
              <span className="auth-visual-tag-dot" />
              DjAfro Cinema
            </div>
            <h2 className="auth-visual-headline">
              {tagline.line}<br /><em>{tagline.sub}</em>
            </h2>
            <p className="auth-visual-sub">The Best #1 DjAfro cinema platform.</p>
            <div className="auth-stats">
              {[{ n: "500+", l: "Movies Dubbed" }, { n: "10K+", l: "Fans & Growing" }, { n: "Free", l: "to Start" }].map((s) => (
                <div key={s.l} className="auth-stat">
                  <div className="auth-stat-n">{s.n}</div>
                  <div className="auth-stat-l">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ FORM PANEL — RIGHT / BOTTOM ══ */}
        <div className="auth-form-panel">
          <div className="auth-form-ambient" />
          <div className="auth-form-inner">

            {/* ══ FORGOT PASSWORD MODE ══ */}
            {mode === "forgot" && (
              <div className="auth-forgot-panel">
                <BackBtn />
                <div className="auth-heading">
                  <div className="auth-heading-title">Reset<br />Password.</div>
                  <div className="auth-heading-sub">Enter your email and we&apos;ll <strong>send a reset link.</strong></div>
                </div>
                <Toast />
                <form className="auth-form" onSubmit={handleForgot}>
                  <div className="auth-field">
                    <label className="auth-label">Email</label>
                    <div className="auth-input-wrap">
                      <input className="auth-input" type="email" placeholder="you@email.com"
                        value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} autoComplete="email" required />
                    </div>
                  </div>
                  <button type="submit" className="auth-submit" disabled={isLoading}>
                    <span className="auth-submit-shimmer" />
                    {isLoading ? <span className="auth-spinner" /> : "Send Reset Link"}
                  </button>
                </form>
                <div className="auth-footer-note">
                  No password?{" "}
                  <a onClick={(e) => { e.preventDefault(); setMode("otp-email"); clearMessages(); }}>
                    Sign in with email code instead →
                  </a>
                </div>
              </div>
            )}

            {/* ══ OTP — ENTER EMAIL ══ */}
            {mode === "otp-email" && (
              <div className="auth-otp-panel">
                <BackBtn label="Back to Sign In" />
                <div className="auth-heading">
                  <div className="auth-heading-title">Email<br />Code.</div>
                  <div className="auth-heading-sub">We&apos;ll send a <strong>6-digit code</strong> to your email. No password needed.</div>
                </div>
                <Toast />
                <form className="auth-form" onSubmit={handleSendOTP}>
                  <div className="auth-field">
                    <label className="auth-label">Your Email</label>
                    <div className="auth-input-wrap">
                      <input className="auth-input" type="email" placeholder="you@email.com"
                        value={otpInputEmail} onChange={(e) => setOtpInputEmail(e.target.value)} autoComplete="email" required />
                    </div>
                  </div>
                  <button type="submit" className="auth-submit" disabled={isLoading}>
                    <span className="auth-submit-shimmer" />
                    {isLoading ? <span className="auth-spinner" /> : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 19-7z"/>
                        </svg>
                        Send Code
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* ══ OTP — ENTER CODE ══ */}
            {mode === "otp-verify" && (
              <div className="auth-otp-panel">
                <BackBtn label="Use different email" />
                <div className="auth-heading">
                  <div className="auth-heading-title">Enter<br />Code.</div>
                  <div className="auth-heading-sub">
                    Code sent to <strong>{otpEmail}</strong>. Check your inbox (and spam).
                  </div>
                </div>
                <Toast />
                <form className="auth-form" onSubmit={handleVerifyOTP}>
                  <div className="auth-field">
                    <label className="auth-label">6-Digit Code</label>
                    <div className="auth-input-wrap">
                      <input
                        className="auth-input auth-input-otp"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        placeholder="——————"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        autoComplete="one-time-code"
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="auth-submit" disabled={isLoading || otpCode.length < 6}>
                    <span className="auth-submit-shimmer" />
                    {isLoading ? <span className="auth-spinner" /> : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                        Verify & Watch
                      </>
                    )}
                  </button>
                </form>
                <div className="auth-otp-resend">
                  Didn&apos;t receive it?{" "}
                  <a onClick={(e) => { e.preventDefault(); resetOTP(); setMode("otp-email"); setOtpCode(""); }}>
                    Resend code
                  </a>
                </div>
              </div>
            )}

            {/* ══ DEFAULT MODE — email+password tabs ══ */}
            {mode === "default" && (
              <>
                <div className="auth-tabs">
                  <button
                    className={`auth-tab${tab === "login" ? " active" : ""}`}
                    onClick={() => { setTab("login"); clearMessages(); }}
                  >
                    Sign In
                  </button>
                  <button
                    className={`auth-tab${tab === "signup" ? " active" : ""}`}
                    onClick={() => { setTab("signup"); clearMessages(); }}
                  >
                    Create Account
                  </button>
                  <div className="auth-tab-indicator" style={{ left: tab === "login" ? "0%" : "50%", width: "50%" }} />
                </div>

                <div className="auth-heading">
                  {tab === "login" ? (
                    <>
                      <div className="auth-heading-title">Welcome<br />Back.</div>
                      <div className="auth-heading-sub">Your movies are waiting. <strong>Sign in to continue.</strong></div>
                    </>
                  ) : (
                    <>
                      <div className="auth-heading-title">Join the<br />Cinema.</div>
                      <div className="auth-heading-sub">Create your account in seconds. <strong>No credit card required.</strong></div>
                    </>
                  )}
                </div>

                <Toast />

                <button
                  className="auth-otp-btn"
                  onClick={() => { clearMessages(); setMode("otp-email"); }}
                  disabled={isLoading}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  {tab === "login" ? "Sign in with Email Code" : "Sign up with Email Code"}
                </button>

                <div className="auth-divider">
                  <div className="auth-divider-line" />
                  <span className="auth-divider-text">or use password</span>
                  <div className="auth-divider-line" />
                </div>

                <div key={tab} className="auth-form-fields">
                  <form className="auth-form" onSubmit={handleSubmit}>

                    {tab === "signup" && (
                      <div className="auth-field">
                        <label className="auth-label">Your Name</label>
                        <div className="auth-input-wrap">
                          <input className="auth-input" type="text" placeholder="e.g. Wanjiku"
                            value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
                        </div>
                      </div>
                    )}

                    <div className="auth-field">
                      <label className="auth-label">Email</label>
                      <div className="auth-input-wrap">
                        <input className="auth-input" type="email" placeholder="you@email.com"
                          value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
                      </div>
                    </div>

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
                        <button type="button" className="auth-input-icon" onClick={() => setShowPass((v) => !v)} tabIndex={-1}>
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

                    {tab === "login" && (
                      <div className="auth-forgot">
                        <a onClick={(e) => { e.preventDefault(); setMode("forgot"); clearMessages(); }}>
                          Forgot password?
                        </a>
                      </div>
                    )}

                    <button type="submit" className="auth-submit" disabled={isLoading}>
                      <span className="auth-submit-shimmer" />
                      {isLoading ? <span className="auth-spinner" /> : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                          {tab === "login" ? "Sign In & Watch" : "Create Account"}
                        </>
                      )}
                    </button>
                  </form>

                  <div className="auth-footer-note">
                    {tab === "login" ? (
                      <>New here?{" "}<a onClick={(e) => { e.preventDefault(); setTab("signup"); clearMessages(); }}>Create a free account →</a></>
                    ) : (
                      <>Already have an account?{" "}<a onClick={(e) => { e.preventDefault(); setTab("login"); clearMessages(); }}>Sign in →</a></>
                    )}
                  </div>

                  <div className="auth-legal">
                    By continuing you agree to our{" "}
                    <a href="#">Terms of Service</a> &amp; <a href="#">Privacy Policy</a>.
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
}