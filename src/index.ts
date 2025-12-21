/**
 * @signifyid/client - Official React SDK for Signify iD
 *
 * Digital Identity & Access Management
 *
 * @example
 * ```tsx
 * import { SignifyProvider, useSignifyAuth, ProtectedRoute } from '@signifyid/client';
 *
 * function App() {
 *   return (
 *     <SignifyProvider
 *       config={{
 *         apiUrl: "https://api.signifyid.com",
 *         loginUrl: "https://signifyid.com/client/login"
 *       }}
 *     >
 *       <ProtectedRoute>
 *         <Dashboard />
 *       </ProtectedRoute>
 *     </SignifyProvider>
 *   );
 * }
 * ```
 *
 * @packageDocumentation
 */

// Components
export { SignifyProvider } from "./context/SignifyProvider";
export { ProtectedRoute } from "./components/ProtectedRoute";

// Hooks
export { useSignifyAuth } from "./hooks/useSignifyAuth";
export { useSignifyConfig } from "./context/SignifyContext";

// Types
export type {
  SignifyConfig,
  SignifySession,
  SignifyUser,
  SignifyAuthState,
  SignifyProviderProps,
  ProtectedRouteProps,
} from "./types";

export { DEFAULT_CONFIG } from "./types";

// Utilities (for advanced usage)
export {
  setCookie,
  getCookie,
  deleteCookie,
  hasCookie,
  isBrowser,
} from "./utils/cookies";

export {
  getTokenFromUrl,
  cleanUrlParams,
  buildLoginUrl,
  getCurrentUrl,
  navigateTo,
  reloadPage,
} from "./utils/url";

export {
  setStorageItem,
  getStorageItem,
  removeStorageItem,
  isStorageAvailable,
} from "./utils/storage";
