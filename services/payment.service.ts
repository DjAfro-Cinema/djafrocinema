// services/payment.service.ts
// STK push goes via /api/payments/stk-push (same origin) — no CORS.
// Appwrite reads stay client-side — SDK handles auth headers itself.

import { databases } from "@/lib/appwrite";
import { Query, ID } from "appwrite";

const DB  = process.env.NEXT_PUBLIC_DATABASE_ID!;
const PAY = process.env.NEXT_PUBLIC_PAYMENTS_COLLECTION_ID!;
const LIB = process.env.NEXT_PUBLIC_USER_LIBRARY_COLLECTION_ID!;

// ─── Types ────────────────────────────────────────────────────────────────────

export type PaymentStatus = "pending" | "completed" | "failed" | "cancelled";

export interface Payment {
  $id: string;
  userId: string;
  movieId: string;
  movieIds?: string[];
  reference?: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod?: string;
  paidAt?: string;
  phoneNumber?: string;
  currency?: string;
  paymentType?: string;
  offerType?: string;
  offerReference?: string;
  invoiceId?: string;
  checkoutId?: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface PaymentStats {
  totalSpent: number;
  totalMovies: number;
  completedPayments: number;
  pendingPayments: number;
}

export interface PaymentResult {
  success: boolean;
  message: string;
  data?: {
    reference?: string;
    invoiceId?: string;
    checkoutId?: string;
    amount?: number;
    phoneNumber?: string;
    status?: string;
    alreadyPaid?: boolean;
    paymentType?: string;
    moviesCount?: number;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPhone(raw: string): string {
  let p = raw.replace(/[^\d+]/g, "");
  if (p.startsWith("+254")) p = p.slice(1);
  if (p.startsWith("07"))   p = "254" + p.slice(1);
  if (p.startsWith("01"))   p = "254" + p.slice(1);
  return p;
}

function validKenyanPhone(raw: string): boolean {
  const p = formatPhone(raw);
  return p.startsWith("254") && p.length === 12 && /^254(7|1)\d/.test(p);
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const paymentService = {

  // ── STK Push (proxied through Next.js API to avoid CORS) ──────────────────

  async initiateSTKPush(
    movieId: string,
    userId: string,
    phoneNumber: string,
    customAmount?: number,
    movieIds?: string[],
    offerReference?: string,
  ): Promise<PaymentResult> {
    const formatted = formatPhone(phoneNumber);

    if (!validKenyanPhone(formatted)) {
      return {
        success: false,
        message: "Invalid M-Pesa number. Please enter a valid Kenyan number (07XX or 01XX).",
      };
    }

    const already = await paymentService.hasUserPaidForMovie(userId, movieId);
    if (already) {
      return { success: true, message: "Already purchased", data: { alreadyPaid: true } };
    }

    const amount = customAmount ?? Number(process.env.NEXT_PUBLIC_MOVIE_PRICE ?? 10);

    try {
      const res = await fetch("/api/payments/stk-push", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId,
          movieIds: movieIds ?? [movieId],
          userId,
          phoneNumber: formatted,
          amount,
          offerType:      movieIds && movieIds.length > 1 ? "bundle" : "single",
          offerReference: offerReference ?? null,
        }),
      });

      let json: Record<string, unknown>;
      try { json = await res.json(); }
      catch { return { success: false, message: "Payment service returned an invalid response." }; }

      if (json.success === true) {
        return {
          success: true,
          message: (json.message as string) ?? "STK Push sent. Check your phone.",
          data:    json.data as PaymentResult["data"],
        };
      }
      return {
        success: false,
        message: (json.error as string) ?? (json.message as string) ?? "Failed to initiate payment.",
      };
    } catch (err) {
      console.error("[paymentService.initiateSTKPush]", err);
      return { success: false, message: "Network error. Check your connection and try again." };
    }
  },

  // ── Payment checks ────────────────────────────────────────────────────────

  async hasUserPaidForMovie(userId: string, movieId: string): Promise<boolean> {
    if (!userId || !movieId) return false;
    try {
      const direct = await databases.listDocuments(DB, PAY, [
        Query.equal("userId",  userId),
        Query.equal("movieId", movieId),
        Query.equal("status",  "completed"),
        Query.limit(1),
      ]);
      if (direct.total > 0) return true;

      // Also check bundle payments
      const bundles = await databases.listDocuments(DB, PAY, [
        Query.equal("userId", userId),
        Query.equal("status", "completed"),
        Query.isNotNull("movieIds"),
        Query.limit(100),
      ]);
      for (const doc of bundles.documents) {
        const ids: string[] = Array.isArray(doc.movieIds) ? (doc.movieIds as string[]) : [];
        if (ids.includes(movieId)) return true;
      }
      return false;
    } catch (err) {
      console.error("[paymentService.hasUserPaidForMovie]", err);
      return false;
    }
  },

  async getPaidMovieIds(userId: string): Promise<string[]> {
    if (!userId) return [];
    try {
      const res = await databases.listDocuments(DB, PAY, [
        Query.equal("userId", userId),
        Query.equal("status", "completed"),
        Query.limit(200),
      ]);
      const set = new Set<string>();
      for (const doc of res.documents) {
        if (doc.movieId) set.add(doc.movieId as string);
        if (Array.isArray(doc.movieIds)) {
          (doc.movieIds as string[]).forEach((id) => set.add(id));
        }
      }
      return Array.from(set);
    } catch (err) {
      console.error("[paymentService.getPaidMovieIds]", err);
      return [];
    }
  },

  async getByReference(reference: string): Promise<Payment | null> {
    if (!reference) return null;
    try {
      const res = await databases.listDocuments(DB, PAY, [
        Query.equal("reference", reference),
        Query.limit(1),
      ]);
      if (res.total === 0) return null;
      return res.documents[0] as unknown as Payment;
    } catch (err) {
      console.error("[paymentService.getByReference]", err);
      return null;
    }
  },

  // ── User data ─────────────────────────────────────────────────────────────

  async getUserPayments(userId: string): Promise<Payment[]> {
    if (!userId) return [];
    try {
      const res = await databases.listDocuments(DB, PAY, [
        Query.equal("userId", userId),
        Query.orderDesc("$createdAt"),
        Query.limit(100),
      ]);
      return res.documents as unknown as Payment[];
    } catch (err) {
      console.error("[paymentService.getUserPayments]", err);
      return [];
    }
  },

  /**
   * Stats for Library page stats bar.
   * Used by usePayments hook → LibraryPage → StatsBar.
   */
  async getPaymentStats(userId: string): Promise<PaymentStats> {
    const empty: PaymentStats = {
      totalSpent: 0, totalMovies: 0,
      completedPayments: 0, pendingPayments: 0,
    };
    if (!userId) return empty;
    try {
      const res = await databases.listDocuments(DB, PAY, [
        Query.equal("userId", userId),
        Query.limit(200),
      ]);
      const completed = res.documents.filter((d) => d.status === "completed");
      const pending   = res.documents.filter((d) => d.status === "pending");

      const movieSet = new Set<string>();
      for (const doc of completed) {
        if (doc.movieId) movieSet.add(doc.movieId as string);
        if (Array.isArray(doc.movieIds)) {
          (doc.movieIds as string[]).forEach((id) => movieSet.add(id));
        }
      }

      return {
        totalSpent:        completed.reduce((sum, d) => sum + ((d.amount as number) ?? 0), 0),
        totalMovies:       movieSet.size,
        completedPayments: completed.length,
        pendingPayments:   pending.length,
      };
    } catch (err) {
      console.error("[paymentService.getPaymentStats]", err);
      return empty;
    }
  },

  // ── Wishlist ──────────────────────────────────────────────────────────────

  async addToWishlist(userId: string, movieId: string): Promise<boolean> {
    if (!userId || !movieId) return false;
    try {
      const existing = await databases.listDocuments(DB, LIB, [
        Query.equal("userId",  userId),
        Query.equal("movieId", movieId),
        Query.limit(1),
      ]);
      if (existing.total > 0) {
        await databases.updateDocument(DB, LIB, existing.documents[0].$id, { isWishlisted: true });
      } else {
        await databases.createDocument(DB, LIB, ID.unique(), {
          userId, movieId, type: [], progress: 0, isWishlisted: true,
        });
      }
      return true;
    } catch (err) {
      console.error("[paymentService.addToWishlist]", err);
      return false;
    }
  },

  async removeFromWishlist(userId: string, movieId: string): Promise<boolean> {
    if (!userId || !movieId) return false;
    try {
      const existing = await databases.listDocuments(DB, LIB, [
        Query.equal("userId",  userId),
        Query.equal("movieId", movieId),
        Query.limit(1),
      ]);
      if (existing.total > 0) {
        await databases.updateDocument(DB, LIB, existing.documents[0].$id, { isWishlisted: false });
      }
      return true;
    } catch (err) {
      console.error("[paymentService.removeFromWishlist]", err);
      return false;
    }
  },
};