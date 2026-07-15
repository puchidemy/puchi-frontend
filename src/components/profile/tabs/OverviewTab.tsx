"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { FullProfile } from "@/types/profile";
import StreakFlame from "../shared/StreakFlame";
import StatCard from "../shared/StatCard";
import { BookOpen, Target, Clock, BookText } from "lucide-react";

interface OverviewTabProps {
  profile: FullProfile;
}

function WeeklyStrip({ dayIndex }: { dayIndex: number }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="flex items-center justify-between">
      {days.map((day, i) => {
        const isPast = i <= dayIndex;
        const isToday = i === dayIndex;
        return (
          <div key={day} className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-muted-foreground">{day}</span>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 15 }}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                isToday
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                  : isPast
                    ? "bg-[color-mix(in_srgb,var(--primary)_30%,transparent)] text-primary"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {isPast ? "\u2713" : "\u2014"}
            </motion.div>
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
  const dayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  const streakMessage =
    gamification.streak >= 7
      ? "Amazing streak! Keep the fire burning!"
      : gamification.streak >= 3
        ? "Nice streak! Don't break it!"
        : "Start your streak today!";

  const cards = [
    { icon: BookOpen, value: `${stats.completedLessons}/${stats.totalLessons}`, label: t("stats.lessonsCompleted"), color: "var(--unit-1)", bgColor: "color-mix(in srgb, var(--unit-1) 15%, transparent)" },
    { icon: Target, value: `${stats.accuracy}%`, label: t("stats.accuracy"), color: "var(--unit-5)", bgColor: "color-mix(in srgb, var(--unit-5) 15%, transparent)" },
    { icon: Clock, value: `${(stats.totalMinutes / 60).toFixed(1)}h`, label: t("stats.totalHours"), color: "var(--unit-6)", bgColor: "color-mix(in srgb, var(--unit-6) 15%, transparent)" },
    { icon: BookText, value: stats.wordsLearned.toLocaleString("en-US"), label: t("stats.wordsLearned"), color: "var(--unit-2)", bgColor: "color-mix(in srgb, var(--unit-2) 15%, transparent)" },
  ];

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } },
  };

  return (
    <motion.div
      className="space-y-5"
      initial="hidden"
      animate="show"
      variants={container}
    >
      {/* Weekly recap */}
      <motion.div variants={itemAnim} className="rounded-2xl bg-card border border-border p-5 space-y-4">
        <h3 className="font-display text-lg font-bold">{t("weeklyRecap")}</h3>
        <WeeklyStrip dayIndex={dayIndex} />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{gamification.totalXP.toLocaleString("en-US")} XP</span>
          <span>5/7 {t("daysActive")}</span>
        </div>
      </motion.div>

      {/* Streak */}
      <motion.div
        variants={itemAnim}
        className="rounded-2xl bg-gradient-to-r from-[color-mix(in_srgb,var(--unit-4)_15%,transparent)] to-[color-mix(in_srgb,var(--unit-3)_15%,transparent)] border border-[color-mix(in_srgb,var(--unit-4)_20%,transparent)] p-5"
      >
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
      </motion.div>

      {/* Learning progress */}
      <motion.div variants={itemAnim} className="rounded-2xl bg-card border border-border p-5 space-y-3">
        <h3 className="font-display text-lg font-bold">{t("learningProgress")}</h3>
        <div className="flex items-center justify-between text-sm">
          <span>{t("courseCompletion")}</span>
          <span className="font-din font-bold">{completionRate.toFixed(0)}%</span>
        </div>
        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${completionRate}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {stats.completedLessons}/{stats.totalLessons} {t("lessonsCompleted")}
          {" \u00B7 "}
          {stats.totalMinutes} {t("minutesLearned")}
        </p>
      </motion.div>

      {/* Total XP */}
      <motion.div variants={itemAnim} className="rounded-2xl bg-card border border-border p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold">{t("totalXP")}</h3>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.3 }}
            className="text-2xl font-din font-extrabold text-[var(--unit-3)] tabular-nums"
          >
            {gamification.totalXP.toLocaleString("en-US")} XP
          </motion.span>
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div variants={itemAnim} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.08, type: "spring", stiffness: 300, damping: 20 }}
          >
            <StatCard
              icon={card.icon}
              label={card.label}
              value={card.value}
              color={card.color}
              bgColor={card.bgColor}
            />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
