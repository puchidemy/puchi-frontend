import type { LearnLesson, LearnSkill } from "@/lib/learn-api";
import type {
  DerivedLandmarkView,
  JourneyMapConfig,
  RuntimeLandmarkStatus,
} from "./types";

function lessonsForLandmark(
  landmarkSkillId: string | undefined,
  skills: LearnSkill[],
  isPrimaryUnlocked: boolean,
): LearnLesson[] {
  if (landmarkSkillId) {
    const skill = skills.find((s) => s.id === landmarkSkillId);
    if (skill) return skill.lessons;
  }
  // MVP fallback: primary unlocked landmark without matching skillId gets all unit lessons
  if (isPrimaryUnlocked) {
    return skills.flatMap((s) => s.lessons);
  }
  return [];
}

export function deriveLandmarkViews(
  config: JourneyMapConfig,
  skills: LearnSkill[],
  completedLessonIds: string[],
): DerivedLandmarkView[] {
  const completed = new Set(completedLessonIds);
  const allLessons = skills.flatMap((s) => s.lessons);
  const firstIncomplete = allLessons.find((l) => !completed.has(l.id));

  return config.landmarks.map((landmark) => {
    const lessons = lessonsForLandmark(
      landmark.skillId,
      skills,
      landmark.baseStatus === "unlocked",
    );
    const totalCount = lessons.length;
    const completedCount = lessons.filter((l) => completed.has(l.id)).length;

    let status: RuntimeLandmarkStatus;
    if (landmark.baseStatus === "coming_soon") status = "coming_soon";
    else if (landmark.baseStatus === "locked") status = "locked";
    else if (totalCount > 0 && completedCount === totalCount)
      status = "completed";
    else status = "unlocked";

    const isCurrent =
      status === "unlocked" &&
      totalCount > 0 &&
      !!firstIncomplete &&
      lessons.some((l) => l.id === firstIncomplete.id);

    return {
      slug: landmark.slug,
      baseStatus: landmark.baseStatus,
      status,
      isCurrent,
      hotspot: landmark.hotspot,
      hitW: landmark.hitW,
      hitH: landmark.hitH,
      assets: landmark.assets,
      skillId: landmark.skillId,
      lessons,
      completedCount,
      totalCount,
    };
  });
}
