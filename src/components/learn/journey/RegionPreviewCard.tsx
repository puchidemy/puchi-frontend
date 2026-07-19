"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DerivedLandmarkView } from "@/lib/journey-map/types";

const LOCK_SRC = "/images/learn/journey/ui/lock-3d.webp";

export type RegionPreviewCardProps = {
  view: DerivedLandmarkView;
  onContinue: () => void;
  onDismiss?: () => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
  className?: string;
};

/** Preview for any region; Continue disabled when locked / coming soon. */
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
  const isLocked =
    view.status === "locked" || view.status === "coming_soon";
  const cta = isLocked
    ? view.status === "coming_soon"
      ? t("Journey.comingSoon")
      : t("Journey.locked")
    : view.status === "completed"
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
            className={cn("object-cover", isLocked && "opacity-70")}
            sizes="320px"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-100 to-sky-100 dark:from-emerald-950 dark:to-sky-950">
            <span className="px-4 text-center text-sm font-medium text-muted-foreground">
              {title}
            </span>
          </div>
        )}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
            <Image
              src={LOCK_SRC}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 object-contain opacity-95 drop-shadow-md"
              unoptimized
              aria-hidden
            />
          </div>
        )}
      </div>
      <div className="space-y-3 p-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("Journey.previewChapter")}
            {isLocked && (
              <span className="ml-2 text-amber-600 dark:text-amber-400">
                · {t(`Journey.status.${view.status}`)}
              </span>
            )}
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
            disabled={isLocked}
            onClick={onContinue}
          >
            {cta}
          </Button>
        </div>
      </div>
    </div>
  );
}
