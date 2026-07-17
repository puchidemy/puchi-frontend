"client-only";

import { getToken, tryRefreshToken, syncTokenToCookie } from "./token-manager";

/**
 * Build headers from a RequestInit headers value into a plain object.
 */
function normalizeHeaders(
  headersInit: HeadersInit | undefined,
): Record<string, string> {
  if (!headersInit) return {};

  if (headersInit instanceof Headers) {
    const out: Record<string, string> = {};
    headersInit.forEach((value, key) => {
      out[key] = value;
    });
    return out;
  }

  if (Array.isArray(headersInit)) {
    const out: Record<string, string> = {};
    for (const [key, value] of headersInit) {
      out[key] = value;
    }
    return out;
  }

  return headersInit as Record<string, string>;
}

/**
 * fetch wrapper that:
 * 1. Automatically attaches `Authorization: Bearer <token>` from in-memory token-manager
 * 2. On 401, silently attempts to refresh the token via POST /auth/refresh
 * 3. Retries the original request with the new token on successful refresh
 * 4. Falls back to unauthenticated request if no token is available
 */
export async function fetchWithAuth<T = unknown>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const doFetch = async (token: string | null) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Merge user-provided headers
    Object.assign(headers, normalizeHeaders(options.headers));

    // Attach Bearer token if available
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData — browser sets it with boundary
    const finalHeaders =
      options.body instanceof FormData
        ? Object.fromEntries(
            Object.entries(headers).filter(([k]) => k !== "Content-Type"),
          )
        : headers;

    return fetch(url, {
      ...options,
      headers: finalHeaders,
      credentials: "include",
    });
  };

  let token = getToken();
  let res = await doFetch(token);

  // On 401, try to refresh the token and retry once
  if (res.status === 401) {
    const newToken = await tryRefreshToken();
    if (newToken) {
      // Sync new token to SSR cookie (best-effort)
      syncTokenToCookie();
      res = await doFetch(newToken);
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      body.error || body.message || `Request failed with status ${res.status}`,
    );
  }

  // Handle 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json();
}

/**
 * Result-style variant of fetchWithAuth (no throw).
 */
export async function fetchWithAuthResult<T = unknown>(
  url: string,
  options: RequestInit = {},
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const data = await fetchWithAuth<T>(url, options);
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Request failed",
    };
  }
}
