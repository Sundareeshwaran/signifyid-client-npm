/**
 * @signifyid/client - Utility Functions
 *
 * Helper utilities for the Signify iD SDK.
 *
 * @packageDocumentation
 */

/**
 * Check if code is running in browser
 */
export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/**
 * Generate a random state parameter for CSRF protection
 */
export function generateState(length = 32): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const randomValues = new Uint8Array(length);

  if (isBrowser() && window.crypto) {
    window.crypto.getRandomValues(randomValues);
  } else {
    // Fallback for non-browser environments
    for (let i = 0; i < length; i++) {
      randomValues[i] = Math.floor(Math.random() * 256);
    }
  }

  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }

  return result;
}

/**
 * Store state in sessionStorage for CSRF validation
 */
export function storeState(state: string): void {
  if (isBrowser()) {
    sessionStorage.setItem("signifyid_state", state);
  }
}

/**
 * Retrieve and clear stored state
 */
export function retrieveState(): string | null {
  if (!isBrowser()) return null;

  const state = sessionStorage.getItem("signifyid_state");
  sessionStorage.removeItem("signifyid_state");
  return state;
}

/**
 * Validate that returned state matches stored state
 */
export function validateState(returnedState: string): boolean {
  const storedState = retrieveState();
  return storedState === returnedState;
}

/**
 * Parse JWT token (without validation)
 * Warning: This does NOT validate the token signature
 */
export function parseJwt<T = Record<string, unknown>>(token: string): T | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload) as T;
  } catch {
    return null;
  }
}

/**
 * Check if a JWT token is expired
 */
export function isTokenExpired(token: string, bufferSeconds = 60): boolean {
  const payload = parseJwt<{ exp?: number }>(token);
  if (!payload?.exp) return true;

  const expirationTime = payload.exp * 1000; // Convert to milliseconds
  const bufferTime = bufferSeconds * 1000;

  return Date.now() > expirationTime - bufferTime;
}

/**
 * Format time remaining until expiry
 */
export function formatTimeRemaining(milliseconds: number): string {
  if (milliseconds <= 0) return "Expired";

  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}
