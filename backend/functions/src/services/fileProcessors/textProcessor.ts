import {BaseFileProcessor} from "./baseProcessor";

/**
 * File processor for plain text and markdown files.
 * Handles text-based files by converting the buffer to UTF-8 string.
 */
export class TextProcessor extends BaseFileProcessor {
  /** MIME types supported by this processor */
  supportedMimeTypes = ["text/plain", "text/markdown"];

  /**
   * Extracts text content from a text-based file buffer.
   * @param {Buffer} buffer - The text file content as a Buffer
   * @return {Promise<string>} Promise resolving to the UTF-8 decoded string
   * content
   * @throws Error if buffer conversion fails or encoding is invalid
   */
  async extractText(buffer: Buffer): Promise<string> {
    try {
      return buffer.toString("utf-8");
    } catch (error) {
      throw new Error(`Failed to extract text from file: ${error}`);
    }
  }
}
