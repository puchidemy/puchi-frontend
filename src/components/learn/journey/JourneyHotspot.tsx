"use client";

import { cn } from "@/lib/utils";
import type { RuntimeLandmarkStatus } from "@/lib/journey-map/types";

const MIN_HIT = 44;

const statusClass: Record<RuntimeLandmarkStatus, string> = {
  unlocked:
    "bg-primary shadow-[0_0_0_2px_rgba(255,255,255,0.85)] ring-2 ring-primary/35",
  completed:
    "bg-green-500 shadow-[0_0_0_2px_rgba(255,255,255,0.85)]",
  locked: "bg-neutral-400/85 opacity-75",
  coming_soon: "bg-neutral-400/65 opacity-60",
};

export type JourneyHotspotProps = {
  hotspot: { x: number; y: number };
  visualSize: number;
  hitArea: number;
  status: RuntimeLandmarkStatus;
  isCurrent?: boolean;
  ariaLabel: string;
  onSelect: () => void;
  /** Skip pulse when true (prefers-reduced-motion). */
  reduceMotion?: boolean;
};

export function JourneyHotspot({
  hotspot,
  visualSize,
  hitArea,
  status,
  isCurrent = false,
  ariaLabel,
  onSelect,
  reduceMotion = false,
}: JourneyHotspotProps) {
  const hit = Math.max(hitArea, MIN_HIT);
  const pulse =
    isCurrent && status === "unlocked" && !reduceMotion
      ? "animate-pulse"
      : undefined;

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className="absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      style={{
        left: `${hotspot.x * 100}%`,
        top: `${hotspot.y * 100}%`,
        width: hit,
        height: hit,
      }}
      onClick={onSelect}
    >
      <span
        className={cn(
          "mx-auto block rounded-full",
          statusClass[status],
          pulse,
        )}
        style={{ width: visualSize, height: visualSize }}
      />
    </button>
  );
}
