"use client";

import { cn } from "@/lib/utils";
import type { RuntimeLandmarkStatus } from "@/lib/journey-map/types";

const MIN_HIT = 44;

/**
 * Region overlay for the 2.5D board map.
 * Soft rounded block — highlight / glow / dim / lock via CSS (no art baked in).
 */
const statusClass: Record<RuntimeLandmarkStatus, string> = {
  unlocked:
    "bg-white/25 shadow-[0_4px_16px_rgba(0,0,0,0.12)] ring-2 ring-white/70 hover:bg-white/40 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.16)]",
  completed:
    "bg-emerald-400/35 shadow-[0_4px_14px_rgba(16,185,129,0.25)] ring-2 ring-emerald-300/80",
  locked: "bg-neutral-900/25 opacity-70",
  coming_soon: "bg-neutral-900/20 opacity-55",
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
      data-journey-hotspot
      aria-label={ariaLabel}
      className={cn(
        "absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[1.35rem] transition-[transform,box-shadow,background-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        statusClass[status],
        pulse,
        isCurrent &&
          status === "unlocked" &&
          "ring-primary/50 bg-primary/20 -translate-y-1 shadow-[0_10px_24px_rgba(0,0,0,0.18)]",
      )}
      style={{
        left: `${hotspot.x * 100}%`,
        top: `${hotspot.y * 100}%`,
        width: hit,
        height: Math.round(hit * 0.72),
        // visualSize reserved for future pin glyphs; region area uses hit
        minWidth: visualSize,
      }}
      onClick={onSelect}
    />
  );
}
