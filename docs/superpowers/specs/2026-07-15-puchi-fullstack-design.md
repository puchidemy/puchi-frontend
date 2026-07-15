# Puchi Fullstack Architecture — Profile, Social, Media, Notification

> **Status:** Design approved | **Date:** 2026-07-15
> **Subsystems:** Auth Sync, User Profile, Gamification, Social, Achievements, Notification, Media

## 0. Architecture Decisions

| # | Decision | Choice | Rationale |
|---|----------|--------|-----------|
| 1 | ORM / SQL | **sqlc** | Type-safe from raw SQL, Kratos recommended |
| 2 | Auth sync | **Hybrid** (webhook + lazy creation) | Webhook for early sync, lazy fallback ensures 100% coverage |
| 3 | Service topology | **Full split** — 7 independent services | Each domain owns its schema, gRPC for inter-service |
| 4 | Database | **Shared PostgreSQL**, 1 schema/service | gRPC boundary enforced at code level, migrate to separate DBs later |
| 5 | Media storage | **Garage S3** (self-host) → Cloudflare R2 (scale) | MinIO SDK abstracts provider, 0 code change to swap |
| 6 | Inter-service | **gRPC** (sync) + **NATS** (async events) | gRPC for request-response, NATS for publish/subscribe |
| 7 | Notification | **Gotify** self-hosted | REST API + WebSocket + Android app, thin wrapper in our service |
| 8 | FE API | **Server Actions** (mutations) + **Server Components** (reads) | No CORS, type-safe, revalidatePath, useActionState |

---

## 1. Database Design

### 1.1 `core` Schema — User Profile + Gamification

```sql
CREATE SCHEMA IF NOT EXISTS core;

-- Users table (synced from Supertokens)
CREATE TABLE core.users (
    id             TEXT PRIMARY KEY,
    username       TEXT UNIQUE NOT NULL,
    first_name     TEXT NOT NULL DEFAULT '',
    last_name      TEXT NOT NULL DEFAULT '',
    email          TEXT UNIQUE NOT NULL,
    avatar_key     TEXT,
    bio            TEXT DEFAULT '',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    st_sign_up_at            TIMESTAMPTZ,
    st_third_party_provider  TEXT,
    st_third_party_user_id   TEXT,
    completed_onboarding     BOOLEAN NOT NULL DEFAULT false
);

-- Gamification stats (1:1 with users)
CREATE TABLE core.user_stats (
    user_id          TEXT PRIMARY KEY REFERENCES core.users(id) ON DELETE CASCADE,
    current_xp       INT NOT NULL DEFAULT 0,
    total_xp         INT NOT NULL DEFAULT 0,
    level            INT NOT NULL DEFAULT 1,
    current_streak   INT NOT NULL DEFAULT 0,
    longest_streak   INT NOT NULL DEFAULT 0,
    streak_freezes   INT NOT NULL DEFAULT 0,
    crowns           INT NOT NULL DEFAULT 0,
    gems             INT NOT NULL DEFAULT 0,
    heart_refill_at  TIMESTAMPTZ,
    total_lessons    INT NOT NULL DEFAULT 0,
    total_minutes    INT NOT NULL DEFAULT 0,
    accuracy         REAL NOT NULL DEFAULT 0,
    words_learned    INT NOT NULL DEFAULT 0,
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Daily activity log
CREATE TABLE core.daily_activities (
    id                BIGSERIAL PRIMARY KEY,
    user_id           TEXT NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    activity_date     DATE NOT NULL,
    lessons_completed INT NOT NULL DEFAULT 0,
    xp_earned         INT NOT NULL DEFAULT 0,
    minutes_spent     INT NOT NULL DEFAULT 0,
    UNIQUE (user_id, activity_date)
);

-- Weekly XP history
CREATE TABLE core.xp_history (
    id        BIGSERIAL PRIMARY KEY,
    user_id   TEXT NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    xp_earned INT NOT NULL DEFAULT 0,
    UNIQUE (user_id, week_start)
);

-- Achievement definitions
CREATE TABLE core.achievements_def (
    id               TEXT PRIMARY KEY,
    title            TEXT NOT NULL,
    description      TEXT NOT NULL,
    icon             TEXT NOT NULL,
    color            TEXT NOT NULL,
    category         TEXT NOT NULL,
    requirement_type TEXT NOT NULL,
    requirement_value INT NOT NULL
);

-- User achievement progress
CREATE TABLE core.user_achievements (
    user_id        TEXT NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL REFERENCES core.achievements_def(id),
    progress       INT NOT NULL DEFAULT 0,
    unlocked       BOOLEAN NOT NULL DEFAULT false,
    unlocked_at    TIMESTAMPTZ,
    PRIMARY KEY (user_id, achievement_id)
);

-- Level thresholds
CREATE TABLE core.level_thresholds (
    level       INT PRIMARY KEY,
    xp_required INT NOT NULL
);

-- Indexes
CREATE INDEX idx_users_username ON core.users(username);
CREATE INDEX idx_users_email ON core.users(email);
CREATE INDEX idx_daily_activities_user_date ON core.daily_activities(user_id, activity_date);
CREATE INDEX idx_xp_history_user_week ON core.xp_history(user_id, week_start);
```

### 1.2 `user_social` Schema — Friends + Followers + Leaderboard

```sql
CREATE SCHEMA IF NOT EXISTS user_social;

CREATE TABLE user_social.follows (
    follower_id  TEXT NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    following_id TEXT NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (follower_id, following_id),
    CHECK (follower_id != following_id)
);

CREATE INDEX idx_follows_follower ON user_social.follows(follower_id);
CREATE INDEX idx_follows_following ON user_social.follows(following_id);

CREATE TABLE user_social.weekly_leaderboard (
    id         BIGSERIAL PRIMARY KEY,
    user_id    TEXT NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    weekly_xp  INT NOT NULL DEFAULT 0,
    rank       INT,
    UNIQUE (user_id, week_start)
);

CREATE INDEX idx_leaderboard_week ON user_social.weekly_leaderboard(week_start, rank);
```

### 1.3 `notification` Schema — Preferences + Templates

```sql
CREATE SCHEMA IF NOT EXISTS notification;

CREATE TABLE notification.preferences (
    user_id           TEXT PRIMARY KEY REFERENCES core.users(id) ON DELETE CASCADE,
    push_enabled      BOOLEAN NOT NULL DEFAULT true,
    email_enabled     BOOLEAN NOT NULL DEFAULT false,
    streak_reminder   BOOLEAN NOT NULL DEFAULT true,
    friend_activity   BOOLEAN NOT NULL DEFAULT true,
    promotions        BOOLEAN NOT NULL DEFAULT false,
    quiet_hours_start TIME,
    quiet_hours_end   TIME
);

CREATE TABLE notification.templates (
    id       TEXT PRIMARY KEY,
    title    TEXT NOT NULL,
    body     TEXT NOT NULL,
    category TEXT NOT NULL
);
```

### 1.4 `media` Schema — Object Metadata

```sql
CREATE SCHEMA IF NOT EXISTS media;

CREATE TABLE media.objects (
    id           BIGSERIAL PRIMARY KEY,
    user_id      TEXT NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    object_key   TEXT NOT NULL UNIQUE,
    bucket       TEXT NOT NULL DEFAULT 'puchi-media',
    content_type TEXT NOT NULL,
    category     TEXT NOT NULL,
    size_bytes   BIGINT NOT NULL,
    width        INT,
    height       INT,
    duration_ms  INT,
    bitrate_kbps INT,
    access_level TEXT NOT NULL DEFAULT 'private',
    status       TEXT NOT NULL DEFAULT 'uploading',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_media_user ON media.objects(user_id);
```

### 1.5 Schema Ownership Rules

| Schema | Service Owner | Other services access via |
|---|---|---|
| `core.*` | Core Service | gRPC (CoreInternalService) |
| `user_social.*` | User Service | gRPC (SocialService) |
| `notification.*` | Notification Service | gRPC |
| `media.*` | Media Service | gRPC + HTTP (presigned redirect) |
| `content.*` | Content Service | gRPC |
| `grading.*` | Grading Service | gRPC |

**Rule:** Each service ONLY reads/writes its own schema. Cross-schema data access MUST go through gRPC.

---

## 2. API Design

### 2.1 Core Service — Profile + Stats + Achievements

```protobuf
// app/core/api/profile/v1/profile.proto
service ProfileService {
  // User Profile
  rpc GetProfile(Google.Protobuf.Empty) returns (User);
  rpc UpdateProfile(UpdateProfileRequest) returns (User);
  rpc DeleteAccount(Google.Protobuf.Empty) returns (Google.Protobuf.Empty);

  // Avatar
  rpc RequestAvatarUpload(RequestUploadRequest) returns (UploadURLResponse);
  rpc FinalizeAvatar(FinalizeUploadRequest) returns (User);

  // Stats
  rpc GetStats(Google.Protobuf.Empty) returns (UserStats);
  rpc GetDailyActivity(GetDailyActivityRequest) returns (DailyActivityList);
  rpc GetWeeklyXP(GetWeeklyXPRequest) returns (WeeklyXPList);

  // Achievements
  rpc ListAchievements(Google.Protobuf.Empty) returns (AchievementList);
}
```

### 2.2 Core Internal Service — gRPC-only (cross-service)

```protobuf
// app/core/api/core/v1/core_internal.proto
service CoreInternalService {
  rpc GetUser(GetUserRequest) returns (User);
  rpc BatchGetUsers(BatchGetUsersRequest) returns (BatchGetUsersResponse);
  rpc GetUserStats(GetUserStatsRequest) returns (UserStats);
  rpc OnLessonCompleted(LessonCompletedEvent) returns (Google.Protobuf.Empty);
  rpc OnXPEarned(XPEarnedEvent) returns (Google.Protobuf.Empty);
}
```

### 2.3 User Service — Social

```protobuf
// app/user/api/social/v1/social.proto
service SocialService {
  rpc Follow(FollowRequest) returns (Google.Protobuf.Empty);
  rpc Unfollow(UnfollowRequest) returns (Google.Protobuf.Empty);
  rpc ListFollowing(ListFollowingRequest) returns (SocialUserList);
  rpc ListFollowers(ListFollowersRequest) returns (SocialUserList);
  rpc SearchUsers(SearchUsersRequest) returns (SocialUserList);
  rpc GetWeeklyLeaderboard(Google.Protobuf.Empty) returns (LeaderboardList);
}
```

### 2.4 Notification Service

```protobuf
// app/notification/api/notification/v1/notification.proto
service NotificationService {
  rpc GetPreferences(Google.Protobuf.Empty) returns (Preferences);
  rpc UpdatePreferences(Preferences) returns (Preferences);
  rpc Send(SendNotificationRequest) returns (Google.Protobuf.Empty);
  rpc SendBatch(SendBatchRequest) returns (Google.Protobuf.Empty);
}
```

### 2.5 Media Service

```protobuf
// app/media/api/media/v1/media.proto
service MediaService {
  rpc RequestUploadURL(RequestUploadURLRequest) returns (RequestUploadURLResponse);
  rpc FinalizeUpload(FinalizeUploadRequest) returns (MediaObject);
  rpc GetMedia(GetMediaRequest) returns (MediaObject);
  rpc DeleteMedia(DeleteMediaRequest) returns (Google.Protobuf.Empty);
}
```

### 2.6 Inter-Service Communication Map

```
┌──────────┐ gRPC: GetUser()  ┌──────────┐
│   User   │──────────────────→│   Core   │
│ (social) │←───GetUserStats───│ (profile)│
└──────────┘                   └──────────┘
     │                              │
     │ NATS: user.followed          │ NATS: lesson.completed
     ▼                              ▼
┌──────────────┐              ┌──────────┐
│ Notification │              │   Game   │
└──────────────┘              └──────────┘

NATS Events:
  "lesson.completed" → Core (update stats, xp) + Noti (congrats)
  "user.followed"    → Noti (new follower alert)
  "user.created"     → Core (webhook/lazy) → publish for other services
  "achievement.unlocked" → Noti (badge notification)

Media Service → MinIO SDK → Garage S3 (presigned URLs)
Notification Service → Gotify REST API (delivery)
```

---

## 3. Auth Sync — Supertokens ↔ Core DB

### 3.1 Flow

```
Supertokens Core ──webhook──→ Core Service (POST /v1/internal/webhooks/supertokens)
                                ├── user.created   → INSERT core.users + core.user_stats
                                ├── user.email.updated → UPDATE core.users.email
                                └── user.deleted   → DELETE CASCADE

FE Request ──session──→ Core Middleware (verify)
                          ├── User EXISTS in core.users → normal flow
                          └── User NOT FOUND → LAZY CREATE:
                                ├── st.GetUserPublicInfo(userId).Email
                                ├── INSERT core.users (auto-generate username)
                                ├── INSERT core.user_stats (defaults)
                                └── NATS publish "user.created"
```

### 3.2 Webhook Security

- Endpoint: `POST /v1/internal/webhooks/supertokens` (Cluster DNS only)
- Authentication: `WEBHOOK_SECRET` header checked in handler
- Added to `public_paths` in auth middleware config

### 3.3 Username Generation

```go
// Extract local part from email, clean non-alphanumeric
// "hoan@gmail.com" → "hoan"
// If conflict → append number: "hoan1", "hoan2", ...
// If too short (< 3 chars) → "puchi_user"
// User can change in profile settings later
```

### 3.4 Onboarding

- `core.users.completed_onboarding` flag
- First login → redirect `/onboarding`
- Steps: Choose username → Avatar → Target language
- After completion → set flag + redirect `/learn`

---

## 4. Media Service — Full Design

### 4.1 Architecture

```
Browser ──1. POST /v1/media/upload-url──→ Media Service → MinIO PresignPutObject → Garage S3
                                       ←── { uploadUrl, objectKey, mediaId }
Browser ──2. PUT presigned URL + file─────────────────────────────────────────────→ Garage S3
Browser ──3. POST /v1/media/finalize────→ Media Service → verify + metadata DB
                                       ←── { id, url, width, height, durationMs }
```

### 4.2 Content Types

```
Allowed images: image/jpeg, image/png, image/webp, image/svg+xml
Allowed audio:  audio/mpeg, audio/webm, audio/wav, audio/ogg, audio/mp4
Max image: 5MB   |   Max audio: 20MB
```

### 4.3 Storage Layout

```
puchi-media/
├── avatars/{user_id}/{uuid}.webp
├── lessons/{lesson_id}/images/{uuid}.webp
├── lessons/{lesson_id}/audio/{word}.mp3
├── recordings/{user_id}/{lesson_id}_{timestamp}.webm
└── achievements/{badge_id}.svg
```

### 4.4 CDN Migration Path

| Stage | Storage | CDN | Code change |
|---|---|---|---|
| MVP | Garage | Traefik cache on K3s | 0 |
| Growth | Cloudflare R2 | Cloudflare CDN (built-in) | Endpoint config only |
| Enterprise | AWS S3 | CloudFront | Endpoint + IAM config |

### 4.5 StorageProvider Interface

```go
type StorageProvider interface {
    GenerateUploadURL(ctx, key, opts) (*url.URL, error)
    GenerateDownloadURL(ctx, key, ttl) (*url.URL, error)
    ObjectExists(ctx, key) (bool, error)
    GetPublicURL(key string) string
}
// impl: minio_storage.go (Garage/R2/S3 — same SDK)
```

### 4.6 Audio Streaming Support

- `Accept-Ranges: bytes` header cho phép browser seek audio
- Cache-Control: `public, max-age=31536000` cho lesson audio
- Range request support qua CDN

### 4.7 Cache-Control Strategy

| Category | Cache Header |
|---|---|
| avatar | `public, max-age=31536000, immutable` |
| lesson_image | `public, max-age=604800` |
| lesson_audio | `public, max-age=604800` |
| achievement | `public, max-age=31536000, immutable` |
| recording | `private, no-cache` |

---

## 5. Notification Service

### 5.1 Architecture

```
Game Service ──gRPC──→ Notification Service
                         ├── Check user preferences
                         ├── Load template + fill params
                         ├── Rate limit (Redis)
                         └── Gotify REST API → Gotify Server → WebSocket → Android App
```

### 5.2 Gotify Integration

```go
import "github.com/gotify/go-api-client/v2"

func (ns *NotificationService) sendGotify(msg SendNotificationRequest) error {
    client := gotify.NewClient(endpoint, &http.Client{})
    params := message.NewCreateMessageParams()
    params.Body = &models.MessageExternal{
        Title:    renderTemplate(msg.TitleKey, msg.Params),
        Message:  renderTemplate(msg.BodyKey, msg.Params),
        Priority: getPriority(msg.Category),
    }
    _, err := client.Message.CreateMessage(params, auth.TokenAuth(token))
    return err
}
```

### 5.3 Gotify Deployment

- Self-hosted on K3s cluster
- 1 Deployment + 1 Service (ClusterIP)
- Notification service connects via Cluster DNS

---

## 6. Frontend API Layer

### 6.1 Directory Structure

```
src/
├── actions/                       # Server Actions (replace services/)
│   ├── profile/                   # update-profile.ts, delete-account.ts...
│   ├── social/                    # follow.ts, search-users.ts...
│   ├── notification/              # update-preferences.ts
│   └── media/                     # request-upload-url.ts, finalize-upload.ts
├── lib/
│   ├── backend.ts                 # backendFetch() — auth + error handling
│   ├── errors.ts                  # BackendError → i18n key mapping
│   └── schemas/                   # Zod schemas
├── hooks/
│   ├── use-action.ts              # useAction — toast + loading + error
│   └── use-action-state.ts        # Form action wrapper (React 19)
├── types/
│   └── api.ts                     # ActionResult<T>, PaginatedResponse<T>
└── messages/
    ├── en.json                    # + errors.* + notifications.*
    └── vi.json
```

### 6.2 Core Utility: `backendFetch()`

```typescript
// "server-only" — only importable from Server Components / Server Actions
export async function backendFetch<T>(path: string, opts?: FetchOptions): Promise<T>
// Auto-attaches Authorization: Bearer {accessToken} from SuperTokens session
// Auto-timeout 15s
// Parses error response → throws BackendError(code, status, path)
```

### 6.3 ActionResult Type

```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }  // i18n key
```

### 6.4 Server Action Pattern

```typescript
// actions/profile/update-profile.ts
"use server";
export async function updateProfile(
  _prevState: ActionResult<User> | null,
  formData: FormData,
): Promise<ActionResult<User>> {
  const parsed = updateProfileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message };

  try {
    const data = await backendFetch<User>("/v1/profile", { method: "PUT", body: JSON.stringify(parsed.data) });
    revalidatePath("/[locale]/(protected)/(nav)/profile");
    return { success: true, data };
  } catch (err) {
    return { success: false, error: getErrorI18nKey(err) };
  }
}
```

### 6.5 Client Usage

```tsx
// Client Component
const [result, formAction, isPending] = useActionState(updateProfile);

return (
  <form action={formAction}>
    <input name="firstName" />
    <Button type="submit" disabled={isPending}>
      {isPending ? <Spinner /> : "Save"}
    </Button>
    {result?.success === false && <p className="text-destructive">{t(result.error)}</p>}
  </form>
);
```

### 6.6 2-Step Avatar Upload

```
Step 1: Server Action → requestAvatarUpload(contentType, size) → { uploadUrl, mediaId }
Step 2: Client fetch PUT uploadUrl + file (direct to S3, bypasses server)
Step 3: Server Action → finalizeAvatarUpload(mediaId) → link to profile + revalidate
```

### 6.7 i18n — Error Codes

```json
{
  "errors": {
    "validation": { "invalidInput": "...", "firstNameRequired": "...", "usernameTaken": "..." },
    "auth": { "unauthorized": "...", "sessionExpired": "..." },
    "network": { "timeout": "...", "connectionError": "..." },
    "server": { "internalError": "...", "rateLimited": "..." }
  },
  "notifications": {
    "profileUpdated": "Profile updated!",
    "followed": "You are now following {username}",
    "avatarUploaded": "Avatar updated!"
  }
}
```

---

## 7. Implementation Priority

| Phase | Subsystems | Dependencies |
|---|---|---|
| **P0** | Auth Sync (#1), Core schema (users + user_stats tables), backendFetch utility, basic getProfile action | None — foundation |
| **P1** | User Profile CRUD (#2), FE Server Actions, Profile page wire-up | P0 |
| **P2** | Gamification (#3): XP, streaks, levels, daily_activities | P1 |
| **P3** | Social (#4): User service, follows, leaderboard, search | P1 |
| **P4** | Achievements (#5): Badge grid, progress tracking, NATS events | P2 |
| **P5** | Media (#7): Upload service, avatar flow, presigned URLs | P0 (can parallel) |
| **P6** | Notification (#6): Gotify deploy, preferences, templates | P2 (NATS dependency) |

---

## 8. Tech Stack Summary

| Layer | Technology |
|---|---|
| Backend framework | Go + Kratos v3 (Wire DI, layered: service → biz → data) |
| Database | PostgreSQL 18 (single instance, K3s via CNPG) |
| ORM | sqlc (type-safe codegen from SQL) |
| Migration | golang-migrate (embedded SQL files) |
| Auth | Supertokens self-host (existing) + webhook sync |
| API | gRPC (internal) + gRPC-gateway (HTTP/JSON for FE) |
| Messaging | NATS (async events between services) |
| Storage | Garage S3 → MinIO SDK → Cloudflare R2 (future) |
| Notification | Gotify self-hosted |
| Frontend | Next.js 16 + React 19 |
| FE API layer | Server Actions + Server Components |
| FE State | useActionState (React 19) + Zustand v5 |
| FE Animation | motion (framer-motion v12) |
| FE Styling | Tailwind v4 + Shadcn UI + OKLCH tokens |
| Deployment | K3s cluster + ArgoCD GitOps |
