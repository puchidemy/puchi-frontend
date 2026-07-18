"use client";

import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useTranslations } from "next-intl";
import {
  parsePrivacyJson,
  serializePrivacyPrefs,
  type PrivacyPrefs,
} from "@/lib/privacy-settings";
import { useSettingsStore } from "@/store/settings";

export default function SettingsPrivacyPage() {
  const t = useTranslations("Settings.privacy");
  const privacyJson = useSettingsStore((s) => s.values.privacyJson);
  const setField = useSettingsStore((s) => s.setField);
  const prefs = parsePrivacyJson(privacyJson);

  const setPrivacy = <K extends keyof PrivacyPrefs>(
    key: K,
    value: PrivacyPrefs[K],
  ) => {
    setField(
      "privacyJson",
      serializePrivacyPrefs({ ...prefs, [key]: value }),
    );
  };

  return (
    <div className="flex-1 space-y-10">
      <div>
        <div className="text-3xl text-gray-700 dark:text-gray-100 font-bold">
          {t("title")}
        </div>
      </div>

      <div>
        <div className="text-2xl text-gray-500 dark:text-gray-100 font-bold">
          {t("visibility")}
        </div>
        <Separator className="mt-2 mb-4" />
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xl font-semibold text-gray-600 dark:text-gray-100">
              {t("profilePublic")}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {t("profilePublicHint")}
            </p>
          </div>
          <Switch
            checked={prefs.profilePublic}
            onCheckedChange={(checked) => setPrivacy("profilePublic", checked)}
          />
        </div>
        <div className="flex items-center justify-between gap-4 mt-6">
          <div>
            <div className="text-xl font-semibold text-gray-600 dark:text-gray-100">
              {t("findableByUsername")}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {t("findableByUsernameHint")}
            </p>
          </div>
          <Switch
            checked={prefs.findableByUsername}
            onCheckedChange={(checked) =>
              setPrivacy("findableByUsername", checked)
            }
          />
        </div>
        <div className="flex items-center justify-between gap-4 mt-6">
          <div>
            <div className="text-xl font-semibold text-gray-600 dark:text-gray-100">
              {t("shareActivity")}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {t("shareActivityHint")}
            </p>
          </div>
          <Switch
            checked={prefs.shareActivity}
            onCheckedChange={(checked) => setPrivacy("shareActivity", checked)}
          />
        </div>
      </div>
    </div>
  );
}
