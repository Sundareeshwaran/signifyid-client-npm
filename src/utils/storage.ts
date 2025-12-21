/**
 * LocalStorage utility functions with SSR protection
 * Optional fallback for session storage
 * @packageDocumentation
 */

import { isBrowser } from "./cookies";

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
