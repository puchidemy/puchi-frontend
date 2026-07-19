"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import type { LearnSkill, LearnUnit } from "@/lib/learn-api";
import { resolveChapterAccess } from "@/lib/journey-map/chapter-access";
import { deriveLandmarkViews } from "@/lib/journey-map/derive";
import type { DerivedLandmarkView } from "@/lib/journey-map/types";
import { UNIT_1_JOURNEY_MAP } from "@/lib/journey-map/unit-1-config";
import { JourneyMapCanvas } from "./JourneyMapCanvas";
import { JourneyMapHeader } from "./JourneyMapHeader";

export type JourneyMapViewProps = {
  unit: LearnUnit;
  skills: LearnSkill[];
  completedLessonIds: string[];
  /** When set (guest soft-gate), locked landmarks open the gate instead of a tip. */
  onLockedLessonClick?: () => void;
};

export function JourneyMapView({
  unit,
  skills,
  completedLessonIds,
  onLockedLessonClick,
}: JourneyMapViewProps) {
  const t = useTranslations("Learn");
  const router = useRouter();
  const config = UNIT_1_JOURNEY_MAP;
  const views = deriveLandmarkViews(config, skills, completedLessonIds);

  const allLessons = skills.flatMap((s) => s.lessons);
  const totalLessons = allLessons.length;
  const completedLessons = allLessons.filter((l) =>
    completedLessonIds.includes(l.id),
  ).length;

  const getAriaLabel = (view: DerivedLandmarkView) => {
    const name = t(`Journey.landmark.${view.slug}`);
    const status = t(`Journey.status.${view.status}`);
    return `${name}, ${status}`;
  };

  const onSelectLandmark = (slug: string) => {
    const access = resolveChapterAccess(config, views, slug);
    if (!access.ok) {
      if (access.reason === "locked" && onLockedLessonClick) {
        onLockedLessonClick();
        return;
      }
      toast.message(
        access.reason === "coming_soon"
          ? t("Journey.comingSoon")
          : t("Journey.locked"),
      );
      return;
    }
    router.push(`/learn/chapter/${slug}`);
  };

  return (
    <div className="flex w-full flex-col font-din">
      <JourneyMapHeader
        title={unit.title}
        completedLessons={completedLessons}
        totalLessons={totalLessons}
        progressLabel={t("Journey.progressChip", {
          completed: completedLessons,
          total: totalLessons,
        })}
      />
      <div className="h-[min(70vh,720px)] w-full min-h-[320px]">
        <JourneyMapCanvas
          config={config}
          views={views}
          onSelectLandmark={onSelectLandmark}
          getAriaLabel={getAriaLabel}
          resetLabel={t("Journey.resetView")}
          className="h-full"
        />
      </div>
    </div>
  );
}
