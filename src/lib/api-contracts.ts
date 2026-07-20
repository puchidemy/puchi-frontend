/**
 * Puchi API surface (single gateway: NEXT_PUBLIC_API_URL = https://api.puchi.io.vn)
 *
 * ┌──────────────┬─────────────────────┬─────────────────────────────────────┐
 * │ Prefix       │ Service             │ Auth                                │
 * ├──────────────┼─────────────────────┼─────────────────────────────────────┤
 * │ /auth/*      │ auth-service (Limen)│ Cookie limen_session + optional     │
 * │              │                     │ Bearer (opaque session token)       │
 * │ /v1/profile* │ core-service        │ Bearer or limen_session cookie      │
 * │ /v1/onboarding│ core-service       │ required                            │
 * │ /v1/social/* │ core-service        │ required                            │
 * │ /v1/learn/*  │ learn-service       │ guest cookie OR Bearer              │
 * │ /v1/media/*  │ media-service       │ required                            │
 * └──────────────┴─────────────────────┴─────────────────────────────────────┘
 *
 * Rules:
 * - Identity/session → always `/auth/...` (no /v1).
 * - Product APIs → always `/v1/<domain>/...`.
 * - FE clients: limen-auth for /auth; clientFetch / *-api.ts for /v1.
 * - Errors: throw ApiError { status, message, reason } from fetch-with-auth.
 */

export type Default = { url: string; method: string; data: unknown; result: unknown };
export type TRequest<T extends Default> = { url: T["url"]; method?: T["method"]; data: T["data"] };
export type TResponse<T extends Default> = T["result"];

/** Stable path constants — prefer these over string literals in new code. */
export const API = {
  auth: {
    signIn: "/auth/signin/credential",
    signUp: "/auth/signup/credential",
    signOut: "/auth/signout",
    me: "/auth/me",
    requestReset: "/auth/passwords/request-reset",
    reset: "/auth/passwords/reset",
  },
  profile: {
    me: "/v1/profile",
    byUsername: (username: string) =>
      `/v1/profile/${encodeURIComponent(username)}`,
    avatar: "/v1/profile/avatar",
    stats: "/v1/profile/stats",
    dailyActivity: "/v1/profile/stats/daily-activity",
    weeklyXp: "/v1/profile/stats/weekly-xp",
    achievements: "/v1/profile/achievements",
  },
  onboarding: {
    complete: "/v1/onboarding/complete",
  },
  social: {
    following: "/v1/social/following",
    followers: "/v1/social/followers",
    leaderboard: "/v1/social/leaderboard",
    search: "/v1/social/search",
  },
  learn: {
    guestSession: "/v1/learn/guest/session",
    guestClaim: "/v1/learn/guest/claim",
    /** Story-first (Phase 2 RPCs) — main Learn path */
    cities: "/v1/learn/cities",
    city: (slug: string) => `/v1/learn/cities/${slug}`,
    story: (id: string) => `/v1/learn/stories/${id}`,
    startActivity: (sceneId: string) =>
      `/v1/learn/scenes/${sceneId}/activities/start`,
    submitActivityAnswer: (attemptId: string) =>
      `/v1/learn/activity-attempts/${attemptId}/answer`,
    completeScene: (id: string) => `/v1/learn/scenes/${id}/complete`,
    completeStory: (id: string) => `/v1/learn/stories/${id}/complete`,
    /**
     * @deprecated Legacy Unit/Lesson RPCs — kept for `/lesson/[id]` bookmarks only.
     * Main path is City → Story → Scene → Activity.
     */
    unit: (id: string) => `/v1/learn/units/${id}`,
    lesson: (id: string) => `/v1/learn/lessons/${id}`,
    startLesson: (id: string) => `/v1/learn/lessons/${id}/start`,
    submitLessonAnswer: (attemptId: string) =>
      `/v1/learn/attempts/${attemptId}/answer`,
    completeLesson: (id: string) => `/v1/learn/lessons/${id}/complete`,
  },
  media: {
    uploadUrl: "/v1/media/upload-url",
    finalize: "/v1/media/finalize",
  },
} as const;

// --- Limen auth contracts ---

export interface APILogin extends Default {
  url: "/auth/signin/credential";
  method: "post";
  data: { credential: string; password: string; remember_me?: boolean };
  result: { user: { id: string; email: string }; token?: string } | { message: string };
}

export interface APIRegister extends Default {
  url: "/auth/signup/credential";
  method: "post";
  data: { email: string; password: string; username?: string; firstname?: string };
  result: { user: { id: string; email: string }; token?: string } | { message: string };
}

export interface APIForgotPassword extends Default {
  url: "/auth/passwords/request-reset";
  method: "post";
  data: { email: string };
  result: Record<string, unknown> | { message: string };
}

export interface APIResetPassword extends Default {
  url: "/auth/passwords/reset";
  method: "post";
  data: { token: string; newPassword: string };
  result: Record<string, unknown> | { message: string };
}

// --- Core profile (representative) ---

export interface APIGetProfile extends Default {
  url: "/v1/profile";
  method: "get";
  data: Record<string, never>;
  result: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    avatarUrl?: string;
    onboardingCompleted?: boolean;
  };
}

export interface APICompleteOnboarding extends Default {
  url: "/v1/onboarding/complete";
  method: "post";
  data: {
    first_name: string;
    last_name: string;
    age_range: string;
    username?: string;
    how_heard?: string;
    why_learn?: string;
    level?: string;
  };
  result: APIGetProfile["result"];
}
