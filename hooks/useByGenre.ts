// =============================================================================
// hooks/useByGenre.ts
//
// Returns movies filtered by a specific genre.
// Genre matching is case-insensitive.
//
// Usage:
//   const { movies, loading, error } = useByGenre("Action");
//   const { movies, loading, error } = useByGenre("Comedy", 10);
// =============================================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import { movieService } from "@/services/movie.service";
import type { Movie } from "@/types/movie.types";

interface UseByGenreReturn {
  movies:  Movie[];
  loading: boolean;
  error:   string | null;
  refetch: () => void;
}

export function useByGenre(genre: string, limit?: number): UseByGenreReturn {
  const [movies,  setMovies]  = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [tick,    setTick]    = useState(0);

  useEffect(() => {
    if (!genre) {
      setMovies([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    movieService
      .getByGenre(genre, limit)
      .then((data) => { if (!cancelled) setMovies(data); })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load movies."); })
      .finally(()  => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [genre, limit, tick]);

  const refetch = useCallback(() => {
    movieService.invalidateCache();
    setTick((t) => t + 1);
  }, []);

  return { movies, loading, error, refetch };
}