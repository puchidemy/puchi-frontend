"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/backend";
import { getErrorI18nKey } from "@/lib/errors";
import type { ActionResult } from "@/types/api";
import type { UserProfile } from "./get-profile";

export async function updateProfile(
  _prevState: ActionResult<UserProfile> | null,
  formData: FormData,
): Promise<ActionResult<UserProfile>> {
  const body = {
    firstName: String(formData.get("firstName") || ""),
    lastName: String(formData.get("lastName") || ""),
    username: String(formData.get("username") || ""),
    bio: String(formData.get("bio") || ""),
  };

  try {
    const data = await backendFetch<UserProfile>("/v1/profile", {
      method: "PUT",
      body: JSON.stringify(body),
    });
    revalidatePath("/[locale]/(protected)/(nav)/profile", "page");
    return { success: true, data };
  } catch (err) {
    return { success: false, error: getErrorI18nKey(err) };
  }
}
