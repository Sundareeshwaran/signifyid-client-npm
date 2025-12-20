/**
 * @signifyid/client - Type Definitions
 *
 * Core TypeScript interfaces and types for the Signify iD SDK.
 *
 * @packageDocumentation
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Signify iD SDK Configuration
 */
export interface SignifyConfig {
  /** Your Signify iD Client ID */
  clientId: string;
  /** OAuth redirect URI (must match registered URI) */
  redirectUri: string;
  /** API base URL (default: https://api.signifyid.com) */
  apiUrl?: string;
  /** Enable debug logging */
  debug?: boolean;
}

// ============================================================================
// USER & SESSION
// ============================================================================

/**
 * User profile data returned from Signify iD
 */
export interface SignifyUser {
  /** Unique user identifier */
  id: string;
  /** User's email address */
  email: string;
  /** User's display name */
  name: string;
  /** User's first name */
  firstName?: string;
  /** User's last name */
  lastName?: string;
  /** User's role in the organization */
  role: string;
  /** Array of permission strings */
  permissions: string[];
  /** Profile picture URL */
  avatarUrl?: string;
  /** Organization/tenant ID */
  organizationId?: string;
  /** Organization name */
  organizationName?: string;
  /** Email verification status */
  emailVerified?: boolean;
  /** MFA enabled status */
  mfaEnabled?: boolean;
}

/**
 * Session data with token information
 */
export interface SignifySession {
  /** Session identifier */
  sessionId: string;
  /** Access token for API calls */
  accessToken: string;
  /** Refresh token for session renewal */
  refreshToken?: string;
  /** Token type (usually "Bearer") */
  tokenType: string;
  /** Token expiration timestamp */
  expiresAt: Date;
  /** OAuth scopes granted */
  scopes: string[];
  /** Domain associated with the session */
  domain?: string;
  /** Client ID used for authentication */
  clientId: string;
}

// ============================================================================
// ERRORS
// ============================================================================

/**
 * Authentication error details
 */
export interface SignifyError {
  /** Error code */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Additional error details */
  details?: Record<string, unknown>;
}

// ============================================================================
// OPTIONS
// ============================================================================

/**
 * Login options for initiating authentication
 */
export interface LoginOptions {
  /** OAuth scopes to request (default: "openid profile email") */
  scope?: string;
  /** State parameter for CSRF protection */
  state?: string;
  /** Prompt behavior (none, login, consent, select_account) */
  prompt?: "none" | "login" | "consent" | "select_account";
  /** UI locale preference */
  locale?: string;
  /** Login hint (pre-fill email) */
  loginHint?: string;
}

/**
 * Logout options
 */
export interface LogoutOptions {
  /** URL to redirect after logout */
  redirectTo?: string;
  /** Revoke all sessions (not just current) */
  revokeAll?: boolean;
  /** Post logout redirect URI */
  postLogoutRedirectUri?: string;
}

/**
 * Token refresh result
 */
export interface TokenRefreshResult {
  success: boolean;
  accessToken?: string;
  expiresAt?: Date;
  error?: SignifyError;
}

// ============================================================================
// API RESPONSES
// ============================================================================

/**
 * Login API response
 */
export interface LoginResponse {
  success: boolean;
  session_id: string;
  access_token: string;
  refresh_token?: string;
  expires_at: string;
  redirect_uri?: string;
}

/**
 * Session validation response
 */
export interface SessionValidateResponse {
  valid: boolean;
  session_id?: string;
  domain?: string;
  expires_at?: string;
  client_id?: string;
  user?: SignifyUser;
  error?: string;
  error_description?: string;
}
