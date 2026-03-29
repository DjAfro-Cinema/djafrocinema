"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { authService, AppUser } from "@/services/auth.service";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  error: string | null;
  success: string | null;

  // Email + Password
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;

  // Email OTP
  otpUserId: string | null;
  otpEmail: string | null;
  sendEmailOTP: (email: string) => Promise<void>;
  verifyEmailOTP: (otp: string) => Promise<void>;
  resetOTP: () => void;

  // Password reset
  sendPasswordReset: (email: string) => Promise<void>;

  // Shared
  logout: () => Promise<void>;
  clearMessages: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // OTP state
  const [otpUserId, setOtpUserId] = useState<string | null>(null);
  const [otpEmail, setOtpEmail] = useState<string | null>(null);

  // ── Boot ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    authService
      .getCurrentUser()
      .then((u) => setUser(u))
      .finally(() => setLoading(false));
  }, []);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const resetOTP = useCallback(() => {
    setOtpUserId(null);
    setOtpEmail(null);
    setError(null);
    setSuccess(null);
  }, []);

  // ── Email + Password Login ────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const u = await authService.login(email, password);
      setUser(u);
      setSuccess(`Welcome back, ${u.name || u.email}!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed. Please try again.";
      if (msg.includes("Invalid credentials") || msg.includes("401")) {
        setError("Wrong email or password. Please try again.");
      } else if (msg.includes("user_not_found")) {
        setError("No account found with that email. Create one below.");
      } else {
        setError(msg);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Email + Password Signup ───────────────────────────────────────────────
  const signup = useCallback(async (email: string, password: string, name: string) => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const u = await authService.signup(email, password, name);
      setUser(u);
      setSuccess(`Account created! Welcome, ${u.name || u.email} 🎬`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign-up failed. Please try again.";
      if (msg.includes("user_already_exists") || msg.includes("409")) {
        setError("An account with that email already exists. Sign in instead.");
      } else if (msg.includes("password")) {
        setError("Password must be at least 8 characters.");
      } else {
        setError(msg);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Email OTP — Send ──────────────────────────────────────────────────────
  const sendEmailOTP = useCallback(async (email: string) => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const userId = await authService.sendEmailOTP(email);
      setOtpUserId(userId);
      setOtpEmail(email);
      setSuccess(`Code sent to ${email}. Check your inbox!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not send code. Try again.";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Email OTP — Verify ────────────────────────────────────────────────────
  const verifyEmailOTP = useCallback(async (otp: string) => {
    if (!otpUserId) {
      setError("Session expired. Please request a new code.");
      return;
    }
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const u = await authService.verifyEmailOTP(otpUserId, otp);
      setUser(u);
      setOtpUserId(null);
      setOtpEmail(null);
      setSuccess(`Welcome, ${u.name || u.email}! 🎬`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid code. Please try again.";
      if (msg.includes("invalid") || msg.includes("401")) {
        setError("Invalid or expired code. Please try again.");
      } else {
        setError(msg);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [otpUserId]);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Password Reset ────────────────────────────────────────────────────────
  const sendPasswordReset = useCallback(async (email: string) => {
    setError(null);
    setSuccess(null);
    try {
      await authService.sendPasswordReset(email);
      setSuccess("Password reset link sent! Check your email.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not send reset email.";
      setError(msg);
      throw err;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        success,
        login,
        signup,
        otpUserId,
        otpEmail,
        sendEmailOTP,
        verifyEmailOTP,
        resetOTP,
        sendPasswordReset,
        logout,
        clearMessages,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within <AuthProvider>");
  }
  return ctx;
}