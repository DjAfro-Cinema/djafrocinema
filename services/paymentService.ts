// services/payment.service.ts
import { databases } from "@/lib/appwrite";
import { Query, ID } from "appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID!;
const PAYMENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_PAYMENTS_COLLECTION_ID!;
const USER_LIBRARY_COLLECTION_ID = process.env.NEXT_PUBLIC_USER_LIBRARY_COLLECTION_ID!;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

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
  orderTrackingId?: string;
  merchantReference?: string;
  phoneNumber?: string;
  currency?: string;
  paymentType?: string;
  offerType?: string;
  offerReference?: string;
  invoiceId?: string;
  checkoutId?: string;
  paymentProvider?: string;
  mpesaReceiptId?: string;
  mpesaPhone?: string;
  mpesaReference?: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface STKPushPayload {
  movieId: string;
  movieIds?: string[];
  userId: string;
  phoneNumber: string;
  amount: number;
  offerType?: string;
  offerReference?: string;
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

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatPhone(phone: string): string {
  let cleaned = phone.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+254")) cleaned = cleaned.substring(1);
  if (cleaned.startsWith("07")) cleaned = "254" + cleaned.substring(1);
  if (cleaned.startsWith("01")) cleaned = "254" + cleaned.substring(1);
  return cleaned;
}

function isValidKenyanPhone(phone: string): boolean {
  const formatted = formatPhone(phone);
  if (!formatted.startsWith("254") || formatted.length !== 12) return false;
  return /^254(7[0-9]|1[0-9])/.test(formatted);
}

function mapDoc(doc: Record<string, unknown>): Payment {
  return {
    $id: doc.$id as string,
    userId: doc.userId as string,
    movieId: doc.movieId as string,
    movieIds: Array.isArray(doc.movieIds) ? (doc.movieIds as string[]) : undefined,
    reference: doc.reference as string | undefined,
    amount: doc.amount as number,
    status: doc.status as PaymentStatus,
    paymentMethod: doc.paymentMethod as string | undefined,
    paidAt: doc.paidAt as string | undefined,
    orderTrackingId: doc.orderTrackingId as string | undefined,
    merchantReference: doc.merchantReference as string | undefined,
    phoneNumber: doc.phoneNumber as string | undefined,
    currency: doc.currency as string | undefined,
    paymentType: doc.paymentType as string | undefined,
    offerType: doc.offerType as string | undefined,
    offerReference: doc.offerReference as string | undefined,
    invoiceId: doc.invoiceId as string | undefined,
    checkoutId: doc.checkoutId as string | undefined,
    paymentProvider: doc.paymentProvider as string | undefined,
    mpesaReceiptId: doc.mpesaReceiptId as string | undefined,
    mpesaPhone: doc.mpesaPhone as string | undefined,
    mpesaReference: doc.mpesaReference as string | undefined,
    $createdAt: doc.$createdAt as string,
    $updatedAt: doc.$updatedAt as string,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────

export const paymentService = {
  /**
   * Initiate STK Push via Appwrite Function.
   * The actual function call goes through your Next.js API route
   * which proxies to the Appwrite function endpoint.
   */
  async initiateSTKPush(
    movieId: string,
    userId: string,
    phoneNumber: string,
    customAmount?: number,
    movieIds?: string[],
    offerReference?: string
  ): Promise<PaymentResult> {
    const formatted = formatPhone(phoneNumber);
    if (!isValidKenyanPhone(formatted)) {
      return { success: false, message: "Invalid M-Pesa number. Enter a valid Kenyan mobile number." };
    }

    const alreadyPaid = await paymentService.hasUserPaidForMovie(userId, movieId);
    if (alreadyPaid) {
      return { success: true, message: "Movie already purchased", data: { alreadyPaid: true } };
    }

    const amount = customAmount ?? Number(process.env.NEXT_PUBLIC_MOVIE_PRICE ?? 10);
    const payload: STKPushPayload = {
      movieId,
      movieIds: movieIds ?? [movieId],
      userId,
      phoneNumber: formatted,
      amount,
      offerType: movieIds && movieIds.length > 1 ? "bundle" : "single",
      offerReference,
    };

    try {
      const res = await fetch("/api/payments/stk-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        return {
          success: true,
          message: json.message ?? "STK Push sent. Check your phone for the M-Pesa prompt.",
          data: json.data,
        };
      }
      return { success: false, message: json.error ?? json.message ?? "Failed to initiate payment." };
    } catch (err) {
      console.error("paymentService.initiateSTKPush:", err);
      return { success: false, message: "Network error. Please try again." };
    }
  },

  /**
   * Check if a user has a completed payment for a specific movie.
   * Checks both direct movieId match and bundle movieIds array.
   */
  async hasUserPaidForMovie(userId: string, movieId: string): Promise<boolean> {
    if (!userId || !movieId) return false;

    try {
      // Direct single payment
      const direct = await databases.listDocuments(DATABASE_ID, PAYMENTS_COLLECTION_ID, [
        Query.equal("userId", userId),
        Query.equal("movieId", movieId),
        Query.equal("status", "completed"),
        Query.limit(1),
      ]);
      if (direct.documents.length > 0) return true;

      // Bundle payments — fetch all completed and check movieIds[]
      const bundles = await databases.listDocuments(DATABASE_ID, PAYMENTS_COLLECTION_ID, [
        Query.equal("userId", userId),
        Query.equal("status", "completed"),
        Query.isNotNull("movieIds"),
        Query.limit(100),
      ]);

      for (const doc of bundles.documents) {
        const ids = Array.isArray(doc.movieIds) ? (doc.movieIds as string[]) : [];
        if (ids.includes(movieId)) return true;
      }

      return false;
    } catch (err) {
      console.error("paymentService.hasUserPaidForMovie:", err);
      return false;
    }
  },

  /**
   * Get all movie IDs the user has paid for (completed payments).
   */
  async getPaidMovieIds(userId: string): Promise<string[]> {
    if (!userId) return [];

    try {
      const res = await databases.listDocuments(DATABASE_ID, PAYMENTS_COLLECTION_ID, [
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
      console.error("paymentService.getPaidMovieIds:", err);
      return [];
    }
  },

  /**
   * Fetch all payments for a user (for the Payments tab).
   */
  async getUserPayments(userId: string): Promise<Payment[]> {
    if (!userId) return [];

    try {
      const res = await databases.listDocuments(DATABASE_ID, PAYMENTS_COLLECTION_ID, [
        Query.equal("userId", userId),
        Query.orderDesc("$createdAt"),
        Query.limit(100),
      ]);
      return res.documents.map((d) => mapDoc(d as unknown as Record<string, unknown>));
    } catch (err) {
      console.error("paymentService.getUserPayments:", err);
      return [];
    }
  },

  /**
   * Get a payment by its reference string.
   */
  async getByReference(reference: string): Promise<Payment | null> {
    if (!reference) return null;

    try {
      const res = await databases.listDocuments(DATABASE_ID, PAYMENTS_COLLECTION_ID, [
        Query.equal("reference", reference),
        Query.limit(1),
      ]);
      if (res.documents.length === 0) return null;
      return mapDoc(res.documents[0] as unknown as Record<string, unknown>);
    } catch (err) {
      console.error("paymentService.getByReference:", err);
      return null;
    }
  },

  /**
   * Poll payment status by reference (useful after STK push).
   * Returns true when status transitions to "completed".
   */
  async pollPaymentStatus(
    reference: string,
    maxAttempts = 12,
    intervalMs = 5000
  ): Promise<boolean> {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, intervalMs));
      const payment = await paymentService.getByReference(reference);
      if (payment?.status === "completed") return true;
      if (payment?.status === "failed" || payment?.status === "cancelled") return false;
    }
    return false;
  },

  /**
   * Add a movie to the user's wishlist (isWishlisted = true in user_library).
   */
  async addToWishlist(userId: string, movieId: string): Promise<boolean> {
    if (!userId || !movieId) return false;

    try {
      const existing = await databases.listDocuments(DATABASE_ID, USER_LIBRARY_COLLECTION_ID, [
        Query.equal("userId", userId),
        Query.equal("movieId", movieId),
        Query.limit(1),
      ]);

      if (existing.documents.length > 0) {
        await databases.updateDocument(
          DATABASE_ID,
          USER_LIBRARY_COLLECTION_ID,
          existing.documents[0].$id,
          { isWishlisted: true }
        );
      } else {
        await databases.createDocument(
          DATABASE_ID,
          USER_LIBRARY_COLLECTION_ID,
          ID.unique(),
          {
            userId,
            movieId,
            type: [],
            progress: 0,
            isWishlisted: true,
          }
        );
      }
      return true;
    } catch (err) {
      console.error("paymentService.addToWishlist:", err);
      return false;
    }
  },

  /**
   * Remove a movie from the user's wishlist.
   */
  async removeFromWishlist(userId: string, movieId: string): Promise<boolean> {
    if (!userId || !movieId) return false;

    try {
      const existing = await databases.listDocuments(DATABASE_ID, USER_LIBRARY_COLLECTION_ID, [
        Query.equal("userId", userId),
        Query.equal("movieId", movieId),
        Query.limit(1),
      ]);

      if (existing.documents.length > 0) {
        await databases.updateDocument(
          DATABASE_ID,
          USER_LIBRARY_COLLECTION_ID,
          existing.documents[0].$id,
          { isWishlisted: false }
        );
      }
      return true;
    } catch (err) {
      console.error("paymentService.removeFromWishlist:", err);
      return false;
    }
  },

  /**
   * Payment stats for a user.
   */
  async getPaymentStats(userId: string): Promise<{
    totalSpent: number;
    totalMovies: number;
    pendingCount: number;
  }> {
    try {
      const payments = await paymentService.getUserPayments(userId);
      const completed = payments.filter((p) => p.status === "completed");
      const paidIds = new Set<string>();
      completed.forEach((p) => {
        if (p.movieId) paidIds.add(p.movieId);
        p.movieIds?.forEach((id) => paidIds.add(id));
      });

      return {
        totalSpent: completed.reduce((sum, p) => sum + p.amount, 0),
        totalMovies: paidIds.size,
        pendingCount: payments.filter((p) => p.status === "pending").length,
      };
    } catch {
      return { totalSpent: 0, totalMovies: 0, pendingCount: 0 };
    }
  },
};