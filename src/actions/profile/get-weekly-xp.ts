"use server";

import { backendFetch } from "@/lib/backend";
import { getErrorI18nKey } from "@/lib/errors";
import type { ActionResult } from "@/types/api";

export interface WeeklyXPItem {
  weekLabel: string;
  xp: number;
}

export async function getWeeklyXP(): Promise<ActionResult<WeeklyXPItem[]>> {
  try {
    const data = await backendFetch<WeeklyXPItem[]>("/v1/profile/stats/weekly-xp");
    return { success: true, data };
  } catch (err) {
    return { success: false, error: getErrorI18nKey(err) };
  }
}
