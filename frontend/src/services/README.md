# Preferences System

This directory contains the preferences system for Class Catcher, which allows users to store and manage their application preferences including study schedules, notification settings, appearance preferences, and more.

## Files

- `preferencesService.ts` - Core service class for managing preferences
- `../hooks/usePreferences.ts` - React hook for using preferences in components
- `../components/PreferencesDemo.tsx` - Demo component showing usage examples

## Features

### ✅ What's Included

- **Study Preferences**: Wake-up times, bedtimes, and study schedules
- **Email Notifications**: Configurable notification settings
- **Privacy Settings**: Data sharing preferences
- **Appearance**: Dark/light theme and accent colors
- **Persistence**: Automatic saving to localStorage
- **Validation**: Type-safe preference handling
- **Export/Import**: Backup and restore preferences
- **React Integration**: Easy-to-use hooks and components

### 🎯 Key Benefits

1. **Type Safety**: Full TypeScript support with proper interfaces
2. **Automatic Persistence**: Changes are saved automatically
3. **React Integration**: Custom hooks for easy component integration
4. **Validation**: Built-in validation for imported preferences
5. **Error Handling**: Comprehensive error handling and user feedback
6. **Performance**: Optimized with proper React patterns

## Usage

### Basic Usage in Components

```tsx
import { usePreferences } from '../hooks/usePreferences';

function MyComponent() {
  const { preferences, updatePreferences, isLoading, error } = usePreferences();
  
  const handleThemeToggle = () => {
    updatePreferences({ isDarkMode: !preferences.isDarkMode });
  };
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <p>Current theme: {preferences.isDarkMode ? 'Dark' : 'Light'}</p>
      <button onClick={handleThemeToggle}>Toggle Theme</button>
    </div>
  );
}
```

### Direct Service Usage

```tsx
import { PreferencesService } from '../services/preferencesService';

// Load preferences
const preferences = PreferencesService.loadPreferencesOrDefault();

// Update specific fields
PreferencesService.updatePreferences({ 
  isDarkMode: true,
  accentColor: '#ff6b6b' 
});

// Save complete preferences
PreferencesService.savePreferences(newPreferences);

// Export preferences
const json = PreferencesService.exportPreferences();

// Import preferences
const success = PreferencesService.importPreferences(jsonString);
```

### Available Methods

#### PreferencesService

- `savePreferences(preferences: Preferences)` - Save complete preferences
- `loadPreferences()` - Load preferences (returns null if none exist)
- `loadPreferencesOrDefault()` - Load preferences or return defaults
- `updatePreferences(updates: Partial<Preferences>)` - Update specific fields
- `clearPreferences()` - Clear all preferences
- `exportPreferences()` - Export as JSON string
- `importPreferences(jsonString: string)` - Import from JSON string
- `getTheme()` - Get current theme
- `getAccentColor()` - Get current accent color
- `applyTheme(theme)` - Apply theme to document
- `applyAccentColor(color)` - Apply accent color to document
- `initializePreferences()` - Initialize and apply preferences

#### usePreferences Hook

- `preferences` - Current preferences object
- `isLoading` - Loading state
- `error` - Error message if any
- `savePreferences(preferences)` - Save preferences
- `updatePreferences(updates)` - Update specific fields
- `clearPreferences()` - Clear all preferences
- `exportPreferences()` - Export preferences
- `importPreferences(jsonString)` - Import preferences
- `applyTheme(theme)` - Apply theme
- `applyAccentColor(color)` - Apply accent color
- `initializePreferences()` - Initialize preferences

## Data Structure

The preferences are stored using the `Preferences` interface from `../types/ClassTypes.ts`:

```typescript
interface Preferences {
  // Study schedule
  wakeUpTimes: number[];           // 7 days, 0 = not set
  bedtimes: number[];              // 7 days, 0 = not set
  studyTimes: StudyTimeList[];     // 7 days of linked lists
  
  // Email notifications
  studyReminders: boolean;
  assignmentDeadlines: boolean;
  weeklyDigest: boolean;
  courseUpdates: boolean;
  systemAlerts: boolean;
  
  // Privacy
  shareDataAnonymously: boolean;
  
  // Appearance
  isDarkMode: boolean;
  accentColor: string;
}
```

## Storage

Preferences are automatically stored in localStorage with the following keys:
- `classCatcher_preferences` - Main preferences object
- `classCatcher_theme` - Theme setting
- `classCatcher_accentColor` - Accent color setting

## Error Handling

The system includes comprehensive error handling:
- Validation of imported preferences
- Graceful fallback to default values
- User-friendly error messages
- Console logging for debugging

## Examples

See `../components/PreferencesDemo.tsx` for a complete example of how to use the preferences system in a React component.

## Integration with Existing Components

The preferences system is already integrated with:
- `Preferences.tsx` - Main preferences page
- `WeekCalendar.tsx` - Study schedule management
- Theme and accent color application throughout the app

## Future Enhancements

Potential future improvements:
- Cloud sync with user accounts
- Preference categories and organization
- Bulk preference operations
- Preference templates and presets
- Advanced validation and constraints
