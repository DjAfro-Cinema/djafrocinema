import { account, databases } from "@/lib/appwrite";
import { ID, Models } from "appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID!;
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_USERS_COLLECTION_ID!;

export interface AppUser {
  $id: string;
  name: string;
  email: string;
  emailVerification: boolean;
  prefs: Record<string, unknown>;
  avatarUrl?: string;
}

function mapUser(u: Models.User<Models.Preferences>): AppUser {
  return {
    $id: u.$id,
    name: u.name,
    email: u.email,
    emailVerification: u.emailVerification,
    prefs: u.prefs,
  };
}

export const authService = {
  // ── Get current session user ──────────────────────────────────────────────
  async getCurrentUser(): Promise<AppUser | null> {
    try {
      const user = await account.get();
      return mapUser(user);
    } catch {
      return null;
    }
  },

  // ── Email + Password login ────────────────────────────────────────────────
  async login(email: string, password: string): Promise<AppUser> {
    await account.createEmailPasswordSession(email, password);
    const user = await account.get();
    return mapUser(user);
  },

  // ── Email + Password signup ───────────────────────────────────────────────
  async signup(email: string, password: string, name: string): Promise<AppUser> {
    await account.create(ID.unique(), email, password, name);
    await account.createEmailPasswordSession(email, password);
    const user = await account.get();

    try {
      await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        user.$id,
        {
          name: user.name,
          email: user.email,
          createdAt: new Date().toISOString(),
        }
      );
    } catch {
      // doc may already exist or collection doesn't require it — ignore
    }

    return mapUser(user);
  },

  // ── Email OTP — Step 1: send 6-digit code ────────────────────────────────
  async sendEmailOTP(email: string): Promise<string> {
    const token = await account.createEmailToken(ID.unique(), email);
    return token.userId; // needed for step 2
  },

  // ── Email OTP — Step 2: verify code → create session ─────────────────────
  async verifyEmailOTP(userId: string, otp: string): Promise<AppUser> {
    await account.createSession(userId, otp);
    const user = await account.get();

    // Upsert user doc — OTP users won't have one yet
    try {
      await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        user.$id,
        {
          name: user.name || user.email.split("@")[0],
          email: user.email,
          createdAt: new Date().toISOString(),
        }
      );
    } catch {
      // Already exists — fine
    }

    return mapUser(user);
  },

  // ── Logout ────────────────────────────────────────────────────────────────
  async logout(): Promise<void> {
    try {
      await account.deleteSession("current");
    } catch {
      // already logged out
    }
  },

  // ── Password reset email ──────────────────────────────────────────────────
  async sendPasswordReset(email: string): Promise<void> {
    const resetUrl = `${window.location.origin}/auth?reset=1`;
    await account.createRecovery(email, resetUrl);
  },
};