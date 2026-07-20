"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { regionCutoutSrc } from "@/lib/journey-map/region-mask";
import type {
  DerivedLandmarkView,
  JourneyMapConfig,
} from "@/lib/journey-map/types";

export type JourneyRegionHighlightProps = {
  config: JourneyMapConfig;
  views: DerivedLandmarkView[];
  activeSlug: string | null;
};

function tintFor(view: DerivedLandmarkView, active: boolean): string | null {
  const locked =
    view.status === "locked" || view.status === "coming_soon";

  if (locked) {
    // Always disabled wash; stronger when hovered/selected.
    return active ? "rgba(60, 58, 55, 0.42)" : "rgba(60, 58, 55, 0.26)";
  }
  if (!active) return null;
  if (view.status === "completed") return "rgba(46, 160, 110, 0.30)";
  // unlocked current / playable
  return "rgba(255, 255, 255, 0.32)";
}

/** Region-shaped color wash — no lift / shadow. */
export function JourneyRegionHighlight({
  config,
  views,
  activeSlug,
}: JourneyRegionHighlightProps) {
  return (
    <>
      {views.map((view) => {
        const active = activeSlug === view.slug;
        const tint = tintFor(view, active);
        if (!tint) return null;

        const src = regionCutoutSrc(config.assetBasePath, view.slug);
        const mask: CSSProperties = {
          backgroundColor: tint,
          WebkitMaskImage: `url(${src})`,
          maskImage: `url(${src})`,
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
        };

        return (
          <div
            key={view.slug}
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 z-10 transition-[background-color,opacity] duration-150",
              active && "z-11",
            )}
            style={mask}
          />
        );
      })}
    </>
  );
}
