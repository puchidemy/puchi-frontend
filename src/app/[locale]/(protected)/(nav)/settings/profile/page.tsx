"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { clientFetch } from "@/lib/client-api";
import { getMyProfile } from "@/lib/profile-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LimenError } from "limen-auth";
import { authClient } from "@/lib/limen-auth";
import {
  enrichLinkedAccounts,
  normalizeLinkedAccounts,
  type LinkedAccount,
} from "@/lib/oauth-accounts";
import { ConnectedAccountRow } from "@/components/settings/ConnectedAccountRow";
import {
  StampButton,
  type StampButtonStatus,
} from "@/components/ui/stamp-button";
import { useAuthStore } from "@/store/auth";
import { getToken } from "@/lib/token-manager";
import { Link } from "@/i18n/routing";

const ageRanges = ["13-17", "18-24", "25-34", "35-44", "45-54", "55+"];
const SAVED_FLASH_MS = 2000;

function GuestProfileSettingsCta() {
  const t = useTranslations("Settings.guestProfile");

  return (
    <div className="flex-1 space-y-6">
      <div className="text-3xl text-gray-700 dark:text-gray-100 font-bold">
        {t("title")}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{t("headline")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-muted-foreground">{t("description")}</p>
          <Link href="/auth/sign-up">
            <Button variant="primary" className="w-full text-gray-200">
              {t("signUp")}
            </Button>
          </Link>
          <Link href="/auth/sign-in">
            <Button variant="secondary" className="w-full text-gray-200">
              {t("signIn")}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function SettingsProfileContent() {
  const t = useTranslations("Settings");
  const searchParams = useSearchParams();
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const authUser = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const authLoading = useAuthStore((s) => s.loading);
  const isGuest =
    !authLoading && !authUser && !accessToken && !getToken();

  const [saveStatus, setSaveStatus] = useState<StampButtonStatus>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [accountsError, setAccountsError] = useState<string | null>(null);
  const [oauthBanner, setOauthBanner] = useState<string | null>(null);

  const [linkingProvider, setLinkingProvider] = useState<string | null>(null);
  const [unlinkingProvider, setUnlinkingProvider] = useState<string | null>(
    null,
  );
  const [justUnlinked, setJustUnlinked] = useState<string | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [email, setEmail] = useState("");

  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);

  const clearSavedTimer = useCallback(() => {
    if (savedTimerRef.current) {
      clearTimeout(savedTimerRef.current);
      savedTimerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearSavedTimer(), [clearSavedTimer]);

  const refreshLinkedAccounts = useCallback(async () => {
    try {
      const raw = await authClient.social.listAccounts();
      const base = normalizeLinkedAccounts(raw);
      setLinkedAccounts(base);
      const enriched = await enrichLinkedAccounts(base, async (provider) => {
        const tokens = await authClient.social.tokens({ provider });
        return { accessToken: tokens.accessToken };
      });
      setLinkedAccounts(enriched);
    } catch (error) {
      console.error("Failed to load linked accounts:", error);
    }
  }, []);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      setOauthBanner(decodeURIComponent(error));
    }
  }, [searchParams]);

  useEffect(() => {
    if (authLoading || isGuest) return;

    async function load() {
      try {
        const data = await getMyProfile();
        setFirstName(data.firstName ?? "");
        setLastName(data.lastName ?? "");
        setUsername(data.username ?? "");
        setBio(data.bio ?? "");
        setAgeRange(data.ageRange ?? "");
        setEmail(data.email ?? "");
        setProfileLoaded(true);
      } catch (error) {
        console.error("Failed to load profile:", error);
        setLoadError(t("networkError"));
        setProfileLoaded(true);
      }

      await refreshLinkedAccounts();
    }
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isGuest]);

  if (authLoading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-4 border-sky-300 border-t-sky-500 rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (isGuest) {
    return <GuestProfileSettingsCta />;
  }

  const markDirty = () => {
    setFormError(null);
    if (saveStatus === "success") setSaveStatus("idle");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaveStatus("loading");
    clearSavedTimer();

    try {
      await clientFetch("/v1/profile", {
        method: "PUT",
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          username,
          bio,
          age_range: ageRange,
        }),
      });

      setSaveStatus("success");
      savedTimerRef.current = setTimeout(() => {
        setSaveStatus("idle");
        savedTimerRef.current = null;
      }, SAVED_FLASH_MS);
    } catch (err) {
      console.error("Failed to save profile:", err);
      setSaveStatus("idle");
      setFormError(t("saveFailed"));
    }
  };

  const handleLinkAccount = async (provider: string) => {
    setAccountsError(null);
    setLinkingProvider(provider);
    try {
      const returnTo = `${window.location.origin}${window.location.pathname}`;
      const errorReturn = new URL(returnTo);
      errorReturn.searchParams.set("error", t("linkConflict"));
      await authClient.social.link({
        provider,
        redirectUri: returnTo,
        errorRedirectUri: errorReturn.toString(),
      });
    } catch (err) {
      console.error("Failed to link account:", err);
      if (err instanceof LimenError && err.status === 409) {
        setAccountsError(t("linkConflict"));
      } else {
        setAccountsError(
          err instanceof Error ? err.message : t("linkFailed"),
        );
      }
      setLinkingProvider(null);
    }
  };

  const handleUnlinkAccount = async (provider: string) => {
    setAccountsError(null);
    setUnlinkingProvider(provider);
    try {
      await authClient.social.unlink({ provider });
      await refreshLinkedAccounts();
      setJustUnlinked(provider);
      setTimeout(() => setJustUnlinked(null), SAVED_FLASH_MS);
    } catch (err) {
      console.error("Failed to unlink account:", err);
      setAccountsError(
        err instanceof Error ? err.message : t("unlinkFailed"),
      );
    } finally {
      setUnlinkingProvider(null);
    }
  };

  if (!profileLoaded) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-4 border-sky-300 border-t-sky-500 rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="py-24 text-center">
        <p className="text-destructive">{loadError}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {oauthBanner && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {oauthBanner}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("editProfile")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t("firstName")}</Label>
                <Input
                  id="firstName"
                  value={firstName ?? ""}
                  onChange={(e) => {
                    markDirty();
                    setFirstName(e.target.value);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t("lastName")}</Label>
                <Input
                  id="lastName"
                  value={lastName ?? ""}
                  onChange={(e) => {
                    markDirty();
                    setLastName(e.target.value);
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">{t("username")}</Label>
              <Input
                id="username"
                value={username ?? ""}
                onChange={(e) => {
                  markDirty();
                  setUsername(e.target.value);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">{t("bio")}</Label>
              <Input
                id="bio"
                value={bio ?? ""}
                onChange={(e) => {
                  markDirty();
                  setBio(e.target.value);
                }}
                placeholder={t("bioPlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ageRange">{t("ageRange")}</Label>
              <Select
                value={ageRange || undefined}
                onValueChange={(v) => {
                  markDirty();
                  setAgeRange(v);
                }}
              >
                <SelectTrigger id="ageRange">
                  <SelectValue placeholder={t("selectAgeRange")} />
                </SelectTrigger>
                <SelectContent>
                  {ageRanges.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formError && (
              <p role="alert" className="text-sm text-destructive">
                {formError}
              </p>
            )}

            <StampButton
              type="submit"
              variant="secondary"
              status={saveStatus}
              idleLabel={t("save")}
              loadingLabel={t("saving")}
              successLabel={t("saved")}
            />
          </form>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>{t("connectedAccounts")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {accountsError && (
            <p role="alert" className="text-sm text-destructive">
              {accountsError}
            </p>
          )}
          {["google", "facebook", "tiktok"].map((provider) => {
            const account = linkedAccounts.find(
              (a) => a.provider === provider,
            );
            const fallbackName =
              [firstName, lastName].filter(Boolean).join(" ") ||
              email ||
              authUser?.email ||
              authUser?.display_name ||
              undefined;
            const busy =
              linkingProvider === provider
                ? ("link" as const)
                : unlinkingProvider === provider
                  ? ("unlink" as const)
                  : null;

            return (
              <ConnectedAccountRow
                key={provider}
                provider={provider}
                account={account}
                fallbackName={fallbackName}
                linkedLabel={t("linked")}
                notConnectedLabel={t("notConnected")}
                unlinkLabel={t("unlink")}
                unlinkingLabel={t("unlinking")}
                linkLabel={t("link")}
                linkingLabel={t("linking")}
                unlinkedFlash={
                  justUnlinked === provider && !account
                    ? t("accountUnlinked")
                    : undefined
                }
                busy={busy}
                onLink={() => handleLinkAccount(provider)}
                onUnlink={() => handleUnlinkAccount(provider)}
              />
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

export default function SettingsProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-4 border-sky-300 border-t-sky-500 rounded-full animate-spin mx-auto" />
        </div>
      }
    >
      <SettingsProfileContent />
    </Suspense>
  );
}
