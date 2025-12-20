/**
 * @signifyid/client - API Client
 *
 * Core API client for making requests to Signify iD backend.
 *
 * @packageDocumentation
 */

import type {
  SignifyUser,
  TokenRefreshResult,
  LoginResponse,
  SessionValidateResponse,
} from "./types";
import { SignifyAuthError } from "./errors";

/**
 * Core API client for Signify iD requests
 *
 * @example
 * ```ts
 * const client = new SignifyApiClient("https://api.signifyid.com");
 * const session = await client.validateSession();
 * ```
 */
export class SignifyApiClient {
  private baseUrl: string;
  private debug: boolean;

  constructor(baseUrl: string, debug = false) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.debug = debug;
  }

  private log(...args: unknown[]) {
    if (this.debug) {
      console.log("[SignifyID]", ...args);
    }
  }

  /**
   * Login with client credentials
   */
  async login(
    clientId: string,
    clientSecret: string,
    redirectUri?: string
  ): Promise<LoginResponse> {
    this.log("Initiating login...");

    const response = await fetch(`${this.baseUrl}/api/client-auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new SignifyAuthError(
        data.error || "LOGIN_FAILED",
        data.error_description || "Login failed"
      );
    }

    this.log("Login successful");
    return data;
  }

  /**
   * Validate current session
   */
  async validateSession(): Promise<SessionValidateResponse> {
    this.log("Validating session...");

    const response = await fetch(
      `${this.baseUrl}/api/client-auth/session/validate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    return response.json();
  }

  /**
   * Get current user profile
   */
  async getMe(): Promise<SignifyUser> {
    const response = await fetch(`${this.baseUrl}/api/client-auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json();
      throw new SignifyAuthError(
        data.error || "USER_FETCH_FAILED",
        data.error_description || "Failed to fetch user"
      );
    }

    return response.json();
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<TokenRefreshResult> {
    this.log("Refreshing token...");

    try {
      const response = await fetch(
        `${this.baseUrl}/api/client-auth/token/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: data.error || "REFRESH_FAILED",
            message: data.error_description || "Token refresh failed",
          },
        };
      }

      return {
        success: true,
        accessToken: data.access_token,
        expiresAt: new Date(data.expires_at),
      };
    } catch {
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: "Failed to refresh token",
        },
      };
    }
  }

  /**
   * Logout and revoke session
   */
  async logout(revokeAll = false): Promise<{ success: boolean }> {
    this.log("Logging out...");

    const response = await fetch(`${this.baseUrl}/api/client-auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ revoke_all: revokeAll }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new SignifyAuthError(
        data.error || "LOGOUT_FAILED",
        data.error_description || "Logout failed"
      );
    }

    this.log("Logout successful");
    return { success: true };
  }

  /**
   * Exchange authorization code for tokens (OAuth callback)
   */
  async exchangeCode(
    code: string,
    redirectUri: string,
    state?: string
  ): Promise<LoginResponse> {
    this.log("Exchanging authorization code...");

    const response = await fetch(`${this.baseUrl}/api/client-auth/callback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        code,
        state,
        redirect_uri: redirectUri,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new SignifyAuthError(
        data.error || "CALLBACK_FAILED",
        data.error_description || "Callback processing failed"
      );
    }

    return data;
  }
}

/**
 * Create a Signify iD API client instance
 * For use outside of React components
 *
 * @example
 * ```ts
 * const client = createSignifyClient("https://api.signifyid.com");
 * const session = await client.validateSession();
 * ```
 */
export function createSignifyClient(
  apiUrl: string,
  debug = false
): SignifyApiClient {
  return new SignifyApiClient(apiUrl, debug);
}
