# signifyid-client

Official React SDK for **Signify iD** - Digital Identity & Access Management.

Authenticate users in your React or Next.js app with Signify iD in under 5 minutes.

[![npm version](https://img.shields.io/npm/v/signifyid-client.svg)](https://www.npmjs.com/package/signifyid-client)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What is Signify iD?

Signify iD is a modern Digital Identity & Access Management platform that provides:

- **Single Sign-On (SSO)** - One login for all your applications
- **Session Management** - Secure, token-based authentication
- **User Management** - Comprehensive user administration
- **Multi-Factor Authentication** - Enhanced security options

This SDK enables seamless integration with Signify iD's redirect-based authentication flow.

---

## Installation

```bash
npm install signifyid-client
```

```bash
yarn add signifyid-client
```

```bash
pnpm add signifyid-client
```

---

## Quick Start (5 minutes)

### 1. Wrap your app with SignifyProvider

```tsx
// app/layout.tsx (Next.js App Router)
import { SignifyProvider } from "signifyid-client";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SignifyProvider
          config={{
            apiUrl: process.env.NEXT_PUBLIC_SIGNIFY_API_URL!,
            loginUrl: process.env.NEXT_PUBLIC_SIGNIFY_LOGIN_URL!,
          }}
        >
          {children}
        </SignifyProvider>
      </body>
    </html>
  );
}
```

### 2. Protect routes that require authentication

```tsx
// app/dashboard/page.tsx
import { ProtectedRoute } from "signifyid-client";
import Dashboard from "./Dashboard";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
```

### 3. Use the auth hook in your components

```tsx
// components/Navbar.tsx
"use client";

import { useSignifyAuth } from "signifyid-client";

export function Navbar() {
  const { isAuthenticated, isLoading, user, login, logout } = useSignifyAuth();

  if (isLoading) {
    return <nav>Loading...</nav>;
  }

  return (
    <nav>
      {isAuthenticated ? (
        <>
          <span>Welcome, {user?.name}!</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={login}>Login with Signify iD</button>
      )}
    </nav>
  );
}
```

### 4. Set up environment variables

```bash
# .env.local
NEXT_PUBLIC_SIGNIFY_API_URL=https://api.signifyid.com
NEXT_PUBLIC_SIGNIFY_LOGIN_URL=https://signifyid.com/client/login
```

**That's it! 🎉** Your app now supports Signify iD authentication.

---

## API Reference

### SignifyProvider

The root provider that enables Signify iD authentication throughout your app.

```tsx
<SignifyProvider
  config={{
    apiUrl: string;           // Required: Backend API URL
    loginUrl: string;         // Required: Signify iD login page URL
    cookieName?: string;      // Optional: Cookie name (default: "clientSession")
    cookieMaxAge?: number;    // Optional: Cookie max age in seconds (default: 86400)
    tokenParam?: string;      // Optional: URL token parameter (default: "token")
    debug?: boolean;          // Optional: Enable debug logging (default: false)
  }}
  onAuthStateChange?: (state) => void  // Optional: Callback on auth state changes
>
  {children}
</SignifyProvider>
```

### useSignifyAuth

Hook to access authentication state and methods.

```tsx
const {
  isAuthenticated, // boolean: Whether user is authenticated
  isLoading, // boolean: Whether auth is being validated
  session, // SignifySession | null: Full session data
  user, // SignifyUser | null: User data (shortcut for session.user)
  login, // () => void: Redirect to Signify iD login
  logout, // () => Promise<void>: Log out and clear session
  validateSession, // () => Promise<void>: Manually re-validate session
} = useSignifyAuth();
```

### ProtectedRoute

Component that protects children by requiring authentication.

```tsx
<ProtectedRoute
  loadingComponent?: React.ReactNode  // Optional: Custom loading UI
  redirectUrl?: string                 // Optional: Custom redirect URL
  onRedirect?: () => void              // Optional: Callback before redirect
>
  {children}
</ProtectedRoute>
```

### useSignifyConfig

Hook to access the resolved configuration.

```tsx
const config = useSignifyConfig();
// Returns: { apiUrl, loginUrl, cookieName, cookieMaxAge, tokenParam, debug }
```

---

## Authentication Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Your App      │     │   Signify iD    │     │  Signify API    │
│                 │     │   Login Page    │     │                 │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │  1. User visits       │                       │
         │     protected route   │                       │
         │                       │                       │
         │  2. Redirect ────────>│                       │
         │     ?redirect=...     │                       │
         │                       │                       │
         │                       │  3. User logs in      │
         │                       │                       │
         │  4. Redirect back <───│                       │
         │     ?token=...        │                       │
         │                       │                       │
         │  5. SDK extracts token, stores in cookie      │
         │                       │                       │
         │  6. Validate session ─────────────────────────>│
         │                       │                       │
         │  7. Session data <────────────────────────────│
         │                       │                       │
         │  8. User authenticated│                       │
         │     ✓                 │                       │
```

---

## Next.js Examples

### App Router (Next.js 13+)

```tsx
// app/layout.tsx
import { SignifyProvider } from "signifyid-client";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SignifyProvider
          config={{
            apiUrl: process.env.NEXT_PUBLIC_SIGNIFY_API_URL!,
            loginUrl: process.env.NEXT_PUBLIC_SIGNIFY_LOGIN_URL!,
            debug: process.env.NODE_ENV === "development",
          }}
        >
          {children}
        </SignifyProvider>
      </body>
    </html>
  );
}
```

```tsx
// app/dashboard/layout.tsx
import { ProtectedRoute } from "signifyid-client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute
      loadingComponent={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      }
    >
      {children}
    </ProtectedRoute>
  );
}
```

### Pages Router

```tsx
// pages/_app.tsx
import type { AppProps } from "next/app";
import { SignifyProvider } from "signifyid-client";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SignifyProvider
      config={{
        apiUrl: process.env.NEXT_PUBLIC_SIGNIFY_API_URL!,
        loginUrl: process.env.NEXT_PUBLIC_SIGNIFY_LOGIN_URL!,
      }}
    >
      <Component {...pageProps} />
    </SignifyProvider>
  );
}
```

```tsx
// pages/dashboard.tsx
import { ProtectedRoute, useSignifyAuth } from "signifyid-client";

function DashboardContent() {
  const { user, logout } = useSignifyAuth();

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <p>Email: {user?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
```

---

## TypeScript Support

This package is written in TypeScript and includes full type definitions.

```tsx
import type {
  SignifyConfig,
  SignifySession,
  SignifyUser,
  SignifyAuthState,
  SignifyProviderProps,
  ProtectedRouteProps,
} from "signifyid-client";
```

### Custom User Type

If your Signify iD returns additional user properties:

```tsx
interface MyUser extends SignifyUser {
  organizationId: string;
  role: "admin" | "user";
}

const { user } = useSignifyAuth();
const myUser = user as MyUser | null;
```

---

## Advanced Usage

### Listen to Auth State Changes

```tsx
<SignifyProvider
  config={config}
  onAuthStateChange={(state) => {
    if (state.isAuthenticated) {
      analytics.identify(state.user?.id);
    }
  }}
>
  {children}
</SignifyProvider>
```

### Custom Redirect URL

```tsx
<ProtectedRoute redirectUrl="/custom-login">
  <Dashboard />
</ProtectedRoute>
```

### Manual Session Validation

```tsx
const { validateSession } = useSignifyAuth();

// Re-validate session on demand
await validateSession();
```

### Utility Functions

For advanced use cases, utility functions are also exported:

```tsx
import {
  setCookie,
  getCookie,
  deleteCookie,
  getTokenFromUrl,
  cleanUrlParams,
  isBrowser,
} from "signifyid-client";
```

---

## Security Considerations

- **SSR Safe**: All browser APIs are wrapped with `isBrowser()` checks
- **Credentials**: Uses `credentials: 'include'` for cross-domain cookie support
- **Token Cleanup**: Automatically removes token from URL after extraction
- **Secure Cookies**: Uses `SameSite=Lax` for CSRF protection
- **No Token Exposure**: Tokens are stored in cookies, not in JavaScript state

---

## Troubleshooting

### "useSignifyAuth must be used within a SignifyProvider"

Make sure your component is a child of `<SignifyProvider>`:

```tsx
// ❌ Wrong
<SignifyProvider>...</SignifyProvider>
<MyComponent /> // Outside provider!

// ✅ Correct
<SignifyProvider>
  <MyComponent /> // Inside provider
</SignifyProvider>
```

### Session not persisting after redirect

1. Ensure your `apiUrl` and `loginUrl` are correct
2. Check if CORS is configured on your backend
3. Verify cookies are being set (check browser DevTools → Application → Cookies)

### Infinite redirect loop

This usually happens when session validation always returns `valid: false`. Check:

1. Your backend is running and accessible
2. The session validation endpoint is correct: `POST /api/client-auth/session/validate`
3. Credentials are being sent with the request

---

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

---

## License

MIT © [Signify iD](https://signifyid.com)
