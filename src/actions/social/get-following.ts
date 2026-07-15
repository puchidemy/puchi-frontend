"use server";

import { backendFetch } from "@/lib/backend";
import { getErrorI18nKey } from "@/lib/errors";
import type { ActionResult } from "@/types/api";

export interface SocialUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  level: number;
  streak: number;
  isFollowing: boolean;
}

export async function getFollowing(): Promise<ActionResult<SocialUser[]>> {
  try {
    const data = await backendFetch<{ items: SocialUser[] }>("/v1/social/following");
    return { success: true, data: data.items };
  } catch (err) {
    return { success: false, error: getErrorI18nKey(err) };
  }
}

export async function getFollowers(): Promise<ActionResult<SocialUser[]>> {
  try {
    const data = await backendFetch<{ items: SocialUser[] }>("/v1/social/followers");
    return { success: true, data: data.items };
  } catch (err) {
    return { success: false, error: getErrorI18nKey(err) };
  }
}
