export interface EnglishTerm {
  id: string;
  topicId: string;
  englishTerm: string;
  vietnameseMeaning: string;
  pronunciation: string;
  definition: string;
  definitionVi: string;
  functionDesc: string;
  exampleSentence: string;
  relatedTerms: string[];
  imageUrl?: string;
  category: 'molecular' | 'cellular';
}

export type EnglishGameType =
  | 'en_to_vi'
  | 'en_to_img'
  | 'en_to_func'
  | 'listen_to_choose';
