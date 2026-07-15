"use client";

import { motion, useReducedMotion } from "motion/react";

interface LevelRingProps {
  level: number;
  progress: number;
  size?: number;
  children: React.ReactNode;
}

export default function LevelRing({ level, progress, size = 120, children }: LevelRingProps) {
  const prefersReducedMotion = useReducedMotion();
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, progress)) / 100) * circumference;

  return (
    <motion.div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      whileHover={{ scale: 1.04 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      <svg
        className="absolute inset-0 -rotate-90"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: prefersReducedMotion
              ? "none"
              : "stroke-dashoffset 1s ease-out",
          }}
          animate={prefersReducedMotion ? {} : {
            opacity: [1, 0.7, 1],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-10 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full min-w-[36px] text-center shadow-md">
        Lv.{level}
      </div>
      <div className="z-0">{children}</div>
    </motion.div>
  );
}
