import type { Preferences } from '../types/ClassTypes';

const API_BASE_URL = 'http://127.0.0.1:5001/hophacks2025/us-central1/api';

export class PreferencesService {
  private static getUserId(): string {
    // For now, use a default user ID. In a real app, this would come from auth context
    return 'default-user';
  }

  static async getPreferences(): Promise<Preferences | null> {
    try {
      const userId = this.getUserId();
      const response = await fetch(`${API_BASE_URL}/preferences/${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch preferences');
      }
      
      return data.preferences;
    } catch (error) {
      console.error('Error fetching preferences:', error);
      return null;
    }
  }

  static async savePreferences(preferences: Partial<Preferences>): Promise<boolean> {
    try {
      const userId = this.getUserId();
      const response = await fetch(`${API_BASE_URL}/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...preferences,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to save preferences');
      }
      
      return true;
    } catch (error) {
      console.error('Error saving preferences:', error);
      return false;
    }
  }

  static async updatePreferences(updates: Partial<Preferences>): Promise<boolean> {
    try {
      const userId = this.getUserId();
      const response = await fetch(`${API_BASE_URL}/preferences/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to update preferences');
      }
      
      return true;
    } catch (error) {
      console.error('Error updating preferences:', error);
      return false;
    }
  }
}