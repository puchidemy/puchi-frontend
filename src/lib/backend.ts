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
 * Reads the access_token from the cookie header.
 * The access_token cookie is set by the /api/auth/set-session Route Handler
 * on the puchi.io.vn domain (not by auth-service, which only sets refresh_token).
 */
function getAccessTokenFromCookies(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    const [name, ...rest] = cookie.split("=");
    if (name?.trim() === "access_token") {
      return rest.join("=");
    }
  }
  return null;
}

export async function backendFetch<T>(
  path: string,
  options: RequestInit & { timeout?: number } = {},
): Promise<T> {
  const reqHeaders = await headers();
  const accessToken = getAccessTokenFromCookies(reqHeaders.get("cookie"));
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
