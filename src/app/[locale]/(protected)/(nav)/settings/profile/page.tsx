"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
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

const ageRanges = ["13-17", "18-24", "25-34", "35-44", "45-54", "55+"];

export default function SettingsProfilePage() {
  const t = useTranslations("Settings");
  const [loading, setLoading] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [ageRange, setAgeRange] = useState("");

  // Linked accounts
  const [linkedAccounts, setLinkedAccounts] = useState<
    Array<{ provider: string; email: string; providerUserId?: string }>
  >([]);

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

      // Fetch linked accounts
      try {
        const data = await clientFetch<{ accounts: Array<{ provider: string; email: string; providerUserId?: string }> }>("/v1/profile/linked-accounts");
        setLinkedAccounts(data.accounts || []);
      } catch (error) {
        console.error("Failed to load linked accounts:", error);
      }
    }
    load();
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

  const handleLinkAccount = (provider: string) => {
    window.location.href = `/api/auth/link-account/${provider}`;
  };

  const handleUnlinkAccount = async (providerUserId: string) => {
    try {
      const res = await fetch("/api/auth/unlink-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerUserId }),
      });

      if (res.ok) {
        setLinkedAccounts((prev) =>
          prev.filter((a) => a.providerUserId !== providerUserId),
        );
        toast.success(t("accountUnlinked"));
      } else {
        toast.error(t("unlinkFailed"));
      }
    } catch {
      toast.error(t("networkError"));
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
                      {account.email}
                    </p>
                  )}
                </div>
                {account ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleUnlinkAccount(account.providerUserId || "")
                    }
                  >
                    {t("unlink")}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLinkAccount(provider)}
                  >
                    {t("link")}
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
