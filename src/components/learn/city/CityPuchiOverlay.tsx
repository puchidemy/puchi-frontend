"use client";

import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { CityMapView } from "@/lib/journey-cities";

const MASCOT_SRC = "/images/mascot/puchi_welcome_v2.png";
const MASCOT_FALLBACK_SRC = "/images/mascot/puchi_student_beginner.png";
const OVERLAY_W_PCT = 7;
const OFFSET_X = 0.07;

export type CityPuchiOverlayProps = {
  views: CityMapView[];
};

export function CityPuchiOverlay({ views }: CityPuchiOverlayProps) {
  const reduceMotion = useReducedMotion();
  const [mascotSrc, setMascotSrc] = useState(MASCOT_SRC);
  const current = views.find((v) => v.isCurrent) ?? views[0];
  if (!current) return null;

  return (
    <div
      className={cn(
        "pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2",
        !reduceMotion && "animate-bounce-slow",
      )}
      style={{
        left: `${(current.hotspot.x + OFFSET_X) * 100}%`,
        top: `${current.hotspot.y * 100}%`,
        width: `${OVERLAY_W_PCT}%`,
        aspectRatio: "1",
      }}
      aria-hidden
    >
      <Image
        src={mascotSrc}
        alt=""
        fill
        className="object-contain"
        draggable={false}
        unoptimized
        onError={() => {
          if (mascotSrc !== MASCOT_FALLBACK_SRC) {
            setMascotSrc(MASCOT_FALLBACK_SRC);
          }
        }}
      />
    </div>
  );
}
