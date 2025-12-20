/**
 * @signifyid/client - React Context
 *
 * React context and provider for Signify iD authentication state.
 *
 * @packageDocumentation
 */

"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import type {
  SignifyConfig,
  SignifyUser,
  SignifySession,
  SignifyError,
} from "./types";
import { SignifyApiClient } from "./api-client";

// ============================================================================
// CONTEXT TYPES
// ============================================================================

export interface SignifyContextValue {
  config: SignifyConfig;
  apiClient: SignifyApiClient;
  user: SignifyUser | null;
  session: SignifySession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: SignifyError | null;
  setUser: (user: SignifyUser | null) => void;
  setSession: (session: SignifySession | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: SignifyError | null) => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const SignifyContext = createContext<SignifyContextValue | null>(null);

/**
 * Hook to access Signify context (internal use)
 * @throws Error if used outside SignifyProvider
 */
export function useSignifyContext(): SignifyContextValue {
  const context = useContext(SignifyContext);
  if (!context) {
    throw new Error(
      "useSignifyContext must be used within a SignifyProvider. " +
        "Wrap your application with <SignifyProvider>."
    );
  }
  return context;
}

// ============================================================================
// PROVIDER PROPS
// ============================================================================

export interface SignifyProviderProps {
  children: ReactNode;
  /** Your Signify iD Client ID */
  clientId: string;
  /** OAuth redirect URI */
  redirectUri: string;
  /** API base URL (default: http://localhost:5000) */
  apiUrl?: string;
  /** Enable debug logging */
  debug?: boolean;
  /** Callback when authentication state changes */
  onAuthStateChange?: (
    isAuthenticated: boolean,
    user: SignifyUser | null
  ) => void;
}

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

/**
 * Provider component for Signify iD authentication
 *
 * @example
 * ```tsx
 * import { SignifyProvider } from '@signifyid/client/react';
 *
 * function App() {
 *   return (
 *     <SignifyProvider
 *       clientId={process.env.NEXT_PUBLIC_SIGNIFYID_CLIENT_ID!}
 *       redirectUri={process.env.NEXT_PUBLIC_SIGNIFYID_REDIRECT_URI!}
 *     >
 *       <YourApp />
 *     </SignifyProvider>
 *   );
 * }
 * ```
 */
export function SignifyProvider({
  children,
  clientId,
  redirectUri,
  apiUrl = "http://localhost:5000",
  debug = false,
  onAuthStateChange,
}: SignifyProviderProps) {
  const [user, setUser] = useState<SignifyUser | null>(null);
  const [session, setSession] = useState<SignifySession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<SignifyError | null>(null);

  const config = useMemo<SignifyConfig>(
    () => ({
      clientId,
      redirectUri,
      apiUrl,
      debug,
    }),
    [clientId, redirectUri, apiUrl, debug]
  );

  const apiClient = useMemo(
    () => new SignifyApiClient(apiUrl, debug),
    [apiUrl, debug]
  );

  const isAuthenticated = !!session && !!user;

  // Validate session on mount
  useEffect(() => {
    async function validateSession() {
      try {
        const result = await apiClient.validateSession();

        if (result.valid && result.session_id) {
          setSession({
            sessionId: result.session_id,
            accessToken: "",
            tokenType: "Bearer",
            expiresAt: new Date(result.expires_at!),
            scopes: ["openid", "profile", "email"],
            domain: result.domain,
            clientId: result.client_id!,
          });

          if (result.user) {
            setUser(result.user);
          } else {
            try {
              const userProfile = await apiClient.getMe();
              setUser(userProfile);
            } catch {
              // User profile fetch failed, but session is valid
            }
          }
        }
      } catch (err) {
        if (debug) {
          console.log("[SignifyID] Session validation failed:", err);
        }
      } finally {
        setIsLoading(false);
      }
    }

    validateSession();
  }, [apiClient, debug]);

  // Call onAuthStateChange when auth state changes
  useEffect(() => {
    onAuthStateChange?.(isAuthenticated, user);
  }, [isAuthenticated, user, onAuthStateChange]);

  const contextValue = useMemo<SignifyContextValue>(
    () => ({
      config,
      apiClient,
      user,
      session,
      isAuthenticated,
      isLoading,
      error,
      setUser,
      setSession,
      setIsLoading,
      setError,
    }),
    [config, apiClient, user, session, isAuthenticated, isLoading, error]
  );

  return (
    <SignifyContext.Provider value={contextValue}>
      {children}
    </SignifyContext.Provider>
  );
}
