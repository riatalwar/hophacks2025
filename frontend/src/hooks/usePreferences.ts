import { useState, useEffect, useCallback } from 'react';
import { PreferencesService } from '../services/preferencesService';
import type { Preferences } from '../types/ClassTypes';

export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load preferences from backend
  const loadPreferences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userPreferences = await PreferencesService.getPreferences();
      
      if (userPreferences) {
        setPreferences(userPreferences);
      } else {
        // Use default preferences if none found
        const defaultPreferences = PreferencesService.getDefaultPreferences();
        setPreferences(defaultPreferences);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preferences');
      // Fallback to default preferences on error
      setPreferences(PreferencesService.getDefaultPreferences());
    } finally {
      setLoading(false);
    }
  }, []);

  // Save preferences to backend
  const savePreferences = useCallback(async (newPreferences: Preferences): Promise<boolean> => {
    try {
      setError(null);
      
      const success = await PreferencesService.savePreferences(newPreferences);
      
      if (success) {
        setPreferences(newPreferences);
        return true;
      } else {
        setError('Failed to save preferences');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences');
      return false;
    }
  }, []);

  // Update specific preference fields
  const updatePreferences = useCallback(async (updates: Partial<Preferences>): Promise<boolean> => {
    if (!preferences) return false;
    
    try {
      setError(null);
      
      const updatedPreferences = { ...preferences, ...updates };
      const success = await PreferencesService.updatePreferences(updates);
      
      if (success) {
        setPreferences(updatedPreferences);
        return true;
      } else {
        setError('Failed to update preferences');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
      return false;
    }
  }, [preferences]);

  // Delete preferences from backend
  const deletePreferences = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      
      const success = await PreferencesService.deletePreferences();
      
      if (success) {
        // Reset to default preferences after deletion
        const defaultPreferences = PreferencesService.getDefaultPreferences();
        setPreferences(defaultPreferences);
        return true;
      } else {
        setError('Failed to delete preferences');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete preferences');
      return false;
    }
  }, []);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    preferences,
    loading,
    error,
    loadPreferences,
    savePreferences,
    updatePreferences,
    deletePreferences,
  };
}