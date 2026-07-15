"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FullProfile, Achievement } from "@/types/profile";
import { Progress } from "@/components/ui/progress";
import BadgeGrid from "../shared/BadgeGrid";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { CheckCircle, Clock } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface AchievementsTabProps {
  profile: FullProfile;
}

function getIcon(name: string) {
  const Icon = (LucideIcons as Record<string, React.ElementType>)[name];
  return Icon || LucideIcons.Circle;
}

export default function AchievementsTab({ profile }: AchievementsTabProps) {
  const t = useTranslations("Profile");
  const { achievements } = profile;
  const [selected, setSelected] = useState<Achievement | null>(null);

  const unlocked = achievements.filter((a) => a.unlocked);
  const inProgress = achievements.filter((a) => !a.unlocked && a.progress > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold">{t("achievements.title")}</h3>
        <span className="text-sm text-muted-foreground font-medium">
          {unlocked.length}/{achievements.length} {t("achievements.unlocked")}
        </span>
      </div>

      {inProgress.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {t("achievements.inProgress")}
          </h4>
          {inProgress.map((achievement) => {
            const Icon = getIcon(achievement.icon);
            return (
              <div
                key={achievement.id}
                className="rounded-2xl bg-card border border-border p-4 space-y-2 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelected(achievement)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${achievement.color} 15%, transparent)`,
                      color: achievement.color,
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{achievement.title}</p>
                    <p className="text-xs text-muted-foreground">{achievement.progressLabel}</p>
                  </div>
                  <Clock size={16} className="text-muted-foreground shrink-0" />
                </div>
                <Progress value={achievement.progress} className="h-1.5" />
              </div>
            );
          })}
        </div>
      )}

      <div>
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          {t("achievements.all")}
        </h4>
        <BadgeGrid achievements={achievements} onBadgeClick={setSelected} />
      </div>

      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          {selected && (() => {
            const Icon = getIcon(selected.icon);
            return (
              <SheetHeader className="text-left">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{
                      backgroundColor: selected.unlocked
                        ? `color-mix(in srgb, ${selected.color} 15%, transparent)`
                        : "var(--muted)",
                      color: selected.unlocked ? selected.color : "var(--muted-foreground)",
                      filter: selected.unlocked ? "none" : "grayscale(100%)",
                    }}
                  >
                    <Icon size={32} />
                  </div>
                  <div>
                    <SheetTitle className="text-xl">{selected.title}</SheetTitle>
                    <SheetDescription className="text-sm">{selected.description}</SheetDescription>
                  </div>
                </div>
                <div className="space-y-2">
                  {selected.unlocked ? (
                    <div className="flex items-center gap-2 text-sm text-[var(--primary)]">
                      <CheckCircle size={16} />
                      <span>
                        {t("achievements.unlockedAt")}: {selected.unlockedAt ? new Date(selected.unlockedAt).toLocaleDateString() : "\u2014"}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t("achievements.progress")}</span>
                        <span className="font-din font-bold">{selected.progressLabel}</span>
                      </div>
                      <Progress value={selected.progress} className="h-2" />
                    </div>
                  )}
                </div>
              </SheetHeader>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
}
