# Task 7 report — Sync dialog on `/auth/continue`

**Branch:** `feat/guest-settings-sync`  
**Commit:** `feat(auth): guest sync dialog for lessons and settings`

## Done

1. **`SyncGuestDialog`** — shadcn Dialog + StampButton (sync) / ghost Skip; blocking dismiss.
2. **`claimGuestIfNeeded`** → `{ claimed, lessonsMerged }` from `lessons_merged`.
3. **`/auth/continue`** — session/token → always claim learn → if `lessonsMerged > 0` OR guest settings ≠ defaults → dialog.
4. **Confirm** → `mergeSettings` + hydrate + theme/locale + `clearGuest` → route.
5. **Skip** → `clearGuest` only (learn claim already ran).
6. **`mergeIfNeeded`** no-op (deprecated `merge-guest`); continue no longer calls it.
7. **i18n** `Settings.syncGuest.*` in `en.json` / `vi.json`.
