/** Static map pin for a city (FE layout SSOT). Cities are never locked. */
export type JourneyCityPin = {
  slug: string;
  /** Display order on map / list. */
  position: number;
  /** Center on the board (0–1). */
  hotspot: { x: number; y: number };
  /** Hit box size as fraction of board (0–1). */
  hitW: number;
  hitH: number;
  /** Optional hub hero under public/. */
  coverSrc?: string;
};

export type JourneyCitiesConfig = {
  version: number;
  mapDimensions: { width: number; height: number };
  assetBasePath: string;
  /** Board image filename under assetBasePath/map/. */
  boardFile: string;
  cities: JourneyCityPin[];
};

export type CityMapView = {
  slug: string;
  position: number;
  hotspot: JourneyCityPin["hotspot"];
  hitW: number;
  hitH: number;
  coverSrc?: string;
  name: string;
  blurb?: string | null;
  storyCount: number;
  completedStoryCount: number;
  /** Prefer continue when learner has in-progress stories. */
  isCurrent: boolean;
};
