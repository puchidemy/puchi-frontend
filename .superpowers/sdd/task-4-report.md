# Task 4 Report — FE settings store + API client

**Status:** DONE

**Commits:** `feat(settings): zustand store and settings API client` (branch `feat/guest-settings-sync`)

## Deliverables

| File | Role |
|------|------|
| `src/lib/settings-api.ts` | `getSettings`, `patchSettings`, `mergeSettings`; normalize snake/camel; wire snake_case; `DEFAULT_SETTINGS` + `settingsChangedFromDefaults` |
| `src/store/settings.ts` | `useSettingsStore`: `values`, `setField`, `hydrateFromServer`, `loadGuest`, `clearGuest`, `isDirtyGuest`, `fetchFromServer`; guest key `puchi-settings`; auth cache `puchi-settings:{userId}`; debounced PATCH ~300ms when `accessToken` |
| `src/providers/AuthProvider.tsx` | Hydrate settings after session/login; `loadGuest` on logout / session clear |

## Smoke

- Unit helpers: normalize snake + camel, `settingsChangedFromDefaults`, `patchToWire` / `settingsToWire` via Bun import — OK.
- Manual UI guest toggle / login GET overwrite — deferred to Task 5 (pages not wired).

## Self-review

- Matches brief interfaces; no settings pages wired.
- Guest persist mirrors `trial-learn` guest-only storage; auth uses optional per-user cache + GET overwrite.
- Request bodies use snake_case (proto names); responses accept both casings like `profile-api`.

## Concerns

- Live GET/PATCH against core needs BE `feat/guest-settings-sync` deployed; not exercised end-to-end here.
- Protojson may emit camelCase on the wire; normalize covers both. If PATCH rejects snake_case in a specific Kratos config, switch `patchToWire` to camelCase.
- Debounced PATCH failures keep optimistic local state (no rollback toast yet).
