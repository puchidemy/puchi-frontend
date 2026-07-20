/**
 * Legacy landmark / chapter slugs → Story-first city.
 * All Unit-1 landmarks lived in Hà Nội; unknown → null (redirect to map).
 */
const LANDMARK_TO_CITY: Record<string, string> = {
  "hoan-kiem": "hanoi",
  "one-pillar-pagoda": "hanoi",
  "old-quarter": "hanoi",
  "coffee-shop": "hanoi",
  "street-food": "hanoi",
  "bamboo-grove": "hanoi",
  "traditional-bridge": "hanoi",
  // Already-city slugs (idempotent)
  hanoi: "hanoi",
  "ha-long": "ha-long",
  hue: "hue",
  "hoi-an": "hoi-an",
  "da-nang": "da-nang",
  hcmc: "hcmc",
  "can-tho": "can-tho",
  "phu-quoc": "phu-quoc",
};

/** Resolve deprecated `/learn/chapter/[regionSlug]` → city slug, or null. */
export function resolveChapterToCitySlug(regionSlug: string): string | null {
  return LANDMARK_TO_CITY[regionSlug] ?? null;
}
