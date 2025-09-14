# Schedule API Integration for InputCalendar

## What Was Implemented

Instead of connecting directly to Firestore, I've integrated the InputCalendar component with your existing backend schedule API endpoints. This is a much cleaner approach that follows your existing architecture.

### 1. Schedule API Service (`frontend/src/services/scheduleApi.ts`)

This service handles all API communication with your existing backend endpoints:

- **`saveScheduleToApi()`** - POST to `/schedule` endpoint
- **`loadScheduleFromApi()`** - GET from `/schedule/:userId` endpoint  
- **`deleteTimeBlockFromApi()`** - DELETE from `/schedule/:userId/timeblocks/:timeBlockId` endpoint

### 2. Schedule API Hook (`frontend/src/hooks/useScheduleApi.ts`)

This hook manages the data flow and transformations:

- **Data Loading**: Fetches schedule data from API on component mount
- **Data Transformation**: Converts between InputCalendar format and backend Schedule format
- **Auto-save**: Saves changes to API automatically
- **localStorage Fallback**: Uses localStorage as backup when API is unavailable
- **Migration**: Automatically migrates existing localStorage data to API
- **Error Handling**: Graceful error handling with user feedback

### 3. Updated InputCalendar Component

- Now uses `useScheduleApi()` hook instead of direct localStorage
- Shows loading states while fetching data
- Shows "Saving..." indicator when saving to API
- Maintains localStorage as backup for offline support

## How It Works

### Data Flow
1. **Load**: `useScheduleApi` fetches data from your existing `/schedule/:userId` endpoint
2. **Transform**: Converts backend `Schedule` format to InputCalendar's expected format:
   - Backend: `{ userId: string, timeBlocks: { [id: string]: TimeBlock } }`
   - Frontend: `{ wakeUpTimes: {...}, bedtimes: {...}, busyTimes: [...] }`
3. **Save**: When user makes changes, automatically saves via POST to `/schedule` endpoint
4. **Fallback**: If API fails, uses localStorage and shows error message

### Data Transformation

**Backend Schedule Format:**
```typescript
{
  userId: "user123",
  timeBlocks: {
    "wake-1-123": { id: "wake-1-123", day: 1, startTime: 480, endTime: 490, type: "wake" },
    "busy-2-456": { id: "busy-2-456", day: 2, startTime: 600, endTime: 720, type: "busy" }
  }
}
```

**Frontend Calendar Format:**
```typescript
{
  wakeUpTimes: { 1: { id: "wake-1-123", day: 1, startTime: 480, endTime: 490, type: "wake" } },
  bedtimes: {},
  busyTimes: [{ id: "busy-2-456", day: 2, startTime: 600, endTime: 720, type: "busy" }]
}
```

## Benefits

✅ **Uses Existing API**: Leverages your existing `/schedule` endpoints  
✅ **Clean Architecture**: No direct Firestore access from frontend  
✅ **Automatic Saving**: Changes save to API automatically  
✅ **Loading States**: Shows loading and saving indicators  
✅ **Error Handling**: Graceful fallback to localStorage on API errors  
✅ **Data Migration**: Automatically migrates localStorage data to API  
✅ **Offline Support**: localStorage backup when API is unavailable  

## API Usage

The integration uses your existing endpoints:

- **POST `/schedule`** - Save/update schedule data
  ```json
  { "userId": "user123", "timeBlocks": [...] }
  ```

- **GET `/schedule/:userId`** - Load schedule data
  ```json
  { "success": true, "timeBlocks": [...] }
  ```

- **DELETE `/schedule/:userId/timeblocks/:timeBlockId`** - Delete specific time block

## Testing

1. **New users**: Data saves directly to your backend via API
2. **Existing users**: localStorage data automatically migrates to API  
3. **API errors**: Falls back to localStorage with error message
4. **Loading states**: Shows "Loading..." and "Saving..." indicators

## Environment Variables

Make sure you have the API base URL configured:

```env
VITE_API_BASE_URL=http://localhost:5001/hophacks2025/us-central1/api
```

(Or your production API URL)

## Next Steps (Optional)

1. **Real-time Updates**: Add WebSocket/SSE for real-time sync across devices
2. **Optimistic Updates**: Update UI immediately, sync to API in background
3. **Conflict Resolution**: Handle concurrent edits from multiple devices
4. **Batch Operations**: Batch rapid changes to reduce API calls
