import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type SavedStoryItemKind = "word" | "phrase";

export type SavedStoryItem = {
  storyId: string;
  kind: SavedStoryItemKind;
  /** wordId or phraseId */
  entryId: string;
  surface: string;
  meaning?: Record<string, string>;
  /** Manually marked known — excluded from SRS queue. */
  known: boolean;
  savedAt: number;
};

type StorySavedWordsState = {
  items: SavedStoryItem[];
  saveItem: (
    item: Omit<SavedStoryItem, "savedAt" | "known"> & { known?: boolean },
  ) => void;
  markKnown: (storyId: string, entryId: string) => void;
  markAgain: (storyId: string, entryId: string) => void;
  removeItem: (storyId: string, entryId: string) => void;
  listForStory: (storyId: string) => SavedStoryItem[];
  listReviewQueue: (storyId: string) => SavedStoryItem[];
  isSaved: (storyId: string, entryId: string) => boolean;
};

const STORAGE_KEY = "puchi-story-saved-words";

export const useStorySavedWordsStore = create<StorySavedWordsState>()(
  persist(
    (set, get) => ({
      items: [],

      saveItem: (item) => {
        const items = get().items;
        const idx = items.findIndex(
          (x) => x.storyId === item.storyId && x.entryId === item.entryId,
        );
        if (idx >= 0) {
          const next = [...items];
          next[idx] = {
            ...next[idx]!,
            surface: item.surface,
            meaning: item.meaning,
            kind: item.kind,
            known: item.known ?? next[idx]!.known,
          };
          set({ items: next });
          return;
        }
        set({
          items: [
            ...items,
            {
              ...item,
              known: item.known ?? false,
              savedAt: Date.now(),
            },
          ],
        });
      },

      markKnown: (storyId, entryId) => {
        set({
          items: get().items.map((x) =>
            x.storyId === storyId && x.entryId === entryId
              ? { ...x, known: true }
              : x,
          ),
        });
      },

      markAgain: (storyId, entryId) => {
        set({
          items: get().items.map((x) =>
            x.storyId === storyId && x.entryId === entryId
              ? { ...x, known: false, savedAt: Date.now() }
              : x,
          ),
        });
      },

      removeItem: (storyId, entryId) => {
        set({
          items: get().items.filter(
            (x) => !(x.storyId === storyId && x.entryId === entryId),
          ),
        });
      },

      listForStory: (storyId) =>
        get().items.filter((x) => x.storyId === storyId),

      listReviewQueue: (storyId) =>
        get().items.filter((x) => x.storyId === storyId && !x.known),

      isSaved: (storyId, entryId) =>
        get().items.some(
          (x) => x.storyId === storyId && x.entryId === entryId,
        ),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
