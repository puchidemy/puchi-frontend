"use client";

import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RuntimeLandmarkStatus } from "@/lib/journey-map/types";

const MIN_HIT = 44;

/**
 * Large region hit-target overlay. Art has no pins/labels.
 * Lift/glow/dim/check via CSS for game-board interaction.
 */
const statusClass: Record<RuntimeLandmarkStatus, string> = {
  unlocked:
    "bg-white/15 ring-2 ring-white/50 hover:bg-white/30 hover:-translate-y-1 hover:shadow-[0_10px_22px_rgba(0,0,0,0.14)]",
  completed:
    "bg-emerald-400/28 ring-2 ring-emerald-300/70",
  locked: "bg-neutral-900/28 opacity-70",
  coming_soon: "bg-neutral-900/22 opacity-55",
};

export type JourneyHotspotProps = {
  hotspot: { x: number; y: number };
  visualSize: number;
  hitArea: number;
  status: RuntimeLandmarkStatus;
  isCurrent?: boolean;
  /** Hover or tap-selected preview */
  isPreviewed?: boolean;
  ariaLabel: string;
  onSelect: () => void;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  reduceMotion?: boolean;
};

export function JourneyHotspot({
  hotspot,
  visualSize,
  hitArea,
  status,
  isCurrent = false,
  isPreviewed = false,
  ariaLabel,
  onSelect,
  onHoverStart,
  onHoverEnd,
  reduceMotion = false,
}: JourneyHotspotProps) {
  const w = Math.max(hitArea, visualSize, MIN_HIT);
  const h = Math.round(w * 0.58);
  const canPreview = status === "unlocked" || status === "completed";
  const pulse =
    isCurrent && status === "unlocked" && !reduceMotion && !isPreviewed
      ? "animate-pulse"
      : undefined;

  return (
    <button
      type="button"
      data-journey-hotspot
      aria-label={ariaLabel}
      aria-expanded={isPreviewed || undefined}
      className={cn(
        "absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[1.5rem] transition-[transform,box-shadow,background-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        statusClass[status],
        pulse,
        isCurrent &&
          status === "unlocked" &&
          "ring-primary/55 bg-primary/20 shadow-[0_8px_20px_rgba(0,0,0,0.12)]",
        isPreviewed &&
          canPreview &&
          "-translate-y-2 bg-white/40 shadow-[0_14px_28px_rgba(0,0,0,0.18)] ring-primary/60",
      )}
      style={{
        left: `${hotspot.x * 100}%`,
        top: `${hotspot.y * 100}%`,
        width: w,
        height: h,
      }}
      onClick={onSelect}
      onMouseEnter={() => {
        if (canPreview) onHoverStart?.();
      }}
      onMouseLeave={() => onHoverEnd?.()}
      onFocus={() => {
        if (canPreview) onHoverStart?.();
      }}
      onBlur={() => onHoverEnd?.()}
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
