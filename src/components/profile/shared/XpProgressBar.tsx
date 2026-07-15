"use client";

import { useReducedMotion } from "motion/react";

interface XpProgressBarProps {
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
}

export default function XpProgressBar({ currentLevel, currentXP, xpToNextLevel }: XpProgressBarProps) {
  const prefersReducedMotion = useReducedMotion();
  const percent = Math.min(100, (currentXP / xpToNextLevel) * 100);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-muted-foreground">
          XP to Lv. {currentLevel + 1}
        </span>
        <span className="font-din font-bold tabular-nums text-foreground">
          {currentXP.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP
        </span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)]"
          style={{
            width: `${percent}%`,
            transition: prefersReducedMotion ? "none" : "width 0.8s ease-out",
          }}
        />
      </div>
    </div>
  );
}
