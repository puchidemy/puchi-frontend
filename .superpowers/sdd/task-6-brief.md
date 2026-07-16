### Task 6: Frontend — Settings/Profile Page

**Files:**
- Modify: `src/app/[locale]/(protected)/(nav)/settings/profile/page.tsx`

**Context:** Currently this file is just `<div>page</div>`. Replace with a full edit profile form + connected accounts management.

The form should:
- Fetch current profile via `getProfile()` action
- Edit: first_name, last_name, username, bio, age_range
- Save via `PUT /v1/profile`
- Show connected accounts (Google, Facebook, TikTok) with Link/Unlink buttons
- Fetch linked accounts via `GET /v1/profile/linked-accounts`
- Link via redirect to `/api/auth/link-account/{provider}`
- Unlink via `POST /api/auth/unlink-account`

**File to write:** `src/app/[locale]/(protected)/(nav)/settings/profile/page.tsx`

Replace entire file content with:

```typescript
"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
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

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [ageRange, setAgeRange] = useState("");

  // Linked accounts
  const [linkedAccounts, setLinkedAccounts] = useState<Array<{ provider: string; email: string; providerUserId?: string }>>([]);

  useEffect(() => {
    async function load() {
      const result = await getProfile();
      if (result.success) {
        setFirstName(result.data.firstName);
        setLastName(result.data.lastName);
        setUsername(result.data.username);
        setBio(result.data.bio || "");
        setProfileLoaded(true);
      }

      // Fetch linked accounts
      try {
        const res = await fetch("/v1/profile/linked-accounts");
        if (res.ok) {
          const data = await res.json();
          setLinkedAccounts(data.accounts || []);
        }
      } catch {}
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/v1/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          username,
          bio,
          age_range: ageRange,
        }),
      });

      if (res.ok) {
        toast.success(t("profileSaved"));
      } else {
        const err = await res.json();
        toast.error(err.message || t("saveFailed"));
      }
    } catch {
      toast.error(t("networkError"));
    } finally {
      setLoading(false);
    }
  };

  const handleLinkAccount = async (provider: string) => {
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
        setLinkedAccounts((prev) => prev.filter((a) => a.providerUserId !== providerUserId));
        toast.success(t("accountUnlinked"));
      } else {
        toast.error(t("unlinkFailed"));
      }
    } catch {
      toast.error(t("networkError"));
    }
  };

  if (!profileLoaded) {
    return <div className="py-24 text-center"><div className="w-8 h-8 border-4 border-sky-300 border-t-sky-500 rounded-full animate-spin mx-auto" /></div>;
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
                    <SelectItem key={range} value={range}>{range}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" variant="primary" disabled={loading}>
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
            const account = linkedAccounts.find((a: any) => a.provider === provider);
            return (
              <div key={provider} className="flex items-center justify-between py-2">
                <div>
                  <span className="font-medium capitalize">{provider}</span>
                  {account && (
                    <p className="text-sm text-muted-foreground">{account.email}</p>
                  )}
                </div>
                {account ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnlinkAccount(account.providerUserId || "")}
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
```

- [ ] **Commit**

```bash
git add src/app/[locale]/\(protected\)/\(nav\)/settings/profile/page.tsx
git commit -m "feat(settings): add profile edit form and connected accounts management"
```
