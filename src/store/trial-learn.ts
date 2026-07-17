import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface TrialLearnState {
  /** Guest finished all required lessons in the trial unit. */
  unitCompleted: boolean;
  completedLessonIds: string[];
  setUnitCompleted: (value: boolean) => void;
  markLessonCompleted: (lessonId: string) => void;
  reset: () => void;
}

export const useTrialLearnStore = create<TrialLearnState>()(
  persist(
    (set, get) => ({
      unitCompleted: false,
      completedLessonIds: [],

      setUnitCompleted: (value) => set({ unitCompleted: value }),

      markLessonCompleted: (lessonId) => {
        const ids = get().completedLessonIds;
        if (ids.includes(lessonId)) return;
        set({ completedLessonIds: [...ids, lessonId] });
      },

      reset: () => set({ unitCompleted: false, completedLessonIds: [] }),
    }),
    {
      name: "puchi-trial-learn",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
