"use client";

import { cn } from "@/lib/utils";
import type { DerivedLandmarkView } from "@/lib/journey-map/types";
import { RegionPreviewCard } from "./RegionPreviewCard";

/** Card footprint (fraction of board) for clamp math. */
const CARD_W = 0.48;
const CARD_H = 0.52;
const GAP = 0.012;
const EDGE = 0.02;

function placeBeside(view: DerivedLandmarkView) {
  const halfW = view.hitW / 2;
  let placeRight = view.hotspot.x < 0.52;
  const rightEdge = view.hotspot.x + halfW + GAP;
  const leftEdge = view.hotspot.x - halfW - GAP;

  if (placeRight && rightEdge + CARD_W > 1 - EDGE) placeRight = false;
  if (!placeRight && leftEdge - CARD_W < EDGE) placeRight = true;

  // Center on hotspot, then push up near bottom so card isn't clipped.
  const halfH = CARD_H / 2;
  let top = view.hotspot.y;
  const minTop = EDGE + halfH;
  const maxTop = 1 - EDGE - halfH;
  // Extra lift for southern regions (preview taller than hotspot band).
  if (view.hotspot.y > 0.62) {
    top = Math.min(top, maxTop - 0.04);
  }
  if (view.hotspot.y > 0.78) {
    top = Math.min(top, maxTop - 0.08);
  }
  top = Math.min(Math.max(top, minTop), maxTop);

  return {
    placeRight,
    top,
    cardLeft: placeRight ? rightEdge : undefined,
    cardRight: placeRight ? undefined : 1 - leftEdge,
    bridgeLeft: placeRight
      ? view.hotspot.x
      : Math.max(0, leftEdge - 0.02),
    bridgeWidth: halfW + GAP + 0.02,
  };
}

export type RegionPreviewAnchorProps = {
  view: DerivedLandmarkView;
  onContinue: () => void;
  onDismiss?: () => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
};

/** Anchors preview beside the region so the pointer can slide across. */
export function RegionPreviewAnchor({
  view,
  onContinue,
  onDismiss,
  onPointerEnter,
  onPointerLeave,
}: RegionPreviewAnchorProps) {
  const p = placeBeside(view);

  return (
    <>
      <div
        aria-hidden
        data-journey-preview-bridge
        className="absolute z-35"
        style={{
          left: `${p.bridgeLeft * 100}%`,
          top: `${view.hotspot.y * 100}%`,
          width: `${p.bridgeWidth * 100}%`,
          height: `${Math.max(view.hitH, 0.16) * 100}%`,
          transform: "translateY(-50%)",
        }}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
      />
      <div
        className={cn(
          "absolute z-40 w-[min(23.5rem,48%)] max-w-[23.5rem]",
          "pointer-events-auto",
        )}
        style={{
          left: p.cardLeft != null ? `${p.cardLeft * 100}%` : undefined,
          right: p.cardRight != null ? `${p.cardRight * 100}%` : undefined,
          top: `${p.top * 100}%`,
          transform: "translateY(-50%)",
        }}
      >
        <RegionPreviewCard
          view={view}
          onContinue={onContinue}
          onDismiss={onDismiss}
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
          className="w-full max-w-none shadow-xl"
          compact
        />
      </div>
    </>
  );
}
