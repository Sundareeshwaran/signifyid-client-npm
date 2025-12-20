/**
 * @signifyid/client - useClientLogout Hook
 *
 * Hook for logout operations with token revocation.
 *
 * @packageDocumentation
 */

"use client";

import { useState, useCallback } from "react";
import { useSignifyContext } from "../context";
import { SignifyAuthError } from "../errors";
import type { SignifyError, LogoutOptions } from "../types";

/**
 * Hook for logout operations
 *
 * @example
 * ```tsx
 * function LogoutButton() {
 *   const { logout, isLoading } = useClientLogout();
 *
 *   return (
 *     <button onClick={() => logout()} disabled={isLoading}>
 *       {isLoading ? 'Signing out...' : 'Sign Out'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useClientLogout() {
  const { apiClient, setUser, setSession } = useSignifyContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<SignifyError | null>(null);

  /**
   * Logout and revoke session
   *
   * @param options - Logout options
   */
  const logout = useCallback(
    async (options?: LogoutOptions): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        await apiClient.logout(options?.revokeAll);

        setUser(null);
        setSession(null);

        // Redirect after logout
        const redirectTo =
          options?.redirectTo || options?.postLogoutRedirectUri || "/";

        if (typeof window !== "undefined") {
          window.location.href = redirectTo;
        }
      } catch (err) {
        const authError =
          err instanceof SignifyAuthError
            ? { code: err.code, message: err.message }
            : { code: "LOGOUT_ERROR", message: "Logout failed" };
        setError(authError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiClient, setUser, setSession]
  );

  return {
    logout,
    isLoading,
    error,
  };
}
