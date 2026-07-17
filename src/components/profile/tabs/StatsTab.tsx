"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { FullProfile, WeeklyXP } from "@/types/profile";
import LearningCalendar from "../shared/LearningCalendar";

interface StatsTabProps {
  profile: FullProfile;
}

function WeeklyXPChart({ data }: { data: WeeklyXP[] }) {
  const width = 600;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 50 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const series = data ?? [];

  if (series.length === 0) {
    return <p className="text-sm text-muted-foreground">No XP data yet</p>;
  }

  const maxXP = Math.max(...series.map((d) => d.xp), 100);
  const minXP = 0;
  const denom = Math.max(series.length - 1, 1);

  const points = series
    .map((d, i) => {
      const x = padding.left + (i / denom) * chartW;
      const y = padding.top + chartH - ((d.xp - minXP) / (maxXP - minXP)) * chartH;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `${padding.left},${padding.top + chartH} ${points} ${width - padding.right},${padding.top + chartH}`;

  const yTicks = [0, Math.round(maxXP / 2), maxXP];

  return (
    <motion.svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {yTicks.map((tick) => {
        const y = padding.top + chartH - ((tick - minXP) / (maxXP - minXP)) * chartH;
        if (y < padding.top || y > padding.top + chartH) return null;
        return (
          <g key={tick}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="var(--border)" strokeWidth={1} />
            <text x={padding.left - 8} y={y + 4} textAnchor="end" className="text-[10px]" fill="var(--muted-foreground)">
              {tick}
            </text>
          </g>
        );
      })}
      {series.filter((_, i) => i % 3 === 0 || i === series.length - 1).map((d) => {
        const origIndex = series.findIndex((item) => item.weekLabel === d.weekLabel);
        const x = padding.left + (origIndex / denom) * chartW;
        return (
          <text key={origIndex} x={x} y={height - 4} textAnchor="middle" className="text-[10px]" fill="var(--muted-foreground)">
            {d.weekLabel.split(" ")[0]}
          </text>
        );
      })}
      <>
        <motion.polygon
          points={areaPoints}
          fill="var(--primary)"
          opacity={0.1}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        />
        <motion.polyline
          points={points}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeInOut" }}
        />
        {series.map((d, i) => {
          const x = padding.left + (i / denom) * chartW;
          const y = padding.top + chartH - ((d.xp - minXP) / (maxXP - minXP)) * chartH;
          return (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r={3}
              fill="var(--primary)"
              stroke="var(--background)"
              strokeWidth={1.5}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6 + i * 0.04, type: "spring", stiffness: 300, damping: 15 }}
            />
          );
        })}
      </>
    </motion.svg>
  );
}

function AccuracyWaffle({ accuracy }: { accuracy: number }) {
  const total = 100;
  const pct = Number.isFinite(accuracy) ? Math.max(0, Math.min(100, accuracy)) : 0;
  const filled = Math.round(pct);

  return (
    <div className="flex items-center gap-4">
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <motion.div
            key={i}
            className="w-2.5 h-2.5 rounded-[2px]"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.003 + 0.2, type: "spring", stiffness: 400, damping: 12 }}
            style={{
              backgroundColor: i < filled ? "var(--primary)" : "var(--muted)",
            }}
          />
        ))}
      </div>
      <motion.span
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 200, damping: 12 }}
        className="text-3xl font-din font-bold tabular-nums"
      >
        {pct}%
      </motion.span>
    </div>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, type: "spring", stiffness: 300, damping: 20 },
  }),
};

export default function StatsTab({ profile }: StatsTabProps) {
  const t = useTranslations("Profile");
  const { dailyActivity, weeklyXP, stats } = profile;

  const sections = [
    { key: "calendar", title: t("stats.learningCalendar"), content: <LearningCalendar data={dailyActivity} /> },
    { key: "xp", title: t("stats.weeklyXP"), content: <WeeklyXPChart data={weeklyXP} /> },
    { key: "accuracy", title: t("stats.accuracy"), content: <AccuracyWaffle accuracy={stats.accuracy} /> },
  ];

  return (
    <div className="space-y-6">
      {sections.map((section, i) => (
        <motion.div
          key={section.key}
          custom={i}
          initial="hidden"
          animate="show"
          variants={cardVariants}
          className="rounded-2xl bg-card border border-border p-5"
        >
          <h3 className="font-display text-lg font-bold mb-4">{section.title}</h3>
          {section.content}
        </motion.div>
      ))}
    </div>
  );
}
