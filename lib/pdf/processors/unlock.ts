import { BasePDFProcessor } from '../processor';
import { loadPdfLib } from '../loader';
import { 
  ProcessInput, 
  ProcessOutput, 
  ProgressCallback, 
  PDFErrorCode 
} from '@/types/pdf';

/**
 * Processor for removing password protection from PDF files
 */
export class UnlockPDFProcessor extends BasePDFProcessor {
  async process(input: ProcessInput, onProgress?: ProgressCallback): Promise<ProcessOutput> {
    const { files, options } = input;
    const password = options.password as string;
    
    if (files.length === 0) {
      return {
        success: false,
        error: this.createErrorOutput(PDFErrorCode.FILE_EMPTY, 'No files provided for unlocking.'),
      };
    }

    try {
      this.updateProgress(10, 'Loading PDF library...', onProgress);
      const { PDFDocument } = await loadPdfLib();
      
      this.checkCancelled();
      
      const file = files[0];
      const fileContent = await file.arrayBuffer();
      
      this.checkCancelled();
      this.updateProgress(50, 'Unlocking document...', onProgress);
      
      let pdfDoc;
      try {
        // The 'as any' is used here because pdf-lib's type definitions might not fully
        // reflect the password option in older versions or specific contexts.
        // Loading with a password effectively "unlocks" it for further operations.
        pdfDoc = await PDFDocument.load(fileContent, { password } as any);
      } catch (error: unknown) {
        if (error instanceof Error && error.message?.includes('password')) {
          return {
            success: false,
            error: this.createErrorOutput(
              PDFErrorCode.INVALID_PASSWORD, 
              'Incorrect password provided.'
            ),
          };
        }
        throw error;
      }
      
      this.checkCancelled();
      this.updateProgress(80, 'Saving unlocked PDF...', onProgress);
      
      // When a PDFDocument is loaded with a password, saving it without explicitly
      // calling .encrypt() will result in an unlocked PDF.
      const unlockedPdfBytes = await pdfDoc.save();
      const resultBlob = new Blob([unlockedPdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      
      this.updateProgress(100, 'Unlock complete!', onProgress);
      
      return {
        success: true,
        result: resultBlob,
        filename: `unlocked_${file.name}`,
      };
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'PROCESSING_CANCELLED') {
        return {
          success: false,
          error: this.createErrorOutput(PDFErrorCode.PROCESSING_CANCELLED, 'Processing was cancelled.'),
        };
      }
      
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Unlock error:', error);
      return {
        success: false,
        error: this.createErrorOutput(
          PDFErrorCode.PROCESSING_FAILED, 
          'Failed to unlock PDF file.',
          message
        ),
      };
    }
  }
}
