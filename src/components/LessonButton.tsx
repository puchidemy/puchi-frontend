"use client";

import Link from "next/link";
import { Check, Star, ChevronsRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import AnimatedCircularProgressBar from "./ui/animated-circular-progress-bar";
import { cn } from "@/lib/utils";

type LessonButtonProps = {
  index: number;
  lesson: {
    id: number;
    type: string;
    activePercentage: number;
  };
  color: string;
};

const LessonButton = ({ index, lesson, color }: LessonButtonProps) => {
  const cycleLength = 8;
  const cycleIndex = index % cycleLength;

  let indentationLevel;

  if (cycleIndex <= 2) indentationLevel = cycleIndex;
  else if (cycleIndex <= 4) indentationLevel = 4 - cycleIndex;
  else if (cycleIndex <= 6) indentationLevel = 4 - cycleIndex;
  else indentationLevel = cycleIndex - 8;

  const rightPosition = indentationLevel * 40;

  const isFirst = lesson.type === "DICTATION";
  const isNotStarted = lesson.activePercentage === 0;
  const isCompleted = lesson.activePercentage === 100;
  const isJump = isFirst && lesson.activePercentage === 0;

  const Icon = isJump ? ChevronsRight : isCompleted ? Check : Star;
  const lowercaseType = lesson.type.toLocaleLowerCase();

  return (
    <Link
      href={`lesson/${lowercaseType}/${lesson.id}`}
      aria-disabled={isNotStarted}
      style={{ pointerEvents: isFirst || !isNotStarted ? "auto" : "none" }}
    >
      <div
        className="relative"
        style={{
          right: `${rightPosition}px`,
          marginTop: isFirst && !isCompleted ? 60 : 24,
        }}
      >
        <div className="relative h-[102px] w-[102px]">
          {isFirst ? (
            <>
              <div
                className="absolute z-1 -top-8 animate-bounce-slow rounded-xl border-2 px-3 py-2.5 font-bold uppercase tracking-wide bg-background/95 whitespace-nowrap"
                style={{
                  color,
                  left: isJump ? "-14px" : "11px",
                }}
              >
                {isJump ? "Jump here?" : "Start"}
                <div
                  className="absolute -bottom-2 left-1/2 h-0 w-0 -translate-x-1/2 transform border-x-8 border-t-8 border-x-transparent"
                  aria-hidden
                />
              </div>
              <AnimatedCircularProgressBar
                max={100}
                min={0}
                value={lesson.activePercentage}
                gaugePrimaryColor="#58CC02"
                gaugeSecondaryColor="#525252"
                className="w-[100px] h-[96px]"
              >
                <Button
                  size="rounded"
                  variant="immersive"
                  className="w-[70px] h-[68px] border-b-8 hover:translate-y-[1px] hover:border-b-[7px]"
                  style={{ backgroundColor: color }}
                >
                  <Icon
                    className={cn(
                      "h-10 w-10 text-gray-50 stroke-[4]",
                      !isNotStarted && "fill-gray-100",
                      isCompleted && "fill-none"
                    )}
                  />
                </Button>
              </AnimatedCircularProgressBar>
            </>
          ) : (
            <>
              <Button
                size="rounded"
                variant={isNotStarted ? "locked" : "secondary"}
                // style={{ backgroundColor: currColor }}
                className="w-[70px] h-[70px] border-b-8 hover:translate-y-[1px] hover:border-b-[7px]"
              >
                <Icon
                  className={cn(
                    "h-10 w-10 fill-gray-100 text-gray-100",
                    isNotStarted &&
                      "fill-neutral-400 stroke-neutral-400 text-neutral-400",
                    isCompleted && "fill-none"
                  )}
                />
              </Button>
            </>
          )}
        </div>
      </div>
    </Link>
  );
};

export default LessonButton;
