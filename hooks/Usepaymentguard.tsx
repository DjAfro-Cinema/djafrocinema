"use client";

// hooks/usePaymentGuard.ts
import { useState, useCallback, useRef } from "react";
import { paymentService, PaymentResult } from "@/services/paymentService";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type GuardState =
  | "idle"
  | "checking"       // verifying payment status
  | "unlocked"       // user has paid — allow play
  | "locked"         // user hasn't paid — show modal
  | "awaiting_pin"   // STK push sent, waiting for user to enter PIN
  | "polling"        // polling Appwrite for completed status
  | "success"        // payment confirmed
  | "failed";        // payment failed/cancelled

export interface PaymentGuardState {
  state: GuardState;
  movieId: string | null;
  movieTitle: string | null;
  posterUrl: string | null;
  error: string | null;
  reference: string | null;
}

export interface UsePaymentGuardReturn {
  guardState: PaymentGuardState;
  // Call this when user clicks Play on ANY movie
  requestPlay: (params: {
    movieId: string;
    movieTitle: string;
    posterUrl?: string;
    isPremium: boolean;
    userId: string;
  }) => Promise<void>;
  // Call this from the modal when user submits phone
  submitPayment: (phoneNumber: string, userId: string) => Promise<void>;
  // Call this to close/dismiss the modal
  dismissModal: () => void;
  // Call this after success to actually navigate to player
  proceedToPlay: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function usePaymentGuard(onPlay: (movieId: string) => void): UsePaymentGuardReturn {
  const [guardState, setGuardState] = useState<PaymentGuardState>({
    state: "idle",
    movieId: null,
    movieTitle: null,
    posterUrl: null,
    error: null,
    reference: null,
  });

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const requestPlay = useCallback(
    async ({
      movieId,
      movieTitle,
      posterUrl,
      isPremium,
      userId,
    }: {
      movieId: string;
      movieTitle: string;
      posterUrl?: string;
      isPremium: boolean;
      userId: string;
    }) => {
      // Non-premium: just play
      if (!isPremium) {
        onPlay(movieId);
        return;
      }

      // Check payment
      setGuardState({
        state: "checking",
        movieId,
        movieTitle,
        posterUrl: posterUrl ?? null,
        error: null,
        reference: null,
      });

      try {
        const hasPaid = await paymentService.hasUserPaidForMovie(userId, movieId);
        if (hasPaid) {
          // Already paid — play immediately
          setGuardState((prev) => ({ ...prev, state: "unlocked" }));
          onPlay(movieId);
          return;
        }

        // Not paid — show modal
        setGuardState((prev) => ({ ...prev, state: "locked" }));
      } catch {
        setGuardState((prev) => ({ ...prev, state: "locked" }));
      }
    },
    [onPlay]
  );

  const submitPayment = useCallback(
    async (phoneNumber: string, userId: string) => {
      const { movieId } = guardState;
      if (!movieId || !userId) return;

      setGuardState((prev) => ({ ...prev, state: "awaiting_pin", error: null }));

      try {
        const result: PaymentResult = await paymentService.initiateSTKPush(
          movieId,
          userId,
          phoneNumber
        );

        if (!result.success) {
          setGuardState((prev) => ({
            ...prev,
            state: "failed",
            error: result.message,
          }));
          return;
        }

        // Already paid (edge case)
        if (result.data?.alreadyPaid) {
          setGuardState((prev) => ({ ...prev, state: "success" }));
          return;
        }

        const reference = result.data?.reference ?? null;
        setGuardState((prev) => ({ ...prev, state: "polling", reference }));

        // Poll every 4s for up to 90s (22 attempts)
        let attempts = 0;
        const MAX = 22;

        pollRef.current = setInterval(async () => {
          attempts++;

          try {
            const paid = await paymentService.hasUserPaidForMovie(userId, movieId);
            if (paid) {
              stopPolling();
              setGuardState((prev) => ({ ...prev, state: "success" }));
              return;
            }

            // Also check by reference if we have one
            if (reference) {
              const payment = await paymentService.getByReference(reference);
              if (payment?.status === "completed") {
                stopPolling();
                setGuardState((prev) => ({ ...prev, state: "success" }));
                return;
              }
              if (payment?.status === "failed" || payment?.status === "cancelled") {
                stopPolling();
                setGuardState((prev) => ({
                  ...prev,
                  state: "failed",
                  error: "Payment was not completed. Please try again.",
                }));
                return;
              }
            }
          } catch {
            // keep polling
          }

          if (attempts >= MAX) {
            stopPolling();
            setGuardState((prev) => ({
              ...prev,
              state: "failed",
              error: "Payment timed out. If you paid, please refresh the page.",
            }));
          }
        }, 4000);
      } catch (err) {
        setGuardState((prev) => ({
          ...prev,
          state: "failed",
          error: err instanceof Error ? err.message : "Something went wrong.",
        }));
      }
    },
    [guardState]
  );

  const dismissModal = useCallback(() => {
    stopPolling();
    setGuardState({
      state: "idle",
      movieId: null,
      movieTitle: null,
      posterUrl: null,
      error: null,
      reference: null,
    });
  }, []);

  const proceedToPlay = useCallback(() => {
    const { movieId } = guardState;
    if (!movieId) return;
    dismissModal();
    onPlay(movieId);
  }, [guardState, dismissModal, onPlay]);

  return { guardState, requestPlay, submitPayment, dismissModal, proceedToPlay };
}