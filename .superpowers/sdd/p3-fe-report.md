# P3 FE: Social Server Actions — Implementation Report

## Summary

Implemented 4 server actions for social features and updated the profile data hook to integrate social data fetching.

## Files Created

### `src/actions/social/follow.ts`
- **`follow(followingId)`** — POST `/v1/social/follow` with `{ following_id }` body; revalidates profile page on success
- **`unfollow(followingId)`** — DELETE `/v1/social/follow/{followingId}`; revalidates profile page on success
- Both return `ActionResult<void>`

### `src/actions/social/get-following.ts`
- **`getFollowing()`** — GET `/v1/social/following` → `SocialUser[]`
- **`getFollowers()`** — GET `/v1/social/followers` → `SocialUser[]`
- Exports `SocialUser` interface: `id, username, firstName, lastName, avatarUrl, level, streak, isFollowing`

### `src/actions/social/get-leaderboard.ts`
- **`getLeaderboard()`** — GET `/v1/social/leaderboard` → `LeaderboardUser[]`
- Exports `LeaderboardUser` interface: `rank, userId, username, avatarUrl, level, weeklyXp, isCurrentUser`

### `src/actions/social/search-users.ts`
- **`searchUsers(query)`** — GET `/v1/social/search?query={query}` → `SocialUser[]`
- Reuses `SocialUser` type from `get-following`

## Files Modified

### `src/hooks/use-profile-data.ts`
- Added parallel social data fetching via `Promise.allSettled`:
  - `getProfile()` (existing)
  - `getFollowing()` (new)
  - `getFollowers()` (new)
  - `getLeaderboard()` (new)
- Added mapper functions `toFriend()` and `toLeaderboardEntry()` to convert API types (`avatarUrl`, `weeklyXp`) to `FullProfile` types (`imageUrl`, `weeklyXP`)
- Each fetch is independent — if one fails, others still apply (fallback to mock data)
- **No regressions** — `useProfileData()` API unchanged (still returns `{ profile, setProfile, isLoading }`)

## TypeScript Verification

```
bun tsc --noEmit
```

**Zero errors from created/modified files.** All existing errors are pre-existing in the codebase (Next.js route handler params, shadcn button variants, motion Variants types, lucide-react casting, missing `n2words` declarations, etc.).

## API Field Mapping

| API (snake_case) | FullProfile type | Notes |
|---|---|---|
| `avatarUrl` | `imageUrl` | Mapped in `toFriend()` / `toLeaderboardEntry()` |
| `weeklyXp` | `weeklyXP` | Mapped in `toLeaderboardEntry()` |
| `isFollowing` | `isFollowing` | Direct match |

## Design Decisions

- Used `Promise.allSettled` instead of `Promise.all` so a single failing endpoint doesn't block the entire profile load
- Mock data serves as initial state — if API calls fail, previously loaded mock data persists
- All actions are `"use server"` — compatible with Next.js server components and Server Actions
- Revalidation happens on the profile page route pattern `/[locale]/(protected)/(nav)/profile`
