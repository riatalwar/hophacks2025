import {BaseFileProcessor} from "./baseProcessor";
import {PDFProcessor} from "./pdfProcessor";
import {TextProcessor} from "./textProcessor";

/**
 * Factory class for managing and selecting appropriate file processors.
 * Maintains a registry of available processors and provides methods to find
 * the right processor for a given MIME type.
 */
export class FileProcessorFactory {
  /** Array of registered file processors */
  private processors: BaseFileProcessor[] = [
    new PDFProcessor(),
    new TextProcessor(),
  ];

  /**
   * Finds and returns a processor that can handle the given MIME type.
   * @param {string} mimeType - The MIME type to find a processor for
   * @return {BaseFileProcessor | null} The processor that can handle the MIME
   * type, or null if none found
   */
  getProcessor(mimeType: string): BaseFileProcessor | null {
    return this.processors.find((processor) =>
      processor.canProcess(mimeType)) || null;
  }

  /**
   * Gets all MIME types supported by registered processors.
   * @return {string[]} Array of all supported MIME types across all processors
   */
  getSupportedMimeTypes(): string[] {
    return this.processors.flatMap((processor) => processor.supportedMimeTypes);
  }
}

export * from "./baseProcessor";
export * from "./pdfProcessor";
export * from "./textProcessor";
