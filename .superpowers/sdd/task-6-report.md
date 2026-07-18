# Task 6 report — FE learn soft-gate UI

**Branch:** `feat/guest-settings-sync`  
**Commit:** `feat(learn): real-unit guest path with soft-gate dialogs`

## Done

1. **`/learn` → `UnitLearnView`** loads `DEFAULT_UNIT_ID` (seed curriculum) for guest + auth; no trial-only path.
2. **`/start`** still `ensureGuestSession` → `/learn`; copy drops “1 unit trial”.
3. **`learn-api`**: `getUnit`, `isGuestSoftGateError` (`GUEST_SOFT_GATE` + legacy `TRIAL_LIMIT`).
4. **Dialogs**: `GuestSoftGateDialog` (blocking), `LessonOneReminderDialog` (dismissible after first guest complete).
5. **`LessonPlayer`** at `/lesson/[id]`; `/lesson/trial/[id]` redirects; wires soft-gate + reminder.
6. **i18n** `Learn.*` + updated `Start.*` in `en.json` / `vi.json`.

## Notes

- Legacy `TrialUnitView` / `TrialLessonPlayer` / `SoftGateDialog` re-export new components.
- Soft-gate CTA on unit path when guest completed ≥ 3 lessons.
