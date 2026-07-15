"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/backend";
import { getErrorI18nKey } from "@/lib/errors";
import type { ActionResult } from "@/types/api";

export async function follow(
  followingId: string,
): Promise<ActionResult<void>> {
  try {
    await backendFetch("/v1/social/follow", {
      method: "POST",
      body: JSON.stringify({ following_id: followingId }),
    });
    revalidatePath("/[locale]/(protected)/(nav)/profile", "page");
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: getErrorI18nKey(err) };
  }
}

export async function unfollow(
  followingId: string,
): Promise<ActionResult<void>> {
  try {
    await backendFetch(`/v1/social/follow/${followingId}`, { method: "DELETE" });
    revalidatePath("/[locale]/(protected)/(nav)/profile", "page");
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: getErrorI18nKey(err) };
  }
}
