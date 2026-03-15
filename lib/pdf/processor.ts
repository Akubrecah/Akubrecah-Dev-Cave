import { 
  PDFProcessor, 
  ProcessInput, 
  ProcessOutput, 
  ProgressCallback, 
  ValidationResult, 
  PDFErrorCode, 
  ERROR_CODE_CATEGORY,
  PDFError 
} from '@/types/pdf';

/**
 * Abstract base class for all PDF processors
 */
export abstract class BasePDFProcessor implements PDFProcessor {
  protected progress: number = 0;
  protected isCancelled: boolean = false;

  /**
   * Abstract process method to be implemented by child classes
   */
  abstract process(input: ProcessInput, onProgress?: ProgressCallback): Promise<ProcessOutput>;

  /**
   * Default implementation for validation
   */
  async validate(files: File[]): Promise<ValidationResult> {
    const errors: PDFError[] = [];

    for (const file of files) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        errors.push(this.createErrorOutput(PDFErrorCode.FILE_NOT_PDF, `File ${file.name} is not a PDF.`));
      }

      // Max file size check (default 100MB)
      if (file.size > 100 * 1024 * 1024) {
        errors.push(this.createErrorOutput(PDFErrorCode.FILE_TOO_LARGE, `File ${file.name} is too large.`));
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  getProgress(): number {
    return this.progress;
  }

  cancel(): void {
    this.isCancelled = true;
  }

  /**
   * Helper to create a standardized error output
   */
  protected createErrorOutput(code: PDFErrorCode, message: string, details?: string): PDFError {
    return {
      code,
      category: ERROR_CODE_CATEGORY[code],
      message,
      details,
      recoverable: code !== PDFErrorCode.FILE_CORRUPTED && code !== PDFErrorCode.PDF_MALFORMED,
    };
  }

  /**
   * Standardized progress update
   */
  protected updateProgress(progress: number, message?: string, onProgress?: ProgressCallback): void {
    this.progress = Math.min(100, Math.max(0, progress));
    if (onProgress) {
      onProgress(this.progress, message);
    }
  }

  /**
   * Check for cancellation
   */
  protected checkCancelled(): void {
    if (this.isCancelled) {
      throw new Error('PROCESSING_CANCELLED');
    }
  }
}
