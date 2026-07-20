"use client";

import { useTranslations } from "next-intl";
import {
  BookOpen,
  Ear,
  Keyboard,
  Shuffle,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type StoryLearnMode =
  | "story"
  | "listening"
  | "unscramble"
  | "dictation"
  | "srs";

export type StoryLearnHubProps = {
  storyTitle: string;
  onSelectMode: (mode: StoryLearnMode) => void;
};

type ModeCard = {
  mode: StoryLearnMode;
  icon: React.ComponentType<{ className?: string }>;
  titleKey: "hub.storyTitle" | "hub.listeningTitle" | "hub.unscrambleTitle" | "hub.dictationTitle" | "hub.srsTitle";
  subtitleKey:
    | "hub.storySubtitle"
    | "hub.listeningSubtitle"
    | "hub.unscrambleSubtitle"
    | "hub.dictationSubtitle"
    | "hub.srsSubtitle";
};

const LEARN_MODES: ModeCard[] = [
  {
    mode: "story",
    icon: BookOpen,
    titleKey: "hub.storyTitle",
    subtitleKey: "hub.storySubtitle",
  },
  {
    mode: "listening",
    icon: Ear,
    titleKey: "hub.listeningTitle",
    subtitleKey: "hub.listeningSubtitle",
  },
];

const EXTRA_MODES: ModeCard[] = [
  {
    mode: "unscramble",
    icon: Shuffle,
    titleKey: "hub.unscrambleTitle",
    subtitleKey: "hub.unscrambleSubtitle",
  },
  {
    mode: "dictation",
    icon: Keyboard,
    titleKey: "hub.dictationTitle",
    subtitleKey: "hub.dictationSubtitle",
  },
  {
    mode: "srs",
    icon: Sparkles,
    titleKey: "hub.srsTitle",
    subtitleKey: "hub.srsSubtitle",
  },
];

function ModeButton({
  card,
  onSelect,
}: {
  card: ModeCard;
  onSelect: (mode: StoryLearnMode) => void;
}) {
  const t = useTranslations("Learn.Story");
  const Icon = card.icon;
  return (
    <button
      type="button"
      onClick={() => onSelect(card.mode)}
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl border border-border/60 bg-card/80 px-4 py-3.5 text-left",
        "transition-colors hover:border-primary/40 hover:bg-primary/5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold text-foreground">
          {t(card.titleKey)}
        </span>
        <span className="mt-0.5 block text-sm leading-snug text-muted-foreground">
          {t(card.subtitleKey)}
        </span>
      </span>
    </button>
  );
}

export function StoryLearnHub({ storyTitle, onSelectMode }: StoryLearnHubProps) {
  const t = useTranslations("Learn.Story");

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-8 overflow-y-auto px-4 py-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {storyTitle}
        </h1>
        <p className="text-sm text-muted-foreground">{t("hub.subtitle")}</p>
      </div>

      <section className="space-y-3">
        <h2 className="px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          {t("hub.learnSection")}
        </h2>
        <div className="space-y-2">
          {LEARN_MODES.map((card) => (
            <ModeButton key={card.mode} card={card} onSelect={onSelectMode} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="px-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          {t("hub.extraSection")}
        </h2>
        <div className="space-y-2">
          {EXTRA_MODES.map((card) => (
            <ModeButton key={card.mode} card={card} onSelect={onSelectMode} />
          ))}
        </div>
      </section>

      <p className="text-center text-xs text-muted-foreground">
        {t("hub.hint")}
      </p>
    </div>
  );
}
