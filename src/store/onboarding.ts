import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ConversationOption {
  text: string;
  icon: string;
  response: string;
}

export interface Conversation {
  id: number;
  question: string;
  options: ConversationOption[];
}

export interface ConversationMessage {
  type: "question" | "user" | "puchi";
  content: string;
  position: "left" | "right";
  color?: string;
}

interface OnboardingState {
  currentStep: number;
  answers: Record<number, string>;
  conversationHistory: Record<number, ConversationMessage[]>;
  currentConversation: ConversationMessage[];
  isAnimating: boolean;

  // Actions
  setCurrentStep: (step: number) => void;
  setAnswer: (step: number, answer: string) => void;
  setConversationHistory: (step: number, conversation: ConversationMessage[]) => void;
  setCurrentConversation: (conversation: ConversationMessage[] | ((prev: ConversationMessage[]) => ConversationMessage[])) => void;
  setIsAnimating: (animating: boolean) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      currentStep: 0,
      answers: {},
      conversationHistory: {},
      currentConversation: [],
      isAnimating: false,

      setCurrentStep: (step) => set({ currentStep: step }),

      setAnswer: (step, answer) =>
        set((state) => ({
          answers: { ...state.answers, [step]: answer }
        })),

      setConversationHistory: (step, conversation) =>
        set((state) => ({
          conversationHistory: { ...state.conversationHistory, [step]: conversation }
        })),

      setCurrentConversation: (conversation) => set({
        currentConversation: typeof conversation === 'function'
          ? conversation(get().currentConversation)
          : conversation
      }),

      setIsAnimating: (animating) => set({ isAnimating: animating }),

      reset: () => set({
        currentStep: 0,
        answers: {},
        conversationHistory: {},
        currentConversation: [],
        isAnimating: false,
      }),
    }),
    {
      name: 'onboarding-storage',
      partialize: (state) => ({
        currentStep: state.currentStep,
        answers: state.answers,
        conversationHistory: state.conversationHistory,
      }),
    }
  )
); 