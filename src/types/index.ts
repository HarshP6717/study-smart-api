export interface User {
  id: string;
  email: string;
  name: string;
  coins: number;
  avatar?: string;
  banner?: string;
  badge?: string;
  createdAt: string;
}

export interface Subject {
  id: string;
  userId: string;
  name: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionsCount: number;
  createdAt: string;
}

export interface Question {
  id: string;
  subjectId: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: string;
}

export interface Flashcard {
  id: string;
  userId: string;
  subjectId?: string;
  front: string;
  back: string;
  createdAt: string;
}

export interface CheatSheet {
  id: string;
  userId: string;
  subjectId: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface Progress {
  id: string;
  userId: string;
  subjectId: string;
  quizzesCompleted: number;
  accuracy: number;
  updatedAt: string;
}

export interface StudySession {
  id: string;
  userId: string;
  subjectId: string;
  startTime: string;
  endTime?: string;
  durationMinutes: number;
}

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'avatar' | 'banner' | 'badge';
  imageUrl: string;
  createdAt: string;
}

export interface UserStoreItem {
  id: string;
  userId: string;
  storeItemId: string;
  purchasedAt: string;
}

export interface ChatMessage {
  id: string;
  userId?: string;
  message: string;
  response: string;
  createdAt: string;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  timeSpent: number;
  answers: {
    questionId: string;
    selectedIndex: number;
    correct: boolean;
  }[];
}