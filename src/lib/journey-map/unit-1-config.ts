import { DEFAULT_UNIT_ID } from "@/lib/learn-api";
import type { JourneyMapConfig } from "./types";

const V1 = "/images/learn/journey/unit-1/v1";

export const UNIT_1_JOURNEY_MAP: JourneyMapConfig = {
  unitId: DEFAULT_UNIT_ID,
  version: 1,
  mapDimensions: { width: 2048, height: 2048 },
  defaultViewport: { x: 0.5, y: 0.42, zoom: 1 },
  assetBasePath: V1,
  landmarks: [
    {
      slug: "hoan-kiem",
      skillId: "22222222-2222-2222-2222-222222222222",
      baseStatus: "unlocked",
      hotspot: { x: 0.4, y: 0.15 },
      visualSize: 28,
      hitArea: 48,
      assets: { hero: `${V1}/landmarks/hoan-kiem/hero.png` },
    },
    {
      slug: "one-pillar-pagoda",
      baseStatus: "coming_soon",
      hotspot: { x: 0.5, y: 0.35 },
      visualSize: 24,
      hitArea: 48,
      assets: {},
    },
    {
      slug: "old-quarter",
      baseStatus: "coming_soon",
      hotspot: { x: 0.65, y: 0.22 },
      visualSize: 24,
      hitArea: 48,
      assets: {},
    },
    {
      slug: "coffee-shop",
      baseStatus: "coming_soon",
      hotspot: { x: 0.4, y: 0.48 },
      visualSize: 24,
      hitArea: 48,
      assets: {},
    },
    {
      slug: "street-food",
      baseStatus: "coming_soon",
      hotspot: { x: 0.65, y: 0.5 },
      visualSize: 24,
      hitArea: 48,
      assets: {},
    },
    {
      slug: "bamboo-grove",
      baseStatus: "coming_soon",
      hotspot: { x: 0.55, y: 0.58 },
      visualSize: 24,
      hitArea: 48,
      assets: {},
    },
    {
      slug: "traditional-bridge",
      baseStatus: "coming_soon",
      hotspot: { x: 0.45, y: 0.8 },
      visualSize: 24,
      hitArea: 48,
      assets: {},
    },
  ],
};

export function islandBaseSrc(config: JourneyMapConfig): string {
  return `${config.assetBasePath}/map/island-base.png`;
}
