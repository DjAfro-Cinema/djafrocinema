// =============================================================================
// hooks/useAllGenres.ts
//
// Returns all unique genres derived from the movie collection, sorted A-Z.
// Use this to render genre filter chips / tabs.
//
// Usage:
//   const { genres, loading } = useAllGenres();
// =============================================================================

"use client";

import { useState, useEffect } from "react";
import { movieService } from "@/services/movie.service";

interface UseAllGenresReturn {
  genres:  string[];
  loading: boolean;
  error:   string | null;
}

export function useAllGenres(): UseAllGenresReturn {
  const [genres,  setGenres]  = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    movieService
      .getAllGenres()
      .then((data) => { if (!cancelled) setGenres(data); })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load genres."); })
      .finally(()  => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  return { genres, loading, error };
}