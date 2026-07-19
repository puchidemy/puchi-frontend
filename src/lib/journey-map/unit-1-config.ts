import { DEFAULT_UNIT_ID } from "@/lib/learn-api";
import type { JourneyMapConfig } from "./types";

const V1 = "/images/learn/journey/unit-1/v1";

/**
 * Unit 1 map: 2.5D pastel region board.
 * 7 mainland blocks (N→S) + Phú Quốc, Hoàng Sa, Trường Sa as island clusters.
 * Hotspots = region centers only (never inferred from pixels).
 */
export const UNIT_1_JOURNEY_MAP: JourneyMapConfig = {
  unitId: DEFAULT_UNIT_ID,
  version: 2,
  mapDimensions: { width: 1024, height: 1024 },
  defaultViewport: { x: 0.48, y: 0.5, zoom: 1 },
  assetBasePath: V1,
  landmarks: [
    {
      slug: "hoan-kiem",
      skillId: "22222222-2222-2222-2222-222222222222",
      baseStatus: "unlocked",
      hotspot: { x: 0.42, y: 0.16 },
      visualSize: 72,
      hitArea: 88,
      assets: { hero: `${V1}/landmarks/hoan-kiem/hero.webp` },
    },
    {
      slug: "one-pillar-pagoda",
      baseStatus: "coming_soon",
      hotspot: { x: 0.44, y: 0.28 },
      visualSize: 68,
      hitArea: 84,
      assets: {},
    },
    {
      slug: "old-quarter",
      baseStatus: "coming_soon",
      hotspot: { x: 0.42, y: 0.38 },
      visualSize: 68,
      hitArea: 84,
      assets: {},
    },
    {
      slug: "coffee-shop",
      baseStatus: "coming_soon",
      hotspot: { x: 0.44, y: 0.48 },
      visualSize: 68,
      hitArea: 84,
      assets: {},
    },
    {
      slug: "street-food",
      baseStatus: "coming_soon",
      hotspot: { x: 0.42, y: 0.58 },
      visualSize: 68,
      hitArea: 84,
      assets: {},
    },
    {
      slug: "bamboo-grove",
      baseStatus: "coming_soon",
      hotspot: { x: 0.42, y: 0.68 },
      visualSize: 68,
      hitArea: 84,
      assets: {},
    },
    {
      slug: "traditional-bridge",
      baseStatus: "coming_soon",
      hotspot: { x: 0.42, y: 0.8 },
      visualSize: 72,
      hitArea: 88,
      assets: {},
    },
    {
      slug: "phu-quoc",
      baseStatus: "coming_soon",
      // SW of southern tip
      hotspot: { x: 0.28, y: 0.86 },
      visualSize: 36,
      hitArea: 48,
      assets: {},
    },
    {
      slug: "hoang-sa",
      baseStatus: "coming_soon",
      // East of central Vietnam
      hotspot: { x: 0.72, y: 0.36 },
      visualSize: 40,
      hitArea: 52,
      assets: {},
    },
    {
      slug: "truong-sa",
      baseStatus: "coming_soon",
      // Further SE in the sea
      hotspot: { x: 0.78, y: 0.72 },
      visualSize: 40,
      hitArea: 52,
      assets: {},
    },
  ],
};

export function islandBaseSrc(config: JourneyMapConfig): string {
  return `${config.assetBasePath}/map/island-base.webp`;
}
