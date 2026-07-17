"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { useAuthHydrated } from "@/hooks/use-auth-hydrated";
import { clientFetch } from "@/lib/client-api";
import { getToken } from "@/lib/token-manager";
import { useAuthStore } from "@/store/auth";

type ProfileUsername = {
  username?: string;
};

/** Own profile entry: resolve username client-side (Limen Bearer/cookie). */
export default function MyProfilePage() {
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const authLoading = useAuthStore((s) => s.loading);

  useEffect(() => {
    if (!hydrated || authLoading) return;

    if (!user && !accessToken && !getToken()) {
      router.replace("/auth/sign-in");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const profile = await clientFetch<ProfileUsername>("/v1/profile");
        if (cancelled) return;
        const username = profile.username?.trim();
        if (username) {
          router.replace(`/in/${encodeURIComponent(username)}`);
        } else {
          router.replace("/settings/profile");
        }
      } catch {
        if (!cancelled) router.replace("/auth/sign-in");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, authLoading, user, accessToken, router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
