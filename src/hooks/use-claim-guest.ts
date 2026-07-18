"use client";

import { claimGuest, DEFAULT_UNIT_ID, getUnit } from "@/lib/learn-api";
import { progressFromUnit } from "@/lib/trial-progress";
import {
  clearGuestLocalProgress,
  readGuestLocalProgress,
  useTrialLearnStore,
} from "@/store/trial-learn";

/**
 * Hydrate learn path progress from GET unit (server owner progress).
 * Falls back to in-memory / guest-local progress when status fields are absent.
 */
export async function hydrateTrialProgressFromUnit(): Promise<void> {
  const guestLocal = readGuestLocalProgress();
  const data = await getUnit(DEFAULT_UNIT_ID);
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
    // Missing guest trial / already claimed are expected after normal login.
    const msg = err instanceof Error ? err.message.toLowerCase() : "";
    const status =
      err && typeof err === "object" && "status" in err
        ? Number((err as { status: number }).status)
        : 0;
    if (
      status === 400 ||
      status === 404 ||
      msg.includes("guest cookie") ||
      msg.includes("already claimed") ||
      msg.includes("not found")
    ) {
      return false;
    }
    console.warn("[learn] claimGuest failed:", err);
    return false;
  }
}
