import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import { useAuthStore } from "./auth";

interface TrialLearnState {
  /** Guest finished all required lessons in the trial unit. */
  unitCompleted: boolean;
  completedLessonIds: string[];
  setUnitCompleted: (value: boolean) => void;
  markLessonCompleted: (lessonId: string) => void;
  /** Replace progress from server (authenticated users). */
  hydrateFromServer: (completedLessonIds: string[], unitCompleted: boolean) => void;
  /** Merge server progress into guest local state. */
  mergeServerProgress: (completedLessonIds: string[], unitCompleted: boolean) => void;
  reset: () => void;
}

/** localStorage is guest-only; signed-in users rely on server progress. */
const guestOnlyStorage: StateStorage = {
  getItem: (name) => {
    if (useAuthStore.getState().user) return null;
    return localStorage.getItem(name);
  },
  setItem: (name, value) => {
    if (useAuthStore.getState().user) return;
    localStorage.setItem(name, value);
  },
  removeItem: (name) => {
    localStorage.removeItem(name);
  },
};

const STORAGE_KEY = "puchi-trial-learn";

/** Read persisted guest progress without auth-guard (used after claim). */
export function readGuestLocalProgress(): Pick<
  TrialLearnState,
  "completedLessonIds" | "unitCompleted"
> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { completedLessonIds: [], unitCompleted: false };
    }
    const parsed = JSON.parse(raw) as {
      state?: Pick<TrialLearnState, "completedLessonIds" | "unitCompleted">;
    };
    return {
      completedLessonIds: parsed.state?.completedLessonIds ?? [],
      unitCompleted: parsed.state?.unitCompleted ?? false,
    };
  } catch {
    return { completedLessonIds: [], unitCompleted: false };
  }
}

export function clearGuestLocalProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
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

      hydrateFromServer: (completedLessonIds, unitCompleted) =>
        set({ completedLessonIds, unitCompleted }),

      mergeServerProgress: (completedLessonIds, unitCompleted) => {
        const ids = new Set(get().completedLessonIds);
        for (const id of completedLessonIds) ids.add(id);
        set({
          completedLessonIds: [...ids],
          unitCompleted: get().unitCompleted || unitCompleted,
        });
      },

      reset: () => set({ unitCompleted: false, completedLessonIds: [] }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => guestOnlyStorage),
    },
  ),
);
