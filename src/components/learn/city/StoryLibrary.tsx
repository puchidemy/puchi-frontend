"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { LearnCityStorySummary } from "@/lib/learn-api";
import { cn } from "@/lib/utils";
import { StoryCard } from "./StoryCard";

export type StoryLibraryProps = {
  stories: LearnCityStorySummary[];
  continueStoryId: string | null;
  recommendedStoryIds: string[];
};

function Section({
  title,
  children,
  empty,
}: {
  title: string;
  children: ReactNode;
  empty?: boolean;
}) {
  if (empty) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Continue / Recommended / tags / All — empty → Coming soon. */
export function StoryLibrary({
  stories,
  continueStoryId,
  recommendedStoryIds,
}: StoryLibraryProps) {
  const t = useTranslations("Learn");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const byId = useMemo(
    () => new Map(stories.map((s) => [s.id, s])),
    [stories],
  );

  const continueStory = continueStoryId
    ? (byId.get(continueStoryId) ?? null)
    : null;

  const recommended = recommendedStoryIds
    .map((id) => byId.get(id))
    .filter((s): s is LearnCityStorySummary => !!s)
    .filter((s) => s.id !== continueStoryId);

  const tags = useMemo(() => {
    const set = new Set<string>();
    for (const s of stories) {
      for (const tag of s.tags) set.add(tag);
    }
    return [...set].sort();
  }, [stories]);

  const filtered = useMemo(() => {
    if (!activeTag) return stories;
    return stories.filter((s) => s.tags.includes(activeTag));
  }, [stories, activeTag]);

  if (stories.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-4 py-12 text-center">
        <p className="text-base font-semibold">{t("City.comingSoonTitle")}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("City.comingSoonBody")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Section title={t("Story.sections.continue")} empty={!continueStory}>
        {continueStory && <StoryCard story={continueStory} />}
      </Section>

      <Section
        title={t("Story.sections.recommended")}
        empty={recommended.length === 0}
      >
        <ul className="space-y-2">
          {recommended.map((story) => (
            <li key={story.id}>
              <StoryCard story={story} />
            </li>
          ))}
        </ul>
      </Section>

      {tags.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            {t("Story.sections.tags")}
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                activeTag == null
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40",
              )}
              onClick={() => setActiveTag(null)}
            >
              {t("Story.allTags")}
            </button>
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  activeTag === tag
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40",
                )}
                onClick={() =>
                  setActiveTag((cur) => (cur === tag ? null : tag))
                }
              >
                {t.has(`Story.tags.${tag}`) ? t(`Story.tags.${tag}`) : tag}
              </button>
            ))}
          </div>
        </section>
      )}

      <Section title={t("Story.sections.all")}>
        {filtered.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            {t("Story.emptyFilter")}
          </p>
        ) : (
          <ul className="space-y-2">
            {filtered.map((story) => (
              <li key={story.id}>
                <StoryCard story={story} />
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
