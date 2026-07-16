# Frontend Critical Findings Fix Report

## Summary

Fixed all 4 critical findings from the frontend final review.

## Fixes Applied

### Fix 1: Public `/in/[username]` route
- **Created:** `src/app/[locale]/(public)/in/[username]/page.tsx`
- Creates a public profile route accessible without authentication
- Uses `getPublicProfile` server action (no auth required)
- Displays user profile with `ProfilePageView` component

### Fix 2: `useProfileData` hook - username parameter
- **Updated:** `src/hooks/use-profile-data.ts`
- Added optional `username?: string` parameter to `useProfileData()`
- When `username` is provided, calls `getPublicProfile(username)` instead of `getProfile()`
- Uses the username in the cache key for proper caching
- When viewing a public profile, only fetches basic profile data (no achievements/following/leaderboard)

### Fix 3: Client-side fetch wrapper for `/v1/*` endpoints
- **Created:** `src/lib/client-api.ts` — new `clientFetch<T>()` helper
  - Uses `NEXT_PUBLIC_API_URL` as base URL, falls back to same-origin
  - Sets `Content-Type: application/json` and `credentials: "include"` by default
  - Throws on non-OK responses
- **Updated:** `src/app/[locale]/auth/callback/[provider]/page.tsx`
  - Replaced `fetch("/v1/profile")` with `clientFetch("/v1/profile")`
- **Updated:** `src/app/[locale]/(protected)/(nav)/settings/profile/page.tsx`
  - Replaced `fetch("/v1/profile/linked-accounts")` with `clientFetch(...)`
- **Updated:** `src/components/welcome/WelcomeFlow.tsx`
  - Replaced `fetch("/v1/onboarding/complete", ...)` with `clientFetch(...)`
  - Replaced `fetch("/api/auth/session")` with `clientFetch(...)`

### Fix 4: Link-account route session verification
- **Updated:** `src/app/api/auth/link-account/[provider]/route.ts`
- Added `getSession(request, NextResponse.next())` call to verify authentication
- Returns 401 with clear error message when not authenticated
