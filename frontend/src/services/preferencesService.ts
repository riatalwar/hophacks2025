import axios from 'axios';
import { getAuth } from "firebase/auth";
import type { Preferences } from '../types/ClassTypes';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class PreferencesService {
  // Get user preferences from backend
  static async getPreferences(): Promise<Preferences | null> {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        console.error("No user logged in to fetch preferences");
        return null;
      }

      const response = await axios.get(`${API_BASE_URL}/preferences/${user.uid}`);
      const data = response.data as { success: boolean; preferences: Preferences; message: string };
      
      if (data.success) {
        return data.preferences;
      } else {
        console.error("Failed to fetch preferences:", data.message);
        return null;
      }
    } catch (error) {
      console.error("Failed to fetch preferences:", error);
      return null;
    }
  }

  // Save user preferences to backend
  static async savePreferences(preferences: Preferences): Promise<boolean> {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        console.error("No user logged in to save preferences");
        return false;
      }

      const preferencesData = {
        ...preferences,
        userId: user.uid,
      };

      const response = await axios.post(`${API_BASE_URL}/preferences`, preferencesData);
      const data = response.data as { success: boolean; message: string };
      
      if (data.success) {
        console.log("Preferences saved successfully");
        return true;
      } else {
        console.error("Failed to save preferences:", data.message);
        return false;
      }
    } catch (error) {
      console.error("Failed to save preferences:", error);
      return false;
    }
  }

  // Update user preferences in backend
  static async updatePreferences(preferences: Partial<Preferences>): Promise<boolean> {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        console.error("No user logged in to update preferences");
        return false;
      }

      const response = await axios.put(`${API_BASE_URL}/preferences/${user.uid}`, preferences);
      const data = response.data as { success: boolean; message: string };
      
      if (data.success) {
        console.log("Preferences updated successfully");
        return true;
      } else {
        console.error("Failed to update preferences:", data.message);
        return false;
      }
    } catch (error) {
      console.error("Failed to update preferences:", error);
      return false;
    }
  }

  // Delete user preferences from backend
  static async deletePreferences(): Promise<boolean> {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        console.error("No user logged in to delete preferences");
        return false;
      }

      const response = await axios.delete(`${API_BASE_URL}/preferences/${user.uid}`);
      const data = response.data as { success: boolean; message: string };
      
      if (data.success) {
        console.log("Preferences deleted successfully");
        return true;
      } else {
        console.error("Failed to delete preferences:", data.message);
        return false;
      }
    } catch (error) {
      console.error("Failed to delete preferences:", error);
      return false;
    }
  }

  // Get default preferences
  static getDefaultPreferences(): Preferences {
    return {
      wakeUpTimes: [0, 0, 0, 0, 0, 0, 0],
      bedtimes: [0, 0, 0, 0, 0, 0, 0],
      busyTimes: [
        { head: null, size: 0 }, // Monday
        { head: null, size: 0 }, // Tuesday
        { head: null, size: 0 }, // Wednesday
        { head: null, size: 0 }, // Thursday
        { head: null, size: 0 }, // Friday
        { head: null, size: 0 }, // Saturday
        { head: null, size: 0 }  // Sunday
      ],
      studyReminders: true,
      assignmentDeadlines: true,
      weeklyDigest: true,
      courseUpdates: true,
      systemAlerts: true,
      shareDataAnonymously: false,
      isDarkMode: true,
      accentColor: '#4ecdc4'
    };
  }
}