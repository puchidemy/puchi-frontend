"client-only";

import { fetchWithAuth } from "./fetch-with-auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/** Must match learn-service `trial_unit_id` in config / seed migration. */
export const TRIAL_UNIT_ID =
  process.env.NEXT_PUBLIC_TRIAL_UNIT_ID ||
  "11111111-1111-1111-1111-111111111111";

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

export interface TrialUnitResponse {
  unit: LearnUnit;
  skills: LearnSkill[];
  /** Owner unit progress when returned by learn-service. */
  unit_status?: "not_started" | "in_progress" | "completed";
}

export async function getTrialUnit(
  unitId: string = TRIAL_UNIT_ID,
): Promise<TrialUnitResponse> {
  return learnRequest(`/v1/learn/units/${unitId}`);
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
