"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DerivedLandmarkView } from "@/lib/journey-map/types";

export type RegionPreviewCardProps = {
  view: DerivedLandmarkView;
  onContinue: () => void;
  onDismiss?: () => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
  className?: string;
};

/** Hover/tap preview: chapter hero, title, progress, Continue — not on the map art. */
export function RegionPreviewCard({
  view,
  onContinue,
  onDismiss,
  onPointerEnter,
  onPointerLeave,
  className,
}: RegionPreviewCardProps) {
  const t = useTranslations("Learn");
  const title = t(`Journey.landmark.${view.slug}`);
  const cta =
    view.status === "completed"
      ? t("Journey.Chapter.review")
      : t("Journey.Chapter.continue");
  const hero = view.assets.hero;

  return (
    <div
      data-journey-preview
      className={cn(
        "pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl border bg-background/95 shadow-lg backdrop-blur-md",
        className,
      )}
      role="dialog"
      aria-label={title}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <div className="relative aspect-[16/9] w-full bg-muted">
        {hero ? (
          <Image
            src={hero}
            alt=""
            fill
            className="object-cover"
            sizes="320px"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-100 to-sky-100 dark:from-emerald-950 dark:to-sky-950">
            <span className="px-4 text-center text-sm font-medium text-muted-foreground">
              {title}
            </span>
          </div>
        )}
      </div>
      <div className="space-y-3 p-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("Journey.previewChapter")}
          </p>
          <h3 className="mt-0.5 text-lg font-bold leading-tight">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("Journey.Chapter.progress", {
              completed: view.completedCount,
              total: view.totalCount,
            })}
          </p>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{
              width:
                view.totalCount > 0
                  ? `${(view.completedCount / view.totalCount) * 100}%`
                  : "0%",
            }}
          />
        </div>
        <div className="flex gap-2">
          {onDismiss && (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onDismiss}
            >
              {t("Journey.previewClose")}
            </Button>
          )}
          <Button
            type="button"
            variant="highlight"
            className="flex-1"
            onClick={onContinue}
          >
            {cta}
          </Button>
        </div>
      </div>
    </div>
  );
}
