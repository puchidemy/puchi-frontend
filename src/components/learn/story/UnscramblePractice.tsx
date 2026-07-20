"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  getCompiledStory,
  type CompiledSentence,
} from "@/lib/story-engine";
import { cn } from "@/lib/utils";

export type UnscramblePracticeProps = {
  storyId: string;
  onDone: () => void;
};

type Puzzle = {
  id: string;
  tokens: string[];
  answer: string[];
};

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

function buildPuzzles(storyId: string): Puzzle[] {
  const pkg = getCompiledStory(storyId);
  if (!pkg) return [];

  const sentences: CompiledSentence[] = [];
  for (const scene of pkg.scenes) {
    for (const s of scene.sentences) {
      if (s.words.length >= 3) sentences.push(s);
    }
  }

  return sentences.slice(0, 8).map((s) => {
    const answer = s.words.map((w) => w.surface);
    let tokens = shuffle(answer);
    // Avoid already-correct shuffle.
    if (tokens.join(" ") === answer.join(" ") && tokens.length > 1) {
      tokens = [...tokens.slice(1), tokens[0]!];
    }
    return { id: s.id, tokens, answer };
  });
}

export function UnscramblePractice({
  storyId,
  onDone,
}: UnscramblePracticeProps) {
  const t = useTranslations("Learn.Story");
  const puzzles = useMemo(() => buildPuzzles(storyId), [storyId]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [pool, setPool] = useState<string[]>(() => puzzles[0]?.tokens ?? []);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  if (puzzles.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-lg font-semibold">{t("modes.emptyTitle")}</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {t("modes.unscrambleEmpty")}
        </p>
        <Button variant="primary" className="mt-2 h-12" onClick={onDone}>
          {t("hub.backToMenu")}
        </Button>
      </div>
    );
  }

  const puzzle = puzzles[index]!;
  const isLast = index >= puzzles.length - 1;

  const resetCurrent = (nextIndex = index) => {
    const next = puzzles[nextIndex]!;
    setIndex(nextIndex);
    setPicked([]);
    setPool(next.tokens);
    setFeedback(null);
  };

  const pickToken = (token: string, poolIdx: number) => {
    if (feedback === "correct") return;
    setFeedback(null);
    setPicked((p) => [...p, token]);
    setPool((p) => p.filter((_, i) => i !== poolIdx));
  };

  const unpickToken = (pickedIdx: number) => {
    if (feedback === "correct") return;
    const token = picked[pickedIdx];
    if (!token) return;
    setFeedback(null);
    setPicked((p) => p.filter((_, i) => i !== pickedIdx));
    setPool((p) => [...p, token]);
  };

  const check = () => {
    const ok =
      picked.length === puzzle.answer.length &&
      picked.every((tok, i) => tok === puzzle.answer[i]);
    setFeedback(ok ? "correct" : "wrong");
  };

  const continueNext = () => {
    if (isLast) {
      onDone();
      return;
    }
    resetCurrent(index + 1);
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 overflow-y-auto px-4 py-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("hub.unscrambleTitle")}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("modes.step", { current: index + 1, total: puzzles.length })}
        </p>
        <p className="mt-2 text-base font-medium">{t("modes.unscramblePrompt")}</p>
      </div>

      <div className="min-h-[3.5rem] rounded-2xl border border-dashed border-border/70 bg-card/60 px-3 py-3">
        <div className="flex flex-wrap gap-2">
          {picked.length === 0 ? (
            <span className="text-sm text-muted-foreground">
              {t("modes.unscramblePlace")}
            </span>
          ) : (
            picked.map((tok, i) => (
              <button
                key={`picked-${i}-${tok}`}
                type="button"
                className="rounded-lg bg-primary/15 px-2.5 py-1.5 text-sm font-medium"
                onClick={() => unpickToken(i)}
              >
                {tok}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {pool.map((tok, i) => (
          <button
            key={`pool-${i}-${tok}`}
            type="button"
            className="rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-sm font-medium hover:border-primary/40"
            onClick={() => pickToken(tok, i)}
          >
            {tok}
          </button>
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

      <div className="mt-auto flex flex-col gap-2 pt-2">
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
            disabled={picked.length === 0}
            onClick={check}
          >
            {t("check")}
          </Button>
        )}
      </div>
    </div>
  );
}
