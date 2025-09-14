import { useState, useEffect, useCallback } from 'react';
import { PreferencesService } from '../services/preferencesService';
import type { Preferences } from '../types/ClassTypes';

export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>(() => 
    PreferencesService.loadPreferencesOrDefault()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = () => {
      try {
        setIsLoading(true);
        setError(null);
        const loadedPreferences = PreferencesService.loadPreferencesOrDefault();
        setPreferences(loadedPreferences);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load preferences');
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Save preferences
  const savePreferences = useCallback((newPreferences: Preferences) => {
    try {
      setError(null);
      PreferencesService.savePreferences(newPreferences);
      setPreferences(newPreferences);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences');
    }
  }, []);

  // Update specific preference fields
  const updatePreferences = useCallback((updates: Partial<Preferences>) => {
    try {
      setError(null);
      const updatedPreferences = PreferencesService.updatePreferences(updates);
      setPreferences(updatedPreferences);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    }
  }, []);

  // Clear all preferences
  const clearPreferences = useCallback(() => {
    try {
      setError(null);
      PreferencesService.clearPreferences();
      const defaultPreferences = PreferencesService.getDefaultPreferences();
      setPreferences(defaultPreferences);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear preferences');
    }
  }, []);

  // Export preferences
  const exportPreferences = useCallback(() => {
    try {
      return PreferencesService.exportPreferences();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export preferences');
      return null;
    }
  }, []);

  // Import preferences
  const importPreferences = useCallback((jsonString: string) => {
    try {
      setError(null);
      const success = PreferencesService.importPreferences(jsonString);
      if (success) {
        const loadedPreferences = PreferencesService.loadPreferencesOrDefault();
        setPreferences(loadedPreferences);
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import preferences');
      return false;
    }
  }, []);

  // Apply theme
  const applyTheme = useCallback((theme: 'dark' | 'light') => {
    PreferencesService.applyTheme(theme);
  }, []);

  // Apply accent color
  const applyAccentColor = useCallback((color: string) => {
    PreferencesService.applyAccentColor(color);
  }, []);

  // Initialize preferences (apply to document)
  const initializePreferences = useCallback(() => {
    const prefs = PreferencesService.initializePreferences();
    setPreferences(prefs);
  }, []);

  return {
    preferences,
    isLoading,
    error,
    savePreferences,
    updatePreferences,
    clearPreferences,
    exportPreferences,
    importPreferences,
    applyTheme,
    applyAccentColor,
    initializePreferences
  };
}
