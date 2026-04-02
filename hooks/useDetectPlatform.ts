import { useEffect, useState } from 'react';

/**
 * useDetectPlatform — detects if the user is on:
 *   - "pwa"        → web browser or installed PWA
 *   - "mobile-app" → native iOS/Android app wrapper
 *
 * Native apps should call setNativeAppPlatform() before the webview loads.
 */
export function useDetectPlatform() {
  const [platform, setPlatform] = useState<'pwa' | 'mobile-app'>('pwa');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    const userAgent = navigator.userAgent.toLowerCase();

    // Flag set by native app wrapper
    const isNativeApp = sessionStorage.getItem('isNativeApp') === 'true';

    // UA patterns from React Native / Expo / Capacitor / Flutter
    const hasNativeUA = /reactnative|expo-client|exponent|flutter/i.test(userAgent);

    // Capacitor uses a custom protocol
    const isCapacitor = window.location.protocol === 'capacitor:';

    // PWA display-mode queries (works on all platforms)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches;

    // iOS Safari "Add to Home Screen" — navigator.standalone is iOS-only.
    // We cast through unknown to avoid the TypeScript error on non-iOS targets.
    const iosStandalone = (navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isNativeApp || hasNativeUA || isCapacitor) {
      setPlatform('mobile-app');
    } else if (isStandalone || iosStandalone) {
      setPlatform('pwa');         // installed PWA — still counts as PWA
    } else {
      setPlatform('pwa');         // regular browser tab
    }

    setIsLoading(false);
  }, []);

  return { platform, isLoading };
}

/**
 * Call this from your native app's JavaScript bridge / WebView injection
 * before any React code runs to mark the session as a native app.
 */
export function setNativeAppPlatform(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('isNativeApp', 'true');
  }
}