"use client";

import { Achievement } from "@/types/profile";
import { Lock } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface BadgeGridProps {
  achievements: Achievement[];
  onBadgeClick?: (achievement: Achievement) => void;
}

function getIcon(name: string) {
  const Icon = (LucideIcons as Record<string, React.ElementType>)[name];
  return Icon || LucideIcons.Circle;
}

export default function BadgeGrid({ achievements, onBadgeClick }: BadgeGridProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
      {achievements.map((achievement) => {
        const Icon = getIcon(achievement.icon);
        return (
          <button
            key={achievement.id}
            onClick={() => onBadgeClick?.(achievement)}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-200 hover:bg-muted/50 active:scale-95"
            style={{
              opacity: achievement.unlocked ? 1 : 0.4,
              filter: achievement.unlocked ? "none" : "grayscale(100%)",
            }}
          >
            <div
              className="relative w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                backgroundColor: achievement.unlocked
                  ? `color-mix(in srgb, ${achievement.color} 15%, transparent)`
                  : "var(--muted)",
                color: achievement.unlocked ? achievement.color : "var(--muted-foreground)",
              }}
            >
              <Icon size={24} />
              {!achievement.unlocked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock size={16} className="text-muted-foreground/60" />
                </div>
              )}
            </div>
            <span className="text-xs text-center font-medium leading-tight line-clamp-2">
              {achievement.title}
            </span>
          </button>
        );
      })}
    </div>
  );
}
