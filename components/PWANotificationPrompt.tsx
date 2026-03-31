// components/PWANotificationPrompt.tsx
// Drop this anywhere in your layout — it handles all prompts automatically
"use client";

import { useEffect, useState } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { usePWAInstall } from "@/hooks/Usepwainstall";

type PromptType = "install" | "notifications" | "whatsapp" | null;

const WHATSAPP_DISMISSED_KEY = "whatsapp-prompt-dismissed";
const NOTIF_DISMISSED_KEY = "notif-prompt-dismissed";

export function PWANotificationPrompt({ userId }: { userId?: string }) {
  const { permission, isSubscribed, isLoading, subscribe } = usePushNotifications(userId);
  const { isInstalled, deferredPrompt, triggerInstall } = usePWAInstall();
  const [activePrompt, setActivePrompt] = useState<PromptType>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Wait 4 seconds after page load before showing any prompt
    const timer = setTimeout(() => {
      const notifDismissed = localStorage.getItem(NOTIF_DISMISSED_KEY);
      const whatsappDismissed = localStorage.getItem(WHATSAPP_DISMISSED_KEY);

      if (!isInstalled && deferredPrompt) {
        setActivePrompt("install");
        setVisible(true);
      } else if (permission === "default" && !isSubscribed && !notifDismissed) {
        setActivePrompt("notifications");
        setVisible(true);
      } else if (!whatsappDismissed) {
        setActivePrompt("whatsapp");
        setVisible(true);
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [isInstalled, deferredPrompt, permission, isSubscribed]);

  const dismiss = (key?: string) => {
    if (key) localStorage.setItem(key, "1");
    setVisible(false);
    setActivePrompt(null);
  };

  if (!visible || !activePrompt) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "80px", // above mobile nav
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 32px)",
        maxWidth: "400px",
        zIndex: 9999,
        animation: "slideUp 0.3s ease",
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      {activePrompt === "install" && (
        <PromptCard
          icon="📲"
          title="Install DjAfroCinema"
          body="Add to your home screen for the full cinema experience — works on any device, no app store needed."
          primaryLabel="Install App"
          primaryColor="#e50914"
          onPrimary={async () => {
            await triggerInstall();
            dismiss();
          }}
          onDismiss={() => dismiss()}
        />
      )}

      {activePrompt === "notifications" && (
        <PromptCard
          icon="🎬"
          title="Never miss a new film"
          body="Get notified the moment new movies drop on DjAfroCinema."
          primaryLabel={isLoading ? "Enabling..." : "Enable Notifications"}
          primaryColor="#e50914"
          onPrimary={async () => {
            await subscribe();
            dismiss(NOTIF_DISMISSED_KEY);
          }}
          onDismiss={() => dismiss(NOTIF_DISMISSED_KEY)}
          disabled={isLoading}
        />
      )}

      {activePrompt === "whatsapp" && (
        <PromptCard
          icon="💬"
          title="Join our WhatsApp Channel"
          body="Get movie alerts, report issues, and be first to know — straight to your WhatsApp."
          primaryLabel="Join Channel"
          primaryColor="#25D366"
          primaryTextColor="#000"
          onPrimary={() => {
            window.open(
              "https://www.whatsapp.com/channel/0029Vb7ysbU3GJOobmCMxx0d",
              "_blank"
            );
            dismiss(WHATSAPP_DISMISSED_KEY);
          }}
          onDismiss={() => dismiss(WHATSAPP_DISMISSED_KEY)}
        />
      )}
    </div>
  );
}

// ─── Reusable card ───────────────────────────────────────────────────
function PromptCard({
  icon,
  title,
  body,
  primaryLabel,
  primaryColor,
  primaryTextColor = "#fff",
  onPrimary,
  onDismiss,
  disabled,
}: {
  icon: string;
  title: string;
  body: string;
  primaryLabel: string;
  primaryColor: string;
  primaryTextColor?: string;
  onPrimary: () => void;
  onDismiss: () => void;
  disabled?: boolean;
}) {
  return (
    <div
      style={{
        background: "#0f0f12",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "14px",
        padding: "18px 18px 16px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
        display: "flex",
        gap: "14px",
        alignItems: "flex-start",
      }}
    >
      {/* Icon */}
      <div style={{ fontSize: "28px", lineHeight: 1, paddingTop: "2px", flexShrink: 0 }}>
        {icon}
      </div>

      {/* Text + buttons */}
      <div style={{ flex: 1 }}>
        <p style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: 600, color: "rgba(255,255,255,0.92)", fontFamily: "sans-serif" }}>
          {title}
        </p>
        <p style={{ margin: "0 0 14px", fontSize: "12px", color: "rgba(255,255,255,0.45)", lineHeight: 1.55, fontFamily: "sans-serif" }}>
          {body}
        </p>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={onPrimary}
            disabled={disabled}
            style={{
              background: primaryColor,
              color: primaryTextColor,
              border: "none",
              borderRadius: "6px",
              padding: "9px 18px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.7 : 1,
              fontFamily: "sans-serif",
              letterSpacing: "0.5px",
            }}
          >
            {primaryLabel}
          </button>
          <button
            onClick={onDismiss}
            style={{
              background: "transparent",
              color: "rgba(255,255,255,0.35)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "6px",
              padding: "9px 14px",
              fontSize: "12px",
              cursor: "pointer",
              fontFamily: "sans-serif",
            }}
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}