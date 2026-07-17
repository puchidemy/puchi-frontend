"server-only";

import { headers } from "next/headers";

const BACKEND_URL = process.env.API_INTERNAL_URL || "http://localhost:8000";

export class BackendError extends Error {
  constructor(
    public status: number,
    public code: string,
    public path: string,
  ) {
    super(code);
    this.name = "BackendError";
  }
}

/**
 * Optional Bearer from Authorization request header (client-forwarded).
 * Limen sessions are primarily cookie/Bearer on the API domain; SSR without
 * a forwarded token runs as unauthenticated.
 */
function getBearerFromRequest(headerStore: Headers): string | null {
  const auth = headerStore.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7);
  }
  return null;
}

export async function backendFetch<T>(
  path: string,
  options: RequestInit & { timeout?: number } = {},
): Promise<T> {
  const reqHeaders = await headers();
  const accessToken = getBearerFromRequest(reqHeaders);
  const timeout = options.timeout ?? 15000;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...options.headers,
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new BackendError(res.status, body.code || "INTERNAL_ERROR", path);
    }

    return res.status === 204 ? (undefined as T) : res.json();
  } catch (err) {
    if (err instanceof BackendError) throw err;
    if ((err as Error).name === "AbortError") {
      throw new BackendError(408, "NETWORK_TIMEOUT", path);
    }
    throw new BackendError(0, "NETWORK_ERROR", path);
  } finally {
    clearTimeout(timer);
  }
}
