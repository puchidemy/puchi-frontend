"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { GuestSoftGateDialog } from "@/components/settings/GuestSoftGateDialog";
import {
  DEFAULT_UNIT_ID,
  ensureGuestSession,
  getUnit,
  type LearnSkill,
  type LearnUnit,
} from "@/lib/learn-api";
import { progressFromUnit } from "@/lib/trial-progress";
import { useAuthStore } from "@/store/auth";
import { useTrialLearnStore } from "@/store/trial-learn";
import { JourneyMapView } from "./journey/JourneyMapView";

const GUEST_SOFT_GATE_LIMIT = 3;

/** Unit 1 Journey Map — full-height board for guest + authenticated learners. */
export function UnitLearnView() {
  const t = useTranslations("Learn");
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const completedLessonIds = useTrialLearnStore((s) => s.completedLessonIds);
  const hydrateFromServer = useTrialLearnStore((s) => s.hydrateFromServer);
  const mergeServerProgress = useTrialLearnStore((s) => s.mergeServerProgress);

  const [unit, setUnit] = useState<LearnUnit | null>(null);
  const [skills, setSkills] = useState<LearnSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [gateOpen, setGateOpen] = useState(false);

  const loadUnit = useCallback(async () => {
    if (authLoading) return;
    setLoading(true);
    setError("");
    try {
      if (!user) {
        await ensureGuestSession();
      }
      const data = await getUnit(DEFAULT_UNIT_ID);
      setUnit(data.unit);
      setSkills(data.skills);

      const progress = progressFromUnit(data);
      if (user) {
        if (progress.completedLessonIds.length > 0 || progress.unitCompleted) {
          hydrateFromServer(
            progress.completedLessonIds,
            progress.unitCompleted,
          );
        }
      } else if (
        progress.completedLessonIds.length > 0 ||
        progress.unitCompleted
      ) {
        mergeServerProgress(
          progress.completedLessonIds,
          progress.unitCompleted,
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [user, authLoading, t, hydrateFromServer, mergeServerProgress]);

  useEffect(() => {
    loadUnit();
  }, [loadUnit]);

  const atSoftGate =
    !user && completedLessonIds.length >= GUEST_SOFT_GATE_LIMIT;

  if (loading || authLoading) {
    return (
      <div className="flex h-full min-h-0 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !unit) {
    return (
      <div className="flex h-full min-h-0 w-full items-center justify-center p-8">
        <div className="mx-auto max-w-md space-y-4">
          <Alert variant="destructive">
            <AlertDescription>{error || t("loadError")}</AlertDescription>
          </Alert>
          <Button variant="outline" onClick={loadUnit}>
            {t("retry")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col font-din">
      <JourneyMapView
        unit={unit}
        skills={skills}
        completedLessonIds={completedLessonIds}
        onLockedLessonClick={
          atSoftGate ? () => setGateOpen(true) : undefined
        }
      />
      {atSoftGate && (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-50 flex justify-center px-3">
          <Button
            variant="highlight"
            className="pointer-events-auto shadow-lg"
            onClick={() => setGateOpen(true)}
          >
            {t("saveProgress")}
          </Button>
        </div>
      )}
      <GuestSoftGateDialog open={gateOpen} onOpenChange={setGateOpen} />
    </div>
  );
}
