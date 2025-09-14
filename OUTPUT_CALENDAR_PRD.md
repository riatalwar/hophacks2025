# Output Calendar PRD: Intelligent Study Schedule Generator

## Executive Summary

### Broad Vision
The Output Calendar is an intelligent study schedule generator that automatically creates optimized study sessions for users based on their tasks, deadlines, and available time slots. Unlike traditional calendars that simply display events, this system acts as a proactive study planner that breaks down large assignments, prioritizes work based on urgency and workload distribution, and generates a personalized weekly/daily schedule that maximizes productivity while respecting the user's availability constraints.

The system transforms raw input data (tasks with due dates and time estimates, plus user availability) into a structured, time-blocked study schedule that can be viewed in a web interface and eventually exported as industry-standard .ics calendar files for integration with external calendar applications.

### Future Scope (Post-MVP)
- **ICS Calendar Export**: Generate .ics files that users can subscribe to in Google Calendar, Outlook, Apple Calendar, etc.
- **Manual Schedule Editing**: Drag-and-drop interface for users to manually adjust generated study sessions
- **Advanced Break Optimization**: Intelligent break scheduling based on cognitive load, task switching costs, and personal productivity patterns
- **Cross-Platform Synchronization**: Real-time sync between web interface and external calendar applications
- **Smart Notifications**: Integration with email/push notification systems for study reminders
- **Collaborative Features**: Share schedules with study buddies, group project coordination

---

## Detailed Product Requirements Document

### 1. Core System Architecture

#### 1.1 Data Flow Overview
The Output Calendar system operates as a three-stage pipeline:

1. **Data Ingestion**: Collect user availability (TimeBlock[] from `/schedules/:userId`) and tasks (TodoItems from `/todos/:userId`) from database
2. **Data Conversion**: Convert TimeBlock[] to BusyTimeList[] format for algorithm processing  
3. **Schedule Generation**: Process inputs through scheduling algorithm to create optimized study sessions
4. **Presentation**: Display generated schedule in web interface with weekly/daily view options

#### 1.2 Component Responsibilities

**SchedulingEngine** (Backend/Frontend Service)
- Primary responsibility for converting raw data into scheduled study sessions
- **CRITICAL**: Must convert TimeBlock[] from backend to BusyTimeList format for algorithm
- Implements priority calculation algorithms
- Handles task chunking and time slot allocation
- Manages schedule recalculation triggers

**OutputCalendar Component** (Frontend)
- Renders generated schedule in weekly/daily views
- Provides view switching interface
- Handles loading states during schedule generation
- Replaces existing hardcoded calendar widget in Dashboard

**Schedule Data Layer** (Backend - *Requires Database Integration Research*)
- Stores generated schedules per user
- Manages schedule versioning and updates
- Provides API endpoints for schedule CRUD operations

### 2. Data Models and Types

#### 2.1 Critical Data Conversion Challenge

**IMPORTANT**: The codebase currently has TWO different systems for representing user availability:

1. **Backend/API**: Uses `TimeBlock[]` format (stored in `schedules` collection)
2. **Algorithm**: Expects `BusyTimeList[]` format (linked lists)

**Required Conversion**:
```typescript
// Backend TimeBlock format
interface TimeBlock {
  id: string;
  day: number; // 0-6 for Mon-Sun  
  startTime: number; // minutes from midnight
  endTime: number; // minutes from midnight
  type: 'busy' | 'wake' | 'bedtime';
  notes?: string;
}

// Algorithm BusyTimeList format
interface BusyTimeList {
  head: BusyTimeNode | null;
  size: number;
}
```

The scheduling algorithm MUST include conversion logic to transform `TimeBlock[]` → `BusyTimeList[]`.

#### 2.2 Input Data Structures

**BusyTimeList Structure**
```typescript
interface BusyTimeNode {
  data: [number, number]; // [startTime, endTime] in minutes from midnight
  next: BusyTimeNode | null;
}

interface BusyTimeList {
  head: BusyTimeNode | null;
  size: number;
}
```

**User Availability Model**
- Array of 7 BusyTimeList objects (one per day, Monday-Sunday)
- Represents time slots that are NOT available for study (classes, meals, sleep, etc.)
- System must calculate available time slots by finding gaps in busy time

**TodoItem Structure** (From existing shared/types/tasks.ts)
```typescript
interface TodoItem {
  id: string;
  title: string;
  notes: string; // User notes about the task (NOT "description")
  dueDate: string; // YYYY-MM-DD format or 'TBD'
  activityId?: string; // Links to Activity in activities collection
  userId: string; // Required for user association
  priority: "low" | "medium" | "high"; // Used only for tie-breaking
  estimatedHours?: number;
  completed: boolean;
}
```

#### 2.2 Output Data Structures

**ScheduledStudySession**
```typescript
interface ScheduledStudySession {
  id: string;
  taskId: string; // Reference to source TodoItem
  title: string; // e.g., "Study for Chemistry Exam"
  notes?: string; // From TodoItem notes field (corrected field name)
  startTime: Date;
  endTime: Date;
  dayOfWeek: number; // 0-6 for Monday-Sunday
  chunkIndex?: number; // For multi-part tasks (1 of 3, 2 of 3, etc.)
  calculatedPriority: number; // Internal priority score used for scheduling
  
  // Future ICS compatibility fields
  location?: string; // Always null for MVP
  activityId?: string; // From source TodoItem (not "category")
}
```

**GeneratedSchedule**
```typescript
interface GeneratedSchedule {
  userId: string;
  weekStartDate: string; // YYYY-MM-DD format
  sessions: ScheduledStudySession[];
  generatedAt: Date;
  version: number; // For handling concurrent updates
}
```

### 3. Scheduling Algorithm Specification

#### 3.1 Available Time Calculation

**Step 1: Extract Available Time Slots**
- For each day of the week, process the corresponding BusyTimeList
- Calculate gaps between busy periods to find available study time
- Apply minimum constraints:
  - 5-minute buffer before and after each busy period
  - Minimum study session length: equal to task's estimated time (but max 1 hour)
  - Maximum study session length: 1 hour

**Algorithm Pseudocode:**
```
for each day in week:
  availableSlots = []
  sortedBusyTimes = sort(busyTimeList[day])
  
  currentTime = 0 // Start of day
  for each busyPeriod in sortedBusyTimes:
    if (busyPeriod.start - currentTime - 5) >= minimumSessionLength:
      availableSlots.add({
        start: currentTime + 5,
        end: busyPeriod.start - 5,
        duration: busyPeriod.start - currentTime - 10
      })
    currentTime = busyPeriod.end
  
  // Handle time after last busy period
  if (1440 - currentTime - 5) >= minimumSessionLength: // 1440 = minutes in day
    availableSlots.add({
      start: currentTime + 5,
      end: 1440 - 5,
      duration: 1440 - currentTime - 10
    })
```

#### 3.2 Priority Calculation Algorithm

**Base Priority Formula:**
```
averageHoursPerDay = estimatedHours / daysUntilDue
basePriority = averageHoursPerDay
```

**Urgency Multipliers:**
- Tasks requiring < 3 hours with ≤ 1 day remaining: multiply by 10
- Tasks requiring < 6 hours with ≤ 2 days remaining: multiply by 8
- Tasks requiring < 12 hours with ≤ 3 days remaining: multiply by 6
- Tasks requiring < 18 hours with ≤ 4 days remaining: multiply by 4
- Tasks requiring any hours with ≤ 5 days remaining: multiply by 2

**Overdue/Impossible Deadlines:**
- Tasks with due dates in the past: multiply by 100
- Tasks with insufficient time remaining: multiply by 50

**Tie-Breaking:**
- When calculated priorities are equal (within 0.1), use TodoItem.priority field
- Order: high > medium > low
- If still tied, use earliest due date
- If still tied, use task creation order (by ID)

#### 3.3 Task Chunking Strategy

**Chunking Rules:**
- Maximum chunk size: 1 hour
- Minimum chunk size: equal to smallest available time slot that fits the task
- For tasks > 1 hour: create multiple 1-hour chunks with remainder chunk if needed
- Chunk naming: "Task Name (Part X of Y)" where applicable

**Distribution Strategy:**
- Prioritize scheduling chunks for high-priority tasks first
- When multiple tasks have similar priority, alternate between them to maintain variety
- Attempt to schedule chunks for the same task with at least one day gap when possible
- If calendar is very full (>20 hours of study time per week), allow back-to-back scheduling (but still give a 5 minute buffer, at the minimum)

#### 3.4 Time Slot Allocation

**Primary Algorithm:**
1. Calculate priority scores for all incomplete tasks
2. Sort tasks by priority score (highest first)
3. For each task in priority order:
   - Determine number of chunks needed
   - Find best available time slots across the week
   - Prefer slots that are:
     - As far from due date as reasonable (front-loading)
     - Distributed across different days when possible
     - Not adjacent to other high-concentration study periods
4. Assign time slots and mark as unavailable
5. Continue until all tasks are scheduled or no more slots available

**Slot Selection Criteria (in order of preference):**
1. Days with fewer existing study sessions
2. Time slots earlier in the day (when cognitive load is typically lower)
3. Longer available time slots (to minimize fragmentation)
4. Time slots that create even distribution across the week

### 4. User Interface Specifications

#### 4.1 Calendar Component Requirements

**View Options:**
- Weekly View: Shows 7-day grid with time slots and scheduled sessions
- Daily View: Shows single day with detailed hourly breakdown
- View toggle: Prominent switch/tabs at top of component

**Visual Design Requirements:**
- Replace existing hardcoded calendar widget in Dashboard.tsx (lines 188-207)
- Maintain consistent styling with existing dashboard sections
- Use existing CSS class structure: `.dashboard-section`, `.section-header`, etc.
- Color coding for different task categories/priorities
- Clear time labels and session durations
- Responsive design for different screen sizes

**Loading States:**
- Display "Generating schedule..." message during calculation
- Disable any interactive elements during processing
- Show progress indicator if calculation takes > 2 seconds
- Graceful handling of calculation failures

**Empty States:**
- When no tasks exist: Display empty calendar grid with helpful message
- When no available time slots: Show message suggesting user review their availability
- When all tasks are completed: Show congratulatory message with empty calendar

#### 4.2 Integration Points

**Dashboard Integration:**
- Replace lines 443-462 in Dashboard.tsx (Weekly Schedule Section) with new OutputCalendar component
- Current hardcoded calendar shows: Mon/Tue/Wed with fake events like "7:00 AM - Wake Up", "9:00 AM - Math Study"
- Maintain existing section styling: `.dashboard-section`, `.schedule-section`, `.section-header` classes
- Ensure proper responsive behavior within dashboard grid

**Data Synchronization:**
- Real-time updates when TodoItems are modified
- Automatic recalculation trigger on task changes
- Optimistic UI updates where possible

### 5. Technical Implementation Details

#### 5.1 Component Architecture

**OutputCalendar Component Structure:**
```typescript
interface OutputCalendarProps {
  userId: string;
  viewMode?: 'weekly' | 'daily';
  onViewModeChange?: (mode: 'weekly' | 'daily') => void;
}

interface OutputCalendarState {
  schedule: GeneratedSchedule | null;
  isLoading: boolean;
  error: string | null;
  currentViewDate: Date;
  viewMode: 'weekly' | 'daily';
}
```

**Required Methods:**
- `generateSchedule()`: Trigger schedule recalculation
- `handleViewModeToggle()`: Switch between weekly/daily views
- `formatTimeSlot()`: Convert time data to display format
- `groupSessionsByDay()`: Organize sessions for rendering
- `calculateAvailableTimeSlots()`: Process BusyTimeList into available slots

#### 5.2 Backend Service Requirements (*Requires Database Integration Research*)

**API Endpoints Available:**
- `GET /schedules/:userId`: Get user's availability as TimeBlock[] (EXISTING - provides busy time data)
- `POST /schedules`: Save user's availability as TimeBlock[] (EXISTING - used by Preferences page)
- `GET /todos/:userId`: Get user's TodoItems (EXISTING)
- `GET /activities/:userId`: Get user's activities (EXISTING)

**API Endpoints Needed:**
- `POST /api/schedule/:userId/generate`: Trigger schedule recalculation (NEW - NEEDS IMPLEMENTATION)
- `GET /api/schedule/:userId`: Retrieve current generated schedule (NEW - NEEDS IMPLEMENTATION)

**Database Schema Considerations:**
- NEW: Create `generatedSchedules` collection for GeneratedSchedule objects
- EXISTING: `todos` collection (stores TodoItem objects)
- EXISTING: `activities` collection (stores Activity objects)  
- EXISTING: `schedules` collection (stores TimeBlock[] for user availability)
- EXISTING: Firestore rules allow user access to own data
- NEW: Indexing strategy for efficient schedule retrieval
- NEW: Handling of schedule versioning and concurrent updates

#### 5.3 Performance Considerations

**Optimization Strategies:**
- Client-side caching of generated schedules
- Debounced recalculation triggers (avoid excessive API calls)
- Incremental updates for minor task changes
- Background processing for complex schedule generation

**Scalability Concerns:**
- Algorithm complexity: O(n log n) for task sorting + O(m) for slot allocation
- Memory usage for large task lists and complex availability patterns
- Database query optimization for multi-table joins

### 6. Error Handling and Edge Cases

#### 6.1 Data Validation

**Input Validation Requirements:**
- Verify BusyTimeList integrity (no overlapping periods, valid time ranges)
- Validate TodoItem data (required fields, valid dates, positive estimated hours)
- Handle malformed time data gracefully

**Error Recovery:**
- Fallback to previous schedule version if generation fails
- Partial schedule generation if some tasks cannot be accommodated
- Clear error messages for user-actionable issues

#### 6.2 Edge Case Handling

**Impossible Scheduling Scenarios:**
- More work required than available time: Schedule as much as possible, highlight conflicts
- All tasks due in the past: Apply maximum priority to all, schedule in order of importance
- No available time slots: Display helpful message suggesting availability review

**Data Inconsistency Scenarios:**
- Missing estimated hours: Create 5-minute "estimation task" as specified
- Completed tasks still in schedule: Automatically remove and recalculate
- Deleted tasks referenced in schedule: Clean up orphaned sessions

### 7. Testing and Validation Requirements

#### 7.1 Algorithm Testing

**Unit Test Coverage Required:**
- Priority calculation with various due date/hour combinations
- Available time slot extraction from complex BusyTimeLists
- Task chunking logic for different task sizes
- Edge case handling (overdue tasks, impossible schedules)

**Integration Test Scenarios:**
- End-to-end schedule generation with realistic user data
- Performance testing with large numbers of tasks and complex availability
- Concurrent user schedule generation
- Database integration and data consistency

#### 7.2 User Interface Testing

**Functional Testing:**
- View mode switching (weekly/daily)
- Proper rendering of generated sessions
- Loading state behavior during calculation
- Error state handling and recovery

**Visual Testing:**
- Consistent styling with existing dashboard
- Responsive design across device sizes
- Color coding and accessibility compliance
- Empty state and error message display

### 8. Future Enhancement Hooks

#### 8.1 ICS Export Preparation

**Data Structure Compatibility:**
- ScheduledStudySession interface includes ICS-required fields
- Location field (always null) ready for future use
- Description field populated from TodoItem notes
- Proper date/time formatting for ICS standard

**Export Architecture Planning:**
- Separate ICS generation service
- Subscription-based calendar URLs
- Update notification system for external calendar sync

#### 8.2 Manual Editing Framework

**State Management Preparation:**
- Track user modifications separate from generated schedule
- Version control for manual vs. automatic changes
- Conflict resolution between user edits and automatic updates

**UI Architecture Planning:**
- Drag-and-drop interaction layer
- Visual indicators for user-modified sessions
- Undo/redo functionality for manual changes

### 9. Success Metrics and Acceptance Criteria

#### 9.1 MVP Success Criteria

**Functional Requirements:**
- [ ] Successfully generates schedules for users with realistic task loads
- [ ] Properly calculates available time from BusyTimeList data
- [ ] Implements priority algorithm as specified
- [ ] Displays schedules in both weekly and daily views
- [ ] Automatically recalculates when tasks are modified
- [ ] Handles edge cases gracefully without crashes

**Performance Requirements:**
- [ ] Schedule generation completes within 3 seconds for typical user data
- [ ] UI remains responsive during calculation
- [ ] Memory usage remains reasonable for large task lists

**User Experience Requirements:**
- [ ] Seamlessly replaces existing hardcoded calendar widget
- [ ] Provides clear visual feedback during processing
- [ ] Displays helpful messages for empty or error states
- [ ] Maintains consistent styling with existing application

#### 9.2 Quality Assurance Metrics

**Algorithm Accuracy:**
- Priority calculations produce expected results for test cases
- Available time extraction matches manual calculations
- Task distribution follows specified rules

**System Reliability:**
- Zero crashes during normal operation
- Graceful degradation for edge cases
- Consistent behavior across different user scenarios

---

## Implementation Phases

### Phase 1: Core Algorithm Development
- Implement available time calculation from BusyTimeList
- Develop priority calculation algorithm
- Create task chunking logic
- Build time slot allocation system

### Phase 2: Data Integration
- **EXISTING**: `todos`, `activities`, `schedules` collections already implemented
- **NEW**: Create `generatedSchedules` collection for storing generated schedules
- **NEW**: Implement `POST /api/schedule/:userId/generate` endpoint
- **NEW**: Implement `GET /api/schedule/:userId` endpoint  
- **CRITICAL**: Build TimeBlock[] → BusyTimeList[] conversion logic
- Set up automatic recalculation triggers

### Phase 3: User Interface Development
- Build OutputCalendar React component
- Implement weekly/daily view switching
- Create loading and error state handling
- Replace hardcoded calendar in Dashboard.tsx lines 443-462
- **EXISTING**: Dashboard already imports todos/activities via existing APIs

### Phase 4: Testing and Polish
- Comprehensive algorithm testing
- User interface testing and refinement
- Performance optimization
- Documentation and deployment preparation

---

*This PRD serves as the comprehensive specification for the Output Calendar MVP while maintaining clear pathways for future enhancements. All technical decisions should reference this document, and any changes to requirements should be reflected in updated versions of this PRD.*