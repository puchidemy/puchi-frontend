"client-only";

import { apiErrorFromResponse } from "./api-error";
import { getToken, tryRefreshToken } from "./token-manager";

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

type AuthMode = "bearer" | "cookie-only";

/**
 * Attaches Bearer session token from Limen when available.
 *
 * On 401:
 * 1. Retry once without Authorization so Go middleware can use HttpOnly
 *    `limen_session` cookie (stale Bearer must not shadow a valid cookie).
 * 2. Then try session refresh and retry with the new Bearer.
 */
export async function fetchWithAuth<T = unknown>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const doFetch = async (mode: AuthMode, token: string | null) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    Object.assign(headers, normalizeHeaders(options.headers));

    // Never send empty/whitespace Bearer — that blocks cookie fallback on the server.
    if (mode === "bearer" && token && token.trim()) {
      headers["Authorization"] = `Bearer ${token.trim()}`;
    } else {
      delete headers["Authorization"];
      delete headers["authorization"];
    }

    const finalHeaders =
      options.body instanceof FormData
        ? Object.fromEntries(
            Object.entries(headers).filter(
              ([k]) => k.toLowerCase() !== "content-type",
            ),
          )
        : headers;

    return fetch(url, {
      ...options,
      headers: finalHeaders,
      credentials: "include",
    });
  };

  let token = getToken();
  let res = await doFetch("bearer", token);

  if (res.status === 401) {
    // Cookie-only retry (OAuth / race where Bearer is stale or missing)
    res = await doFetch("cookie-only", null);
  }

  if (res.status === 401) {
    const newToken = await tryRefreshToken();
    if (newToken) {
      res = await doFetch("bearer", newToken);
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw apiErrorFromResponse(res.status, body);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function fetchWithAuthResult<T = unknown>(
  url: string,
  options: RequestInit = {},
): Promise<{ ok: true; data: T } | { ok: false; error: string; status?: number }> {
  try {
    const data = await fetchWithAuth<T>(url, options);
    return { ok: true, data };
  } catch (err) {
    if (err && typeof err === "object" && "status" in err) {
      const e = err as { message?: string; status?: number };
      return {
        ok: false,
        error: e.message || "Request failed",
        status: e.status,
      };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Request failed",
    };
  }
}
