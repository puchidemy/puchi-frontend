/* eslint-disable @typescript-eslint/no-unused-vars */
import type { DictationLesson, DictationAnswer } from "@/types/dictation";

export interface DictationService {
  // Get lesson data
  getLesson: (lessonId: string) => Promise<DictationLesson>;

  // Submit answer
  submitAnswer: (lessonId: string, answer: DictationAnswer) => Promise<{
    isCorrect: boolean;
    correctAnswer: string;
    explanation: string;
    score: number;
    lives: number;
  }>;

  // Skip question
  skipQuestion: (lessonId: string, questionId: string) => Promise<{
    lives: number;
  }>;

  // Complete lesson
  completeLesson: (lessonId: string, answers: DictationAnswer[]) => Promise<{
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    timeSpent: number;
    xpEarned: number;
  }>;

  // Get user progress
  getUserProgress: (lessonId: string) => Promise<{
    currentQuestionIndex: number;
    lives: number;
    score: number;
    isCompleted: boolean;
  }>;
}

// Mock implementation
export const dictationService: DictationService = {
  getLesson: async (lessonId: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    // In real implementation, this would fetch from backend
    // return fetch(`/api/dictation/lessons/${lessonId}`).then(res => res.json());

    // For now, return mock data
    const { mockDictationLesson } = await import("@/lib/mock-dictation-data");
    return mockDictationLesson;
  },

  submitAnswer: async (lessonId: string, answer: DictationAnswer) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));

    // In real implementation, this would send to backend
    // return fetch(`/api/dictation/lessons/${lessonId}/answer`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(answer)
    // }).then(res => res.json());

    // Mock response
    const isCorrect = Math.random() > 0.3; // 70% success rate for demo
    return {
      isCorrect,
      correctAnswer: "Hi",
      explanation: "Chào! means 'Hi' or 'Hello' in Vietnamese",
      score: isCorrect ? 10 : 0,
      lives: isCorrect ? 5 : 4,
    };
  },

  skipQuestion: async (lessonId: string, questionId: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 200));

    // Mock response
    return {
      lives: 4, // Lose a life
    };
  },

  completeLesson: async (lessonId: string, answers: DictationAnswer[]) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const totalQuestions = answers.length;
    const score = correctAnswers * 10;
    const timeSpent = answers.reduce((total, a) => total + a.timeSpent, 0);
    const xpEarned = Math.floor(score * 0.5);

    return {
      score,
      totalQuestions,
      correctAnswers,
      timeSpent,
      xpEarned,
    };
  },

  getUserProgress: async (lessonId: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 200));

    // Mock response
    return {
      currentQuestionIndex: 0,
      lives: 5,
      score: 0,
      isCompleted: false,
    };
  },
}; 