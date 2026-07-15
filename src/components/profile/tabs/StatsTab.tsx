"use client";

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

  const maxXP = Math.max(...data.map((d) => d.xp), 100);
  const minXP = 0;

  const points = data
    .map((d, i) => {
      const x = padding.left + (i / (data.length - 1)) * chartW;
      const y = padding.top + chartH - ((d.xp - minXP) / (maxXP - minXP)) * chartH;
      return `${x},${y}`;
    })
    .join(" ");

  const yTicks = [0, Math.round(maxXP / 2), maxXP];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
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
      {data.filter((_, i) => i % 3 === 0 || i === data.length - 1).map((d) => {
        const origIndex = data.findIndex((item) => item.weekLabel === d.weekLabel);
        const x = padding.left + (origIndex / (data.length - 1)) * chartW;
        return (
          <text key={origIndex} x={x} y={height - 4} textAnchor="middle" className="text-[10px]" fill="var(--muted-foreground)">
            {d.weekLabel.split(" ")[0]}
          </text>
        );
      })}
      {data.length > 0 && (
        <>
          <polygon
            points={`${padding.left},${padding.top + chartH} ${points} ${width - padding.right},${padding.top + chartH}`}
            fill="var(--primary)"
            opacity={0.1}
          />
          <polyline
            points={points}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {data.map((d, i) => {
            const x = padding.left + (i / (data.length - 1)) * chartW;
            const y = padding.top + chartH - ((d.xp - minXP) / (maxXP - minXP)) * chartH;
            return <circle key={i} cx={x} cy={y} r={3} fill="var(--primary)" stroke="var(--background)" strokeWidth={1.5} />;
          })}
        </>
      )}
    </svg>
  );
}

function AccuracyWaffle({ accuracy }: { accuracy: number }) {
  const total = 100;
  const filled = Math.round(accuracy);

  return (
    <div className="flex items-center gap-4">
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-[2px]"
            style={{
              backgroundColor: i < filled ? "var(--primary)" : "var(--muted)",
            }}
          />
        ))}
      </div>
      <span className="text-3xl font-din font-bold tabular-nums">{accuracy}%</span>
    </div>
  );
}

export default function StatsTab({ profile }: StatsTabProps) {
  const t = useTranslations("Profile");
  const { dailyActivity, weeklyXP, stats } = profile;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-card border border-border p-5">
        <h3 className="font-display text-lg font-bold mb-4">{t("stats.learningCalendar")}</h3>
        <LearningCalendar data={dailyActivity} />
      </div>

      <div className="rounded-2xl bg-card border border-border p-5">
        <h3 className="font-display text-lg font-bold mb-4">{t("stats.weeklyXP")}</h3>
        <WeeklyXPChart data={weeklyXP} />
      </div>

      <div className="rounded-2xl bg-card border border-border p-5">
        <h3 className="font-display text-lg font-bold mb-4">{t("stats.accuracy")}</h3>
        <AccuracyWaffle accuracy={stats.accuracy} />
      </div>
    </div>
  );
}
