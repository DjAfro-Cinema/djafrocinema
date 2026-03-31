// app/sw.ts — REPLACE your existing sw.ts with this
// Added: push event handler + notificationclick handler

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();

// ─── PUSH: show notification when server sends one ───────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    url?: string;
    tag?: string;
  };

  try {
    data = event.data.json();
  } catch {
    data = {
      title: "DjAfroCinema",
      body: event.data.text(),
    };
  }

  const options = {
    body: data.body,
    icon: data.icon ?? "/android-chrome-192x192.png",
    badge: data.badge ?? "/android-chrome-192x192.png",
    tag: data.tag ?? "djafro-notification",
    renotify: true,
    data: { url: data.url ?? "https://www.djafrocinema.com" },
    vibrate: [200, 100, 200],
  } as NotificationOptions & { renotify: boolean; vibrate: number[] };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ─── NOTIFICATION CLICK: open the app when user taps ────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url ?? "https://www.djafrocinema.com";

  event.waitUntil(
    // Try to focus existing tab, else open new one
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const existing = clients.find((c) => c.url.includes("djafrocinema.com"));
        if (existing) {
          existing.focus();
          (existing as WindowClient).navigate(url);
          return;
        }
        return self.clients.openWindow(url);
      })
  );
});