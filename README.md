# signifyid-client

<div align="center">

Official React SDK for Signify iD - Digital Identity & Access Management

[![npm version](https://img.shields.io/npm/v/signifyid-client.svg)](https://www.npmjs.com/package/signifyid-client)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React Version](https://img.shields.io/badge/React-%3E%3D17.0.0-blue.svg)](https://reactjs.org/)

</div>

## Overview

**signifyid-client** is a production-ready React SDK that provides seamless integration with Signify iD's authentication platform. It supports both CommonJS and ES Module builds with full TypeScript support, making it compatible with modern React applications, Next.js, and beyond.

### Key Features

- **Single Sign-On (SSO)** - Unified authentication across multiple applications
- **Session Management** - Secure, token-based authentication with automatic refresh
- **Protected Routes** - Built-in component for authentication-gated routes
- **Multi-Factor Authentication** - Support for enhanced security options
- **TypeScript First** - Complete type definitions included
- **Framework Agnostic** - Works with React, Next.js (App & Pages Router), and standard React SPAs
- **SSR Safe** - Proper handling of server-side rendering concerns
- **Zero External Dependencies** - Minimal bundle size impact

## Installation

Install the package using your preferred package manager:

```bash
npm install signifyid-client
```

```bash
yarn add signifyid-client
```

```bash
pnpm add signifyid-client
```

### Prerequisites

- React 17.0.0 or higher
- React DOM 17.0.0 or higher

## Quick Start

### Step 1: Configure Environment Variables

Add the required configuration to your environment file:

```bash
# .env.local (Next.js) or .env
NEXT_PUBLIC_SIGNIFY_API_URL=https://api.signifyid.com
NEXT_PUBLIC_SIGNIFY_LOGIN_URL=https://signifyid.com/client/login
```

### Step 2: Initialize the Provider

Wrap your application with `SignifyProvider`:

```tsx
// app/layout.tsx (Next.js App Router)
import { SignifyProvider } from "signifyid-client";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

### Step 3: Protect Routes

Use `ProtectedRoute` to guard components requiring authentication:

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

### Step 4: Access Authentication State

Use the `useSignifyAuth` hook to interact with authentication:

```tsx
"use client";

import { useSignifyAuth } from "signifyid-client";

export function Navbar() {
  const { isAuthenticated, isLoading, user, login, logout } = useSignifyAuth();

  if (isLoading) {
    return <nav>Loading authentication state...</nav>;
  }

  return (
    <nav>
      {isAuthenticated ? (
        <>
          <span>Welcome, {user?.name}</span>
          <button onClick={logout}>Sign Out</button>
        </>
      ) : (
        <button onClick={login}>Sign In with Signify iD</button>
      )}
    </nav>
  );
}
```

---

## Core API

### SignifyProvider

Root provider component that establishes the authentication context throughout your application.

**Props:**

- `config` (required) - Configuration object with:
  - `apiUrl` (string) - Backend API endpoint URL
  - `loginUrl` (string) - Signify iD login page URL
  - `cookieName?` (string) - Session cookie name (default: `"clientSession"`)
  - `cookieMaxAge?` (number) - Cookie expiration in seconds (default: `86400`)
  - `tokenParam?` (string) - URL parameter for token extraction (default: `"token"`)
  - `debug?` (boolean) - Enable debug logging (default: `false`)
- `onAuthStateChange?` - Callback function invoked on authentication state changes

**Example:**

```tsx
<SignifyProvider
  config={{
    apiUrl: "https://api.signifyid.com",
    loginUrl: "https://signifyid.com/client/login",
    debug: process.env.NODE_ENV === "development",
  }}
  onAuthStateChange={(state) => {
    if (state.isAuthenticated) {
      // Handle authenticated state
    }
  }}
>
  {children}
</SignifyProvider>
```

### useSignifyAuth

Hook to access authentication state and methods within a SignifyProvider context.

**Returns:**
| Property | Type | Description |
|----------|------|-------------|
| `isAuthenticated` | `boolean` | User authentication status |
| `isLoading` | `boolean` | Session validation in progress |
| `session` | `SignifySession \| null` | Complete session object |
| `user` | `SignifyUser \| null` | Authenticated user data |
| `login()` | `() => void` | Redirect to Signify iD login page |
| `logout()` | `() => Promise<void>` | Clear session and sign out user |
| `validateSession()` | `() => Promise<void>` | Manually validate session |

**Example:**

```tsx
"use client";

import { useSignifyAuth } from "signifyid-client";

export function Profile() {
  const { user, isLoading, logout } = useSignifyAuth();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{user?.name}</h1>
      <button onClick={logout}>Sign Out</button>
    </div>
  );
}
```

### ProtectedRoute

Component that conditionally renders children only when user is authenticated.

**Props:**

- `children` (required) - Component to render when authenticated
- `loadingComponent?` - Loading UI displayed during session validation
- `redirectUrl?` - Custom redirect URL (default: login URL)
- `onRedirect?` - Callback before redirect to login

**Example:**

```tsx
<ProtectedRoute loadingComponent={<LoadingSpinner />} redirectUrl="/auth/login">
  <Dashboard />
</ProtectedRoute>
```

### useSignifyConfig

Hook to access resolved configuration values.

**Returns:** Configuration object containing all provider settings

```tsx
const config = useSignifyConfig();
console.log(config.apiUrl);
```

### Utility Functions

Exported utility functions for advanced use cases:

```tsx
import {
  setCookie, // Set HTTP cookie
  getCookie, // Retrieve cookie value
  deleteCookie, // Remove cookie
  getTokenFromUrl, // Extract token from URL parameters
  cleanUrlParams, // Remove parameters from URL
  isBrowser, // Check if running in browser environment
} from "signifyid-client";
```

---

## Authentication Flow

The SDK follows a redirect-based OAuth-style authentication pattern:

```
┌──────────────────┐        ┌─────────────────┐        ┌────────────────┐
│  Your App        │        │  Signify iD     │        │  Backend API   │
│                  │        │  Login Portal   │        │                │
└────────┬─────────┘        └────────┬────────┘        └────────┬───────┘
         │                          │                          │
         │  1. User accesses        │                          │
         │     protected route      │                          │
         │                          │                          │
         │  2. Redirect ───────────>│                          │
         │     ?redirect=app.com    │                          │
         │                          │                          │
         │                  3. User signs in                   │
         │                          │                          │
         │  4. Redirect <───────────│                          │
         │     ?token=JWT_TOKEN     │                          │
         │                          │                          │
         │  5. Extract & store token in secure cookie          │
         │                          │                          │
         │  6. Validate session ───────────────────────────────>│
         │                          │                          │
         │  7. Session data <──────────────────────────────────│
         │                          │                          │
         │  8. User authenticated ✓ │                          │
```

## Integration Examples

### Next.js App Router (13+)

**Root Layout:**

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

**Protected Layout:**

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

### Next.js Pages Router

**Application Entry:**

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

**Protected Page:**

```tsx
// pages/dashboard.tsx
import { ProtectedRoute, useSignifyAuth } from "signifyid-client";

function DashboardContent() {
  const { user, logout } = useSignifyAuth();

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <p>Email: {user?.email}</p>
      <button onClick={logout}>Sign Out</button>
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

### Standard React SPA

```tsx
// src/App.tsx
import {
  SignifyProvider,
  ProtectedRoute,
  useSignifyAuth,
} from "signifyid-client";

function Dashboard() {
  const { user, logout } = useSignifyAuth();
  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <button onClick={logout}>Sign Out</button>
    </div>
  );
}

export function App() {
  return (
    <SignifyProvider
      config={{
        apiUrl: process.env.REACT_APP_SIGNIFY_API_URL!,
        loginUrl: process.env.REACT_APP_SIGNIFY_LOGIN_URL!,
      }}
    >
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    </SignifyProvider>
  );
}
```

---

## TypeScript Support

Full TypeScript support is included out of the box. The package exports comprehensive type definitions for all components and hooks.

**Exported Types:**

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

**Type Safety Example:**

```tsx
interface ExtendedUser extends SignifyUser {
  organizationId: string;
  role: "admin" | "user" | "viewer";
}

export function AdminPanel() {
  const { user } = useSignifyAuth();
  const adminUser = user as ExtendedUser | null;

  if (adminUser?.role !== "admin") {
    return <div>Access Denied</div>;
  }

  return <div>Admin Content</div>;
}
```

---

## Advanced Usage

### Auth State Change Callbacks

Listen to authentication state changes at the provider level:

```tsx
<SignifyProvider
  config={config}
  onAuthStateChange={(state) => {
    if (state.isAuthenticated && state.user) {
      // Track user authentication
      analytics.identify(state.user.id);
    } else {
      // Clear user-specific data
      analytics.reset();
    }
  }}
>
  {children}
</SignifyProvider>
```

### Custom Redirect Behavior

```tsx
<ProtectedRoute
  redirectUrl="/auth/login"
  onRedirect={() => {
    // Custom logic before redirect
    console.log("User will be redirected to login");
  }}
>
  <Dashboard />
</ProtectedRoute>
```

### Manual Session Validation

Re-validate session on demand:

```tsx
import { useSignifyAuth } from "signifyid-client";

export function AuthStatus() {
  const { validateSession, isAuthenticated } = useSignifyAuth();

  const handleRefresh = async () => {
    await validateSession();
  };

  return (
    <div>
      <p>Status: {isAuthenticated ? "Authenticated" : "Not authenticated"}</p>
      <button onClick={handleRefresh}>Refresh Session</button>
    </div>
  );
}
```

### Advanced Cookie Configuration

```tsx
<SignifyProvider
  config={{
    apiUrl: "https://api.signifyid.com",
    loginUrl: "https://signifyid.com/client/login",
    cookieName: "my_session_token",
    cookieMaxAge: 604800, // 7 days in seconds
    tokenParam: "auth_token", // Custom URL parameter name
    debug: true, // Enable verbose logging
  }}
>
  {children}
</SignifyProvider>
```

---

## Security Considerations

The SDK implements security best practices throughout:

- **Server-Side Rendering Safe** - All browser APIs are protected with `isBrowser()` checks
- **Cross-Domain Credentials** - Uses `credentials: 'include'` for proper cookie handling
- **Automatic Token Cleanup** - Token parameters are removed from URL after extraction
- **CSRF Protection** - Cookies are set with `SameSite=Lax`
- **No Client-Side Token Storage** - Authentication tokens are stored exclusively in secure HTTP-only cookies
- **Session Validation** - Regular server-side session validation prevents token tampering

## Troubleshooting

### "useSignifyAuth must be used within a SignifyProvider"

Ensure your component is a child of `<SignifyProvider>`:

```tsx
// ❌ Incorrect - Component outside provider
<SignifyProvider>...</SignifyProvider>
<MyComponent />

// ✅ Correct - Component inside provider
<SignifyProvider>
  <MyComponent />
</SignifyProvider>
```

### Session Not Persisting After Redirect

Verify the following:

1. `apiUrl` and `loginUrl` are correctly configured
2. CORS is enabled on your backend server
3. Cookies are being set (check DevTools → Application → Cookies)
4. Session validation endpoint is accessible at `POST /api/client-auth/session/validate`

### Infinite Redirect Loop

This typically indicates session validation is failing. Check:

1. Backend service is running and accessible
2. Session validation endpoint is properly configured
3. Request credentials are being sent and processed correctly
4. Server is returning valid session data in response

### Debug Mode

Enable debug logging for troubleshooting:

```tsx
<SignifyProvider
  config={{
    apiUrl: process.env.NEXT_PUBLIC_SIGNIFY_API_URL!,
    loginUrl: process.env.NEXT_PUBLIC_SIGNIFY_LOGIN_URL!,
    debug: true,
  }}
>
  {children}
</SignifyProvider>
```

---

## Contributing

We welcome contributions to improve the SDK. Please review our contributing guidelines before submitting pull requests.

For bug reports or feature requests, please open an issue on our GitHub repository.

---

## Publishing

This package is built with `tsup` and supports multiple output formats:

- **CommonJS**: `dist/index.cjs` (for Node.js and bundlers)
- **ES Modules**: `dist/index.js` (for modern browsers and build tools)
- **TypeScript Definitions**: `dist/index.d.ts` and `dist/index.d.cts`

**Build the package:**

```bash
npm run build
```

**Watch mode for development:**

```bash
npm run dev
```

**Type checking:**

```bash
npm run typecheck
```

---

## License

MIT License © [Signify iD](https://signifyid.com)

See the [LICENSE](LICENSE) file for details.

---

## Support

For questions, issues, or support:

- 📧 Email: support@signifyid.com
- 🌐 Website: https://signifyid.com
- 📚 Documentation: https://docs.signifyid.com
