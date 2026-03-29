// =============================================================================
// hooks/useMostViewed.ts
//
// Returns movies sorted by view_count desc.
//
// Usage:
//   const { movies, loading, error } = useMostViewed();
// =============================================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import { movieService } from "@/services/movie.service";
import type { Movie } from "@/types/movie.types";

interface UseMostViewedReturn {
  movies:  Movie[];
  loading: boolean;
  error:   string | null;
  refetch: () => void;
}

export function useMostViewed(limit = 20): UseMostViewedReturn {
  const [movies,  setMovies]  = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [tick,    setTick]    = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    movieService
      .getMostViewed(limit)
      .then((data) => { if (!cancelled) setMovies(data); })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load most viewed movies."); })
      .finally(()  => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [limit, tick]);

  const refetch = useCallback(() => {
    movieService.invalidateCache();
    setTick((t) => t + 1);
  }, []);

  return { movies, loading, error, refetch };
}