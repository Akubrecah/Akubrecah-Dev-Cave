/**
 * Base PDF Processor
 * Requirements: 5.1
 * 
 * Abstract base class for all PDF processors.
 * Provides common functionality for validation, progress tracking, and cancellation.
 */

import type {
  PDFProcessor,
  ProcessInput,
  ProcessOutput,
  ValidationResult,
  ProgressCallback,
  PDFError,
} from '@/types/pdf';
import { PDFErrorCode, ErrorCategory, ERROR_CODE_CATEGORY } from '@/types/pdf';

/**
 * Abstract base class for PDF processors
 */
export abstract class BasePDFProcessor implements PDFProcessor {
  protected progress: number = 0;
  protected cancelled: boolean = false;
  protected onProgress?: ProgressCallback;

  /**
   * Process the input files - must be implemented by subclasses
   */
  abstract process(input: ProcessInput, onProgress?: ProgressCallback): Promise<ProcessOutput>;

  /**
   * Validate input files before processing
   */
  async validate(files: File[]): Promise<ValidationResult> {
    const errors: PDFError[] = [];

    for (const file of files) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        errors.push(createPDFError(PDFErrorCode.FILE_NOT_PDF, `File ${file.name} is not a PDF.`));
      }

      if (file.size > this.getMaxFileSize()) {
        errors.push(createPDFError(PDFErrorCode.FILE_TOO_LARGE, `File ${file.name} is too large.`));
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get current processing progress (0-100)
   */
  getProgress(): number {
    return this.progress;
  }

  /**
   * Cancel ongoing processing
   */
  cancel(): void {
    this.cancelled = true;
  }

  /**
   * Reset processor state
   */
  protected reset(): void {
    this.progress = 0;
    this.cancelled = false;
  }

  /**
   * Update progress and notify callback
   */
  protected updateProgress(progress: number, message?: string, callback?: ProgressCallback): void {
    this.progress = Math.min(100, Math.max(0, progress));
    const cb = callback || this.onProgress;
    if (cb) {
      cb(this.progress, message);
    }
  }

  /**
   * Check if processing was cancelled
   */
  protected checkCancelled(): boolean {
    return this.cancelled;
  }

  /**
   * Create a success output
   */
  protected createSuccessOutput(result: Blob | Blob[], filename?: string, metadata?: Record<string, unknown>): ProcessOutput {
    return {
      success: true,
      result,
      filename,
      metadata,
    };
  }

  /**
   * Create an error output
   */
  protected createErrorOutput(code: PDFErrorCode, message: string, details?: string): ProcessOutput {
    return {
      success: false,
      error: createPDFError(code, message, details),
    };
  }

  /**
   * Get maximum file size for this processor
   * Override in subclasses if needed
   */
  protected getMaxFileSize(): number {
    return 100 * 1024 * 1024; // 100MB default
  }

  /**
   * Get accepted file types for this processor
   * Override in subclasses if needed
   */
  protected getAcceptedTypes(): string[] {
    return ['application/pdf'];
  }
}

/**
 * Create a standardized PDF error object
 */
export function createPDFError(
  code: PDFErrorCode,
  message: string,
  details?: string,
  suggestedAction?: string
): PDFError {
  const nonRecoverable = [PDFErrorCode.FILE_CORRUPTED, PDFErrorCode.PDF_MALFORMED, PDFErrorCode.BROWSER_NOT_SUPPORTED];
  return {
    code,
    category: ERROR_CODE_CATEGORY[code] || ErrorCategory.PROCESSING_ERROR,
    message,
    details,
    recoverable: !nonRecoverable.includes(code),
    suggestedAction,
  };
}
