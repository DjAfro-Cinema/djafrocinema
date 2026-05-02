// =============================================================================
// services/series.service.ts
//
// All Appwrite queries for series + episodes live here.
//
// Strategy (mirrors movie.service.ts):
//  • On first call, fetch ALL series from Appwrite in batched 100-doc pages.
//  • Cache the full series list AND episodes list in memory for 5 minutes.
//  • Every filter, sort, search and pagination is done in-memory — instant,
//    zero extra Appwrite round-trips, zero duplicate documents.
// =============================================================================

import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import type {
  Series,
  Episode,
  SeriesFilters,
  SeriesPage,
  EpisodePage,
  SeriesSearchResult,
} from "@/types/series.types";

const DB          = process.env.NEXT_PUBLIC_DATABASE_ID!;
const SERIES_COL  = process.env.NEXT_PUBLIC_SERIES_COLLECTION_ID!;
const EPISODE_COL = process.env.NEXT_PUBLIC_EPISODES_COLLECTION_ID!;

// ── Map raw Appwrite document → typed Series ──────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toSeries(doc: any): Series {
  return {
    $id:              doc.$id,
    title:            doc.title           ?? "",
    description:      doc.description     ?? null,
    ai_summary:       doc.ai_summary      ?? null,
    genre:            Array.isArray(doc.genre)           ? doc.genre           : [],
    poster_url:       doc.poster_url      ?? null,
    banner_url:       doc.banner_url      ?? null,
    premium_only:     doc.premium_only    ?? false,
    download_enabled: doc.download_enabled ?? true,
    view_count:       doc.view_count      ?? 0,
    rating:           doc.rating          ?? 0,
    is_featured:      doc.is_featured     ?? false,
    is_trending:      doc.is_trending     ?? false,
    tags:             Array.isArray(doc.tags) ? doc.tags : [],
    release_year:     doc.release_year    ?? null,
    total_seasons:    doc.total_seasons   ?? 1,
    total_episodes:   doc.total_episodes  ?? 0,
    status:           doc.status          ?? "ongoing", // ongoing | completed | hiatus
    $createdAt:       doc.$createdAt,
    $updatedAt:       doc.$updatedAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toEpisode(doc: any): Episode {
  return {
    $id:             doc.$id,
    series_id:       doc.series_id        ?? "",
    title:           doc.title            ?? "",
    description:     doc.description      ?? null,
    episode_number:  doc.episode_number   ?? 1,
    season_number:   doc.season_number    ?? 1,
    duration:        doc.duration         ?? null,
    video_url:       doc.drive_file_id
                       ? `/api/stream?fileId=${doc.drive_file_id}`
                       : (doc.video_url   ?? null),
    telegram_file_id: doc.telegram_file_id ?? null,
    channel_id:      doc.channel_id       ?? null,
    message_id:      doc.message_id       ?? null,
    thumbnail_url:   doc.thumbnail_url    ?? null,
    premium_only:    doc.premium_only     ?? false,
    download_enabled: doc.download_enabled ?? true,
    view_count:      doc.view_count       ?? 0,
    tags:            Array.isArray(doc.tags) ? doc.tags : [],
    $createdAt:      doc.$createdAt,
    $updatedAt:      doc.$updatedAt,
  };
}

// ── In-memory cache ───────────────────────────────────────────────────────────

let _seriesCache: Series[] | null   = null;
let _seriesCacheAt: number | null   = null;

// Episodes are cached per-series: Map<seriesId, { episodes, cachedAt }>
const _episodeCache = new Map<string, { episodes: Episode[]; cachedAt: number }>();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function isSeriesFresh(): boolean {
  return _seriesCache !== null && _seriesCacheAt !== null && Date.now() - _seriesCacheAt < CACHE_TTL;
}

function isEpisodeFresh(seriesId: string): boolean {
  const cached = _episodeCache.get(seriesId);
  return !!cached && Date.now() - cached.cachedAt < CACHE_TTL;
}

// ── Fetch ALL series from Appwrite in batches of 100 ─────────────────────────

async function fetchAllSeries(): Promise<Series[]> {
  const BATCH = 100;
  let offset  = 0;
  const all: Series[] = [];

  while (true) {
    const res = await databases.listDocuments(DB, SERIES_COL, [
      Query.limit(BATCH),
      Query.offset(offset),
      Query.orderDesc("$createdAt"),
    ]);

    const batch = res.documents.map(toSeries);
    all.push(...batch);

    if (batch.length < BATCH) break;
    offset += BATCH;
  }

  return all;
}

// ── Fetch ALL episodes for a series from Appwrite in batches ─────────────────

async function fetchEpisodesForSeries(seriesId: string): Promise<Episode[]> {
  const BATCH = 100;
  let offset  = 0;
  const all: Episode[] = [];

  while (true) {
    const res = await databases.listDocuments(DB, EPISODE_COL, [
      Query.limit(BATCH),
      Query.offset(offset),
      Query.equal("series_id", seriesId),
      Query.orderAsc("season_number"),
      // Secondary sort by episode_number handled in-memory below
    ]);

    const batch = res.documents.map(toEpisode);
    all.push(...batch);

    if (batch.length < BATCH) break;
    offset += BATCH;
  }

  // Sort by season then episode number
  return all.sort((a, b) => {
    if (a.season_number !== b.season_number) return a.season_number - b.season_number;
    return a.episode_number - b.episode_number;
  });
}

// ── Ensure caches are warm ────────────────────────────────────────────────────

async function warmSeries(): Promise<Series[]> {
  if (isSeriesFresh()) return _seriesCache!;
  _seriesCache   = await fetchAllSeries();
  _seriesCacheAt = Date.now();
  return _seriesCache;
}

async function warmEpisodes(seriesId: string): Promise<Episode[]> {
  if (isEpisodeFresh(seriesId)) return _episodeCache.get(seriesId)!.episodes;
  const episodes = await fetchEpisodesForSeries(seriesId);
  _episodeCache.set(seriesId, { episodes, cachedAt: Date.now() });
  return episodes;
}

// ── In-memory series filter + sort ────────────────────────────────────────────

function applySeriesFilters(series: Series[], f: SeriesFilters): Series[] {
  let out = series;

  if (f.genre) {
    const g = f.genre.toLowerCase();
    out = out.filter((s) => s.genre.some((sg) => sg.toLowerCase() === g));
  }

  if (f.is_featured !== undefined) out = out.filter((s) => s.is_featured === f.is_featured);
  if (f.is_trending !== undefined) out = out.filter((s) => s.is_trending === f.is_trending);
  if (f.premium_only !== undefined) out = out.filter((s) => s.premium_only === f.premium_only);
  if (f.release_year) out = out.filter((s) => s.release_year === f.release_year);
  if (f.status) out = out.filter((s) => s.status === f.status);

  if (f.search?.trim()) {
    const q = f.search.toLowerCase().trim();
    out = out.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.description ?? "").toLowerCase().includes(q) ||
        (s.ai_summary  ?? "").toLowerCase().includes(q) ||
        s.tags.some((t)  => t.toLowerCase().includes(q)) ||
        s.genre.some((g) => g.toLowerCase().includes(q))
    );
  }

  const sortBy = f.sortBy ?? "$createdAt";
  const asc    = (f.sortOrder ?? "desc") === "asc";

  out = [...out].sort((a, b) => {
    let av: string | number = (a as unknown as Record<string, unknown>)[sortBy] as string | number ?? 0;
    let bv: string | number = (b as unknown as Record<string, unknown>)[sortBy] as string | number ?? 0;
    if (typeof av === "string") av = av.toLowerCase();
    if (typeof bv === "string") bv = bv.toLowerCase();
    if (av < bv) return asc ? -1 : 1;
    if (av > bv) return asc ?  1 : -1;
    return 0;
  });

  return out;
}

// =============================================================================
// Public seriesService
// =============================================================================

export const seriesService = {

  /** Bust the series cache — call after add/edit in admin */
  invalidateSeriesCache(): void {
    _seriesCache   = null;
    _seriesCacheAt = null;
  },

  /** Bust episodes cache for a specific series */
  invalidateEpisodesCache(seriesId: string): void {
    _episodeCache.delete(seriesId);
  },

  /** Proactively warm the series cache (call on app boot) */
  async warmCache(): Promise<void> {
    await warmSeries();
  },

  // ── All series — filterable, sortable, paginated ──────────────────────────

  async getSeries(filters: SeriesFilters = {}): Promise<SeriesPage> {
    const all      = await warmSeries();
    const filtered = applySeriesFilters(all, filters);
    const limit    = filters.limit  ?? filtered.length;
    const offset   = filters.offset ?? 0;
    const slice    = filtered.slice(offset, offset + limit);

    return {
      series:     slice,
      total:      filtered.length,
      hasMore:    offset + limit < filtered.length,
      nextOffset: offset + limit,
    };
  },

  // ── Single series by $id ──────────────────────────────────────────────────

  async getSeriesById(id: string): Promise<Series | null> {
    if (_seriesCache) {
      const hit = _seriesCache.find((s) => s.$id === id);
      if (hit) return hit;
    }
    try {
      const doc = await databases.getDocument(DB, SERIES_COL, id);
      return toSeries(doc);
    } catch {
      return null;
    }
  },

  // ── Featured series (hero banner) ─────────────────────────────────────────

  async getFeaturedSeries(limit = 5): Promise<Series[]> {
    const all = await warmSeries();
    return all.filter((s) => s.is_featured).slice(0, limit);
  },

  // ── Trending series ───────────────────────────────────────────────────────

  async getTrendingSeries(limit = 20): Promise<Series[]> {
    const all = await warmSeries();
    return all
      .filter((s) => s.is_trending)
      .sort((a, b) => b.view_count - a.view_count)
      .slice(0, limit);
  },

  // ── Latest series ─────────────────────────────────────────────────────────

  async getLatestSeries(limit = 20): Promise<Series[]> {
    const all = await warmSeries();
    return [...all]
      .sort((a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime())
      .slice(0, limit);
  },

  // ── Top rated series ──────────────────────────────────────────────────────

  async getTopRatedSeries(limit = 20): Promise<Series[]> {
    const all = await warmSeries();
    return [...all].sort((a, b) => b.rating - a.rating).slice(0, limit);
  },

  // ── By genre ──────────────────────────────────────────────────────────────

  async getByGenre(genre: string, limit?: number): Promise<Series[]> {
    const all = await warmSeries();
    const g   = genre.toLowerCase();
    const out = all.filter((s) => s.genre.some((sg) => sg.toLowerCase() === g));
    return limit ? out.slice(0, limit) : out;
  },

  // ── All genres (derived from data) ────────────────────────────────────────

  async getAllGenres(): Promise<string[]> {
    const all = await warmSeries();
    const set = new Set<string>();
    all.forEach((s) => s.genre.forEach((g) => set.add(g)));
    return Array.from(set).sort();
  },

  // ── All years ─────────────────────────────────────────────────────────────

  async getAllYears(): Promise<string[]> {
    const all = await warmSeries();
    const set = new Set<string>();
    all.forEach((s) => { if (s.release_year) set.add(s.release_year); });
    return Array.from(set).sort((a, b) => Number(b) - Number(a));
  },

  // ── Related series (same genre, exclude self) ─────────────────────────────

  async getRelatedSeries(series: Series, limit = 8): Promise<Series[]> {
    const all    = await warmSeries();
    const genres = new Set(series.genre.map((g) => g.toLowerCase()));
    return all
      .filter((s) => s.$id !== series.$id && s.genre.some((g) => genres.has(g.toLowerCase())))
      .sort((a, b) => b.view_count - a.view_count)
      .slice(0, limit);
  },

  // ── Get all episodes for a series ─────────────────────────────────────────

  async getEpisodes(seriesId: string, filters: { season?: number; limit?: number; offset?: number } = {}): Promise<EpisodePage> {
    let episodes = await warmEpisodes(seriesId);

    if (filters.season !== undefined) {
      episodes = episodes.filter((e) => e.season_number === filters.season);
    }

    const limit  = filters.limit  ?? episodes.length;
    const offset = filters.offset ?? 0;
    const slice  = episodes.slice(offset, offset + limit);

    return {
      episodes:   slice,
      total:      episodes.length,
      hasMore:    offset + limit < episodes.length,
      nextOffset: offset + limit,
    };
  },

  // ── Get a single episode ──────────────────────────────────────────────────

  async getEpisodeById(seriesId: string, episodeId: string): Promise<Episode | null> {
    const cached = _episodeCache.get(seriesId);
    if (cached) {
      const hit = cached.episodes.find((e) => e.$id === episodeId);
      if (hit) return hit;
    }
    try {
      const doc = await databases.getDocument(DB, EPISODE_COL, episodeId);
      return toEpisode(doc);
    } catch {
      return null;
    }
  },

  // ── Get all seasons available for a series ────────────────────────────────

  async getSeasons(seriesId: string): Promise<number[]> {
    const episodes = await warmEpisodes(seriesId);
    const set      = new Set<number>();
    episodes.forEach((e) => set.add(e.season_number));
    return Array.from(set).sort((a, b) => a - b);
  },

  // ── Increment view count (optimistic) ─────────────────────────────────────

  async incrementSeriesViewCount(seriesId: string): Promise<void> {
    if (_seriesCache) {
      const s = _seriesCache.find((s) => s.$id === seriesId);
      if (s) s.view_count += 1;
    }
    try {
      const doc = await databases.getDocument(DB, SERIES_COL, seriesId);
      await databases.updateDocument(DB, SERIES_COL, seriesId, {
        view_count: (doc.view_count ?? 0) + 1,
      });
    } catch {
      // Non-critical
    }
  },

  async incrementEpisodeViewCount(seriesId: string, episodeId: string): Promise<void> {
    const cached = _episodeCache.get(seriesId);
    if (cached) {
      const e = cached.episodes.find((e) => e.$id === episodeId);
      if (e) e.view_count += 1;
    }
    try {
      const doc = await databases.getDocument(DB, EPISODE_COL, episodeId);
      await databases.updateDocument(DB, EPISODE_COL, episodeId, {
        view_count: (doc.view_count ?? 0) + 1,
      });
    } catch {
      // Non-critical
    }
  },

  // ── Full-text search across series ────────────────────────────────────────

  async search(query: string, limit = 50): Promise<SeriesSearchResult> {
    const all = await warmSeries();
    const q   = query.toLowerCase().trim();

    if (!q) return { series: [], query, total: 0 };

    const scored = all
      .map((s) => {
        let score = 0;
        const title   = s.title.toLowerCase();
        const desc    = (s.description ?? "").toLowerCase();
        const summary = (s.ai_summary  ?? "").toLowerCase();

        if (title === q)              score += 100;
        else if (title.startsWith(q)) score += 60;
        else if (title.includes(q))   score += 40;

        if (desc.includes(q))    score += 10;
        if (summary.includes(q)) score += 10;

        s.tags.forEach((t)  => { if (t.toLowerCase().includes(q))  score += 20; });
        s.genre.forEach((g) => { if (g.toLowerCase().includes(q))  score += 25; });

        return { series: s, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((r) => r.series);

    return { series: scored, query, total: scored.length };
  },

  // ── Total series count ────────────────────────────────────────────────────

  async getSeriesCount(): Promise<number> {
    const all = await warmSeries();
    return all.length;
  },

  // ── Full flat list ────────────────────────────────────────────────────────

  async getAllSeries(): Promise<Series[]> {
    return warmSeries();
  },
};