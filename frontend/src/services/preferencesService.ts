import type { Preferences } from '../types/ClassTypes';

export class PreferencesService {
  private static readonly STORAGE_KEY = 'classCatcher_preferences';
  private static readonly THEME_KEY = 'classCatcher_theme';
  private static readonly ACCENT_COLOR_KEY = 'classCatcher_accentColor';

  /**
   * Save preferences to localStorage
   */
  static savePreferences(preferences: Preferences): void {
    try {
      // Save main preferences object
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences));
      
      // Save individual theme and accent color for immediate application
      localStorage.setItem(this.THEME_KEY, preferences.isDarkMode ? 'dark' : 'light');
      localStorage.setItem(this.ACCENT_COLOR_KEY, preferences.accentColor);
      
      console.log('Preferences saved successfully:', preferences);
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw new Error('Failed to save preferences');
    }
  }

  /**
   * Load preferences from localStorage
   */
  static loadPreferences(): Preferences | null {
    try {
      const savedPreferences = localStorage.getItem(this.STORAGE_KEY);
      
      if (!savedPreferences) {
        return null;
      }

      const preferences: Preferences = JSON.parse(savedPreferences);
      console.log('Preferences loaded successfully:', preferences);
      return preferences;
    } catch (error) {
      console.error('Error loading preferences:', error);
      return null;
    }
  }

  /**
   * Get default preferences
   */
  static getDefaultPreferences(): Preferences {
    return {
      wakeUpTimes: [0, 0, 0, 0, 0, 0, 0], // 7 days, 0 = not set
      bedtimes: [0, 0, 0, 0, 0, 0, 0], // 7 days, 0 = not set
      studyTimes: [
        { head: null, size: 0 }, // Monday
        { head: null, size: 0 }, // Tuesday
        { head: null, size: 0 }, // Wednesday
        { head: null, size: 0 }, // Thursday
        { head: null, size: 0 }, // Friday
        { head: null, size: 0 }, // Saturday
        { head: null, size: 0 }  // Sunday
      ],
      
      // Email notification settings
      studyReminders: true,
      assignmentDeadlines: true,
      weeklyDigest: false,
      courseUpdates: true,
      systemAlerts: true,
      
      // Privacy and sharing settings
      shareDataAnonymously: false,
      
      // Appearance settings
      isDarkMode: true,
      accentColor: '#4ecdc4'
    };
  }

  /**
   * Load preferences or return defaults if none exist
   */
  static loadPreferencesOrDefault(): Preferences {
    const saved = this.loadPreferences();
    return saved || this.getDefaultPreferences();
  }

  /**
   * Update specific preference fields
   */
  static updatePreferences(updates: Partial<Preferences>): Preferences {
    const current = this.loadPreferencesOrDefault();
    const updated = { ...current, ...updates };
    this.savePreferences(updated);
    return updated;
  }

  /**
   * Clear all preferences
   */
  static clearPreferences(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.THEME_KEY);
      localStorage.removeItem(this.ACCENT_COLOR_KEY);
      console.log('Preferences cleared successfully');
    } catch (error) {
      console.error('Error clearing preferences:', error);
    }
  }

  /**
   * Export preferences as JSON string
   */
  static exportPreferences(): string {
    const preferences = this.loadPreferencesOrDefault();
    return JSON.stringify(preferences, null, 2);
  }

  /**
   * Import preferences from JSON string
   */
  static importPreferences(jsonString: string): boolean {
    try {
      const preferences: Preferences = JSON.parse(jsonString);
      
      // Validate the imported preferences structure
      if (this.validatePreferences(preferences)) {
        this.savePreferences(preferences);
        console.log('Preferences imported successfully');
        return true;
      } else {
        console.error('Invalid preferences format');
        return false;
      }
    } catch (error) {
      console.error('Error importing preferences:', error);
      return false;
    }
  }

  /**
   * Validate preferences structure
   */
  private static validatePreferences(preferences: any): preferences is Preferences {
    return (
      preferences &&
      typeof preferences === 'object' &&
      Array.isArray(preferences.wakeUpTimes) &&
      Array.isArray(preferences.bedtimes) &&
      Array.isArray(preferences.studyTimes) &&
      typeof preferences.studyReminders === 'boolean' &&
      typeof preferences.assignmentDeadlines === 'boolean' &&
      typeof preferences.weeklyDigest === 'boolean' &&
      typeof preferences.courseUpdates === 'boolean' &&
      typeof preferences.systemAlerts === 'boolean' &&
      typeof preferences.shareDataAnonymously === 'boolean' &&
      typeof preferences.isDarkMode === 'boolean' &&
      typeof preferences.accentColor === 'string'
    );
  }

  /**
   * Get theme from localStorage
   */
  static getTheme(): 'dark' | 'light' {
    const saved = localStorage.getItem(this.THEME_KEY);
    return saved === 'light' ? 'light' : 'dark';
  }

  /**
   * Get accent color from localStorage
   */
  static getAccentColor(): string {
    return localStorage.getItem(this.ACCENT_COLOR_KEY) || '#4ecdc4';
  }

  /**
   * Apply theme to document
   */
  static applyTheme(theme: 'dark' | 'light'): void {
    if (theme === 'dark') {
      document.documentElement.classList.remove('light-theme');
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
      document.documentElement.classList.add('light-theme');
    }
  }

  /**
   * Apply accent color to document
   */
  static applyAccentColor(color: string): void {
    document.documentElement.style.setProperty('--accent-color', color);
    
    // Set light variant
    const lightVariant = this.getAccentColorLightVariant(color);
    document.documentElement.style.setProperty('--accent-color-light', lightVariant);
    
    // Set gradient variables
    document.documentElement.style.setProperty('--accent-gradient', `linear-gradient(135deg, ${color} 0%, ${lightVariant} 100%)`);
    document.documentElement.style.setProperty('--accent-gradient-hover', `linear-gradient(135deg, ${lightVariant} 0%, ${color} 100%)`);
  }

  /**
   * Get light variant of accent color
   */
  private static getAccentColorLightVariant(color: string): string {
    const colorMap: { [key: string]: string } = {
      '#4ecdc4': '#45b7d1',
      '#ff6b6b': '#ff8e8e',
      '#45b7d1': '#5bc0de',
      '#96ceb4': '#a8d5ba',
      '#feca57': '#ffd93d',
      '#ff9ff3': '#ffb3f3',
      '#54a0ff': '#74b9ff',
      '#a55eea': '#c44569'
    };
    return colorMap[color] || color;
  }

  /**
   * Initialize preferences and apply them to the document
   */
  static initializePreferences(): Preferences {
    const preferences = this.loadPreferencesOrDefault();
    
    // Apply theme
    this.applyTheme(preferences.isDarkMode ? 'dark' : 'light');
    
    // Apply accent color
    this.applyAccentColor(preferences.accentColor);
    
    return preferences;
  }
}
