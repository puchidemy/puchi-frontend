"use client";

import { cn } from "@/lib/utils";

export type JourneyMapHeaderProps = {
  title: string;
  completedLessons: number;
  totalLessons: number;
  /** Optional preformatted chip (e.g. i18n). Defaults to `{completed}/{total}`. */
  progressLabel?: string;
  className?: string;
};

/**
 * Compact unit bar — not a Duolingo-style sticky full-color block.
 */
export function JourneyMapHeader({
  title,
  completedLessons,
  totalLessons,
  progressLabel,
  className,
}: JourneyMapHeaderProps) {
  const chip =
    progressLabel ?? `${completedLessons}/${totalLessons}`;

  return (
    <header
      className={cn(
        "flex items-center justify-between gap-3 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-sm",
        className,
      )}
    >
      <h1 className="truncate text-lg font-bold tracking-tight">{title}</h1>
      <span
        className="shrink-0 rounded-full border border-border bg-card px-3 py-1 text-sm font-semibold tabular-nums text-muted-foreground"
        aria-label={chip}
      >
        {chip}
      </span>
    </header>
  );
}
