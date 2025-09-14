// TimeBlock interface from PRD section 2.1
export interface TimeBlock {
  id: string;
  day: number; // 0-6 for Mon-Sun  
  startTime: number; // minutes from midnight
  endTime: number; // minutes from midnight
  type: 'busy' | 'wake' | 'bedtime';
  notes?: string;
}

// BusyTimeNode and BusyTimeList interfaces from PRD section 2.2
export interface BusyTimeNode {
  data: [number, number]; // [startTime, endTime] in minutes from midnight
  next: BusyTimeNode | null;
}

export interface BusyTimeList {
  head: BusyTimeNode | null;
  size: number;
}

// ScheduledStudySession interface from PRD section 2.2
export interface ScheduledStudySession {
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

// GeneratedSchedule interface from PRD section 2.2
export interface GeneratedSchedule {
  userId: string;
  weekStartDate: string; // YYYY-MM-DD format
  sessions: ScheduledStudySession[];
  generatedAt: Date;
  version: number; // For handling concurrent updates
}
