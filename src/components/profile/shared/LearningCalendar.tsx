"use client";

import { useMemo } from "react";
import { DailyActivity } from "@/types/profile";

interface LearningCalendarProps {
  data: DailyActivity[];
}

const INTENSITY_COLORS = [
  "var(--muted)",
  "var(--primary-light)",
  "var(--primary)",
  "var(--primary-depth)",
  "var(--primary-dark)",
];

function getIntensity(xpEarned: number): number {
  if (xpEarned === 0) return 0;
  if (xpEarned < 50) return 1;
  if (xpEarned < 150) return 2;
  if (xpEarned < 300) return 3;
  return 4;
}

export default function LearningCalendar({ data }: LearningCalendarProps) {
  const { weeks, monthLabels } = useMemo(() => {
    const days = [...data].sort((a, b) => a.date.localeCompare(b.date));
    const firstDate = new Date(days[0].date);
    const startDay = firstDate.getDay() || 7;
    const padded = [...Array(startDay - 1).fill(null), ...days];

    const weeks: (DailyActivity | null)[][] = [];
    const monthLabels: { label: string; col: number }[] = [];
    let currentMonth = "";

    for (let i = 0; i < padded.length; i += 7) {
      const week = padded.slice(i, i + 7);
      weeks.push(week);
      const firstOfWeek = week.find((d) => d !== null);
      if (firstOfWeek) {
        const month = new Date(firstOfWeek.date).toLocaleString("en-US", { month: "short" });
        if (month !== currentMonth) {
          monthLabels.push({ label: month, col: Math.floor(i / 7) });
          currentMonth = month;
        }
      }
    }

    return { weeks, monthLabels };
  }, [data]);

  return (
    <div className="overflow-x-auto">
      <div className="flex ml-8 mb-1">
        {monthLabels.map((m, i) => (
          <span
            key={i}
            className="text-xs text-muted-foreground"
            style={{ marginLeft: i === 0 ? m.col * 13 : (m.col - monthLabels[i - 1].col) * 13 }}
          >
            {m.label}
          </span>
        ))}
      </div>
      <div className="flex gap-0.5">
        <div className="flex flex-col gap-0.5 mr-1.5 text-[10px] text-muted-foreground">
          {["Mon", "", "Wed", "", "Fri", "", ""].map((label, i) => (
            <div key={i} className="h-2.5 flex items-center">{i % 2 === 0 ? label : ""}</div>
          ))}
        </div>
        <div className="flex gap-0.5">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {Array.from({ length: 7 }).map((_, di) => {
                const day = week[di];
                const intensity = day ? getIntensity(day.xpEarned) : -1;
                return (
                  <div
                    key={di}
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{
                      backgroundColor: intensity >= 0 ? INTENSITY_COLORS[intensity] : "transparent",
                    }}
                    title={day ? `${day.date}: ${day.lessonsCompleted} lessons, ${day.xpEarned} XP` : undefined}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
        <span>Less</span>
        {INTENSITY_COLORS.map((color, i) => (
          <div key={i} className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
