"use client";

import { LessonPlayer } from "./LessonPlayer";

interface TrialLessonPlayerProps {
  lessonId: string;
}

/** @deprecated Use LessonPlayer at /lesson/[id] */
export function TrialLessonPlayer({ lessonId }: TrialLessonPlayerProps) {
  return <LessonPlayer lessonId={lessonId} />;
}
