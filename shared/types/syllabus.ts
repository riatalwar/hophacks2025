/**
 * Represents a single task or assignment extracted from a syllabus.
 */
export interface SyllabusTask {
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
}

/**
 * Represents the complete processed syllabus with extracted information.
 */
export interface ProcessedSyllabus {
  /** Full name of the course */
  courseName: string;
  /** Course code or number */
  courseCode: string;
  /** Name of the instructor */
  instructor: string;
  /** Semester and year information */
  semester: string;
  /** Array of all tasks extracted from the syllabus */
  tasks: SyllabusTask[];
  /** Important dates and events from the syllabus */
  importantDates: Array<{
    /** Date in YYYY-MM-DD format */
    date: string;
    /** Description of the event */
    event: string;
  }>;
}