/**
 * Utilities for lazy loading PDF libraries
 */

export async function loadPdfLib() {
  const pdfLib = await import('pdf-lib');
  return pdfLib;
}

export async function loadPdfJs() {
  const pdfjs = await import('pdfjs-dist');
  // @ts-ignore
  if (typeof window !== 'undefined' && 'Worker' in window) {
    // @ts-ignore
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
  }
  return pdfjs;
}
