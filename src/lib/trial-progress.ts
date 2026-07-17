import type { LearnSkill } from "./learn-api";

export type LessonProgressStatus = "not_started" | "in_progress" | "completed";

export interface UnitProgressSnapshot {
  completedLessonIds: string[];
  unitCompleted: boolean;
}

/** Derive progress from GET /v1/learn/units/{id} when lesson/unit status fields are present. */
export function progressFromUnit(data: {
  skills: LearnSkill[];
  unitStatus?: string;
}): UnitProgressSnapshot {
  const completedLessonIds = data.skills
    .flatMap((skill) => skill.lessons)
    .filter((lesson) => lesson.status === "completed")
    .map((lesson) => lesson.id);

  return {
    completedLessonIds,
    unitCompleted: data.unitStatus === "completed",
  };
}
