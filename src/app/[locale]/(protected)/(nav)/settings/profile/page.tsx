"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { clientFetch } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProfile } from "@/actions/profile/get-profile";
import { Separator } from "@/components/ui/separator";
import { LimenError } from "limen-auth";
import { authClient } from "@/lib/limen-auth";
import { normalizeLinkedAccounts } from "@/lib/oauth-accounts";

const ageRanges = ["13-17", "18-24", "25-34", "35-44", "45-54", "55+"];

type LinkedAccount = {
  provider: string;
  providerAccountId?: string;
};

function SettingsProfileContent() {
  const t = useTranslations("Settings");
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [linkingProvider, setLinkingProvider] = useState<string | null>(null);
  const [unlinkingProvider, setUnlinkingProvider] = useState<string | null>(
    null,
  );
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [ageRange, setAgeRange] = useState("");

  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);

  const refreshLinkedAccounts = useCallback(async () => {
    try {
      const raw = await authClient.social.listAccounts();
      setLinkedAccounts(normalizeLinkedAccounts(raw));
    } catch (error) {
      console.error("Failed to load linked accounts:", error);
    }
  }, []);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      toast.error(decodeURIComponent(error));
    }
  }, [searchParams]);

  useEffect(() => {
    async function load() {
      try {
        const result = await getProfile();
        if (result.success) {
          setFirstName(result.data.firstName);
          setLastName(result.data.lastName);
          setUsername(result.data.username);
          setBio(result.data.bio || "");
          setAgeRange(result.data.ageRange || "");
          setProfileLoaded(true);
        } else {
          setLoadError(result.error || t("saveFailed"));
          setProfileLoaded(true);
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        setLoadError(t("networkError"));
        setProfileLoaded(true);
      }

      await refreshLinkedAccounts();
    }
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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

      toast.success(t("profileSaved"));
    } catch (err) {
      console.error("Failed to save profile:", err);
      toast.error(t("saveFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleLinkAccount = async (provider: string) => {
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
        toast.error(t("linkConflict"));
      } else {
        toast.error(
          err instanceof Error ? err.message : t("linkFailed"),
        );
      }
      setLinkingProvider(null);
    }
  };

  const handleUnlinkAccount = async (provider: string) => {
    setUnlinkingProvider(provider);
    try {
      await authClient.social.unlink({ provider });
      toast.success(t("accountUnlinked"));
      await refreshLinkedAccounts();
    } catch (err) {
      console.error("Failed to unlink account:", err);
      toast.error(
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
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
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
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t("lastName")}</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">{t("username")}</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">{t("bio")}</Label>
              <Input
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={t("bioPlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ageRange">{t("ageRange")}</Label>
              <Select value={ageRange} onValueChange={setAgeRange}>
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

            <Button type="submit" variant="default" disabled={loading}>
              {loading ? t("saving") : t("save")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>{t("connectedAccounts")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {["google", "facebook", "tiktok"].map((provider) => {
            const account = linkedAccounts.find(
              (a) => a.provider === provider,
            );
            return (
              <div
                key={provider}
                className="flex items-center justify-between py-2"
              >
                <div>
                  <span className="font-medium capitalize">{provider}</span>
                  {account && (
                    <p className="text-sm text-muted-foreground">
                      {account.providerAccountId
                        ? t("linkedAs", { id: account.providerAccountId })
                        : t("linked")}
                    </p>
                  )}
                </div>
                {account ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={unlinkingProvider === provider}
                    onClick={() => handleUnlinkAccount(provider)}
                  >
                    {unlinkingProvider === provider
                      ? t("unlinking")
                      : t("unlink")}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={linkingProvider === provider}
                    onClick={() => handleLinkAccount(provider)}
                  >
                    {linkingProvider === provider ? t("linking") : t("link")}
                  </Button>
                )}
              </div>
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
