# Task 8-9-10 Report

## Task 8: backendFetch utility, errors, and types

### Files created

- **`src/lib/backend.ts`** — Server-only utility wrapping `fetch` with Supertokens session injection, AbortController timeout (default 15s), and structured `BackendError` class (status, code, path). Handles network errors and timeouts gracefully.
- **`src/lib/errors.ts`** — Maps backend error codes to i18n keys (e.g. `USER_NOT_FOUND` → `errors.profile.notFound`). Provides `getErrorI18nKey()` for Server Actions.
- **`src/types/api.ts`** — `ActionResult<T>` discriminated union type for Server Action return values.

### Key decisions

- `BACKEND_URL` reads from `API_INTERNAL_URL` env var, falls back to `http://localhost:8000`.
- Session token extracted via `getAppDirSession()` from `supertokens-node/nextjs`.
- 204 responses return `undefined` instead of attempting JSON parse.

---

## Task 9: Profile Server Actions + `useAction` hook

### Files created

- **`src/actions/profile/get-profile.ts`** — `GET /v1/profile` server action returning `ActionResult<UserProfile>`.
- **`src/actions/profile/update-profile.ts`** — `PUT /v1/profile` action using form data, revalidates `/profile` page on success.
- **`src/hooks/use-action.ts`** — Generic client hook wrapping server actions with `useTransition`, `next-intl` translation for error messages, and `sonner` toast notifications.

### Architecture

- Server Actions are colocated under `src/actions/profile/`.
- `UserProfile` interface exported from `get-profile.ts`, reused in `update-profile.ts`.
- `useAction` exposes `{ execute, isPending }` — accepts optional `onSuccess` callback and `successMessage` i18n key.

---

## Task 10: i18n error messages

### Files modified

- **`messages/en.json`** — Added `errors` key with profile, validation, auth, network, and server error translations.
- **`messages/vi.json`** — Same structure with Vietnamese translations.

### Error key hierarchy

```
errors
├── profile.notFound
├── validation.invalidInput
├── validation.usernameTaken
├── auth.unauthorized
├── network.timeout
├── network.connectionError
└── server.internalError
```

---

## Validation

- All TypeScript files use valid imports with the `@/` path alias.
- JSON files validated as syntactically correct (matching braces, valid trailing commas).
- No breaking changes to existing code — all files are additive.
