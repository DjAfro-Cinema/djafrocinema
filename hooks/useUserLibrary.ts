"use client";

import { useState, useEffect, useCallback } from "react";
import {
  userLibraryService,
  WatchProgress,
  PurchasedMovie,
} from "@/services/userLibrary.service";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface LibraryStats {
  owned: number;
  inProgress: number;
  completed: number;
  avgProgress: number;
}

interface UseUserLibraryReturn {
  // Data
  continueWatching: WatchProgress[];
  watchHistory: WatchProgress[];
  purchased: PurchasedMovie[];
  stats: LibraryStats;

  // State
  loading: boolean;
  error: string | null;

  // Actions
  refetch: () => Promise<void>;
  updateProgress: (movieId: string, progress: number) => Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useUserLibrary(userId: string | null | undefined): UseUserLibraryReturn {
  const [continueWatching, setContinueWatching] = useState<WatchProgress[]>([]);
  const [watchHistory, setWatchHistory] = useState<WatchProgress[]>([]);
  const [purchased, setPurchased] = useState<PurchasedMovie[]>([]);
  const [stats, setStats] = useState<LibraryStats>({
    owned: 0,
    inProgress: 0,
    completed: 0,
    avgProgress: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const [cw, history, purch, s] = await Promise.all([
        userLibraryService.getContinueWatching(userId),
        userLibraryService.getWatchHistory(userId),
        userLibraryService.getPurchasedMovies(userId),
        userLibraryService.getStats(userId),
      ]);
      setContinueWatching(cw);
      setWatchHistory(history);
      setPurchased(purch);
      setStats(s);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load library.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const updateProgress = useCallback(
    async (movieId: string, progress: number) => {
      if (!userId) return;
      await userLibraryService.updateProgress(userId, movieId, progress);
      // Optimistic refresh of continue watching
      await fetchAll();
    },
    [userId, fetchAll]
  );

  return {
    continueWatching,
    watchHistory,
    purchased,
    stats,
    loading,
    error,
    refetch: fetchAll,
    updateProgress,
  };
}