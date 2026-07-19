"use client";

import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RuntimeLandmarkStatus } from "@/lib/journey-map/types";

const statusClass: Record<RuntimeLandmarkStatus, string> = {
  unlocked: "bg-transparent ring-0 hover:bg-white/20 hover:ring-2 hover:ring-white/50",
  completed: "bg-emerald-400/20 ring-2 ring-emerald-300/60",
  locked: "bg-black/20",
  coming_soon: "bg-black/15",
};

export type JourneyHotspotProps = {
  hotspot: { x: number; y: number };
  hitW: number;
  hitH: number;
  status: RuntimeLandmarkStatus;
  isCurrent?: boolean;
  isPreviewed?: boolean;
  ariaLabel: string;
  onSelect: () => void;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  reduceMotion?: boolean;
};

/**
 * Region hit box — no translate on hover (avoids “đẩy xuống”).
 * Uses scale/ring only so lock stays aligned with the clay block.
 */
export function JourneyHotspot({
  hotspot,
  hitW,
  hitH,
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
        "absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[22%] transition-[transform,box-shadow,background-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        statusClass[status],
        pulse,
        isCurrent &&
          status === "unlocked" &&
          "bg-primary/15 ring-2 ring-primary/45",
        isPreviewed && canPreview && "z-20 bg-white/30 ring-2 ring-primary/55 scale-[1.03]",
        canPreview && "hover:scale-[1.03]",
      )}
      style={{
        left: `${hotspot.x * 100}%`,
        top: `${hotspot.y * 100}%`,
        width: `${hitW * 100}%`,
        height: `${hitH * 100}%`,
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
          className="h-5 w-5 text-emerald-700 drop-shadow-sm sm:h-6 sm:w-6"
          strokeWidth={3}
          aria-hidden
        />
      )}
      {(status === "locked" || status === "coming_soon") && (
        <Lock
          className="h-4 w-4 text-white drop-shadow sm:h-5 sm:w-5"
          strokeWidth={2.5}
          aria-hidden
        />
      )}
    </button>
  );
}
