import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  getDocs
} from 'firebase/firestore';
import { db, isFirebaseReady } from './config';
import { TopicVideoItem } from '../components/materials/TopicVideoLibrary';

const COLLECTION_NAME = 'topic_videos';

/**
 * Subscribes in real-time to video lectures for a specific topic.
 * As soon as a teacher adds a video, all students on any device/domain (e.g. Vercel)
 * automatically receive the update in real-time.
 */
export function subscribeToTopicVideos(
  topicId: string,
  onUpdate: (videos: TopicVideoItem[]) => void,
  onError?: (err: Error) => void
): () => void {
  if (!isFirebaseReady) {
    return () => {};
  }

  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('topicId', '==', topicId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const cloudVideos: TopicVideoItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as TopicVideoItem;
          cloudVideos.push({
            ...data,
            id: docSnap.id
          });
        });

        // Sort latest first
        cloudVideos.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        onUpdate(cloudVideos);
      },
      (error) => {
        console.warn('Firestore topic_videos subscription notice:', error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Could not establish real-time listener for topic_videos:', err);
    return () => {};
  }
}

/**
 * Saves or updates a video lecture in Firestore Cloud Database.
 * This takes less than 1KB of cloud storage and allows instant cross-device access.
 */
export async function saveVideoToCloud(video: TopicVideoItem): Promise<boolean> {
  if (!isFirebaseReady) {
    console.warn('Firebase is not configured for cloud video saving.');
    return false;
  }

  try {
    const videoRef = doc(db, COLLECTION_NAME, video.id);
    await setDoc(videoRef, {
      ...video,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error saving video to Firestore cloud:', error);
    throw error;
  }
}

/**
 * Deletes a video lecture from Firestore Cloud Database.
 */
export async function deleteVideoFromCloud(videoId: string): Promise<boolean> {
  if (!isFirebaseReady) return false;

  try {
    const videoRef = doc(db, COLLECTION_NAME, videoId);
    await deleteDoc(videoRef);
    return true;
  } catch (error) {
    console.error('Error deleting video from Firestore cloud:', error);
    throw error;
  }
}
