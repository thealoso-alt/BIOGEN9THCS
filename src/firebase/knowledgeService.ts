import {
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDoc
} from 'firebase/firestore';
import { db, isFirebaseReady } from './config';
import { TopicKnowledgeContent, TOPICS_KNOWLEDGE_BASE } from '../data/topicsKnowledgeData';

const COLLECTION_NAME = 'topic_knowledge';

export interface CloudTopicKnowledge extends TopicKnowledgeContent {
  lastUpdatedBy?: string;
  lastUpdatedByName?: string;
  updatedAt?: string;
}

/**
 * Gets knowledge content from memory/localStorage or default
 */
export function getLocalKnowledge(topicId: string): CloudTopicKnowledge {
  try {
    const key = `biogen9_knowledge_${topicId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.sections) && parsed.sections.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading local knowledge cache:', err);
  }

  // Fallback to static data
  const fallback = TOPICS_KNOWLEDGE_BASE[topicId] || TOPICS_KNOWLEDGE_BASE['dna'];
  return {
    ...fallback,
    topicId
  };
}

/**
 * Subscribes to real-time updates for a specific topic's knowledge base.
 * When the teacher edits and saves on one computer, all students on other
 * devices/Vercel receive the latest knowledge instantly.
 */
export function subscribeToTopicKnowledge(
  topicId: string,
  onUpdate: (knowledge: CloudTopicKnowledge) => void,
  onError?: (err: Error) => void
): () => void {
  // 1. Immediately provide local/default version
  const initial = getLocalKnowledge(topicId);
  onUpdate(initial);

  if (!isFirebaseReady) {
    return () => {};
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, topicId);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as CloudTopicKnowledge;
          if (data && Array.isArray(data.sections) && data.sections.length > 0) {
            try {
              localStorage.setItem(`biogen9_knowledge_${topicId}`, JSON.stringify(data));
            } catch (e) {
              console.warn('Could not cache knowledge locally:', e);
            }
            onUpdate(data);
            return;
          }
        }
        // If no cloud override yet, keep using local/default
        onUpdate(getLocalKnowledge(topicId));
      },
      (error) => {
        console.warn(`Real-time knowledge subscription notice for ${topicId}:`, error);
        onUpdate(getLocalKnowledge(topicId));
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn(`Error setting up knowledge listener for ${topicId}:`, err);
    return () => {};
  }
}

/**
 * Saves customized knowledge content to Cloud Firestore and updates local cache
 */
export async function saveTopicKnowledgeToCloud(
  knowledge: TopicKnowledgeContent,
  user?: { uid: string; fullName: string }
): Promise<boolean> {
  const cloudData: CloudTopicKnowledge = {
    ...knowledge,
    lastUpdatedBy: user?.uid || 'teacher',
    lastUpdatedByName: user?.fullName || 'Giáo viên',
    updatedAt: new Date().toISOString()
  };

  // 1. Save to local storage for instant offline fallback
  try {
    localStorage.setItem(`biogen9_knowledge_${knowledge.topicId}`, JSON.stringify(cloudData));
  } catch (e) {
    console.warn('Could not write knowledge to localStorage:', e);
  }

  // 2. Persist to Firestore
  if (!isFirebaseReady) return true;

  try {
    const docRef = doc(db, COLLECTION_NAME, knowledge.topicId);
    await setDoc(docRef, cloudData);
    return true;
  } catch (err) {
    console.error('Error saving topic knowledge to Firestore:', err);
    throw err;
  }
}

/**
 * Resets topic knowledge back to default curriculum SGK version
 */
export async function resetTopicKnowledgeToDefault(topicId: string): Promise<boolean> {
  try {
    localStorage.removeItem(`biogen9_knowledge_${topicId}`);
  } catch (e) {
    console.warn('Could not clear local knowledge cache:', e);
  }

  if (!isFirebaseReady) return true;

  try {
    const docRef = doc(db, COLLECTION_NAME, topicId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Error resetting topic knowledge in Firestore:', err);
    throw err;
  }
}
