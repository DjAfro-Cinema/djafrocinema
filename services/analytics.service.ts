import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID!;
const ANALYTICS_COLLECTION_ID = process.env.NEXT_PUBLIC_ANALYTICS_COLLECTION_ID!;
const USER_LIBRARY_COLLECTION_ID = process.env.NEXT_PUBLIC_USER_LIBRARY_COLLECTION_ID!;
const MOVIES_COLLECTION_ID = process.env.NEXT_PUBLIC_MOVIES_COLLECTION_ID!;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AnalyticsRecord {
  $id: string;
  userId: string;
  email: string;
  platform: "pwa" | "mobile-app";
  signupMethod: "email" | "otp" | "google-oauth";
  userAgent: string;
  isActive: boolean;
  signupAt: string;
  lastLoginAt?: string;
  $createdAt?: string;
  $updatedAt?: string;
}

export interface ActiveUserStats {
  total: number;
  pwaUsers: number;
  mobileUsers: number;
  emailSignups: number;
  otpSignups: number;
  googleSignups: number;
}

export interface MostWatchedMovie {
  movieId: string;
  movieTitle: string;
  totalWatchers: number;
  avgProgress: number;
  totalTimeWatched: number;
  totalPurchases: number;
  totalRevenue: number;
}

export interface RevenueStats {
  totalRevenue: number;
  totalTransactions: number;
  avgTransactionValue: number;
  topDay: { date: string; revenue: number };
}

// ─────────────────────────────────────────────────────────────────────────────
// Analytics Service
// ─────────────────────────────────────────────────────────────────────────────

export const analyticsService = {
  /**
   * Record a new user signup to analytics collection.
   */
  async recordSignup(
    userId: string,
    email: string,
    signupMethod: "email" | "otp" | "google-oauth",
    platform: "pwa" | "mobile-app" = "pwa"
  ) {
    try {
      const now = new Date().toISOString();
      const userAgent = typeof window !== "undefined" ? navigator.userAgent : "server";

      const { ID } = await import("appwrite");

      const record = {
        userId,
        email,
        platform,
        signupMethod,
        userAgent,
        isActive: true,
        signupAt: now,
        lastLoginAt: now,
      };

      const response = await databases.createDocument(
        DATABASE_ID,
        ANALYTICS_COLLECTION_ID,
        ID.unique(),
        record
      );

      return response;
    } catch (error) {
      console.error("Failed to record signup:", error);
      throw error;
    }
  },

  /**
   * Update lastLoginAt timestamp for a user.
   */
  async recordLogin(userId: string): Promise<void> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        ANALYTICS_COLLECTION_ID,
        [Query.equal("userId", userId)]
      );

      if (response.documents.length > 0) {
        const docId = response.documents[0].$id;
        await databases.updateDocument(DATABASE_ID, ANALYTICS_COLLECTION_ID, docId, {
          lastLoginAt: new Date().toISOString(),
          isActive: true,
        });
      }
    } catch (error) {
      console.error("Failed to record login:", error);
    }
  },

  /**
   * Get all active users.
   */
  async getActiveUsers(): Promise<AnalyticsRecord[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        ANALYTICS_COLLECTION_ID,
        [Query.equal("isActive", true), Query.limit(500)]
      );

      return response.documents as unknown as AnalyticsRecord[];
    } catch (error) {
      console.error("Failed to fetch active users:", error);
      return [];
    }
  },

  /**
   * Get only PWA users.
   */
  async getActivePWAUsers(): Promise<AnalyticsRecord[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        ANALYTICS_COLLECTION_ID,
        [Query.equal("platform", "pwa"), Query.equal("isActive", true), Query.limit(500)]
      );

      return response.documents as unknown as AnalyticsRecord[];
    } catch (error) {
      console.error("Failed to fetch PWA users:", error);
      return [];
    }
  },

  /**
   * Get only mobile app users.
   */
  async getActiveMobileUsers(): Promise<AnalyticsRecord[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        ANALYTICS_COLLECTION_ID,
        [Query.equal("platform", "mobile-app"), Query.equal("isActive", true), Query.limit(500)]
      );

      return response.documents as unknown as AnalyticsRecord[];
    } catch (error) {
      console.error("Failed to fetch mobile users:", error);
      return [];
    }
  },

  /**
   * Get signup statistics.
   */
  async getSignupStats(): Promise<ActiveUserStats> {
    try {
      const allUsers = await databases.listDocuments(
        DATABASE_ID,
        ANALYTICS_COLLECTION_ID,
        [Query.limit(1000)]
      );

      const docs = allUsers.documents as unknown as AnalyticsRecord[];

      return {
        total: docs.length,
        pwaUsers: docs.filter((u) => u.platform === "pwa").length,
        mobileUsers: docs.filter((u) => u.platform === "mobile-app").length,
        emailSignups: docs.filter((u) => u.signupMethod === "email").length,
        otpSignups: docs.filter((u) => u.signupMethod === "otp").length,
        googleSignups: docs.filter((u) => u.signupMethod === "google-oauth").length,
      };
    } catch (error) {
      console.error("Failed to fetch signup stats:", error);
      return {
        total: 0,
        pwaUsers: 0,
        mobileUsers: 0,
        emailSignups: 0,
        otpSignups: 0,
        googleSignups: 0,
      };
    }
  },

  /**
   * Get most watched movies - NO INVALID QUERIES.
   */
  async getMostWatchedMovies(limit: number = 20): Promise<MostWatchedMovie[]> {
    try {
      // Fetch all library entries - no query filters
      const libraryResponse = await databases.listDocuments(
        DATABASE_ID,
        USER_LIBRARY_COLLECTION_ID
      );

      // Group by movieId
      const movieStats = new Map<
        string,
        {
          watchers: Set<string>;
          totalProgress: number;
          count: number;
          purchases: number;
          revenue: number;
        }
      >();

      for (const entry of libraryResponse.documents) {
        const movieId = entry.movieId as string;
        const userId = entry.userId as string;
        const progress = (entry.progress as number) || 0;
        const amountPaid = (entry.amountPaid as number) || 0;
        const isPurchased = !!entry.purchasedAt;

        if (!movieId || !userId) continue;

        if (!movieStats.has(movieId)) {
          movieStats.set(movieId, {
            watchers: new Set<string>(),
            totalProgress: 0,
            count: 0,
            purchases: 0,
            revenue: 0,
          });
        }

        const stat = movieStats.get(movieId)!;
        stat.watchers.add(userId);
        stat.totalProgress += progress;
        stat.count += 1;
        if (isPurchased) {
          stat.purchases += 1;
          stat.revenue += amountPaid;
        }
      }

      // Fetch all movies
      const moviesResponse = await databases.listDocuments(
        DATABASE_ID,
        MOVIES_COLLECTION_ID
      );

      const moviesMap = new Map<string, string>();
      for (const movie of moviesResponse.documents) {
        moviesMap.set(movie.$id, movie.title || "Unknown");
      }

      // Build results
      const results: MostWatchedMovie[] = Array.from(movieStats.entries()).map(
        ([movieId, stat]) => ({
          movieId,
          movieTitle: moviesMap.get(movieId) || "Unknown",
          totalWatchers: stat.watchers.size,
          avgProgress: stat.count > 0 ? Math.round((stat.totalProgress / stat.count) * 100) : 0,
          totalTimeWatched: stat.totalProgress,
          totalPurchases: stat.purchases,
          totalRevenue: stat.revenue,
        })
      );

      return results.sort((a, b) => b.totalWatchers - a.totalWatchers).slice(0, limit);
    } catch (error) {
      console.error("Failed to fetch most watched movies:", error);
      return [];
    }
  },

  /**
   * Get most purchased movies.
   */
  async getMostPurchasedMovies(limit: number = 20): Promise<MostWatchedMovie[]> {
    try {
      // Fetch all library entries
      const libraryResponse = await databases.listDocuments(
        DATABASE_ID,
        USER_LIBRARY_COLLECTION_ID
      );

      // Group by movieId, filter only purchased
      const movieStats = new Map<
        string,
        {
          watchers: Set<string>;
          totalProgress: number;
          count: number;
          purchases: number;
          revenue: number;
        }
      >();

      for (const entry of libraryResponse.documents) {
        // Only count if purchased
        if (!entry.purchasedAt) continue;

        const movieId = entry.movieId as string;
        const userId = entry.userId as string;
        const progress = (entry.progress as number) || 0;
        const amountPaid = (entry.amountPaid as number) || 0;

        if (!movieId || !userId) continue;

        if (!movieStats.has(movieId)) {
          movieStats.set(movieId, {
            watchers: new Set<string>(),
            totalProgress: 0,
            count: 0,
            purchases: 0,
            revenue: 0,
          });
        }

        const stat = movieStats.get(movieId)!;
        stat.watchers.add(userId);
        stat.totalProgress += progress;
        stat.count += 1;
        stat.purchases += 1;
        stat.revenue += amountPaid;
      }

      // Fetch all movies
      const moviesResponse = await databases.listDocuments(
        DATABASE_ID,
        MOVIES_COLLECTION_ID
      );

      const moviesMap = new Map<string, string>();
      for (const movie of moviesResponse.documents) {
        moviesMap.set(movie.$id, movie.title || "Unknown");
      }

      // Build results
      const results: MostWatchedMovie[] = Array.from(movieStats.entries()).map(
        ([movieId, stat]) => ({
          movieId,
          movieTitle: moviesMap.get(movieId) || "Unknown",
          totalWatchers: stat.watchers.size,
          avgProgress: stat.count > 0 ? Math.round((stat.totalProgress / stat.count) * 100) : 0,
          totalTimeWatched: stat.totalProgress,
          totalPurchases: stat.purchases,
          totalRevenue: stat.revenue,
        })
      );

      return results.sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, limit);
    } catch (error) {
      console.error("Failed to fetch most purchased movies:", error);
      return [];
    }
  },

  /**
   * Get revenue statistics from user_library (purchases).
   */
  async getRevenueStats(): Promise<RevenueStats> {
    try {
      const libraryResponse = await databases.listDocuments(
        DATABASE_ID,
        USER_LIBRARY_COLLECTION_ID
      );

      const purchases = libraryResponse.documents.filter((d) => !!d.purchasedAt);
      const totalRevenue = purchases.reduce((sum, d) => sum + ((d.amountPaid as number) || 0), 0);

      // Group by date for top day
      const byDate = new Map<string, number>();
      for (const doc of purchases) {
        const date = new Date(doc.purchasedAt as string).toISOString().split("T")[0];
        byDate.set(date, (byDate.get(date) || 0) + ((doc.amountPaid as number) || 0));
      }

      let topDay = { date: "N/A", revenue: 0 };
      for (const [date, revenue] of byDate.entries()) {
        if (revenue > topDay.revenue) {
          topDay = { date, revenue };
        }
      }

      return {
        totalRevenue,
        totalTransactions: purchases.length,
        avgTransactionValue: purchases.length > 0 ? Math.round(totalRevenue / purchases.length) : 0,
        topDay,
      };
    } catch (error) {
      console.error("Failed to fetch revenue stats:", error);
      return {
        totalRevenue: 0,
        totalTransactions: 0,
        avgTransactionValue: 0,
        topDay: { date: "N/A", revenue: 0 },
      };
    }
  },

  /**
   * Deactivate a user.
   */
  async deactivateUser(userId: string): Promise<void> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        ANALYTICS_COLLECTION_ID,
        [Query.equal("userId", userId)]
      );

      if (response.documents.length > 0) {
        const docId = response.documents[0].$id;
        await databases.updateDocument(
          DATABASE_ID,
          ANALYTICS_COLLECTION_ID,
          docId,
          { isActive: false }
        );
      }
    } catch (error) {
      console.error("Failed to deactivate user:", error);
    }
  },
};