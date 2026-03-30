"use client";

import { useEffect, useState } from "react";

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

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<Platform>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Already installed as standalone
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    // User already dismissed recently
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed && Date.now() - Number(dismissed) < 3 * 24 * 60 * 60 * 1000) return; // 3 days

    const detected = detectPlatform();
    setPlatform(detected);

    if (detected === "ios") {
      setTimeout(() => setShow(true), 4000);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShow(true), 4000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-3 right-3 z-50 md:bottom-6 md:left-auto md:right-6 md:w-80 animate-in slide-in-from-bottom-4 duration-300">
      <div
        className="rounded-2xl p-4 shadow-2xl border"
        style={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #111 100%)",
          borderColor: "rgba(229,9,20,0.3)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(229,9,20,0.1)",
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <img
            src="/logos/android-chrome-192x192.png"
            className="w-12 h-12 rounded-xl flex-shrink-0"
            alt="DjAfro Cinema"
          />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm leading-tight">DjAfro Cinema</p>
            <p className="text-gray-400 text-xs mt-0.5">Install for the best experience</p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-500 hover:text-white transition-colors text-2xl leading-none flex-shrink-0 w-8 h-8 flex items-center justify-center"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>

        {/* Benefits */}
        <div className="flex gap-3 mb-4 text-xs text-gray-400">
          <span>⚡ Faster loading</span>
          <span>📴 Works offline</span>
          <span>🔔 Notifications</span>
        </div>

        {/* iOS instructions */}
        {platform === "ios" && (
          <div className="bg-white/5 rounded-xl p-3 text-xs text-gray-300 space-y-1.5">
            <p className="flex items-center gap-2">
              <span className="text-base">1️⃣</span>
              Tap the <strong className="text-white">Share</strong> button{" "}
              <span className="text-base">⎋</span> at the bottom
            </p>
            <p className="flex items-center gap-2">
              <span className="text-base">2️⃣</span>
              Tap <strong className="text-white">"Add to Home Screen"</strong>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-base">3️⃣</span>
              Tap <strong className="text-white">Add</strong> — done! 🎉
            </p>
          </div>
        )}

        {/* Android / Desktop install button */}
        {(platform === "android" || platform === "desktop") && deferredPrompt && (
          <button
            onClick={handleInstall}
            className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg, #e50914, #c4080f)" }}
          >
            📲 Install App — It's Free
          </button>
        )}
      </div>
    </div>
  );
}