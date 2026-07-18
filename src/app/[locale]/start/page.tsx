"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { clientFetch } from "@/lib/client-api";
import { getToken } from "@/lib/token-manager";
import { useAuthStore } from "@/store/auth";
import { useAuthHydrated } from "@/hooks/use-auth-hydrated";
import { ensureGuestSession } from "@/lib/learn-api";

type ProfileOnboarding = {
  onboarding_completed?: boolean;
  onboardingCompleted?: boolean;
};

/**
 * Landing CTA hub: guest session → /learn vs sign-up vs sign-in.
 * Logged-in users skip to /learn or /welcome based on onboarding.
 */
export default function StartPage() {
  const t = useTranslations("Start");
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const authLoading = useAuthStore((s) => s.loading);
  const hydrated = useAuthHydrated();
  const [routing, setRouting] = useState(true);
  const [guestLoading, setGuestLoading] = useState(false);
  const [guestError, setGuestError] = useState("");

  useEffect(() => {
    if (!hydrated || authLoading) return;

    const token = getToken() || accessToken;
    if (!user && !token) {
      setRouting(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const profile = await clientFetch<ProfileOnboarding>("/v1/profile");
        if (cancelled) return;
        const done = Boolean(
          profile.onboarding_completed ?? profile.onboardingCompleted,
        );
        router.replace(done ? "/learn" : "/welcome");
      } catch {
        if (!cancelled) router.replace("/welcome");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, authLoading, user, accessToken, router]);

  const startAsGuest = async () => {
    setGuestError("");
    setGuestLoading(true);
    try {
      await ensureGuestSession();
      router.push("/learn");
    } catch (err) {
      setGuestError(err instanceof Error ? err.message : t("guestError"));
    } finally {
      setGuestLoading(false);
    }
  };

  if (!hydrated || authLoading || routing) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center gap-6 px-4 py-16">
      <div className="space-y-2 text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
      </div>

      {guestError && (
        <p className="text-center text-sm text-destructive">{guestError}</p>
      )}

      <div className="flex flex-col gap-3">
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          disabled={guestLoading}
          onClick={() => void startAsGuest()}
        >
          {guestLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            t("tryAsGuest")
          )}
        </Button>
        <Button variant="outline" size="lg" className="w-full" asChild>
          <Link href="/auth/sign-up">{t("createAccount")}</Link>
        </Button>
        <Button variant="ghost" size="lg" className="w-full" asChild>
          <Link href="/auth/sign-in">{t("haveAccount")}</Link>
        </Button>
      </div>

      <p className="text-muted-foreground text-center text-xs">{t("guestHint")}</p>
    </div>
  );
}
