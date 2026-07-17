"client-only";

import { authClient, API_URL } from "./limen-auth";
import { fetchWithAuthResult } from "./fetch-with-auth";
import { getToken } from "./token-manager";

interface ApiResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export async function login(email: string, password: string): Promise<ApiResult<unknown>> {
  try {
    const data = await authClient.signIn.credential({
      credential: email,
      password,
      rememberMe: true,
    });
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Login failed",
    };
  }
}

export async function register(
  email: string,
  password: string,
): Promise<ApiResult<unknown>> {
  try {
    // Name/username collected later on /welcome BasicInfoStep
    const data = await authClient.signUp.credential({
      email,
      password,
    });
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Registration failed",
    };
  }
}

export async function forgotPassword(email: string): Promise<ApiResult<unknown>> {
  try {
    const data = await authClient.password.requestReset({ email });
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Request failed",
    };
  }
}

export async function resetPassword(
  token: string,
  _unused: string,
  password: string,
): Promise<ApiResult<unknown>> {
  try {
    const data = await authClient.password.reset({
      token,
      newPassword: password,
    });
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Reset failed",
    };
  }
}

export async function verifyEmail(token: string): Promise<ApiResult<unknown>> {
  try {
    const data = await authClient.verifyEmail({ token });
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Verification failed",
    };
  }
}

export async function resendVerification(): Promise<ApiResult<unknown>> {
  try {
    const data = await authClient.requestEmailVerification();
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Resend failed",
    };
  }
}

export async function logout(): Promise<ApiResult<unknown>> {
  try {
    if (getToken()) {
      await fetchWithAuthResult(`${API_URL}/auth/signout`, { method: "POST" });
    }
    await authClient.signout();
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Logout failed",
    };
  }
}

export { API_URL };
