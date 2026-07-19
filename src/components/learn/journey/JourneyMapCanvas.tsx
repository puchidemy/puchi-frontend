"use client";

import Image from "next/image";
import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { RotateCcw } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { islandBaseSrc } from "@/lib/journey-map/unit-1-config";
import {
  loadJourneyViewport,
  saveJourneyViewport,
} from "@/lib/journey-map/viewport";
import type {
  DerivedLandmarkView,
  JourneyMapConfig,
  JourneyViewport,
} from "@/lib/journey-map/types";
import { JourneyHotspot } from "./JourneyHotspot";
import { JourneyPuchiOverlay } from "./JourneyPuchiOverlay";

const MIN_ZOOM = 0.8;
const MAX_ZOOM = 2.2;
/** Keep at least this many px of the map inside the container. */
const EDGE_MARGIN = 48;
const DRAG_THRESHOLD = 8;
const WHEEL_SAVE_MS = 180;

export type JourneyMapCanvasProps = {
  config: JourneyMapConfig;
  views: DerivedLandmarkView[];
  /** Tap a mainland region (large button). */
  onSelectRegion: (slug: string) => void;
  onHoverRegion?: (slug: string | null) => void;
  previewSlug?: string | null;
  getAriaLabel: (view: DerivedLandmarkView) => string;
  resetLabel?: string;
  className?: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/**
 * Viewport model: `x`/`y` are focal points in normalized map space (0–1).
 * Transform centers that point in the container at the given zoom.
 */
function clampViewport(
  vp: JourneyViewport,
  containerW: number,
  containerH: number,
  mapW: number,
  mapH: number,
): JourneyViewport {
  const zoom = clamp(vp.zoom, MIN_ZOOM, MAX_ZOOM);
  const sw = mapW * zoom;
  const sh = mapH * zoom;

  const txMin =
    sw <= containerW - 2 * EDGE_MARGIN
      ? (containerW - sw) / 2
      : containerW - EDGE_MARGIN - sw;
  const txMax =
    sw <= containerW - 2 * EDGE_MARGIN
      ? (containerW - sw) / 2
      : EDGE_MARGIN;

  const tyMin =
    sh <= containerH - 2 * EDGE_MARGIN
      ? (containerH - sh) / 2
      : containerH - EDGE_MARGIN - sh;
  const tyMax =
    sh <= containerH - 2 * EDGE_MARGIN
      ? (containerH - sh) / 2
      : EDGE_MARGIN;

  // tx = cw/2 - x*sw  →  x = (cw/2 - tx) / sw
  const xMin = (containerW / 2 - txMax) / sw;
  const xMax = (containerW / 2 - txMin) / sw;
  const yMin = (containerH / 2 - tyMax) / sh;
  const yMax = (containerH / 2 - tyMin) / sh;

  return {
    x: clamp(vp.x, Math.min(xMin, xMax), Math.max(xMin, xMax)),
    y: clamp(vp.y, Math.min(yMin, yMax), Math.max(yMin, yMax)),
    zoom,
  };
}

function viewportToTranslate(
  vp: JourneyViewport,
  containerW: number,
  containerH: number,
  mapW: number,
  mapH: number,
) {
  return {
    tx: containerW / 2 - vp.x * mapW * vp.zoom,
    ty: containerH / 2 - vp.y * mapH * vp.zoom,
  };
}

type PointerSample = { id: number; x: number; y: number };

function pinchDistance(a: PointerSample, b: PointerSample) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function pinchCenter(a: PointerSample, b: PointerSample) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function JourneyMapCanvas({
  config,
  views,
  onSelectRegion,
  onHoverRegion,
  previewSlug = null,
  getAriaLabel,
  resetLabel = "Reset view",
  className,
}: JourneyMapCanvasProps) {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [viewport, setViewport] = useState<JourneyViewport>(() =>
    loadJourneyViewport(config.unitId, config.defaultViewport),
  );
  const viewportRef = useRef(viewport);

  useEffect(() => {
    viewportRef.current = viewport;
  }, [viewport]);

  const pointersRef = useRef<Map<number, PointerSample>>(new Map());
  const panOriginRef = useRef<{
    x: number;
    y: number;
    vp: JourneyViewport;
  } | null>(null);
  const pinchOriginRef = useRef<{
    distance: number;
    center: { x: number; y: number };
    vp: JourneyViewport;
  } | null>(null);
  const dragMovedRef = useRef(false);
  const suppressClickRef = useRef(false);
  /** True after any pan/pinch change in the current gesture. */
  const gestureDirtyRef = useRef(false);
  const wheelSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { width: mapW, height: mapH } = config.mapDimensions;

  const applyViewport = useCallback(
    (next: JourneyViewport, persist: boolean) => {
      const el = containerRef.current;
      const w = el?.clientWidth ?? size.w;
      const h = el?.clientHeight ?? size.h;
      if (w <= 0 || h <= 0) {
        viewportRef.current = next;
        setViewport(next);
        return;
      }
      const clamped = clampViewport(next, w, h, mapW, mapH);
      viewportRef.current = clamped;
      setViewport(clamped);
      if (persist) {
        saveJourneyViewport(config.unitId, clamped);
      }
    },
    [config.unitId, mapW, mapH, size.w, size.h],
  );

  // Re-load when unit changes (MVP usually single unit; prefer key={unitId} remount).
  useEffect(() => {
    const loaded = loadJourneyViewport(
      config.unitId,
      config.defaultViewport,
    );
    startTransition(() => {
      const el = containerRef.current;
      const next =
        el && el.clientWidth > 0
          ? clampViewport(
              loaded,
              el.clientWidth,
              el.clientHeight,
              mapW,
              mapH,
            )
          : loaded;
      viewportRef.current = next;
      setViewport(next);
    });
  }, [config.unitId, config.defaultViewport, mapW, mapH]);

  // Observe container size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const sync = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      setSize({ w, h });
      setViewport((prev) => {
        const next = clampViewport(prev, w, h, mapW, mapH);
        viewportRef.current = next;
        return next;
      });
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [mapW, mapH]);

  useEffect(() => {
    return () => {
      if (wheelSaveTimer.current) clearTimeout(wheelSaveTimer.current);
    };
  }, []);

  const scheduleWheelSave = useCallback(() => {
    if (wheelSaveTimer.current) clearTimeout(wheelSaveTimer.current);
    wheelSaveTimer.current = setTimeout(() => {
      saveJourneyViewport(config.unitId, viewportRef.current);
    }, WHEEL_SAVE_MS);
  }, [config.unitId]);

  const zoomAtPoint = useCallback(
    (
      nextZoom: number,
      clientX: number,
      clientY: number,
      persist: boolean,
    ) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cw = rect.width;
      const ch = rect.height;
      const localX = clientX - rect.left;
      const localY = clientY - rect.top;
      const prev = viewportRef.current;
      const z = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);

      // Map point under cursor before zoom — keep it under cursor after.
      const { tx, ty } = viewportToTranslate(prev, cw, ch, mapW, mapH);
      const mapX = (localX - tx) / (mapW * prev.zoom);
      const mapY = (localY - ty) / (mapH * prev.zoom);
      applyViewport(
        {
          zoom: z,
          x: (cw / 2 - (localX - mapX * mapW * z)) / (mapW * z),
          y: (ch / 2 - (localY - mapY * mapH * z)) / (mapH * z),
        },
        persist,
      );
    },
    [applyViewport, mapW, mapH],
  );

  // Non-passive wheel so preventDefault can block page scroll while zooming.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.92 : 1.08;
      zoomAtPoint(
        viewportRef.current.zoom * factor,
        e.clientX,
        e.clientY,
        false,
      );
      scheduleWheelSave();
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [zoomAtPoint, scheduleWheelSave]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("[data-journey-reset]")) return;
    if (target.closest("[data-journey-hotspot]")) return;

    const sample = { id: e.pointerId, x: e.clientX, y: e.clientY };
    pointersRef.current.set(e.pointerId, sample);
    containerRef.current?.setPointerCapture(e.pointerId);

    dragMovedRef.current = false;
    suppressClickRef.current = false;
    if (pointersRef.current.size === 1) {
      gestureDirtyRef.current = false;
    }

    if (pointersRef.current.size === 1) {
      panOriginRef.current = {
        x: e.clientX,
        y: e.clientY,
        vp: { ...viewportRef.current },
      };
      pinchOriginRef.current = null;
    } else if (pointersRef.current.size === 2) {
      const pts = [...pointersRef.current.values()];
      pinchOriginRef.current = {
        distance: pinchDistance(pts[0], pts[1]),
        center: pinchCenter(pts[0], pts[1]),
        vp: { ...viewportRef.current },
      };
      panOriginRef.current = null;
    }
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
    });

    const el = containerRef.current;
    if (!el) return;
    const cw = el.clientWidth;
    const ch = el.clientHeight;

    if (pointersRef.current.size === 2 && pinchOriginRef.current) {
      const pts = [...pointersRef.current.values()];
      const dist = pinchDistance(pts[0], pts[1]);
      const origin = pinchOriginRef.current;
      if (origin.distance > 0) {
        const scale = dist / origin.distance;
        const nextZoom = clamp(
          origin.vp.zoom * scale,
          MIN_ZOOM,
          MAX_ZOOM,
        );
        const center = pinchCenter(pts[0], pts[1]);
        // Re-anchor pinch from original viewport each move for stability
        const rect = el.getBoundingClientRect();
        const localX = origin.center.x - rect.left;
        const localY = origin.center.y - rect.top;
        const { tx, ty } = viewportToTranslate(
          origin.vp,
          cw,
          ch,
          mapW,
          mapH,
        );
        const mapX = (localX - tx) / (mapW * origin.vp.zoom);
        const mapY = (localY - ty) / (mapH * origin.vp.zoom);
        const curLocalX = center.x - rect.left;
        const curLocalY = center.y - rect.top;
        applyViewport(
          {
            zoom: nextZoom,
            x: (cw / 2 - (curLocalX - mapX * mapW * nextZoom)) /
              (mapW * nextZoom),
            y: (ch / 2 - (curLocalY - mapY * mapH * nextZoom)) /
              (mapH * nextZoom),
          },
          false,
        );
        dragMovedRef.current = true;
        suppressClickRef.current = true;
        gestureDirtyRef.current = true;
      }
      return;
    }

    if (pointersRef.current.size === 1 && panOriginRef.current) {
      const origin = panOriginRef.current;
      const dx = e.clientX - origin.x;
      const dy = e.clientY - origin.y;
      if (
        Math.hypot(dx, dy) <= DRAG_THRESHOLD &&
        !dragMovedRef.current
      ) {
        return;
      }
      dragMovedRef.current = true;
      suppressClickRef.current = true;
      gestureDirtyRef.current = true;
      const z = origin.vp.zoom;
      applyViewport(
        {
          zoom: z,
          x: origin.vp.x - dx / (mapW * z),
          y: origin.vp.y - dy / (mapH * z),
        },
        false,
      );
    }
  };

  const endPointer = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.delete(e.pointerId);
    try {
      containerRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }

    if (pointersRef.current.size === 0) {
      if (gestureDirtyRef.current) {
        saveJourneyViewport(config.unitId, viewportRef.current);
      }
      panOriginRef.current = null;
      pinchOriginRef.current = null;
      gestureDirtyRef.current = false;
    } else if (pointersRef.current.size === 1) {
      const remaining = [...pointersRef.current.values()][0];
      panOriginRef.current = {
        x: remaining.x,
        y: remaining.y,
        vp: { ...viewportRef.current },
      };
      pinchOriginRef.current = null;
    }
  };

  const onReset = () => {
    applyViewport(config.defaultViewport, true);
  };

  const { tx, ty } =
    size.w > 0 && size.h > 0
      ? viewportToTranslate(viewport, size.w, size.h, mapW, mapH)
      : { tx: 0, ty: 0 };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-full min-h-0 w-full touch-none overflow-hidden bg-neutral-100 dark:bg-neutral-900",
        className,
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      role="application"
      aria-label="Journey map"
    >
      <div
        className="absolute left-0 top-0 will-change-transform"
        style={{
          width: mapW,
          height: mapH,
          transform: `translate(${tx}px, ${ty}px) scale(${viewport.zoom})`,
          transformOrigin: "0 0",
        }}
      >
        <Image
          src={islandBaseSrc(config)}
          alt=""
          width={mapW}
          height={mapH}
          className="pointer-events-none select-none"
          draggable={false}
          priority
        />
        {views.map((view) => (
          <JourneyHotspot
            key={view.slug}
            hotspot={view.hotspot}
            visualSize={view.visualSize}
            hitArea={view.hitArea}
            status={view.status}
            isCurrent={view.isCurrent}
            isPreviewed={previewSlug === view.slug}
            ariaLabel={getAriaLabel(view)}
            reduceMotion={!!reduceMotion}
            onSelect={() => {
              if (suppressClickRef.current) return;
              onSelectRegion(view.slug);
            }}
            onHoverStart={() => onHoverRegion?.(view.slug)}
            onHoverEnd={() => onHoverRegion?.(null)}
          />
        ))}
        <JourneyPuchiOverlay views={views} />
      </div>

      <Button
        type="button"
        data-journey-reset
        variant="default"
        size="sm"
        className="absolute bottom-3 right-3 z-30 gap-1.5 bg-background/90 shadow-sm backdrop-blur-sm"
        onClick={onReset}
        aria-label={resetLabel}
      >
        <RotateCcw className="h-4 w-4" />
        <span className="hidden sm:inline">{resetLabel}</span>
      </Button>
    </div>
  );
}
