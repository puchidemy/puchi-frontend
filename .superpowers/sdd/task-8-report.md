Status: DONE
Commit: (pending)
Lint: `bun run lint` — pass

## Removed
- `TrialUnitView`, `TrialLessonPlayer`, `SoftGateDialog` (unused deprecated wrappers)
- `TRIAL_UNIT_ID`, `getTrialUnit`, `TrialUnitResponse`, `NEXT_PUBLIC_TRIAL_UNIT_ID` alias
- `useGuestStore.mergeIfNeeded` + calls in `AuthProvider` and OAuth callback

## Kept
- `/lesson/trial/[id]` → redirect to `/lesson/[id]`
- `isGuestSoftGateError` accepts legacy `TRIAL_LIMIT` alongside `GUEST_SOFT_GATE`
- `trial-learn` store / `TrialUnitPath` (active learn UI, not trial-only entry)

## Docs
- README: note core migration `007_user_settings` for guest settings sync dev setup

## Backend
- No FE `merge-guest` calls remain; BE stub unchanged (`trialUnitID` kept for API stability — skipped BE commit)
