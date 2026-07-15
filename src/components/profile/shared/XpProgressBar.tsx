"use client";

import { motion, useReducedMotion } from "motion/react";

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
          {currentXP.toLocaleString("en-US")} / {xpToNextLevel.toLocaleString("en-US")} XP
        </span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden relative">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)]"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        {/* Shimmer */}
        {!prefersReducedMotion && (
          <motion.div
            className="absolute inset-0 w-1/3 rounded-full bg-gradient-to-r from-transparent via-white/25 to-transparent"
            animate={{ x: ["-100%", "400%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        )}
      </div>
    </div>
  );
}
