import type { TimeBlock } from '@shared/types/activities';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/hophacks2025/us-central1/api';

export interface ScheduleApiResponse {
  success: boolean;
  message: string;
  userId?: string;
  timeBlocks?: TimeBlock[];
  schedule?: {
    userId: string;
    timeBlocks: { [timeBlockId: string]: TimeBlock };
  };
  error?: string;
}

/**
 * Save time blocks to the backend schedule API
 */
export const saveScheduleToApi = async (
  userId: string, 
  timeBlocks: TimeBlock[]
): Promise<ScheduleApiResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        timeBlocks
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Error saving schedule to API:', error);
    throw error;
  }
};

/**
 * Load time blocks from the backend schedule API
 */
export const loadScheduleFromApi = async (
  userId: string
): Promise<TimeBlock[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/schedule/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.status === 404) {
      // No schedule found for user - return empty array
      return [];
    }

    const data: ScheduleApiResponse = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data.timeBlocks || [];
  } catch (error) {
    console.error('Error loading schedule from API:', error);
    throw error;
  }
};

/**
 * Delete a specific time block from the backend
 */
export const deleteTimeBlockFromApi = async (
  userId: string,
  timeBlockId: string
): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/schedule/${userId}/timeblocks/${timeBlockId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    console.log('Time block deleted successfully:', data.message);
  } catch (error) {
    console.error('Error deleting time block from API:', error);
    throw error;
  }
};
