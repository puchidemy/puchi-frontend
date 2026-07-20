"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Volume2,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  getCompiledStory,
  phraseIdAtIndex,
  resolveTap,
  type AnchorHit,
  type CompiledPhrase,
  type CompiledScene,
  type CompiledSentence,
  type CompiledWord,
} from "@/lib/story-engine";
import { useStorySavedWordsStore } from "@/store/story-saved-words";
import { cn } from "@/lib/utils";

export type ReadListenViewProps = {
  storyId: string;
  scene: CompiledScene;
  onContinue: () => void;
  continuing?: boolean;
  /** When true, the final CTA finishes the story instead of advancing a scene. */
  isLastScene?: boolean;
};

type GlossSelection =
  | { kind: "word"; entry: CompiledWord }
  | { kind: "phrase"; entry: CompiledPhrase };

type TokenRun =
  | { kind: "phrase"; phraseId: string; start: number; end: number }
  | { kind: "solo"; index: number };

function playAssetUrl(url: string | null | undefined) {
  if (!url) return false;
  try {
    const audio = new Audio(url);
    void audio.play();
    return true;
  } catch {
    return false;
  }
}

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

/** Group consecutive phrase-covered tokens so the span reads as one unit. */
function groupTokenRuns(
  sentence: CompiledSentence,
  phraseAnchors: CompiledScene["phraseAnchors"],
): TokenRun[] {
  const runs: TokenRun[] = [];
  let i = 0;
  while (i < sentence.words.length) {
    const phraseId = phraseIdAtIndex(sentence.id, i, phraseAnchors);
    if (phraseId) {
      let end = i;
      while (
        end + 1 < sentence.words.length &&
        phraseIdAtIndex(sentence.id, end + 1, phraseAnchors) === phraseId
      ) {
        end += 1;
      }
      runs.push({ kind: "phrase", phraseId, start: i, end });
      i = end + 1;
      continue;
    }
    runs.push({ kind: "solo", index: i });
    i += 1;
  }
  return runs;
}

function WordToken({
  surface,
  tappable,
  onTap,
  className,
}: {
  surface: string;
  tappable: boolean;
  onTap: () => void;
  className?: string;
}) {
  if (!tappable) {
    return <span className={cn("inline", className)}>{surface}</span>;
  }
  return (
    <button
      type="button"
      onClick={onTap}
      className={cn(
        "inline cursor-pointer rounded-sm border-0 bg-transparent p-0 text-inherit",
        "transition-colors hover:bg-primary/10",
        className,
      )}
    >
      {surface}
    </button>
  );
}

function SentencePassage({
  sentence,
  phraseAnchors,
  activePhraseId,
  catalogWordIds,
  isActive,
  onTap,
}: {
  sentence: CompiledSentence;
  phraseAnchors: CompiledScene["phraseAnchors"];
  activePhraseId: string | null;
  catalogWordIds: Set<string>;
  isActive: boolean;
  onTap: (sentence: CompiledSentence, wordIndex: number) => void;
}) {
  const runs = useMemo(
    () => groupTokenRuns(sentence, phraseAnchors),
    [sentence, phraseAnchors],
  );

  return (
    <span
      data-sentence-id={sentence.id}
      data-active={isActive ? "true" : "false"}
      className={cn(
        "inline transition-[color,opacity,background-color] duration-200",
        isActive
          ? "rounded-sm bg-primary/8 font-medium text-foreground"
          : "text-foreground/70",
      )}
    >
      {sentence.kind === "dialogue" && sentence.speaker ? (
        <span
          className={cn(
            "mr-1 font-semibold capitalize",
            isActive ? "text-primary" : "text-primary/70",
          )}
        >
          {sentence.speaker}:
        </span>
      ) : null}
      {runs.map((run) => {
        const startIndex = run.kind === "phrase" ? run.start : run.index;
        const leadingSpace = startIndex > 0 ? " " : null;

        if (run.kind === "phrase") {
          const inActivePhrase =
            Boolean(run.phraseId) && run.phraseId === activePhraseId;
          const tokens = sentence.words.slice(run.start, run.end + 1);
          return (
            <span key={`${sentence.id}-phrase-${run.start}`}>
              {leadingSpace}
              <span
                className={cn(
                  "inline rounded-sm bg-amber-500/15 px-0.5",
                  "[box-decoration-break:clone] underline decoration-amber-600/55 decoration-2 underline-offset-[3px]",
                  inActivePhrase && "bg-amber-500/30",
                )}
              >
                {tokens.map((token, offset) => {
                  const wordIndex = run.start + offset;
                  return (
                    <span key={`${sentence.id}-${wordIndex}`}>
                      {offset > 0 ? " " : null}
                      <WordToken
                        surface={token.surface}
                        tappable
                        onTap={() => onTap(sentence, wordIndex)}
                      />
                    </span>
                  );
                })}
              </span>
            </span>
          );
        }

        const token = sentence.words[run.index]!;
        const inCatalog = Boolean(
          token.wordId && catalogWordIds.has(token.wordId),
        );
        return (
          <span key={`${sentence.id}-${run.index}`}>
            {leadingSpace}
            <WordToken
              surface={token.surface}
              tappable={inCatalog}
              onTap={() => onTap(sentence, run.index)}
              className={
                inCatalog
                  ? "underline decoration-dotted decoration-muted-foreground/45 underline-offset-[3px] hover:decoration-primary/60"
                  : undefined
              }
            />
          </span>
        );
      })}
    </span>
  );
}

export function ReadListenView({
  storyId,
  scene,
  onContinue,
  continuing = false,
  isLastScene = false,
}: ReadListenViewProps) {
  const t = useTranslations("Learn.Story.readListen");
  const locale = useLocale();
  const reduceMotion = useReducedMotion();
  const pkg = getCompiledStory(storyId);
  const passageRef = useRef<HTMLParagraphElement>(null);

  const saveItem = useStorySavedWordsStore((s) => s.saveItem);
  const removeItem = useStorySavedWordsStore((s) => s.removeItem);
  const isSaved = useStorySavedWordsStore((s) => s.isSaved);

  const wordsById = useMemo(() => {
    const map = new Map<string, CompiledWord>();
    for (const w of pkg?.words ?? []) map.set(w.wordId, w);
    return map;
  }, [pkg]);

  const catalogWordIds = useMemo(
    () => new Set(wordsById.keys()),
    [wordsById],
  );

  const phrasesById = useMemo(() => {
    const map = new Map<string, CompiledPhrase>();
    for (const p of pkg?.phrases ?? []) map.set(p.phraseId, p);
    return map;
  }, [pkg]);

  const assetsById = useMemo(() => {
    const map = new Map<string, string | null>();
    for (const a of pkg?.assets ?? []) map.set(a.assetId, a.url);
    return map;
  }, [pkg]);

  const sentences = scene.sentences;
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [selection, setSelection] = useState<GlossSelection | null>(null);
  const [activePhraseId, setActivePhraseId] = useState<string | null>(null);

  const current = sentences[sentenceIndex];
  const isFirst = sentenceIndex <= 0;
  const isLast =
    sentences.length === 0 || sentenceIndex >= sentences.length - 1;
  const glossOpen = Boolean(selection);

  const selectionEntryId =
    selection?.kind === "phrase"
      ? selection.entry.phraseId
      : selection?.entry.wordId;
  const selectionSaved = Boolean(
    selectionEntryId && isSaved(storyId, selectionEntryId),
  );

  const sentenceAudioUrl = current?.audioAssetId
    ? assetsById.get(current.audioAssetId) ?? null
    : null;
  const sceneAudioUrl = scene.audioAssetId
    ? assetsById.get(scene.audioAssetId) ?? null
    : null;
  const replayUrl = sentenceAudioUrl ?? sceneAudioUrl;
  const hasReplayAudio = Boolean(replayUrl);

  // Keep the focused sentence visible when the passage is long.
  useEffect(() => {
    if (!current || !passageRef.current) return;
    const el = passageRef.current.querySelector(
      `[data-sentence-id="${CSS.escape(current.id)}"]`,
    );
    if (el instanceof HTMLElement) {
      el.scrollIntoView({
        block: "nearest",
        behavior: reduceMotion ? "auto" : "smooth",
      });
    }
  }, [current, reduceMotion]);

  const handleTap = useCallback(
    (sentence: CompiledSentence, wordIndex: number) => {
      const hit: AnchorHit | null = resolveTap(
        sentence,
        wordIndex,
        scene.phraseAnchors,
      );
      if (!hit) return;

      if (hit.kind === "phrase") {
        const entry = phrasesById.get(hit.phraseId);
        if (!entry) return;
        setActivePhraseId(hit.phraseId);
        setSelection({ kind: "phrase", entry });
        return;
      }

      const entry = wordsById.get(hit.wordId);
      if (!entry) return;
      setActivePhraseId(null);
      setSelection({ kind: "word", entry });
    },
    [phrasesById, scene.phraseAnchors, wordsById],
  );

  const closeSheet = (open: boolean) => {
    if (!open) {
      setSelection(null);
      setActivePhraseId(null);
    }
  };

  const playSelectionAudio = () => {
    if (!selection) return;
    const assetId = selection.entry.audioAssetId;
    if (!assetId) return;
    playAssetUrl(assetsById.get(assetId) ?? null);
  };

  const toggleSaveSelection = () => {
    if (!selection || !selectionEntryId) return;
    if (selectionSaved) {
      removeItem(storyId, selectionEntryId);
      return;
    }
    saveItem({
      storyId,
      kind: selection.kind,
      entryId: selectionEntryId,
      surface: selection.entry.surface,
      meaning: selection.entry.meaning,
    });
  };

  const goPrev = () => {
    if (isFirst) return;
    setSentenceIndex((i) => Math.max(0, i - 1));
  };

  const goNext = () => {
    if (isLast) {
      onContinue();
      return;
    }
    setSentenceIndex((i) => Math.min(sentences.length - 1, i + 1));
  };

  const replay = () => {
    if (!replayUrl) return;
    playAssetUrl(replayUrl);
  };

  const glossMeaning = selection
    ? meaningFor(selection.entry.meaning, locale)
    : "";

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      {/* Scrollable middle — dictation-style content column */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col">
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("eyebrow")}
            {sentences.length > 0
              ? ` · ${t("sentenceProgress", {
                  current: sentenceIndex + 1,
                  total: sentences.length,
                })}`
              : null}
          </p>

          <div className="min-h-0 flex-1">
            {sentences.length > 0 ? (
              <p
                ref={passageRef}
                className="text-xl leading-relaxed sm:text-2xl"
              >
                <AnimatePresence initial={false} mode="popLayout">
                  {sentences.map((sentence, absoluteIndex) => {
                    const isActive = absoluteIndex === sentenceIndex;
                    return (
                      <motion.span
                        key={sentence.id}
                        layout={!reduceMotion}
                        initial={false}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="inline"
                      >
                        {absoluteIndex > 0 ? " " : null}
                        <SentencePassage
                          sentence={sentence}
                          phraseAnchors={scene.phraseAnchors}
                          activePhraseId={activePhraseId}
                          catalogWordIds={catalogWordIds}
                          isActive={isActive}
                          onTap={handleTap}
                        />
                      </motion.span>
                    );
                  })}
                </AnimatePresence>
              </p>
            ) : (
              <p className="text-muted-foreground">{t("tapHint")}</p>
            )}
          </div>

          <p className="mt-4 text-xs text-muted-foreground">{t("tapHint")}</p>
        </div>
      </div>

      {/* Fixed footer transport — matches dictation border-t action bar */}
      <div
        className={cn(
          "shrink-0 border-t border-border bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))]",
          glossOpen && "invisible pointer-events-none",
        )}
        data-testid="read-listen-transport"
      >
        <div className="mx-auto flex w-full max-w-xl items-center justify-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="h-12 w-12 shrink-0"
            disabled={isFirst || continuing}
            aria-label={t("prevSentence")}
            onClick={goPrev}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            type="button"
            variant="secondary"
            className="h-12 min-w-[7.5rem] flex-1 gap-1.5"
            disabled={!hasReplayAudio || continuing}
            title={hasReplayAudio ? t("replaySentence") : t("audioMissing")}
            aria-label={
              hasReplayAudio ? t("replaySentence") : t("audioMissing")
            }
            onClick={replay}
          >
            {hasReplayAudio ? (
              <>
                <RotateCcw className="h-4 w-4" />
                {t("replaySentence")}
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4" />
                {t("audioMissing")}
              </>
            )}
          </Button>

          {!isLast ? (
            <Button
              type="button"
              variant="primary"
              size="icon"
              className="h-12 w-12 shrink-0"
              disabled={continuing || sentences.length === 0}
              aria-label={t("nextSentence")}
              onClick={goNext}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              className="h-12 min-w-[7.5rem] flex-1"
              disabled={continuing || sentences.length === 0}
              onClick={onContinue}
            >
              {continuing
                ? t("continuing")
                : isLastScene
                  ? t("finishStory")
                  : t("finishReading")}
            </Button>
          )}
        </div>
      </div>

      <Sheet open={glossOpen} onOpenChange={closeSheet}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          {selection ? (
            <SheetHeader className="text-left">
              <SheetTitle className="text-xl">
                {selection.entry.surface}
              </SheetTitle>
              <SheetDescription className="text-sm leading-relaxed">
                {glossMeaning || t("noMeaning")}
              </SheetDescription>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <p className="text-xs text-muted-foreground">
                  {selection.kind === "phrase"
                    ? t("phraseLabel")
                    : t("wordLabel")}
                  {" · "}
                  <span className="font-mono">
                    {selection.kind === "phrase"
                      ? selection.entry.phraseId
                      : selection.entry.wordId}
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-3">
                {selection.entry.audioAssetId ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="gap-1.5"
                    onClick={playSelectionAudio}
                  >
                    <Volume2 className="h-4 w-4" />
                    {t("playGlossAudio")}
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant={selectionSaved ? "secondary" : "primary"}
                  size="sm"
                  className="gap-1.5"
                  onClick={toggleSaveSelection}
                >
                  {selectionSaved ? (
                    <>
                      <BookmarkCheck className="h-4 w-4" />
                      {t("saved")}
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-4 w-4" />
                      {t("saveForReview")}
                    </>
                  )}
                </Button>
              </div>
            </SheetHeader>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
