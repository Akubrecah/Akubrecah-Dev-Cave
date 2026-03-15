import { BasePDFProcessor } from '../processor';
import { loadPdfLib } from '../loader';
import { 
  ProcessInput, 
  ProcessOutput, 
  ProgressCallback, 
  PDFErrorCode, 
  PageRange 
} from '@/types/pdf';

/**
 * Processor for splitting a PDF by page ranges
 */
export class SplitPDFProcessor extends BasePDFProcessor {
  async process(input: ProcessInput, onProgress?: ProgressCallback): Promise<ProcessOutput> {
    const { files, options } = input;
    const ranges = options.ranges as PageRange[];
    
    if (!files.length) {
      return {
        success: false,
        error: this.createErrorOutput(PDFErrorCode.FILE_EMPTY, 'No files provided.'),
      };
    }

    const file = files[0];
    
    try {
      this.updateProgress(0, 'Loading PDF library...', onProgress);
      const { PDFDocument } = await loadPdfLib();
      
      this.checkCancelled();
      
      const fileContent = await file.arrayBuffer();
      const donorPdf = await PDFDocument.load(fileContent);
      const pageCount = donorPdf.getPageCount();
      
      const results: Blob[] = [];
      let currentRange = 0;

      for (const range of ranges) {
        this.checkCancelled();
        this.updateProgress(
          (currentRange / ranges.length) * 90, 
          `Creating split ${currentRange + 1}...`, 
          onProgress
        );

        // Validate range
        const start = Math.max(1, range.start);
        const end = Math.min(pageCount, range.end);
        
        if (start > end) continue;

        const newPdf = await PDFDocument.create();
        const pageIndices = Array.from(
          { length: end - start + 1 }, 
          (_, i) => start - 1 + i
        );
        
        const copiedPages = await newPdf.copyPages(donorPdf, pageIndices);
        copiedPages.forEach((page) => newPdf.addPage(page));
        
        const pdfBytes = await newPdf.save();
        results.push(new Blob([pdfBytes], { type: 'application/pdf' }));
        currentRange++;
      }
      
      this.updateProgress(100, 'Splitting complete!', onProgress);
      
      return {
        success: true,
        result: results.length === 1 ? results[0] : results,
        filename: results.length === 1 ? `split_${file.name}` : undefined,
      };
    } catch (error: any) {
      if (error.message === 'PROCESSING_CANCELLED') {
        return {
          success: false,
          error: this.createErrorOutput(PDFErrorCode.PROCESSING_CANCELLED, 'Processing was cancelled.'),
        };
      }
      
      return {
        success: false,
        error: this.createErrorOutput(
          PDFErrorCode.PROCESSING_FAILED, 
          'Failed to split PDF file.',
          error.message
        ),
      };
    }
  }
}
