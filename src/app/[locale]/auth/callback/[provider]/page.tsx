"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/limen-auth";
import { setToken, userFromLimen } from "@/lib/token-manager";
import { useAuthStore } from "@/store/auth";

/**
 * OAuth usually redirects straight to redirectUri after Limen callback.
 * This page remains as a fallback landing when redirected here with ?error=.
 */
export default function SocialCallbackPage() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  useEffect(() => {
    if (errorParam) return;
    let cancelled = false;
    (async () => {
      const session = await authClient.getSession();
      if (cancelled) return;
      if (session?.user) {
        useAuthStore.getState().setUser(userFromLimen(session.user));
        const token = authClient.bearer.getTokens()?.accessToken;
        if (token) setToken(token);
        const { claimGuestIfNeeded } = await import("@/hooks/use-claim-guest");
        const { useGuestStore } = await import("@/store/guest");
        await Promise.all([
          claimGuestIfNeeded(),
          useGuestStore.getState().mergeIfNeeded(),
        ]);
        window.location.href = "/auth/continue";
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [errorParam]);

  if (errorParam) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Authentication Error</h1>
          <p className="text-muted-foreground">{errorParam}</p>
          <Link href="/auth/sign-in" className="text-primary hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
