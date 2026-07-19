"use client";

import { useState } from "react";
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
import { RegionPreviewCard } from "./RegionPreviewCard";

export type JourneyMapViewProps = {
  unit: LearnUnit;
  skills: LearnSkill[];
  completedLessonIds: string[];
  onLockedLessonClick?: () => void;
};

/**
 * Journey → Region → Chapter → Lessons
 * Full-height 2.5D board; islands are decorative on the art only.
 */
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

  const [pinnedSlug, setPinnedSlug] = useState<string | null>(null);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  const allLessons = skills.flatMap((s) => s.lessons);
  const totalLessons = allLessons.length;
  const completedLessons = allLessons.filter((l) =>
    completedLessonIds.includes(l.id),
  ).length;

  const previewSlug = pinnedSlug ?? hoveredSlug;
  const previewView =
    previewSlug != null
      ? (views.find((v) => v.slug === previewSlug) ?? null)
      : null;
  const showPreview =
    previewView != null &&
    (previewView.status === "unlocked" || previewView.status === "completed");

  const getAriaLabel = (view: DerivedLandmarkView) => {
    const name = t(`Journey.landmark.${view.slug}`);
    const status = t(`Journey.status.${view.status}`);
    return `${name}, ${status}`;
  };

  const onSelectRegion = (slug: string) => {
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
      setPinnedSlug(null);
      return;
    }
    setPinnedSlug((prev) => (prev === slug ? null : slug));
  };

  const onHoverRegion = (slug: string | null) => {
    setHoveredSlug(slug);
  };

  const onContinue = () => {
    if (!previewView) return;
    const access = resolveChapterAccess(config, views, previewView.slug);
    if (!access.ok) return;
    router.push(`/learn/chapter/${previewView.slug}`);
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <JourneyMapHeader
        className="shrink-0"
        title={unit.title}
        completedLessons={completedLessons}
        totalLessons={totalLessons}
        progressLabel={t("Journey.progressChip", {
          completed: completedLessons,
          total: totalLessons,
        })}
      />
      <div className="relative min-h-0 flex-1">
        <JourneyMapCanvas
          config={config}
          views={views}
          onSelectRegion={onSelectRegion}
          onHoverRegion={onHoverRegion}
          previewSlug={previewSlug}
          getAriaLabel={getAriaLabel}
          className="h-full"
        />
        {showPreview && previewView && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-3 z-40 flex justify-center px-3 sm:bottom-4 sm:justify-end sm:pr-4"
            onMouseEnter={() => setHoveredSlug(previewView.slug)}
            onMouseLeave={() => {
              if (!pinnedSlug) setHoveredSlug(null);
            }}
          >
            <RegionPreviewCard
              view={previewView}
              onContinue={onContinue}
              onDismiss={
                pinnedSlug
                  ? () => {
                      setPinnedSlug(null);
                      setHoveredSlug(null);
                    }
                  : undefined
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
