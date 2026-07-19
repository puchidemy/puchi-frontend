import type { JourneyViewport } from "./types";

function key(unitId: string) {
  return `learn:journey:${unitId}:viewport`;
}

export function loadJourneyViewport(
  unitId: string,
  fallback: JourneyViewport,
): JourneyViewport {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = sessionStorage.getItem(key(unitId));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<JourneyViewport>;
    if (
      typeof parsed.x !== "number" ||
      typeof parsed.y !== "number" ||
      typeof parsed.zoom !== "number"
    ) {
      return fallback;
    }
    return { x: parsed.x, y: parsed.y, zoom: parsed.zoom };
  } catch {
    return fallback;
  }
}

export function saveJourneyViewport(
  unitId: string,
  viewport: JourneyViewport,
): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key(unitId), JSON.stringify(viewport));
  } catch {
    // QuotaExceededError / private mode — silent fail
  }
}
