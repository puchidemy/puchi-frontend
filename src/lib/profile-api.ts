"client-only";

import { fetchWithAuth } from "./fetch-with-auth";
import { uploadMediaFile } from "./media-api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ProfileUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
  bio: string;
  onboardingCompleted: boolean;
  ageRange: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileStatsResponse {
  totalLessons: number;
  completedLessons: number;
  totalMinutes: number;
  accuracy: number;
  wordsLearned: number;
  currentXp: number;
  totalXp: number;
  level: number;
  xpToNextLevel: number;
  streak: number;
  longestStreak: number;
  streakFreezes: number;
  crowns: number;
  gems: number;
}

export interface DailyActivityItem {
  date: string;
  lessonsCompleted: number;
  xpEarned: number;
  minutesSpent: number;
}

export interface WeeklyXpItem {
  weekLabel: string;
  xp: number;
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  progress: number;
  progressLabel: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface SocialUserItem {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  level: number;
  streak: number;
  isFollowing: boolean;
}

export interface LeaderboardItem {
  rank: number;
  userId: string;
  username: string;
  avatarUrl: string;
  level: number;
  weeklyXp: number;
  isCurrentUser: boolean;
}

type RawRecord = Record<string, unknown>;

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function num(v: unknown, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

function bool(v: unknown, fallback = false): boolean {
  return typeof v === "boolean" ? v : fallback;
}

function pick(raw: RawRecord, ...keys: string[]): unknown {
  for (const key of keys) {
    if (raw[key] !== undefined && raw[key] !== null) return raw[key];
  }
  return undefined;
}

function timestampToIso(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const obj = value as { seconds?: number | string; nanos?: number };
    if (obj.seconds !== undefined) {
      const seconds = num(obj.seconds);
      return new Date(seconds * 1000).toISOString();
    }
  }
  return "";
}

export function normalizeProfileUser(raw: unknown): ProfileUser {
  const r = (raw ?? {}) as RawRecord;
  return {
    id: str(pick(r, "id")),
    username: str(pick(r, "username")),
    firstName: str(pick(r, "firstName", "first_name")),
    lastName: str(pick(r, "lastName", "last_name")),
    email: str(pick(r, "email")),
    avatarUrl: str(pick(r, "avatarUrl", "avatar_url")),
    bio: str(pick(r, "bio")),
    onboardingCompleted: bool(
      pick(r, "onboardingCompleted", "onboarding_completed"),
    ),
    ageRange: str(pick(r, "ageRange", "age_range")),
    createdAt: timestampToIso(pick(r, "createdAt", "created_at")),
    updatedAt: timestampToIso(pick(r, "updatedAt", "updated_at")),
  };
}

export function normalizeStats(raw: unknown): ProfileStatsResponse {
  const r = (raw ?? {}) as RawRecord;
  return {
    totalLessons: num(pick(r, "totalLessons", "total_lessons")),
    completedLessons: num(pick(r, "completedLessons", "completed_lessons")),
    totalMinutes: num(pick(r, "totalMinutes", "total_minutes")),
    accuracy: num(pick(r, "accuracy")),
    wordsLearned: num(pick(r, "wordsLearned", "words_learned")),
    currentXp: num(pick(r, "currentXp", "current_xp")),
    totalXp: num(pick(r, "totalXp", "total_xp")),
    level: num(pick(r, "level"), 1),
    xpToNextLevel: num(pick(r, "xpToNextLevel", "xp_to_next_level"), 100),
    streak: num(pick(r, "streak")),
    longestStreak: num(pick(r, "longestStreak", "longest_streak")),
    streakFreezes: num(pick(r, "streakFreezes", "streak_freezes")),
    crowns: num(pick(r, "crowns")),
    gems: num(pick(r, "gems")),
  };
}

function normalizeDailyActivity(raw: unknown): DailyActivityItem {
  const r = (raw ?? {}) as RawRecord;
  return {
    date: str(pick(r, "date")),
    lessonsCompleted: num(pick(r, "lessonsCompleted", "lessons_completed")),
    xpEarned: num(pick(r, "xpEarned", "xp_earned")),
    minutesSpent: num(pick(r, "minutesSpent", "minutes_spent")),
  };
}

function normalizeWeeklyXp(raw: unknown): WeeklyXpItem {
  const r = (raw ?? {}) as RawRecord;
  return {
    weekLabel: str(pick(r, "weekLabel", "week_label")),
    xp: num(pick(r, "xp")),
  };
}

function normalizeAchievement(raw: unknown): AchievementItem {
  const r = (raw ?? {}) as RawRecord;
  const unlockedAt = pick(r, "unlockedAt", "unlocked_at");
  return {
    id: str(pick(r, "id")),
    title: str(pick(r, "title")),
    description: str(pick(r, "description")),
    icon: str(pick(r, "icon")),
    color: str(pick(r, "color")),
    progress: num(pick(r, "progress")),
    progressLabel: str(pick(r, "progressLabel", "progress_label")),
    unlocked: bool(pick(r, "unlocked")),
    unlockedAt: unlockedAt ? timestampToIso(unlockedAt) : undefined,
  };
}

function normalizeSocialUser(raw: unknown): SocialUserItem {
  const r = (raw ?? {}) as RawRecord;
  return {
    id: str(pick(r, "id")),
    username: str(pick(r, "username")),
    firstName: str(pick(r, "firstName", "first_name")),
    lastName: str(pick(r, "lastName", "last_name")),
    avatarUrl: str(pick(r, "avatarUrl", "avatar_url")),
    level: num(pick(r, "level")),
    streak: num(pick(r, "streak")),
    isFollowing: bool(pick(r, "isFollowing", "is_following")),
  };
}

function normalizeLeaderboard(raw: unknown): LeaderboardItem {
  const r = (raw ?? {}) as RawRecord;
  return {
    rank: num(pick(r, "rank")),
    userId: str(pick(r, "userId", "user_id")),
    username: str(pick(r, "username")),
    avatarUrl: str(pick(r, "avatarUrl", "avatar_url")),
    level: num(pick(r, "level")),
    weeklyXp: num(pick(r, "weeklyXp", "weekly_xp")),
    isCurrentUser: bool(pick(r, "isCurrentUser", "is_current_user")),
  };
}

function unwrapList(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    const items = (raw as RawRecord).items;
    if (Array.isArray(items)) return items;
  }
  return [];
}

async function profileRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  return fetchWithAuth<T>(`${API_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}

/** GET /v1/profile — current authenticated user. */
export async function getMyProfile(): Promise<ProfileUser> {
  const raw = await profileRequest<unknown>("/v1/profile");
  return normalizeProfileUser(raw);
}

/**
 * GET /v1/profile/{username} — public (auth optional).
 * Bearer is attached when present so owner can see private fields.
 */
export async function getPublicProfile(
  username: string,
): Promise<ProfileUser> {
  const raw = await profileRequest<unknown>(
    `/v1/profile/${encodeURIComponent(username)}`,
  );
  return normalizeProfileUser(raw);
}

/** PUT /v1/profile/avatar body `{ avatarKey }` (protojson) → User with CDN avatarUrl. */
export async function updateAvatar(avatarKey: string): Promise<ProfileUser> {
  const raw = await profileRequest<unknown>("/v1/profile/avatar", {
    method: "PUT",
    body: JSON.stringify({ avatarKey }),
  });
  return normalizeProfileUser(raw);
}

/** GET /v1/profile/stats — zeros for new users once BE is ready. */
export async function getStats(): Promise<ProfileStatsResponse> {
  const raw = await profileRequest<unknown>("/v1/profile/stats");
  return normalizeStats(raw);
}

function formatDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** GET /v1/profile/stats/daily-activity?from=&to= (default ~90d). */
export async function getDailyActivity(
  from?: string,
  to?: string,
): Promise<DailyActivityItem[]> {
  const end = to ? new Date(to) : new Date();
  const start = from
    ? new Date(from)
    : new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    from: formatDateOnly(start),
    to: formatDateOnly(end),
  });
  const raw = await profileRequest<unknown>(
    `/v1/profile/stats/daily-activity?${params}`,
  );
  return unwrapList(raw).map(normalizeDailyActivity);
}

/** GET /v1/profile/stats/weekly-xp?weeks=12 */
export async function getWeeklyXp(weeks = 12): Promise<WeeklyXpItem[]> {
  const params = new URLSearchParams({ weeks: String(weeks) });
  const raw = await profileRequest<unknown>(
    `/v1/profile/stats/weekly-xp?${params}`,
  );
  return unwrapList(raw).map(normalizeWeeklyXp);
}

export async function getAchievements(): Promise<AchievementItem[]> {
  const raw = await profileRequest<unknown>("/v1/profile/achievements");
  return unwrapList(raw).map(normalizeAchievement);
}

export async function getFollowing(): Promise<SocialUserItem[]> {
  const raw = await profileRequest<unknown>("/v1/social/following");
  return unwrapList(raw).map(normalizeSocialUser);
}

export async function getFollowers(): Promise<SocialUserItem[]> {
  const raw = await profileRequest<unknown>("/v1/social/followers");
  return unwrapList(raw).map(normalizeSocialUser);
}

export async function getLeaderboard(): Promise<LeaderboardItem[]> {
  const raw = await profileRequest<unknown>("/v1/social/leaderboard");
  return unwrapList(raw).map(normalizeLeaderboard);
}

/**
 * Upload avatar image then set profile avatarKey.
 * Media: upload-url → PUT → finalize; then PUT /v1/profile/avatar.
 */
export async function uploadAndSetAvatar(file: File): Promise<ProfileUser> {
  const contentType = file.type || "image/jpeg";
  const { objectKey } = await uploadMediaFile(file, "avatar", contentType);
  return updateAvatar(objectKey);
}
