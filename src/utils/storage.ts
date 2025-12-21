/**
 * LocalStorage utility functions with SSR protection
 * Optional fallback for session storage
 * @packageDocumentation
 */

import { isBrowser } from "./cookies";
import type { SignifySession } from "../types";

/**
 * Safely set an item in localStorage
 * @param key - Storage key
 * @param value - Value to store
 */
export function setStorageItem(key: string, value: string): void {
  if (!isBrowser()) {
    return;
  }

  try {
    localStorage.setItem(key, value);
  } catch (error) {
    // localStorage might be disabled or full
    console.warn("[Signify SDK] Failed to write to localStorage:", error);
  }
}

/**
 * Safely get an item from localStorage
 * @param key - Storage key
 * @returns Stored value or null if not found
 */
export function getStorageItem(key: string): string | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn("[Signify SDK] Failed to read from localStorage:", error);
    return null;
  }
}

/**
 * Safely remove an item from localStorage
 * @param key - Storage key
 */
export function removeStorageItem(key: string): void {
  if (!isBrowser()) {
    return;
  }

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn("[Signify SDK] Failed to remove from localStorage:", error);
  }
}

/**
 * Check if localStorage is available
 * @returns true if localStorage is available and writable
 */
export function isStorageAvailable(): boolean {
  if (!isBrowser()) {
    return false;
  }

  try {
    const testKey = "__signify_test__";
    localStorage.setItem(testKey, "test");
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// Session Caching Functions
// ============================================================================

/** Storage key for cached session */
const SESSION_CACHE_KEY = "signify_session_cache";

/** Cached session with timestamp for TTL */
interface CachedSession {
  session: SignifySession;
  cachedAt: number;
}

/**
 * Save session to localStorage with timestamp
 * @param session - Session data to cache
 */
export function cacheSession(session: SignifySession): void {
  if (!isBrowser()) {
    return;
  }

  try {
    const cached: CachedSession = {
      session,
      cachedAt: Date.now(),
    };
    localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(cached));
  } catch {
    console.warn("[Signify SDK] Failed to cache session to localStorage");
  }
}

/**
 * Get cached session from localStorage
 * @param maxAge - Maximum age of cached session in seconds (default: 5 minutes)
 * @returns Cached session if valid and not expired, null otherwise
 */
export function getCachedSession(maxAge: number = 300): SignifySession | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const stored = localStorage.getItem(SESSION_CACHE_KEY);
    if (!stored) {
      return null;
    }

    const cached: CachedSession = JSON.parse(stored);
    const age = (Date.now() - cached.cachedAt) / 1000; // age in seconds

    // Check if cache is expired
    if (age > maxAge) {
      clearCachedSession();
      return null;
    }

    // Check if session itself is still valid
    if (!cached.session.valid) {
      clearCachedSession();
      return null;
    }

    // Check if session has an expiration and if it's expired
    if (cached.session.expiresAt) {
      const expiresAt = new Date(cached.session.expiresAt).getTime();
      if (Date.now() > expiresAt) {
        clearCachedSession();
        return null;
      }
    }

    return cached.session;
  } catch {
    clearCachedSession();
    return null;
  }
}

/**
 * Clear cached session from localStorage
 */
export function clearCachedSession(): void {
  if (!isBrowser()) {
    return;
  }

  try {
    localStorage.removeItem(SESSION_CACHE_KEY);
  } catch {
    // Ignore errors
  }
}
