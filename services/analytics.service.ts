import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";

const DATABASE_ID                  = process.env.NEXT_PUBLIC_DATABASE_ID!;
const ANALYTICS_COLLECTION_ID      = process.env.NEXT_PUBLIC_ANALYTICS_COLLECTION_ID!;
const USER_LIBRARY_COLLECTION_ID   = process.env.NEXT_PUBLIC_USER_LIBRARY_COLLECTION_ID!;
const MOVIES_COLLECTION_ID         = process.env.NEXT_PUBLIC_MOVIES_COLLECTION_ID!;
const USER_SESSIONS_COLLECTION_ID  = process.env.NEXT_PUBLIC_USER_SESSIONS_COLLECTION_ID!;

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

export interface SessionRecord {
  $id: string;
  userId: string;
  email: string;
  sessionType: "pwa" | "app" | "unknown";
  platform: "pwa" | "mobile-app";
  signupMethod: string;
  userAgent: string;
  loginAt: string;
  $createdAt?: string;
}

export interface SessionStats {
  totalSessions: number;
  pwaSessions: number;
  appSessions: number;
  uniqueUsersToday: number;
  uniqueUsersThisWeek: number;
  sessionsToday: number;
  sessionsThisWeek: number;
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
// Helper — detect if running as installed PWA, native app, or browser tab
// ─────────────────────────────────────────────────────────────────────────────

function detectSessionType(): "pwa" | "app" | "unknown" {
  if (typeof window === "undefined") return "unknown";

  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    (navigator as any).standalone === true;

  if (isStandalone) return "pwa";

  const ua = navigator.userAgent || "";
  if (
    (window as any).Capacitor?.isNativePlatform?.() ||
    (window as any).cordova ||
    ua.includes("CapacitorApp") ||
    ua.includes("wv")
  ) {
    return "app";
  }

  // Regular browser — still a web/PWA session
  return "pwa";
}

// ─────────────────────────────────────────────────────────────────────────────
// Analytics Service
// ─────────────────────────────────────────────────────────────────────────────

export const analyticsService = {

  // ── SIGNUP ────────────────────────────────────────────────────────────────

  async recordSignup(
    userId: string,
    email: string,
    signupMethod: "email" | "otp" | "google-oauth",
    platform: "pwa" | "mobile-app" = "pwa"
  ) {
    try {
      const now = new Date().toISOString();
      const userAgent   = typeof window !== "undefined" ? navigator.userAgent : "server";
      const sessionType = detectSessionType();
      const { ID } = await import("appwrite");

      // 1. Write to analytics collection (one doc per user — their profile row)
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

      // 2. Also write a session event to user_sessions
      await analyticsService.recordSessionEvent(userId, email, signupMethod, platform);

      return response;
    } catch (error) {
      console.error("Failed to record signup:", error);
      throw error;
    }
  },

  // ── LOGIN — updates the analytics profile row + writes a session event ────

  async recordLogin(userId: string): Promise<void> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        ANALYTICS_COLLECTION_ID,
        [Query.equal("userId", userId)]
      );

      const sessionType = detectSessionType();

      if (response.documents.length > 0) {
        const doc          = response.documents[0];
        const currentCount = (doc.loginCount as number) || 0;

        // Update the profile row
        await databases.updateDocument(
          DATABASE_ID,
          ANALYTICS_COLLECTION_ID,
          doc.$id,
          {
            lastLoginAt: new Date().toISOString(),
            isActive: true,
            sessionType,
            loginCount: currentCount + 1,
          }
        );

        // Write a fresh session event row
        await analyticsService.recordSessionEvent(
          userId,
          doc.email as string,
          doc.signupMethod as string,
          doc.platform as "pwa" | "mobile-app"
        );
      }
    } catch (error) {
      console.error("Failed to record login:", error);
    }
  },

  // ── SESSION EVENT — one new row in user_sessions per login ───────────────

  async recordSessionEvent(
    userId: string,
    email: string,
    signupMethod: string,
    platform: "pwa" | "mobile-app" = "pwa"
  ): Promise<void> {
    try {
      const { ID } = await import("appwrite");
      const sessionType = detectSessionType();
      const userAgent   = typeof window !== "undefined" ? navigator.userAgent : "server";

      await databases.createDocument(
        DATABASE_ID,
        USER_SESSIONS_COLLECTION_ID,
        ID.unique(),
        {
          userId,
          email,
          sessionType,
          platform,
          signupMethod,
          userAgent,
          loginAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error("Failed to record session event:", error);
      // Non-blocking — don't rethrow
    }
  },

  // ── SESSION STATS — for the admin dashboard ───────────────────────────────

  async getSessionStats(): Promise<SessionStats> {
    try {
      const res  = await databases.listDocuments(
        DATABASE_ID,
        USER_SESSIONS_COLLECTION_ID,
        [Query.limit(2000), Query.orderDesc("loginAt")]
      );

      const sessions = res.documents as unknown as SessionRecord[];

      const now       = new Date();
      const todayStr  = now.toISOString().split("T")[0];
      const weekAgo   = new Date(now.getTime() - 7 * 86400000);

      const sessionsToday     = sessions.filter(s => s.loginAt?.startsWith(todayStr));
      const sessionsThisWeek  = sessions.filter(s => new Date(s.loginAt) >= weekAgo);

      const uniqueUsersToday     = new Set(sessionsToday.map(s => s.userId)).size;
      const uniqueUsersThisWeek  = new Set(sessionsThisWeek.map(s => s.userId)).size;

      return {
        totalSessions:      sessions.length,
        pwaSessions:        sessions.filter(s => s.sessionType === "pwa").length,
        appSessions:        sessions.filter(s => s.sessionType === "app").length,
        uniqueUsersToday,
        uniqueUsersThisWeek,
        sessionsToday:      sessionsToday.length,
        sessionsThisWeek:   sessionsThisWeek.length,
      };
    } catch (error) {
      console.error("Failed to fetch session stats:", error);
      return {
        totalSessions: 0, pwaSessions: 0, appSessions: 0,
        uniqueUsersToday: 0, uniqueUsersThisWeek: 0,
        sessionsToday: 0, sessionsThisWeek: 0,
      };
    }
  },

  // ── GET RECENT SESSIONS — for the admin table ─────────────────────────────

  async getRecentSessions(limit = 200): Promise<SessionRecord[]> {
    try {
      const res = await databases.listDocuments(
        DATABASE_ID,
        USER_SESSIONS_COLLECTION_ID,
        [Query.limit(limit), Query.orderDesc("loginAt")]
      );
      return res.documents as unknown as SessionRecord[];
    } catch (error) {
      console.error("Failed to fetch recent sessions:", error);
      return [];
    }
  },

  // ── EXISTING METHODS (unchanged) ──────────────────────────────────────────

  async recordSession(userId: string): Promise<void> {
    try {
      const res = await databases.listDocuments(
        DATABASE_ID,
        ANALYTICS_COLLECTION_ID,
        [Query.equal("userId", userId)]
      );

      if (res.documents.length > 0) {
        const doc         = res.documents[0];
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

  async getSignupStats(): Promise<ActiveUserStats> {
    try {
      const allUsers = await databases.listDocuments(
        DATABASE_ID,
        ANALYTICS_COLLECTION_ID,
        [Query.limit(1000)]
      );
      const docs = allUsers.documents as unknown as AnalyticsRecord[];
      return {
        total:        docs.length,
        pwaUsers:     docs.filter(u => u.platform === "pwa").length,
        mobileUsers:  docs.filter(u => u.platform === "mobile-app").length,
        emailSignups: docs.filter(u => u.signupMethod === "email").length,
        otpSignups:   docs.filter(u => u.signupMethod === "otp").length,
        googleSignups:docs.filter(u => u.signupMethod === "google-oauth").length,
      };
    } catch (error) {
      console.error("Failed to fetch signup stats:", error);
      return { total: 0, pwaUsers: 0, mobileUsers: 0, emailSignups: 0, otpSignups: 0, googleSignups: 0 };
    }
  },

  async getMostWatchedMovies(limit: number = 20): Promise<MostWatchedMovie[]> {
    try {
      const libraryResponse = await databases.listDocuments(DATABASE_ID, USER_LIBRARY_COLLECTION_ID);
      const movieStats = new Map<string, { watchers: Set<string>; totalProgress: number; count: number; purchases: number; revenue: number }>();

      for (const entry of libraryResponse.documents) {
        const movieId    = entry.movieId as string;
        const userId     = entry.userId as string;
        const progress   = (entry.progress as number) || 0;
        const amountPaid = (entry.amountPaid as number) || 0;
        const isPurchased = !!entry.purchasedAt;
        if (!movieId || !userId) continue;
        if (!movieStats.has(movieId)) movieStats.set(movieId, { watchers: new Set(), totalProgress: 0, count: 0, purchases: 0, revenue: 0 });
        const stat = movieStats.get(movieId)!;
        stat.watchers.add(userId);
        stat.totalProgress += progress;
        stat.count += 1;
        if (isPurchased) { stat.purchases += 1; stat.revenue += amountPaid; }
      }

      const moviesResponse = await databases.listDocuments(DATABASE_ID, MOVIES_COLLECTION_ID);
      const moviesMap = new Map<string, string>();
      for (const movie of moviesResponse.documents) moviesMap.set(movie.$id, movie.title || "Unknown");

      return Array.from(movieStats.entries())
        .map(([movieId, stat]) => ({
          movieId,
          movieTitle: moviesMap.get(movieId) || "Unknown",
          totalWatchers: stat.watchers.size,
          avgProgress: stat.count > 0 ? Math.round((stat.totalProgress / stat.count) * 100) : 0,
          totalTimeWatched: stat.totalProgress,
          totalPurchases: stat.purchases,
          totalRevenue: stat.revenue,
        }))
        .sort((a, b) => b.totalWatchers - a.totalWatchers)
        .slice(0, limit);
    } catch (error) {
      console.error("Failed to fetch most watched movies:", error);
      return [];
    }
  },

  async getMostPurchasedMovies(limit: number = 20): Promise<MostWatchedMovie[]> {
    try {
      const libraryResponse = await databases.listDocuments(DATABASE_ID, USER_LIBRARY_COLLECTION_ID);
      const movieStats = new Map<string, { watchers: Set<string>; totalProgress: number; count: number; purchases: number; revenue: number }>();

      for (const entry of libraryResponse.documents) {
        if (!entry.purchasedAt) continue;
        const movieId    = entry.movieId as string;
        const userId     = entry.userId as string;
        const progress   = (entry.progress as number) || 0;
        const amountPaid = (entry.amountPaid as number) || 0;
        if (!movieId || !userId) continue;
        if (!movieStats.has(movieId)) movieStats.set(movieId, { watchers: new Set(), totalProgress: 0, count: 0, purchases: 0, revenue: 0 });
        const stat = movieStats.get(movieId)!;
        stat.watchers.add(userId);
        stat.totalProgress += progress;
        stat.count += 1;
        stat.purchases += 1;
        stat.revenue += amountPaid;
      }

      const moviesResponse = await databases.listDocuments(DATABASE_ID, MOVIES_COLLECTION_ID);
      const moviesMap = new Map<string, string>();
      for (const movie of moviesResponse.documents) moviesMap.set(movie.$id, movie.title || "Unknown");

      return Array.from(movieStats.entries())
        .map(([movieId, stat]) => ({
          movieId,
          movieTitle: moviesMap.get(movieId) || "Unknown",
          totalWatchers: stat.watchers.size,
          avgProgress: stat.count > 0 ? Math.round((stat.totalProgress / stat.count) * 100) : 0,
          totalTimeWatched: stat.totalProgress,
          totalPurchases: stat.purchases,
          totalRevenue: stat.revenue,
        }))
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, limit);
    } catch (error) {
      console.error("Failed to fetch most purchased movies:", error);
      return [];
    }
  },

  async getRevenueStats(): Promise<RevenueStats> {
    try {
      const libraryResponse = await databases.listDocuments(DATABASE_ID, USER_LIBRARY_COLLECTION_ID);
      const purchases    = libraryResponse.documents.filter(d => !!d.purchasedAt);
      const totalRevenue = purchases.reduce((sum, d) => sum + ((d.amountPaid as number) || 0), 0);
      const byDate       = new Map<string, number>();
      for (const doc of purchases) {
        const date = new Date(doc.purchasedAt as string).toISOString().split("T")[0];
        byDate.set(date, (byDate.get(date) || 0) + ((doc.amountPaid as number) || 0));
      }
      let topDay = { date: "N/A", revenue: 0 };
      for (const [date, revenue] of byDate.entries()) {
        if (revenue > topDay.revenue) topDay = { date, revenue };
      }
      return {
        totalRevenue,
        totalTransactions: purchases.length,
        avgTransactionValue: purchases.length > 0 ? Math.round(totalRevenue / purchases.length) : 0,
        topDay,
      };
    } catch (error) {
      console.error("Failed to fetch revenue stats:", error);
      return { totalRevenue: 0, totalTransactions: 0, avgTransactionValue: 0, topDay: { date: "N/A", revenue: 0 } };
    }
  },

  async deactivateUser(userId: string): Promise<void> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        ANALYTICS_COLLECTION_ID,
        [Query.equal("userId", userId)]
      );
      if (response.documents.length > 0) {
        await databases.updateDocument(DATABASE_ID, ANALYTICS_COLLECTION_ID, response.documents[0].$id, { isActive: false });
      }
    } catch (error) {
      console.error("Failed to deactivate user:", error);
    }
  },
};