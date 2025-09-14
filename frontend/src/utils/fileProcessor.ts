import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';
import axios from 'axios';
import { SUPPORTED_FILE_TYPES } from '@shared/types/fileProcessor';
import type { FileProcessResult } from '@shared/types/fileProcessor';

// Configure PDF.js worker to use the local worker from public directory
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

/**
 * Base class for file processors
 */
abstract class BaseFileProcessor {
  abstract process(file: File): Promise<string>;
  
  protected getFileMetadata(file: File, additionalData?: Record<string, unknown>): FileProcessResult['metadata'] {
    let wordCount: number | undefined = undefined;
    if (additionalData?.text && typeof additionalData.text === 'string') {
      const text = additionalData.text.trim();
      wordCount = text ? text.split(/\s+/).filter((word: string) => word.length > 0).length : 0;
    }
    
    return {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      wordCount,
      ...additionalData,
    };
  }
}

/**
 * Text file processor
 */
class TextFileProcessor extends BaseFileProcessor {
  async process(file: File): Promise<string> {
    try {
      const text = await file.text();
      return text;
    } catch (error) {
      throw new Error(`Failed to process text file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * PDF file processor using PDF.js
 */
class PDFFileProcessor extends BaseFileProcessor {
  async process(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument(arrayBuffer).promise;
      
      let fullText = '';
      
      // Extract text from all pages
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item) => 'str' in item ? item.str : '')
          .join(' ');
        
        fullText += pageText + '\n';
      }
      
      return fullText.trim();
    } catch (error) {
      throw new Error(`Failed to process PDF file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * DOCX file processor using Mammoth.js
 */
class DOCXFileProcessor extends BaseFileProcessor {
  async process(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      
      if (result.messages.length > 0) {
        console.warn('DOCX processing warnings:', result.messages);
      }
      
      return result.value;
    } catch (error) {
      throw new Error(`Failed to process DOCX file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * HTML file processor
 */
class HTMLFileProcessor extends BaseFileProcessor {
  async process(file: File): Promise<string> {
    try {
      const htmlContent = await file.text();
      return this.extractTextFromHTML(htmlContent);
    } catch (error) {
      throw new Error(`Failed to process HTML file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractTextFromHTML(html: string): string {
    // Create a temporary DOM element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Remove script and style elements
    const scripts = tempDiv.querySelectorAll('script, style, noscript');
    scripts.forEach(element => element.remove());
    
    // Get text content and clean it up
    let text = tempDiv.textContent || tempDiv.innerText || '';
    
    // Clean up whitespace and normalize line breaks
    text = text
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();
    
    return text;
  }
}

/**
 * Factory class for creating file processors
 */
class FileProcessorFactory {
  private static processors: Map<string, BaseFileProcessor> = new Map([
    [SUPPORTED_FILE_TYPES.TXT, new TextFileProcessor()],
    [SUPPORTED_FILE_TYPES.PDF, new PDFFileProcessor()],
    [SUPPORTED_FILE_TYPES.DOCX, new DOCXFileProcessor()],
    [SUPPORTED_FILE_TYPES.DOC, new DOCXFileProcessor()], // Use DOCX processor for DOC files too
    [SUPPORTED_FILE_TYPES.HTML, new HTMLFileProcessor()],
  ]);

  static getProcessor(fileType: string): BaseFileProcessor | null {
    return this.processors.get(fileType) || null;
  }

  static getSupportedTypes(): string[] {
    return Array.from(this.processors.keys());
  }
}

/**
 * Main file processing function
 * Processes various file types and returns extracted text
 */
export async function processFile(file: File): Promise<FileProcessResult> {
  if (!file) {
    throw new Error('No file provided');
  }

  const processor = FileProcessorFactory.getProcessor(file.type);
  
  if (!processor) {
    throw new Error(
      `Unsupported file type: ${file.type}. Supported types: ${FileProcessorFactory.getSupportedTypes().join(', ')}`
    );
  }

  try {
    const text = await processor.process(file);
    const trimmedText = text.trim();
    const wordCount = trimmedText ? trimmedText.split(/\s+/).filter(word => word.length > 0).length : 0;
    
    const metadata = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      wordCount,
    };
    
    return {
      text,
      metadata,
    };
  } catch (error) {
    throw new Error(`File processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Process text file specifically
 */
export async function processTextFile(file: File): Promise<string> {
  if (file.type !== SUPPORTED_FILE_TYPES.TXT) {
    throw new Error(`Expected text file, got: ${file.type}`);
  }
  
  const processor = new TextFileProcessor();
  return await processor.process(file);
}

/**
 * Process PDF file specifically
 */
export async function processPDFFile(file: File): Promise<string> {
  if (file.type !== SUPPORTED_FILE_TYPES.PDF) {
    throw new Error(`Expected PDF file, got: ${file.type}`);
  }
  
  const processor = new PDFFileProcessor();
  return await processor.process(file);
}

/**
 * Process DOCX file specifically
 */
export async function processDOCXFile(file: File): Promise<string> {
  const supportedTypes = [SUPPORTED_FILE_TYPES.DOCX, SUPPORTED_FILE_TYPES.DOC] as const;
  if (!supportedTypes.includes(file.type as typeof supportedTypes[number])) {
    throw new Error(`Expected DOCX/DOC file, got: ${file.type}`);
  }
  
  const processor = new DOCXFileProcessor();
  return await processor.process(file);
}

/**
 * Extract text from a webpage URL
 * Fetches the webpage and extracts text content
 */
export async function processWebpage(url: string): Promise<FileProcessResult> {
  if (!url) {
    throw new Error('No URL provided');
  }

  // Validate URL format
  try {
    new URL(url);
  } catch {
    throw new Error('Invalid URL format');
  }

  try {
    // Fetch webpage content
    const response = await axios.get(url, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (compatible; SyllabusProcessor/1.0)',
      },
      timeout: 10000, // 10 second timeout
    });

    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = response.data;
    const processor = new HTMLFileProcessor();
    
    // Extract text directly from HTML
    const text = processor['extractTextFromHTML'](html);
    
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    
    return {
      text,
      metadata: {
        fileName: url,
        fileType: 'text/html',
        wordCount,
        fileSize: html.length,
      },
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ENOTFOUND') {
        throw new Error(`Website not found: ${url}`);
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error(`Connection refused: ${url}`);
      } else if (error.response) {
        throw new Error(`HTTP ${error.response.status}: ${error.response.statusText}`);
      } else if (error.request) {
        throw new Error(`Network error: Unable to reach ${url}`);
      }
    }
    
    throw new Error(`Failed to process webpage: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Utility function to check if a file type is supported
 */
export function isFileTypeSupported(fileType: string): boolean {
  return FileProcessorFactory.getSupportedTypes().includes(fileType);
}

/**
 * Utility function to get all supported file types
 */
export function getSupportedFileTypes(): string[] {
  return FileProcessorFactory.getSupportedTypes();
}

/**
 * Utility function to get human-readable file type names
 */
export function getFileTypeDisplayName(fileType: string): string {
  const displayNames: Record<string, string> = {
    [SUPPORTED_FILE_TYPES.PDF]: 'PDF Document',
    [SUPPORTED_FILE_TYPES.DOCX]: 'Word Document (DOCX)',
    [SUPPORTED_FILE_TYPES.DOC]: 'Word Document (DOC)',
    [SUPPORTED_FILE_TYPES.TXT]: 'Text File',
    [SUPPORTED_FILE_TYPES.HTML]: 'HTML File',
  };
  
  return displayNames[fileType] || fileType;
}