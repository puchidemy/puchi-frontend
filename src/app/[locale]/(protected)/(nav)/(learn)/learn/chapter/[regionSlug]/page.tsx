"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ChapterView } from "@/components/learn/journey/ChapterView";
import { useRouter } from "@/i18n/routing";
import { resolveChapterAccess } from "@/lib/journey-map/chapter-access";
import { deriveLandmarkViews } from "@/lib/journey-map/derive";
import { UNIT_1_JOURNEY_MAP } from "@/lib/journey-map/unit-1-config";
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

export default function ChapterPage() {
  const params = useParams<{ regionSlug: string }>();
  const regionSlug = params.regionSlug;
  const t = useTranslations("Learn");
  const router = useRouter();

  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const completedLessonIds = useTrialLearnStore((s) => s.completedLessonIds);
  const hydrateFromServer = useTrialLearnStore((s) => s.hydrateFromServer);
  const mergeServerProgress = useTrialLearnStore((s) => s.mergeServerProgress);

  const [unit, setUnit] = useState<LearnUnit | null>(null);
  const [skills, setSkills] = useState<LearnSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const redirectedRef = useRef(false);

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

  const access = useMemo(() => {
    if (!unit) return null;
    const views = deriveLandmarkViews(
      UNIT_1_JOURNEY_MAP,
      skills,
      completedLessonIds,
    );
    return resolveChapterAccess(UNIT_1_JOURNEY_MAP, views, regionSlug);
  }, [unit, skills, completedLessonIds, regionSlug]);

  useEffect(() => {
    if (loading || authLoading || !access) return;
    if (access.ok || redirectedRef.current) return;
    redirectedRef.current = true;
    toast.message(
      access.reason === "coming_soon"
        ? t("Journey.comingSoon")
        : t("Journey.locked"),
    );
    router.replace("/learn");
  }, [loading, authLoading, access, t, router]);

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

  if (!access?.ok) {
    return (
      <div className="flex h-full min-h-0 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 overflow-y-auto">
      <ChapterView
        view={access.view}
        unitTitle={unit.title}
        completedLessonIds={completedLessonIds}
      />
    </div>
  );
}
