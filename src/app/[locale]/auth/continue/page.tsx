"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { LimenError } from "limen-auth";
import { authClient } from "@/lib/limen-auth";
import { clientFetch } from "@/lib/client-api";
import { setToken, userFromLimen } from "@/lib/token-manager";
import { useAuthStore } from "@/store/auth";
import {
  clearPendingOAuthProvider,
  getPendingOAuthProvider,
  setPendingOAuthProvider,
} from "@/lib/pending-oauth";
import {
  absoluteAppPath,
  normalizeLinkedAccounts,
} from "@/lib/oauth-accounts";

type ProfileOnboarding = {
  onboarding_completed?: boolean;
  onboardingCompleted?: boolean;
};

/** Route to /learn if onboarded, else /welcome. Fail-open to welcome. */
async function routeAfterAuth(
  router: ReturnType<typeof useRouter>,
): Promise<void> {
  try {
    const profile = await clientFetch<ProfileOnboarding>("/v1/profile");
    const done = Boolean(
      profile.onboarding_completed ?? profile.onboardingCompleted,
    );
    router.replace(done ? "/learn" : "/welcome");
  } catch {
    router.replace("/welcome");
  }
}

/**
 * Post-auth gate: sync session, complete pending social.link if needed,
 * then route by onboarding_completed (/welcome vs /learn).
 */
function AuthContinueContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const session = await authClient.getSession();
        if (cancelled) return;

        if (!session?.user) {
          router.replace("/auth/sign-in");
          return;
        }

        useAuthStore.getState().setUser(userFromLimen(session.user));
        const token =
          (session as { token?: string }).token ??
          authClient.bearer.getTokens()?.accessToken;
        if (token) setToken(token);

        const { claimGuestIfNeeded } = await import("@/hooks/use-claim-guest");
        const { useGuestStore } = await import("@/store/guest");
        await Promise.all([
          claimGuestIfNeeded(),
          useGuestStore.getState().mergeIfNeeded(),
        ]);
        if (cancelled) return;

        if (searchParams.get("linked")) {
          clearPendingOAuthProvider();
          await routeAfterAuth(router);
          return;
        }

        const pending = getPendingOAuthProvider();
        if (pending) {
          const accounts = normalizeLinkedAccounts(
            await authClient.social.listAccounts().catch(() => []),
          );
          if (accounts.some((a) => a.provider === pending)) {
            clearPendingOAuthProvider();
            await routeAfterAuth(router);
            return;
          }

          clearPendingOAuthProvider();
          try {
            await authClient.social.link({
              provider: pending,
              redirectUri: absoluteAppPath(
                `/auth/continue?linked=${encodeURIComponent(pending)}`,
              ),
              errorRedirectUri: absoluteAppPath(
                `/auth/link-conflict?provider=${encodeURIComponent(pending)}`,
              ),
            });
            return;
          } catch (err) {
            setPendingOAuthProvider(pending);
            if (cancelled) return;
            const message =
              err instanceof LimenError && err.status === 409
                ? "That social account is already linked to another user."
                : err instanceof Error
                  ? err.message
                  : "Failed to link social account";
            setError(message);
            router.replace(
              `/auth/link-conflict?provider=${encodeURIComponent(pending)}&error=${encodeURIComponent(message)}`,
            );
            return;
          }
        }

        await routeAfterAuth(router);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="text-center space-y-4">
        {error ? (
          <p className="text-destructive text-sm">{error}</p>
        ) : (
          <>
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Continuing...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthContinuePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <AuthContinueContent />
    </Suspense>
  );
}
