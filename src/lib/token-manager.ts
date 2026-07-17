"client-only";

import { useAuthStore } from "@/store/auth";
import type { User } from "@/store/auth";
import { authClient } from "@/lib/limen-auth";

let currentToken: string | null = null;
let tokenListeners: Array<(token: string | null) => void> = [];

export function getToken(): string | null {
  if (currentToken) return currentToken;
  const fromBearer = authClient.bearer.getTokens()?.accessToken ?? null;
  if (fromBearer) {
    currentToken = fromBearer;
    return currentToken;
  }
  const stored = useAuthStore.getState().accessToken;
  if (stored) {
    currentToken = stored;
  }
  return currentToken;
}

export function setToken(token: string | null): void {
  currentToken = token;
  tokenListeners.forEach((fn) => fn(token));
  useAuthStore.getState().setAccessToken(token);
  if (token) {
    authClient.bearer.setTokens({ accessToken: token });
    document.cookie =
      "session_active=1; path=/; max-age=604800; SameSite=Lax; " +
      (location.protocol === "https:" ? "secure;" : "");
  } else {
    authClient.bearer.clear();
    document.cookie =
      "session_active=; path=/; max-age=0; SameSite=Lax; " +
      (location.protocol === "https:" ? "secure;" : "");
  }
}

export function clearToken(): void {
  setToken(null);
}

export function subscribeToToken(fn: (token: string | null) => void): () => void {
  tokenListeners.push(fn);
  return () => {
    tokenListeners = tokenListeners.filter((f) => f !== fn);
  };
}

export function setBaseUrl(_url: string): void {
  // base URL is fixed via NEXT_PUBLIC_API_URL / limen-auth client
}

export function restoreTokenFromStore(): string | null {
  const stored = useAuthStore.getState().accessToken;
  if (stored && !currentToken) {
    setToken(stored);
  }
  return getToken();
}

export async function syncTokenToCookie(): Promise<void> {
  // Limen session cookie lives on API domain; no SSR JWT cookie bridge needed.
}

/** Re-validate session via Limen GET /auth/me; sync bearer token if present. */
export async function tryRefreshToken(): Promise<string | null> {
  try {
    const session = await authClient.getSession();
    if (!session?.user) {
      clearToken();
      return null;
    }
    const token = authClient.bearer.getTokens()?.accessToken ?? getToken();
    if (token) setToken(token);
    return token;
  } catch {
    clearToken();
    return null;
  }
}

export function userFromLimen(u: {
  id: string;
  email: string;
  emailVerifiedAt?: string | null;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}): User {
  const display =
    u.username ||
    [u.firstName, u.lastName].filter(Boolean).join(" ") ||
    u.email.split("@")[0];
  return {
    id: u.id,
    email: u.email,
    display_name: display,
    email_verified: !!u.emailVerifiedAt,
  };
}

/** @deprecated JWT decode no longer used with Limen opaque sessions */
export function decodeTokenUser(_token: string): User | null {
  return null;
}
