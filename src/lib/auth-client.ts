"client-only";

import { getToken } from "./token-manager";
import { fetchWithAuthResult } from "./fetch-with-auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface ApiResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  useAuth = false,
): Promise<ApiResult<T>> {
  // Use fetchWithAuthResult for auth-required endpoints (logout)
  // and for consistency across the client
  if (useAuth || getToken()) {
    return fetchWithAuthResult<T>(`${API_URL}${path}`, options);
  }

  // Fallback for public endpoints (register, forgot-password, reset-password)
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: "include",
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return { ok: false, error: data?.error || data?.message || "Request failed" };
    }
    return { ok: true, data };
  } catch {
    return { ok: false, error: "Network error. Please check your connection." };
  }
}

export interface LoginResult {
  access_token: string;
  expires_in: number;
  user: { id: string; email: string; display_name: string; email_verified: boolean };
}

export async function login(email: string, password: string) {
  return request<LoginResult>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export interface RegisterResult {
  user_id: string;
  email: string;
  message: string;
}

export async function register(email: string, password: string, displayName?: string) {
  return request<RegisterResult>("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, display_name: displayName }),
  });
}

export async function forgotPassword(email: string) {
  return request("/auth/password/reset/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(userId: string, code: string, password: string) {
  return request("/auth/password/reset", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, code, password }),
  });
}

export async function logout(accessToken?: string) {
  const token = accessToken || getToken();
  return request("/auth/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  }, !!token);
}

export { API_URL };
