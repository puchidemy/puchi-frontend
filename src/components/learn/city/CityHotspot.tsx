"use client";

import { cn } from "@/lib/utils";

/** Marker size as fraction of the square board. */
const MARKER = 0.042;

export type CityHotspotProps = {
  hotspot: { x: number; y: number };
  isCurrent?: boolean;
  isPreviewed?: boolean;
  ariaLabel: string;
  onSelect: () => void;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
  reduceMotion?: boolean;
};

/**
 * Always-open city pin (no lock states).
 * Mouse hit-testing uses box hotspots on the board; this is keyboard + visual.
 */
export function CityHotspot({
  hotspot,
  isCurrent = false,
  isPreviewed = false,
  ariaLabel,
  onSelect,
  onHoverStart,
  onHoverEnd,
  reduceMotion = false,
}: CityHotspotProps) {
  const pulse =
    isCurrent && !reduceMotion && !isPreviewed ? "animate-pulse" : undefined;

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
        isCurrent && "ring-2 ring-primary/40",
        isPreviewed && "scale-110",
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
      <span
        className={cn(
          "h-[55%] w-[55%] rounded-full border-2 border-white shadow-md",
          isPreviewed || isCurrent ? "bg-primary" : "bg-emerald-600",
        )}
        aria-hidden
      />
    </button>
  );
}
