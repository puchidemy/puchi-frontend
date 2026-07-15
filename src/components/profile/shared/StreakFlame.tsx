"use client";

import { Flame } from "lucide-react";
import { useReducedMotion } from "motion/react";

interface StreakFlameProps {
  streak: number;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { icon: 18, text: "text-lg", container: "gap-1" },
  md: { icon: 28, text: "text-3xl", container: "gap-2" },
  lg: { icon: 36, text: "text-5xl", container: "gap-2" },
} as const;

export default function StreakFlame({ streak, size = "md" }: StreakFlameProps) {
  const prefersReducedMotion = useReducedMotion();
  const s = sizeMap[size];

  return (
    <div className={`flex items-center ${s.container}`}>
      <Flame
        size={s.icon}
        className={prefersReducedMotion ? "text-[var(--unit-4)]" : "text-[var(--unit-4)] animate-pulse"}
        style={{
          fill: "var(--unit-4)",
        }}
      />
      <span className={`font-display font-extrabold ${s.text} tabular-nums`}>
        {streak}
      </span>
    </div>
  );
}
