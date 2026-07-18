"use client";

import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";

export default function SettingsNotificationsPage() {
  const t = useTranslations("Settings.notifications");

  return (
    <div className="flex-1 space-y-10">
      <div>
        <div className="text-3xl text-gray-700 dark:text-gray-100 font-bold">
          {t("title")}
        </div>
      </div>

      <div>
        <div className="text-2xl text-gray-500 dark:text-gray-100 font-bold">
          {t("section")}
        </div>
        <Separator className="mt-2 mb-4" />
        <p className="text-lg text-muted-foreground">{t("comingSoon")}</p>
      </div>
    </div>
  );
}
