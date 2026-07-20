"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getCompiledStory,
  type CompiledSentence,
} from "@/lib/story-engine";
import { cn } from "@/lib/utils";

export type DictationPracticeProps = {
  storyId: string;
  onDone: () => void;
};

type Item = {
  id: string;
  text: string;
  audioUrl: string | null;
};

function normalize(s: string) {
  return s
    .normalize("NFC")
    .toLowerCase()
    .replace(/[.,!?;:…""'']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

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

  const preferred: CompiledSentence[] = [];
  const fallback: CompiledSentence[] = [];

  for (const scene of pkg.scenes) {
    for (const act of scene.activities) {
      if (act.type !== "dictation") continue;
      // Prefer dialogue / longer narration from same scene.
      const pick =
        scene.sentences.find((s) => s.kind === "dialogue") ??
        scene.sentences[0];
      if (pick) preferred.push(pick);
    }
    for (const s of scene.sentences) {
      if (s.words.length >= 4) fallback.push(s);
    }
  }

  const source = preferred.length > 0 ? preferred : fallback.slice(0, 5);
  const unique = new Map<string, CompiledSentence>();
  for (const s of source) unique.set(s.id, s);

  return [...unique.values()].map((s) => ({
    id: s.id,
    text: s.text,
    audioUrl: s.audioAssetId ? assets.get(s.audioAssetId) ?? null : null,
  }));
}

export function DictationPractice({
  storyId,
  onDone,
}: DictationPracticeProps) {
  const t = useTranslations("Learn.Story");
  const items = useMemo(() => buildItems(storyId), [storyId]);
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-lg font-semibold">{t("modes.emptyTitle")}</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {t("modes.dictationEmpty")}
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
    const ok = normalize(text) === normalize(item.text);
    setFeedback(ok ? "correct" : "wrong");
  };

  const continueNext = () => {
    if (isLast) {
      onDone();
      return;
    }
    setIndex((i) => i + 1);
    setText("");
    setFeedback(null);
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 overflow-y-auto px-4 py-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("hub.dictationTitle")}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("modes.step", { current: index + 1, total: items.length })}
        </p>
        <p className="mt-2 text-base font-medium">{t("modes.dictationPrompt")}</p>
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
        <p className="rounded-xl bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
          {t("modes.dictationNoAudioHint")}
          <span className="mt-1 block font-medium text-foreground/80">
            {item.text}
          </span>
        </p>
      ) : null}

      <Input
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setFeedback(null);
        }}
        disabled={feedback === "correct"}
        placeholder={t("typePlaceholder")}
        autoComplete="off"
        className="h-12"
      />

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
            disabled={!text.trim()}
            onClick={check}
          >
            {t("check")}
          </Button>
        )}
      </div>
    </div>
  );
}
