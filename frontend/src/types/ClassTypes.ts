export interface Activity {
  id: string;
  activityName: string;
  color: string;
  pdfFile?: File | null;
  websiteLink?: string;
  canvasContent?: string;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface TimeBlock {
  id: string;
  day: number; // 0 = Monday, 1 = Tuesday, etc.
  startTime: number; // minutes from midnight
  endTime: number; // minutes from midnight
  type: 'study' | 'wake' | 'bedtime';
  summary?: string; // Optional summary for imported events
}

// Linked list node for study time tuples
export interface StudyTimeNode {
  data: [number, number]; // 2-value tuple (e.g., [startTime, endTime])
  next: StudyTimeNode | null;
}

// Linked list for study times
export interface StudyTimeList {
  head: StudyTimeNode | null;
  size: number;
}

export interface Preferences {
  wakeUpTimes: number[];
  bedtimes: number[];
  busyTimes: StudyTimeList[]; // Array of linked lists, one for each day (7 days)
  
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