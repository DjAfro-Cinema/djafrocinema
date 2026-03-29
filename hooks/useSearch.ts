// =============================================================================
// hooks/useSearch.ts
//
// Debounced, scored full-text movie search.
// Runs entirely on the in-memory cache — no Appwrite request per keystroke.
//
// Scoring:
//   exact title match      → 100
//   title starts with q    → 60
//   title contains q       → 40
//   genre match            → 25
//   tag match              → 20
//   description / summary  → 10
//
// Recent searches are persisted to localStorage (last 8).
//
// Usage:
//   const {
//     query, setQuery, results, loading, total,
//     clearSearch, recentSearches, clearRecentSearches, removeRecentSearch
//   } = useSearch();
// =============================================================================

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { movieService } from "@/services/movie.service";
import type { Movie } from "@/types/movie.types";

const DEBOUNCE_MS = 300;
const MAX_RECENT  = 8;
const STORAGE_KEY = "djafro_recent_searches";

// ── localStorage helpers ──────────────────────────────────────────────────────

function loadRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveRecent(list: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
}

// ── Hook interface ────────────────────────────────────────────────────────────

interface UseSearchReturn {
  query:   string;
  results: Movie[];
  loading: boolean;
  error:   string | null;
  total:   number;
  setQuery:             (q: string) => void;
  clearSearch:          () => void;
  recentSearches:       string[];
  clearRecentSearches:  () => void;
  removeRecentSearch:   (term: string) => void;
}

export function useSearch(limit = 50): UseSearchReturn {
  const [query,   setQueryState] = useState("");
  const [results, setResults]    = useState<Movie[]>([]);
  const [loading, setLoading]    = useState(false);
  const [error,   setError]      = useState<string | null>(null);
  const [total,   setTotal]      = useState(0);
  const [recent,  setRecent]     = useState<string[]>([]);

  const timer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const current = useRef("");

  // Load recent searches from localStorage on mount
  useEffect(() => { setRecent(loadRecent()); }, []);

  const setQuery = useCallback(
    (q: string) => {
      setQueryState(q);
      if (timer.current) clearTimeout(timer.current);

      if (!q.trim()) {
        current.current = "";
        setResults([]);
        setTotal(0);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      current.current = q;

      timer.current = setTimeout(async () => {
        if (current.current !== q) return; // stale query — ignore

        try {
          const res = await movieService.search(q.trim(), limit);

          if (current.current !== q) return; // another query fired while we waited

          setResults(res.movies);
          setTotal(res.total);
          setError(null);

          // Persist to recent searches if we got results
          if (res.total > 0) {
            setRecent((prev) => {
              const next = [q, ...prev.filter((s) => s !== q)].slice(0, MAX_RECENT);
              saveRecent(next);
              return next;
            });
          }
        } catch (err) {
          if (current.current !== q) return;
          setError(err instanceof Error ? err.message : "Search failed.");
          setResults([]);
          setTotal(0);
        } finally {
          if (current.current === q) setLoading(false);
        }
      }, DEBOUNCE_MS);
    },
    [limit]
  );

  const clearSearch = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    current.current = "";
    setQueryState("");
    setResults([]);
    setTotal(0);
    setLoading(false);
    setError(null);
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecent([]);
    saveRecent([]);
  }, []);

  const removeRecentSearch = useCallback((term: string) => {
    setRecent((prev) => {
      const next = prev.filter((s) => s !== term);
      saveRecent(next);
      return next;
    });
  }, []);

  return {
    query,
    results,
    loading,
    error,
    total,
    setQuery,
    clearSearch,
    recentSearches:      recent,
    clearRecentSearches,
    removeRecentSearch,
  };
}