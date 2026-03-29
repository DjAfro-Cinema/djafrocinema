"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/auth.service";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Completing sign-in…");

  useEffect(() => {
    // Load lottie-web dynamically (no SSR issues)
    let lottieInstance: { destroy: () => void } | null = null;

    async function init() {
      // Check for OAuth error param
      const oauthError = searchParams.get("error");
      if (oauthError) {
        setStatus("error");
        setMessage("Google sign-in was cancelled or failed. Please try again.");
        loadLottie("error");
        setTimeout(() => router.replace("/auth"), 3000);
        return;
      }

      // Try to get the user (Appwrite sets the session cookie automatically)
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          setStatus("success");
          setMessage(`Welcome${user.name ? `, ${user.name}` : ""}! 🎬`);
          loadLottie("success");
          setTimeout(() => router.replace("/dashboard"), 2200);
        } else {
          throw new Error("No session found after OAuth.");
        }
      } catch {
        setStatus("error");
        setMessage("Authentication failed. Redirecting you back…");
        loadLottie("error");
        setTimeout(() => router.replace("/auth"), 3000);
      }
    }

    async function loadLottie(type: "success" | "error") {
      if (!containerRef.current) return;
      try {
        const lottie = await import("lottie-web");
        // Use public Lottie animation URLs (no SSR, no bundling issues)
        const animUrl =
          type === "success"
            ? "https://assets10.lottiefiles.com/packages/lf20_jbrw3hcz.json" // green checkmark
            : "https://assets4.lottiefiles.com/packages/lf20_qpwbiyxf.json";  // red X

        lottieInstance = lottie.default.loadAnimation({
          container: containerRef.current!,
          renderer: "svg",
          loop: type !== "success",
          autoplay: true,
          path: animUrl,
        });
      } catch {
        // Lottie failed silently — UI still shows text
      }
    }

    init();

    return () => {
      lottieInstance?.destroy();
    };
  }, [router, searchParams]);

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; background: #060608; }
        .cb-page {
          min-height: 100svh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #060608;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          gap: 24px;
          padding: 32px;
        }
        .cb-lottie {
          width: 160px;
          height: 160px;
        }
        .cb-spinner {
          width: 52px;
          height: 52px;
          border: 3px solid rgba(255,255,255,0.1);
          border-top-color: #e50914;
          border-radius: 50%;
          animation: spin 0.75s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .cb-title {
          font-size: 1.35rem;
          font-weight: 600;
          letter-spacing: 0.03em;
          text-align: center;
        }
        .cb-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          text-align: center;
          max-width: 300px;
          line-height: 1.6;
        }
        .cb-error { color: #e50914; }
        .cb-success { color: #25d366; }
      `}</style>

      <div className="cb-page">
        {status === "loading" && <div className="cb-spinner" />}

        {status !== "loading" && (
          <div className="cb-lottie" ref={containerRef} />
        )}

        <p className={`cb-title ${status === "error" ? "cb-error" : status === "success" ? "cb-success" : ""}`}>
          {message}
        </p>

        {status === "loading" && (
          <p className="cb-sub">Please wait while we verify your account…</p>
        )}
        {status === "error" && (
          <p className="cb-sub">Redirecting you back to the login page…</p>
        )}
        {status === "success" && (
          <p className="cb-sub">Taking you to your movies now…</p>
        )}
      </div>
    </>
  );
}