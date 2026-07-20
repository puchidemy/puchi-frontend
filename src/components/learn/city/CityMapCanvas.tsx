"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  cityBoardSrc,
  slugAtCityHotspot,
  type CityMapView,
  type JourneyCitiesConfig,
} from "@/lib/journey-cities";
import { useSquareBoardSize } from "./useSquareBoardSize";
import { CityHotspot } from "./CityHotspot";
import { CityPuchiOverlay } from "./CityPuchiOverlay";

export const CITY_MAP_SCENE_BG =
  "linear-gradient(180deg, #dceef5 0%, #e8f5ef 45%, #f3f0e6 100%)";

export type CityMapCanvasProps = {
  config: JourneyCitiesConfig;
  views: CityMapView[];
  onSelectCity: (slug: string) => void;
  onHoverCity?: (slug: string | null) => void;
  previewSlug?: string | null;
  getAriaLabel: (view: CityMapView) => string;
  className?: string;
  children?: ReactNode;
};

function isPreviewTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest("[data-journey-preview], [data-journey-preview-bridge]"),
  );
}

/** Full-height Vietnam board — city pins, box hit-test, no locks. */
export function CityMapCanvas({
  config,
  views,
  onSelectCity,
  onHoverCity,
  previewSlug = null,
  getAriaLabel,
  className,
  children,
}: CityMapCanvasProps) {
  const reduceMotion = useReducedMotion();
  const src = cityBoardSrc(config);
  const frameRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const boardSize = useSquareBoardSize(frameRef);
  const viewsRef = useRef(views);
  useEffect(() => {
    viewsRef.current = views;
  }, [views]);
  const lastHover = useRef<string | null>(null);

  const resolveSlug = (clientX: number, clientY: number) => {
    const board = boardRef.current;
    if (!board) return null;
    const rect = board.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    const nx = (clientX - rect.left) / rect.width;
    const ny = (clientY - rect.top) / rect.height;
    return slugAtCityHotspot(viewsRef.current, nx, ny);
  };

  const emitHover = (slug: string | null) => {
    if (lastHover.current === slug) return;
    lastHover.current = slug;
    onHoverCity?.(slug);
  };

  return (
    <div
      ref={frameRef}
      className={cn(
        "relative flex h-full min-h-0 w-full items-center justify-center overflow-visible",
        className,
      )}
      style={{ background: CITY_MAP_SCENE_BG }}
      role="application"
      aria-label="City journey map"
    >
      <div
        ref={boardRef}
        className="relative cursor-pointer touch-manipulation"
        style={
          boardSize > 0
            ? { width: boardSize, height: boardSize }
            : {
                width: "min(100%, 100%)",
                aspectRatio: "1 / 1",
                maxHeight: "100%",
              }
        }
        onPointerMove={(e) => {
          if (isPreviewTarget(e.target)) return;
          emitHover(resolveSlug(e.clientX, e.clientY));
        }}
        onPointerLeave={() => emitHover(null)}
        onClick={(e) => {
          if (isPreviewTarget(e.target)) return;
          const slug = resolveSlug(e.clientX, e.clientY);
          if (slug) onSelectCity(slug);
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
        {views.map((view) => (
          <CityHotspot
            key={view.slug}
            hotspot={view.hotspot}
            isCurrent={view.isCurrent}
            isPreviewed={previewSlug === view.slug}
            ariaLabel={getAriaLabel(view)}
            reduceMotion={!!reduceMotion}
            onSelect={() => onSelectCity(view.slug)}
            onHoverStart={() => onHoverCity?.(view.slug)}
            onHoverEnd={() => onHoverCity?.(null)}
          />
        ))}
        <CityPuchiOverlay views={views} />
        {children}
      </div>
    </div>
  );
}
