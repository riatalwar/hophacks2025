import {BaseFileProcessor} from "./baseProcessor";

/**
 * File processor for JSON documents.
 * Handles JSON files by parsing and extracting text content.
 */
export class JSONProcessor extends BaseFileProcessor {
  /** MIME types supported by this processor */
  supportedMimeTypes = ["application/json", "text/json"];

  /**
   * Extracts text content from a JSON file buffer.
   * @param {Buffer} buffer - The JSON file content as a Buffer
   * @return {Promise<string>} Promise resolving to the stringified JSON content
   * @throws Error if JSON parsing fails or the buffer is invalid
   */
  async extractText(buffer: Buffer): Promise<string> {
    try {
      const jsonString = buffer.toString("utf-8");
      const jsonData = JSON.parse(jsonString);

      // Convert JSON object to a readable string format for analysis
      return JSON.stringify(jsonData, null, 2);
    } catch (error) {
      throw new Error(`Failed to extract text from JSON: ${error}`);
    }
  }
}
