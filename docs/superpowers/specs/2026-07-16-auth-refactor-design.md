# Auth Refactor — WelcomeFlow Onboarding + Public Profile + Account Linking

> **Design Doc**

**Goal:** Hoàn thiện luồng auth: user mới (social hoặc email/password) được redirect tới WelcomeFlow để nhập thông tin cơ bản (first name, last name, age range), đồng bộ onboarding answers và profile xuống backend. Thêm public profile theo username. Hỗ trợ account linking (nhiều provider chung 1 tài khoản).

**Architecture:** Incremental — mở rộng backend hiện tại (core profile service), thêm migration, thêm Supertokens AccountLinking recipe, refactor WelcomeFlow và profile routing.

**Tech Stack:** Next.js 16, React 19, Supertokens v24 (node + web-js + golang), Go Kratos v3, PostgreSQL 18, Zustand, next-intl

---

## 1. Database Schema Changes

### Migration `003_onboarding`

```sql
-- Thêm columns vào core.users
ALTER TABLE core.users ADD COLUMN age_range TEXT NOT NULL DEFAULT '';
ALTER TABLE core.users ADD COLUMN onboarding_completed BOOLEAN NOT NULL DEFAULT false;

-- Bảng lưu câu trả lời onboarding
CREATE TABLE core.user_onboarding (
    user_id    TEXT PRIMARY KEY REFERENCES core.users(id) ON DELETE CASCADE,
    how_heard  TEXT NOT NULL DEFAULT '',
    why_learn  TEXT NOT NULL DEFAULT '',
    level      TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### SQLC Queries mới

```sql
-- name: GetUserByUsername :one
SELECT * FROM core.users WHERE username = $1;

-- name: UpdateOnboardingInfo :one
UPDATE core.users 
SET first_name = $2, last_name = $3, age_range = $4, 
    onboarding_completed = true, updated_at = now()
WHERE id = $1
RETURNING *;

-- name: UpsertUserOnboarding :one
INSERT INTO core.user_onboarding (user_id, how_heard, why_learn, level)
VALUES ($1, $2, $3, $4)
ON CONFLICT (user_id) 
DO UPDATE SET how_heard = EXCLUDED.how_heard, 
              why_learn = EXCLUDED.why_learn, 
              level = EXCLUDED.level,
              updated_at = now()
RETURNING *;
```

---

## 2. Backend API Changes

### Proto mở rộng (`api/core/profile/v1/profile.proto`)

```protobuf
message UpdateProfileRequest {
  string first_name = 1;
  string last_name = 2;
  string username = 3;
  string bio = 4;
  string age_range = 5;  // NEW
}

message GetProfileByUsernameRequest {
  string username = 1;
}

message CompleteOnboardingRequest {
  string first_name = 1;
  string last_name = 2;
  string age_range = 3;
  string how_heard = 4;
  string why_learn = 5;
  string level = 6;
}

message LinkedAccount {
  string provider = 1;
  string email = 2;
  string linked_at = 3;
}

message LinkedAccountsResponse {
  repeated LinkedAccount accounts = 1;
}

service ProfileService {
  // Existing
  rpc GetProfile(google.protobuf.Empty) returns (User);
  rpc UpdateProfile(UpdateProfileRequest) returns (User);
  rpc GetStats(google.protobuf.Empty) returns (Stats);
  rpc ListAchievements(google.protobuf.Empty) returns (AchievementList);
  
  // NEW
  rpc GetProfileByUsername(GetProfileByUsernameRequest) returns (User);
  rpc CompleteOnboarding(CompleteOnboardingRequest) returns (User);
  rpc GetLinkedAccounts(google.protobuf.Empty) returns (LinkedAccountsResponse);
}
```

### Biz layer (`app/core/internal/biz/profile.go`)

```go
type OnboardingInput struct {
    FirstName string
    LastName  string
    AgeRange  string
    HowHeard  string
    WhyLearn  string
    Level     string
}

func (uc *ProfileUsecase) GetProfileByUsername(ctx context.Context, username string) (*gen.CoreUser, error)
func (uc *ProfileUsecase) CompleteOnboarding(ctx context.Context, userID string, input OnboardingInput) (*gen.CoreUser, error)
```

### Service layer (`app/core/internal/service/profile.go`)

```go
func (s *ProfileService) GetProfileByUsername(ctx context.Context, req *pb.GetProfileByUsernameRequest) (*pb.User, error)
func (s *ProfileService) CompleteOnboarding(ctx context.Context, req *pb.CompleteOnboardingRequest) (*pb.User, error)
func (s *ProfileService) GetLinkedAccounts(ctx context.Context, _ *emptypb.Empty) (*pb.LinkedAccountsResponse, error)
```

### Linked Accounts — Backend fetch từ Supertokens

`GetLinkedAccounts` gọi Supertokens API để lấy danh sách provider đã link:

```go
func fetchLinkedAccounts(userID string) []*pb.LinkedAccount {
    user, _ := supertokens.GetUser(userID)
    // Map recipe_users → provider list
}
```

### Auth — không yêu cầu login cho public profile

`GetProfileByUsername` là public endpoint — không verify auth. Nếu user đã login và là chính họ → trả về đầy đủ. Nếu anonymous → trả về public fields (no email).

---

## 3. Supertokens Account Linking

### Server config (`src/config/supertokens-server.ts`)

```typescript
import AccountLinking from "supertokens-node/recipe/accountlinking";

recipeList: [
  EmailPasswordNode.init(),
  AccountLinking.init(),
  ThirdPartyNode.init({
    signInAndUpFeature: {
      providers: [
        // ... same providers ...
      ],
      shouldAutoLink: async (input) => {
        // Tự động link nếu cùng email
        return { allowed: true };
      },
    },
  }),
  SessionNode.init(),
],
```

### Manual link API route

- `GET /api/auth/link-account/[provider]` — redirect user tới OAuth provider để link
- Xử lý callback link ở `callback/[provider]` với flag `?mode=link`
- Dùng `supertokens-web-js` để gọi `getAuthorisationURLWithQueryParamsAndSetState` với session hiện tại

### Manual unlink API route

- `POST /api/auth/unlink-account` — body: `{ providerUserId: string }`
- Gọi Supertokens Node SDK `superTokens.removeAccountLinking`

---

## 4. WelcomeFlow Refactor

### Flow states

```
[Chưa login]  /welcome → Onboarding (4 steps) → lưu localStorage → /learn
[Có login, lần đầu]  /welcome → BasicInfo step → Onboarding (nếu chưa có trong LS) → sync backend → /learn
[Có login, đã complete]  /welcome → redirect /learn
```

### BasicInfo Step (mới)

Thu thập:
- **First Name** — pre-fill từ URL params (`?firstName=...&lastName=...` từ callback social)
- **Last Name** — pre-fill tương tự
- **Age Range** — dropdown select

```typescript
interface BasicInfoData {
  firstName: string;
  lastName: string;
  ageRange: string;
}
```

### Social callback redirect

Callback page sửa thành:

```typescript
if (response.status === "OK") {
  const profile = await fetch("/v1/profile").then(r => r.json()); // check onboarding
  if (profile.onboarding_completed) {
    router.replace("/learn");
  } else {
    // Lấy display name từ Supertokens session
    const claims = await getClaimValue({ key: "st-tp-name" });
    const params = new URLSearchParams();
    if (claims?.firstName) params.set("firstName", claims.firstName);
    if (claims?.lastName) params.set("lastName", claims.lastName);
    router.replace(`/welcome?${params.toString()}`);
  }
}
```

### Complete — sync lên backend

`OnboardingComplete` component kiểm tra: nếu user đã login → gọi `POST /v1/onboarding/complete`:

```typescript
// Khi user đã login
async function syncToBackend(data: {
  first_name: string;
  last_name: string;
  age_range: string;
  how_heard: string;
  why_learn: string;
  level: string;
}) {
  await fetch("/v1/onboarding/complete", {
    method: "POST",
    body: JSON.stringify(data),
  });
  // Clear onboarding store — không cần persist nữa
  useOnboardingStore.getState().reset();
}
```

---

## 5. Profile Routing & Public Profile

### Route structure

```
/[locale]/
├── (protected)/
│   └── (nav)/
│       ├── in/                     ← Current user profile (hoặc redirect tới /in/[self])
│       │   └── page.tsx
│       └── in/[username]/          ← Profile by username (nav layout)
│           └── page.tsx            ← ProfilePageView component
│
├── (public)/
│   └── in/[username]/              ← Public profile (không cần login, SEO-friendly)
│       └── page.tsx                ← Cùng ProfilePageView
│
└── settings/
    └── profile/                    ← Edit profile + Connected accounts
        └── page.tsx                ← Form edit + Account linking UI
```

### Component reuse

- `ProfilePageView` component — nhận `profile: FullProfile` từ props, render hero + tabs + right bar
- Cả 2 route `in/[username]` (protected + public) dùng chung `ProfilePageView`
- `useProfileData` hook sửa thành nhận `username: string` param
  - Nếu không có username → fetch current user (`GET /v1/profile`)
  - Nếu có username → fetch public profile (`GET /v1/profile/:username`)
- Route `in/` (không dynamic, hiện tại `profile/`) → fetch current user, dùng `ProfilePageView`

### Actions

```typescript
// actions/profile/get-public-profile.ts (server action)
export async function getPublicProfile(username: string): Promise<ActionResult<FullProfile>>
// Gọi backend: GET /v1/profile/{username}
```

### Settings/Profile

```typescript
// Form edit: PUT /v1/profile (đã có UpdateProfile + age_range mới)
// Connected accounts: GET /v1/profile/linked-accounts
// Link: redirect /api/auth/link-account/{provider}
// Unlink: POST /api/auth/unlink-account
```

---

## 6. API Endpoints Summary

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/v1/profile` | Required | Current user profile (existing) |
| `PUT` | `/v1/profile` | Required | Update profile (+ age_range) |
| `GET` | `/v1/profile/:username` | Optional | Public profile by username |
| `POST` | `/v1/onboarding/complete` | Required | Complete onboarding, sync info |
| `GET` | `/v1/profile/linked-accounts` | Required | List linked providers |
| `GET` | `/api/auth/link-account/:provider` | Required | Manual link — redirect OAuth |
| `POST` | `/api/auth/unlink-account` | Required | Unlink a provider |

---

## 7. Files to Create/Modify

### Backend (puchi-backend)

| File | Action |
|------|--------|
| `app/core/internal/data/sqlc/migrations/003_onboarding.up.sql` | Create |
| `app/core/internal/data/sqlc/migrations/003_onboarding.down.sql` | Create |
| `app/core/internal/data/sqlc/queries/users.sql` | Modify (thêm queries) |
| `app/core/internal/data/sqlc/gen/models.go` | Regenerate |
| `app/core/internal/biz/profile.go` | Modify (thêm methods) |
| `app/core/internal/service/profile.go` | Modify (thêm handlers) |
| `api/core/profile/v1/profile.proto` | Modify (thêm RPCs + messages) |

### Frontend (puchi-frontend)

| File | Action |
|------|--------|
| `src/config/supertokens-server.ts` | Modify (thêm AccountLinking) |
| `src/app/[locale]/auth/callback/[provider]/page.tsx` | Modify (check onboarding, pass params) |
| `src/components/welcome/WelcomeFlow.tsx` | Modify (thêm BasicInfo step) |
| `src/components/welcome/BasicInfoStep.tsx` | Create |
| `src/components/welcome/OnboardingComplete.tsx` | Modify (sync backend nếu đã login) |
| `src/app/[locale]/welcome/page.tsx` | Modify (nhận search params) |
| `src/app/[locale]/(protected)/(nav)/in/page.tsx` | Modify (redirect tới /in/[self] hoặc reuse) |
| `src/app/[locale]/(protected)/(nav)/in/[username]/page.tsx` | Create |
| `src/components/profile/ProfilePageView.tsx` | Create (tách từ profile/page.tsx) |
| `src/app/[locale]/(public)/in/[username]/page.tsx` | Create |
| `src/app/[locale]/(protected)/(nav)/settings/profile/page.tsx` | Modify (form edit + connected accounts) |
| `src/actions/profile/get-public-profile.ts` | Create |
| `src/hooks/use-profile-data.ts` | Modify (optional username param) |
| `src/types/profile.ts` | Modify (thêm `onboardingCompleted: boolean`) |
| `src/app/api/auth/link-account/[provider]/route.ts` | Create |
| `src/app/api/auth/unlink-account/route.ts` | Create |

---

## 8. Non-Goals

- Không thay đổi cách hoạt động của `CreateUserFromAuth` (backend vẫn tạo user từ auth sync)
- Không tách auth service riêng
- Không thêm tính năng "delete account" (sẽ làm sau)
- Không thay đổi cấu trúc i18n routing
- Không refactor cache layer của profile data
