"use client";

/**
 * Signify Context - React Context for configuration and auth state
 * @packageDocumentation
 */

import { createContext, useContext } from "react";
import type { SignifyConfig, SignifyAuthState } from "../types";
import { DEFAULT_CONFIG } from "../types";

/**
 * Merged configuration with defaults applied
 */
export type ResolvedSignifyConfig = Required<SignifyConfig>;

/**
 * Context for Signify configuration
 */
export const SignifyConfigContext = createContext<ResolvedSignifyConfig | null>(
  null
);

/**
 * Context for authentication state
 */
export const SignifyAuthContext = createContext<SignifyAuthState | null>(null);

/**
 * Hook to access Signify configuration
 * @throws Error if used outside of SignifyProvider
 */
export function useSignifyConfig(): ResolvedSignifyConfig {
  const config = useContext(SignifyConfigContext);

  if (!config) {
    throw new Error(
      "[Signify SDK] useSignifyConfig must be used within a SignifyProvider. " +
        "Wrap your app with <SignifyProvider config={{...}}>...</SignifyProvider>"
    );
  }

  return config;
}

/**
 * Resolve configuration with defaults
 * @param config - User-provided configuration
 * @returns Configuration with defaults applied
 */
export function resolveConfig(config: SignifyConfig): ResolvedSignifyConfig {
  return {
    apiUrl: config.apiUrl,
    loginUrl: config.loginUrl,
    cookieName: config.cookieName ?? DEFAULT_CONFIG.cookieName,
    cookieMaxAge: config.cookieMaxAge ?? DEFAULT_CONFIG.cookieMaxAge,
    tokenParam: config.tokenParam ?? DEFAULT_CONFIG.tokenParam,
    debug: config.debug ?? DEFAULT_CONFIG.debug,
  };
}

/**
 * Debug logger that respects config.debug setting
 */
export function createLogger(debug: boolean) {
  return {
    log: (...args: unknown[]) => {
      if (debug) {
        console.log("[Signify SDK]", ...args);
      }
    },
    warn: (...args: unknown[]) => {
      if (debug) {
        console.warn("[Signify SDK]", ...args);
      }
    },
    error: (...args: unknown[]) => {
      // Always log errors
      console.error("[Signify SDK]", ...args);
    },
  };
}
