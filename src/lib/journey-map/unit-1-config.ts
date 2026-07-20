import { DEFAULT_UNIT_ID } from "@/lib/learn-api";
import type { JourneyMapConfig } from "./types";

const V1 = "/images/learn/journey/unit-1/v1";

/**
 * hotspot = region-mask bounding-box center (lock/check + preview anchor).
 * Pointer hit uses map/region-mask-v{version}.png — not hitW/hitH.
 * hitW/hitH only for mask-load fallback + preview placement heuristics.
 */
export const UNIT_1_JOURNEY_MAP: JourneyMapConfig = {
  unitId: DEFAULT_UNIT_ID,
  version: 6,
  mapDimensions: { width: 1024, height: 1024 },
  defaultViewport: { x: 0.5, y: 0.5, zoom: 1 },
  assetBasePath: V1,
  landmarks: [
    {
      slug: "hoan-kiem",
      skillId: "22222222-2222-2222-2222-222222222222",
      baseStatus: "unlocked",
      hotspot: { x: 0.4248, y: 0.1333 },
      hitW: 0.3,
      hitH: 0.14,
      assets: { hero: `${V1}/landmarks/hoan-kiem/hero.webp` },
    },
    {
      slug: "one-pillar-pagoda",
      baseStatus: "coming_soon",
      hotspot: { x: 0.4072, y: 0.2651 },
      hitW: 0.2,
      hitH: 0.1,
      assets: {},
    },
    {
      slug: "old-quarter",
      baseStatus: "coming_soon",
      hotspot: { x: 0.4902, y: 0.3765 },
      hitW: 0.16,
      hitH: 0.1,
      assets: {},
    },
    {
      slug: "coffee-shop",
      baseStatus: "coming_soon",
      hotspot: { x: 0.5381, y: 0.5337 },
      hitW: 0.14,
      hitH: 0.11,
      assets: {},
    },
    {
      slug: "street-food",
      baseStatus: "coming_soon",
      hotspot: { x: 0.5713, y: 0.627 },
      hitW: 0.15,
      hitH: 0.11,
      assets: {},
    },
    {
      slug: "bamboo-grove",
      baseStatus: "coming_soon",
      hotspot: { x: 0.459, y: 0.7271 },
      hitW: 0.22,
      hitH: 0.09,
      assets: {},
    },
    {
      slug: "traditional-bridge",
      baseStatus: "coming_soon",
      hotspot: { x: 0.4316, y: 0.8423 },
      hitW: 0.2,
      hitH: 0.1,
      assets: {},
    },
  ],
};

export function islandBaseSrc(config: JourneyMapConfig): string {
  return `${config.assetBasePath}/map/island-base-v${config.version}.webp`;
}
