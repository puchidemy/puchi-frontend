"use client";

import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RuntimeLandmarkStatus } from "@/lib/journey-map/types";

const MIN_HIT = 44;

/**
 * Transparent CSS overlay on the 2.5D board — art stays pin/label-free.
 * States: hover lift, glow (current), dim (locked/soon), check (completed).
 */
const statusClass: Record<RuntimeLandmarkStatus, string> = {
  unlocked:
    "bg-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.1)] ring-2 ring-white/60 hover:bg-white/35 hover:-translate-y-1 hover:shadow-[0_10px_22px_rgba(0,0,0,0.14)]",
  completed:
    "bg-emerald-400/30 shadow-[0_4px_14px_rgba(16,185,129,0.22)] ring-2 ring-emerald-300/75",
  locked: "bg-neutral-900/28 opacity-70",
  coming_soon: "bg-neutral-900/22 opacity-55",
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
  const w = Math.max(hitArea, visualSize, MIN_HIT);
  const h = Math.round(w * 0.58);
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
        "absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[1.5rem] transition-[transform,box-shadow,background-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        statusClass[status],
        pulse,
        isCurrent &&
          status === "unlocked" &&
          "ring-primary/55 bg-primary/25 -translate-y-1.5 shadow-[0_12px_26px_rgba(0,0,0,0.16)]",
      )}
      style={{
        left: `${hotspot.x * 100}%`,
        top: `${hotspot.y * 100}%`,
        width: w,
        height: h,
      }}
      onClick={onSelect}
    >
      {status === "completed" && (
        <Check
          className="h-5 w-5 text-emerald-700 drop-shadow-sm"
          strokeWidth={3}
          aria-hidden
        />
      )}
      {(status === "locked" || status === "coming_soon") && (
        <Lock
          className="h-4 w-4 text-white/80 drop-shadow-sm"
          strokeWidth={2.5}
          aria-hidden
        />
      )}
    </button>
  );
}
