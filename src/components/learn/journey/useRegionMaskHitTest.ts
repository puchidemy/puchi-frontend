"use client";

import { useEffect, useRef, useState } from "react";
import {
  loadRegionMask,
  regionMaskSrc,
  slugAtNormalized,
  type RegionMaskData,
} from "@/lib/journey-map/region-mask";
import type {
  DerivedLandmarkView,
  JourneyMapConfig,
} from "@/lib/journey-map/types";

/**
 * Pixel hit-test against region-mask. Board must be square + object-contain
 * over a square source (coords map 1:1).
 */
export function useRegionMaskHitTest(
  config: JourneyMapConfig,
  views: DerivedLandmarkView[],
) {
  const [mask, setMask] = useState<RegionMaskData | null>(null);
  const maskRef = useRef<RegionMaskData | null>(null);
  const viewsRef = useRef(views);

  useEffect(() => {
    viewsRef.current = views;
  }, [views]);

  useEffect(() => {
    let cancelled = false;
    const src = regionMaskSrc(config.assetBasePath, config.version);
    loadRegionMask(src)
      .then((data) => {
        if (cancelled) return;
        maskRef.current = data;
        setMask(data);
      })
      .catch(() => {
        if (cancelled) return;
        maskRef.current = null;
        setMask(null);
      });
    return () => {
      cancelled = true;
    };
  }, [config.assetBasePath, config.version]);

  const hitTest = (boardEl: HTMLElement, clientX: number, clientY: number) => {
    const rect = boardEl.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    const nx = (clientX - rect.left) / rect.width;
    const ny = (clientY - rect.top) / rect.height;

    const m = maskRef.current;
    if (m) return slugAtNormalized(m, nx, ny);

    // Fallback rects until mask loads
    for (const view of viewsRef.current) {
      const halfW = view.hitW / 2;
      const halfH = view.hitH / 2;
      if (
        nx >= view.hotspot.x - halfW &&
        nx <= view.hotspot.x + halfW &&
        ny >= view.hotspot.y - halfH &&
        ny <= view.hotspot.y + halfH
      ) {
        return view.slug;
      }
    }
    return null;
  };

  return { maskReady: mask != null, hitTest };
}
