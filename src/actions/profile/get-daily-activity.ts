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

export async function getDailyActivity(): Promise<ActionResult<DailyActivityItem[]>> {
  try {
    const data = await backendFetch<DailyActivityItem[]>("/v1/profile/stats/daily-activity");
    return { success: true, data };
  } catch (err) {
    return { success: false, error: getErrorI18nKey(err) };
  }
}
