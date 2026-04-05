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
  sessionType?: "pwa" | "app" | "unknown";
  loginCount?: number;
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
// Helper — detect if running as installed PWA or in a browser tab
// ─────────────────────────────────────────────────────────────────────────────

function detectSessionType(): "pwa" | "app" | "unknown" {
  if (typeof window === "undefined") return "unknown";

  // Installed PWA (standalone / fullscreen / minimal-ui display mode)
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    // iOS Safari "Add to Home Screen"
    (navigator as any).standalone === true;

  if (isStandalone) return "pwa";

  // Native mobile app wrapper (Capacitor / Cordova)
  const ua = navigator.userAgent || "";
  if (
    (window as any).Capacitor?.isNativePlatform?.() ||
    (window as any).cordova ||
    ua.includes("CapacitorApp") ||
    ua.includes("wv") // Android WebView hint
  ) {
    return "app";
  }

  // Regular browser tab — still counts as PWA-capable but not installed
  return "pwa";
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
      const sessionType = detectSessionType();

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
        sessionType,
        loginCount: 1,
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
   * Update lastLoginAt timestamp, sessionType, and loginCount for a user.
   * Call this whenever the user successfully signs in.
   */
  async recordLogin(userId: string): Promise<void> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        ANALYTICS_COLLECTION_ID,
        [Query.equal("userId", userId)]
      );

      const sessionType = detectSessionType();

      if (response.documents.length > 0) {
        const doc = response.documents[0];
        const currentCount = (doc.loginCount as number) || 0;

        await databases.updateDocument(DATABASE_ID, ANALYTICS_COLLECTION_ID, doc.$id, {
          lastLoginAt: new Date().toISOString(),
          isActive: true,
          sessionType,
          loginCount: currentCount + 1,
        });
      }
    } catch (error) {
      console.error("Failed to record login:", error);
    }
  },

  /**
   * Record a session check-in (call on app load / page focus when user is already logged in).
   * Updates sessionType and lastLoginAt without incrementing loginCount.
   */
  async recordSession(userId: string): Promise<void> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        ANALYTICS_COLLECTION_ID,
        [Query.equal("userId", userId)]
      );

      if (response.documents.length > 0) {
        const doc = response.documents[0];
        const sessionType = detectSessionType();

        await databases.updateDocument(DATABASE_ID, ANALYTICS_COLLECTION_ID, doc.$id, {
          lastLoginAt: new Date().toISOString(),
          sessionType,
          isActive: true,
        });
      }
    } catch (error) {
      console.error("Failed to record session:", error);
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
      const libraryResponse = await databases.listDocuments(
        DATABASE_ID,
        USER_LIBRARY_COLLECTION_ID
      );

      const movieStats = new Map<string, {
          watchers: Set<string>;
          totalProgress: number;
          count: number;
          purchases: number;
          revenue: number;
        }>();

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

      const moviesResponse = await databases.listDocuments(
        DATABASE_ID,
        MOVIES_COLLECTION_ID
      );

      const moviesMap = new Map<string, string>();
      for (const movie of moviesResponse.documents) {
        moviesMap.set(movie.$id, movie.title || "Unknown");
      }

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
      const libraryResponse = await databases.listDocuments(
        DATABASE_ID,
        USER_LIBRARY_COLLECTION_ID
      );

      const movieStats = new Map<string, {
          watchers: Set<string>;
          totalProgress: number;
          count: number;
          purchases: number;
          revenue: number;
        }>();

      for (const entry of libraryResponse.documents) {
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

      const moviesResponse = await databases.listDocuments(
        DATABASE_ID,
        MOVIES_COLLECTION_ID
      );

      const moviesMap = new Map<string, string>();
      for (const movie of moviesResponse.documents) {
        moviesMap.set(movie.$id, movie.title || "Unknown");
      }

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