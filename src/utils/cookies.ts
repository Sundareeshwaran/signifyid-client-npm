/**
 * Cookie utility functions with SSR protection
 * @packageDocumentation
 */

/**
 * Check if we're in a browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

/**
 * Set a cookie with the given name, value, and options
 * @param name - Cookie name
 * @param value - Cookie value
 * @param maxAge - Max age in seconds (default: 86400)
 * @param path - Cookie path (default: "/")
 */
export function setCookie(
  name: string,
  value: string,
  maxAge: number = 86400,
  path: string = "/"
): void {
  if (!isBrowser()) {
    return;
  }

  const cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(
    value
  )}; path=${path}; max-age=${maxAge}; samesite=lax`;
  document.cookie = cookieString;
}

/**
 * Get a cookie value by name
 * @param name - Cookie name
 * @returns Cookie value or null if not found
 */
export function getCookie(name: string): string | null {
  if (!isBrowser()) {
    return null;
  }

  const cookies = document.cookie.split(";");
  const encodedName = encodeURIComponent(name);

  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split("=");
    if (cookieName === encodedName) {
      return decodeURIComponent(cookieValue || "");
    }
  }

  return null;
}

/**
 * Delete a cookie by name
 * @param name - Cookie name
 * @param path - Cookie path (default: "/")
 */
export function deleteCookie(name: string, path: string = "/"): void {
  if (!isBrowser()) {
    return;
  }

  document.cookie = `${encodeURIComponent(name)}=; path=${path}; max-age=0`;
}

/**
 * Check if a cookie exists
 * @param name - Cookie name
 * @returns true if cookie exists
 */
export function hasCookie(name: string): boolean {
  return getCookie(name) !== null;
}
