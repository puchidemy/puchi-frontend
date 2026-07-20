import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import { useAuthStore } from "./auth";

interface TrialLearnState {
  /** Guest finished all required lessons in the trial unit. */
  unitCompleted: boolean;
  completedLessonIds: string[];
  /** Story-first soft-gate metric: completed Scenes (legacy; gating is city-based). */
  completedSceneIds: string[];
  setUnitCompleted: (value: boolean) => void;
  markLessonCompleted: (lessonId: string) => void;
  markSceneCompleted: (sceneId: string) => void;
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
  "completedLessonIds" | "unitCompleted" | "completedSceneIds"
> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        completedLessonIds: [],
        unitCompleted: false,
        completedSceneIds: [],
      };
    }
    const parsed = JSON.parse(raw) as {
      state?: Pick<
        TrialLearnState,
        "completedLessonIds" | "unitCompleted" | "completedSceneIds"
      >;
    };
    return {
      completedLessonIds: parsed.state?.completedLessonIds ?? [],
      unitCompleted: parsed.state?.unitCompleted ?? false,
      completedSceneIds: parsed.state?.completedSceneIds ?? [],
    };
  } catch {
    return {
      completedLessonIds: [],
      unitCompleted: false,
      completedSceneIds: [],
    };
  }
}

export function clearGuestLocalProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/** Re-export soft-gate helpers for callers that already import the trial store. */
export {
  GUEST_SOFT_GATE_SCENE_LIMIT,
  guestRequiresLoginForCity,
  isGuestFreeCitySlug,
} from "@/lib/learn-soft-gate";

export const useTrialLearnStore = create<TrialLearnState>()(
  persist(
    (set, get) => ({
      unitCompleted: false,
      completedLessonIds: [],
      completedSceneIds: [],

      setUnitCompleted: (value) => set({ unitCompleted: value }),

      markLessonCompleted: (lessonId) => {
        const ids = get().completedLessonIds;
        if (ids.includes(lessonId)) return;
        set({ completedLessonIds: [...ids, lessonId] });
      },

      markSceneCompleted: (sceneId) => {
        const ids = get().completedSceneIds;
        if (ids.includes(sceneId)) return;
        set({ completedSceneIds: [...ids, sceneId] });
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

      reset: () =>
        set({
          unitCompleted: false,
          completedLessonIds: [],
          completedSceneIds: [],
        }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => guestOnlyStorage),
    },
  ),
);
