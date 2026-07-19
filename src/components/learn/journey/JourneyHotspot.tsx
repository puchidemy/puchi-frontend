"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RuntimeLandmarkStatus } from "@/lib/journey-map/types";

const LOCK_SRC = "/images/learn/journey/ui/lock-3d.webp";

/** Marker size as fraction of the square board — scales with resize, no px min/max. */
const MARKER = 0.045;

export type JourneyHotspotProps = {
  hotspot: { x: number; y: number };
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
 * Lock/check marker + keyboard target.
 * Position/size are % of the board only (stable across breakpoints).
 * Mouse hit-testing uses region-mask on the board.
 */
export function JourneyHotspot({
  hotspot,
  status,
  isCurrent = false,
  isPreviewed = false,
  ariaLabel,
  onSelect,
  onHoverStart,
  onHoverEnd,
  reduceMotion = false,
}: JourneyHotspotProps) {
  const isLocked = status === "locked" || status === "coming_soon";
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
        "absolute z-15 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full pointer-events-none",
        "focus-visible:pointer-events-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        pulse,
        isCurrent && status === "unlocked" && "ring-2 ring-primary/35",
      )}
      style={{
        left: `${hotspot.x * 100}%`,
        top: `${hotspot.y * 100}%`,
        width: `${MARKER * 100}%`,
        height: `${MARKER * 100}%`,
      }}
      onClick={onSelect}
      onFocus={() => onHoverStart?.()}
      onBlur={() => onHoverEnd?.()}
    >
      {status === "completed" && (
        <Check
          className="h-[70%] w-[70%] text-emerald-700"
          strokeWidth={3}
          aria-hidden
        />
      )}
      {isLocked && (
        <Image
          src={LOCK_SRC}
          alt=""
          width={48}
          height={48}
          className="h-[85%] w-[85%] object-contain opacity-90"
          draggable={false}
          unoptimized
          aria-hidden
        />
      )}
    </button>
  );
}
