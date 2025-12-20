/**
 * @signifyid/client - useTokenRefresh Hook
 *
 * Hook for token refresh operations.
 *
 * @packageDocumentation
 */

"use client";

import { useState, useCallback } from "react";
import { useSignifyContext } from "../context";
import type { SignifyError } from "../types";

/**
 * Hook for token refresh operations
 *
 * @example
 * ```tsx
 * function TokenManager() {
 *   const { refreshToken, isRefreshing } = useTokenRefresh();
 *
 *   useEffect(() => {
 *     const interval = setInterval(() => refreshToken(), 1000 * 60 * 10);
 *     return () => clearInterval(interval);
 *   }, [refreshToken]);
 * }
 * ```
 */
export function useTokenRefresh() {
  const { apiClient, setSession, session } = useSignifyContext();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<SignifyError | null>(null);

  /**
   * Refresh the access token
   *
   * @returns true if refresh was successful, false otherwise
   */
  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (!session) return false;

    setIsRefreshing(true);
    setError(null);

    try {
      const result = await apiClient.refreshToken();

      if (result.success && result.accessToken && result.expiresAt) {
        setSession({
          ...session,
          accessToken: result.accessToken,
          expiresAt: result.expiresAt,
        });
        return true;
      } else {
        setError(
          result.error || {
            code: "REFRESH_FAILED",
            message: "Token refresh failed",
          }
        );
        return false;
      }
    } catch {
      setError({ code: "REFRESH_ERROR", message: "Token refresh failed" });
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [apiClient, session, setSession]);

  return {
    refreshToken,
    isRefreshing,
    error,
  };
}
