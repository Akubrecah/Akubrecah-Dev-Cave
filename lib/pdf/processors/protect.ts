import { BasePDFProcessor } from '../processor';
import { loadPdfLib } from '../loader';
import { 
  ProcessInput, 
  ProcessOutput, 
  ProgressCallback, 
  PDFErrorCode 
} from '@/types/pdf';

/**
 * Processor for password protecting PDF files
 */
export class ProtectPDFProcessor extends BasePDFProcessor {
  async process(input: ProcessInput, onProgress?: ProgressCallback): Promise<ProcessOutput> {
    const { files, options } = input;
    const password = options.password as string;
    
    if (!password) {
      return this.createErrorOutput(PDFErrorCode.INVALID_OPTIONS, 'Password is required to protect the PDF.');
    }

    if (files.length === 0) {
      return this.createErrorOutput(PDFErrorCode.FILE_EMPTY, 'No files provided for protection.');
    }

    try {
      this.updateProgress(10, 'Loading PDF library...', onProgress);
      const { PDFDocument } = await loadPdfLib();
      
      this.checkCancelled();
      
      const file = files[0];
      const fileContent = await file.arrayBuffer();
      
      this.checkCancelled();
      this.updateProgress(50, 'Encrypting document...', onProgress);
      
      const pdfDoc = await PDFDocument.load(fileContent);
      
      // Note: Encryption in pdf-lib requires casting to any as the types might be out of sync
      if (typeof (pdfDoc as any).encrypt === 'function') {
        (pdfDoc as any).encrypt({
          userPassword: password,
          ownerPassword: password,
          permissions: {
            printing: 'highResolution',
            modifying: true,
            copying: true,
            annotating: true,
            fillingForms: true,
            contentAccessibility: true,
            documentAssembly: true,
          },
        });
      }
      
      this.checkCancelled();
      this.updateProgress(80, 'Saving protected PDF...', onProgress);
      
      const protectedPdfBytes = await pdfDoc.save();
      const resultBlob = new Blob([protectedPdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      
      this.updateProgress(100, 'Protection complete!', onProgress);
      
      return {
        success: true,
        result: resultBlob,
        filename: `protected_${file.name}`,
      };
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'PROCESSING_CANCELLED') {
        return this.createErrorOutput(PDFErrorCode.PROCESSING_CANCELLED, 'Processing was cancelled.');
      }
      
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Protection error:', error);
      return this.createErrorOutput(
          PDFErrorCode.PROCESSING_FAILED, 
          'Failed to protect PDF file.',
          message
        );
    }
  }
}
