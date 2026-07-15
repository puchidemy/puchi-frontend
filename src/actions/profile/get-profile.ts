"use server";

import { backendFetch } from "@/lib/backend";
import { getErrorI18nKey } from "@/lib/errors";
import type { ActionResult } from "@/types/api";

export interface UserProfile {
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

export async function getProfile(): Promise<ActionResult<UserProfile>> {
  try {
    const data = await backendFetch<UserProfile>("/v1/profile");
    return { success: true, data };
  } catch (err) {
    return { success: false, error: getErrorI18nKey(err) };
  }
}
