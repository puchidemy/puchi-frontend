"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import type { LearnSkill, LearnUnit } from "@/lib/learn-api";
import { resolveChapterAccess } from "@/lib/journey-map/chapter-access";
import { deriveLandmarkViews } from "@/lib/journey-map/derive";
import type { DerivedLandmarkView } from "@/lib/journey-map/types";
import { UNIT_1_JOURNEY_MAP } from "@/lib/journey-map/unit-1-config";
import { JourneyMapCanvas } from "./JourneyMapCanvas";
import { JourneyMapHeader } from "./JourneyMapHeader";
import { RegionPreviewAnchor } from "./RegionPreviewAnchor";

export type JourneyMapViewProps = {
  unit: LearnUnit;
  skills: LearnSkill[];
  completedLessonIds: string[];
  /** Reserved for guest soft-gate (lesson quota) — not region lock. */
  onLockedLessonClick?: () => void;
};

const HOVER_CLOSE_MS = 420;

/**
 * Journey → Region → Chapter → Lessons
 * Preview stays open while pointer is on region OR card (leave delay).
 * Click pins the card so it never disappears while interacting.
 */
export function JourneyMapView({
  unit,
  skills,
  completedLessonIds,
}: JourneyMapViewProps) {
  const t = useTranslations("Learn");
  const router = useRouter();
  const config = UNIT_1_JOURNEY_MAP;
  const views = deriveLandmarkViews(config, skills, completedLessonIds);

  const [pinnedSlug, setPinnedSlug] = useState<string | null>(null);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  // Preview mọi vùng (kể cả khóa); Continue disabled trong card.
  const showPreview = previewView != null;

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const openHover = (slug: string) => {
    clearCloseTimer();
    setHoveredSlug(slug);
  };

  const scheduleCloseHover = () => {
    if (pinnedSlug) return;
    clearCloseTimer();
    closeTimer.current = setTimeout(() => {
      setHoveredSlug(null);
      closeTimer.current = null;
    }, HOVER_CLOSE_MS);
  };

  const getAriaLabel = (view: DerivedLandmarkView) => {
    const name = t(`Journey.landmark.${view.slug}`);
    const status = t(`Journey.status.${view.status}`);
    return `${name}, ${status}`;
  };

  const onSelectRegion = (slug: string) => {
    clearCloseTimer();
    // Pin preview for every region (locked included — CTA disabled in card).
    setPinnedSlug(slug);
    setHoveredSlug(slug);
  };

  const onContinue = () => {
    if (!previewView) return;
    if (
      previewView.status === "locked" ||
      previewView.status === "coming_soon"
    ) {
      return;
    }
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
      <div className="relative min-h-0 flex-1 overflow-visible">
        <JourneyMapCanvas
          config={config}
          views={views}
          onSelectRegion={onSelectRegion}
          onHoverRegion={(slug) => {
            if (slug) openHover(slug);
            else scheduleCloseHover();
          }}
          previewSlug={previewSlug}
          getAriaLabel={getAriaLabel}
          className="h-full overflow-visible"
        >
          {showPreview && previewView && (
            <RegionPreviewAnchor
              view={previewView}
              onContinue={onContinue}
              onDismiss={() => {
                clearCloseTimer();
                setPinnedSlug(null);
                setHoveredSlug(null);
              }}
              onPointerEnter={() => openHover(previewView.slug)}
              onPointerLeave={() => scheduleCloseHover()}
            />
          )}
        </JourneyMapCanvas>
      </div>
    </div>
  );
}
