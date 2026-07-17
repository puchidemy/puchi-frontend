"use server";

import { backendFetch } from "@/lib/backend";
import { getErrorI18nKey } from "@/lib/errors";
import type { ActionResult } from "@/types/api";

export interface DailyActivityItem {
  date: string;
  lessonsCompleted: number;
  xpEarned: number;
  minutesSpent: number;
}

type RawRecord = Record<string, unknown>;

function unwrapItems(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    const items = (raw as RawRecord).items;
    if (Array.isArray(items)) return items;
  }
  return [];
}

function num(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function normalizeDailyActivity(raw: unknown): DailyActivityItem {
  const r = (raw ?? {}) as RawRecord;
  return {
    date: typeof r.date === "string" ? r.date : "",
    lessonsCompleted: num(r.lessonsCompleted ?? r.lessons_completed),
    xpEarned: num(r.xpEarned ?? r.xp_earned),
    minutesSpent: num(r.minutesSpent ?? r.minutes_spent),
  };
}

/** GET /v1/profile/stats/daily-activity — BE returns `{ items: [...] }`. */
export async function getDailyActivity(): Promise<ActionResult<DailyActivityItem[]>> {
  try {
    const data = await backendFetch<unknown>("/v1/profile/stats/daily-activity");
    return { success: true, data: unwrapItems(data).map(normalizeDailyActivity) };
  } catch (err) {
    return { success: false, error: getErrorI18nKey(err) };
  }
}
