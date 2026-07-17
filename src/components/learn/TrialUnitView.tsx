"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  ensureGuestSession,
  getTrialUnit,
  TRIAL_UNIT_ID,
  type LearnSkill,
  type LearnUnit,
} from "@/lib/learn-api";
import { useAuthStore } from "@/store/auth";
import { useTrialLearnStore } from "@/store/trial-learn";
import { SoftGateDialog } from "./SoftGateDialog";
import { TrialUnitHeader, TrialUnitPath } from "./TrialUnitPath";

export function TrialUnitView() {
  const t = useTranslations("TrialLearn");
  const user = useAuthStore((s) => s.user);
  const unitCompleted = useTrialLearnStore((s) => s.unitCompleted);
  const completedLessonIds = useTrialLearnStore((s) => s.completedLessonIds);

  const [unit, setUnit] = useState<LearnUnit | null>(null);
  const [skills, setSkills] = useState<LearnSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [gateOpen, setGateOpen] = useState(false);

  const loadUnit = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (!user) {
        await ensureGuestSession();
      }
      const data = await getTrialUnit(TRIAL_UNIT_ID);
      setUnit(data.unit);
      setSkills(data.skills);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    loadUnit();
  }, [loadUnit]);

  useEffect(() => {
    if (!user && unitCompleted) {
      setGateOpen(true);
    }
  }, [user, unitCompleted]);

  if (loading) {
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
      />
      {!user && unitCompleted && (
        <div className="text-center pb-8 px-4">
          <Button variant="highlight" onClick={() => setGateOpen(true)}>
            {t("saveProgress")}
          </Button>
        </div>
      )}
      <SoftGateDialog open={gateOpen} onOpenChange={setGateOpen} />
    </div>
  );
}
