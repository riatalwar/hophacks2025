import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot,
  Unsubscribe 
} from 'firebase/firestore';
import { db } from '../firebase';
import type { TimeBlock, Preferences } from '@shared/types/activities';

export interface UserPreferencesData {
  // Calendar data from InputCalendar
  wakeUpTimes: { [day: number]: TimeBlock | null };
  bedtimes: { [day: number]: TimeBlock | null };
  busyTimes: TimeBlock[];
  
  // Other preferences from Preferences page
  emailNotifications: {
    studyReminders: boolean;
    assignmentDeadlines: boolean;
    weeklyDigest: boolean;
    courseUpdates: boolean;
    systemAlerts: boolean;
  };
  shareDataAnonymously: boolean;
  isDarkMode: boolean;
  accentColor: string;
  
  // Metadata
  lastUpdated: Date;
  version: number;
}

/**
 * Save user preferences to Firestore
 */
export const saveUserPreferences = async (
  userId: string, 
  preferences: Partial<UserPreferencesData>
): Promise<void> => {
  try {
    const userPrefsRef = doc(db, 'userPreferences', userId);
    
    // Get current data to merge with new preferences
    const currentDoc = await getDoc(userPrefsRef);
    const currentData = currentDoc.exists() ? currentDoc.data() as UserPreferencesData : {};
    
    const updatedData: UserPreferencesData = {
      ...currentData,
      ...preferences,
      lastUpdated: new Date(),
      version: (currentData.version || 0) + 1
    };
    
    await setDoc(userPrefsRef, updatedData, { merge: true });
    console.log('User preferences saved to Firestore');
  } catch (error) {
    console.error('Error saving user preferences:', error);
    throw error;
  }
};

/**
 * Load user preferences from Firestore
 */
export const loadUserPreferences = async (
  userId: string
): Promise<UserPreferencesData | null> => {
  try {
    const userPrefsRef = doc(db, 'userPreferences', userId);
    const docSnap = await getDoc(userPrefsRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as UserPreferencesData;
      console.log('User preferences loaded from Firestore');
      return data;
    } else {
      console.log('No user preferences found in Firestore');
      return null;
    }
  } catch (error) {
    console.error('Error loading user preferences:', error);
    throw error;
  }
};

/**
 * Save just calendar data (wake up times, bedtimes, busy times)
 */
export const saveCalendarData = async (
  userId: string,
  calendarData: {
    wakeUpTimes?: { [day: number]: TimeBlock | null };
    bedtimes?: { [day: number]: TimeBlock | null };
    busyTimes?: TimeBlock[];
  }
): Promise<void> => {
  try {
    await saveUserPreferences(userId, calendarData);
  } catch (error) {
    console.error('Error saving calendar data:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time updates for user preferences
 */
export const subscribeToUserPreferences = (
  userId: string,
  callback: (preferences: UserPreferencesData | null) => void
): Unsubscribe => {
  const userPrefsRef = doc(db, 'userPreferences', userId);
  
  return onSnapshot(
    userPrefsRef,
    (doc) => {
      if (doc.exists()) {
        const data = doc.data() as UserPreferencesData;
        callback(data);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('Error in preferences subscription:', error);
      callback(null);
    }
  );
};

/**
 * Migrate localStorage data to Firestore (for existing users)
 */
export const migrateLocalStorageToFirestore = async (userId: string): Promise<void> => {
  try {
    // Check if Firestore data already exists
    const existingData = await loadUserPreferences(userId);
    if (existingData) {
      console.log('Firestore data already exists, skipping migration');
      return;
    }
    
    // Gather localStorage data
    const busyBlocks = localStorage.getItem('studySchedule_busyBlocks');
    const wakeUpTimes = localStorage.getItem('studySchedule_wakeUpTimes');
    const bedtimes = localStorage.getItem('studySchedule_bedtimes');
    const preferences = localStorage.getItem('scheduleSort_preferences');
    const theme = localStorage.getItem('scheduleSort_theme');
    const accentColor = localStorage.getItem('scheduleSort_accentColor');
    
    const migrationData: Partial<UserPreferencesData> = {};
    
    // Migrate calendar data
    if (busyBlocks) {
      migrationData.busyTimes = JSON.parse(busyBlocks);
    }
    if (wakeUpTimes) {
      migrationData.wakeUpTimes = JSON.parse(wakeUpTimes);
    }
    if (bedtimes) {
      migrationData.bedtimes = JSON.parse(bedtimes);
    }
    
    // Migrate other preferences
    if (preferences) {
      const parsedPrefs = JSON.parse(preferences) as Preferences;
      migrationData.emailNotifications = {
        studyReminders: parsedPrefs.studyReminders,
        assignmentDeadlines: parsedPrefs.assignmentDeadlines,
        weeklyDigest: parsedPrefs.weeklyDigest,
        courseUpdates: parsedPrefs.courseUpdates,
        systemAlerts: parsedPrefs.systemAlerts
      };
      migrationData.shareDataAnonymously = parsedPrefs.shareDataAnonymously;
      migrationData.isDarkMode = parsedPrefs.isDarkMode;
      migrationData.accentColor = parsedPrefs.accentColor;
    }
    
    if (theme) {
      migrationData.isDarkMode = theme === 'dark';
    }
    
    if (accentColor) {
      migrationData.accentColor = accentColor;
    }
    
    // Save migrated data to Firestore
    if (Object.keys(migrationData).length > 0) {
      await saveUserPreferences(userId, migrationData);
      console.log('Successfully migrated localStorage data to Firestore');
    }
  } catch (error) {
    console.error('Error migrating localStorage to Firestore:', error);
  }
};
