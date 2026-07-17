"use client";

import { claimGuest, getTrialUnit, TRIAL_UNIT_ID } from "@/lib/learn-api";
import { progressFromUnit } from "@/lib/trial-progress";
import {
  clearGuestLocalProgress,
  readGuestLocalProgress,
  useTrialLearnStore,
} from "@/store/trial-learn";

/**
 * Hydrate trial path progress from GET unit (server owner progress).
 * Falls back to in-memory / guest-local progress when status fields are absent.
 */
export async function hydrateTrialProgressFromUnit(): Promise<void> {
  const guestLocal = readGuestLocalProgress();
  const data = await getTrialUnit(TRIAL_UNIT_ID);
  const server = progressFromUnit(data);
  const store = useTrialLearnStore.getState();

  if (server.completedLessonIds.length > 0 || server.unitCompleted) {
    store.hydrateFromServer(server.completedLessonIds, server.unitCompleted);
  } else if (
    guestLocal.completedLessonIds.length > 0 ||
    guestLocal.unitCompleted
  ) {
    store.hydrateFromServer(
      guestLocal.completedLessonIds,
      guestLocal.unitCompleted,
    );
  }

  clearGuestLocalProgress();
}

/**
 * Merges server-side guest learn progress into the authenticated user.
 * Safe to call after Limen sign-in; ignores missing-guest-cookie errors.
 */
export async function claimGuestIfNeeded(): Promise<boolean> {
  try {
    await claimGuest();
    await hydrateTrialProgressFromUnit();
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
