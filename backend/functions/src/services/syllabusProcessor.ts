import {GoogleGenerativeAI} from "@google/generative-ai";
import {FileProcessorFactory} from "./fileProcessors";
import {ProcessedSyllabus} from "@shared/types/syllabus";

/**
 * Processor for analyzing course syllabi and extracting structured task
 * information. Uses Google Gemini AI to parse syllabus text and extract
 * assignments, exams, projects, and important dates.
 */
export class SyllabusProcessor {
  /** Google Generative AI instance for text analysis */
  private genAI: GoogleGenerativeAI;
  /** Factory for managing file processors */
  private fileProcessorFactory: FileProcessorFactory;

  /**
   * Creates a new SyllabusProcessor instance.
   * @param {string} apiKey - Google Generative AI API key
   */
  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.fileProcessorFactory = new FileProcessorFactory();
  }

  /**
   * Extracts text content from a file using the appropriate processor.
   * @param {Buffer} buffer - The file content as a Buffer
   * @param {string} mimeType - The MIME type of the file
   * @return {Promise<string>} Promise resolving to extracted text content
   * @throws Error if file type is unsupported or extraction fails
   */
  async extractTextFromFile(buffer: Buffer, mimeType: string): Promise<string> {
    const processor = this.fileProcessorFactory.getProcessor(mimeType);
    if (!processor) {
      const supportedTypes = this.fileProcessorFactory.getSupportedMimeTypes();
      throw new Error(`Unsupported file type: ${mimeType}. ` +
        `Supported types: ${supportedTypes.join(", ")}`);
    }

    return await processor.extractText(buffer);
  }

  /**
   * Gets all supported file MIME types.
   * @return {string[]} Array of supported MIME types
   */
  getSupportedFileTypes(): string[] {
    return this.fileProcessorFactory.getSupportedMimeTypes();
  }

  /**
   * Analyzes syllabus text using Google Gemini AI to extract structured data.
   * @param {string} text - The syllabus text to analyze
   * @return {Promise<ProcessedSyllabus>} Promise resolving to structured
   * syllabus data
   * @throws Error if AI analysis fails or response parsing fails
   */
  async analyzeSyllabusText(text: string): Promise<ProcessedSyllabus> {
    const model = this.genAI.getGenerativeModel({model: "gemini-2.5-pro"});

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
      const text = response.text();

      // Clean up the response to ensure it is valid JSON
      const jsonText = text.replace(/```json\n?|\n?```/g, "").trim();

      try {
        return JSON.parse(jsonText) as ProcessedSyllabus;
      } catch (parseError) {
        throw new Error("Failed to parse Gemini response as JSON: " +
          `${parseError}. Response was: ${text}`);
      }
    } catch (error) {
      throw new Error(`Failed to analyze syllabus with Gemini: ${error}`);
    }
  }

  /**
   * Processes a complete syllabus file from buffer to structured data.
   * @param {Buffer} fileBuffer - The syllabus file content as a Buffer
   * @param {string} mimeType - The MIME type of the file
   * @return {Promise<ProcessedSyllabus>} Promise resolving to structured
   * syllabus data
   * @throws Error if file processing fails
   */
  async processFullSyllabus(fileBuffer: Buffer,
    mimeType: string): Promise<ProcessedSyllabus> {
    try {
      const extractedText = await this.extractTextFromFile(fileBuffer,
        mimeType);
      const analysisResult = await this.analyzeSyllabusText(extractedText);
      return analysisResult;
    } catch (error) {
      throw new Error(`Failed to process syllabus: ${error}`);
    }
  }
}
