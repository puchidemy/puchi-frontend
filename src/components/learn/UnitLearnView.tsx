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
import { TrialUnitHeader, TrialUnitPath } from "./TrialUnitPath";

const GUEST_SOFT_GATE_LIMIT = 3;

/** Real curriculum unit path for guest + authenticated learners. */
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
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !unit) {
    return (
      <div className="p-8 max-w-md mx-auto space-y-4">
        <Alert variant="destructive">
          <AlertDescription>{error || t("loadError")}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={loadUnit}>
          {t("retry")}
        </Button>
      </div>
    );
  }

  const unitColor = `var(--unit-${unit.position % 10})`;

  return (
    <div className="w-full xl:pr-8 pr-0 font-din">
      <TrialUnitHeader title={unit.title} position={unit.position} />
      <TrialUnitPath
        skills={skills}
        completedLessonIds={completedLessonIds}
        unitColor={unitColor}
        onLockedLessonClick={
          atSoftGate ? () => setGateOpen(true) : undefined
        }
      />
      {atSoftGate && (
        <div className="text-center pb-8 px-4">
          <Button variant="highlight" onClick={() => setGateOpen(true)}>
            {t("saveProgress")}
          </Button>
        </div>
      )}
      <GuestSoftGateDialog open={gateOpen} onOpenChange={setGateOpen} />
    </div>
  );
}
