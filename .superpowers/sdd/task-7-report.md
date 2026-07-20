# Task 7 Report — Polish + verification

**Branch:** `feat/unit-1-journey-map`  
**Date:** 2026-07-20

## Status: Complete

No journey-map code changes required. Selftest, ESLint, and `next build` all passed. FooterLink working-tree regression (hardcoded EN, undoing Task 5 i18n) was discarded — not committed.

## CLI verification

| Check | Command | Result |
|-------|---------|--------|
| Selftest | `bun src/lib/journey-map/selftest.ts` | `journey-map selftest OK` |
| Lint (project) | `bun run lint` | exit 0 (baseline-browser-mapping stale warning only) |
| Lint (journey scope) | `bunx eslint` on `journey/**`, `journey-map/**`, `learn/**` pages | exit 0 |
| Build | `bun run build` | exit 0 — compiled; routes include `/[locale]/learn` + `/[locale]/learn/chapter/[landmarkSlug]` |

**Note:** Next build log shows `Skipping validation of types`. Pre-existing tsc issues elsewhere (e.g. dictation) were not exercised; journey files lint clean and build includes journey routes.

## Manual QA checklist

| # | Criterion | Result | How verified |
|---|-----------|--------|--------------|
| 1 | `/learn` is diorama, not zigzag buttons | **CLI/code** ✓ | `UnitLearnView` renders `JourneyMapView` + `JourneyMapCanvas` (map + hotspots); no zigzag path UI |
| 2 | Pan/zoom + Reset; Back from chapter restores viewport | **CLI/code** ✓ / **browser** needed for feel | Canvas: pan/pinch/wheel + Reset; `saveJourneyViewport` / `loadJourneyViewport` (sessionStorage). Back → `/learn` remount. Interactive pan feel = browser |
| 3 | Hotspot visual small but hit ≥ 44px | **CLI/code** ✓ | Config `visualSize` 24–28, `hitArea` 48; `JourneyHotspot` `Math.max(hitArea, MIN_HIT=44)` |
| 4 | Puchi 2D only on map; KV may differ | **CLI/code** ✓ | `JourneyPuchiOverlay` 2D asset on map; chapter/KV can use separate hero (`view.assets.hero`) |
| 5 | 6 coming_soon tips via toast (URL clean) | **CLI/code** ✓ / **browser** for toast UI | Config: 6 landmarks `baseStatus: "coming_soon"`; select → `toast.message` + no URL tip; selftest blocks `bamboo-grove` |
| 6 | Chapter Continue / Review for 0/3, 1/3, 3/3 | **CLI/code** ✓ / **browser** for labels | Selftest: 0/3 unlocked+current, 1/3 unlocked+current, 3/3 completed; CTA: `completed` → Review else Continue |
| 7 | Guest soft-gate at lesson 4 | **CLI/code** ✓ / **browser** for dialog | `GUEST_SOFT_GATE_LIMIT = 3` in `UnitLearnView` + `ChapterView`; gate on Continue/incomplete when `completedLessonIds.length >= 3` |
| 8 | `prefers-reduced-motion` stops bounce/pulse | **CLI/code** ✓ / **browser** for OS setting | `useReducedMotion` → no `animate-pulse` / `animate-bounce-slow` |
| 9 | Mobile + desktop no horizontal page scroll bleed | **CLI/code** partial / **browser** required | Canvas `overflow-hidden` + `touch-none`; full scroll-bleed check needs mobile/desktop browser |

### Legend

- **CLI/code** — verified via selftest, lint, build, and/or static review of journey sources
- **browser** — needs interactive pass in a real browser (not run in this task)

## Commit

```
chore(learn): verify journey map build and document QA
```

(No UX polish diff; verification + SDD report only.)

## Concerns / follow-ups

1. Manual browser QA items 2, 5–9 (feel, toast, soft-gate dialog, reduced-motion, scroll bleed) still recommended before merge.
2. Next build skips TypeScript validation — run `tsc --noEmit` separately if CI does not; do not expand into unrelated modules unless journey code fails.
3. Transient uncommitted `FooterLink.tsx` hardcode-EN change was reverted to keep Task 5 i18n fix.

---

## Final-review must-fix (2026-07-20)

**Status:** Complete

Applied two must-fix items from final review: hardened `saveJourneyViewport` against sessionStorage failures, and converted journey art to WebP while keeping PNG sources for transition.

### Changes

| Item | File | Change |
|------|------|--------|
| Viewport hardening | `src/lib/journey-map/viewport.ts` | `sessionStorage.setItem` wrapped in try/catch (silent fail on QuotaExceeded / private mode) |
| Asset format | `src/lib/journey-map/unit-1-config.ts` | `hero.webp`, `islandBaseSrc()` → `island-base.webp` |
| WebP assets | `public/images/learn/journey/unit-1/v1/**` | Added `.webp` via `npx sharp-cli -f webp`; PNGs retained |

### Asset size (PNG → WebP)

| Asset | PNG (bytes) | WebP (bytes) | Saved |
|-------|-------------|--------------|-------|
| `key-visual/vietnam-diorama-kv` | 1,726,074 | 146,840 | −91.5% |
| `map/island-base` | 1,680,420 | 130,752 | −92.2% |
| `landmarks/hoan-kiem/hero` | 2,306,235 | 185,016 | −92.0% |
| **Total** | **5,712,729** | **462,608** | **−91.9%** |

### Test

| Check | Command | Result |
|-------|---------|--------|
| Journey selftest | `bun run test:journey-map` | `journey-map selftest OK` (exit 0) |

### Commit

```
fix(learn): harden viewport save and serve journey art as webp
```
