"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Volume2,
  XCircle,
} from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { GuestSoftGateDialog } from "@/components/settings/GuestSoftGateDialog";
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
import { useAuthStore } from "@/store/auth";
import {
  GUEST_SOFT_GATE_SCENE_LIMIT,
  useTrialLearnStore,
} from "@/store/trial-learn";
import { cn } from "@/lib/utils";

type Phase = "scene" | "practice" | "complete";

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
  const completedSceneIds = useTrialLearnStore((s) => s.completedSceneIds);
  const markSceneCompleted = useTrialLearnStore((s) => s.markSceneCompleted);

  const scenes = useMemo(
    () => [...data.scenes].sort((a, b) => a.position - b.position),
    [data.scenes],
  );
  const { story } = data;
  const backHref = `/learn/city/${story.city_slug}`;

  const [phase, setPhase] = useState<Phase>("scene");
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

  const guestAtGate =
    !user && completedSceneIds.length >= GUEST_SOFT_GATE_SCENE_LIMIT;

  const goCity = useCallback(() => {
    router.push(backHref);
  }, [router, backHref]);

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

  const advanceAfterActivity = useCallback(async () => {
    resetActivityLocal();
    if (activityIndex + 1 < activities.length) {
      setActivityIndex((i) => i + 1);
      return;
    }

    if (!scene) return;
    setSubmitting(true);
    try {
      const already = completedSceneIds.includes(scene.id);
      const nextCount = already
        ? completedSceneIds.length
        : completedSceneIds.length + 1;
      const result = await completeScene(scene.id, {
        completedSceneCountAfter: nextCount,
      });
      markSceneCompleted(scene.id);

      if (sceneIndex + 1 < scenes.length) {
        setSceneIndex((i) => i + 1);
        setActivityIndex(0);
        setAttemptId(null);
        setPhase("scene");
        // Soft-gate after N completed scenes — block starting the next scene's practice.
        if (
          (result.soft_gate || nextCount >= GUEST_SOFT_GATE_SCENE_LIMIT) &&
          !user
        ) {
          setGateOpen(true);
        }
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
    completedSceneIds,
    markSceneCompleted,
    sceneIndex,
    scenes.length,
    user,
    finishStory,
    resetActivityLocal,
    t,
  ]);

  const beginPractice = async () => {
    if (!scene) return;
    if (guestAtGate && !completedSceneIds.includes(scene.id)) {
      setGateOpen(true);
      return;
    }
    setStartingPractice(true);
    setError("");
    try {
      const start = await startActivity(scene.id, {
        completedSceneCount: completedSceneIds.length,
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

  if (scenes.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-6 font-din">
        <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit gap-1.5">
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4" />
            {t("backToCity")}
          </Link>
        </Button>
        <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center">
          <p className="font-semibold">{t("emptyScenesTitle")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("emptyScenesBody")}
          </p>
        </div>
      </div>
    );
  }

  if (phase === "complete" && summary) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-6 font-din">
        <div className="space-y-2 text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            {t("complete.eyebrow")}
          </p>
          <h1 className="text-2xl font-bold">{story.title}</h1>
          <p className="text-sm text-muted-foreground">{t("complete.subtitle")}</p>
        </div>

        <Card className="space-y-4 p-6">
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
        </Card>

        <Button variant="primary" className="w-full" onClick={goCity}>
          {t("backToCity")}
        </Button>
        <GuestSoftGateDialog open={gateOpen} />
      </div>
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

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5 px-4 py-6 font-din">
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" asChild className="-ml-2 gap-1.5">
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4" />
            {t("backToCity")}
          </Link>
        </Button>
        <p className="text-xs font-medium text-muted-foreground">
          {t("progress", {
            scene: sceneIndex + 1,
            total: scenes.length,
          })}
        </p>
      </div>

      <div>
        <p className="text-sm text-muted-foreground">
          {story.cefr}
          {story.est_minutes != null &&
            ` · ${t("minutes", { count: story.est_minutes })}`}
        </p>
        <h1 className="mt-0.5 text-xl font-bold">{story.title}</h1>
        {scene.title ? (
          <p className="mt-1 text-sm font-medium text-primary">{scene.title}</p>
        ) : null}
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {phase === "scene" && (
        <Card className="overflow-hidden p-0">
          <div className="relative aspect-[16/10] w-full bg-gradient-to-br from-amber-100 via-orange-50 to-sky-100 dark:from-amber-950/40 dark:via-stone-900 dark:to-sky-950/40">
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
          <div className="space-y-4 p-5">
            <p className="text-base leading-relaxed">{scene.narration}</p>

            {dialogue.length > 0 ? (
              <ul className="space-y-2 border-l-2 border-primary/30 pl-3">
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

            <div className="flex flex-wrap gap-2">
              {scene.audio_url ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="gap-1.5"
                  onClick={playSceneAudio}
                >
                  <Volume2 className="h-4 w-4" />
                  {t("playAudio")}
                </Button>
              ) : null}
              <Button
                variant="primary"
                className="min-w-[10rem] flex-1"
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
        </Card>
      )}

      {phase === "practice" && current && (
        <>
          <p className="text-sm text-muted-foreground">
            {t("activityStep", {
              current: activityIndex + 1,
              total: activities.length,
            })}
          </p>
          <Card className="space-y-4 p-5">
            {current.type === "select" && (
              <>
                <p className="text-lg font-medium">{selectPrompt.question}</p>
                <div className="space-y-2">
                  {selectPrompt.options?.map((opt) => (
                    <Button
                      key={opt}
                      variant={selectedAnswer === opt ? "primary" : "secondary"}
                      className="h-auto w-full justify-start py-3"
                      onClick={() => setSelectedAnswer(opt)}
                      disabled={submitting || feedback === "correct"}
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
                <Button
                  className="w-full"
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
                  className="w-full"
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
                  className="w-full"
                  variant="primary"
                  disabled={!textAnswer.trim() || submitting}
                  onClick={() => void handleTextSubmit()}
                >
                  {submitting ? t("checking") : t("check")}
                </Button>
              </>
            )}

            {!["select", "match", "listen", "dictate"].includes(current.type) && (
              <p className="text-sm text-muted-foreground">
                {t("unsupportedActivity", { type: current.type })}
              </p>
            )}
          </Card>

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
        </>
      )}

      <GuestSoftGateDialog open={gateOpen} />
    </div>
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
