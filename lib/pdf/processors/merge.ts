import { BasePDFProcessor } from '../processor';
import { loadPdfLib } from '../loader';
import { 
  ProcessInput, 
  ProcessOutput, 
  ProgressCallback, 
  PDFErrorCode, 
  MergeOptions 
} from '@/types/pdf';

/**
 * Processor for merging multiple PDF files into one
 */
export class MergePDFProcessor extends BasePDFProcessor {
  async process(input: ProcessInput, onProgress?: ProgressCallback): Promise<ProcessOutput> {
    const { files } = input;
    // Removed unused options as per lint feedback
    
    try {
      this.updateProgress(0, 'Loading PDF library...', onProgress);
      const { PDFDocument } = await loadPdfLib();
      
      this.checkCancelled();
      
      const mergedPdf = await PDFDocument.create();
      let processedFiles = 0;
      
      for (const file of files) {
        this.checkCancelled();
        this.updateProgress(
          (processedFiles / files.length) * 90, 
          `Processing ${file.name}...`, 
          onProgress
        );
        
        const fileContent = await file.arrayBuffer();
        
        let donorPdf;
        try {
          donorPdf = await PDFDocument.load(fileContent);
        } catch (error: any) {
          if (error.message?.includes('encrypted')) {
            return {
              success: false,
              error: this.createErrorOutput(
                PDFErrorCode.PDF_ENCRYPTED, 
                `File ${file.name} is password protected.`
              ),
            };
          }
          throw error;
        }
        
        const copiedPages = await mergedPdf.copyPages(
          donorPdf, 
          donorPdf.getPageIndices()
        );
        
        copiedPages.forEach((page) => mergedPdf.addPage(page));
        processedFiles++;
      }
      
      this.checkCancelled();
      this.updateProgress(90, 'Generating final PDF...', onProgress);
      
      const mergedPdfBytes = await mergedPdf.save();
      const resultBlob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      
      this.updateProgress(100, 'Merging complete!', onProgress);
      
      return {
        success: true,
        result: resultBlob,
        filename: 'merged_document.pdf',
      };
    } catch (error: any) {
      if (error.message === 'PROCESSING_CANCELLED') {
        return {
          success: false,
          error: this.createErrorOutput(PDFErrorCode.PROCESSING_CANCELLED, 'Processing was cancelled.'),
        };
      }
      
      console.error('Merge error:', error);
      return {
        success: false,
        error: this.createErrorOutput(
          PDFErrorCode.PROCESSING_FAILED, 
          'Failed to merge PDF files.',
          error.message
        ),
      };
    }
  }
}
