"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
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
import { mergeSettings, type UserSettings } from "@/lib/settings-api";
import {
  guestSettingsChangedKeys,
  readGuestSettings,
  useSettingsStore,
} from "@/store/settings";
import { SyncGuestDialog } from "@/components/settings/SyncGuestDialog";
import { useRouter } from "@/i18n/routing";
import type { Locale } from "@/i18n/config";
import type { StampButtonStatus } from "@/components/ui/stamp-button";

type ProfileOnboarding = {
  onboarding_completed?: boolean;
  onboardingCompleted?: boolean;
};

type SyncChoice = "sync" | "skip";

function settingLabelKey(
  key: keyof UserSettings,
): string {
  switch (key) {
    case "soundEffects":
      return "preferences.soundEffects";
    case "animations":
      return "preferences.animations";
    case "motivationalMessages":
      return "preferences.motivationalMessages";
    case "listeningExercises":
      return "preferences.listeningExercises";
    case "theme":
      return "preferences.appearance";
    case "locale":
      return "language.appLanguage";
    case "privacyJson":
      return "privacy.title";
    default:
      return key;
  }
}

/** Route to /learn if onboarded, else /welcome. Fail-open to welcome. */
async function routeAfterAuth(
  router: ReturnType<typeof useRouter>,
  locale?: string,
): Promise<void> {
  const opts = locale ? { locale: locale as Locale } : undefined;
  try {
    const profile = await clientFetch<ProfileOnboarding>("/v1/profile");
    const done = Boolean(
      profile.onboarding_completed ?? profile.onboardingCompleted,
    );
    router.replace(done ? "/learn" : "/welcome", opts);
  } catch {
    router.replace("/welcome", opts);
  }
}

/**
 * Post-auth gate: sync session, claim guest learn, optional settings sync dialog,
 * complete pending social.link if needed, then route by onboarding.
 */
function AuthContinueContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTheme } = useTheme();
  const tSettings = useTranslations("Settings");
  const [error, setError] = useState("");
  const [syncOpen, setSyncOpen] = useState(false);
  const [lessonsMerged, setLessonsMerged] = useState(0);
  const [changedLabels, setChangedLabels] = useState<string[]>([]);
  const [syncStatus, setSyncStatus] = useState<StampButtonStatus>("idle");
  const syncResolverRef = useRef<((choice: SyncChoice) => void) | null>(null);

  useEffect(() => {
    let cancelled = false;

    function waitForSyncChoice(
      lessons: number,
      guest: UserSettings | null,
      labels: string[],
    ): Promise<SyncChoice> {
      return new Promise((resolve) => {
        syncResolverRef.current = resolve;
        setLessonsMerged(lessons);
        setChangedLabels(labels);
        setSyncStatus("idle");
        setSyncOpen(true);
      });
    }

    async function finishRouting() {
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
    }

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
        if (token) {
          setToken(token);
        } else {
          // Ensure bearer plugin is populated before hitting /v1/*
          const again = await authClient.getSession();
          const t2 =
            (again as { token?: string } | null)?.token ??
            authClient.bearer.getTokens()?.accessToken;
          if (t2) setToken(t2);
        }

        // Token must be in memory before /v1 calls (cookie alone may race).
        // Always claim learn progress — never skip for settings dialog.
        const { claimGuestIfNeeded } = await import("@/hooks/use-claim-guest");
        const claim = await claimGuestIfNeeded();
        if (cancelled) return;

        const guest = readGuestSettings();
        const changedKeys = guest ? guestSettingsChangedKeys(guest) : [];
        const settingsChanged = changedKeys.length > 0;
        const needSync = claim.lessonsMerged > 0 || settingsChanged;

        if (needSync) {
          const labels = changedKeys.map((key) =>
            tSettings(settingLabelKey(key) as never),
          );
          const choice = await waitForSyncChoice(
            claim.lessonsMerged,
            guest,
            labels,
          );
          if (cancelled) return;

          if (choice === "sync" && guest) {
            setSyncStatus("loading");
            try {
              const merged = await mergeSettings(guest);
              useSettingsStore
                .getState()
                .hydrateFromServer(merged.settings, session.user.id);
              setTheme(merged.settings.theme);
              useSettingsStore.getState().clearGuest();
              setSyncStatus("success");
              await new Promise((r) => setTimeout(r, 450));
              setSyncOpen(false);
              await routeAfterAuth(router, merged.settings.locale);
              return;
            } catch (err) {
              setSyncStatus("idle");
              setError(
                err instanceof Error ? err.message : "Failed to sync settings",
              );
              useSettingsStore.getState().clearGuest();
              setSyncOpen(false);
            }
          } else {
            useSettingsStore.getState().clearGuest();
            setSyncOpen(false);
          }
        } else if (guest) {
          // Defaults only / no lessons — drop guest key without prompting.
          useSettingsStore.getState().clearGuest();
        }

        if (cancelled) return;
        await finishRouting();
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams, setTheme, tSettings]);

  const handleSync = () => {
    syncResolverRef.current?.("sync");
    syncResolverRef.current = null;
  };

  const handleSkip = () => {
    syncResolverRef.current?.("skip");
    syncResolverRef.current = null;
  };

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

      <SyncGuestDialog
        open={syncOpen}
        lessonsMerged={lessonsMerged}
        changedSettingLabels={changedLabels}
        syncStatus={syncStatus}
        onSync={handleSync}
        onSkip={handleSkip}
      />
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
