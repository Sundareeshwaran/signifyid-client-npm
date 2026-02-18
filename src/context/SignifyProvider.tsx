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
import {
  cacheSession,
  getCachedSession,
  clearCachedSession,
} from "../utils/storage";

/**
 * SignifyProvider - Wrap your app with this provider to enable Signify iD authentication
 *
 * @example
 * ```tsx
 * <SignifyProvider
 *   config={{
 *     apiUrl: "https://signifyid-api.vercel.app",
 *     loginUrl: "https://signifyid.vercel.app/client/login"
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
      // Guardrail: Only proceed in production
      if (config.env !== "production") {
        logger.warn(
          `API call (validateSession) suppressed. Current env: '${config.env}'. ` +
            "Set env to 'production' to enable live requests.",
        );
        setIsLoading(false);
        return;
      }

      // Prevent concurrent validations
      if (isValidating.current) {
        logger.log("Validation already in progress, skipping...");
        return;
      }

      isValidating.current = true;
      setIsLoading(true);
      logger.log(
        "Validating session...",
        tokenOverride ? "(with token override)" : "",
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
          },
        );

        if (!response.ok) {
          throw new Error(`Validation request failed: ${response.status}`);
        }

        const data: SignifySession = await response.json();
        logger.log("Validation response:", data);

        if (data.valid) {
          setIsAuthenticated(true);
          setSession(data);
          // Cache session to localStorage to avoid re-validation on refresh
          cacheSession(data);
          logger.log("Session is valid, user authenticated (cached)");
        } else {
          setIsAuthenticated(false);
          setSession(null);
          clearCachedSession();
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
    [config.apiUrl, config.env, logger],
  );

  /**
   * Redirect to Signify iD login page
   */
  const login = useCallback((): void => {
    // Guardrail: Only proceed in production
    if (config.env !== "production") {
      logger.warn(
        `Login redirect suppressed. Current env: '${config.env}'. ` +
          "Set env to 'production' to enable login portal access.",
      );
      return;
    }

    if (!isBrowser()) {
      logger.warn("login() called on server, ignoring");
      return;
    }

    const loginUrl = buildLoginUrl(config.loginUrl);
    logger.log("Redirecting to login:", loginUrl);
    navigateTo(loginUrl);
  }, [config.loginUrl, config.env, logger]);

  /**
   * Log out and clear session
   */
  const logout = useCallback(async (): Promise<void> => {
    logger.log("Logging out...");

    // Signify-specific: only call API if in production
    if (config.env === "production") {
      try {
        await fetch(`${config.apiUrl}/api/client-auth/logout`, {
          method: "POST",
          credentials: "include",
        });
        logger.log("Logout API call successful");
      } catch (error) {
        logger.error("Logout API error:", error);
      }
    } else {
      logger.log(
        `Logout API call skipped. Current env: '${config.env}'. Clearing local state only.`,
      );
    }

    // Clear state
    setIsAuthenticated(false);
    setSession(null);

    // Clear cookie and cached session
    deleteCookie(config.cookieName);
    clearCachedSession();

    // Reload page to ensure clean state
    if (isBrowser()) {
      // Guardrail: Skip reload in non-production if it might cause issues,
      // but usually reload is safe. However, the user specifically mentioned
      // not initiating requests or attempting to verify the client via login URL.
      // We'll keep reload for clean state unless it's considered part of "login verification".
      reloadPage();
    }
  }, [config.apiUrl, config.cookieName, config.env, logger]);

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
      // First, check if we have a cached session in localStorage
      const cachedSession = getCachedSession();

      if (cachedSession) {
        logger.log(
          "Using cached session from localStorage (avoiding server call)",
        );
        setIsAuthenticated(true);
        setSession(cachedSession);
        setIsLoading(false);
        return;
      }

      // No cache - check if we have an existing cookie
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
    [isAuthenticated, isLoading, session, login, logout, validateSession],
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
