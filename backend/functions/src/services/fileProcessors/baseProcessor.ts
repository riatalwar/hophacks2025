/**
 * Interface defining the contract for file processors.
 * All file processors must implement text extraction and
 * declare supported MIME types.
 */
export interface FileProcessor {
  /** Array of MIME types that this processor can handle */
  supportedMimeTypes: string[];

  /**
   * Extracts text content from a file buffer
   * @param buffer - The file content as a Buffer
   * @return Promise resolving to the extracted text content
   * @throws Error if text extraction fails
   */
  extractText(buffer: Buffer): Promise<string>;
}

/**
 * Abstract base class for file processors.
 * Provides common functionality and enforces the FileProcessor interface.
 */
export abstract class BaseFileProcessor implements FileProcessor {
  /** Array of MIME types that this processor can handle */
  abstract supportedMimeTypes: string[];

  /**
   * Extracts text content from a file buffer
   * @param buffer - The file content as a Buffer
   * @return Promise resolving to the extracted text content
   * @throws Error if text extraction fails
   */
  abstract extractText(buffer: Buffer): Promise<string>;

  /**
   * Checks if this processor can handle the given MIME type
   * @param {string} mimeType - The MIME type to check
   * @return {boolean} True if this processor supports the MIME type
   */
  canProcess(mimeType: string): boolean {
    return this.supportedMimeTypes.includes(mimeType);
  }
}
