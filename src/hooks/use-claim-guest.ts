"use client";

import { claimGuest, DEFAULT_UNIT_ID, getUnit } from "@/lib/learn-api";
import { progressFromUnit } from "@/lib/trial-progress";
import {
  clearGuestLocalProgress,
  readGuestLocalProgress,
  useTrialLearnStore,
} from "@/store/trial-learn";

export type ClaimGuestResult = {
  claimed: boolean;
  lessonsMerged: number;
};

/**
 * Best-effort hydrate of legacy unit/lesson progress after claim.
 * Story-first progress lives on the server (scenes); unit GET may be absent.
 */
export async function hydrateTrialProgressFromUnit(): Promise<void> {
  const guestLocal = readGuestLocalProgress();
  const store = useTrialLearnStore.getState();

  try {
    const data = await getUnit(DEFAULT_UNIT_ID);
    const server = progressFromUnit(data);

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
  } catch {
    // Unit RPC optional on story-first — keep guest-local lesson ids if any.
    if (
      guestLocal.completedLessonIds.length > 0 ||
      guestLocal.unitCompleted
    ) {
      store.hydrateFromServer(
        guestLocal.completedLessonIds,
        guestLocal.unitCompleted,
      );
    }
  }

  clearGuestLocalProgress();
}

/**
 * Merges server-side guest learn progress into the authenticated user.
 * Safe to call after Limen sign-in; ignores missing-guest-cookie errors.
 */
export async function claimGuestIfNeeded(): Promise<ClaimGuestResult> {
  try {
    const res = await claimGuest();
    await hydrateTrialProgressFromUnit();
    const lessonsMerged =
      typeof res.lessons_merged === "number" ? res.lessons_merged : 0;
    return { claimed: true, lessonsMerged };
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
      return { claimed: false, lessonsMerged: 0 };
    }
    console.warn("[learn] claimGuest failed:", err);
    return { claimed: false, lessonsMerged: 0 };
  }
}
