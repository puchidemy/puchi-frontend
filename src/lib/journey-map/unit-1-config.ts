import { DEFAULT_UNIT_ID } from "@/lib/learn-api";
import type { JourneyMapConfig } from "./types";

const V1 = "/images/learn/journey/unit-1/v1";

/**
 * Unit 1 — Puchi 2.5D Vietnam game board.
 *
 * Hierarchy: Journey → Region → Chapter → Lessons
 *
 * Interactive: 7 mainland regions only.
 * Phú Quốc / Hoàng Sa / Trường Sa are decorative on the art (not in this list).
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
      hotspot: { x: 0.48, y: 0.18 },
      visualSize: 96,
      hitArea: 112,
      assets: { hero: `${V1}/landmarks/hoan-kiem/hero.webp` },
    },
    {
      slug: "one-pillar-pagoda",
      baseStatus: "coming_soon",
      hotspot: { x: 0.48, y: 0.3 },
      visualSize: 80,
      hitArea: 96,
      assets: {},
    },
    {
      slug: "old-quarter",
      baseStatus: "coming_soon",
      hotspot: { x: 0.46, y: 0.4 },
      visualSize: 72,
      hitArea: 88,
      assets: {},
    },
    {
      slug: "coffee-shop",
      baseStatus: "coming_soon",
      hotspot: { x: 0.48, y: 0.48 },
      visualSize: 64,
      hitArea: 80,
      assets: {},
    },
    {
      slug: "street-food",
      baseStatus: "coming_soon",
      hotspot: { x: 0.5, y: 0.56 },
      visualSize: 68,
      hitArea: 84,
      assets: {},
    },
    {
      slug: "bamboo-grove",
      baseStatus: "coming_soon",
      hotspot: { x: 0.48, y: 0.66 },
      visualSize: 72,
      hitArea: 88,
      assets: {},
    },
    {
      slug: "traditional-bridge",
      baseStatus: "coming_soon",
      hotspot: { x: 0.46, y: 0.78 },
      visualSize: 80,
      hitArea: 96,
      assets: {},
    },
  ],
};

export function islandBaseSrc(config: JourneyMapConfig): string {
  return `${config.assetBasePath}/map/island-base.webp`;
}
