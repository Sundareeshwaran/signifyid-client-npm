"use client";

/**
 * SignifyProvider - Main provider component for Signify iD authentication
 * @packageDocumentation
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  SignifyConfigContext,
  SignifyAuthContext,
  resolveConfig,
  createLogger,
} from "./SignifyContext";
import type {
  SignifyProviderProps,
  SignifySession,
  SignifyAuthState,
} from "../types";
import {
  setCookie,
  getCookie,
  deleteCookie,
  isBrowser,
} from "../utils/cookies";
import {
  getTokenFromUrl,
  cleanUrlParams,
  buildLoginUrl,
  navigateTo,
  reloadPage,
} from "../utils/url";

/**
 * SignifyProvider - Wrap your app with this provider to enable Signify iD authentication
 *
 * @example
 * ```tsx
 * <SignifyProvider
 *   config={{
 *     apiUrl: "https://api.signifyid.com",
 *     loginUrl: "https://signifyid.com/client/login"
 *   }}
 * >
 *   <App />
 * </SignifyProvider>
 * ```
 */
export function SignifyProvider({
  config: userConfig,
  children,
  onAuthStateChange,
}: SignifyProviderProps): React.ReactElement {
  const config = useMemo(() => resolveConfig(userConfig), [userConfig]);
  const logger = useMemo(() => createLogger(config.debug), [config.debug]);

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<SignifySession | null>(null);

  // Refs to prevent double-execution in React StrictMode
  const isInitialized = useRef(false);
  const isValidating = useRef(false);

  /**
   * Validate session with the backend
   */
  const validateSession = useCallback(
    async (tokenOverride?: string): Promise<void> => {
      // Prevent concurrent validations
      if (isValidating.current) {
        logger.log("Validation already in progress, skipping...");
        return;
      }

      isValidating.current = true;
      setIsLoading(true);
      logger.log(
        "Validating session...",
        tokenOverride ? "(with token override)" : ""
      );

      try {
        const body = tokenOverride ? { session_token: tokenOverride } : {};

        const response = await fetch(
          `${config.apiUrl}/api/client-auth/session/validate`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          }
        );

        if (!response.ok) {
          throw new Error(`Validation request failed: ${response.status}`);
        }

        const data: SignifySession = await response.json();
        logger.log("Validation response:", data);

        if (data.valid) {
          setIsAuthenticated(true);
          setSession(data);
          logger.log("Session is valid, user authenticated");
        } else {
          setIsAuthenticated(false);
          setSession(null);
          logger.log("Session is invalid");
        }
      } catch (error) {
        logger.error("Session validation error:", error);
        setIsAuthenticated(false);
        setSession(null);
      } finally {
        setIsLoading(false);
        isValidating.current = false;
      }
    },
    [config.apiUrl, logger]
  );

  /**
   * Redirect to Signify iD login page
   */
  const login = useCallback((): void => {
    if (!isBrowser()) {
      logger.warn("login() called on server, ignoring");
      return;
    }

    const loginUrl = buildLoginUrl(config.loginUrl);
    logger.log("Redirecting to login:", loginUrl);
    navigateTo(loginUrl);
  }, [config.loginUrl, logger]);

  /**
   * Log out and clear session
   */
  const logout = useCallback(async (): Promise<void> => {
    logger.log("Logging out...");

    try {
      await fetch(`${config.apiUrl}/api/client-auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      logger.log("Logout API call successful");
    } catch (error) {
      logger.error("Logout API error:", error);
    }

    // Clear state
    setIsAuthenticated(false);
    setSession(null);

    // Clear cookie
    deleteCookie(config.cookieName);

    // Reload page to ensure clean state
    if (isBrowser()) {
      reloadPage();
    }
  }, [config.apiUrl, config.cookieName, logger]);

  /**
   * Handle token from URL on mount
   */
  useEffect(() => {
    if (!isBrowser() || isInitialized.current) {
      return;
    }

    isInitialized.current = true;

    const token = getTokenFromUrl(config.tokenParam);

    if (token) {
      logger.log("Token found in URL, storing and validating...");

      // Store token in cookie
      setCookie(config.cookieName, token, config.cookieMaxAge);

      // Clean URL (remove token parameter)
      cleanUrlParams([config.tokenParam]);

      // Validate with the token
      validateSession(token);
    } else {
      // Check if we have an existing cookie
      const existingToken = getCookie(config.cookieName);

      if (existingToken) {
        logger.log("Existing session cookie found, validating...");
        validateSession();
      } else {
        logger.log("No token or session found");
        setIsLoading(false);
      }
    }
  }, [
    config.cookieName,
    config.cookieMaxAge,
    config.tokenParam,
    logger,
    validateSession,
  ]);

  /**
   * Notify on auth state changes
   */
  const authState: SignifyAuthState = useMemo(
    () => ({
      isAuthenticated,
      isLoading,
      session,
      user: session?.user ?? null,
      login,
      logout,
      validateSession: () => validateSession(),
    }),
    [isAuthenticated, isLoading, session, login, logout, validateSession]
  );

  useEffect(() => {
    if (onAuthStateChange && !isLoading) {
      onAuthStateChange(authState);
    }
  }, [authState, onAuthStateChange, isLoading]);

  return (
    <SignifyConfigContext.Provider value={config}>
      <SignifyAuthContext.Provider value={authState}>
        {children}
      </SignifyAuthContext.Provider>
    </SignifyConfigContext.Provider>
  );
}
