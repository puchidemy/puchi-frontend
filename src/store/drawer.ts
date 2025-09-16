import { create } from "zustand";

export interface DrawerResult {
  isCorrect: boolean;
  message: string;
  explanation?: string;
  score?: number;
}

interface DrawerState {
  isOpen: boolean;
  result: DrawerResult | null;
  onClose?: () => void;

  // Actions
  openDrawer: (result: DrawerResult, onClose?: () => void) => void;
  closeDrawer: () => void;
  setResult: (result: DrawerResult) => void;
}

export const useDrawerStore = create<DrawerState>((set, get) => ({
  isOpen: false,
  result: null,
  onClose: undefined,

  openDrawer: (result, onClose) => set({ isOpen: true, result, onClose }),
  closeDrawer: () => {
    const { onClose } = get();
    if (onClose) {
      onClose();
    }
    set({ isOpen: false, result: null, onClose: undefined });
  },
  setResult: (result) => set({ result }),
}));
