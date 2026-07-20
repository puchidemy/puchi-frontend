"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
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
import { JourneyRegionHighlight } from "./JourneyRegionHighlight";
import { useRegionMaskHitTest } from "./useRegionMaskHitTest";
import { useSquareBoardSize } from "./useSquareBoardSize";

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
  /** Rendered inside the square board (same % coords as hotspots). */
  children?: ReactNode;
};

function isPreviewTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest("[data-journey-preview], [data-journey-preview-bridge]"),
  );
}

/**
 * Full-height fit — no pan/zoom. Board is a measured square so % coords
 * always match the square map image across breakpoints.
 */
export function JourneyMapCanvas({
  config,
  views,
  onSelectRegion,
  onHoverRegion,
  previewSlug = null,
  getAriaLabel,
  className,
  children,
}: JourneyMapCanvasProps) {
  const reduceMotion = useReducedMotion();
  const src = islandBaseSrc(config);
  const frameRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const boardSize = useSquareBoardSize(frameRef);
  const { hitTest } = useRegionMaskHitTest(config, views);
  const lastHover = useRef<string | null>(null);

  const resolveSlug = (clientX: number, clientY: number) => {
    const board = boardRef.current;
    if (!board) return null;
    return hitTest(board, clientX, clientY);
  };

  const emitHover = (slug: string | null) => {
    if (lastHover.current === slug) return;
    lastHover.current = slug;
    onHoverRegion?.(slug);
  };

  return (
    <div
      ref={frameRef}
      className={cn(
        "relative flex h-full min-h-0 w-full items-center justify-center overflow-visible",
        className,
      )}
      style={{ background: JOURNEY_MAP_SCENE_BG }}
      role="application"
      aria-label="Journey map"
    >
      <div
        ref={boardRef}
        className="relative cursor-pointer touch-manipulation"
        style={
          boardSize > 0
            ? { width: boardSize, height: boardSize }
            : { width: "min(100%, 100%)", aspectRatio: "1 / 1", maxHeight: "100%" }
        }
        onPointerMove={(e) => {
          if (isPreviewTarget(e.target)) return;
          emitHover(resolveSlug(e.clientX, e.clientY));
        }}
        onPointerLeave={() => emitHover(null)}
        onClick={(e) => {
          if (isPreviewTarget(e.target)) return;
          const slug = resolveSlug(e.clientX, e.clientY);
          if (slug) onSelectRegion(slug);
        }}
      >
        <Image
          key={src}
          src={src}
          alt=""
          fill
          className="pointer-events-none select-none object-fill"
          draggable={false}
          priority
          unoptimized
          sizes={`${boardSize || 512}px`}
        />
        <JourneyRegionHighlight
          config={config}
          views={views}
          activeSlug={previewSlug}
        />
        {views.map((view) => (
          <JourneyHotspot
            key={view.slug}
            hotspot={view.hotspot}
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
        {children}
      </div>
    </div>
  );
}
