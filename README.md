# @signifyid/client

Official Signify iD Client SDK for React applications.

## Installation

```bash
npm install @signifyid/client
# or
pnpm add @signifyid/client
# or
yarn add @signifyid/client
```

## Quick Start

### 1. Wrap your app with SignifyProvider

```tsx
// app/providers.tsx
"use client";

import { SignifyProvider } from "@signifyid/client/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SignifyProvider
      clientId={process.env.NEXT_PUBLIC_SIGNIFYID_CLIENT_ID!}
      redirectUri={process.env.NEXT_PUBLIC_SIGNIFYID_REDIRECT_URI!}
    >
      {children}
    </SignifyProvider>
  );
}
```

### 2. Use authentication hooks

```tsx
import {
  useClientAuth,
  useClientSession,
  useClientLogout,
} from "@signifyid/client/react";

// Login
function LoginButton() {
  const { login, isLoading } = useClientAuth();
  return (
    <button onClick={() => login()} disabled={isLoading}>
      Sign In
    </button>
  );
}

// Access user data
function Dashboard() {
  const { user, isAuthenticated, isLoading } = useClientSession();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please sign in</div>;

  return <div>Welcome, {user.name}</div>;
}

// Logout
function LogoutButton() {
  const { logout, isLoading } = useClientLogout();
  return (
    <button onClick={() => logout()} disabled={isLoading}>
      Sign Out
    </button>
  );
}
```

## Hooks

| Hook               | Description                            |
| ------------------ | -------------------------------------- |
| `useClientAuth`    | Login flow and OAuth callback handling |
| `useClientSession` | Access current session and user data   |
| `useClientLogout`  | Logout operations                      |
| `useTokenRefresh`  | Token refresh management               |

## Non-React Usage

For non-React environments, use the core API client:

```ts
import { createSignifyClient } from "@signifyid/client";

const client = createSignifyClient("https://api.signifyid.com");
const session = await client.validateSession();
```

## TypeScript

The SDK is written in TypeScript and includes type definitions out of the box.

```ts
import type { SignifyUser, SignifySession } from "@signifyid/client";
```

## License

MIT
