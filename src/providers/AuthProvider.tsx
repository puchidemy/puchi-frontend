"use client";

import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { setToken, clearToken, userFromLimen } from "@/lib/token-manager";
import { useAuthStore } from "@/store/auth";
import { authClient } from "@/lib/limen-auth";

interface AuthContextType {
  user: ReturnType<typeof useAuthStore.getState>["user"];
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  verifyEmail: (token: string) => Promise<{ ok: boolean; error?: string }>;
  resendVerification: () => Promise<{ ok: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  baseUrl: _baseUrl,
}: {
  children: ReactNode;
  baseUrl: string;
}) {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const clear = useAuthStore((s) => s.clear);

  const claimAttemptedForUser = useRef<string | null>(null);

  const hydrateSettings = useCallback(async (userId: string) => {
    try {
      const { useSettingsStore } = await import("@/store/settings");
      await useSettingsStore.getState().fetchFromServer(userId);
    } catch {
      // Settings hydrate is best-effort; guest local + defaults remain.
    }
  }, []);

  const runPostAuthClaims = useCallback(async (userId: string) => {
    if (claimAttemptedForUser.current === userId) return;
    claimAttemptedForUser.current = userId;
    const { claimGuestIfNeeded } = await import("@/hooks/use-claim-guest");
    await claimGuestIfNeeded();
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const session = await authClient.getSession();
      if (session?.user) {
        const sessionUser = userFromLimen(session.user);
        setUser(sessionUser);
        const sessionToken =
          (session as { token?: string }).token ??
          authClient.bearer.getTokens()?.accessToken;
        if (sessionToken) setToken(sessionToken);
        await Promise.all([
          runPostAuthClaims(sessionUser.id),
          hydrateSettings(sessionUser.id),
        ]);
        setLoading(false);
        return;
      }
      claimAttemptedForUser.current = null;
      clearToken();
      clear();
      const { useSettingsStore } = await import("@/store/settings");
      useSettingsStore.getState().loadGuest();
    } catch {
      claimAttemptedForUser.current = null;
      clearToken();
      clear();
      const { useSettingsStore } = await import("@/store/settings");
      useSettingsStore.getState().loadGuest();
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading, clear, runPostAuthClaims, hydrateSettings]);

  const sessionChecked = useRef(false);

  useEffect(() => {
    if (sessionChecked.current) return;
    sessionChecked.current = true;
    refreshSession();
  }, [refreshSession]);

  const login = async (email: string, password: string) => {
    const data = await authClient.signIn.credential({
      credential: email,
      password,
      rememberMe: true,
    });
    const sessionUser = data?.user ?? (await authClient.getSession())?.user;
    if (!sessionUser) throw new Error("Login failed");
    setUser(userFromLimen(sessionUser));
    const sessionToken =
      (data as { token?: string } | null | undefined)?.token ??
      authClient.bearer.getTokens()?.accessToken;
    if (sessionToken) setToken(sessionToken);
    const sessionUserId = userFromLimen(sessionUser).id;
    await Promise.all([
      runPostAuthClaims(sessionUserId),
      hydrateSettings(sessionUserId),
    ]);
  };

  const register = async (
    email: string,
    password: string,
    displayName?: string,
  ) => {
    await authClient.signUp.credential({
      email,
      password,
      username: displayName || undefined,
      firstname: displayName || undefined,
    });
  };

  const verifyEmail = async (token: string) => {
    try {
      await authClient.verifyEmail({ token });
      if (user) setUser({ ...user, email_verified: true });
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Verification failed",
      };
    }
  };

  const resendVerification = async () => {
    try {
      await authClient.requestEmailVerification();
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Failed to resend",
      };
    }
  };

  const logout = async () => {
    try {
      await authClient.signout();
    } catch {
      // local cleanup anyway
    }
    claimAttemptedForUser.current = null;
    clearToken();
    clear();
    const { useSettingsStore } = await import("@/store/settings");
    useSettingsStore.getState().loadGuest();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshSession,
        verifyEmail,
        resendVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
