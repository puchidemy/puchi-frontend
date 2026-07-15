"use client";

import { useTranslations } from "next-intl";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FullProfile } from "@/types/profile";
import LevelRing from "./shared/LevelRing";
import StreakFlame from "./shared/StreakFlame";
import XpProgressBar from "./shared/XpProgressBar";
import StatCard from "./shared/StatCard";
import { Crown, Gem, BookOpen, Target, Clock, BookText } from "lucide-react";

interface ProfileHeroProps {
  profile: FullProfile;
}

export default function ProfileHero({ profile }: ProfileHeroProps) {
  const t = useTranslations("Profile");
  const { user, gamification, stats } = profile;
  const xpProgress = (gamification.currentXP / gamification.xpToNextLevel) * 100;
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-card border border-border p-6 space-y-5">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <LevelRing level={gamification.level} progress={xpProgress} size={120}>
            <Avatar className="h-[104px] w-[104px] border-4 border-background">
              <AvatarImage src={user.imageUrl} alt={user.username} />
              <AvatarFallback className="text-2xl font-display bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
          </LevelRing>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <h1 className="text-2xl font-display font-bold">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-muted-foreground">@{user.username}</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <StreakFlame streak={gamification.streak} size="md" />
              <p className="text-xs text-muted-foreground mt-1">{t("streak")}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1.5">
                <Crown size={24} className="text-[var(--unit-3)]" />
                <span className="text-3xl font-display font-extrabold tabular-nums">
                  {gamification.crowns}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t("crowns")}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1.5">
                <Gem size={24} className="text-[var(--unit-5)]" />
                <span className="text-3xl font-display font-extrabold tabular-nums">
                  {gamification.gems}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t("gems")}</p>
            </div>
          </div>
        </div>

        <XpProgressBar
          currentLevel={gamification.level}
          currentXP={gamification.currentXP}
          xpToNextLevel={gamification.xpToNextLevel}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={BookOpen}
          label={t("stats.lessonsCompleted")}
          value={`${stats.completedLessons}/${stats.totalLessons}`}
          color="var(--unit-1)"
          bgColor="color-mix(in srgb, var(--unit-1) 15%, transparent)"
        />
        <StatCard
          icon={Target}
          label={t("stats.accuracy")}
          value={`${stats.accuracy}%`}
          color="var(--unit-5)"
          bgColor="color-mix(in srgb, var(--unit-5) 15%, transparent)"
        />
        <StatCard
          icon={Clock}
          label={t("stats.totalHours")}
          value={`${(stats.totalMinutes / 60).toFixed(1)}h`}
          color="var(--unit-6)"
          bgColor="color-mix(in srgb, var(--unit-6) 15%, transparent)"
        />
        <StatCard
          icon={BookText}
          label={t("stats.wordsLearned")}
          value={stats.wordsLearned.toLocaleString("en-US")}
          color="var(--unit-2)"
          bgColor="color-mix(in srgb, var(--unit-2) 15%, transparent)"
        />
      </div>
    </div>
  );
}
