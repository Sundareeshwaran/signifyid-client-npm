/**
 * Signify iD Client SDK - Type Definitions
 * @packageDocumentation
 */

/**
 * Configuration options for the SignifyProvider
 */
export interface SignifyConfig {
  /** Backend API URL (e.g., "https://api.signifyid.com") */
  apiUrl: string;

  /** Signify iD login page URL (e.g., "https://signifyid.com/client/login") */
  loginUrl: string;

  /** Cookie name for storing session token. Default: "clientSession" */
  cookieName?: string;

  /** Cookie max age in seconds. Default: 86400 (24 hours) */
  cookieMaxAge?: number;

  /** URL parameter name for token. Default: "token" */
  tokenParam?: string;

  /** Enable debug logging. Default: false */
  debug?: boolean;
}

/**
 * User data returned from session validation
 */
export interface SignifyUser {
  /** Unique user identifier */
  id: string;

  /** User's email address */
  email: string;

  /** User's display name */
  name?: string;

  /** User's avatar URL */
  avatar?: string;

  /** Additional user properties */
  [key: string]: unknown;
}

/**
 * Session data returned from validation endpoint
 */
export interface SignifySession {
  /** Whether the session is valid */
  valid: boolean;

  /** User data if session is valid */
  user?: SignifyUser;

  /** Session expiration timestamp */
  expiresAt?: string;

  /** Session token (if returned) */
  token?: string;

  /** Additional session properties */
  [key: string]: unknown;
}

/**
 * Authentication state returned by useSignifyAuth hook
 */
export interface SignifyAuthState {
  /** Whether the user is authenticated */
  isAuthenticated: boolean;

  /** Whether authentication is being validated */
  isLoading: boolean;

  /** Full session data if authenticated */
  session: SignifySession | null;

  /** User data shortcut (session.user) */
  user: SignifyUser | null;

  /** Redirect to Signify iD login page */
  login: () => void;

  /** Log out and clear session */
  logout: () => Promise<void>;

  /** Manually re-validate session */
  validateSession: () => Promise<void>;
}

/**
 * Props for SignifyProvider component
 */
export interface SignifyProviderProps {
  /** Configuration options */
  config: SignifyConfig;

  /** Child components */
  children: React.ReactNode;

  /** Callback when auth state changes */
  onAuthStateChange?: (state: SignifyAuthState) => void;
}

/**
 * Props for ProtectedRoute component
 */
export interface ProtectedRouteProps {
  /** Child components to render when authenticated */
  children: React.ReactNode;

  /** Custom loading component */
  loadingComponent?: React.ReactNode;

  /** Custom redirect URL (overrides default login) */
  redirectUrl?: string;

  /** Callback when redirecting to login */
  onRedirect?: () => void;
}

/**
 * Internal auth context value type
 */
export interface SignifyAuthContextValue extends SignifyAuthState {
  /** Internal: Set loading state */
  setLoading: (loading: boolean) => void;
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG = {
  cookieName: "clientSession",
  cookieMaxAge: 86400, // 24 hours
  tokenParam: "token",
  debug: false,
} as const;
