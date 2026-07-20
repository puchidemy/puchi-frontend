"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  useStorySavedWordsStore,
  type SavedStoryItem,
} from "@/store/story-saved-words";

export type SpacedRepetitionPracticeProps = {
  storyId: string;
  onDone: () => void;
};

function meaningFor(
  meaning: Record<string, string> | undefined,
  locale: string,
): string {
  if (!meaning) return "";
  if (meaning[locale]) return meaning[locale]!;
  if (meaning.en) return meaning.en;
  if (meaning.vi) return meaning.vi;
  return Object.values(meaning)[0] ?? "";
}

export function SpacedRepetitionPractice({
  storyId,
  onDone,
}: SpacedRepetitionPracticeProps) {
  const t = useTranslations("Learn.Story");
  const locale = useLocale();
  const listReviewQueue = useStorySavedWordsStore((s) => s.listReviewQueue);
  const markKnown = useStorySavedWordsStore((s) => s.markKnown);
  const markAgain = useStorySavedWordsStore((s) => s.markAgain);

  const queue = useMemo(
    () => listReviewQueue(storyId),
    [listReviewQueue, storyId],
  );
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  if (queue.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-lg font-semibold">{t("modes.emptyTitle")}</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {t("modes.srsEmpty")}
        </p>
        <Button variant="primary" className="mt-2 h-12" onClick={onDone}>
          {t("hub.backToMenu")}
        </Button>
      </div>
    );
  }

  const item: SavedStoryItem = queue[Math.min(index, queue.length - 1)]!;
  const meaning = meaningFor(item.meaning, locale);
  const isLast = index >= queue.length - 1;

  const advance = () => {
    if (isLast) {
      onDone();
      return;
    }
    setIndex((i) => i + 1);
    setRevealed(false);
  };

  const onKnow = () => {
    markKnown(storyId, item.entryId);
    advance();
  };

  const onAgain = () => {
    markAgain(storyId, item.entryId);
    advance();
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 overflow-y-auto px-4 py-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("hub.srsTitle")}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("modes.step", {
            current: Math.min(index + 1, queue.length),
            total: queue.length,
          })}
        </p>
        <p className="mt-2 text-base font-medium">{t("modes.srsPrompt")}</p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/80 px-5 py-8 text-center">
        <p className="text-2xl font-semibold">{item.surface}</p>
        <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
          {item.kind === "phrase" ? t("readListen.phraseLabel") : t("readListen.wordLabel")}
        </p>
        {revealed ? (
          <p className="mt-4 text-base leading-relaxed text-foreground/90">
            {meaning || t("readListen.noMeaning")}
          </p>
        ) : (
          <Button
            type="button"
            variant="secondary"
            className="mt-6 h-11"
            onClick={() => setRevealed(true)}
          >
            {t("modes.srsReveal")}
          </Button>
        )}
      </div>

      {revealed ? (
        <div className="mt-auto grid grid-cols-2 gap-2 pt-2">
          <Button
            type="button"
            variant="secondary"
            className="h-12"
            onClick={onAgain}
          >
            {t("modes.srsAgain")}
          </Button>
          <Button
            type="button"
            variant="primary"
            className="h-12"
            onClick={onKnow}
          >
            {t("modes.srsKnow")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
