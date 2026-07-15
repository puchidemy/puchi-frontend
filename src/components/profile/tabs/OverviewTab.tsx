"use client";

import { useTranslations } from "next-intl";
import { FullProfile } from "@/types/profile";
import StreakFlame from "../shared/StreakFlame";

interface OverviewTabProps {
  profile: FullProfile;
}

function WeeklyStrip() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date().getDay();
  const dayIndex = today === 0 ? 6 : today - 1;

  return (
    <div className="flex items-center justify-between">
      {days.map((day, i) => {
        const isPast = i <= dayIndex;
        const isToday = i === dayIndex;
        return (
          <div key={day} className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-muted-foreground">{day}</span>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                isToday
                  ? "bg-primary text-primary-foreground"
                  : isPast
                    ? "bg-[color-mix(in_srgb,var(--primary)_30%,transparent)] text-primary"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {isPast ? "\u2713" : "\u2014"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function OverviewTab({ profile }: OverviewTabProps) {
  const t = useTranslations("Profile");
  const { gamification, stats } = profile;
  const completionRate = (stats.completedLessons / stats.totalLessons) * 100;

  const streakMessage =
    gamification.streak >= 7
      ? "Amazing streak! Keep the fire burning!"
      : gamification.streak >= 3
        ? "Nice streak! Don't break it!"
        : "Start your streak today!";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
        <h3 className="font-display text-lg font-bold">{t("weeklyRecap")}</h3>
        <WeeklyStrip />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{gamification.totalXP.toLocaleString()} XP {t("totalXP")}</span>
          <span>5/7 {t("daysActive")}</span>
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-[color-mix(in_srgb,var(--unit-4)_15%,transparent)] to-[color-mix(in_srgb,var(--unit-3)_15%,transparent)] border border-[color-mix(in_srgb,var(--unit-4)_20%,transparent)] p-5">
        <div className="flex items-center gap-3">
          <StreakFlame streak={gamification.streak} />
          <div>
            <p className="font-semibold">{gamification.streak} {t("dayStreak")}</p>
            <p className="text-sm text-muted-foreground">{streakMessage}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("longestStreak")}: {gamification.longestStreak} {t("days")}
              {" \u00B7 "}
              {gamification.streakFreezes} {t("freezesRemaining")}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
        <h3 className="font-display text-lg font-bold">{t("learningProgress")}</h3>
        <div className="flex items-center justify-between text-sm">
          <span>{t("courseCompletion")}</span>
          <span className="font-din font-bold">{completionRate.toFixed(0)}%</span>
        </div>
        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {stats.completedLessons}/{stats.totalLessons} {t("lessonsCompleted")} \u00B7 {stats.totalMinutes} {t("minutesLearned")}
        </p>
      </div>

      <div className="rounded-2xl bg-card border border-border p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold">{t("totalXP")}</h3>
          <span className="text-2xl font-din font-extrabold text-[var(--unit-3)] tabular-nums">
            {gamification.totalXP.toLocaleString()} XP
          </span>
        </div>
      </div>
    </div>
  );
}
