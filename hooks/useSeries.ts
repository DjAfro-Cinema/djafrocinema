// =============================================================================
// hooks/useSeries.ts  — All series-related hooks
// =============================================================================
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { seriesService } from "@/services/series.service";
import type {
  Series,
  Episode,
  SeriesFilters,
} from "@/types/series.types";

// ─────────────────────────────────────────────────────────────────────────────
// useSeries — filtered/paginated series list (mirrors useMovies)
// ─────────────────────────────────────────────────────────────────────────────

interface UseSeriesReturn {
  series:  Series[];
  total:   number;
  loading: boolean;
  error:   string | null;
  hasMore: boolean;
  reload:  () => void;
}

export function useSeries(filters: SeriesFilters = {}): UseSeriesReturn {
  const [series,  setSeries]  = useState<Series[]>([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [tick,    setTick]    = useState(0);

  const filtersKey = JSON.stringify(filters);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    seriesService.getSeries(filters)
      .then((page) => {
        if (cancelled) return;
        setSeries(page.series);
        setTotal(page.total);
        setHasMore(page.hasMore);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? "Failed to load series");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { series, total, loading, error, hasMore, reload };
}

// ─────────────────────────────────────────────────────────────────────────────
// useSeriesById — single series with episodes info
// ─────────────────────────────────────────────────────────────────────────────

interface UseSeriesByIdReturn {
  series:  Series | null;
  loading: boolean;
  error:   string | null;
  trackView: () => void;
}

export function useSeriesById(id: string | null): UseSeriesByIdReturn {
  const [series,  setSeries]  = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const tracked = useRef(false);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);
    tracked.current = false;

    seriesService.getSeriesById(id)
      .then((s) => { if (!cancelled) setSeries(s); })
      .catch((err) => { if (!cancelled) setError(err?.message ?? "Failed to load series"); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [id]);

  const trackView = useCallback(() => {
    if (!id || tracked.current) return;
    tracked.current = true;
    seriesService.incrementSeriesViewCount(id).catch(() => {});
  }, [id]);

  return { series, loading, error, trackView };
}

// ─────────────────────────────────────────────────────────────────────────────
// useEpisodes — all episodes for a series, optionally filtered by season
// ─────────────────────────────────────────────────────────────────────────────

interface UseEpisodesReturn {
  episodes: Episode[];
  total:    number;
  loading:  boolean;
  error:    string | null;
  seasons:  number[];
  reload:   () => void;
}

export function useEpisodes(seriesId: string | null, season?: number): UseEpisodesReturn {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [seasons,  setSeasons]  = useState<number[]>([]);
  const [tick,     setTick]     = useState(0);

  useEffect(() => {
    if (!seriesId) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      seriesService.getEpisodes(seriesId, { season }),
      seriesService.getSeasons(seriesId),
    ])
      .then(([page, sArr]) => {
        if (cancelled) return;
        setEpisodes(page.episodes);
        setTotal(page.total);
        setSeasons(sArr);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? "Failed to load episodes");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [seriesId, season, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { episodes, total, loading, error, seasons, reload };
}

// ─────────────────────────────────────────────────────────────────────────────
// useFeaturedSeries
// ─────────────────────────────────────────────────────────────────────────────

interface UseListReturn<T> {
  items:   T[];
  loading: boolean;
  error:   string | null;
}

export function useFeaturedSeries(limit = 5): UseListReturn<Series> {
  const [items,   setItems]   = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    seriesService.getFeaturedSeries(limit)
      .then((s) => { if (!cancelled) setItems(s); })
      .catch((err) => { if (!cancelled) setError(err?.message ?? "Error"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [limit]);

  return { items, loading, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// useTrendingSeries
// ─────────────────────────────────────────────────────────────────────────────

export function useTrendingSeries(limit = 20): UseListReturn<Series> {
  const [items,   setItems]   = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    seriesService.getTrendingSeries(limit)
      .then((s) => { if (!cancelled) setItems(s); })
      .catch((err) => { if (!cancelled) setError(err?.message ?? "Error"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [limit]);

  return { items, loading, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// useLatestSeries
// ─────────────────────────────────────────────────────────────────────────────

export function useLatestSeries(limit = 20): UseListReturn<Series> {
  const [items,   setItems]   = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    seriesService.getLatestSeries(limit)
      .then((s) => { if (!cancelled) setItems(s); })
      .catch((err) => { if (!cancelled) setError(err?.message ?? "Error"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [limit]);

  return { items, loading, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// useTopRatedSeries
// ─────────────────────────────────────────────────────────────────────────────

export function useTopRatedSeries(limit = 20): UseListReturn<Series> {
  const [items,   setItems]   = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    seriesService.getTopRatedSeries(limit)
      .then((s) => { if (!cancelled) setItems(s); })
      .catch((err) => { if (!cancelled) setError(err?.message ?? "Error"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [limit]);

  return { items, loading, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// useAllSeriesGenres
// ─────────────────────────────────────────────────────────────────────────────

export function useAllSeriesGenres(): { genres: string[]; loading: boolean } {
  const [genres,  setGenres]  = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seriesService.getAllGenres()
      .then(setGenres)
      .finally(() => setLoading(false));
  }, []);

  return { genres, loading };
}

// ─────────────────────────────────────────────────────────────────────────────
// useRelatedSeries
// ─────────────────────────────────────────────────────────────────────────────

export function useRelatedSeries(series: Series | null, limit = 8): UseListReturn<Series> {
  const [items,   setItems]   = useState<Series[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!series) return;
    let cancelled = false;
    setLoading(true);
    seriesService.getRelatedSeries(series, limit)
      .then((s) => { if (!cancelled) setItems(s); })
      .catch((err) => { if (!cancelled) setError(err?.message ?? "Error"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [series?.$id, limit]);

  return { items, loading, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// useEpisodeTrackView — tracks view for a single episode
// ─────────────────────────────────────────────────────────────────────────────

export function useEpisodeTrackView(seriesId: string | null, episodeId: string | null) {
  const tracked = useRef(false);

  const trackView = useCallback(() => {
    if (!seriesId || !episodeId || tracked.current) return;
    tracked.current = true;
    seriesService.incrementEpisodeViewCount(seriesId, episodeId).catch(() => {});
  }, [seriesId, episodeId]);

  return { trackView };
}