import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { 
  saveCalendarData, 
  loadUserPreferences, 
  subscribeToUserPreferences,
  migrateLocalStorageToFirestore,
  type UserPreferencesData 
} from '../services/preferencesService';
import type { TimeBlock } from '@shared/types/activities';

export interface CalendarData {
  wakeUpTimes: { [day: number]: TimeBlock | null };
  bedtimes: { [day: number]: TimeBlock | null };
  busyTimes: TimeBlock[];
}

export const useCalendarData = () => {
  const { currentUser } = useAuth();
  const [calendarData, setCalendarData] = useState<CalendarData>({
    wakeUpTimes: {},
    bedtimes: {},
    busyTimes: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data when user is authenticated
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // First try to migrate any existing localStorage data
        await migrateLocalStorageToFirestore(currentUser.uid);

        // Load data from Firestore
        const userData = await loadUserPreferences(currentUser.uid);
        
        if (userData) {
          setCalendarData({
            wakeUpTimes: userData.wakeUpTimes || {},
            bedtimes: userData.bedtimes || {},
            busyTimes: userData.busyTimes || []
          });
        } else {
          // If no Firestore data, try localStorage as fallback
          const savedWakeUpTimes = localStorage.getItem('studySchedule_wakeUpTimes');
          const savedBedtimes = localStorage.getItem('studySchedule_bedtimes');
          const savedBusyTimes = localStorage.getItem('studySchedule_busyBlocks');

          setCalendarData({
            wakeUpTimes: savedWakeUpTimes ? JSON.parse(savedWakeUpTimes) : {},
            bedtimes: savedBedtimes ? JSON.parse(savedBedtimes) : {},
            busyTimes: savedBusyTimes ? JSON.parse(savedBusyTimes) : []
          });
        }
      } catch (err) {
        console.error('Error loading calendar data:', err);
        setError('Failed to load calendar data');
        
        // Fallback to localStorage
        const savedWakeUpTimes = localStorage.getItem('studySchedule_wakeUpTimes');
        const savedBedtimes = localStorage.getItem('studySchedule_bedtimes');
        const savedBusyTimes = localStorage.getItem('studySchedule_busyBlocks');

        setCalendarData({
          wakeUpTimes: savedWakeUpTimes ? JSON.parse(savedWakeUpTimes) : {},
          bedtimes: savedBedtimes ? JSON.parse(savedBedtimes) : {},
          busyTimes: savedBusyTimes ? JSON.parse(savedBusyTimes) : []
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToUserPreferences(currentUser.uid, (userData) => {
      if (userData) {
        setCalendarData({
          wakeUpTimes: userData.wakeUpTimes || {},
          bedtimes: userData.bedtimes || {},
          busyTimes: userData.busyTimes || []
        });
      }
    });

    return unsubscribe;
  }, [currentUser]);

  // Save functions with automatic Firestore sync
  const saveWakeUpTimes = useCallback(async (wakeUpTimes: { [day: number]: TimeBlock | null }) => {
    if (!currentUser) {
      // Fallback to localStorage if not authenticated
      localStorage.setItem('studySchedule_wakeUpTimes', JSON.stringify(wakeUpTimes));
      return;
    }

    try {
      // Save to both Firestore and localStorage (for offline support)
      await saveCalendarData(currentUser.uid, { wakeUpTimes });
      localStorage.setItem('studySchedule_wakeUpTimes', JSON.stringify(wakeUpTimes));
      
      setCalendarData(prev => ({ ...prev, wakeUpTimes }));
    } catch (err) {
      console.error('Error saving wake up times:', err);
      // Fallback to localStorage
      localStorage.setItem('studySchedule_wakeUpTimes', JSON.stringify(wakeUpTimes));
      setError('Failed to sync wake up times to cloud');
    }
  }, [currentUser]);

  const saveBedtimes = useCallback(async (bedtimes: { [day: number]: TimeBlock | null }) => {
    if (!currentUser) {
      localStorage.setItem('studySchedule_bedtimes', JSON.stringify(bedtimes));
      return;
    }

    try {
      await saveCalendarData(currentUser.uid, { bedtimes });
      localStorage.setItem('studySchedule_bedtimes', JSON.stringify(bedtimes));
      
      setCalendarData(prev => ({ ...prev, bedtimes }));
    } catch (err) {
      console.error('Error saving bedtimes:', err);
      localStorage.setItem('studySchedule_bedtimes', JSON.stringify(bedtimes));
      setError('Failed to sync bedtimes to cloud');
    }
  }, [currentUser]);

  const saveBusyTimes = useCallback(async (busyTimes: TimeBlock[]) => {
    if (!currentUser) {
      localStorage.setItem('studySchedule_busyBlocks', JSON.stringify(busyTimes));
      return;
    }

    try {
      await saveCalendarData(currentUser.uid, { busyTimes });
      localStorage.setItem('studySchedule_busyBlocks', JSON.stringify(busyTimes));
      
      setCalendarData(prev => ({ ...prev, busyTimes }));
    } catch (err) {
      console.error('Error saving busy times:', err);
      localStorage.setItem('studySchedule_busyBlocks', JSON.stringify(busyTimes));
      setError('Failed to sync busy times to cloud');
    }
  }, [currentUser]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    calendarData,
    loading,
    error,
    saveWakeUpTimes,
    saveBedtimes,
    saveBusyTimes,
    clearError
  };
};
