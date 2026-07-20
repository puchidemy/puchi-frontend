"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CityMapView } from "@/lib/journey-cities";

export type CityPreviewCardProps = {
  view: CityMapView;
  onExplore: () => void;
  onDismiss?: () => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
  className?: string;
  compact?: boolean;
};

/** Preview for any city — all cities are open (no lock UI). */
export function CityPreviewCard({
  view,
  onExplore,
  onDismiss,
  onPointerEnter,
  onPointerLeave,
  className,
  compact = false,
}: CityPreviewCardProps) {
  const t = useTranslations("Learn");
  const title = t.has(`City.names.${view.slug}`)
    ? t(`City.names.${view.slug}`)
    : view.name;
  const blurb = t.has(`City.blurbs.${view.slug}`)
    ? t(`City.blurbs.${view.slug}`)
    : view.blurb;

  return (
    <div
      data-journey-preview
      className={cn(
        "pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl border border-border/70 bg-background/96 shadow-xl backdrop-blur-md",
        className,
      )}
      role="dialog"
      aria-label={title}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <div className="relative aspect-video w-full bg-muted">
        {view.coverSrc ? (
          <Image
            src={view.coverSrc}
            alt=""
            fill
            className="object-cover"
            sizes="360px"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-100 to-sky-100 dark:from-emerald-950 dark:to-sky-950">
            <span className="px-3 text-center text-sm font-medium text-muted-foreground">
              {title}
            </span>
          </div>
        )}
      </div>
      <div className={cn(compact ? "space-y-2.5 p-3.5" : "space-y-3 p-4")}>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("City.previewLabel")}
          </p>
          <h3
            className={cn(
              "mt-0.5 font-bold leading-tight",
              compact ? "text-lg" : "text-lg",
            )}
          >
            {title}
          </h3>
          {blurb && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {blurb}
            </p>
          )}
          <p className="mt-1 text-sm text-muted-foreground">
            {view.storyCount > 0
              ? t("City.storyCount", { count: view.storyCount })
              : t("City.comingSoonStories")}
          </p>
        </div>
        <div className="flex gap-2">
          {onDismiss && (
            <Button
              type="button"
              variant="secondary"
              size={compact ? "sm" : "default"}
              className="flex-1"
              onClick={onDismiss}
            >
              {t("City.previewClose")}
            </Button>
          )}
          <Button
            type="button"
            variant="highlight"
            size={compact ? "sm" : "default"}
            className="flex-1"
            onClick={onExplore}
          >
            {t("City.explore")}
          </Button>
        </div>
      </div>
    </div>
  );
}
