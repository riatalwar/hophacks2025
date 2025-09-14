import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { saveScheduleToApi, loadScheduleFromApi } from '../services/scheduleApi';
import type { TimeBlock } from '@shared/types/activities';

export interface CalendarData {
  wakeUpTimes: { [day: number]: TimeBlock | null };
  bedtimes: { [day: number]: TimeBlock | null };
  busyTimes: TimeBlock[];
}

export const useScheduleApi = () => {
  const { currentUser } = useAuth();
  const [calendarData, setCalendarData] = useState<CalendarData>({
    wakeUpTimes: {},
    bedtimes: {},
    busyTimes: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Transform API TimeBlock[] to CalendarData format
  const transformApiToCalendarData = useCallback((timeBlocks: TimeBlock[]): CalendarData => {
    const wakeUpTimes: { [day: number]: TimeBlock | null } = {};
    const bedtimes: { [day: number]: TimeBlock | null } = {};
    const busyTimes: TimeBlock[] = [];

    timeBlocks.forEach(block => {
      if (block.type === 'wake') {
        wakeUpTimes[block.day] = block;
      } else if (block.type === 'bedtime') {
        bedtimes[block.day] = block;
      } else if (block.type === 'busy') {
        busyTimes.push(block);
      }
    });

    return { wakeUpTimes, bedtimes, busyTimes };
  }, []);

  // Transform CalendarData to API TimeBlock[] format
  const transformCalendarDataToApi = useCallback((data: CalendarData): TimeBlock[] => {
    const timeBlocks: TimeBlock[] = [];

    // Add wake up times
    Object.values(data.wakeUpTimes).forEach(wakeTime => {
      if (wakeTime) {
        timeBlocks.push(wakeTime);
      }
    });

    // Add bedtimes
    Object.values(data.bedtimes).forEach(bedtime => {
      if (bedtime) {
        timeBlocks.push(bedtime);
      }
    });

    // Add busy times
    timeBlocks.push(...data.busyTimes);

    return timeBlocks;
  }, []);

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

        const timeBlocks = await loadScheduleFromApi(currentUser.uid);
        const calendarData = transformApiToCalendarData(timeBlocks);
        setCalendarData(calendarData);

        // If no API data, try localStorage as fallback
        if (timeBlocks.length === 0) {
          const savedWakeUpTimes = localStorage.getItem('studySchedule_wakeUpTimes');
          const savedBedtimes = localStorage.getItem('studySchedule_bedtimes');
          const savedBusyTimes = localStorage.getItem('studySchedule_busyBlocks');

          const fallbackData: CalendarData = {
            wakeUpTimes: savedWakeUpTimes ? JSON.parse(savedWakeUpTimes) : {},
            bedtimes: savedBedtimes ? JSON.parse(savedBedtimes) : {},
            busyTimes: savedBusyTimes ? JSON.parse(savedBusyTimes) : []
          };

          setCalendarData(fallbackData);

          // If we have localStorage data, migrate it to the API
          const fallbackTimeBlocks = transformCalendarDataToApi(fallbackData);
          if (fallbackTimeBlocks.length > 0) {
            try {
              await saveScheduleToApi(currentUser.uid, fallbackTimeBlocks);
              console.log('Successfully migrated localStorage data to API');
            } catch (migrationError) {
              console.warn('Failed to migrate localStorage data to API:', migrationError);
            }
          }
        }
      } catch (err) {
        console.error('Error loading calendar data from API:', err);
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
  }, [currentUser, transformApiToCalendarData, transformCalendarDataToApi]);

  // Generic save function that handles API calls
  const saveToApi = useCallback(async (updatedData: Partial<CalendarData>) => {
    if (!currentUser) {
      console.warn('No authenticated user - skipping API save');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const newCalendarData = { ...calendarData, ...updatedData };
      const timeBlocks = transformCalendarDataToApi(newCalendarData);
      
      await saveScheduleToApi(currentUser.uid, timeBlocks);
      setCalendarData(newCalendarData);

      // Also save to localStorage as backup
      if (updatedData.wakeUpTimes) {
        localStorage.setItem('studySchedule_wakeUpTimes', JSON.stringify(updatedData.wakeUpTimes));
      }
      if (updatedData.bedtimes) {
        localStorage.setItem('studySchedule_bedtimes', JSON.stringify(updatedData.bedtimes));
      }
      if (updatedData.busyTimes) {
        localStorage.setItem('studySchedule_busyBlocks', JSON.stringify(updatedData.busyTimes));
      }

    } catch (err) {
      console.error('Error saving to API:', err);
      setError('Failed to save changes');
      
      // Still update local state and localStorage as fallback
      setCalendarData(prev => ({ ...prev, ...updatedData }));
      if (updatedData.wakeUpTimes) {
        localStorage.setItem('studySchedule_wakeUpTimes', JSON.stringify(updatedData.wakeUpTimes));
      }
      if (updatedData.bedtimes) {
        localStorage.setItem('studySchedule_bedtimes', JSON.stringify(updatedData.bedtimes));
      }
      if (updatedData.busyTimes) {
        localStorage.setItem('studySchedule_busyBlocks', JSON.stringify(updatedData.busyTimes));
      }
    } finally {
      setSaving(false);
    }
  }, [currentUser, calendarData, transformCalendarDataToApi]);

  // Save functions for each data type
  const saveWakeUpTimes = useCallback(async (wakeUpTimes: { [day: number]: TimeBlock | null }) => {
    await saveToApi({ wakeUpTimes });
  }, [saveToApi]);

  const saveBedtimes = useCallback(async (bedtimes: { [day: number]: TimeBlock | null }) => {
    await saveToApi({ bedtimes });
  }, [saveToApi]);

  const saveBusyTimes = useCallback(async (busyTimes: TimeBlock[]) => {
    await saveToApi({ busyTimes });
  }, [saveToApi]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    calendarData,
    loading,
    saving,
    error,
    saveWakeUpTimes,
    saveBedtimes,
    saveBusyTimes,
    clearError
  };
};
