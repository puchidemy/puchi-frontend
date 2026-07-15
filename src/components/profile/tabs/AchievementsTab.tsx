"use client";

import { useState } from "react";
import { motion } from "motion/react";
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

const inProgressVariants = {
  hidden: { opacity: 0, x: -20 },
  show: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.08, type: "spring", stiffness: 300, damping: 20 },
  }),
};

export default function AchievementsTab({ profile }: AchievementsTabProps) {
  const t = useTranslations("Profile");
  const { achievements } = profile;
  const [selected, setSelected] = useState<Achievement | null>(null);

  const unlocked = achievements.filter((a) => a.unlocked);
  const inProgress = achievements.filter((a) => !a.unlocked && a.progress > 0);

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="show"
    >
      {/* Header counter */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <h3 className="font-display text-lg font-bold">{t("achievements.title")}</h3>
        <motion.span
          className="text-sm text-muted-foreground font-medium"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 10 }}
        >
          {unlocked.length}/{achievements.length} {t("achievements.unlocked")}
        </motion.span>
      </motion.div>

      {/* In-progress achievements */}
      {inProgress.length > 0 && (
        <div className="space-y-3">
          <motion.h4
            className="text-sm font-semibold text-muted-foreground uppercase tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {t("achievements.inProgress")}
          </motion.h4>
          {inProgress.map((achievement, i) => {
            const Icon = getIcon(achievement.icon);
            return (
              <motion.div
                key={achievement.id}
                custom={i}
                variants={inProgressVariants}
                className="rounded-2xl bg-card border border-border p-4 space-y-2 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelected(achievement)}
                whileHover={{ scale: 1.01, x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${achievement.color} 15%, transparent)`,
                      color: achievement.color,
                    }}
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.4 }}
                  >
                    <Icon size={20} />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{achievement.title}</p>
                    <p className="text-xs text-muted-foreground">{achievement.progressLabel}</p>
                  </div>
                  <Clock size={16} className="text-muted-foreground shrink-0" />
                </div>
                <Progress value={achievement.progress} className="h-1.5" />
              </motion.div>
            );
          })}
        </div>
      )}

      {/* All badges grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 + inProgress.length * 0.08 }}
      >
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          {t("achievements.all")}
        </h4>
        <BadgeGrid achievements={achievements} onBadgeClick={setSelected} />
      </motion.div>

      {/* Detail sheet */}
      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          {selected && (() => {
            const Icon = getIcon(selected.icon);
            return (
              <SheetHeader className="text-left">
                <motion.div
                  className="flex items-center gap-4 mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
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
                </motion.div>
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
    </motion.div>
  );
}
