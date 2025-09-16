export interface Word {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  order: number;
  startTime: number;
  endTime: number;
  word: string;
  sentenceId: string;
}

export interface Sentence {
  id: string;
  unitId: string;
  text: string;
  order: number;
  startTime: number;
  endTime: number;
  words: Word[];
}

export interface Unit {
  id: string;
  title: string;
  sentences: Sentence[];
}

export interface Lesson {
  id: string;
  type: string;
  totalSteps: number;
  unitId: string;
  unit: Unit;
  createdAt: Date;
  updatedAt: Date;
}
