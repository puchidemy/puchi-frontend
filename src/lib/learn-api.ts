"client-only";

import { isApiError } from "./api-error";
import { fetchWithAuth } from "./fetch-with-auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/**
 * Default curriculum unit shown on /learn (seed unit).
 * Prefer NEXT_PUBLIC_LEARN_UNIT_ID; NEXT_PUBLIC_TRIAL_UNIT_ID kept as legacy alias.
 */
export const DEFAULT_UNIT_ID =
  process.env.NEXT_PUBLIC_LEARN_UNIT_ID ||
  process.env.NEXT_PUBLIC_TRIAL_UNIT_ID ||
  "11111111-1111-1111-1111-111111111111";

/** @deprecated Use DEFAULT_UNIT_ID */
export const TRIAL_UNIT_ID = DEFAULT_UNIT_ID;

const SOFT_GATE_CODES = new Set(["GUEST_SOFT_GATE", "TRIAL_LIMIT"]);

/** True when learn-service blocks guest start/complete (completed ≥ 3). */
export function isGuestSoftGateError(err: unknown): boolean {
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
  const res = await fetch(`${API_URL}/v1/learn/guest/session`, {
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
  return learnRequest<ClaimGuestResponse>("/v1/learn/guest/claim", {
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

/** @deprecated Use UnitResponse */
export type TrialUnitResponse = UnitResponse;

export async function getUnit(
  unitId: string = DEFAULT_UNIT_ID,
): Promise<UnitResponse> {
  return learnRequest(`/v1/learn/units/${unitId}`);
}

/** @deprecated Use getUnit */
export async function getTrialUnit(
  unitId: string = DEFAULT_UNIT_ID,
): Promise<UnitResponse> {
  return getUnit(unitId);
}

export async function getLesson(
  lessonId: string,
): Promise<{ lesson: LearnLesson; exercises: LearnExercise[] }> {
  return learnRequest(`/v1/learn/lessons/${lessonId}`);
}

export async function startLesson(
  lessonId: string,
): Promise<{ attempt_id: string }> {
  return learnRequest(`/v1/learn/lessons/${lessonId}/start`, {
    method: "POST",
    body: JSON.stringify({ id: lessonId }),
  });
}

export async function submitAnswer(
  attemptId: string,
  exerciseId: string,
  payload: Record<string, unknown>,
): Promise<{ correct: boolean }> {
  return learnRequest(`/v1/learn/attempts/${attemptId}/answer`, {
    method: "POST",
    body: JSON.stringify({
      attempt_id: attemptId,
      exercise_id: exerciseId,
      payload_json: JSON.stringify(payload),
    }),
  });
}

export async function completeLesson(
  lessonId: string,
): Promise<CompleteLessonResponse> {
  return learnRequest(`/v1/learn/lessons/${lessonId}/complete`, {
    method: "POST",
    body: JSON.stringify({ id: lessonId }),
  });
}
