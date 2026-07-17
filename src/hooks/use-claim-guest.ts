"use client";

import { claimGuest } from "@/lib/learn-api";
import { useTrialLearnStore } from "@/store/trial-learn";

/**
 * Merges server-side guest learn progress into the authenticated user.
 * Safe to call after Limen sign-in; ignores missing-guest-cookie errors.
 */
export async function claimGuestIfNeeded(): Promise<boolean> {
  try {
    const result = await claimGuest();
    if (result.lessonsMerged > 0) {
      useTrialLearnStore.getState().reset();
    }
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (
      msg.includes("guest cookie") ||
      msg.includes("already claimed") ||
      msg.includes("404")
    ) {
      return false;
    }
    console.warn("[learn] claimGuest failed:", err);
    return false;
  }
}
