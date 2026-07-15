# P4 FE: Achievements Server Actions — Report

## Summary

Implementation of achievements server action and its integration into the profile data hook.

## Changes

### 1. Created `src/actions/profile/get-achievements.ts`

New server action following the existing `get-profile.ts` pattern:

- Uses `"use server"` directive
- `backendFetch` to `GET /v1/profile/achievements`
- Returns `ActionResult<AchievementItem[]>` with proper error handling via `getErrorI18nKey`
- `AchievementItem` interface mirrors the `Achievement` type from `@/types/profile`
  - Fields: `id`, `title`, `description`, `icon`, `color`, `progress`, `progressLabel`, `unlocked`, `unlockedAt?`

### 2. Updated `src/hooks/use-profile-data.ts`

Added achievement fetching alongside existing data fetchers:

- Imported `getAchievements` from the new action
- Added `getAchievements()` call to `Promise.allSettled` in parallel with `getProfile`, `getFollowing`, `getFollowers`, `getLeaderboard`
- Added result handling block: on success, spreads `achievementsResult.value.data` directly into the profile state
- No mapping needed — `AchievementItem` shape is identical to `Achievement`

## TypeScript Verification

- `bun tsc --noEmit`: **0 new errors** introduced
- All existing errors are pre-existing in the codebase (dictation route params, motion variants, type mismatches in other components)
- No errors in the two changed files

## Architecture Notes

- The `AchievementItem` (action layer) and `Achievement` (type layer) are structurally identical. This is intentional — the action defines its own interface to avoid coupling to the type layer while maintaining compatibility.
- Achievements are fetched in parallel with other profile data, consistent with the existing pattern. On failure, the mock data from `mockFullProfile` is preserved as fallback.
