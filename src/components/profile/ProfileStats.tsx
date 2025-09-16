"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Trophy, Target, TrendingUp, Clock } from "lucide-react";

interface ProfileStatsProps {
  stats?: {
    totalLessons: number;
    completedLessons: number;
    currentStreak: number;
    totalXP: number;
    level: number;
    accuracy: number;
  };
}

const ProfileStats = ({ stats }: ProfileStatsProps) => {
  const t = useTranslations("ProfileStats");

  // Mock data nếu không có stats
  const defaultStats = {
    totalLessons: 50,
    completedLessons: 35,
    currentStreak: 7,
    totalXP: 1250,
    level: 8,
    accuracy: 85,
  };

  const currentStats = stats || defaultStats;
  const completionRate =
    (currentStats.completedLessons / currentStats.totalLessons) * 100;

  const statItems = [
    {
      title: t("stats.completedLessons"),
      value: `${currentStats.completedLessons}/${currentStats.totalLessons}`,
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: t("stats.currentStreak"),
      value: t("stats.streakDays", { days: currentStats.currentStreak }),
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: t("stats.totalXP"),
      value: currentStats.totalXP.toLocaleString(),
      icon: Trophy,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
    },
    {
      title: t("stats.currentLevel"),
      value: t("stats.level", { level: currentStats.level }),
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Thống kê tổng quan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            {t("learningStats.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statItems.map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${item.bgColor}`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div>
                  <p className="text-base font-medium">{item.title}</p>
                  <p className="text-lg font-bold">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tiến độ học tập */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            {t("progress.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {t("progress.completedLessons")}
            </span>
            <span className="text-sm text-muted-foreground">
              {completionRate.toFixed(1)}%
            </span>
          </div>
          <Progress value={completionRate} className="h-2" />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {t("progress.completed", {
                count: currentStats.completedLessons,
              })}
            </span>
            <span>
              {t("progress.remaining", {
                count:
                  currentStats.totalLessons - currentStats.completedLessons,
              })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Độ chính xác */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            {t("performance.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {t("performance.averageAccuracy")}
                </p>
                <p className="text-lg font-bold">{currentStats.accuracy}%</p>
              </div>
            </div>
            <Badge
              variant={currentStats.accuracy >= 80 ? "default" : "secondary"}
              className="text-sm"
            >
              {currentStats.accuracy >= 80
                ? t("performance.excellent")
                : t("performance.needsImprovement")}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileStats;
