# Firestore Integration for InputCalendar

## What Was Implemented

This integration allows the InputCalendar component to save and sync data with Firestore instead of just using localStorage. Here's what was added:

### 1. Frontend Firestore SDK
- Added Firestore SDK to `frontend/src/firebase.ts`
- Exports `db` for Firestore operations

### 2. Preferences Service (`frontend/src/services/preferencesService.ts`)
- **`saveUserPreferences()`** - Save user preferences to Firestore
- **`loadUserPreferences()`** - Load user preferences from Firestore  
- **`saveCalendarData()`** - Save just calendar data (wake up times, bedtimes, busy times)
- **`subscribeToUserPreferences()`** - Real-time sync with Firestore
- **`migrateLocalStorageToFirestore()`** - Migrate existing localStorage data

### 3. Custom Hook (`frontend/src/hooks/useCalendarData.ts`)
- **`useCalendarData()`** - Manages calendar data with Firestore sync
- Provides loading states, error handling, and automatic save functions
- Includes localStorage fallback for offline support

### 4. Updated InputCalendar Component
- Now uses `useCalendarData()` hook for data management
- Automatic Firestore sync when users make changes
- Loading states and error handling
- Maintains localStorage as backup

### 5. Firestore Security Rules
- Users can only access their own data
- Secure rules for `userPreferences`, `schedules`, `activities`, and `todos`

## How It Works

### Data Flow
1. **Load**: Component loads data from Firestore via `useCalendarData()` hook
2. **Fallback**: If Firestore fails, falls back to localStorage
3. **Migration**: Automatically migrates localStorage data to Firestore for existing users
4. **Sync**: Changes are saved to both Firestore and localStorage
5. **Real-time**: Uses Firestore listeners for real-time updates across devices

### Data Structure in Firestore
```
/userPreferences/{userId}
{
  wakeUpTimes: { [day: number]: TimeBlock | null },
  bedtimes: { [day: number]: TimeBlock | null },
  busyTimes: TimeBlock[],
  emailNotifications: { ... },
  shareDataAnonymously: boolean,
  isDarkMode: boolean,
  accentColor: string,
  lastUpdated: Date,
  version: number
}
```

### Usage Example

The InputCalendar component now automatically handles Firestore integration:

```tsx
// In Preferences.tsx - no changes needed!
<InputCalendar 
  onScheduleChange={handleScheduleChange}
  onWakeUpTimesChange={handleWakeUpTimesChange}
  onBedtimesChange={handleBedtimesChange}
  onBusyTimesChange={handleBusyTimesChange}
/>
```

### Benefits
- ✅ **Real-time sync** across devices
- ✅ **Offline support** with localStorage fallback  
- ✅ **Automatic migration** from localStorage
- ✅ **Error handling** with user feedback
- ✅ **Loading states** for better UX
- ✅ **Secure** user-specific data access

## Testing the Integration

1. **First time users**: Data saves directly to Firestore
2. **Existing users**: localStorage data migrates automatically to Firestore
3. **Offline users**: Falls back to localStorage, syncs when online
4. **Multiple devices**: Changes sync in real-time across devices
5. **Errors**: Shows user-friendly error messages

## Next Steps (Optional Enhancements)

1. **Conflict Resolution**: Handle concurrent edits from multiple devices
2. **Batch Operations**: Optimize multiple rapid changes
3. **Offline Queue**: Queue changes when offline, sync when online
4. **Data Compression**: Optimize Firestore document size
5. **Analytics**: Track usage patterns (with user consent)
