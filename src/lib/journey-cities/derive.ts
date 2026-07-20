import { JOURNEY_CITIES_MAP } from "./cities-config";
import type { CityMapView, JourneyCitiesConfig } from "./types";

export type CityProgressHint = {
  slug: string;
  name?: string;
  blurb?: string | null;
  storyCount?: number;
  completedStoryCount?: number;
};

/**
 * Merge static map pins with optional API city metadata.
 * All cities remain open — no lock / coming_soon status.
 */
export function deriveCityMapViews(
  apiCities: CityProgressHint[] = [],
  config: JourneyCitiesConfig = JOURNEY_CITIES_MAP,
): CityMapView[] {
  const bySlug = new Map(apiCities.map((c) => [c.slug, c]));

  return config.cities.map((pin) => {
    const api = bySlug.get(pin.slug);
    const storyCount = api?.storyCount ?? 0;
    const completedStoryCount = api?.completedStoryCount ?? 0;
    return {
      slug: pin.slug,
      position: pin.position,
      hotspot: pin.hotspot,
      hitW: pin.hitW,
      hitH: pin.hitH,
      coverSrc: pin.coverSrc,
      name: api?.name ?? pin.slug,
      blurb: api?.blurb ?? null,
      storyCount,
      completedStoryCount,
      isCurrent: storyCount > 0 && completedStoryCount < storyCount,
    };
  });
}
