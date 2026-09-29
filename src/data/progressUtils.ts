import { StudentTopicProgress } from '../types/genetics';

// Function to generate fresh 0% progress for all 15 topics
export const createFreshProgress = (): Record<string, StudentTopicProgress> => {
  const topicIds = [
    'dna', 'gene', 'rna', 'protein',
    'dna_replication', 'transcription', 'translation', 'gene_mutation',
    'chromosome', 'chromosome_set', 'mitosis', 'meiosis',
    'sex_determination', 'genetic_linkage', 'chromosomal_mutation'
  ];

  const progress: Record<string, StudentTopicProgress> = {};
  topicIds.forEach((id, idx) => {
    progress[id] = {
      topicId: id,
      status: idx === 0 ? 'available' : 'available', // available to learn
      progressPercent: 0,
      exploreCompleted: false,
      interactiveCompleted: false,
      knowledgeRead: false,
      englishBioScore: 0,
      practiceScore: 0,
      challengeBestTimeSec: undefined,
      challengeBestScore: undefined,
      assessmentScore: undefined,
      lastStudiedAt: '',
    };
  });
  return progress;
};
