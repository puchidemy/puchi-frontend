"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RuntimeLandmarkStatus } from "@/lib/journey-map/types";

const LOCK_SRC = "/images/learn/journey/ui/lock-3d.webp";

const statusClass: Record<RuntimeLandmarkStatus, string> = {
  unlocked:
    "bg-transparent hover:bg-white/18 hover:ring-2 hover:ring-white/45",
  completed: "bg-emerald-400/18 ring-2 ring-emerald-300/55",
  locked: "bg-black/[0.07]",
  coming_soon: "bg-black/[0.05]",
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
        "absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[22%] transition-[transform,background-color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        statusClass[status],
        pulse,
        isCurrent &&
          status === "unlocked" &&
          "bg-primary/12 ring-2 ring-primary/40",
        isPreviewed && "z-20 bg-white/28 ring-2 ring-primary/50 scale-[1.03]",
        "hover:scale-[1.03]",
      )}
      style={{
        left: `${hotspot.x * 100}%`,
        top: `${hotspot.y * 100}%`,
        width: `${hitW * 100}%`,
        height: `${hitH * 100}%`,
      }}
      onClick={onSelect}
      onMouseEnter={() => onHoverStart?.()}
      onMouseLeave={() => onHoverEnd?.()}
      onFocus={() => onHoverStart?.()}
      onBlur={() => onHoverEnd?.()}
    >
      {status === "completed" && (
        <Check
          className="h-5 w-5 text-emerald-700 drop-shadow-sm sm:h-6 sm:w-6"
          strokeWidth={3}
          aria-hidden
        />
      )}
      {isLocked && (
        <Image
          src={LOCK_SRC}
          alt=""
          width={28}
          height={28}
          className="h-[22%] w-[22%] min-h-3.5 min-w-3.5 max-h-7 max-w-7 object-contain opacity-90 drop-shadow-sm"
          draggable={false}
          unoptimized
          aria-hidden
        />
      )}
    </button>
  );
}
