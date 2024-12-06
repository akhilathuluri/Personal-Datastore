import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { UserSettings } from '@/types/settings';

export async function saveUserSettings(userId: string, settings: Partial<UserSettings>) {
  const settingsRef = doc(db, 'userSettings', userId);
  await setDoc(settingsRef, settings, { merge: true });
}

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const settingsRef = doc(db, 'userSettings', userId);
  const snapshot = await getDoc(settingsRef);
  return snapshot.exists() ? snapshot.data() as UserSettings : null;
} 