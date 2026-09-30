import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db, isFirebaseReady } from './config';
import { ClassRoom, UserAccountCredential } from '../types/auth';
import { DEMO_CLASSES, INITIAL_ACCOUNTS } from '../data/mockSeedData';

const CLASSES_COLLECTION = 'classes';
const ACCOUNTS_COLLECTION = 'accounts';

/**
 * Subscribes to Classes in real-time from Firestore.
 */
export function subscribeToClasses(
  onUpdate: (classes: ClassRoom[]) => void,
  onError?: (err: Error) => void
): () => void {
  if (!isFirebaseReady) {
    return () => {};
  }

  try {
    const colRef = collection(db, CLASSES_COLLECTION);
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          // Seed demo classes if empty
          seedDemoClasses();
          return;
        }

        const cloudClasses: ClassRoom[] = [];
        snapshot.forEach((docSnap) => {
          cloudClasses.push(docSnap.data() as ClassRoom);
        });

        cloudClasses.sort((a, b) => a.name.localeCompare(b.name));
        onUpdate(cloudClasses);
      },
      (error) => {
        console.warn('Real-time classes subscription notice:', error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Error subscribing to classes:', err);
    return () => {};
  }
}

/**
 * Saves or updates a Class document in Firestore
 */
export async function saveClassToCloud(classItem: ClassRoom): Promise<boolean> {
  if (!isFirebaseReady) return false;
  try {
    const docRef = doc(db, CLASSES_COLLECTION, classItem.id);
    await setDoc(docRef, classItem);
    return true;
  } catch (err) {
    console.error('Error saving class to Firestore:', err);
    throw err;
  }
}

/**
 * Deletes a Class from Firestore
 */
export async function deleteClassFromCloud(classId: string): Promise<boolean> {
  if (!isFirebaseReady) return false;
  try {
    const docRef = doc(db, CLASSES_COLLECTION, classId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Error deleting class from Firestore:', err);
    throw err;
  }
}

/**
 * Subscribes to Accounts/Student Credentials in real-time from Firestore
 * so that any student created by the teacher can log in from other computers/Vercel.
 */
export function subscribeToAccounts(
  onUpdate: (accounts: UserAccountCredential[]) => void,
  onError?: (err: Error) => void
): () => void {
  if (!isFirebaseReady) {
    return () => {};
  }

  try {
    const colRef = collection(db, ACCOUNTS_COLLECTION);
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          // Seed initial accounts if empty
          seedInitialAccounts();
          return;
        }

        const cloudAccounts: UserAccountCredential[] = [];
        snapshot.forEach((docSnap) => {
          cloudAccounts.push(docSnap.data() as UserAccountCredential);
        });

        onUpdate(cloudAccounts);
      },
      (error) => {
        console.warn('Real-time accounts subscription notice:', error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Error subscribing to accounts:', err);
    return () => {};
  }
}

/**
 * Saves a single account (student or teacher) to Firestore
 */
export async function saveSingleAccountToCloud(account: UserAccountCredential): Promise<boolean> {
  if (!isFirebaseReady) return false;
  try {
    const docRef = doc(db, ACCOUNTS_COLLECTION, account.uid);
    await setDoc(docRef, account);
    return true;
  } catch (err) {
    console.error('Error saving account to Firestore:', err);
    throw err;
  }
}

/**
 * Batch saves multiple accounts to Firestore (e.g. from Excel/CSV student import)
 */
export async function saveAccountsToCloud(accounts: UserAccountCredential[]): Promise<boolean> {
  if (!isFirebaseReady || accounts.length === 0) return false;
  try {
    const chunkSize = 200;
    for (let i = 0; i < accounts.length; i += chunkSize) {
      const chunk = accounts.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      chunk.forEach((acc) => {
        const docRef = doc(db, ACCOUNTS_COLLECTION, acc.uid);
        batch.set(docRef, acc);
      });
      await batch.commit();
    }
    return true;
  } catch (err) {
    console.error('Error batch saving accounts to Firestore:', err);
    throw err;
  }
}

/**
 * Deletes an account from Firestore
 */
export async function deleteAccountFromCloud(uid: string): Promise<boolean> {
  if (!isFirebaseReady) return false;
  try {
    const docRef = doc(db, ACCOUNTS_COLLECTION, uid);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Error deleting account from Firestore:', err);
    throw err;
  }
}

// Seed helpers
async function seedDemoClasses() {
  if (!isFirebaseReady) return;
  try {
    const batch = writeBatch(db);
    DEMO_CLASSES.forEach((c) => {
      const docRef = doc(db, CLASSES_COLLECTION, c.id);
      batch.set(docRef, c);
    });
    await batch.commit();
  } catch (err) {
    console.warn('Could not seed demo classes:', err);
  }
}

async function seedInitialAccounts() {
  if (!isFirebaseReady) return;
  try {
    const batch = writeBatch(db);
    INITIAL_ACCOUNTS.forEach((acc) => {
      const docRef = doc(db, ACCOUNTS_COLLECTION, acc.uid);
      batch.set(docRef, acc);
    });
    await batch.commit();
  } catch (err) {
    console.warn('Could not seed initial accounts:', err);
  }
}
