/**
 * @signifyid/client - useClientSession Hook
 *
 * Hook for accessing current session and user data with permission helpers.
 *
 * @packageDocumentation
 */

"use client";

import { useCallback } from "react";
import { useSignifyContext } from "../context";

/**
 * Hook to access current session and user data
 *
 * @example
 * ```tsx
 * function Dashboard() {
 *   const { session, user, isAuthenticated, isLoading } = useClientSession();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (!isAuthenticated) return <div>Please sign in</div>;
 *
 *   return <div>Welcome, {user.name}</div>;
 * }
 * ```
 */
export function useClientSession() {
  const { session, user, isAuthenticated, isLoading, error } =
    useSignifyContext();

  /**
   * Check if user has specific permission
   */
  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user?.permissions) return false;
      return (
        user.permissions.includes(permission) || user.permissions.includes("*")
      );
    },
    [user]
  );

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = useCallback(
    (permissions: string[]): boolean => {
      return permissions.some((p) => hasPermission(p));
    },
    [hasPermission]
  );

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = useCallback(
    (permissions: string[]): boolean => {
      return permissions.every((p) => hasPermission(p));
    },
    [hasPermission]
  );

  /**
   * Check if user has specific role
   */
  const hasRole = useCallback(
    (role: string): boolean => {
      return user?.role === role;
    },
    [user]
  );

  /**
   * Get time remaining until session expires (in milliseconds)
   */
  const getTimeUntilExpiry = useCallback((): number | null => {
    if (!session?.expiresAt) return null;
    return session.expiresAt.getTime() - Date.now();
  }, [session]);

  /**
   * Check if session is about to expire (within 5 minutes)
   */
  const isSessionExpiring = useCallback((): boolean => {
    const timeRemaining = getTimeUntilExpiry();
    if (timeRemaining === null) return false;
    return timeRemaining < 5 * 60 * 1000; // 5 minutes
  }, [getTimeUntilExpiry]);

  /**
   * Check if session has expired
   */
  const isSessionExpired = useCallback((): boolean => {
    const timeRemaining = getTimeUntilExpiry();
    if (timeRemaining === null) return false;
    return timeRemaining <= 0;
  }, [getTimeUntilExpiry]);

  return {
    session,
    user,
    isAuthenticated,
    isLoading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    getTimeUntilExpiry,
    isSessionExpiring,
    isSessionExpired,
  };
}
