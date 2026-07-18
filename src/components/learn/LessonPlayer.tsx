"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GuestSoftGateDialog } from "@/components/settings/GuestSoftGateDialog";
import { LessonOneReminderDialog } from "@/components/settings/LessonOneReminderDialog";
import {
  completeLesson,
  ensureGuestSession,
  getLesson,
  isGuestSoftGateError,
  startLesson,
  submitAnswer,
  type LearnExercise,
  type LearnLesson,
} from "@/lib/learn-api";
import { useAuthStore } from "@/store/auth";
import { useTrialLearnStore } from "@/store/trial-learn";

interface SelectPrompt {
  question?: string;
  options?: string[];
}

interface MatchPrompt {
  pairs?: [string, string][];
}

function parsePromptJson<T>(raw: string | undefined | null): T {
  if (!raw) return {} as T;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return {} as T;
  }
}

interface LessonPlayerProps {
  lessonId: string;
}

export function LessonPlayer({ lessonId }: LessonPlayerProps) {
  const t = useTranslations("Learn.lesson");
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const markLessonCompleted = useTrialLearnStore((s) => s.markLessonCompleted);
  const setUnitCompleted = useTrialLearnStore((s) => s.setUnitCompleted);

  const [lesson, setLesson] = useState<LearnLesson | null>(null);
  const [exercises, setExercises] = useState<LearnExercise[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [matchPairs, setMatchPairs] = useState<[string, string][]>([]);
  const [gateOpen, setGateOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);

  const init = useCallback(async () => {
    setLoading(true);
    setError("");
    setGateOpen(false);
    try {
      if (!user) {
        await ensureGuestSession();
      }
      const [{ lesson: l, exercises: exs }, start] = await Promise.all([
        getLesson(lessonId),
        startLesson(lessonId),
      ]);
      setLesson(l);
      setExercises(exs);
      setAttemptId(start.attempt_id);
    } catch (err) {
      if (isGuestSoftGateError(err)) {
        setGateOpen(true);
        setError("");
        return;
      }
      setError(err instanceof Error ? err.message : t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [lessonId, user, t]);

  useEffect(() => {
    init();
  }, [init]);

  const current = exercises[step];

  const goLearn = () => {
    router.push("/learn");
  };

  const handleSelectSubmit = async () => {
    if (!attemptId || !current || !selectedAnswer) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const result = await submitAnswer(attemptId, current.id, {
        answer: selectedAnswer,
      });
      setFeedback(result.correct ? "correct" : "wrong");
      if (result.correct) {
        setTimeout(() => advance(), 600);
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
      const result = await submitAnswer(attemptId, current.id, {
        pairs: matchPairs,
      });
      setFeedback(result.correct ? "correct" : "wrong");
      if (result.correct) {
        setTimeout(() => advance(), 600);
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

  const finishLesson = async () => {
    if (!lesson) return;
    setSubmitting(true);
    try {
      const priorIds = useTrialLearnStore.getState().completedLessonIds;
      const isFirstGuestCompletion =
        !user && priorIds.length === 0 && !priorIds.includes(lesson.id);

      const result = await completeLesson(lesson.id);
      markLessonCompleted(lesson.id);
      if (result.unit_completed) {
        setUnitCompleted(true);
      }
      if (isFirstGuestCompletion) {
        setReminderOpen(true);
      } else {
        goLearn();
      }
    } catch (err) {
      if (isGuestSoftGateError(err)) {
        setGateOpen(true);
        return;
      }
      setError(err instanceof Error ? err.message : t("completeError"));
    } finally {
      setSubmitting(false);
    }
  };

  const advance = () => {
    setFeedback(null);
    setSelectedAnswer(null);
    if (step + 1 >= exercises.length) {
      void finishLesson();
    } else {
      setStep((s) => s + 1);
      const next = exercises[step + 1];
      if (next?.type === "match") {
        const prompt = parsePromptJson<MatchPrompt>(next.prompt_json);
        setMatchPairs(prompt.pairs ?? []);
      }
    }
  };

  useEffect(() => {
    if (current?.type === "match") {
      const prompt = parsePromptJson<MatchPrompt>(current.prompt_json);
      setMatchPairs(prompt.pairs ?? []);
    }
  }, [current]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <GuestSoftGateDialog open={gateOpen} />
      </div>
    );
  }

  if (gateOpen && !lesson) {
    return (
      <div className="p-8 max-w-lg mx-auto space-y-4">
        <GuestSoftGateDialog open={gateOpen} />
        <Button variant="outline" onClick={goLearn}>
          {t("backToLearn")}
        </Button>
      </div>
    );
  }

  if (error && !lesson) {
    return (
      <div className="p-8 max-w-lg mx-auto space-y-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={goLearn}>
          {t("backToLearn")}
        </Button>
      </div>
    );
  }

  if (!current || !lesson) return null;

  const selectPrompt = parsePromptJson<SelectPrompt>(current.prompt_json);

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">{lesson.title}</p>
        <h1 className="text-2xl font-bold mt-1">
          {t("step", { current: step + 1, total: exercises.length })}
        </h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="p-6 space-y-4">
        {current.type === "select" && (
          <>
            <p className="text-lg font-medium">{selectPrompt.question}</p>
            <div className="space-y-2">
              {selectPrompt.options?.map((opt) => (
                <Button
                  key={opt}
                  variant={selectedAnswer === opt ? "primary" : "outline"}
                  className="w-full justify-start h-auto py-3"
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
                  className="flex justify-between border rounded px-3 py-2"
                >
                  <span>{a}</span>
                  <span className="text-muted-foreground">?</span>
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
      </Card>

      {feedback && (
        <div
          className={`flex items-center gap-2 font-medium ${
            feedback === "correct" ? "text-green-600" : "text-red-600"
          }`}
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
      )}

      <GuestSoftGateDialog open={gateOpen} />
      <LessonOneReminderDialog
        open={reminderOpen}
        onOpenChange={(open) => {
          setReminderOpen(open);
          if (!open) goLearn();
        }}
      />
    </div>
  );
}
