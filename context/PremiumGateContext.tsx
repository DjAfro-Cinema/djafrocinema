"use client";

// context/PremiumGateContext.tsx
//
// ONE modal. ONE context. Cards never touch payment logic.
//
// Usage:
//   1. Wrap your dashboard layout: <PremiumGateProvider userId={user.$id}>
//   2. In any component: const { requestPlay } = usePremiumGate();
//   3. Call: requestPlay({ movieId, movieTitle, posterUrl, isPremium, videoUrl, onUnlocked })

import {
  createContext, useContext, useState, useCallback,
  useRef, useEffect, ReactNode,
} from "react";
import { paymentService } from "@/services/payment.service";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type GateState =
  | "idle"
  | "checking"      // verifying payment in Appwrite
  | "locked"        // show modal — not paid
  | "awaiting_pin"  // STK push sent
  | "polling"       // checking Appwrite every 4s
  | "success"       // payment confirmed
  | "failed";       // payment failed

interface GateMovie {
  movieId: string;
  movieTitle: string;
  posterUrl?: string;
  isPremium: boolean;
  videoUrl?: string;
  onUnlocked?: (movieId: string) => void; // called when user is cleared to play
}

interface GateStatus {
  state: GateState;
  movie: GateMovie | null;
  error: string | null;
  reference: string | null;
}

interface PremiumGateCtx {
  gateStatus: GateStatus;
  paidMovieIds: string[];        // resolved set — use to show badges on cards
  isLoadingPaid: boolean;
  requestPlay: (movie: GateMovie) => void;
  submitPhone: (phone: string) => void;
  dismiss: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const PremiumGateContext = createContext<PremiumGateCtx>({
  gateStatus: { state: "idle", movie: null, error: null, reference: null },
  paidMovieIds: [],
  isLoadingPaid: false,
  requestPlay: () => {},
  submitPhone: () => {},
  dismiss: () => {},
});

export function usePremiumGate() {
  return useContext(PremiumGateContext);
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function PremiumGateProvider({
  userId,
  children,
}: {
  userId: string | null | undefined;
  children: ReactNode;
}) {
  const [gateStatus, setGateStatus] = useState<GateStatus>({
    state: "idle",
    movie: null,
    error: null,
    reference: null,
  });

  // Pre-loaded paid movie IDs for badge display
  const [paidMovieIds, setPaidMovieIds] = useState<string[]>([]);
  const [isLoadingPaid, setIsLoadingPaid] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load paid IDs once on mount / userId change
  useEffect(() => {
    if (!userId) { setPaidMovieIds([]); return; }
    setIsLoadingPaid(true);
    paymentService
      .getPaidMovieIds(userId)
      .then((ids) => setPaidMovieIds(ids))
      .catch(() => setPaidMovieIds([]))
      .finally(() => setIsLoadingPaid(false));
  }, [userId]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  const dismiss = useCallback(() => {
    stopPolling();
    setGateStatus({ state: "idle", movie: null, error: null, reference: null });
  }, [stopPolling]);

  // ── requestPlay — called by MovieCard / MovieBanner onPlay ──────────────

  const requestPlay = useCallback(
    async (movie: GateMovie) => {
      // Free movie or already known paid → play immediately
      if (!movie.isPremium || paidMovieIds.includes(movie.movieId)) {
        movie.onUnlocked?.(movie.movieId);
        return;
      }

      // Show checking state
      setGateStatus({ state: "checking", movie, error: null, reference: null });

      try {
        const paid = await paymentService.hasUserPaidForMovie(
          userId ?? "",
          movie.movieId
        );

        if (paid) {
          // Update local cache + play
          setPaidMovieIds((prev) =>
            prev.includes(movie.movieId) ? prev : [...prev, movie.movieId]
          );
          setGateStatus({ state: "idle", movie: null, error: null, reference: null });
          movie.onUnlocked?.(movie.movieId);
        } else {
          setGateStatus({ state: "locked", movie, error: null, reference: null });
        }
      } catch {
        // On error, still show the modal — better than silently failing
        setGateStatus({ state: "locked", movie, error: null, reference: null });
      }
    },
    [userId, paidMovieIds]
  );

  // ── submitPhone — called from PaymentModal ──────────────────────────────

  const submitPhone = useCallback(
    async (phone: string) => {
      const movie = gateStatus.movie;
      if (!movie || !userId) return;

      setGateStatus((s) => ({ ...s, state: "awaiting_pin", error: null }));

      try {
        const result = await paymentService.initiateSTKPush(
          movie.movieId,
          userId,
          phone
        );

        if (!result.success) {
          setGateStatus((s) => ({ ...s, state: "failed", error: result.message }));
          return;
        }

        if (result.data?.alreadyPaid) {
          setPaidMovieIds((prev) =>
            prev.includes(movie.movieId) ? prev : [...prev, movie.movieId]
          );
          setGateStatus((s) => ({ ...s, state: "success" }));
          return;
        }

        const reference = result.data?.reference ?? null;
        setGateStatus((s) => ({ ...s, state: "polling", reference }));

        // Poll every 4s for up to 88s (22 attempts)
        let attempts = 0;
        pollRef.current = setInterval(async () => {
          attempts++;
          try {
            const paid = await paymentService.hasUserPaidForMovie(userId, movie.movieId);
            if (paid) {
              stopPolling();
              setPaidMovieIds((prev) =>
                prev.includes(movie.movieId) ? prev : [...prev, movie.movieId]
              );
              setGateStatus((s) => ({ ...s, state: "success" }));
              return;
            }
            if (reference) {
              const p = await paymentService.getByReference(reference);
              if (p?.status === "completed") {
                stopPolling();
                setPaidMovieIds((prev) =>
                  prev.includes(movie.movieId) ? prev : [...prev, movie.movieId]
                );
                setGateStatus((s) => ({ ...s, state: "success" }));
                return;
              }
              if (p?.status === "failed" || p?.status === "cancelled") {
                stopPolling();
                setGateStatus((s) => ({
                  ...s,
                  state: "failed",
                  error: "Payment was cancelled. Please try again.",
                }));
                return;
              }
            }
          } catch { /* keep polling */ }

          if (attempts >= 22) {
            stopPolling();
            setGateStatus((s) => ({
              ...s,
              state: "failed",
              error: "Payment timed out. If you paid successfully, refresh the page.",
            }));
          }
        }, 4000);
      } catch (err) {
        setGateStatus((s) => ({
          ...s,
          state: "failed",
          error: err instanceof Error ? err.message : "Something went wrong.",
        }));
      }
    },
    [gateStatus.movie, userId, stopPolling]
  );

  return (
    <PremiumGateContext.Provider
      value={{
        gateStatus,
        paidMovieIds,
        isLoadingPaid,
        requestPlay,
        submitPhone,
        dismiss,
      }}
    >
      {children}
    </PremiumGateContext.Provider>
  );
}