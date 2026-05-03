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

  // Stable serialised key — prevents effect re-running on every render due to
  // the filters object being a new reference each time even if values are equal.
  const filtersKey = JSON.stringify(filters);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    // JSON.parse is safe here — we serialised it above
    const parsedFilters: SeriesFilters = JSON.parse(filtersKey);

    seriesService.getSeries(parsedFilters)
      .then(page => {
        if (cancelled) return;
        setSeries(page.series);
        setTotal(page.total);
        setHasMore(page.hasMore);
      })
      .catch(err => {
        if (!cancelled) setError(err?.message ?? "Failed to load series");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey, tick]);

  const reload = useCallback(() => setTick(t => t + 1), []);
  return { series, total, loading, error, hasMore, reload };
}

// ─────────────────────────────────────────────────────────────────────────────
// useSeriesById — single series with view tracking
// ─────────────────────────────────────────────────────────────────────────────

interface UseSeriesByIdReturn {
  series:    Series | null;
  loading:   boolean;
  error:     string | null;
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
      .then(s  => { if (!cancelled) setSeries(s); })
      .catch(err => { if (!cancelled) setError(err?.message ?? "Failed to load series"); })
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
// useEpisodes — all episodes for a series, optionally filtered by season.
//
// FIX: seasons array is fetched once per seriesId (not re-fetched on season
// change), and the episode list transitions without clearing to empty first
// so there's no flash of "No episodes" between season switches.
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

  // Fetch the seasons list once per seriesId
  useEffect(() => {
    if (!seriesId) return;
    let cancelled = false;
    seriesService.getSeasons(seriesId)
      .then(s => { if (!cancelled) setSeasons(s); })
      .catch(() => { /* non-critical */ });
    return () => { cancelled = true; };
  }, [seriesId]);

  // Fetch episodes whenever seriesId, season or tick changes
  useEffect(() => {
    if (!seriesId) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);

    seriesService.getEpisodes(seriesId, { season })
      .then(page => {
        if (cancelled) return;
        setEpisodes(page.episodes);
        setTotal(page.total);
      })
      .catch(err => {
        if (!cancelled) setError(err?.message ?? "Failed to load episodes");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [seriesId, season, tick]);

  const reload = useCallback(() => setTick(t => t + 1), []);
  return { episodes, total, loading, error, seasons, reload };
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared list hook return type
// ─────────────────────────────────────────────────────────────────────────────

interface UseListReturn<T> {
  items:   T[];
  loading: boolean;
  error:   string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// useFeaturedSeries
// ─────────────────────────────────────────────────────────────────────────────

export function useFeaturedSeries(limit = 5): UseListReturn<Series> {
  const [items,   setItems]   = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    seriesService.getFeaturedSeries(limit)
      .then(s  => { if (!cancelled) setItems(s); })
      .catch(err => { if (!cancelled) setError(err?.message ?? "Error"); })
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
      .then(s  => { if (!cancelled) setItems(s); })
      .catch(err => { if (!cancelled) setError(err?.message ?? "Error"); })
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
      .then(s  => { if (!cancelled) setItems(s); })
      .catch(err => { if (!cancelled) setError(err?.message ?? "Error"); })
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
      .then(s  => { if (!cancelled) setItems(s); })
      .catch(err => { if (!cancelled) setError(err?.message ?? "Error"); })
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
    let cancelled = false;
    seriesService.getAllGenres()
      .then(g => { if (!cancelled) setGenres(g); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
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

  // Use series.$id as the dep so we don't re-run when the series object
  // reference changes but the id hasn't
  const seriesId = series?.$id ?? null;

  useEffect(() => {
    if (!series) return;
    let cancelled = false;
    setLoading(true);
    seriesService.getRelatedSeries(series, limit)
      .then(s  => { if (!cancelled) setItems(s); })
      .catch(err => { if (!cancelled) setError(err?.message ?? "Error"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seriesId, limit]);

  return { items, loading, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// useEpisodeTrackView — tracks a single episode view (fires once per mount)
// ─────────────────────────────────────────────────────────────────────────────

export function useEpisodeTrackView(seriesId: string | null, episodeId: string | null) {
  const tracked = useRef(false);

  // Reset tracker when episodeId changes so a new episode gets tracked
  useEffect(() => {
    tracked.current = false;
  }, [episodeId]);

  const trackView = useCallback(() => {
    if (!seriesId || !episodeId || tracked.current) return;
    tracked.current = true;
    seriesService.incrementEpisodeViewCount(seriesId, episodeId).catch(() => {});
  }, [seriesId, episodeId]);

  return { trackView };
}