import { DEFAULT_UNIT_ID } from "@/lib/learn-api";
import type { JourneyMapConfig } from "./types";

const V1 = "/images/learn/journey/unit-1/v1";

/**
 * Unit 1 — Puchi 2.5D Vietnam game board (v3 art).
 * 7 mainland blocks (N→S) + Phú Quốc, Hoàng Sa, Trường Sa.
 * Hotspots = region centers in JourneyMapConfig only (never from pixels).
 */
export const UNIT_1_JOURNEY_MAP: JourneyMapConfig = {
  unitId: DEFAULT_UNIT_ID,
  version: 3,
  mapDimensions: { width: 1024, height: 1024 },
  defaultViewport: { x: 0.5, y: 0.48, zoom: 1 },
  assetBasePath: V1,
  landmarks: [
    {
      slug: "hoan-kiem",
      skillId: "22222222-2222-2222-2222-222222222222",
      baseStatus: "unlocked",
      // Region 1 — northern wide teal block
      hotspot: { x: 0.48, y: 0.18 },
      visualSize: 96,
      hitArea: 112,
      assets: { hero: `${V1}/landmarks/hoan-kiem/hero.webp` },
    },
    {
      slug: "one-pillar-pagoda",
      baseStatus: "coming_soon",
      // Region 2 — coral/pink
      hotspot: { x: 0.48, y: 0.3 },
      visualSize: 80,
      hitArea: 96,
      assets: {},
    },
    {
      slug: "old-quarter",
      baseStatus: "coming_soon",
      // Region 3 — sand yellow
      hotspot: { x: 0.46, y: 0.4 },
      visualSize: 72,
      hitArea: 88,
      assets: {},
    },
    {
      slug: "coffee-shop",
      baseStatus: "coming_soon",
      // Region 4 — lavender (narrower mid)
      hotspot: { x: 0.48, y: 0.48 },
      visualSize: 64,
      hitArea: 80,
      assets: {},
    },
    {
      slug: "street-food",
      baseStatus: "coming_soon",
      // Region 5 — mint green
      hotspot: { x: 0.5, y: 0.56 },
      visualSize: 68,
      hitArea: 84,
      assets: {},
    },
    {
      slug: "bamboo-grove",
      baseStatus: "coming_soon",
      // Region 6 — peach
      hotspot: { x: 0.48, y: 0.66 },
      visualSize: 72,
      hitArea: 88,
      assets: {},
    },
    {
      slug: "traditional-bridge",
      baseStatus: "coming_soon",
      // Region 7 — southern blue tip
      hotspot: { x: 0.46, y: 0.78 },
      visualSize: 80,
      hitArea: 96,
      assets: {},
    },
    {
      slug: "phu-quoc",
      baseStatus: "coming_soon",
      hotspot: { x: 0.28, y: 0.84 },
      visualSize: 36,
      hitArea: 48,
      assets: {},
    },
    {
      slug: "hoang-sa",
      baseStatus: "coming_soon",
      hotspot: { x: 0.78, y: 0.38 },
      visualSize: 40,
      hitArea: 52,
      assets: {},
    },
    {
      slug: "truong-sa",
      baseStatus: "coming_soon",
      hotspot: { x: 0.82, y: 0.72 },
      visualSize: 40,
      hitArea: 52,
      assets: {},
    },
  ],
};

export function islandBaseSrc(config: JourneyMapConfig): string {
  return `${config.assetBasePath}/map/island-base.webp`;
}
