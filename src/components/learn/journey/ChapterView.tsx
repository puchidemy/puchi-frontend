"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, Check, Lock, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { GuestSoftGateDialog } from "@/components/settings/GuestSoftGateDialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link, useRouter } from "@/i18n/routing";
import type { DerivedLandmarkView } from "@/lib/journey-map/types";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";

const GUEST_SOFT_GATE_LIMIT = 3;

export type ChapterViewProps = {
  view: DerivedLandmarkView;
  unitTitle: string;
  completedLessonIds: string[];
};

export function ChapterView({
  view,
  unitTitle,
  completedLessonIds,
}: ChapterViewProps) {
  const t = useTranslations("Learn");
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [gateOpen, setGateOpen] = useState(false);

  const completed = new Set(completedLessonIds);
  const firstIncompleteIndex = view.lessons.findIndex(
    (l) => !completed.has(l.id),
  );
  const firstIncomplete =
    firstIncompleteIndex >= 0 ? view.lessons[firstIncompleteIndex] : undefined;
  const progressPct =
    view.totalCount > 0
      ? Math.round((view.completedCount / view.totalCount) * 100)
      : 0;

  const landmarkName = t(`Journey.landmark.${view.slug}`);
  const introKey = `Journey.Chapter.intros.${view.slug}`;
  const intro = t.has(introKey) ? t(introKey) : null;

  const atSoftGate =
    !user && completedLessonIds.length >= GUEST_SOFT_GATE_LIMIT;
  const isCompleted = view.status === "completed";
  const ctaLesson = isCompleted
    ? view.lessons[0]
    : firstIncomplete ?? view.lessons[0];

  const goToLesson = (lessonId: string) => {
    const lessonDone = completed.has(lessonId);
    // Soft-gate: block Continue / incomplete lessons for guests at the limit.
    if (atSoftGate && !lessonDone && !isCompleted) {
      setGateOpen(true);
      return;
    }
    router.push(`/lesson/${lessonId}`);
  };

  const onCta = () => {
    if (!ctaLesson) return;
    if (atSoftGate && !isCompleted) {
      setGateOpen(true);
      return;
    }
    router.push(`/lesson/${ctaLesson.id}`);
  };

  return (
    <div className="mx-auto w-full max-w-lg space-y-6 px-4 py-4 font-din pb-10">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild className="-ml-2 gap-1.5">
          <Link href="/learn">
            <ArrowLeft className="h-4 w-4" />
            {t("Journey.Chapter.back")}
          </Link>
        </Button>
        <span className="truncate text-xs text-muted-foreground">
          {unitTitle}
        </span>
      </div>

      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-linear-to-br from-emerald-700/80 via-teal-600/70 to-sky-700/60">
        {view.assets.hero ? (
          <Image
            src={view.assets.hero}
            alt={landmarkName}
            fill
            className="object-cover"
            sizes="(max-width: 512px) 100vw, 512px"
            priority
          />
        ) : (
          <div className="flex h-full items-end p-4">
            <span className="text-lg font-bold text-white drop-shadow-md">
              {landmarkName}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">{landmarkName}</h1>
        {intro && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {intro}
          </p>
        )}
      </div>

      {view.totalCount > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-medium">
            <span>
              {t("Journey.Chapter.progress", {
                completed: view.completedCount,
                total: view.totalCount,
              })}
            </span>
            <span className="tabular-nums text-muted-foreground">
              {progressPct}%
            </span>
          </div>
          <Progress value={progressPct} />
        </div>
      )}

      {view.totalCount === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          {t("Journey.Chapter.emptyLessons")}
        </p>
      ) : (
        <ul className="space-y-2">
          {view.lessons.map((lesson, index) => {
            const done = completed.has(lesson.id);
            const isCurrent =
              !done && index === firstIncompleteIndex;
            const locked =
              !done &&
              firstIncompleteIndex >= 0 &&
              index > firstIncompleteIndex;
            const Icon = done ? Check : locked ? Lock : Star;

            const row = (
              <div
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-3 py-3",
                  done && "border-primary/30 bg-primary/5",
                  isCurrent && "border-primary bg-card shadow-sm",
                  locked && "border-border/60 bg-muted/40 opacity-70",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                    done && "bg-primary text-primary-foreground",
                    isCurrent && "bg-secondary text-secondary-foreground",
                    locked && "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1 truncate font-medium">
                  {lesson.title}
                </span>
              </div>
            );

            if (locked) {
              return <li key={lesson.id}>{row}</li>;
            }

            return (
              <li key={lesson.id}>
                <button
                  type="button"
                  className="w-full text-left transition-opacity hover:opacity-90"
                  onClick={() => goToLesson(lesson.id)}
                >
                  {row}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {ctaLesson && view.totalCount > 0 && (
        <Button
          variant="highlight"
          className="w-full"
          onClick={onCta}
        >
          {isCompleted
            ? t("Journey.Chapter.review")
            : t("Journey.Chapter.continue")}
        </Button>
      )}

      <GuestSoftGateDialog open={gateOpen} onOpenChange={setGateOpen} />
    </div>
  );
}
