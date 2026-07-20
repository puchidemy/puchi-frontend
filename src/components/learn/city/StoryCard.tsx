"use client";

import Image from "next/image";
import { Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import type { LearnCityStorySummary } from "@/lib/learn-api";
import { cn } from "@/lib/utils";

export type StoryCardProps = {
  story: LearnCityStorySummary;
  className?: string;
};

export function StoryCard({ story, className }: StoryCardProps) {
  const t = useTranslations("Learn");
  const progress = story.progress_status ?? "not_started";
  const cta =
    progress === "completed"
      ? t("Story.review")
      : progress === "in_progress"
        ? t("Story.continue")
        : t("Story.start");

  return (
    <Link
      href={`/learn/story/${story.id}`}
      className={cn(
        "group flex gap-3 rounded-xl border border-border/70 bg-card p-3 transition-colors hover:border-primary/40 hover:bg-primary/5",
        className,
      )}
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
        {story.cover_url ? (
          <Image
            src={story.cover_url}
            alt=""
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-amber-100 to-emerald-100 text-xs font-bold text-emerald-800 dark:from-amber-950 dark:to-emerald-950 dark:text-emerald-200">
            {story.cefr}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-semibold leading-tight group-hover:text-primary">
            {story.title}
          </h3>
          <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            {story.cefr}
          </span>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {story.summary}
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-muted-foreground">
          {story.est_minutes != null && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden />
              {t("Story.minutes", { count: story.est_minutes })}
            </span>
          )}
          {story.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-secondary/60 px-2 py-0.5 text-[11px] font-medium text-secondary-foreground"
            >
              {t.has(`Story.tags.${tag}`) ? t(`Story.tags.${tag}`) : tag}
            </span>
          ))}
          <span className="ml-auto font-medium text-primary">{cta}</span>
        </div>
      </div>
    </Link>
  );
}
