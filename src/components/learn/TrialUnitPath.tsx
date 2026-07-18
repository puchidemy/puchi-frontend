"use client";

import { Check, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import AnimatedCircularProgressBar from "@/components/ui/animated-circular-progress-bar";
import { cn } from "@/lib/utils";
import type { LearnLesson, LearnSkill } from "@/lib/learn-api";

interface TrialUnitPathProps {
  skills: LearnSkill[];
  completedLessonIds: string[];
  unitColor: string;
  /** When set, locked/beyond-gate nodes call this instead of navigating. */
  onLockedLessonClick?: () => void;
}

function lessonProgress(
  lesson: LearnLesson,
  completedIds: string[],
  skills: LearnSkill[],
): number {
  if (completedIds.includes(lesson.id)) return 100;
  const allLessons = skills.flatMap((s) => s.lessons);
  const firstIncomplete = allLessons.find((l) => !completedIds.includes(l.id));
  if (firstIncomplete?.id === lesson.id) return 0;
  const lessonIndex = allLessons.findIndex((l) => l.id === lesson.id);
  const firstIndex = allLessons.findIndex((l) => l.id === firstIncomplete?.id);
  return lessonIndex < firstIndex ? 100 : 0;
}

function isLessonUnlocked(
  lesson: LearnLesson,
  completedIds: string[],
  skills: LearnSkill[],
): boolean {
  const allLessons = skills.flatMap((s) => s.lessons);
  const firstIncomplete = allLessons.find((l) => !completedIds.includes(l.id));
  return !firstIncomplete || firstIncomplete.id === lesson.id;
}

export function TrialUnitPath({
  skills,
  completedLessonIds,
  unitColor,
  onLockedLessonClick,
}: TrialUnitPathProps) {
  const t = useTranslations("Learn");
  const allLessons = skills.flatMap((s) => s.lessons);

  return (
    <div className="relative flex flex-col items-center pb-12">
      {allLessons.map((lesson, index) => {
        const progress = lessonProgress(lesson, completedLessonIds, skills);
        const unlocked = isLessonUnlocked(lesson, completedLessonIds, skills);
        const isCompleted = progress === 100;
        const isFirst = index === 0;
        const cycleIndex = index % 8;
        let indentationLevel: number;
        if (cycleIndex <= 2) indentationLevel = cycleIndex;
        else if (cycleIndex <= 4) indentationLevel = 4 - cycleIndex;
        else if (cycleIndex <= 6) indentationLevel = 4 - cycleIndex;
        else indentationLevel = cycleIndex - 8;

        const Icon = isCompleted ? Check : Star;

        const node = (
          <div className="relative h-[102px] w-[102px]">
            {isFirst ? (
              <>
                <div
                  className="absolute z-1 -top-8 animate-bounce-slow rounded-xl border-2 px-3 py-2.5 font-bold uppercase tracking-wide bg-background/95 whitespace-nowrap"
                  style={{ color: unitColor, left: "11px" }}
                >
                  {isCompleted ? lesson.title : t("startLesson")}
                </div>
                <AnimatedCircularProgressBar
                  max={100}
                  min={0}
                  value={progress}
                  gaugePrimaryColor="#58CC02"
                  gaugeSecondaryColor="#525252"
                  className="w-[100px] h-[96px]"
                >
                  <Button
                    asChild
                    size="rounded"
                    variant="immersive"
                    className="w-[70px] h-[68px] border-b-8 hover:translate-y-px hover:border-b-[7px]"
                    style={{ backgroundColor: unitColor }}
                  >
                    <div>
                      <Icon
                        className={cn(
                          "h-10 w-10 text-gray-50 stroke-4",
                          !isCompleted && "fill-gray-100",
                          isCompleted && "fill-none",
                        )}
                      />
                    </div>
                  </Button>
                </AnimatedCircularProgressBar>
              </>
            ) : (
              <Button
                asChild
                size="rounded"
                variant={unlocked && !isCompleted ? "secondary" : "locked"}
                className="w-[70px] h-[70px] border-b-8 hover:translate-y-px hover:border-b-[7px]"
              >
                <div>
                  <Icon
                    className={cn(
                      "h-10 w-10 fill-gray-100 text-gray-100",
                      !unlocked &&
                        "fill-neutral-400 stroke-neutral-400 text-neutral-400",
                      isCompleted && "fill-none",
                    )}
                  />
                </div>
              </Button>
            )}
          </div>
        );

        const offsetStyle = {
          right: `${indentationLevel * 40}px`,
          marginTop: isFirst && !isCompleted ? 60 : 24,
        } as const;

        if (unlocked) {
          return (
            <Link
              key={lesson.id}
              href={`/lesson/${lesson.id}`}
              className="relative"
              style={offsetStyle}
            >
              {node}
            </Link>
          );
        }

        return (
          <div
            key={lesson.id}
            className="relative"
            style={{
              ...offsetStyle,
              pointerEvents: onLockedLessonClick ? "auto" : "none",
            }}
            role={onLockedLessonClick ? "button" : undefined}
            tabIndex={onLockedLessonClick ? 0 : undefined}
            aria-disabled={!onLockedLessonClick}
            onClick={onLockedLessonClick}
            onKeyDown={
              onLockedLessonClick
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onLockedLessonClick();
                    }
                  }
                : undefined
            }
          >
            {node}
          </div>
        );
      })}
    </div>
  );
}

export function TrialUnitHeader({
  title,
  position,
}: {
  title: string;
  position: number;
}) {
  const t = useTranslations("Learn");
  const color = `var(--unit-${position % 10})`;

  return (
    <>
      <div className="sticky z-50 top-0 pt-4 transition-colors duration-300">
        <div
          className="p-4 mx-auto max-w-[560px] h-20 rounded-xl flex justify-between items-center"
          style={{ backgroundColor: color }}
        >
          <div>
            <span className="text-gray-200 text-sm uppercase">
              {t("unitLabel", { position })}
            </span>
            <h1 className="mt-1 text-xl font-bold text-gray-50">{title}</h1>
          </div>
        </div>
      </div>
      <div className="flex justify-center items-center mt-8">
        <Separator className="w-1/3 h-[3px]" />
        <h2 className="mx-4">{t("unitLabel", { position })}</h2>
        <Separator className="w-1/3 h-[3px]" />
      </div>
    </>
  );
}
