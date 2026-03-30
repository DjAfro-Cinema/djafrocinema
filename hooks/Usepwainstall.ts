"use client";

import { useEffect, useState, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const INSTALLED_KEY  = "pwa-installed";
export const DISMISSED_KEY  = "pwa-prompt-dismissed";

export type PWAInstallState = {
  deferredPrompt: BeforeInstallPromptEvent | null;
  isInstalled:    boolean;
  isStandalone:   boolean;
  triggerInstall: () => Promise<"accepted" | "dismissed" | "no-prompt">;
};

let _globalDeferred: BeforeInstallPromptEvent | null = null;
const _listeners = new Set<() => void>();

// Capture the event once, globally, so any component can use it
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    _globalDeferred = e as BeforeInstallPromptEvent;
    _listeners.forEach((fn) => fn());
  });
  window.addEventListener("appinstalled", () => {
    localStorage.setItem(INSTALLED_KEY, "1");
    _listeners.forEach((fn) => fn());
  });
}

export function usePWAInstall(): PWAInstallState {
  const [, rerender] = useState(0);

  useEffect(() => {
    const fn = () => rerender((n) => n + 1);
    _listeners.add(fn);
    return () => { _listeners.delete(fn); };
  }, []);

  const isStandalone =
    typeof window !== "undefined" &&
    window.matchMedia("(display-mode: standalone)").matches;

  const isInstalled =
    isStandalone ||
    (typeof window !== "undefined" && !!localStorage.getItem(INSTALLED_KEY));

  const triggerInstall = useCallback(async (): Promise<"accepted" | "dismissed" | "no-prompt"> => {
    if (!_globalDeferred) return "no-prompt";
    await _globalDeferred.prompt();
    const { outcome } = await _globalDeferred.userChoice;
    if (outcome === "accepted") {
      localStorage.setItem(INSTALLED_KEY, "1");
      _globalDeferred = null;
      rerender((n) => n + 1);
    }
    return outcome;
  }, []);

  return {
    deferredPrompt: _globalDeferred,
    isInstalled,
    isStandalone,
    triggerInstall,
  };
}