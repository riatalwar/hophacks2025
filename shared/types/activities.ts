/**
 * Represents an activity/course in the system
 */
export interface Activity {
  id: string;
  activityName: string;
  color: string;
  pdfFile?: File | null;
  websiteLink?: string;
  canvasContent?: string;
}

/**
 * Simple todo item for frontend use
 */
export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

/**
 * User preferences and settings
 */
export interface Preferences {
  wakeUpTimes: number[];
  bedtimes: number[];
  busyTimes: BusyTimeList[]; // Array of linked lists, one for each day (7 days)
  
  // Email notification settings
  studyReminders: boolean;
  assignmentDeadlines: boolean;
  weeklyDigest: boolean;
  courseUpdates: boolean;
  systemAlerts: boolean;
  
  // Privacy and sharing settings
  shareDataAnonymously: boolean;
  
  // Appearance settings
  isDarkMode: boolean;
  accentColor: string;
}

/**
 * Linked list node for study time tuples
 */
export interface BusyTimeNode {
  data: [number, number]; // 2-value tuple (e.g., [startTime, endTime])
  next: BusyTimeNode | null;
}

/**
 * Linked list for study times
 */
export interface BusyTimeList {
  head: BusyTimeNode | null;
  size: number;
}

/**
 * Time block for calendar/scheduling
 */
export interface TimeBlock {
  id: string;
  day: number; // 0 = Monday, 1 = Tuesday, etc.
  startTime: number; // minutes from midnight
  endTime: number; // minutes from midnight
  type: 'study' | 'wake' | 'bedtime';
}
