/**
 * Represents a single task or assignment extracted from a syllabus.
 */
export interface TodoItem {
  /** Unique identifier for the task */
  id: string;
  /** Title or name of the task */
  title: string;
  /** Notes the user can add about the task */
  notes: string;
  /** Due date in YYYY-MM-DD format, or 'TBD' if not specified */
  dueDate: string;
  /** Activity identifier that links to an activity in the activities database */
  activityId?: string;
  /** Priority level based on point value/weight */
  priority: "low" | "medium" | "high";
  /** Estimated hours to complete the task */
  estimatedHours?: number;
  /** Status of the task */
  completed: boolean;
}
