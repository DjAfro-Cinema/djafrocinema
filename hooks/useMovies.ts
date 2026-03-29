// =============================================================================
// hooks/useMovies.ts
//
// Paginated, filterable movie list.
//
// Usage:
//   const { movies, loading, error, total, hasMore, loadMore, refetch } =
//     useMovies({ genre: "Action", sortBy: "view_count" });
//
// Notes:
//   • Default limit is 9999 (effectively "all") since we only have ~200 movies
//     and they all come from the in-memory cache — no Appwrite cost.
//   • Pass a real limit + call loadMore() if you ever need pagination.
//   • Filters changing resets the list automatically.
// =============================================================================

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { movieService } from "@/services/movie.service";
import type { Movie, MovieFilters, MoviePage } from "@/types/movie.types";

interface UseMoviesOptions extends MovieFilters {
  pageSize?: number;
  /** Set to false to pause fetching until ready */
  enabled?: boolean;
}

interface UseMoviesReturn {
  movies:      Movie[];
  loading:     boolean;
  loadingMore: boolean;
  error:       string | null;
  total:       number;
  hasMore:     boolean;
  /** Load next page (only useful if you set a pageSize) */
  loadMore: () => void;
  /** Bust cache + re-fetch everything */
  refetch: () => void;
}

export function useMovies(options: UseMoviesOptions = {}): UseMoviesReturn {
  const { pageSize = 9999, enabled = true, ...filters } = options;

  const [movies,      setMovies]      = useState<Movie[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [page,        setPage]        = useState<MoviePage | null>(null);

  // Track seen IDs so we never insert a duplicate movie across pages
  const seen = useRef<Set<string>>(new Set());

  // Stable filter key — triggers refetch only when filters actually change
  const filterKey = JSON.stringify(filters);

  const doFetch = useCallback(
    async (offset: number, append: boolean) => {
      try {
        const result = await movieService.getMovies({
          ...filters,
          limit:  pageSize,
          offset,
        });

        if (append) {
          const fresh = result.movies.filter((m) => !seen.current.has(m.$id));
          fresh.forEach((m) => seen.current.add(m.$id));
          setMovies((prev) => [...prev, ...fresh]);
        } else {
          seen.current = new Set(result.movies.map((m) => m.$id));
          setMovies(result.movies);
        }

        setPage(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load movies.");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filterKey, pageSize]
  );

  // Reset + fetch when filters change
  useEffect(() => {
    if (!enabled) return;
    seen.current = new Set();
    setMovies([]);
    setPage(null);
    setLoading(true);
    doFetch(0, false).finally(() => setLoading(false));
  }, [doFetch, enabled]);

  const loadMore = useCallback(() => {
    if (!page?.hasMore || loadingMore) return;
    setLoadingMore(true);
    doFetch(page.nextOffset, true).finally(() => setLoadingMore(false));
  }, [page, loadingMore, doFetch]);

  const refetch = useCallback(() => {
    movieService.invalidateCache();
    seen.current = new Set();
    setMovies([]);
    setPage(null);
    setLoading(true);
    doFetch(0, false).finally(() => setLoading(false));
  }, [doFetch]);

  return {
    movies,
    loading,
    loadingMore,
    error,
    total:   page?.total ?? 0,
    hasMore: page?.hasMore ?? false,
    loadMore,
    refetch,
  };
}