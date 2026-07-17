"client-only";

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

/**
 * Attaches Bearer session token from Limen. On 401, revalidates session once.
 */
export async function fetchWithAuth<T = unknown>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const doFetch = async (token: string | null) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    Object.assign(headers, normalizeHeaders(options.headers));
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
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

  if (res.status === 401) {
    const newToken = await tryRefreshToken();
    if (newToken) {
      res = await doFetch(newToken);
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      body.error || body.message || `Request failed with status ${res.status}`,
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

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
