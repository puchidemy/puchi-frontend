"client-only";

import { useAuthStore } from "@/store/auth";

let currentToken: string | null = null;
let currentBaseUrl = "http://localhost:8080";
let refreshPromise: Promise<string | null> | null = null;
let tokenListeners: Array<(token: string | null) => void> = [];

export function getToken(): string | null {
  return currentToken;
}

export function setToken(token: string | null): void {
  currentToken = token;
  tokenListeners.forEach((fn) => fn(token));
  // Sync to Zustand store (sessionStorage persist)
  useAuthStore.getState().setAccessToken(token);
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

export function setBaseUrl(url: string): void {
  currentBaseUrl = url;
}

/**
 * Restore token from Zustand store (sessionStorage) on page reload.
 * Returns the token if found, otherwise null.
 */
export function restoreTokenFromStore(): string | null {
  const stored = useAuthStore.getState().accessToken;
  if (stored && !currentToken) {
    currentToken = stored;
    tokenListeners.forEach((fn) => fn(stored));
  }
  return currentToken;
}

/**
 * Sync the in-memory token to the SSR cookie via the set-session Route Handler.
 * Should be called after login, register+login, or refresh to keep SSR in sync.
 */
export async function syncTokenToCookie(): Promise<void> {
  if (!currentToken) return;
  try {
    await fetch("/api/auth/set-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token: currentToken }),
    });
  } catch {
    // Cookie sync is best-effort — SSR will use in-memory fallback
  }
}

/**
 * Attempt to refresh the access token using the HttpOnly refresh_token cookie.
 * The refresh_token is set by auth-service on api.puchi.io.vn domain.
 * The browser automatically sends it when making a fetch with credentials: 'include'.
 */
export async function tryRefreshToken(): Promise<string | null> {
  // Deduplicate concurrent refresh calls
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${currentBaseUrl}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        if (currentToken) {
          currentToken = null;
          tokenListeners.forEach((fn) => fn(null));
        }
        return null;
      }

      const data = await res.json();
      currentToken = data.access_token ?? null;
      tokenListeners.forEach((fn) => fn(currentToken));
      // Sync to Zustand store
      useAuthStore.getState().setAccessToken(currentToken);
      return currentToken;
    } catch {
      if (currentToken) {
        currentToken = null;
        tokenListeners.forEach((fn) => fn(null));
      }
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}
