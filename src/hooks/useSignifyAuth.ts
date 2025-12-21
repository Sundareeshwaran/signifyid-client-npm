"use client";

/**
 * useSignifyAuth - Core authentication hook for Signify iD
 * @packageDocumentation
 */

import { useContext } from "react";
import { SignifyAuthContext } from "../context/SignifyContext";
import type { SignifyAuthState } from "../types";

/**
 * Hook to access Signify iD authentication state and methods
 *
 * @returns Authentication state and methods
 * @throws Error if used outside of SignifyProvider
 *
 * @example
 * ```tsx
 * function Dashboard() {
 *   const { isAuthenticated, isLoading, user, login, logout } = useSignifyAuth();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   if (!isAuthenticated) {
 *     return <button onClick={login}>Login with Signify iD</button>;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Welcome, {user?.name}!</p>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useSignifyAuth(): SignifyAuthState {
  const auth = useContext(SignifyAuthContext);

  if (!auth) {
    throw new Error(
      "[Signify SDK] useSignifyAuth must be used within a SignifyProvider. " +
        "Wrap your app with <SignifyProvider config={{...}}>...</SignifyProvider>"
    );
  }

  return auth;
}
