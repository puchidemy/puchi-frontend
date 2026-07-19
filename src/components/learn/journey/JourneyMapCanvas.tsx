"use client";

import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { islandBaseSrc } from "@/lib/journey-map/unit-1-config";
import type {
  DerivedLandmarkView,
  JourneyMapConfig,
} from "@/lib/journey-map/types";
import { JourneyHotspot } from "./JourneyHotspot";
import { JourneyPuchiOverlay } from "./JourneyPuchiOverlay";

/** Fixed scene backdrop (map art has transparent background). */
export const JOURNEY_MAP_SCENE_BG =
  "linear-gradient(180deg, #dceef5 0%, #e8f5ef 45%, #f3f0e6 100%)";

export type JourneyMapCanvasProps = {
  config: JourneyMapConfig;
  views: DerivedLandmarkView[];
  onSelectRegion: (slug: string) => void;
  onHoverRegion?: (slug: string | null) => void;
  previewSlug?: string | null;
  getAriaLabel: (view: DerivedLandmarkView) => string;
  className?: string;
};

/**
 * Full-height fit — no pan/zoom. Image + hotspots share one aspect-square box
 * so region % coordinates stay aligned.
 */
export function JourneyMapCanvas({
  config,
  views,
  onSelectRegion,
  onHoverRegion,
  previewSlug = null,
  getAriaLabel,
  className,
}: JourneyMapCanvasProps) {
  const reduceMotion = useReducedMotion();
  const src = islandBaseSrc(config);

  return (
    <div
      className={cn(
        "relative flex h-full min-h-0 w-full items-center justify-center overflow-hidden",
        className,
      )}
      style={{ background: JOURNEY_MAP_SCENE_BG }}
      role="application"
      aria-label="Journey map"
    >
      {/* Square board fills available height (and width if narrower). */}
      <div className="relative h-full max-h-full w-auto max-w-full aspect-square">
        <Image
          key={src}
          src={src}
          alt=""
          fill
          className="pointer-events-none select-none object-contain"
          draggable={false}
          priority
          unoptimized
          sizes="100vh"
        />
        {views.map((view) => (
          <JourneyHotspot
            key={view.slug}
            hotspot={view.hotspot}
            hitW={view.hitW}
            hitH={view.hitH}
            status={view.status}
            isCurrent={view.isCurrent}
            isPreviewed={previewSlug === view.slug}
            ariaLabel={getAriaLabel(view)}
            reduceMotion={!!reduceMotion}
            onSelect={() => onSelectRegion(view.slug)}
            onHoverStart={() => onHoverRegion?.(view.slug)}
            onHoverEnd={() => onHoverRegion?.(null)}
          />
        ))}
        <JourneyPuchiOverlay views={views} />
      </div>
    </div>
  );
}
