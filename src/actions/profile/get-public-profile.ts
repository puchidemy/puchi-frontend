"use server";

import { backendFetch } from "@/lib/backend";
import { getErrorI18nKey } from "@/lib/errors";
import type { ActionResult } from "@/types/api";

export interface PublicUserProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
  bio: string;
  createdAt: string;
  updatedAt: string;
}

export async function getPublicProfile(username: string): Promise<ActionResult<PublicUserProfile>> {
  try {
    const data = await backendFetch<PublicUserProfile>(`/v1/profile/${username}`);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: getErrorI18nKey(err) };
  }
}
