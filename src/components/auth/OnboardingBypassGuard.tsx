"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { clientFetch } from "@/lib/client-api";
import { getToken } from "@/lib/token-manager";
import { useAuthStore } from "@/store/auth";

type ProfileOnboarding = {
  onboarding_completed?: boolean;
  onboardingCompleted?: boolean;
};

/**
 * Authenticated users who have not finished WelcomeFlow cannot stay on
 * protected routes (nav + lesson/…). Guests pass through.
 */
export function OnboardingBypassGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    async function check() {
      const token = getToken();
      if (!user && !token) {
        if (!cancelled) setReady(true);
        return;
      }

      try {
        const profile = await clientFetch<ProfileOnboarding>("/v1/profile");
        if (cancelled) return;
        const done = Boolean(
          profile.onboarding_completed ?? profile.onboardingCompleted,
        );
        if (!done) {
          router.replace("/welcome");
          return;
        }
        setReady(true);
      } catch {
        // Profile unavailable — do not block the app (guest trial / transient errors)
        if (!cancelled) setReady(true);
      }
    }

    void check();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, router]);

  if (authLoading || !ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
