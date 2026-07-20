import type { JourneyCitiesConfig } from "./types";

const V1 = "/images/learn/journey/unit-1/v1";

/**
 * Journey Map — 8 cities, all interactive / unlocked.
 * Board: Vietnam diorama (same art pack as legacy island-base).
 * Hotspots are authored here (never inferred from pixels).
 */
export const JOURNEY_CITIES_MAP: JourneyCitiesConfig = {
  version: 1,
  mapDimensions: { width: 1024, height: 1024 },
  assetBasePath: V1,
  boardFile: "island-base-v6.webp",
  cities: [
    {
      slug: "hanoi",
      position: 1,
      hotspot: { x: 0.46, y: 0.16 },
      hitW: 0.14,
      hitH: 0.1,
      coverSrc: `${V1}/landmarks/hoan-kiem/hero.webp`,
    },
    {
      slug: "ha-long",
      position: 2,
      hotspot: { x: 0.58, y: 0.18 },
      hitW: 0.12,
      hitH: 0.09,
    },
    {
      slug: "hue",
      position: 3,
      hotspot: { x: 0.5, y: 0.4 },
      hitW: 0.12,
      hitH: 0.09,
    },
    {
      slug: "da-nang",
      position: 4,
      hotspot: { x: 0.56, y: 0.48 },
      hitW: 0.11,
      hitH: 0.08,
    },
    {
      slug: "hoi-an",
      position: 5,
      hotspot: { x: 0.52, y: 0.54 },
      hitW: 0.11,
      hitH: 0.08,
    },
    {
      slug: "hcmc",
      position: 6,
      hotspot: { x: 0.48, y: 0.72 },
      hitW: 0.13,
      hitH: 0.09,
    },
    {
      slug: "can-tho",
      position: 7,
      hotspot: { x: 0.42, y: 0.8 },
      hitW: 0.12,
      hitH: 0.09,
    },
    {
      slug: "phu-quoc",
      position: 8,
      hotspot: { x: 0.28, y: 0.86 },
      hitW: 0.12,
      hitH: 0.1,
    },
  ],
};

export function cityBoardSrc(config: JourneyCitiesConfig = JOURNEY_CITIES_MAP): string {
  return `${config.assetBasePath}/map/${config.boardFile}`;
}

export function isKnownCitySlug(slug: string): boolean {
  return JOURNEY_CITIES_MAP.cities.some((c) => c.slug === slug);
}

export function getCityPin(slug: string) {
  return JOURNEY_CITIES_MAP.cities.find((c) => c.slug === slug);
}
