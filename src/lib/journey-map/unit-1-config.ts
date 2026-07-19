import { DEFAULT_UNIT_ID } from "@/lib/learn-api";
import type { JourneyMapConfig } from "./types";

const V1 = "/images/learn/journey/unit-1/v1";

/**
 * Unit 1 — Puchi 2.5D Vietnam game board (transparent art + CSS scene bg).
 * Hotspots = centers of the 7 mainland clay blocks (N→S).
 */
export const UNIT_1_JOURNEY_MAP: JourneyMapConfig = {
  unitId: DEFAULT_UNIT_ID,
  version: 4,
  mapDimensions: { width: 1024, height: 1024 },
  defaultViewport: { x: 0.5, y: 0.5, zoom: 1 },
  assetBasePath: V1,
  landmarks: [
    {
      slug: "hoan-kiem",
      skillId: "22222222-2222-2222-2222-222222222222",
      baseStatus: "unlocked",
      // North green
      hotspot: { x: 0.46, y: 0.17 },
      visualSize: 88,
      hitArea: 100,
      assets: { hero: `${V1}/landmarks/hoan-kiem/hero.webp` },
    },
    {
      slug: "one-pillar-pagoda",
      baseStatus: "coming_soon",
      // Coral / pink
      hotspot: { x: 0.49, y: 0.29 },
      visualSize: 72,
      hitArea: 84,
      assets: {},
    },
    {
      slug: "old-quarter",
      baseStatus: "coming_soon",
      // Sand yellow
      hotspot: { x: 0.46, y: 0.39 },
      visualSize: 68,
      hitArea: 80,
      assets: {},
    },
    {
      slug: "coffee-shop",
      baseStatus: "coming_soon",
      // Lavender
      hotspot: { x: 0.49, y: 0.49 },
      visualSize: 64,
      hitArea: 76,
      assets: {},
    },
    {
      slug: "street-food",
      baseStatus: "coming_soon",
      // Orange (curves east)
      hotspot: { x: 0.52, y: 0.58 },
      visualSize: 68,
      hitArea: 80,
      assets: {},
    },
    {
      slug: "bamboo-grove",
      baseStatus: "coming_soon",
      // Teal
      hotspot: { x: 0.48, y: 0.68 },
      visualSize: 70,
      hitArea: 82,
      assets: {},
    },
    {
      slug: "traditional-bridge",
      baseStatus: "coming_soon",
      // South blue tip
      hotspot: { x: 0.44, y: 0.8 },
      visualSize: 76,
      hitArea: 88,
      assets: {},
    },
  ],
};

/** Transparent cutout board — versioned for cache bust. */
export function islandBaseSrc(config: JourneyMapConfig): string {
  return `${config.assetBasePath}/map/island-base-v${config.version}.webp`;
}
