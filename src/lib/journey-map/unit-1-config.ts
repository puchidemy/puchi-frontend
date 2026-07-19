import { DEFAULT_UNIT_ID } from "@/lib/learn-api";
import type { JourneyMapConfig } from "./types";

const V1 = "/images/learn/journey/unit-1/v1";

/**
 * Hotspot centers measured from island-base-v4 color bands (N→S).
 * hitW/hitH = fraction of the 1024 board.
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
      hotspot: { x: 0.43, y: 0.13 },
      hitW: 0.3,
      hitH: 0.14,
      assets: { hero: `${V1}/landmarks/hoan-kiem/hero.webp` },
    },
    {
      slug: "one-pillar-pagoda",
      baseStatus: "coming_soon",
      hotspot: { x: 0.41, y: 0.27 },
      hitW: 0.2,
      hitH: 0.1,
      assets: {},
    },
    {
      slug: "old-quarter",
      baseStatus: "coming_soon",
      hotspot: { x: 0.49, y: 0.39 },
      hitW: 0.16,
      hitH: 0.1,
      assets: {},
    },
    {
      slug: "coffee-shop",
      baseStatus: "coming_soon",
      hotspot: { x: 0.57, y: 0.51 },
      hitW: 0.14,
      hitH: 0.11,
      assets: {},
    },
    {
      slug: "street-food",
      baseStatus: "coming_soon",
      hotspot: { x: 0.58, y: 0.63 },
      hitW: 0.15,
      hitH: 0.11,
      assets: {},
    },
    {
      slug: "bamboo-grove",
      baseStatus: "coming_soon",
      hotspot: { x: 0.48, y: 0.75 },
      hitW: 0.22,
      hitH: 0.09,
      assets: {},
    },
    {
      slug: "traditional-bridge",
      baseStatus: "coming_soon",
      hotspot: { x: 0.41, y: 0.86 },
      hitW: 0.2,
      hitH: 0.1,
      assets: {},
    },
  ],
};

export function islandBaseSrc(config: JourneyMapConfig): string {
  return `${config.assetBasePath}/map/island-base-v${config.version}.webp`;
}
