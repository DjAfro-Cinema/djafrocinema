// hooks/usePushNotifications.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { subscribeToPush } from "@/lib/push";

type PermissionState = "default" | "granted" | "denied" | "unsupported";

export function usePushNotifications(userId?: string) {
  const [permission, setPermission] = useState<PermissionState>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check current state on mount
  useEffect(() => {
    if (!("Notification" in window) || !("PushManager" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission as PermissionState);

    // Check if already subscribed
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        setIsSubscribed(!!sub);
      });
    });
  }, []);

  const subscribe = useCallback(async () => {
    if (!("Notification" in window)) return;

    setIsLoading(true);
    try {
      // Request permission
      const result = await Notification.requestPermission();
      setPermission(result as PermissionState);

      if (result !== "granted") {
        setIsLoading(false);
        return;
      }

      // Get push subscription
      const subscription = await subscribeToPush();
      if (!subscription) {
        setIsLoading(false);
        return;
      }

      // Save to Appwrite via API
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userId: userId ?? null,
        }),
      });

      setIsSubscribed(true);

      // Show a welcome notification immediately
      const reg = await navigator.serviceWorker.ready;
      reg.showNotification("🎬 Notifications enabled!", {
        body: "You'll be notified when new movies drop on DjAfroCinema.",
        icon: "/android-chrome-192x192.png",
        badge: "/android-chrome-192x192.png",
        tag: "welcome",
      });
    } catch (err) {
      console.error("Push subscribe error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const unsubscribe = useCallback(async () => {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await sub.unsubscribe();
      setIsSubscribed(false);
    }
  }, []);

  return { permission, isSubscribed, isLoading, subscribe, unsubscribe };
}