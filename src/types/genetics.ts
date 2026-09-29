export type ModuleType = 'molecular' | 'cellular';

export type TopicStatus = 'locked' | 'available' | 'in_progress' | 'completed' | 'mastered';

export type TopicTab =
  | 'explore'
  | 'interactive'
  | 'knowledge'
  | 'english_bio'
  | 'materials'
  | 'practice'
  | 'challenge'
  | 'assessment';

export interface GeneticsTopic {
  id: string;
  order: number;
  module: ModuleType;
  titleVi: string;
  titleEn: string;
  slug: string;
  descriptionVi: string;
  keyConcepts: string[];
  interactiveType: 'dna_helix' | 'replication' | 'transcription' | 'translation' | 'mitosis' | 'meiosis' | 'chromosome' | 'pedigree' | 'general';
  xpReward: number;
  estimatedMinutes: number;
  prerequisiteId?: string;
}

export interface StudentTopicProgress {
  topicId: string;
  status: TopicStatus;
  progressPercent: number; // 0 - 100
  exploreCompleted: boolean;
  interactiveCompleted: boolean;
  knowledgeRead: boolean;
  englishBioScore: number;
  practiceScore: number;
  challengeBestTimeSec?: number;
  challengeBestScore?: number;
  assessmentScore?: number;
  lastStudiedAt: string;
}
