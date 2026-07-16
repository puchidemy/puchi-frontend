Status: DONE

## Task 6: Frontend — Settings/Profile Page

- Replaced placeholder `<div>page</div>` with a full `"use client"` SettingsProfilePage component.
- Profile edit form: first_name, last_name, username, bio, age_range fields with loading spinner state.
- Connected accounts management: Google, Facebook, TikTok with Link (redirect to `/api/auth/link-account/{provider}`) and Unlink (POST `/api/auth/unlink-account`) buttons.
- Fetches profile via `getProfile()` action and linked accounts via `GET /v1/profile/linked-accounts`.
- Saves via `PUT /v1/profile`.
- Committed in `d571ab2` on `feat/auth-refactor`.
