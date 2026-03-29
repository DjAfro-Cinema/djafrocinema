// =============================================================================
// hooks/useMovie.ts
//
// Fetch a single movie by $id.
// Tracks view count when the player starts (call trackView() on play).
// Also loads related movies in the background.
//
// Usage:
//   const { movie, loading, error, trackView, related, relatedLoading } =
//     useMovie(params.id);
// =============================================================================

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { movieService } from "@/services/movie.service";
import type { Movie } from "@/types/movie.types";

interface UseMovieReturn {
  movie:          Movie | null;
  loading:        boolean;
  error:          string | null;
  related:        Movie[];
  relatedLoading: boolean;
  /**
   * Call this when the user hits Play.
   * Increments view_count once per hook instance (idempotent).
   */
  trackView: () => void;
}

export function useMovie(id: string | null | undefined): UseMovieReturn {
  const [movie,          setMovie]          = useState<Movie | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState<string | null>(null);
  const [related,        setRelated]        = useState<Movie[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  // Guard so trackView() increments only once per page visit
  const tracked = useRef(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setMovie(null);
    setRelated([]);
    tracked.current = false;

    movieService
      .getMovieById(id)
      .then((m) => {
        setMovie(m);
        if (m) {
          setRelatedLoading(true);
          movieService
            .getRelatedMovies(m, 8)
            .then(setRelated)
            .finally(() => setRelatedLoading(false));
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Could not load movie.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const trackView = useCallback(() => {
    if (!id || !movie || tracked.current) return;
    tracked.current = true;

    // Optimistic UI update
    setMovie((prev) =>
      prev ? { ...prev, view_count: prev.view_count + 1 } : prev
    );

    movieService.incrementViewCount(id);
  }, [id, movie]);

  return { movie, loading, error, related, relatedLoading, trackView };
}