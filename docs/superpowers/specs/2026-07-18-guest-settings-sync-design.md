# Guest Settings Sync + Soft-Gate Learn Design

**Status:** Draft (awaiting user review)  
**Date:** 2026-07-18  
**Repos:** puchi-frontend, puchi-backend (core + learn)

---

## 1. Executive Summary

- **Settings (toàn bộ):** guest lưu `localStorage`; user đăng nhập lưu **server** (`core.user_settings`) + cache local theo `userId`.
- **Login/signup:** merge guest settings + claim learn progress; **popup** xác nhận đồng bộ bài học & cài đặt.
- **Learn guest:** bỏ trial unit riêng; guest học unit/lesson thật; nhắc nhẹ sau lesson 1; **chặn cứng từ lesson 4** (BE authoritative).

---

## 2. Goals / Non-goals

### Goals

1. Preferences, Language, theme, Privacy (schema), Notifications (wire API có sẵn) persist theo user.
2. Guest dùng được settings (trừ Profile → CTA auth).
3. Sau đăng ký/đăng nhập: đồng bộ lessons + settings với dialog rõ ràng.
4. Guest học vài lesson thật → soft reminder → soft-gate sign-up; không còn trial unit path.

### Non-goals (P0)

- Privacy policy enforcement sâu / export data.
- Cross-device sync cho guest (chỉ localStorage).
- Rewrite toàn bộ dictation legacy store trong cùng PR (P1).

---

## 3. Architecture

```
Guest                              Authenticated user
─────                              ─────────────────
localStorage `puchi-settings`      GET/PATCH /v1/profile/settings
theme/locale mirrored              (+ cache local by userId)
        \                          /
         └── /auth/continue ──────┘
              1) claimGuest (learn) — keep progress
              2) POST settings/merge (if user confirms)
              3) Sync dialog + success feedback
```

Learn guest owner: `guest|{id}` via HttpOnly `puchi_guest_id` (existing). Soft-gate enforced in learn-service.

---

## 4. Data model (core)

Table `core.user_settings`:

| Column | Type | Default |
|--------|------|---------|
| user_id | TEXT PK | — |
| sound_effects | BOOL | true |
| animations | BOOL | true |
| motivational_messages | BOOL | true |
| listening_exercises | BOOL | true |
| theme | TEXT | `system` (`system` \| `light` \| `dark`) |
| locale | TEXT | `en` |
| privacy_json | JSONB | `{}` |
| created_at | TIMESTAMPTZ | now() |
| updated_at | TIMESTAMPTZ | now() |

Notifications: existing `notification` prefs API — do **not** duplicate in `user_settings`.

---

## 5. API (core)

### `GET /v1/profile/settings`

- Auth required.
- Returns settings; upserts defaults if missing.

### `PATCH /v1/profile/settings`

- Auth required.
- Partial update (proto3 optional / field mask style).
- Response: full settings.

### `POST /v1/profile/settings/merge`

- Auth required.
- Body: guest settings payload (same shape as PATCH).
- Rule: **guest wins only for fields that differ from product defaults**; fields already customized on server stay.
- Response: `{ settings, fields_merged: string[] }`.

Error codes: standard auth / validation.

---

## 6. Frontend settings

### Store

- `useSettingsStore` (zustand):
  - Guest / logged-out: persist key `puchi-settings`.
  - Logged-in: in-memory + optional cache key `puchi-settings:{userId}`; hydrate from GET on auth ready.
- Debounced PATCH (~300ms) on change when authenticated.

### Pages

| Page | Behavior P0 |
|------|-------------|
| Preferences | Wire switches + theme to store/API |
| Language | Update locale URL + store (+ PATCH locale when auth) |
| Notifications | Wire to `GET/PUT /v1/notifications/preferences` when auth; guest local stub or hide server-only toggles |
| Privacy | Persist into `privacy_json` via settings API (minimal toggles) |
| Profile | Unchanged — requires auth |

### Access

- Allow guest routes under `/settings` except profile (redirect/CTA sign-in).

---

## 7. Learn: remove trial unit + soft-gate

### Remove / stop promoting

- FE trial-only path: `TRIAL_UNIT_ID`, `TrialUnitView`, `TrialLessonPlayer` as primary guest entry.
- Copy “1 unit trial” → guest starts real `/learn` after `POST /v1/learn/guest/session`.

### Soft-gate rules

| Event | Behavior |
|-------|----------|
| Complete lesson 1 (guest) | Soft modal (dismissible): create account to keep progress |
| Open / complete lesson ≥ 4, or completed_count ≥ 3 and request next | BE `403` `GUEST_SOFT_GATE`; FE blocking dialog + Sign up / Sign in |
| Lessons 2–3 | Allowed |

BE is source of truth for hard gate (complete/start lesson endpoints). FE mirrors for UX.

### Claim

- Keep `POST /v1/learn/guest/claim` on `/auth/continue` (and existing post-auth hooks).
- Always claim learn progress when cookie present (even if user skips settings merge).

---

## 8. Sync popup UX (`/auth/continue`)

Show dialog when `lessons_merged > 0` **OR** guest settings ≠ defaults:

1. Title: sync lessons & settings from guest session.
2. Short preview: lesson count + changed setting labels.
3. **Sync** → `settings/merge` + apply theme/locale; toast/inline success (StampButton-style feedback ok).
4. **Skip** → discard guest settings local; learn claim already done / still runs.

Do not silently drop learn progress on Skip.

---

## 9. Deprecations

| Item | Action |
|------|--------|
| Trial unit as product path | Remove entrypoints P0 |
| `POST /v1/profile/merge-guest` stub | Stop calling; remove or repurpose later |
| `store/guest.ts` | Stop for settings/progress P0; dictation cleanup P1 |

---

## 10. Phased delivery

### P0

1. Migration + GET/PATCH/merge settings (core).
2. FE settings store + Preferences/Language/theme (+ privacy minimal).
3. Guest soft-gate learn + lesson-1 reminder; remove trial entrypoints.
4. Sync dialog on continue after claim.

### P1

- Notifications page → notification service prefs.
- Richer privacy.
- Dictation / legacy guest store cleanup.

---

## 11. Testing

- Guest toggles persist reload; login merge respects server custom fields.
- Guest completes lessons 1–3; lesson 4 returns `GUEST_SOFT_GATE`.
- Claim merges lessons; Skip settings does not undo claim.
- Authenticated PATCH round-trip; second device/session loads server settings.

---

## 12. Open follow-ups (non-blocking)

- Exact N for soft reminder copy / analytics events.
- Whether locale change for guest should force navigation immediately (yes, keep current next-intl behavior).
