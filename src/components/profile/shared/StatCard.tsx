"use client";

import { motion, useReducedMotion } from "motion/react";

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  bgColor: string;
}

export default function StatCard({ icon: Icon, label, value, color, bgColor }: StatCardProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="rounded-2xl p-4 bg-card border border-border transition-shadow duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] cursor-default"
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      <motion.div
        className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 relative overflow-hidden"
        style={{ backgroundColor: bgColor, color }}
        animate={prefersReducedMotion ? {} : {
          scale: [1, 1.08, 1],
          transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <Icon size={20} className="relative z-10" />
        {/* Glow ring */}
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{ backgroundColor: color, opacity: 0.15 }}
          animate={prefersReducedMotion ? {} : {
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.3, 0.15],
            transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
          }}
        />
      </motion.div>
      <p className="text-2xl font-din font-bold tabular-nums">{value}</p>
      <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
    </motion.div>
  );
}
