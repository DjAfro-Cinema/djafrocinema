// lib/push.ts
// Handles VAPID push subscription storage and sending via Appwrite

import { Client, Databases, ID, Query } from "appwrite";

// ─── VAPID PUBLIC KEY ───────────────────────────────────────────────
// Generate your VAPID keys by running this in terminal:
//   npx web-push generate-vapid-keys
// Then add to .env.local:
//   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
//   VAPID_PRIVATE_KEY=your_private_key
//   VAPID_MAILTO=mailto:you@djafrocinema.com
export const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

// ─── APPWRITE CONFIG ────────────────────────────────────────────────
// Add to your Appwrite database a collection called "push_subscriptions"
// with these attributes:
//   endpoint (string, required)
//   p256dh   (string, required)
//   auth     (string, required)
//   userId   (string, optional — for per-user targeting)
//   createdAt (string)
export const PUSH_COLLECTION_ID = "push_subscriptions";

// ─── HELPER: convert VAPID key ──────────────────────────────────────
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

// ─── SUBSCRIBE: register browser push subscription ──────────────────
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