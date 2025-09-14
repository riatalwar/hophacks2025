import type { TimeBlock } from '@shared/types/activities';

/**
 * Generates sleep time blocks based on bedtime and wake up time arrays
 */
export function generateSleepTimeBlocks(
  bedtimes: number[], // Array of 7 numbers (minutes from midnight)
  wakeUpTimes: number[], // Array of 7 numbers (minutes from midnight)
  userId: string
): TimeBlock[] {
  const sleepBlocks: TimeBlock[] = [];

  for (let day = 0; day < 7; day++) {
    const bedtime = bedtimes[day];
    const wakeUpTime = wakeUpTimes[day];

    if (bedtime > 0 && wakeUpTime > 0) {
      // Create bedtime block (from bedtime to midnight)
      if (bedtime < 1440) { // 1440 minutes = 24 hours
        sleepBlocks.push({
          id: `sleep-bedtime-${day}`,
          day,
          startTime: bedtime,
          endTime: 1440, // Midnight
          type: 'bedtime',
          notes: 'Sleep time'
        });
      }

      // Create wake up block (from midnight to wake up time)
      if (wakeUpTime > 0) {
        sleepBlocks.push({
          id: `sleep-wakeup-${day}`,
          day,
          startTime: 0, // Midnight
          endTime: wakeUpTime,
          type: 'bedtime', // Using bedtime type for sleep period
          notes: 'Sleep time'
        });
      }

      // Create wake up event (just the wake up moment)
      sleepBlocks.push({
        id: `wake-event-${day}`,
        day,
        startTime: wakeUpTime,
        endTime: wakeUpTime + 30, // 30 minute wake up window
        type: 'wake',
        notes: 'Wake up'
      });
    }
  }

  return sleepBlocks;
}

// Debounce map to prevent too many rapid API calls
const updateSleepScheduleDebounceMap = new Map<string, NodeJS.Timeout>();

/**
 * Updates sleep schedule in the backend with debouncing
 */
export async function updateSleepSchedule(
  bedtimes: number[],
  wakeUpTimes: number[],
  userId: string,
  apiBaseUrl: string
) {
  // Clear any existing timeout for this user
  const existingTimeout = updateSleepScheduleDebounceMap.get(userId);
  if (existingTimeout) {
    clearTimeout(existingTimeout);
  }

  // Return a promise that resolves after debounce delay
  return new Promise((resolve) => {
    const timeout = setTimeout(async () => {
      try {
        // Generate sleep time blocks
        const sleepBlocks = generateSleepTimeBlocks(bedtimes, wakeUpTimes, userId);

        // Send to backend
        const response = await fetch(`${apiBaseUrl}/schedule`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            timeBlocks: sleepBlocks
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        resolve({
          success: true,
          data: result,
          sleepBlocks
        });
      } catch (error) {
        console.error('Failed to update sleep schedule:', error);
        resolve({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          sleepBlocks: []
        });
      } finally {
        // Clean up the timeout from the map
        updateSleepScheduleDebounceMap.delete(userId);
      }
    }, 500); // 500ms debounce delay

    // Store the timeout in the map
    updateSleepScheduleDebounceMap.set(userId, timeout);
  });
}

/**
 * Removes existing sleep time blocks for a user
 */
export async function removeSleepTimeBlocks(
  userId: string,
  apiBaseUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // First, fetch current schedule to find sleep blocks
    const response = await fetch(`${apiBaseUrl}/schedule/${userId}`);

    if (!response.ok) {
      return { success: true }; // No schedule exists, nothing to remove
    }

    const data = await response.json();
    const timeBlocks = data.timeBlocks || [];

    // Find sleep-related blocks
    const sleepBlockIds = timeBlocks
      .filter((tb: TimeBlock) =>
        tb.id.startsWith('sleep-') ||
        tb.id.startsWith('wake-') ||
        tb.type === 'bedtime' ||
        tb.type === 'wake'
      )
      .map((tb: TimeBlock) => tb.id);

    // Remove each sleep block
    for (const blockId of sleepBlockIds) {
      try {
        await fetch(`${apiBaseUrl}/schedule/${userId}/timeblocks/${blockId}`, {
          method: 'DELETE'
        });
      } catch (err) {
        console.warn(`Failed to delete sleep block ${blockId}:`, err);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to remove sleep blocks:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Converts time in minutes since midnight to HH:MM format
 */
export function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Converts HH:MM format to minutes since midnight
 */
export function timeStringToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Gets default bedtime/wake up times
 */
export const DEFAULT_SLEEP_SCHEDULE = {
  bedtimes: [
    23 * 60,  // Sunday: 11:00 PM
    23 * 60,  // Monday: 11:00 PM
    23 * 60,  // Tuesday: 11:00 PM
    23 * 60,  // Wednesday: 11:00 PM
    23 * 60,  // Thursday: 11:00 PM
    24 * 60,  // Friday: 12:00 AM (midnight)
    24 * 60   // Saturday: 12:00 AM (midnight)
  ],
  wakeUpTimes: [
    8 * 60,   // Sunday: 8:00 AM
    7 * 60,   // Monday: 7:00 AM
    7 * 60,   // Tuesday: 7:00 AM
    7 * 60,   // Wednesday: 7:00 AM
    7 * 60,   // Thursday: 7:00 AM
    7 * 60,   // Friday: 7:00 AM
    9 * 60    // Saturday: 9:00 AM
  ]
};