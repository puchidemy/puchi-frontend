"client-only";

import { API } from "./api-contracts";
import { isApiError } from "./api-error";
import { fetchWithAuth } from "./fetch-with-auth";
import {
  stubCompleteScene,
  stubCompleteStory,
  stubGetCity,
  stubGetStory,
  stubGradeActivity,
  stubListCities,
  stubSceneBelongsToKnownStory,
  stubStartActivity,
  stubStoryKnown,
} from "./journey-cities/stub-data";
import { isCompiledStory } from "./story-engine";
import { guestRequiresLoginForCity } from "./learn-soft-gate";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/**
 * @deprecated Legacy seed unit id for `/lesson/[id]` + claim hydrate only.
 * Main Learn path uses cities/stories (no unit gate).
 */
export const DEFAULT_UNIT_ID =
  process.env.NEXT_PUBLIC_LEARN_UNIT_ID ||
  "11111111-1111-1111-1111-111111111111";

export {
  GUEST_SOFT_GATE_SCENE_LIMIT,
  guestRequiresLoginForCity,
  isGuestFreeCitySlug,
} from "./learn-soft-gate";

const SOFT_GATE_CODES = new Set(["GUEST_SOFT_GATE", "TRIAL_LIMIT"]);

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type StoryProgressStatus =
  | "not_started"
  | "in_progress"
  | "completed";

export interface LearnCity {
  id: string;
  slug: string;
  name: string;
  position: number;
  map_x: number;
  map_y: number;
  cover_url: string | null;
  blurb: string | null;
  story_count: number;
  completed_story_count: number;
}

export interface LearnCityStorySummary {
  id: string;
  slug: string;
  title: string;
  summary: string;
  cover_url: string | null;
  cefr: CefrLevel | string;
  tags: string[];
  est_minutes: number | null;
  status: string;
  progress_status?: StoryProgressStatus;
}

export interface ListCitiesResponse {
  cities: LearnCity[];
}

export interface GetCityResponse {
  city: LearnCity;
  stories: LearnCityStorySummary[];
  continue_story_id: string | null;
  recommended_story_ids: string[];
}

export interface LearnStoryDetail {
  id: string;
  city_id: string;
  city_slug: string;
  slug: string;
  title: string;
  summary: string;
  cover_url: string | null;
  cefr: CefrLevel | string;
  tags: string[];
  audio_url: string | null;
  vocab_focus: string[] | null;
  grammar_focus: string[] | null;
  est_minutes: number | null;
}

export interface LearnActivitySummary {
  id: string;
  position: number;
  type: string;
  prompt_json: string;
}

export interface LearnScene {
  id: string;
  position: number;
  title: string | null;
  narration: string;
  dialogue_json: unknown;
  illustration_url: string | null;
  audio_url: string | null;
  progress_status?: StoryProgressStatus;
  activities: LearnActivitySummary[];
}

export interface GetStoryResponse {
  story: LearnStoryDetail;
  scenes: LearnScene[];
  progress_status: StoryProgressStatus;
}

export interface CompleteSceneResponse {
  scene_completed: boolean;
  story_completed: boolean;
  completed_scene_count: number;
  soft_gate: boolean;
}

export interface StoryCompletionSummary {
  vocab_focus: string[];
  grammar_focus: string[];
  listening_seconds: number;
  cultural_fact: string;
}

export interface CompleteStoryResponse {
  xp: number;
  story_completed: boolean;
  summary: StoryCompletionSummary;
}

/** Soft-gate thrown by stub activity path when guest scene quota is hit. */
export class GuestSoftGateError extends Error {
  readonly code = "GUEST_SOFT_GATE";
  constructor(message = "GUEST_SOFT_GATE") {
    super(message);
    this.name = "GuestSoftGateError";
  }
}

/** True when learn-service (or stub) blocks guest outside free trial cities. */
export function isGuestSoftGateError(err: unknown): boolean {
  if (err instanceof GuestSoftGateError) return true;
  if (isApiError(err)) {
    return (
      SOFT_GATE_CODES.has(err.code) ||
      SOFT_GATE_CODES.has(err.reason) ||
      SOFT_GATE_CODES.has(err.message)
    );
  }
  if (err instanceof Error) {
    return (
      err.message.includes("GUEST_SOFT_GATE") ||
      err.message.includes("TRIAL_LIMIT")
    );
  }
  return false;
}

export interface LearnUnit {
  id: string;
  course_id: string;
  position: number;
  title: string;
}

export interface LearnLesson {
  id: string;
  skill_id: string;
  position: number;
  title: string;
  xp_reward: number;
  required: boolean;
  /** Present when the API includes owner progress for this lesson. */
  status?: "not_started" | "in_progress" | "completed";
}

export interface LearnSkill {
  id: string;
  unit_id: string;
  position: number;
  title: string;
  lessons: LearnLesson[];
}

export interface LearnExercise {
  id: string;
  lesson_id: string;
  position: number;
  type: string;
  prompt_json: string;
}

export interface GuestSession {
  guest_id: string;
}

export interface ClaimGuestResponse {
  lessons_merged: number;
}

export interface CompleteLessonResponse {
  xp: number;
  unit_completed: boolean;
}

async function learnRequest<T>(
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

/** Creates server-side guest session and HttpOnly cookie (credentials required). */
export async function ensureGuestSession(): Promise<GuestSession> {
  const res = await fetch(`${API_URL}${API.learn.guestSession}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      body.message || body.error || `Guest session failed (${res.status})`,
    );
  }
  return res.json();
}

/** Merge guest learn progress into authenticated user (Bearer + guest cookie). */
export async function claimGuest(): Promise<ClaimGuestResponse> {
  return learnRequest<ClaimGuestResponse>(API.learn.guestClaim, {
    method: "POST",
    body: "{}",
  });
}

export interface UnitResponse {
  unit: LearnUnit;
  skills: LearnSkill[];
  /** Owner unit progress when returned by learn-service. */
  unit_status?: "not_started" | "in_progress" | "completed";
}

/** @deprecated Legacy Unit/Lesson — not used by City → Story path. */
export async function getUnit(
  unitId: string = DEFAULT_UNIT_ID,
): Promise<UnitResponse> {
  return learnRequest(API.learn.unit(unitId));
}

/** @deprecated Prefer getStory + StoryPlayer. */
export async function getLesson(
  lessonId: string,
): Promise<{ lesson: LearnLesson; exercises: LearnExercise[] }> {
  return learnRequest(API.learn.lesson(lessonId));
}

/** @deprecated Prefer startActivity. */
export async function startLesson(
  lessonId: string,
): Promise<{ attempt_id: string }> {
  return learnRequest(API.learn.startLesson(lessonId), {
    method: "POST",
    body: JSON.stringify({ id: lessonId }),
  });
}

/** @deprecated Prefer submitActivityAnswer. */
export async function submitAnswer(
  attemptId: string,
  exerciseId: string,
  payload: Record<string, unknown>,
): Promise<{ correct: boolean }> {
  return learnRequest(API.learn.submitLessonAnswer(attemptId), {
    method: "POST",
    body: JSON.stringify({
      attempt_id: attemptId,
      exercise_id: exerciseId,
      payload_json: JSON.stringify(payload),
    }),
  });
}

/** @deprecated Prefer completeScene / completeStory. */
export async function completeLesson(
  lessonId: string,
): Promise<CompleteLessonResponse> {
  return learnRequest(API.learn.completeLesson(lessonId), {
    method: "POST",
    body: JSON.stringify({ id: lessonId }),
  });
}

/** Story-first RPCs may be absent until backend phase lands — prefer stub shells. */
function shouldUseStoryStub(err: unknown): boolean {
  if (isApiError(err)) {
    return (
      err.status === 404 ||
      err.status === 501 ||
      err.status === 502 ||
      err.status === 503 ||
      err.status >= 500
    );
  }
  if (err instanceof Error) {
    return /\b(404|501|502|503|Failed to fetch|NetworkError|ECONNREFUSED)\b/i.test(
      err.message,
    );
  }
  return false;
}

/**
 * List cities for the journey map.
 * Falls back to FE stub shells when learn-service Story RPCs are not ready.
 */
export async function listCities(): Promise<ListCitiesResponse> {
  try {
    return await learnRequest<ListCitiesResponse>(API.learn.cities);
  } catch (err) {
    if (shouldUseStoryStub(err)) return stubListCities();
    throw err;
  }
}

/**
 * City hub + story library payload.
 * Sprint 1: Hanoi library prefers compiled Story Packages on the client.
 * Other cities fall back to stub when backend Story RPCs are unavailable.
 */
export async function getCity(slug: string): Promise<GetCityResponse> {
  const stub = stubGetCity(slug);
  if (
    slug === "hanoi" &&
    stub?.stories.some((s) => isCompiledStory(s.id))
  ) {
    return stub;
  }
  try {
    return await learnRequest<GetCityResponse>(API.learn.city(slug));
  } catch (err) {
    if (shouldUseStoryStub(err)) {
      if (stub) return stub;
    }
    throw err;
  }
}

/**
 * Story detail for the player shell.
 * Sprint 1: compiled packages load first (no CMS/backend required).
 */
export async function getStory(id: string): Promise<GetStoryResponse> {
  if (isCompiledStory(id)) {
    const packaged = stubGetStory(id);
    if (packaged) return packaged;
  }
  try {
    return await learnRequest<GetStoryResponse>(API.learn.story(id));
  } catch (err) {
    if (shouldUseStoryStub(err)) {
      const stub = stubGetStory(id);
      if (stub) return stub;
    }
    throw err;
  }
}

/**
 * Start (or resume) the activity attempt for a scene.
 * Falls back to stub attempt when Story RPCs are not ready.
 */
export async function startActivity(
  sceneId: string,
  options?: { citySlug?: string; completedSceneCount?: number },
): Promise<{ attempt_id: string }> {
  try {
    return await learnRequest<{ attempt_id: string }>(
      API.learn.startActivity(sceneId),
      {
        method: "POST",
        body: JSON.stringify({ scene_id: sceneId }),
      },
    );
  } catch (err) {
    if (isGuestSoftGateError(err)) throw err;
    if (shouldUseStoryStub(err) && stubSceneBelongsToKnownStory(sceneId)) {
      if (guestRequiresLoginForCity(options?.citySlug)) {
        throw new GuestSoftGateError();
      }
      return stubStartActivity(sceneId);
    }
    throw err;
  }
}

export async function submitActivityAnswer(
  attemptId: string,
  activityId: string,
  payload: Record<string, unknown>,
): Promise<{ correct: boolean }> {
  try {
    return await learnRequest<{ correct: boolean }>(
      API.learn.submitActivityAnswer(attemptId),
      {
        method: "POST",
        body: JSON.stringify({
          attempt_id: attemptId,
          activity_id: activityId,
          payload_json: JSON.stringify(payload),
        }),
      },
    );
  } catch (err) {
    if (isGuestSoftGateError(err)) throw err;
    if (shouldUseStoryStub(err) && attemptId.startsWith("stub-attempt-")) {
      return { correct: stubGradeActivity(activityId, payload) };
    }
    // Live attempt may 404 while story was loaded from stub — grade offline.
    if (shouldUseStoryStub(err)) {
      return { correct: stubGradeActivity(activityId, payload) };
    }
    throw err;
  }
}

export async function completeScene(
  sceneId: string,
  options?: { citySlug?: string; completedSceneCountAfter?: number },
): Promise<CompleteSceneResponse> {
  try {
    return await learnRequest<CompleteSceneResponse>(
      API.learn.completeScene(sceneId),
      {
        method: "POST",
        body: JSON.stringify({ id: sceneId }),
      },
    );
  } catch (err) {
    if (isGuestSoftGateError(err)) throw err;
    if (shouldUseStoryStub(err) && stubSceneBelongsToKnownStory(sceneId)) {
      if (guestRequiresLoginForCity(options?.citySlug)) {
        throw new GuestSoftGateError();
      }
      const count = options?.completedSceneCountAfter ?? 1;
      return stubCompleteScene(sceneId, count);
    }
    throw err;
  }
}

export async function completeStory(
  storyId: string,
): Promise<CompleteStoryResponse> {
  try {
    return await learnRequest<CompleteStoryResponse>(
      API.learn.completeStory(storyId),
      {
        method: "POST",
        body: JSON.stringify({ id: storyId }),
      },
    );
  } catch (err) {
    if (isGuestSoftGateError(err)) throw err;
    if (shouldUseStoryStub(err) && stubStoryKnown(storyId)) {
      return stubCompleteStory(storyId);
    }
    throw err;
  }
}
