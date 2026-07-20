"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  CheckCircle2,
  Loader2,
  Volume2,
  XCircle,
} from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GuestSoftGateDialog } from "@/components/settings/GuestSoftGateDialog";
import { DictationPractice } from "@/components/learn/story/DictationPractice";
import { ImmersiveStoryShell } from "@/components/learn/story/ImmersiveStoryShell";
import { ListeningPractice } from "@/components/learn/story/ListeningPractice";
import { ReadListenView } from "@/components/learn/story/ReadListenView";
import {
  StoryLearnHub,
  type StoryLearnMode,
} from "@/components/learn/story/StoryLearnHub";
import { SpacedRepetitionPractice } from "@/components/learn/story/SpacedRepetitionPractice";
import { UnscramblePractice } from "@/components/learn/story/UnscramblePractice";
import {
  completeScene,
  completeStory,
  isGuestSoftGateError,
  startActivity,
  submitActivityAnswer,
  type GetStoryResponse,
  type LearnActivitySummary,
  type LearnScene,
  type StoryCompletionSummary,
} from "@/lib/learn-api";
import {
  getCompiledScene,
  isCompiledStory,
} from "@/lib/story-engine";
import { guestRequiresLoginForCity } from "@/lib/learn-soft-gate";
import { useAuthStore } from "@/store/auth";
import { useTrialLearnStore } from "@/store/trial-learn";
import { cn } from "@/lib/utils";

const PACKAGE_ACTIVITY_TYPES = new Set([
  "read_listen",
  "listening",
  "vocabulary",
  "unscramble",
  "dictation",
  "speaking",
  "grammar_in_context",
  "review",
]);

type Phase =
  | "mode_select"
  | "story"
  | "listening"
  | "unscramble"
  | "dictation"
  | "srs"
  | "complete"
  /** Legacy non-package flow */
  | "scene"
  | "practice";

interface SelectPrompt {
  question?: string;
  options?: string[];
}

interface MatchPrompt {
  pairs?: [string, string][];
}

interface TextPrompt {
  prompt?: string;
  hint?: string;
}

interface DialogueTurn {
  speaker?: string;
  text?: string;
}

interface DialogueDoc {
  turns?: DialogueTurn[];
}

function parsePromptJson<T>(raw: string | undefined | null): T {
  if (!raw) return {} as T;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return {} as T;
  }
}

function parseDialogue(raw: unknown): DialogueTurn[] {
  if (!raw) return [];
  if (typeof raw === "string") {
    try {
      const doc = JSON.parse(raw) as DialogueDoc;
      return doc.turns ?? [];
    } catch {
      return [];
    }
  }
  if (typeof raw === "object" && raw !== null && "turns" in raw) {
    return (raw as DialogueDoc).turns ?? [];
  }
  return [];
}

export type StoryPlayerProps = {
  data: GetStoryResponse;
};

export function StoryPlayer({ data }: StoryPlayerProps) {
  const t = useTranslations("Learn.Story");
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const markSceneCompleted = useTrialLearnStore((s) => s.markSceneCompleted);

  const scenes = useMemo(
    () => [...data.scenes].sort((a, b) => a.position - b.position),
    [data.scenes],
  );
  const { story } = data;
  const backHref = `/learn/city/${story.city_slug}`;
  const packageBacked = isCompiledStory(story.id);

  const [phase, setPhase] = useState<Phase>(
    packageBacked ? "mode_select" : "scene",
  );
  const [sceneIndex, setSceneIndex] = useState(0);
  const [activityIndex, setActivityIndex] = useState(0);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [startingPractice, setStartingPractice] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [matchPairs, setMatchPairs] = useState<[string, string][]>([]);
  const [gateOpen, setGateOpen] = useState(false);
  const [summary, setSummary] = useState<StoryCompletionSummary | null>(null);
  const [rewardXp, setRewardXp] = useState(0);

  const scene: LearnScene | undefined = scenes[sceneIndex];
  const activities = useMemo(
    () =>
      [...(scene?.activities ?? [])].sort((a, b) => a.position - b.position),
    [scene],
  );
  const current: LearnActivitySummary | undefined = activities[activityIndex];
  const compiledScene = useMemo(
    () =>
      scene && packageBacked
        ? getCompiledScene(story.id, scene.id)
        : null,
    [scene, packageBacked, story.id],
  );

  /** Guests may finish Hanoi freely; other cities require login. */
  const guestAtGate = !user && guestRequiresLoginForCity(story.city_slug);

  const goCity = useCallback(() => {
    router.push(backHref);
  }, [router, backHref]);

  const goHub = useCallback(() => {
    setError("");
    setSceneIndex(0);
    setActivityIndex(0);
    setAttemptId(null);
    setFeedback(null);
    setSelectedAnswer(null);
    setTextAnswer("");
    setSummary(null);
    setPhase("mode_select");
  }, []);

  const resetActivityLocal = useCallback(() => {
    setFeedback(null);
    setSelectedAnswer(null);
    setTextAnswer("");
    setError("");
  }, []);

  useEffect(() => {
    if (current?.type === "match") {
      const prompt = parsePromptJson<MatchPrompt>(current.prompt_json);
      setMatchPairs(prompt.pairs ?? []);
    }
  }, [current]);

  const finishStory = useCallback(async () => {
    setSubmitting(true);
    setError("");
    try {
      const result = await completeStory(story.id);
      setRewardXp(result.xp);
      setSummary(result.summary);
      setPhase("complete");
    } catch (err) {
      if (isGuestSoftGateError(err)) {
        setGateOpen(true);
        return;
      }
      setError(err instanceof Error ? err.message : t("completeError"));
    } finally {
      setSubmitting(false);
    }
  }, [story.id, t]);

  const advanceStoryScene = useCallback(async () => {
    if (!scene) return;
    setSubmitting(true);
    setError("");
    try {
      await completeScene(scene.id, {
        citySlug: story.city_slug,
      });
      markSceneCompleted(scene.id);

      if (sceneIndex + 1 < scenes.length) {
        setSceneIndex((i) => i + 1);
        return;
      }

      await finishStory();
    } catch (err) {
      if (isGuestSoftGateError(err)) {
        setGateOpen(true);
        return;
      }
      setError(err instanceof Error ? err.message : t("completeError"));
    } finally {
      setSubmitting(false);
    }
  }, [
    scene,
    markSceneCompleted,
    sceneIndex,
    scenes.length,
    story.city_slug,
    finishStory,
    t,
  ]);

  const advanceAfterActivity = useCallback(async () => {
    resetActivityLocal();
    if (activityIndex + 1 < activities.length) {
      setActivityIndex((i) => i + 1);
      return;
    }

    if (!scene) return;
    setSubmitting(true);
    try {
      await completeScene(scene.id, {
        citySlug: story.city_slug,
      });
      markSceneCompleted(scene.id);

      if (sceneIndex + 1 < scenes.length) {
        setSceneIndex((i) => i + 1);
        setActivityIndex(0);
        setAttemptId(null);
        setPhase("scene");
        return;
      }

      await finishStory();
    } catch (err) {
      if (isGuestSoftGateError(err)) {
        setGateOpen(true);
        return;
      }
      setError(err instanceof Error ? err.message : t("completeError"));
    } finally {
      setSubmitting(false);
    }
  }, [
    activityIndex,
    activities.length,
    scene,
    markSceneCompleted,
    sceneIndex,
    scenes.length,
    story.city_slug,
    finishStory,
    resetActivityLocal,
    t,
  ]);

  const beginPractice = useCallback(async () => {
    if (!scene) return;
    if (guestAtGate) {
      setGateOpen(true);
      return;
    }
    setStartingPractice(true);
    setError("");
    try {
      const start = await startActivity(scene.id, {
        citySlug: story.city_slug,
      });
      setAttemptId(start.attempt_id);
      setActivityIndex(0);
      resetActivityLocal();
      setPhase("practice");
    } catch (err) {
      if (isGuestSoftGateError(err)) {
        setGateOpen(true);
        return;
      }
      setError(err instanceof Error ? err.message : t("startError"));
    } finally {
      setStartingPractice(false);
    }
  }, [scene, guestAtGate, story.city_slug, resetActivityLocal, t]);

  const selectMode = (mode: StoryLearnMode) => {
    // Non-Hanoi guests hit city soft-gate; Hanoi stays free for all modes.
    if (guestAtGate) {
      setGateOpen(true);
      return;
    }
    setError("");
    setSceneIndex(0);
    setSummary(null);
    setPhase(mode);
  };

  const handleSelectSubmit = async () => {
    if (!attemptId || !current || !selectedAnswer) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const result = await submitActivityAnswer(attemptId, current.id, {
        answer: selectedAnswer,
      });
      setFeedback(result.correct ? "correct" : "wrong");
      if (result.correct) {
        setTimeout(() => void advanceAfterActivity(), 600);
      }
    } catch (err) {
      if (isGuestSoftGateError(err)) {
        setGateOpen(true);
        return;
      }
      setError(err instanceof Error ? err.message : t("submitError"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleMatchSubmit = async () => {
    if (!attemptId || !current) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const result = await submitActivityAnswer(attemptId, current.id, {
        pairs: matchPairs,
      });
      setFeedback(result.correct ? "correct" : "wrong");
      if (result.correct) {
        setTimeout(() => void advanceAfterActivity(), 600);
      }
    } catch (err) {
      if (isGuestSoftGateError(err)) {
        setGateOpen(true);
        return;
      }
      setError(err instanceof Error ? err.message : t("submitError"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!attemptId || !current || !textAnswer.trim()) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const result = await submitActivityAnswer(attemptId, current.id, {
        text: textAnswer.trim(),
      });
      setFeedback(result.correct ? "correct" : "wrong");
      if (result.correct) {
        setTimeout(() => void advanceAfterActivity(), 600);
      }
    } catch (err) {
      if (isGuestSoftGateError(err)) {
        setGateOpen(true);
        return;
      }
      setError(err instanceof Error ? err.message : t("submitError"));
    } finally {
      setSubmitting(false);
    }
  };

  const playSceneAudio = () => {
    if (!scene?.audio_url) return;
    try {
      const audio = new Audio(scene.audio_url);
      void audio.play();
    } catch {
      // ignore autoplay / decode errors
    }
  };

  const continuePackageActivity = async () => {
    if (!current) return;
    setSubmitting(true);
    setError("");
    try {
      if (attemptId) {
        await submitActivityAnswer(attemptId, current.id, { complete: true });
      }
      await advanceAfterActivity();
    } catch (err) {
      if (isGuestSoftGateError(err)) {
        setGateOpen(true);
        return;
      }
      setError(err instanceof Error ? err.message : t("submitError"));
    } finally {
      setSubmitting(false);
    }
  };

  const practiceActivities = useMemo(
    () => activities.filter((a) => a.type !== "read_listen"),
    [activities],
  );

  const practiceStep = useMemo(() => {
    if (!current || current.type === "read_listen") return null;
    const idx = practiceActivities.findIndex((a) => a.id === current.id);
    if (idx < 0) return null;
    return { current: idx + 1, total: practiceActivities.length };
  }, [current, practiceActivities]);

  const storyProgress = useMemo(() => {
    if (scenes.length === 0) return 0;
    if (phase === "complete") return 100;
    if (phase === "mode_select") return 0;
    if (
      phase === "listening" ||
      phase === "unscramble" ||
      phase === "dictation" ||
      phase === "srs"
    ) {
      return 8;
    }
    if (phase === "story") {
      return Math.min(
        99,
        ((sceneIndex + 0.35) / Math.max(1, scenes.length)) * 100,
      );
    }
    const base = sceneIndex / scenes.length;
    if (phase === "scene") return base * 100;
    const within = activities.length
      ? (activityIndex + 0.5) / activities.length
      : 0.5;
    return Math.min(99, (base + within / scenes.length) * 100);
  }, [scenes.length, phase, sceneIndex, activities.length, activityIndex]);

  const onExit =
    packageBacked && phase !== "mode_select" && phase !== "complete"
      ? goHub
      : goCity;

  const confirmExit =
    phase === "story" ||
    phase === "listening" ||
    phase === "unscramble" ||
    phase === "dictation" ||
    phase === "srs" ||
    phase === "practice" ||
    (phase === "scene" && sceneIndex > 0);

  if (scenes.length === 0) {
    return (
      <ImmersiveStoryShell
        progress={0}
        confirmExit={false}
        onExit={goCity}
      >
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="font-semibold">{t("emptyScenesTitle")}</p>
          <p className="text-sm text-muted-foreground">{t("emptyScenesBody")}</p>
          <Button variant="primary" onClick={goCity}>
            {t("backToCity")}
          </Button>
        </div>
      </ImmersiveStoryShell>
    );
  }

  if (phase === "complete" && summary) {
    return (
      <ImmersiveStoryShell
        progress={100}
        confirmExit={false}
        onExit={packageBacked ? goHub : goCity}
      >
        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-5 overflow-y-auto px-4 py-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">{story.title}</h1>
            <p className="text-sm text-muted-foreground">
              {t("complete.subtitle")}
            </p>
          </div>

          <div className="space-y-4 rounded-2xl border border-border/60 bg-card/80 p-5">
            <SummaryBlock
              label={t("complete.vocab")}
              items={summary.vocab_focus}
            />
            <SummaryBlock
              label={t("complete.grammar")}
              items={summary.grammar_focus}
            />
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {t("complete.listening")}
              </p>
              <p className="mt-1 text-sm">
                {t("complete.listeningValue", {
                  seconds: summary.listening_seconds,
                })}
              </p>
            </div>
            {summary.cultural_fact ? (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {t("complete.cultural")}
                </p>
                <p className="mt-1 text-sm leading-relaxed">
                  {summary.cultural_fact}
                </p>
              </div>
            ) : null}
            <div className="rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
              {t("complete.reward", { xp: rewardXp })}
            </div>
          </div>

          {packageBacked ? (
            <div className="flex flex-col gap-2">
              <Button variant="primary" className="w-full" onClick={goHub}>
                {t("hub.backToMenu")}
              </Button>
              <Button variant="secondary" className="w-full" onClick={goCity}>
                {t("backToCity")}
              </Button>
            </div>
          ) : (
            <Button variant="primary" className="w-full" onClick={goCity}>
              {t("backToCity")}
            </Button>
          )}
        </div>
        <GuestSoftGateDialog open={gateOpen} />
      </ImmersiveStoryShell>
    );
  }

  // Package Learn Hub — no progress bar (mode picker only)
  if (packageBacked && phase === "mode_select") {
    return (
      <ImmersiveStoryShell
        showProgress={false}
        confirmExit={false}
        onExit={goCity}
      >
        <StoryLearnHub storyTitle={story.title} onSelectMode={selectMode} />
        <GuestSoftGateDialog open={gateOpen} />
      </ImmersiveStoryShell>
    );
  }

  if (packageBacked && phase === "listening") {
    return (
      <ImmersiveStoryShell
        progress={storyProgress}
        confirmExit={confirmExit}
        exitToHub
        onExit={onExit}
      >
        <ListeningPractice storyId={story.id} onDone={goHub} />
        <GuestSoftGateDialog open={gateOpen} />
      </ImmersiveStoryShell>
    );
  }

  if (packageBacked && phase === "unscramble") {
    return (
      <ImmersiveStoryShell
        progress={storyProgress}
        confirmExit={confirmExit}
        exitToHub
        onExit={onExit}
      >
        <UnscramblePractice storyId={story.id} onDone={goHub} />
        <GuestSoftGateDialog open={gateOpen} />
      </ImmersiveStoryShell>
    );
  }

  if (packageBacked && phase === "dictation") {
    return (
      <ImmersiveStoryShell
        progress={storyProgress}
        confirmExit={confirmExit}
        exitToHub
        onExit={onExit}
      >
        <DictationPractice storyId={story.id} onDone={goHub} />
        <GuestSoftGateDialog open={gateOpen} />
      </ImmersiveStoryShell>
    );
  }

  if (packageBacked && phase === "srs") {
    return (
      <ImmersiveStoryShell
        progress={storyProgress}
        confirmExit={confirmExit}
        exitToHub
        onExit={onExit}
      >
        <SpacedRepetitionPractice storyId={story.id} onDone={goHub} />
        <GuestSoftGateDialog open={gateOpen} />
      </ImmersiveStoryShell>
    );
  }

  if (packageBacked && phase === "story") {
    return (
      <ImmersiveStoryShell
        progress={storyProgress}
        confirmExit={confirmExit}
        exitToHub
        onExit={onExit}
      >
        {error ? (
          <div className="shrink-0 px-4 pt-1">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        ) : null}
        {compiledScene ? (
          <ReadListenView
            key={compiledScene.id}
            storyId={story.id}
            scene={compiledScene}
            continuing={submitting}
            isLastScene={sceneIndex >= scenes.length - 1}
            onContinue={() => void advanceStoryScene()}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-sm text-muted-foreground">{t("loadError")}</p>
            <Button variant="primary" onClick={goHub}>
              {t("hub.backToMenu")}
            </Button>
          </div>
        )}
        <GuestSoftGateDialog open={gateOpen} />
      </ImmersiveStoryShell>
    );
  }

  if (!scene) return null;

  const dialogue = parseDialogue(scene.dialogue_json);
  const selectPrompt = current
    ? parsePromptJson<SelectPrompt>(current.prompt_json)
    : {};
  const textPrompt = current
    ? parsePromptJson<TextPrompt>(current.prompt_json)
    : {};

  // Legacy non-package player
  return (
    <ImmersiveStoryShell
      progress={storyProgress}
      confirmExit={confirmExit}
      onExit={goCity}
    >
      {error ? (
        <div className="shrink-0 px-4 pt-1">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      ) : null}

      {phase === "scene" ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="relative mx-auto w-full max-w-xl flex-1 px-4 py-6">
            <div className="relative mb-4 aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border bg-muted/30">
              {scene.illustration_url ? (
                <Image
                  src={scene.illustration_url}
                  alt={scene.title ?? story.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("sceneIllustrationFallback")}
                  </p>
                </div>
              )}
            </div>

            {scene.title ? (
              <p className="text-sm font-medium text-primary">{scene.title}</p>
            ) : null}
            <p className="mt-2 text-base leading-relaxed">{scene.narration}</p>

            {dialogue.length > 0 ? (
              <ul className="mt-4 space-y-2 border-l-2 border-primary/30 pl-3">
                {dialogue.map((turn, i) => (
                  <li key={i} className="text-sm">
                    <span className="font-semibold capitalize text-primary">
                      {turn.speaker ?? "…"}
                    </span>
                    <span className="text-muted-foreground">: </span>
                    <span>{turn.text}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-2 pb-4">
              {scene.audio_url ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-12 gap-1.5"
                  onClick={playSceneAudio}
                >
                  <Volume2 className="h-4 w-4" />
                  {t("playAudio")}
                </Button>
              ) : null}
              <Button
                variant="primary"
                className="h-12 min-w-[10rem] flex-1"
                disabled={startingPractice}
                onClick={() => void beginPractice()}
              >
                {startingPractice ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("startingPractice")}
                  </>
                ) : (
                  t("continueToPractice")
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {phase === "practice" && current ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6">
          <div className="mx-auto w-full max-w-xl space-y-4">
            <p className="text-sm text-muted-foreground">
              {practiceStep
                ? t("activityStep", {
                    current: practiceStep.current,
                    total: practiceStep.total,
                  })
                : t("modePractice")}
            </p>

            <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
              {current.type === "select" && (
                <>
                  <p className="text-lg font-medium">{selectPrompt.question}</p>
                  <div className="space-y-2">
                    {selectPrompt.options?.map((opt) => (
                      <Button
                        key={opt}
                        variant={
                          selectedAnswer === opt ? "primary" : "secondary"
                        }
                        className="h-auto min-h-12 w-full justify-start py-3"
                        onClick={() => setSelectedAnswer(opt)}
                        disabled={submitting || feedback === "correct"}
                      >
                        {opt}
                      </Button>
                    ))}
                  </div>
                  <Button
                    className="h-12 w-full"
                    variant="primary"
                    disabled={!selectedAnswer || submitting}
                    onClick={() => void handleSelectSubmit()}
                  >
                    {submitting ? t("checking") : t("check")}
                  </Button>
                </>
              )}

              {current.type === "match" && (
                <>
                  <p className="text-lg font-medium">{t("matchPrompt")}</p>
                  <ul className="space-y-2 text-sm">
                    {matchPairs.map(([a, b], i) => (
                      <li
                        key={i}
                        className="flex justify-between rounded border px-3 py-2"
                      >
                        <span>{a}</span>
                        <span className="text-muted-foreground">↔</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="h-12 w-full"
                    variant="primary"
                    disabled={submitting}
                    onClick={() => void handleMatchSubmit()}
                  >
                    {submitting ? t("checking") : t("check")}
                  </Button>
                </>
              )}

              {(current.type === "listen" || current.type === "dictate") && (
                <>
                  <p className="text-lg font-medium">
                    {textPrompt.prompt ?? t("typeAnswer")}
                  </p>
                  {current.type === "listen" && textPrompt.hint ? (
                    <p className="text-sm text-muted-foreground">
                      {t("hint", { hint: textPrompt.hint })}
                    </p>
                  ) : null}
                  <Input
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    disabled={submitting || feedback === "correct"}
                    placeholder={t("typePlaceholder")}
                    autoComplete="off"
                  />
                  <Button
                    className="h-12 w-full"
                    variant="primary"
                    disabled={!textAnswer.trim() || submitting}
                    onClick={() => void handleTextSubmit()}
                  >
                    {submitting ? t("checking") : t("check")}
                  </Button>
                </>
              )}

              {PACKAGE_ACTIVITY_TYPES.has(current.type) && (
                <>
                  <p className="text-lg font-medium">
                    {t("stubActivityTitle", { type: current.type })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("stubActivityBody")}
                  </p>
                  <Button
                    className="h-12 w-full"
                    variant="primary"
                    disabled={submitting}
                    onClick={() => void continuePackageActivity()}
                  >
                    {submitting ? t("checking") : t("continueActivity")}
                  </Button>
                </>
              )}

              {!["select", "match", "listen", "dictate"].includes(
                current.type,
              ) &&
                !PACKAGE_ACTIVITY_TYPES.has(current.type) && (
                  <p className="text-sm text-muted-foreground">
                    {t("unsupportedActivity", { type: current.type })}
                  </p>
                )}
            </div>

            {feedback ? (
              <div
                className={cn(
                  "flex items-center gap-2 font-medium",
                  feedback === "correct" ? "text-green-600" : "text-red-600",
                )}
              >
                {feedback === "correct" ? (
                  <>
                    <CheckCircle2 className="h-5 w-5" /> {t("correct")}
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5" /> {t("tryAgain")}
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <GuestSoftGateDialog open={gateOpen} />
    </ImmersiveStoryShell>
  );
}

function SummaryBlock({ label, items }: { label: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full bg-secondary/70 px-2.5 py-0.5 text-sm font-medium"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
