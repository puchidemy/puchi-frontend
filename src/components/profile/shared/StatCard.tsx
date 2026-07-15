"use client";

import { motion } from "motion/react";

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}

export default function StatCard({ icon: Icon, label, value, color }: StatCardProps) {

  return (
    <motion.div
      className="rounded-2xl p-4 bg-card border border-border transition-shadow duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] cursor-default"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      <div
        className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3"
        style={{ backgroundColor: color, color: "white" }}
      >
        <Icon size={20} />
      </div>
      <p className="text-2xl font-din font-bold tabular-nums">{value}</p>
      <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
    </motion.div>
  );
}
