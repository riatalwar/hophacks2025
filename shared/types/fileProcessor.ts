/**
 * Supported file types for processing
 */
export const SUPPORTED_FILE_TYPES = {
  PDF: 'application/pdf',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  DOC: 'application/msword',
  TXT: 'text/plain',
  HTML: 'text/html',
} as const;

/**
 * File processing result interface
 */
export interface FileProcessResult {
  text: string;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    pageCount?: number;
    wordCount?: number;
  };
}