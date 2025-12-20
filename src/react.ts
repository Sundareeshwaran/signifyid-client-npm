/**
 * @signifyid/client/react - React Entry Point
 *
 * React-specific exports including Provider, hooks, and context.
 *
 * @packageDocumentation
 */

"use client";

// Re-export everything from main
export * from "./index";

// Context & Provider
export { SignifyProvider, useSignifyContext } from "./context";
export type { SignifyContextValue, SignifyProviderProps } from "./context";

// Hooks
export { useClientAuth } from "./hooks/useClientAuth";
export { useClientSession } from "./hooks/useClientSession";
export { useClientLogout } from "./hooks/useClientLogout";
export { useTokenRefresh } from "./hooks/useTokenRefresh";
