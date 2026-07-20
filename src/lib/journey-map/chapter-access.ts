import type { DerivedLandmarkView, JourneyMapConfig } from "./types";

export type ChapterAccess =
  | { ok: true; view: DerivedLandmarkView }
  | { ok: false; reason: "unknown_slug" | "locked" | "coming_soon" };

export function resolveChapterAccess(
  config: JourneyMapConfig,
  views: DerivedLandmarkView[],
  slug: string,
): ChapterAccess {
  if (!config.landmarks.some((l) => l.slug === slug)) {
    return { ok: false, reason: "unknown_slug" };
  }
  const view = views.find((v) => v.slug === slug);
  if (!view) return { ok: false, reason: "unknown_slug" };
  if (view.status === "coming_soon")
    return { ok: false, reason: "coming_soon" };
  if (view.status === "locked") return { ok: false, reason: "locked" };
  return { ok: true, view };
}
