/**
 * URL utility functions with SSR protection
 * @packageDocumentation
 */

import { isBrowser } from "./cookies";

/**
 * Get a token from the current URL query parameters
 * @param paramName - Parameter name to extract (default: "token")
 * @returns Token value or null if not found
 */
export function getTokenFromUrl(paramName: string = "token"): string | null {
  if (!isBrowser()) {
    return null;
  }

  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(paramName);
}

/**
 * Remove specified parameters from the current URL without reloading
 * @param params - Array of parameter names to remove
 */
export function cleanUrlParams(params: string[]): void {
  if (!isBrowser()) {
    return;
  }

  const url = new URL(window.location.href);
  let hasChanges = false;

  for (const param of params) {
    if (url.searchParams.has(param)) {
      url.searchParams.delete(param);
      hasChanges = true;
    }
  }

  if (hasChanges) {
    // Use replaceState to avoid adding to browser history
    window.history.replaceState({}, "", url.toString());
  }
}

/**
 * Build a login URL with redirect parameter
 * @param loginUrl - Base login URL
 * @param redirectUrl - URL to redirect back to after login (default: current URL)
 * @returns Full login URL with redirect parameter
 */
export function buildLoginUrl(loginUrl: string, redirectUrl?: string): string {
  if (!isBrowser() && !redirectUrl) {
    return loginUrl;
  }

  const redirect = redirectUrl || window.location.href;
  const url = new URL(loginUrl);
  url.searchParams.set("redirect", redirect);

  return url.toString();
}

/**
 * Get the current page URL
 * @returns Current URL or empty string if not in browser
 */
export function getCurrentUrl(): string {
  if (!isBrowser()) {
    return "";
  }

  return window.location.href;
}

/**
 * Navigate to a URL
 * @param url - URL to navigate to
 */
export function navigateTo(url: string): void {
  if (!isBrowser()) {
    return;
  }

  window.location.href = url;
}

/**
 * Reload the current page
 */
export function reloadPage(): void {
  if (!isBrowser()) {
    return;
  }

  window.location.reload();
}
