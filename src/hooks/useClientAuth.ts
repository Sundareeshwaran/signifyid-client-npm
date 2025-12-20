/**
 * @signifyid/client - useClientAuth Hook
 *
 * Hook for authentication operations (login/callback handling).
 *
 * @packageDocumentation
 */

"use client";

import { useState, useCallback } from "react";
import { useSignifyContext } from "../context";
import { SignifyAuthError } from "../errors";
import type { SignifyError, LoginOptions } from "../types";

/**
 * Hook for authentication operations (login/callback handling)
 *
 * @example
 * ```tsx
 * function LoginPage() {
 *   const { login, handleCallback, isLoading, error } = useClientAuth();
 *
 *   return (
 *     <button onClick={() => login()} disabled={isLoading}>
 *       {isLoading ? 'Redirecting...' : 'Sign In'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useClientAuth() {
  const { apiClient, setUser, setSession, setError, config } =
    useSignifyContext();
  const [isLoading, setLocalLoading] = useState(false);
  const [error, setLocalError] = useState<SignifyError | null>(null);

  /**
   * Initiate login flow
   *
   * @param clientSecret - Optional client secret for direct login
   * @param options - Login options
   */
  const login = useCallback(
    async (clientSecret?: string, options?: LoginOptions): Promise<void> => {
      setLocalLoading(true);
      setLocalError(null);

      try {
        if (clientSecret) {
          // Direct login with client credentials
          const result = await apiClient.login(
            config.clientId,
            clientSecret,
            config.redirectUri
          );

          setSession({
            sessionId: result.session_id,
            accessToken: result.access_token,
            refreshToken: result.refresh_token,
            tokenType: "Bearer",
            expiresAt: new Date(result.expires_at),
            scopes: options?.scope?.split(" ") || [
              "openid",
              "profile",
              "email",
            ],
            clientId: config.clientId,
          });

          // Fetch user profile
          try {
            const user = await apiClient.getMe();
            setUser(user);
          } catch {
            // Continue even if user fetch fails
          }

          // Redirect if specified
          if (result.redirect_uri) {
            window.location.href = result.redirect_uri;
          }
        } else {
          // OAuth redirect flow
          const authUrl = new URL(`${config.apiUrl}/oauth/authorize`);
          authUrl.searchParams.set("client_id", config.clientId);
          authUrl.searchParams.set("redirect_uri", config.redirectUri);
          authUrl.searchParams.set("response_type", "code");
          authUrl.searchParams.set(
            "scope",
            options?.scope || "openid profile email"
          );

          if (options?.state) {
            authUrl.searchParams.set("state", options.state);
          }
          if (options?.prompt) {
            authUrl.searchParams.set("prompt", options.prompt);
          }
          if (options?.loginHint) {
            authUrl.searchParams.set("login_hint", options.loginHint);
          }
          if (options?.locale) {
            authUrl.searchParams.set("ui_locales", options.locale);
          }

          window.location.href = authUrl.toString();
        }
      } catch (err) {
        const authError =
          err instanceof SignifyAuthError
            ? { code: err.code, message: err.message }
            : { code: "LOGIN_ERROR", message: "Login failed" };
        setLocalError(authError);
        setError(authError);
        throw err;
      } finally {
        setLocalLoading(false);
      }
    },
    [apiClient, config, setSession, setUser, setError]
  );

  /**
   * Handle OAuth callback (exchange code for tokens)
   */
  const handleCallback = useCallback(async (): Promise<void> => {
    setLocalLoading(true);
    setLocalError(null);

    try {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");
      const errorParam = params.get("error");
      const errorDescription = params.get("error_description");

      if (errorParam) {
        throw new SignifyAuthError(
          errorParam,
          errorDescription || "OAuth error"
        );
      }

      if (!code) {
        throw new SignifyAuthError(
          "MISSING_CODE",
          "Authorization code not found"
        );
      }

      // Exchange code for tokens
      const data = await apiClient.exchangeCode(
        code,
        config.redirectUri,
        state || undefined
      );

      setSession({
        sessionId: data.session_id,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        tokenType: "Bearer",
        expiresAt: new Date(data.expires_at),
        scopes: ["openid", "profile", "email"],
        clientId: config.clientId,
      });

      // Fetch user profile
      const user = await apiClient.getMe();
      setUser(user);

      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      const authError =
        err instanceof SignifyAuthError
          ? { code: err.code, message: err.message }
          : { code: "CALLBACK_ERROR", message: "Callback processing failed" };
      setLocalError(authError);
      setError(authError);
      throw err;
    } finally {
      setLocalLoading(false);
    }
  }, [apiClient, config, setSession, setUser, setError]);

  return {
    login,
    handleCallback,
    isLoading,
    error,
  };
}
