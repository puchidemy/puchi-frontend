"server-only";

import { headers } from "next/headers";
import { getSession } from "@/lib/auth";

const BACKEND_URL = process.env.API_INTERNAL_URL || "http://localhost:8000";
const AUTH_URL = process.env.AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

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

export async function backendFetch<T>(
  path: string,
  options: RequestInit & { timeout?: number } = {},
): Promise<T> {
  const req = new Request(AUTH_URL, { headers: await headers() });
  const session = await getSession(req);
  const timeout = options.timeout ?? 15000;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
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
