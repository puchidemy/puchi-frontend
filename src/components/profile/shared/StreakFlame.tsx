"use client";

import { motion, useReducedMotion } from "motion/react";
import { Flame } from "lucide-react";

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
      <motion.div
        animate={prefersReducedMotion ? {} : {
          scale: [1, 1.12, 1],
          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <Flame
          size={s.icon}
          className="text-[var(--unit-4)]"
          style={{ fill: "var(--unit-4)" }}
        />
      </motion.div>
      <span className={`font-display font-extrabold ${s.text} tabular-nums`}>
        {streak}
      </span>
    </div>
  );
}
