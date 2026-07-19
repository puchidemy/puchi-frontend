"use client";

import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RuntimeLandmarkStatus } from "@/lib/journey-map/types";

const MIN_HIT = 44;

const statusClass: Record<RuntimeLandmarkStatus, string> = {
  unlocked:
    "bg-white/10 ring-2 ring-white/40 hover:bg-white/25 hover:-translate-y-1 hover:shadow-[0_10px_22px_rgba(0,0,0,0.12)]",
  completed: "bg-emerald-400/25 ring-2 ring-emerald-300/65",
  locked: "bg-black/25",
  coming_soon: "bg-black/20",
};

export type JourneyHotspotProps = {
  hotspot: { x: number; y: number };
  visualSize: number;
  hitArea: number;
  status: RuntimeLandmarkStatus;
  isCurrent?: boolean;
  isPreviewed?: boolean;
  ariaLabel: string;
  onSelect: () => void;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  reduceMotion?: boolean;
};

/** Hit overlay sized in % of the board box so it scales with full-height fit. */
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
  const canPreview = status === "unlocked" || status === "completed";
  // Convert design px (@1024 board) → % of board so full-height scale stays aligned
  const wPct = (Math.max(hitArea, visualSize, MIN_HIT) / 1024) * 100;
  const hPct = wPct * 0.62;
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
        "absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[18%] transition-[transform,box-shadow,background-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        statusClass[status],
        pulse,
        isCurrent &&
          status === "unlocked" &&
          "ring-primary/50 bg-primary/15 shadow-md",
        isPreviewed &&
          canPreview &&
          "-translate-y-[6%] bg-white/35 shadow-lg ring-primary/55",
      )}
      style={{
        left: `${hotspot.x * 100}%`,
        top: `${hotspot.y * 100}%`,
        width: `${wPct}%`,
        height: `${hPct}%`,
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
          className="h-[28%] w-[28%] min-h-3.5 min-w-3.5 text-emerald-700 drop-shadow-sm"
          strokeWidth={3}
          aria-hidden
        />
      )}
      {(status === "locked" || status === "coming_soon") && (
        <Lock
          className="h-[26%] w-[26%] min-h-3.5 min-w-3.5 text-white/90 drop-shadow"
          strokeWidth={2.5}
          aria-hidden
        />
      )}
    </button>
  );
}
