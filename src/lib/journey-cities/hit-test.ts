import type { CityMapView } from "./types";

/** Axis-aligned hit test against city pins (no region-mask / no locks). */
export function slugAtCityHotspot(
  views: CityMapView[],
  nx: number,
  ny: number,
): string | null {
  if (nx < 0 || ny < 0 || nx > 1 || ny > 1) return null;

  let best: { slug: string; dist: number } | null = null;
  for (const view of views) {
    const halfW = view.hitW / 2;
    const halfH = view.hitH / 2;
    if (
      nx < view.hotspot.x - halfW ||
      nx > view.hotspot.x + halfW ||
      ny < view.hotspot.y - halfH ||
      ny > view.hotspot.y + halfH
    ) {
      continue;
    }
    const dx = nx - view.hotspot.x;
    const dy = ny - view.hotspot.y;
    const dist = dx * dx + dy * dy;
    if (!best || dist < best.dist) {
      best = { slug: view.slug, dist };
    }
  }
  return best?.slug ?? null;
}
