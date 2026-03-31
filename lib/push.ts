// lib/push.ts
"use client";

export const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
export const PUSH_COLLECTION_ID = "push_subscriptions";

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0))) as Uint8Array;
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Push not supported in this browser");
    return null;
  }

  const registration = await navigator.serviceWorker.ready;

  const existing = await registration.pushManager.getSubscription();
  if (existing) return existing;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  return subscription;
}