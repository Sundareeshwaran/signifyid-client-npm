/**
 * @signifyid/client - Main Entry Point
 *
 * Core exports for the Signify iD Client SDK.
 * For React-specific exports, use '@signifyid/client/react'.
 *
 * @packageDocumentation
 */

// Types
export type {
  SignifyConfig,
  SignifyUser,
  SignifySession,
  SignifyError,
  LoginOptions,
  LogoutOptions,
  TokenRefreshResult,
  LoginResponse,
  SessionValidateResponse,
} from "./types";

// API Client
export { SignifyApiClient, createSignifyClient } from "./api-client";

// Errors
export { SignifyAuthError, parseAuthError } from "./errors";

// Utilities
export {
  isBrowser,
  generateState,
  storeState,
  retrieveState,
  validateState,
  parseJwt,
  isTokenExpired,
  formatTimeRemaining,
} from "./utils";
