// =============================================================================
// services/movie.service.ts
//
// All Appwrite queries for movies live here.
//
// Strategy:
//  • On first call, fetch ALL movies from Appwrite in batched 100-doc pages.
//  • Cache the full list in memory for 5 minutes.
//  • Every filter, sort, search and pagination is done in-memory — instant,
//    zero extra Appwrite round-trips, zero duplicate documents.
//  • ~200 movies is tiny; the whole list is < 500 KB in memory.
// =============================================================================

import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import type {
  Movie,
  MovieFilters,
  MoviePage,
  MovieSortField,
  SearchResult,
} from "@/types/movie.types";

const DB        = process.env.NEXT_PUBLIC_DATABASE_ID!;
const MOVIES_COL = process.env.NEXT_PUBLIC_MOVIES_COLLECTION_ID!;

// ── In-memory cache ───────────────────────────────────────────────────────────

let _cache: Movie[] | null = null;
let _cacheAt: number | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function isFresh(): boolean {
  return _cache !== null && _cacheAt !== null && Date.now() - _cacheAt < CACHE_TTL;
}

// ── Map raw Appwrite document → typed Movie ───────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toMovie(doc: any): Movie {
  return {
    $id:               doc.$id,
    title:             doc.title          ?? "",
    description:       doc.description    ?? null,
    ai_summary:        doc.ai_summary     ?? null,
    genre:             Array.isArray(doc.genre)           ? doc.genre           : [],
    poster_url:        doc.poster_url     ?? null,
    quality_options:   Array.isArray(doc.quality_options) ? doc.quality_options : [],
    premium_only:      doc.premium_only   ?? false,
    download_enabled:  doc.download_enabled ?? true,
    view_count:        doc.view_count     ?? 0,
    rating:            doc.rating         ?? 0,
    download_count:    doc.download_count ?? 0,
    is_featured:       doc.is_featured    ?? false,
    is_trending:       doc.is_trending    ?? false,
    tags:              Array.isArray(doc.tags) ? doc.tags : [],
    release_year:      doc.release_year   ?? null,
    duration:          doc.duration       ?? null,
    video_url:         doc.video_url      ?? null,
    telegram_file_id:  doc.telegram_file_id ?? null,
    channel_id:        doc.channel_id     ?? null,
    message_id:        doc.message_id     ?? null,
    $createdAt:        doc.$createdAt,
    $updatedAt:        doc.$updatedAt,
  };
}

// ── Fetch ALL from Appwrite in batches of 100 ─────────────────────────────────

async function fetchAll(): Promise<Movie[]> {
  const BATCH = 100;
  let offset  = 0;
  const all: Movie[] = [];

  while (true) {
    const res = await databases.listDocuments(DB, MOVIES_COL, [
      Query.limit(BATCH),
      Query.offset(offset),
      Query.orderDesc("$createdAt"),
    ]);

    const batch = res.documents.map(toMovie);
    all.push(...batch);

    if (batch.length < BATCH) break;
    offset += BATCH;
  }

  return all;
}

// ── Ensure cache is warm ──────────────────────────────────────────────────────

async function warm(): Promise<Movie[]> {
  if (isFresh()) return _cache!;
  _cache   = await fetchAll();
  _cacheAt = Date.now();
  return _cache;
}

// ── In-memory filter + sort ───────────────────────────────────────────────────

function applyFilters(movies: Movie[], f: MovieFilters): Movie[] {
  let out = movies;

  if (f.genre) {
    const g = f.genre.toLowerCase();
    out = out.filter((m) => m.genre.some((mg) => mg.toLowerCase() === g));
  }

  if (f.is_featured !== undefined) {
    out = out.filter((m) => m.is_featured === f.is_featured);
  }

  if (f.is_trending !== undefined) {
    out = out.filter((m) => m.is_trending === f.is_trending);
  }

  if (f.premium_only !== undefined) {
    out = out.filter((m) => m.premium_only === f.premium_only);
  }

  if (f.release_year) {
    out = out.filter((m) => m.release_year === f.release_year);
  }

  if (f.search?.trim()) {
    const q = f.search.toLowerCase().trim();
    out = out.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        (m.description ?? "").toLowerCase().includes(q) ||
        (m.ai_summary  ?? "").toLowerCase().includes(q) ||
        m.tags.some((t)  => t.toLowerCase().includes(q)) ||
        m.genre.some((g) => g.toLowerCase().includes(q))
    );
  }

  // Sort
  const sortBy: MovieSortField = f.sortBy ?? "$createdAt";
  const asc = (f.sortOrder ?? "desc") === "asc";

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
// Public movieService
// =============================================================================

export const movieService = {

  /** Bust the cache — call this after you add/edit movies in the admin panel */
  invalidateCache(): void {
    _cache   = null;
    _cacheAt = null;
  },

  /** Proactively warm the cache (call on app boot) */
  async warmCache(): Promise<void> {
    await warm();
  },

  // ── All movies — filterable, sortable, paginated ──────────────────────────

  async getMovies(filters: MovieFilters = {}): Promise<MoviePage> {
    const all      = await warm();
    const filtered = applyFilters(all, filters);
    const limit    = filters.limit  ?? filtered.length; // no limit = return all
    const offset   = filters.offset ?? 0;
    const slice    = filtered.slice(offset, offset + limit);

    return {
      movies:     slice,
      total:      filtered.length,
      hasMore:    offset + limit < filtered.length,
      nextOffset: offset + limit,
    };
  },

  // ── Single movie by $id ───────────────────────────────────────────────────

  async getMovieById(id: string): Promise<Movie | null> {
    // Try cache first — avoids round-trip when cache is warm
    if (_cache) {
      const hit = _cache.find((m) => m.$id === id);
      if (hit) return hit;
    }
    try {
      const doc = await databases.getDocument(DB, MOVIES_COL, id);
      return toMovie(doc);
    } catch {
      return null;
    }
  },

  // ── Featured (hero banner) ────────────────────────────────────────────────

  async getFeaturedMovies(limit = 5): Promise<Movie[]> {
    const all = await warm();
    return all.filter((m) => m.is_featured).slice(0, limit);
  },

  // ── Trending ──────────────────────────────────────────────────────────────

  async getTrendingMovies(limit = 20): Promise<Movie[]> {
    const all = await warm();
    return all
      .filter((m) => m.is_trending)
      .sort((a, b) => b.view_count - a.view_count)
      .slice(0, limit);
  },

  // ── Latest additions ──────────────────────────────────────────────────────

  async getLatestMovies(limit = 20): Promise<Movie[]> {
    const all = await warm();
    return [...all]
      .sort((a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime())
      .slice(0, limit);
  },

  // ── Top rated ─────────────────────────────────────────────────────────────

  async getTopRated(limit = 20): Promise<Movie[]> {
    const all = await warm();
    return [...all].sort((a, b) => b.rating - a.rating).slice(0, limit);
  },

  // ── Most viewed ───────────────────────────────────────────────────────────

  async getMostViewed(limit = 20): Promise<Movie[]> {
    const all = await warm();
    return [...all].sort((a, b) => b.view_count - a.view_count).slice(0, limit);
  },

  // ── By genre ──────────────────────────────────────────────────────────────

  async getByGenre(genre: string, limit?: number): Promise<Movie[]> {
    const all = await warm();
    const g   = genre.toLowerCase();
    const out = all.filter((m) => m.genre.some((mg) => mg.toLowerCase() === g));
    return limit ? out.slice(0, limit) : out;
  },

  // ── All genres (derived from data, sorted A-Z) ────────────────────────────

  async getAllGenres(): Promise<string[]> {
    const all = await warm();
    const set = new Set<string>();
    all.forEach((m) => m.genre.forEach((g) => set.add(g)));
    return Array.from(set).sort();
  },

  // ── All release years (for filter dropdown) ───────────────────────────────

  async getAllYears(): Promise<string[]> {
    const all = await warm();
    const set = new Set<string>();
    all.forEach((m) => { if (m.release_year) set.add(m.release_year); });
    return Array.from(set).sort((a, b) => Number(b) - Number(a));
  },

  // ── Related movies (same genre, exclude self, sorted by views) ───────────

  async getRelatedMovies(movie: Movie, limit = 8): Promise<Movie[]> {
    const all    = await warm();
    const genres = new Set(movie.genre.map((g) => g.toLowerCase()));
    return all
      .filter((m) => m.$id !== movie.$id && m.genre.some((g) => genres.has(g.toLowerCase())))
      .sort((a, b) => b.view_count - a.view_count)
      .slice(0, limit);
  },

  // ── Increment view count when player starts ───────────────────────────────
  // Optimistic: updates cache instantly, then persists to Appwrite.

  async incrementViewCount(movieId: string): Promise<void> {
    // Optimistic cache update
    if (_cache) {
      const m = _cache.find((m) => m.$id === movieId);
      if (m) m.view_count += 1;
    }
    // Persist — read current value then write +1
    // (Appwrite client SDK has no atomic increment; use a server function for
    //  high-concurrency production use. This is fine for a streaming app.)
    try {
      const doc = await databases.getDocument(DB, MOVIES_COL, movieId);
      await databases.updateDocument(DB, MOVIES_COL, movieId, {
        view_count: (doc.view_count ?? 0) + 1,
      });
    } catch {
      // Non-critical; optimistic update already applied to UI
    }
  },

  // ── Scored full-text search (runs on cached data — instant) ───────────────

  async search(query: string, limit = 50): Promise<SearchResult> {
    const all = await warm();
    const q   = query.toLowerCase().trim();

    if (!q) return { movies: [], query, total: 0 };

    const scored = all
      .map((m) => {
        let score = 0;
        const title   = m.title.toLowerCase();
        const desc    = (m.description ?? "").toLowerCase();
        const summary = (m.ai_summary  ?? "").toLowerCase();

        if (title === q)              score += 100;
        else if (title.startsWith(q)) score += 60;
        else if (title.includes(q))   score += 40;

        if (desc.includes(q))    score += 10;
        if (summary.includes(q)) score += 10;

        m.tags.forEach((t)  => { if (t.toLowerCase().includes(q))  score += 20; });
        m.genre.forEach((g) => { if (g.toLowerCase().includes(q))  score += 25; });

        return { movie: m, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((r) => r.movie);

    return { movies: scored, query, total: scored.length };
  },

  // ── Total movie count ─────────────────────────────────────────────────────

  async getMovieCount(): Promise<number> {
    const all = await warm();
    return all.length;
  },

  // ── Full flat list (library / admin) ─────────────────────────────────────

  async getAllMovies(): Promise<Movie[]> {
    return warm();
  },
};