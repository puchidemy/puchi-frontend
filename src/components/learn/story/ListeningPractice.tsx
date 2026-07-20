"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getCompiledStory,
  type CompiledSentence,
} from "@/lib/story-engine";
import { cn } from "@/lib/utils";

export type ListeningPracticeProps = {
  storyId: string;
  onDone: () => void;
};

type Item = {
  id: string;
  text: string;
  audioUrl: string | null;
  options: string[];
  answer: string;
};

function playUrl(url: string | null) {
  if (!url) return;
  try {
    void new Audio(url).play();
  } catch {
    // ignore
  }
}

function buildItems(storyId: string): Item[] {
  const pkg = getCompiledStory(storyId);
  if (!pkg) return [];

  const assets = new Map(pkg.assets.map((a) => [a.assetId, a.url]));
  const all: CompiledSentence[] = pkg.scenes.flatMap((s) => s.sentences);
  const withAudio = all.filter((s) => s.audioAssetId && assets.get(s.audioAssetId));
  const pool = withAudio.length > 0 ? withAudio : all;

  return pool.slice(0, 6).map((sentence, idx) => {
    const distractors = all
      .filter((s) => s.id !== sentence.id)
      .map((s) => s.text)
      .slice(0, 3);
    while (distractors.length < 2 && all.length > 1) {
      const fallback = all[(idx + distractors.length + 1) % all.length]!;
      if (fallback.id !== sentence.id) distractors.push(fallback.text);
      else break;
    }
    const options = [sentence.text, ...distractors.slice(0, 2)].sort(() =>
      Math.random() > 0.5 ? 1 : -1,
    );
    return {
      id: sentence.id,
      text: sentence.text,
      audioUrl: sentence.audioAssetId
        ? assets.get(sentence.audioAssetId) ?? null
        : null,
      options,
      answer: sentence.text,
    };
  });
}

export function ListeningPractice({
  storyId,
  onDone,
}: ListeningPracticeProps) {
  const t = useTranslations("Learn.Story");
  const items = useMemo(() => buildItems(storyId), [storyId]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-lg font-semibold">{t("modes.emptyTitle")}</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {t("modes.listeningEmpty")}
        </p>
        <Button variant="primary" className="mt-2 h-12" onClick={onDone}>
          {t("hub.backToMenu")}
        </Button>
      </div>
    );
  }

  const item = items[index]!;
  const isLast = index >= items.length - 1;
  const hasAudio = Boolean(item.audioUrl);

  const check = () => {
    if (!selected) return;
    setFeedback(selected === item.answer ? "correct" : "wrong");
  };

  const continueNext = () => {
    if (isLast) {
      onDone();
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setFeedback(null);
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 overflow-y-auto px-4 py-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("hub.listeningTitle")}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("modes.step", { current: index + 1, total: items.length })}
        </p>
        <p className="mt-2 text-base font-medium">{t("modes.listeningPrompt")}</p>
      </div>

      <Button
        type="button"
        variant="secondary"
        className="h-14 w-full gap-2"
        disabled={!hasAudio}
        onClick={() => playUrl(item.audioUrl)}
      >
        <Volume2 className="h-5 w-5" />
        {hasAudio ? t("modes.playClip") : t("readListen.audioMissing")}
      </Button>

      {!hasAudio ? (
        <p className="text-sm text-muted-foreground">
          {t("modes.listeningNoAudioHint")}
        </p>
      ) : null}

      <div className="space-y-2">
        {item.options.map((opt) => (
          <Button
            key={opt}
            type="button"
            variant={selected === opt ? "primary" : "secondary"}
            className="h-auto min-h-12 w-full justify-start whitespace-normal py-3 text-left"
            disabled={feedback === "correct"}
            onClick={() => {
              setSelected(opt);
              setFeedback(null);
            }}
          >
            {opt}
          </Button>
        ))}
      </div>

      {feedback ? (
        <p
          className={cn(
            "text-sm font-medium",
            feedback === "correct" ? "text-green-600" : "text-red-600",
          )}
        >
          {feedback === "correct" ? t("correct") : t("tryAgain")}
        </p>
      ) : null}

      <div className="mt-auto pt-2">
        {feedback === "correct" ? (
          <Button
            variant="primary"
            className="h-12 w-full"
            onClick={continueNext}
          >
            {isLast ? t("modes.finish") : t("continueActivity")}
          </Button>
        ) : (
          <Button
            variant="primary"
            className="h-12 w-full"
            disabled={!selected}
            onClick={check}
          >
            {t("check")}
          </Button>
        )}
      </div>
    </div>
  );
}
