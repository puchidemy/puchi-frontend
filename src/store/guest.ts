import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useAuthStore } from "./auth";

export interface GuestProgress {
  /** Dictation lessons completed */
  lessonsCompleted: number;
  /** Total correct answers */
  totalCorrect: number;
  /** Total XP earned */
  totalXp: number;
  /** Lesson IDs completed (to avoid double-count on merge) */
  completedLessonIds: string[];
  /** When guest mode started */
  createdAt: string;
}

interface GuestState {
  progress: GuestProgress;
  addCompletedLesson: (lessonId: string, correct: number, xp: number) => void;
  reset: () => void;
  /** Merge current guest progress into the authenticated user's account.
   *  Returns true if there was progress to merge. */
  mergeIfNeeded: () => Promise<boolean>;
}

const defaultProgress: GuestProgress = {
  lessonsCompleted: 0,
  totalCorrect: 0,
  totalXp: 0,
  completedLessonIds: [],
  createdAt: new Date().toISOString(),
};

export const useGuestStore = create<GuestState>()(
  persist(
    (set, get) => ({
      progress: { ...defaultProgress },

      addCompletedLesson: (lessonId, correct, xp) => {
        set((state) => {
          // Don't double-count the same lesson
          if (state.progress.completedLessonIds.includes(lessonId)) {
            return state;
          }
          return {
            progress: {
              ...state.progress,
              lessonsCompleted: state.progress.lessonsCompleted + 1,
              totalCorrect: state.progress.totalCorrect + correct,
              totalXp: state.progress.totalXp + xp,
              completedLessonIds: [
                ...state.progress.completedLessonIds,
                lessonId,
              ],
            },
          };
        });
      },

      reset: () => set({ progress: { ...defaultProgress } }),

      mergeIfNeeded: async () => {
        const { progress } = get();
        const { accessToken } = useAuthStore.getState();

        // Nothing to merge
        if (progress.lessonsCompleted === 0) return false;
        // Not logged in yet
        if (!accessToken) return false;

        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

        try {
          const res = await fetch(`${API_URL}/v1/profile/merge-guest`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              lessons_completed: progress.lessonsCompleted,
              total_correct: progress.totalCorrect,
              total_xp: progress.totalXp,
              completed_lesson_ids: progress.completedLessonIds,
            }),
          });

          if (res.ok) {
            // Clear guest progress after successful merge
            get().reset();
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },
    }),
    {
      name: "puchi-guest",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
