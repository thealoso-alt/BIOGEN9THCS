export type QuestionType =
  | 'mcq'
  | 'true_false'
  | 'matching'
  | 'fill_blank'
  | 'ordering'
  | 'image_question'
  | 'drag_drop';

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export type QuestionStatus = 'draft' | 'under_review' | 'approved' | 'published';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface QuestionItem {
  id: string;
  topicId: string;
  question: string;
  type: QuestionType;
  options: QuestionOption[];
  correctAnswer: string | string[]; // option id or string or list
  explanation: string;
  difficulty: QuestionDifficulty;
  language: 'vi' | 'en' | 'bilingual';
  englishTerm?: string;
  imageUrl?: string;
  createdBy: string;
  createdByName?: string;
  status: QuestionStatus;
  isAiGenerated?: boolean;
  aiModel?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  topicId: string;
  quizType: 'practice' | 'challenge' | 'assessment';
  score: number;
  maxScore: number;
  correctCount: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  xpEarned: number;
  completedAt: string;
}
