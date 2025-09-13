import pdf from "pdf-parse";
import {BaseFileProcessor} from "./baseProcessor";

/**
 * File processor for PDF documents.
 * Uses the pdf-parse library to extract text content from PDF files.
 */
export class PDFProcessor extends BaseFileProcessor {
  /** MIME types supported by this processor */
  supportedMimeTypes = ["application/pdf"];

  /**
   * Extracts text content from a PDF file buffer.
   * @param {Buffer} buffer - The PDF file content as a Buffer
   * @return {Promise<string>} Promise resolving to the extracted text content
   * from the PDF
   * @throws Error if PDF parsing fails or the buffer is invalid
   */
  async extractText(buffer: Buffer): Promise<string> {
    try {
      const data = await pdf(buffer);
      return data.text;
    } catch (error) {
      throw new Error(`Failed to extract text from PDF: ${error}`);
    }
  }
}
