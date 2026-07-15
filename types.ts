export type Difficulty = 'easy' | 'medium' | 'hard';

export type QuestionType =
  | 'mcq'
  | 'fill_blank'
  | 'true_false'
  | 'short_answer'
  | 'long_answer'
  | 'numerical';

export interface Question {
  id: string;
  class: number; 
  subject?: string;
  chapter: string;
  worksheet?: string;
  type: QuestionType | string;
  difficulty: Difficulty | string;
  marks: number;
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
  hint?: string;
  tags?: string[];
  estimatedTime?: number;
  relatedConcept?: string;
}

export interface Chapter {
  id: string;
  name: string;
  classId: number;
  description: string;
  questions: Question[];
}

export interface ClassInfo {
  id: number;
  name: string;
  chaptersCount: number;
  worksheetsCount: number;
  questionsCount: number;
  chapters: Chapter[];
}

export interface Worksheet {
  id: string;
  classId: number;
  number: number;
  title: string;
  questions: Question[];
  difficulty: Difficulty;
  estimatedTime: number; // In minutes
}

export interface QuizSession {
  classId: number;
  chapterId: string | 'all';
  difficulty: Difficulty | 'all';
  limit: number;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, string>; // questionId -> selected/typed answer
  bookmarked: Record<string, boolean>; // questionId -> bookmarked for review
  timeLeft: number; // in seconds
  totalTime: number; // in seconds
  status: 'idle' | 'active' | 'completed';
  score?: number;
  percentage?: number;
  correctCount?: number;
  wrongCount?: number;
  timeTaken?: number;
}

export interface UserProgress {
  solvedQuestions: Record<string, { answered: string; isCorrect: boolean; timestamp: string }>; // questionId -> answer details
  completedWorksheets: string[]; // worksheetId
  quizAttempts: {
    id: string;
    classId: number;
    chapterId: string;
    score: number;
    total: number;
    percentage: number;
    timeTaken: number;
    timestamp: string;
  }[];
  streak: number;
  lastActiveDate: string | null; // YYYY-MM-DD
  favoriteChapters: string[]; // chapterId
  bookmarkedQuestions: string[]; // questionId
  xp: number;
  coins: number;
  lastRewardDate?: string | null;
}
