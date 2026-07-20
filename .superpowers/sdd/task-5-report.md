# Task 5 Report — Wire `/learn` → JourneyMapView

**Branch:** `feat/unit-1-journey-map`  
**Date:** 2026-07-20

## Status: Complete

## Deliverables

| File | Role |
|------|------|
| `src/components/learn/journey/JourneyMapView.tsx` | Derive views, header + canvas, toast tips, navigate to chapter |
| `src/components/learn/UnitLearnView.tsx` | Swap `TrialUnitHeader`/`TrialUnitPath` → `JourneyMapView`; keep soft-gate |
| `messages/en.json` | `Learn.Journey.*` keys |
| `messages/vi.json` | Vietnamese `Learn.Journey.*` (other dirty Landing keys left untouched) |

## Behavior

- `deriveLandmarkViews(UNIT_1_JOURNEY_MAP, skills, completedLessonIds)`
- Select landmark → `resolveChapterAccess`:
  - `coming_soon` / `locked` (no soft-gate) → `toast.message` (sonner)
  - `locked` + `onLockedLessonClick` → open `GuestSoftGateDialog`
  - `ok` → `router.push(/learn/chapter/${slug})` via `@/i18n/routing`
- Progress chip + reset + aria labels from `Learn.Journey.*`
- `TrialUnitPath.tsx` **not deleted** (rollback)

## Commit

```
feat(learn): replace unit path with journey map view
```

## Verification

```
bunx eslint src/components/learn/journey/JourneyMapView.tsx src/components/learn/UnitLearnView.tsx
→ exit 0

bun run test:journey-map
→ journey-map selftest OK
```

Manual: chapter route may 404 until Task 6 (expected).

## Concerns / follow-ups

1. `/learn/chapter/[slug]` 404 until Task 6 — intentional.
2. `messages/vi.json` also had pre-existing Landing footer EN strings; left in place per brief (not reverted).
3. MVP map is Unit 1 only (`UNIT_1_JOURNEY_MAP`); no multi-unit switch.
