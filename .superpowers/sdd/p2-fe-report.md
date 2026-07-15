# P2 Report: Stats Server Actions

**Status**: ✅ Complete  
**Date**: 2026-07-16  
**TypeScript**: ✅ `tsc --noEmit` — 0 new errors (all errors pre-existing)

## Summary

Created 3 Server Actions for profile stats endpoints, extracted profile data fetching into a reusable hook, and cleaned up the profile page by removing inline data logic.

## Files Created

### 1. `src/actions/profile/get-stats.ts`

Server Action that fetches combined stats + gamification data from `GET /v1/profile/stats`.

**Exported interface:**
```typescript
export interface ProfileStats {
  totalLessons: number;
  completedLessons: number;
  totalMinutes: number;
  accuracy: number;
  wordsLearned: number;
  currentXp: number;
  totalXp: number;
  level: number;
  xpToNextLevel: number;
  streak: number;
  longestStreak: number;
  streakFreezes: number;
  crowns: number;
  gems: number;
}
```

This merges fields from both `ProfileStats` and `ProfileGamification` types (defined in `@/types/profile`) since the backend returns a unified stats object.

### 2. `src/actions/profile/get-daily-activity.ts`

Server Action that fetches daily activity data from `GET /v1/profile/stats/daily-activity`. Returns an array of `DailyActivityItem` objects with `date`, `lessonsCompleted`, `xpEarned`, and `minutesSpent`.

### 3. `src/actions/profile/get-weekly-xp.ts`

Server Action that fetches weekly XP progression from `GET /v1/profile/stats/weekly-xp`. Returns an array of `WeeklyXPItem` objects with `weekLabel` and `xp`.

### 4. `src/hooks/use-profile-data.ts`

Custom hook that encapsulates profile data fetching with mock fallback:

- Initializes state with `mockFullProfile` (immediate render, no loading flash)
- Fetches real user profile via `getProfile()` on mount
- Merges real `UserProfile` fields into the mock `FullProfile` shape
- Handles cancellation via `cancelled` flag for unmount safety
- Returns `{ profile, setProfile, isLoading }`

## Files Modified

### 5. `src/app/[locale]/(protected)/(nav)/profile/page.tsx`

**Removed:**
- `useState`, `useCallback`, `useEffect` imports (no longer needed directly)
- `getProfile` and `updateProfile` imports
- `mockFullProfile` direct import
- Inline `useEffect` that fetched and merged profile data
- `handleAvatarChange` no-op stub
- `handleUpdate` wrapper (was defined but never passed to any component)
- `onAvatarChange` prop on `ProfileHero`

**Added:**
- `useProfileData` import from `@/hooks/use-profile-data`
- `const { profile, isLoading } = useProfileData()` replaces `useState<FullProfile>(mockFullProfile)`

## Architecture

| Data Section | Source | Phase |
|---|---|---|
| `user` | `GET /v1/profile` | ✅ P1 |
| `gamification` | Mock (`mockFullProfile`) | P2 (action ready, not wired) |
| `stats` | Mock | P2 (action ready, not wired) |
| `dailyActivity`, `weeklyXP` | Mock | P3 (action ready, not wired) |
| `achievements` | Mock | P3 |
| `friends`, `followers`, `leaderboard` | Mock | P4 |

The Server Actions for P2 stats endpoints are created and ready. The `useProfileData` hook provides the infrastructure — P3/P4 can extend `fetchData()` to call `getStats()`, `getDailyActivity()`, `getWeeklyXP()` and merge each section into the profile state.
