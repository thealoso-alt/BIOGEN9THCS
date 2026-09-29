export interface Badge {
  id: string;
  name: string;
  titleVi: string;
  descriptionVi: string;
  icon: string; // Lucide icon identifier or emoji
  criteria: string;
  unlockedAt?: string;
}

export interface Challenge {
  id: string;
  title: string;
  topicId: string;
  questionCount: number;
  timeLimitSeconds: number;
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  createdBy: string;
  classId?: string;
  isActive: boolean;
}

export interface LiveBattleTeam {
  teamId: string;
  name: string;
  score: number;
  studentIds: string[];
}

export interface LiveBattleGame {
  id: string;
  code: string; // e.g. "DNA928"
  title: string;
  classId: string;
  teacherId: string;
  status: 'waiting' | 'active' | 'finished';
  currentQuestionIndex: number;
  totalQuestions: number;
  timePerQuestion: number;
  teams: {
    teamA: LiveBattleTeam;
    teamB: LiveBattleTeam;
  };
  createdAt: string;
}
