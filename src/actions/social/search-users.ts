"use server";

import { backendFetch } from "@/lib/backend";
import { getErrorI18nKey } from "@/lib/errors";
import type { ActionResult } from "@/types/api";
import type { SocialUser } from "./get-following";

export async function searchUsers(query: string): Promise<ActionResult<SocialUser[]>> {
  try {
    const data = await backendFetch<{ items: SocialUser[] }>(`/v1/social/search?query=${encodeURIComponent(query)}`);
    return { success: true, data: data.items };
  } catch (err) {
    return { success: false, error: getErrorI18nKey(err) };
  }
}
