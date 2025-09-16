export interface DictationWord {
  id: string;
  text: string;
}

export interface DictationQuestion {
  id: string;
  type: 'new_word' | 'review_word';
  instruction: string;
  targetWord: string;
  targetLanguage: 'vi' | 'en';
  answerLanguage: 'vi' | 'en';
  wordOptions: DictationWord[];
  correctAnswers: string[][]; // Array of possible correct answers (each answer is a sequence of word IDs)
  explanation?: string;
  audioUrl?: string;
}

export interface DictationLesson {
  id: string;
  title: string;
  description: string;
  totalQuestions: number;
  currentQuestionIndex: number;
  lives: number;
  maxLives: number;
  progress: number;
  questions: DictationQuestion[];
  isCompleted: boolean;
  score: number;
}

export interface DictationAnswer {
  questionId: string;
  userAnswerIds: string[]; 
  isCorrect: boolean;
  timeSpent: number;
}
