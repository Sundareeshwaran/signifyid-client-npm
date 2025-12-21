"use client";

/**
 * ProtectedRoute - Component that protects routes by requiring authentication
 * @packageDocumentation
 */

import React, { useEffect } from "react";
import { useSignifyAuth } from "../hooks/useSignifyAuth";
import type { ProtectedRouteProps } from "../types";

/**
 * Default loading component shown while checking authentication
 */
const DefaultLoadingComponent: React.FC = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "200px",
      fontSize: "16px",
      color: "#666",
    }}
  >
    Loading authentication...
  </div>
);

/**
 * ProtectedRoute - Wrap content that requires authentication
 *
 * Automatically redirects to the Signify iD login page if the user is not authenticated.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 *
 * // With custom loading component
 * <ProtectedRoute loadingComponent={<MySpinner />}>
 *   <Dashboard />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
  children,
  loadingComponent,
  redirectUrl,
  onRedirect,
}: ProtectedRouteProps): React.ReactElement | null {
  const { isAuthenticated, isLoading, login } = useSignifyAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Call onRedirect callback if provided
      if (onRedirect) {
        onRedirect();
      }

      // Custom redirect URL or default login
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        login();
      }
    }
  }, [isLoading, isAuthenticated, login, redirectUrl, onRedirect]);

  // Show loading state
  if (isLoading) {
    return <>{loadingComponent ?? <DefaultLoadingComponent />}</>;
  }

  // Not authenticated - will redirect via useEffect
  // Return null to prevent flash of content
  if (!isAuthenticated) {
    return null;
  }

  // Authenticated - render children
  return <>{children}</>;
}
