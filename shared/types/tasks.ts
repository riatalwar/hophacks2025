/**
 * Represents a single task or assignment extracted from a syllabus.
 */
export interface TodoItem {
  /** Unique identifier for the task */
  id: string;
  /** Title or name of the task */
  title: string;
  /** Detailed description of what the task involves */
  description: string;
  /** Due date in YYYY-MM-DD format, or 'TBD' if not specified */
  dueDate: string;
  /** Category of the task */
  category: string;
  /** Priority level based on point value/weight */
  priority: "low" | "medium" | "high";
  /** Estimated hours to complete the task */
  estimatedHours?: number;
  /** Status of the task */
  completed: boolean;
  /** Activity ID */
  activityId?: string;
}
