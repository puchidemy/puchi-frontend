"client-only";

import { fetchWithAuth } from "./fetch-with-auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * Client-side fetch wrapper.
 *
 * For authenticated API calls — automatically attaches `Authorization: Bearer`
 * from in-memory token and handles 401 → auto-refresh.
 *
 * For public endpoints, the Bearer header is harmless (backend ignores it).
 */
export async function clientFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const base = path.startsWith("/api/") ? "" : API_BASE;
  return fetchWithAuth<T>(`${base}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
}
