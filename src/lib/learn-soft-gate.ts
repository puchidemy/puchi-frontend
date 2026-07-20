/**
 * Guest soft-gate (Story-first):
 * - Guests may freely try Hanoi (`hanoi` / package `ha-noi`).
 * - Other cities require sign-in to continue learning.
 *
 * Scene-count limits are no longer used for mid-story blocking.
 */

/** Journey map / API `city_slug` values guests may try freely. */
export const GUEST_FREE_CITY_SLUGS = new Set(["hanoi"]);

/** Package `citySlug` values that map to the free trial city. */
export const GUEST_FREE_PACKAGE_CITY_SLUGS = new Set(["ha-noi"]);

/**
 * @deprecated Prefer city-based gating via {@link isGuestFreeCitySlug}.
 * Kept so older imports do not break; not used for mid-story limits.
 */
export const GUEST_SOFT_GATE_SCENE_LIMIT = Number.POSITIVE_INFINITY;

/** True when guests may play this city without a login wall. */
export function isGuestFreeCitySlug(
  slug: string | null | undefined,
): boolean {
  if (!slug) return false;
  return (
    GUEST_FREE_CITY_SLUGS.has(slug) || GUEST_FREE_PACKAGE_CITY_SLUGS.has(slug)
  );
}

/** Guests hit soft-gate when the city is outside the free trial set. */
export function guestRequiresLoginForCity(
  slug: string | null | undefined,
): boolean {
  // Missing slug → do not infer a block (callers pass journey/package slug when gating).
  if (!slug) return false;
  return !isGuestFreeCitySlug(slug);
}
