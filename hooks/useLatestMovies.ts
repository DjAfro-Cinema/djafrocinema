// =============================================================================
// hooks/useLatestMovies.ts
//
// Returns the most recently added movies (sorted by $createdAt desc).
// Shown in the "New Arrivals" section.
//
// Usage:
//   const { movies, loading, error } = useLatestMovies();
// =============================================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import { movieService } from "@/services/movie.service";
import type { Movie } from "@/types/movie.types";

interface UseLatestMoviesReturn {
  movies:  Movie[];
  loading: boolean;
  error:   string | null;
  refetch: () => void;
}

export function useLatestMovies(limit = 20): UseLatestMoviesReturn {
  const [movies,  setMovies]  = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [tick,    setTick]    = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    movieService
      .getLatestMovies(limit)
      .then((data) => { if (!cancelled) setMovies(data); })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load latest movies."); })
      .finally(()  => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [limit, tick]);

  const refetch = useCallback(() => {
    movieService.invalidateCache();
    setTick((t) => t + 1);
  }, []);

  return { movies, loading, error, refetch };
}