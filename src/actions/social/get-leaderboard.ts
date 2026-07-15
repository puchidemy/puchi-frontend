"use server";

import { backendFetch } from "@/lib/backend";
import { getErrorI18nKey } from "@/lib/errors";
import type { ActionResult } from "@/types/api";

export interface LeaderboardUser {
  rank: number;
  userId: string;
  username: string;
  avatarUrl: string;
  level: number;
  weeklyXp: number;
  isCurrentUser: boolean;
}

export async function getLeaderboard(): Promise<ActionResult<LeaderboardUser[]>> {
  try {
    const data = await backendFetch<{ items: LeaderboardUser[] }>("/v1/social/leaderboard");
    return { success: true, data: data.items };
  } catch (err) {
    return { success: false, error: getErrorI18nKey(err) };
  }
}
