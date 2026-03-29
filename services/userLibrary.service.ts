import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID!;
const USER_LIBRARY_COLLECTION_ID = process.env.NEXT_PUBLIC_USER_LIBRARY_COLLECTION_ID!;
const MOVIES_COLLECTION_ID = process.env.NEXT_PUBLIC_MOVIES_COLLECTION_ID!;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Movie {
  $id: string;
  title: string;
  genre: string[];
  poster_url: string;
  duration: string;
  release_year: string;
  rating: number;
  premium_only: boolean;
  quality_options: string[];
  download_enabled: boolean;
  view_count: number;
  is_featured: boolean;
  is_trending: boolean;
  video_url?: string;
  description?: string;
  ai_summary?: string;
  tags?: string[];
}

export interface UserLibraryEntry {
  $id: string;
  userId: string;
  movieId: string;
  type: string[]; // e.g. ["purchased"], ["watching"], ["watched"]
  progress: number; // 0–1 double
  rating?: number;
  isWishlisted: boolean;
  lastWatchedAt?: number; // unix ms
  downloadPath?: string;
  downloadSize?: number;
  downloadQuality?: string;
  purchasedAt?: string; // datetime string
  paymentReference?: string;
  purchaseType?: string;
  amountPaid?: number;
  $createdAt: string;
  $updatedAt: string;
}

export interface WatchProgress {
  entry: UserLibraryEntry;
  movie: Movie;
  progressPercent: number; // 0–100 derived from entry.progress * 100
  lastWatchedAt: string | null; // ISO string derived from entry.lastWatchedAt
}

export interface PurchasedMovie {
  entry: UserLibraryEntry;
  movie: Movie;
  paidAt: string;
  amount: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function msToIso(ms: number | undefined): string | null {
  if (!ms) return null;
  return new Date(ms).toISOString();
}

async function fetchMoviesByIds(ids: string[]): Promise<Map<string, Movie>> {
  if (ids.length === 0) return new Map();

  // Appwrite Query.equal supports arrays
  const unique = [...new Set(ids)];
  const res = await databases.listDocuments(DATABASE_ID, MOVIES_COLLECTION_ID, [
    Query.equal("$id", unique),
    Query.limit(unique.length),
  ]);

  const map = new Map<string, Movie>();
  for (const doc of res.documents) {
    map.set(doc.$id, doc as unknown as Movie);
  }
  return map;
}

// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────

export const userLibraryService = {
  /**
   * Fetch all library entries for a user.
   * Returns raw entries — call the typed helpers below for shaped data.
   */
  async getAllEntries(userId: string): Promise<UserLibraryEntry[]> {
    const res = await databases.listDocuments(DATABASE_ID, USER_LIBRARY_COLLECTION_ID, [
      Query.equal("userId", userId),
      Query.limit(200),
    ]);
    return res.documents as unknown as UserLibraryEntry[];
  },

  /**
   * Movies currently in progress (progress > 0 and progress < 1).
   */
  async getContinueWatching(userId: string): Promise<WatchProgress[]> {
    const res = await databases.listDocuments(DATABASE_ID, USER_LIBRARY_COLLECTION_ID, [
      Query.equal("userId", userId),
      Query.greaterThan("progress", 0),
      Query.lessThan("progress", 1),
      Query.orderDesc("lastWatchedAt"),
      Query.limit(20),
    ]);

    const entries = res.documents as unknown as UserLibraryEntry[];
    const movieIds = entries.map((e) => e.movieId);
    const moviesMap = await fetchMoviesByIds(movieIds);

    return entries
      .filter((e) => moviesMap.has(e.movieId))
      .map((e) => ({
        entry: e,
        movie: moviesMap.get(e.movieId)!,
        progressPercent: Math.round(e.progress * 100),
        lastWatchedAt: msToIso(e.lastWatchedAt),
      }));
  },

  /**
   * Completed movies (progress === 1 or type includes "watched").
   */
  async getWatchHistory(userId: string): Promise<WatchProgress[]> {
    const res = await databases.listDocuments(DATABASE_ID, USER_LIBRARY_COLLECTION_ID, [
      Query.equal("userId", userId),
      Query.equal("progress", 1),
      Query.orderDesc("lastWatchedAt"),
      Query.limit(50),
    ]);

    const entries = res.documents as unknown as UserLibraryEntry[];
    const movieIds = entries.map((e) => e.movieId);
    const moviesMap = await fetchMoviesByIds(movieIds);

    return entries
      .filter((e) => moviesMap.has(e.movieId))
      .map((e) => ({
        entry: e,
        movie: moviesMap.get(e.movieId)!,
        progressPercent: 100,
        lastWatchedAt: msToIso(e.lastWatchedAt),
      }));
  },

  /**
   * Purchased / owned movies (purchasedAt is set or type includes "purchased").
   */
  async getPurchasedMovies(userId: string): Promise<PurchasedMovie[]> {
    const res = await databases.listDocuments(DATABASE_ID, USER_LIBRARY_COLLECTION_ID, [
      Query.equal("userId", userId),
      Query.isNotNull("purchasedAt"),
      Query.orderDesc("purchasedAt"),
      Query.limit(100),
    ]);

    const entries = res.documents as unknown as UserLibraryEntry[];
    const movieIds = entries.map((e) => e.movieId);
    const moviesMap = await fetchMoviesByIds(movieIds);

    return entries
      .filter((e) => moviesMap.has(e.movieId))
      .map((e) => ({
        entry: e,
        movie: moviesMap.get(e.movieId)!,
        paidAt: e.purchasedAt!,
        amount: e.amountPaid ?? 0,
      }));
  },

  /**
   * Update watch progress for a movie.
   * progress: 0–1 float. lastWatchedAt: Date.now() unix ms.
   */
  async updateProgress(
    userId: string,
    movieId: string,
    progress: number
  ): Promise<void> {
    // Find existing entry
    const res = await databases.listDocuments(DATABASE_ID, USER_LIBRARY_COLLECTION_ID, [
      Query.equal("userId", userId),
      Query.equal("movieId", movieId),
      Query.limit(1),
    ]);

    const data = {
      progress: Math.min(1, Math.max(0, progress)),
      lastWatchedAt: Date.now(),
    };

    if (res.documents.length > 0) {
      await databases.updateDocument(
        DATABASE_ID,
        USER_LIBRARY_COLLECTION_ID,
        res.documents[0].$id,
        data
      );
    } else {
      const { ID } = await import("appwrite");
      await databases.createDocument(
        DATABASE_ID,
        USER_LIBRARY_COLLECTION_ID,
        ID.unique(),
        {
          userId,
          movieId,
          type: ["watching"],
          isWishlisted: false,
          ...data,
        }
      );
    }
  },

  /**
   * Library stats for a user.
   */
  async getStats(userId: string): Promise<{
    owned: number;
    inProgress: number;
    completed: number;
    avgProgress: number;
  }> {
    const entries = await userLibraryService.getAllEntries(userId);
    const owned = entries.filter((e) => !!e.purchasedAt).length;
    const inProgress = entries.filter((e) => e.progress > 0 && e.progress < 1);
    const completed = entries.filter((e) => e.progress >= 1).length;
    const avgProgress =
      inProgress.length > 0
        ? Math.round(
            (inProgress.reduce((sum, e) => sum + e.progress, 0) / inProgress.length) * 100
          )
        : 0;
    return { owned, inProgress: inProgress.length, completed, avgProgress };
  },
};