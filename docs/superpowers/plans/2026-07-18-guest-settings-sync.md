# Guest Settings Sync + Soft-Gate Learn — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** `docs/superpowers/specs/2026-07-18-guest-settings-sync-design.md`

**Goal:** Persist full settings (guest localStorage + auth server), sync with a dialog after login, and replace trial-unit guest lock with real-unit soft-gate (soft reminder after lesson 1, hard gate from lesson 4).

**Architecture:** Core owns `user_settings` + GET/PATCH/merge APIs. Learn replaces unit-scoped `TRIAL_LIMIT` with completed-lesson-count soft-gate (`GUEST_SOFT_GATE`). FE `useSettingsStore` + Preferences/Language wiring; `/auth/continue` shows sync dialog after claim.

**Tech Stack:** Go/Kratos/sqlc/Wire (core + learn), Next.js 16, zustand persist, limen-auth, shadcn Dialog

## Global Constraints

- Spec rules are authoritative (merge: guest wins only vs defaults; learn claim always runs; Skip discards settings only).
- Kratos layers `service → biz → data`; Wire DI; no `init()`.
- Soft-gate: BE authoritative; FE mirrors for UX.
- TDD where biz logic exists; commit only when human asks or plan executor enables commits.
- Do not invent new notification prefs tables — wire existing notification API in P1 if not P0.

---

## File Structure Map

```
puchi-backend/
  app/core/
    api/profile/v1/profile.proto          # + Get/Update/Merge Settings RPCs
    internal/data/sqlc/migrations/007_user_settings.*.sql
    internal/data/sqlc/queries/settings.sql
    internal/data/{settings_repo.go,data.go}
    internal/biz/{settings.go,profile.go,profile_test.go}
    internal/service/profile.go
    cmd/core/wire.go (+ wire_gen)
  app/learn/
    internal/biz/{curriculum.go,attempt.go,guest_soft_gate.go,curriculum_test.go}
    internal/service/learn.go             # map ErrGuestSoftGate → GUEST_SOFT_GATE

puchi-frontend/
  src/store/settings.ts
  src/lib/settings-api.ts
  src/components/settings/{SyncGuestDialog.tsx,GuestSoftGateDialog.tsx,LessonOneReminderDialog.tsx}
  src/app/.../settings/{preferences,language,privacy,notifications}/page.tsx
  src/app/.../auth/continue/page.tsx
  src/components/learn/*                  # drop trial-only path; use real learn UI
  src/lib/learn-api.ts                    # handle GUEST_SOFT_GATE; deprecate TRIAL_UNIT_ID entry
```

---

### Task 1: Core migration + settings repo (sqlc)

**Files:**
- Create: `app/core/internal/data/sqlc/migrations/007_user_settings.up.sql`
- Create: `app/core/internal/data/sqlc/migrations/007_user_settings.down.sql`
- Create: `app/core/internal/data/sqlc/queries/settings.sql`
- Modify: regenerate sqlc under `app/core/internal/data/sqlc/gen/`
- Create: `app/core/internal/data/settings_repo.go`
- Modify: `app/core/internal/data/data.go` (Wire set)

**Interfaces:**
- Produces: `SettingsRepo` with `Get`, `Upsert`, `EnsureDefaults`
- Settings fields: `sound_effects`, `animations`, `motivational_messages`, `listening_exercises`, `theme`, `locale`, `privacy_json`

- [ ] **Step 1: Write migration**

```sql
-- 007_user_settings.up.sql
CREATE TABLE IF NOT EXISTS user_settings (
  user_id TEXT PRIMARY KEY,
  sound_effects BOOLEAN NOT NULL DEFAULT true,
  animations BOOLEAN NOT NULL DEFAULT true,
  motivational_messages BOOLEAN NOT NULL DEFAULT true,
  listening_exercises BOOLEAN NOT NULL DEFAULT true,
  theme TEXT NOT NULL DEFAULT 'system',
  locale TEXT NOT NULL DEFAULT 'en',
  privacy_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

- [ ] **Step 2: Add sqlc queries + generate**

```sql
-- name: GetUserSettings :one
SELECT * FROM user_settings WHERE user_id = $1;

-- name: UpsertUserSettings :one
INSERT INTO user_settings (
  user_id, sound_effects, animations, motivational_messages, listening_exercises,
  theme, locale, privacy_json, updated_at
) VALUES ($1,$2,$3,$4,$5,$6,$7,$8, now())
ON CONFLICT (user_id) DO UPDATE SET
  sound_effects = EXCLUDED.sound_effects,
  animations = EXCLUDED.animations,
  motivational_messages = EXCLUDED.motivational_messages,
  listening_exercises = EXCLUDED.listening_exercises,
  theme = EXCLUDED.theme,
  locale = EXCLUDED.locale,
  privacy_json = EXCLUDED.privacy_json,
  updated_at = now()
RETURNING *;
```

Run project sqlc generate for core (follow existing Makefile/target).

- [ ] **Step 3: Implement `SettingsRepo` + Wire**

Bind in `data.go` like other repos. `EnsureDefaults` inserts row with defaults if missing.

- [ ] **Step 4: Apply migration on shared/dev DB and smoke `GetUserSettings`**

Expected: empty → insert defaults → select ok.

- [ ] **Step 5: Commit** (if commits enabled)

```bash
git add app/core/internal/data
git commit -m "feat(core): add user_settings table and repo"
```

---

### Task 2: Core biz + proto settings APIs

**Files:**
- Modify: `app/core/api/profile/v1/profile.proto`
- Regenerate: `app/core/api/profile/v1/*.pb.go`
- Create: `app/core/internal/biz/settings.go`
- Modify: `app/core/internal/biz/profile.go` / usecase wiring
- Modify: `app/core/internal/biz/profile_test.go` (or new `settings_test.go`)
- Modify: `app/core/internal/service/profile.go`
- Modify: `app/core/cmd/core/wire.go` → `wire_gen.go`

**Interfaces:**
- Produces RPCs:
  - `GetSettings(Empty) → UserSettings`
  - `UpdateSettings(UpdateSettingsRequest) → UserSettings` (HTTP PATCH `/v1/profile/settings`)
  - `MergeSettings(MergeSettingsRequest) → MergeSettingsResponse` (HTTP POST `/v1/profile/settings/merge`)
- Merge rule: for each field, if guest value ≠ product default AND (server value == default OR field unset), take guest; else keep server.

- [ ] **Step 1: Failing biz test for merge**

```go
func TestMergeSettings_GuestWinsOnlyVsDefaults(t *testing.T) {
  // server: sound=false (custom), animations=true (default)
  // guest:  sound=true, animations=false
  // expect: sound=false (keep server), animations=false (guest), fields_merged contains "animations" only
}
```

- [ ] **Step 2: Run test — FAIL**

```bash
cd app/core && go test ./internal/biz/ -run TestMergeSettings -v
```

- [ ] **Step 3: Proto + implement biz/service**

Add messages:

```protobuf
message UserSettings {
  bool sound_effects = 1;
  bool animations = 2;
  bool motivational_messages = 3;
  bool listening_exercises = 4;
  string theme = 5;
  string locale = 6;
  string privacy_json = 7; // JSON string
}

message UpdateSettingsRequest {
  optional bool sound_effects = 1;
  optional bool animations = 2;
  optional bool motivational_messages = 3;
  optional bool listening_exercises = 4;
  optional string theme = 5;
  optional string locale = 6;
  optional string privacy_json = 7;
}

message MergeSettingsRequest { UserSettings guest = 1; }
message MergeSettingsResponse {
  UserSettings settings = 1;
  repeated string fields_merged = 2;
}
```

HTTP annotations per spec paths. Implement Get (ensure defaults), Update (partial), Merge.

- [ ] **Step 4: Tests PASS + manual curl with Bearer**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(core): profile settings GET/PATCH/merge APIs"
```

---

### Task 3: Learn soft-gate (replace trial unit lock)

**Files:**
- Modify: `app/learn/internal/biz/curriculum.go` — remove/replace `assertGuestTrialScope` unit equality
- Modify: `app/learn/internal/biz/attempt.go` — gate on completed count / lesson ordinal
- Create or modify: helper counting completed lessons for guest owner
- Modify: `app/learn/internal/biz/curriculum_test.go`, `attempt` tests
- Modify: `app/learn/internal/service/learn.go` — map `ErrGuestSoftGate` → `GUEST_SOFT_GATE` (keep alias from `TRIAL_LIMIT` briefly if FE still checks old code)

**Interfaces:**
- Produces: `ErrGuestSoftGate`; guests may access **any unit**; hard-block when guest has `completed_lessons >= 3` and tries to start/complete a lesson that is not already completed; allow lessons 1–3 of the path (use curriculum order: first 3 lessons in first unit skill order, OR global completed count ≥ 3).
- Spec: soft reminder after lesson 1 is FE-only; BE hard gate from lesson 4 ≡ completed_count ≥ 3 blocking new lesson start/complete.

**Canonical rule (lock this):**
- Let `n = count(lesson_progress status=completed)` for guest owner.
- Allow `StartLesson`/`CompleteLesson` if lesson already completed OR `n < 3`.
- Else return `ErrGuestSoftGate`.
- `GetUnit`/`GetLesson` remain readable for browse (optional: still return 403 on GetLesson for locked — prefer allow read, block start/complete only).

- [ ] **Step 1: Rewrite failing tests**

Replace `TestGetLesson_Guest*` trial-unit expectations with soft-gate completed-count tests in `attempt`/`curriculum` tests.

- [ ] **Step 2: Implement count + gate; delete unit==trialUnitID check**

Stop requiring `trialUnitID` for guest scope (can leave param unused until cleanup).

- [ ] **Step 3: Map error code `GUEST_SOFT_GATE`**

- [ ] **Step 4: `go test ./internal/biz/ -v` PASS**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(learn): guest soft-gate by completed lessons, drop trial unit lock"
```

---

### Task 4: FE settings store + API client

**Files:**
- Create: `src/lib/settings-api.ts`
- Create: `src/store/settings.ts`
- Modify: `src/providers/AuthProvider.tsx` (hydrate settings after session) OR hydrate from settings layout

**Interfaces:**
- Produces:
  - `getSettings()`, `patchSettings(partial)`, `mergeSettings(guest)`
  - `useSettingsStore` with `{ values, setField, hydrateFromServer, loadGuest, clearGuest, isDirtyGuest }`
  - Guest persist key `puchi-settings`; auth cache `puchi-settings:{userId}`

- [ ] **Step 1: Implement API client matching proto JSON (snake_case)**

- [ ] **Step 2: Store with guest persist + debounce patch when `accessToken` present**

Mirror pattern from `src/store/trial-learn.ts` / `auth.ts`.

- [ ] **Step 3: Manual: toggle as guest → reload persists; login → GET overwrites cache**

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(settings): zustand store and settings API client"
```

---

### Task 5: Wire settings pages + guest access

**Files:**
- Modify: `src/app/[locale]/(protected)/(nav)/settings/preferences/page.tsx` — controlled Switches + theme
- Modify: `src/app/[locale]/(protected)/(nav)/settings/language/page.tsx` — locale → store + next-intl navigate
- Modify: `src/app/[locale]/(protected)/(nav)/settings/privacy/page.tsx` — minimal toggles → `privacy_json`
- Modify: `src/app/[locale]/(protected)/(nav)/settings/notifications/page.tsx` — P0: stub message or wire notification prefs if quick
- Modify: settings layout / proxy if needed so guest can open settings (profile still auth CTA)
- Modify: `SelectTheme` / preferences to call store

- [ ] **Step 1: Preferences switches bound to store**

- [ ] **Step 2: Language writes `locale` + navigates**

- [ ] **Step 3: Privacy minimal keys in JSON**

- [ ] **Step 4: Smoke UI guest + authed**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(settings): wire preferences language privacy to store"
```

---

### Task 6: FE learn — remove trial entrypoints + soft-gate UI

**Files:**
- Modify: `src/app/[locale]/(protected)/(nav)/(learn)/learn/page.tsx` — stop rendering `TrialUnitView` as only path; use real unit learn UI for guest+auth
- Modify: `src/app/[locale]/start/page.tsx` — guest → session → `/learn` (copy without “1 unit trial”)
- Modify: `src/lib/learn-api.ts` — detect `GUEST_SOFT_GATE` / legacy `TRIAL_LIMIT`
- Create: `src/components/settings/GuestSoftGateDialog.tsx`
- Create: `src/components/settings/LessonOneReminderDialog.tsx`
- Modify: lesson complete handlers to open reminder after first completion (guest)
- Deprecate usage of `TrialLessonPlayer` route as primary (redirect to real lesson or remove links)

- [ ] **Step 1: Guest can open real unit lessons 1–3**

- [ ] **Step 2: On complete lesson 1 (guest) show dismissible reminder dialog**

- [ ] **Step 3: On `GUEST_SOFT_GATE` show blocking Sign up / Sign in dialog**

- [ ] **Step 4: Update i18n strings `en.json` / `vi.json`

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(learn): real-unit guest path with soft-gate dialogs"
```

---

### Task 7: Sync dialog on `/auth/continue`

**Files:**
- Create: `src/components/settings/SyncGuestDialog.tsx`
- Modify: `src/app/[locale]/auth/continue/page.tsx`
- Modify: `src/hooks/use-claim-guest.ts` — return `{ claimed, lessonsMerged }` if API provides count
- Stop calling deprecated `useGuestStore.mergeIfNeeded` for progress (optional leave no-op)

**Flow:**
1. Sync session/token (existing).
2. `claimGuestIfNeeded()` → capture `lessons_merged`.
3. Read guest settings from store; compute `changedFromDefaults`.
4. If lessons_merged > 0 OR changedFromDefaults → open `SyncGuestDialog`.
5. Confirm → `mergeSettings` + apply theme/locale + clear guest settings key → continue routing.
6. Skip → clear guest settings key only → continue routing.
7. Never skip learn claim.

- [ ] **Step 1: Implement dialog UI (shadcn Dialog + StampButton)**

- [ ] **Step 2: Wire continue page**

- [ ] **Step 3: Manual E2E: guest toggles + 1 lesson → signup → dialog → sync**

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(auth): guest sync dialog for lessons and settings"
```

---

### Task 8: Cleanup + docs touch-up

**Files:**
- Remove or gate dead trial-only exports/messages
- Note in README/dev docs: settings migration `007`
- Ensure `POST /v1/profile/merge-guest` is no longer called from FE

- [ ] **Step 1: Grep `TRIAL_UNIT_ID`, `TrialUnitView`, `merge-guest`, `TRIAL_LIMIT` — remove dead entrypoints**

- [ ] **Step 2: `bun run lint` + targeted `go test`**

- [ ] **Step 3: Commit**

```bash
git commit -m "chore: remove trial entrypoints and merge-guest client calls"
```

---

## Spec coverage checklist

| Spec item | Task |
|-----------|------|
| `user_settings` table | 1 |
| GET/PATCH/merge APIs + merge rules | 2 |
| Guest soft-gate BE | 3 |
| Guest localStorage + authed server cache | 4 |
| Settings pages wired (C) | 5 |
| Bỏ trial unit FE + lesson1 reminder + lesson4 gate UI | 6 |
| Sync popup on continue | 7 |
| Deprecate merge-guest / trial entry | 8 |

## Placeholder / consistency self-review

- Error code standardized as `GUEST_SOFT_GATE` (FE accepts legacy `TRIAL_LIMIT` during transition in Task 6).
- Soft-gate count rule locked in Task 3 (completed ≥ 3 blocks new starts).
- Notifications full page deferred if time-boxed — Preferences/Language/Privacy/theme are P0; notifications page may show “coming soon” or wire existing API in Task 5 without blocking.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-18-guest-settings-sync.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — fresh subagent per task, review between tasks  
2. **Inline Execution** — this session with executing-plans + checkpoints  

Which approach?
