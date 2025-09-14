# Analysis and Proposed Rules for Generated Schedules Collection

## Existing Setup Analysis

### Firestore Rules (backend/firestore.rules)
- **Structure**: The rules use version 2 and define access for specific collections within `/databases/{database}/documents`.
- **Existing Collections and Patterns**:
  - `userPreferences/{userId}`: Read/write if authenticated and `request.auth.uid == userId` (document ID is userId).
  - `schedules/{userId}`: Read/write if authenticated and `request.auth.uid == userId` (document ID is userId).
  - `activities/{activityId}`: Read/write if authenticated and `request.auth.uid == resource.data.userId` (userId is a field in the document).
  - `todos/{todoId}`: Read/write if authenticated and `request.auth.uid == resource.data.userId` (userId is a field in the document).
- **Default**: Denies all other access.
- **Pattern for New Collection**: Follow the `activities` and `todos` style since the task specifies "where request.auth.uid == resource.data.userId", implying userId is a document field, not the ID.

### Firestore Indexes (backend/firestore.indexes.json)
- Currently empty: `{"indexes": [], "fieldOverrides": []}`.
- No indexes defined for existing collections. For `generatedSchedules`, no immediate indexes are proposed, but future ones may be needed for queries (e.g., by userId or date).

## Proposed Firestore Rules Update
Insert the following rule block after the `todos` match (before the deny-all rule) in `backend/firestore.rules`. This ensures users can only read/write their own generated schedules.

```
    // Allow users to read and write their own generated schedules
    match /generatedSchedules/{generatedScheduleId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
```

### Full Updated Rules File (for Reference)
```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read and write their own preferences
    match /userPreferences/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow users to read and write their own schedules
    match /schedules/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow users to read and write their own activities
    match /activities/{activityId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Allow users to read and write their own todos
    match /todos/{todoId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Allow users to read and write their own generated schedules
    match /generatedSchedules/{generatedScheduleId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Next Steps
- Switch to Code mode to apply the rule update to `backend/firestore.rules`.
- No schema enforcement in Firestore rules; document structure (e.g., fields like userId, schedule data) will be handled in application code.
- Consider adding indexes if queries on generatedSchedules are planned (e.g., composite index on userId and timestamp).