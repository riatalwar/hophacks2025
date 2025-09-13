import {GoogleGenerativeAI} from "@google/generative-ai";
import {ProcessedSyllabus} from "@shared/types/syllabus";

/**
 * Processor for analyzing course syllabi text with Gemini AI.
 * Takes raw text input and returns structured syllabus data.
 */
export class SyllabusProcessor {
  /** Google Generative AI instance for text analysis */
  private genAI: GoogleGenerativeAI;

  /**
   * Creates a new SimpleSyllabusProcessor instance.
   * @param {string} apiKey - Google Generative AI API key
   */
  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Analyzes syllabus text using Google Gemini AI to extract structured data.
   * @param {string} text - The syllabus text to analyze
   * @return {Promise<ProcessedSyllabus>} Promise resolving to
   * structured syllabus data
   * @throws Error if AI analysis fails or response parsing fails
   */
  async processSyllabusText(text: string): Promise<ProcessedSyllabus> {
    const model = this.genAI.getGenerativeModel({model: "gemini-2.5-flash"});

    const prompt = `
You are an expert academic assistant. Analyze the following course syllabus
text and extract structured information about assignments, exams, projects,
and other important tasks mentioned in the syllabus.

SYLLABUS TEXT:
${text}

Please respond with a JSON object in the following exact format:
{
  "courseName": "Full course name",
  "courseCode": "Course code/number",
  "instructor": "Instructor name",
  "semester": "Semester and year",
  "tasks": [
    {
      "id": "unique-task-id",
      "title": "Task title",
      "description": "Detailed description of the task",
      "dueDate": "YYYY-MM-DD format or 'TBD' if not specified",
      "category": "assignment|exam|project|reading|quiz|discussion|lab",
      "priority": "low|medium|high",
      "estimatedHours": number (optional, your best estimate)
    }
  ],
  "importantDates": [
    {
      "date": "YYYY-MM-DD",
      "event": "Description of the event"
    }
  ]
}

IMPORTANT INSTRUCTIONS:
1. Extract ALL assignments, exams, projects, quizzes, discussions, and
   readings mentioned in the syllabus
2. Convert all dates to YYYY-MM-DD format. If year is not specified,
   assume the current academic year
3. Don't include regular class dates, holidays, add/drop deadlines, and other
   administrative dates in the tasks. Only include tasks and exams that
   require work outside of class.
4. Generate unique IDs for each task (use format: coursecode-tasktype-number)
5. Categorize each task appropriately
6. Set priority based on point value/weight: high (>20% of grade),
   medium (10-20%), low (<10%). If the point value/weight is not specified,
   evaluate the priority based on the task complexity and course level.
7. Estimate hours based on task complexity and course level
8. If information is missing, use "TBD" or appropriate defaults
9. Do not include any markdown formatting or explanatory text - only
   return the JSON object

Respond with only the JSON object, no additional text.`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      // Clean up the response to ensure it is valid JSON
      const jsonText = responseText.replace(/```json\n?|\n?```/g, "").trim();

      try {
        return JSON.parse(jsonText) as ProcessedSyllabus;
      } catch (parseError) {
        throw new Error("Failed to parse Gemini response as JSON: " +
          `${parseError}. Response was: ${responseText}`);
      }
    } catch (error) {
      throw new Error(`Failed to analyze syllabus with Gemini: ${error}`);
    }
  }
}
