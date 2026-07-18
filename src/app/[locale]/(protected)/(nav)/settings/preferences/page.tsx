"use client";

import SelectTheme from "@/components/SelectTheme";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useTranslations } from "next-intl";
import { useSettingsStore } from "@/store/settings";

export default function SettingsPreferencesPage() {
  const t = useTranslations("Settings.preferences");
  const values = useSettingsStore((s) => s.values);
  const setField = useSettingsStore((s) => s.setField);

  return (
    <div className="flex-1 space-y-10">
      <div>
        <div className="text-3xl text-gray-700 dark:text-gray-100 font-bold">
          {t("title")}
        </div>
      </div>

      <div>
        <div className="text-2xl text-gray-500 dark:text-gray-100 font-bold">
          {t("lessonExperience")}
        </div>
        <Separator className="mt-2 mb-4" />
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold text-gray-600 dark:text-gray-100">
            {t("soundEffects")}
          </div>
          <Switch
            checked={values.soundEffects}
            onCheckedChange={(checked) => setField("soundEffects", checked)}
          />
        </div>
        <div className="flex items-center justify-between mt-6">
          <div className="text-xl font-semibold text-gray-600 dark:text-gray-100">
            {t("animations")}
          </div>
          <Switch
            checked={values.animations}
            onCheckedChange={(checked) => setField("animations", checked)}
          />
        </div>
        <div className="flex items-center justify-between mt-6">
          <div className="text-xl font-semibold text-gray-600 dark:text-gray-100">
            {t("motivationalMessages")}
          </div>
          <Switch
            checked={values.motivationalMessages}
            onCheckedChange={(checked) =>
              setField("motivationalMessages", checked)
            }
          />
        </div>
        <div className="flex items-center justify-between mt-6">
          <div className="text-xl font-semibold text-gray-600 dark:text-gray-100">
            {t("listeningExercises")}
          </div>
          <Switch
            checked={values.listeningExercises}
            onCheckedChange={(checked) =>
              setField("listeningExercises", checked)
            }
          />
        </div>
      </div>

      <div>
        <div className="text-2xl text-gray-500 dark:text-gray-100 font-bold">
          {t("appearance")}
        </div>
        <Separator className="mt-2 mb-4" />
        <div className="text-xl text-gray-500 dark:text-gray-100 font-bold mb-4">
          {t("darkMode")}
        </div>
        <SelectTheme />
      </div>
    </div>
  );
}
