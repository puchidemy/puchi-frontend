"use server";

import { backendFetch } from "@/lib/backend";
import { getErrorI18nKey } from "@/lib/errors";
import type { ActionResult } from "@/types/api";

export interface ProfileStats {
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

export async function getStats(): Promise<ActionResult<ProfileStats>> {
  try {
    const data = await backendFetch<ProfileStats>("/v1/profile/stats");
    return { success: true, data };
  } catch (err) {
    return { success: false, error: getErrorI18nKey(err) };
  }
}
