# Backend Integration for Preferences

This document describes the backend integration implemented for the Preferences page.

## Backend Changes

### New Endpoints

The following endpoints have been added to the backend (`backend/functions/src/app.ts`):

- `GET /api/preferences` - Retrieve user preferences
- `POST /api/preferences` - Create new user preferences
- `PUT /api/preferences` - Update existing user preferences
- `DELETE /api/preferences` - Delete user preferences

### Authentication

All preferences endpoints require Firebase Authentication. The `verifyToken` middleware validates the Firebase ID token from the Authorization header.

### Firestore Integration

User preferences are stored in a Firestore collection called `userPreferences` with the following structure:

```typescript
{
  userId: string,
  wakeUpTimes: number[],
  bedtimes: number[],
  studyTimes: StudyTimeList[],
  studyReminders: boolean,
  assignmentDeadlines: boolean,
  weeklyDigest: boolean,
  courseUpdates: boolean,
  systemAlerts: boolean,
  shareDataAnonymously: boolean,
  isDarkMode: boolean,
  accentColor: string,
  createdAt: Date,
  updatedAt: Date
}
```

## Frontend Changes

### New Files

1. **`frontend/src/services/api.ts`** - API service layer for making authenticated requests to the backend
2. **`frontend/src/hooks/usePreferences.ts`** - Custom React hook for managing preferences state and API calls

### Updated Files

1. **`frontend/src/pages/Preferences.tsx`** - Updated to use backend API instead of localStorage

### Key Features

- **Automatic Loading**: Preferences are automatically loaded from the backend when the component mounts
- **Real-time Sync**: Changes are automatically saved to the backend with a 100ms delay
- **Error Handling**: Comprehensive error handling with user-friendly error messages
- **Loading States**: Visual feedback during API operations
- **Fallback Support**: Falls back to localStorage if backend is unavailable
- **Authentication**: Uses Firebase Auth tokens for secure API calls

## Environment Configuration

Add the following environment variable to your `.env` file:

```env
VITE_API_BASE_URL=http://localhost:5001/your-project-id/us-central1/api
```

For production, replace with your deployed Firebase Functions URL.

## Usage

The Preferences component now automatically:

1. Loads user preferences from the backend on mount
2. Syncs local state with backend data
3. Saves changes to the backend automatically
4. Shows loading and error states
5. Falls back to localStorage if backend is unavailable

## API Response Format

All API endpoints return responses in the following format:

```typescript
{
  success: boolean,
  data?: any,
  message?: string,
  error?: string
}
```

## Error Handling

The integration includes comprehensive error handling:

- Network errors are caught and displayed to the user
- Authentication errors are handled gracefully
- Backend errors are parsed and displayed
- Fallback to localStorage ensures the app remains functional

## Testing

To test the integration:

1. Start the Firebase emulator: `firebase emulators:start`
2. Start the frontend: `npm run dev`
3. Log in to the app
4. Navigate to Preferences
5. Make changes and verify they're saved to Firestore
6. Refresh the page to verify data persistence
