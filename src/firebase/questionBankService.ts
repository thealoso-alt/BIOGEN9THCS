import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db, isFirebaseReady } from './config';
import { QuestionItem, QuestionDifficulty, QuestionStatus, QuestionType } from '../types/question';
import { TOPIC_QUESTION_BANKS, PracticeQuestion, MultipleChoiceQuestion, TrueFalseQuestion } from '../data/practiceQuestionsData';
import { GENETICS_TOPICS, getEquivalentTopicIds } from '../data/topicsData';
import { syncQuestionToGoogleSheet } from '../services/googleSheetService';

const COLLECTION_NAME = 'questions';
const LOCAL_STORAGE_KEY = 'biogen9_central_questions';

/**
 * Converts initial predefined topic question banks into standard QuestionItem array
 */
export function buildInitialQuestions(): QuestionItem[] {
  const allQuestions: QuestionItem[] = [];

  Object.entries(TOPIC_QUESTION_BANKS).forEach(([topicId, bank]) => {
    // 1. Multiple choice
    bank.multipleChoice.forEach((q, index) => {
      allQuestions.push({
        id: q.id || `${topicId}_mcq_${index + 1}`,
        topicId: topicId,
        question: q.question,
        type: 'mcq',
        options: q.options.map((optText, optIdx) => ({
          id: `opt_${optIdx}`,
          text: optText,
          isCorrect: optIdx === q.correctAnswer
        })),
        correctAnswer: `opt_${q.correctAnswer}`,
        explanation: q.explanation || 'Lời giải chi tiết theo chương trình Sinh học 9.',
        difficulty: (index % 3 === 0 ? 'easy' : index % 3 === 1 ? 'medium' : 'hard') as QuestionDifficulty,
        language: 'vi',
        createdBy: 'to_chuyen_mon',
        createdByName: 'Tổ Bộ môn Sinh học',
        status: 'published',
        createdAt: new Date(Date.now() - (index * 3600000)).toISOString(),
        updatedAt: new Date().toISOString()
      });
    });

    // 2. True / False
    bank.trueFalse.forEach((q, index) => {
      allQuestions.push({
        id: q.id || `${topicId}_tf_${index + 1}`,
        topicId: topicId,
        question: q.question,
        type: 'true_false',
        options: [
          { id: 'opt_true', text: 'Đúng', isCorrect: q.correctAnswer === true },
          { id: 'opt_false', text: 'Sai', isCorrect: q.correctAnswer === false }
        ],
        correctAnswer: q.correctAnswer ? 'opt_true' : 'opt_false',
        explanation: q.explanation || 'Phân tích tính đúng/sai của nhận định.',
        difficulty: (index % 2 === 0 ? 'easy' : 'medium') as QuestionDifficulty,
        language: 'vi',
        createdBy: 'to_chuyen_mon',
        createdByName: 'Tổ Bộ môn Sinh học',
        status: 'published',
        createdAt: new Date(Date.now() - (index * 3600000)).toISOString(),
        updatedAt: new Date().toISOString()
      });
    });
  });

  return allQuestions;
}

// In-memory cache
let inMemoryQuestions: QuestionItem[] = (() => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Could not read cached questions from local storage:', e);
  }
  return buildInitialQuestions();
})();

/**
 * Get all current questions synchronously from memory/cache
 */
export function getCachedQuestions(): QuestionItem[] {
  return inMemoryQuestions;
}

/**
 * Updates memory and local storage cache
 */
function updateMemoryCache(questions: QuestionItem[]) {
  inMemoryQuestions = questions;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(questions));
  } catch (e) {
    console.warn('Could not persist questions to local storage:', e);
  }
}

/**
 * Subscribes to Question Bank updates in real-time from Firestore.
 * Automatically seeds Firestore if empty, ensuring all devices have full access.
 */
export function subscribeToQuestionBank(
  onUpdate: (questions: QuestionItem[]) => void,
  onError?: (err: Error) => void
): () => void {
  // If Firestore is not ready, return current cache
  if (!isFirebaseReady) {
    onUpdate(inMemoryQuestions);
    return () => {};
  }

  try {
    const questionsCol = collection(db, COLLECTION_NAME);
    const unsubscribe = onSnapshot(
      questionsCol,
      (snapshot) => {
        if (snapshot.empty) {
          // Seed the initial questions into Firestore in batch if collection is empty
          seedInitialQuestionsToCloud();
          onUpdate(inMemoryQuestions);
          return;
        }

        const cloudQuestions: QuestionItem[] = [];
        snapshot.forEach((docSnap) => {
          cloudQuestions.push(docSnap.data() as QuestionItem);
        });

        // Sort: newest first
        cloudQuestions.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

        updateMemoryCache(cloudQuestions);
        onUpdate(cloudQuestions);
      },
      (error) => {
        console.warn('Real-time question bank subscription notice, using cached questions:', error);
        onUpdate(inMemoryQuestions);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Error establishing Firestore question bank listener:', err);
    onUpdate(inMemoryQuestions);
    return () => {};
  }
}

/**
 * Seeds initial questions into Cloud Firestore so all students and devices can read them
 */
export async function seedInitialQuestionsToCloud(): Promise<void> {
  if (!isFirebaseReady) return;
  try {
    const initialList = buildInitialQuestions();
    // Save in batches of 200
    const chunkSize = 200;
    for (let i = 0; i < initialList.length; i += chunkSize) {
      const chunk = initialList.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      chunk.forEach((q) => {
        const docRef = doc(db, COLLECTION_NAME, q.id);
        batch.set(docRef, q);
      });
      await batch.commit();
    }
    console.info(`Successfully seeded ${initialList.length} questions to Cloud Firestore.`);
  } catch (err) {
    console.warn('Could not seed initial questions to cloud:', err);
  }
}

/**
 * Teacher adds or edits a question in the Central Question Bank
 */
export async function saveQuestionToCloud(question: QuestionItem): Promise<boolean> {
  const updatedItem: QuestionItem = {
    ...question,
    updatedAt: new Date().toISOString()
  };

  // 1. Optimistic update memory & localStorage
  const existingIdx = inMemoryQuestions.findIndex(q => q.id === question.id);
  let updatedList: QuestionItem[];
  if (existingIdx >= 0) {
    updatedList = [...inMemoryQuestions];
    updatedList[existingIdx] = updatedItem;
  } else {
    updatedList = [updatedItem, ...inMemoryQuestions];
  }
  updateMemoryCache(updatedList);

  // 2. Persist to Cloud Firestore
  if (!isFirebaseReady) return true;

  try {
    const docRef = doc(db, COLLECTION_NAME, question.id);
    await setDoc(docRef, updatedItem);

    // Synchronize to Google Sheet
    syncQuestionToGoogleSheet({
      teacherCode: updatedItem.createdBy || 'GV-ONLINE',
      teacherName: updatedItem.createdByName || 'Giáo viên',
      questionId: updatedItem.id,
      topicId: updatedItem.topicId,
      type: updatedItem.type,
      question: updatedItem.question,
      correctAnswer: Array.isArray(updatedItem.correctAnswer) ? updatedItem.correctAnswer.join(', ') : String(updatedItem.correctAnswer),
      difficulty: updatedItem.difficulty,
      status: updatedItem.status,
      updatedAt: updatedItem.updatedAt || new Date().toISOString(),
    }).catch(err => console.warn('Could not sync question to Google Sheet:', err));

    return true;
  } catch (err) {
    console.error('Error saving question to Firestore:', err);
    throw err;
  }
}

/**
 * Teacher deletes a question from the Central Question Bank
 */
export async function deleteQuestionFromCloud(questionId: string): Promise<boolean> {
  // 1. Optimistic update memory & localStorage
  const updatedList = inMemoryQuestions.filter(q => q.id !== questionId);
  updateMemoryCache(updatedList);

  // 2. Delete from Cloud Firestore
  if (!isFirebaseReady) return true;

  try {
    const docRef = doc(db, COLLECTION_NAME, questionId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Error deleting question from Firestore:', err);
    throw err;
  }
}

/**
 * Helper to convert a QuestionItem into a MultipleChoiceQuestion or TrueFalseQuestion
 * suitable for the student practice page (TopicDetailPage).
 */
export function convertQuestionItemToPracticeQuestion(q: QuestionItem): PracticeQuestion | null {
  if (q.type === 'mcq') {
    // Find correct index
    let correctIndex = 0;
    if (typeof q.correctAnswer === 'string') {
      if (q.correctAnswer.startsWith('opt_')) {
        const parsed = parseInt(q.correctAnswer.replace('opt_', ''), 10);
        if (!isNaN(parsed)) correctIndex = parsed;
      } else {
        const found = q.options.findIndex(opt => opt.id === q.correctAnswer || opt.text === q.correctAnswer);
        if (found >= 0) correctIndex = found;
      }
    }

    // Ensure options have A., B., C., D. prefix if not already present
    const cleanOptions = q.options.map((opt, idx) => {
      const letters = ['A. ', 'B. ', 'C. ', 'D. '];
      const trimmed = opt.text.trim();
      if (/^[A-D]\.\s*/i.test(trimmed)) {
        return trimmed;
      }
      return `${letters[idx] || ''}${trimmed}`;
    });

    const mcq: MultipleChoiceQuestion = {
      id: q.id,
      type: 'multiple_choice',
      question: q.question,
      options: cleanOptions,
      correctAnswer: correctIndex,
      explanation: q.explanation || 'Lời giải chi tiết.'
    };
    return mcq;
  } else if (q.type === 'true_false') {
    let isCorrectTrue = true;
    if (typeof q.correctAnswer === 'string') {
      if (q.correctAnswer === 'opt_false' || q.correctAnswer.toLowerCase() === 'sai' || q.correctAnswer === 'false') {
        isCorrectTrue = false;
      }
    }

    const tf: TrueFalseQuestion = {
      id: q.id,
      type: 'true_false',
      question: q.question,
      correctAnswer: isCorrectTrue,
      explanation: q.explanation || 'Phân tích nhận định.'
    };
    return tf;
  }

  return null;
}

/**
 * Gets randomized practice questions directly from the Central Question Bank
 * for a specific topic (strictly 7 MCQs + 3 True/False, or proportional based on bank).
 */
export function getPracticeQuestionsFromBank(topicId: string): PracticeQuestion[] {
  const allowedTopicIds = getEquivalentTopicIds(topicId);

  // Filter questions by topic and published status
  const topicQuestions = inMemoryQuestions.filter(
    q => allowedTopicIds.includes(q.topicId) && (q.status === 'published' || q.status === 'approved')
  );

  const mcqs = topicQuestions.filter(q => q.type === 'mcq');
  const tfs = topicQuestions.filter(q => q.type === 'true_false');

  // Shuffle
  const shuffledMcqs = [...mcqs].sort(() => 0.5 - Math.random());
  const shuffledTfs = [...tfs].sort(() => 0.5 - Math.random());

  // Pick up to 7 MCQs and 3 True/False
  const selectedMcqs = shuffledMcqs.slice(0, 7);
  const selectedTfs = shuffledTfs.slice(0, 3);

  const result: PracticeQuestion[] = [];
  selectedMcqs.forEach(q => {
    const converted = convertQuestionItemToPracticeQuestion(q);
    if (converted) result.push(converted);
  });

  selectedTfs.forEach(q => {
    const converted = convertQuestionItemToPracticeQuestion(q);
    if (converted) result.push(converted);
  });

  // If the bank has fewer than 5 questions for this topic, fallback to default topic bank
  if (result.length < 5) {
    for (const tid of allowedTopicIds) {
      if (TOPIC_QUESTION_BANKS[tid]) {
        const fallbackBank = TOPIC_QUESTION_BANKS[tid];
        const addedMcqs = fallbackBank.multipleChoice.slice(0, 7);
        const addedTfs = fallbackBank.trueFalse.slice(0, 3);
        result.push(...addedMcqs, ...addedTfs);
        if (result.length >= 10) break;
      }
    }
  }

  return result;
}
