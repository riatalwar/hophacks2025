import { TodoItem } from "./tasks";

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
  tasks: TodoItem[];
  /** Important dates and events from the syllabus */
  importantDates: Array<{
    /** Date in YYYY-MM-DD format */
    date: string;
    /** Description of the event */
    event: string;
  }>;
}