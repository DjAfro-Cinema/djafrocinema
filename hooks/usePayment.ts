"use client";

// hooks/usePayments.ts
import { useState, useEffect, useCallback } from "react";
import { paymentService, Payment, PaymentResult } from "@/services/paymentService";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface PaymentStats {
  totalSpent: number;
  totalMovies: number;
  pendingCount: number;
}

interface UsePaymentsReturn {
  // Data
  payments: Payment[];
  paidMovieIds: string[];
  stats: PaymentStats;

  // State
  loading: boolean;
  error: string | null;
  isProcessing: boolean;

  // Actions
  refetch: () => Promise<void>;
  hasUserPaidForMovie: (movieId: string) => boolean;
  initiatePayment: (
    movieId: string,
    phoneNumber: string,
    customAmount?: number,
    movieIds?: string[],
    offerReference?: string
  ) => Promise<PaymentResult>;
  addToWishlist: (movieId: string) => Promise<boolean>;
  removeFromWishlist: (movieId: string) => Promise<boolean>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function usePayments(userId: string | null | undefined): UsePaymentsReturn {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paidMovieIds, setPaidMovieIds] = useState<string[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalSpent: 0,
    totalMovies: 0,
    pendingCount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const [pmts, paidIds, s] = await Promise.all([
        paymentService.getUserPayments(userId),
        paymentService.getPaidMovieIds(userId),
        paymentService.getPaymentStats(userId),
      ]);
      setPayments(pmts);
      setPaidMovieIds(paidIds);
      setStats(s);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load payments.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const hasUserPaidForMovie = useCallback(
    (movieId: string): boolean => {
      return paidMovieIds.includes(movieId);
    },
    [paidMovieIds]
  );

  const initiatePayment = useCallback(
    async (
      movieId: string,
      phoneNumber: string,
      customAmount?: number,
      movieIds?: string[],
      offerReference?: string
    ): Promise<PaymentResult> => {
      if (!userId) return { success: false, message: "Please log in to purchase movies." };
      setIsProcessing(true);
      try {
        const result = await paymentService.initiateSTKPush(
          movieId,
          userId,
          phoneNumber,
          customAmount,
          movieIds,
          offerReference
        );
        // Optimistically refresh paid IDs after a short delay
        if (result.success && !result.data?.alreadyPaid) {
          setTimeout(() => fetchAll(), 8000);
        }
        return result;
      } finally {
        setIsProcessing(false);
      }
    },
    [userId, fetchAll]
  );

  const addToWishlist = useCallback(
    async (movieId: string): Promise<boolean> => {
      if (!userId) return false;
      return paymentService.addToWishlist(userId, movieId);
    },
    [userId]
  );

  const removeFromWishlist = useCallback(
    async (movieId: string): Promise<boolean> => {
      if (!userId) return false;
      return paymentService.removeFromWishlist(userId, movieId);
    },
    [userId]
  );

  return {
    payments,
    paidMovieIds,
    stats,
    loading,
    error,
    isProcessing,
    refetch: fetchAll,
    hasUserPaidForMovie,
    initiatePayment,
    addToWishlist,
    removeFromWishlist,
  };
}