"use server";

import { backendFetch } from "@/lib/backend";
import { getErrorI18nKey } from "@/lib/errors";
import type { ActionResult } from "@/types/api";

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

export async function getAchievements(): Promise<ActionResult<AchievementItem[]>> {
  try {
    const data = await backendFetch<{ items?: AchievementItem[] } | AchievementItem[]>(
      "/v1/profile/achievements",
    );
    const items = Array.isArray(data) ? data : (data.items ?? []);
    return { success: true, data: items };
  } catch (err) {
    return { success: false, error: getErrorI18nKey(err) };
  }
}
