"use client";

import SelectLanguage from "@/components/SelectLanguage";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";

export default function SettingsLanguagePage() {
  const t = useTranslations("Settings.language");

  return (
    <div className="flex-1 space-y-10">
      <div>
        <div className="text-3xl text-gray-700 dark:text-gray-100 font-bold">
          {t("title")}
        </div>
      </div>

      <div>
        <div className="text-2xl text-gray-500 dark:text-gray-100 font-bold">
          {t("appLanguage")}
        </div>
        <Separator className="mt-2 mb-4" />
        <SelectLanguage />
      </div>
    </div>
  );
}
