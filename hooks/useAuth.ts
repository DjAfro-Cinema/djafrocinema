"use client";

/**
 * useAuth — thin convenience hook.
 * Wraps AuthContext so every component just does:
 *   const { user, login, logout, loading, error, success } = useAuth();
 */
export { useAuthContext as useAuth } from "@/context/AuthContext";