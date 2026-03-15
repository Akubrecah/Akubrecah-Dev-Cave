/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * PDF.js Legacy Library Loader
 * 
 * Loads pdfjs-dist v2.16.105 for SVGGraphics support.
 * This version is used specifically for PDF to SVG vector conversion.
 */

// Cached library instance
let pdfjsLegacyInstance: any | null = null;
let pdfjsLegacyLoadingPromise: Promise<any> | null = null;
let legacyWorkerConfigured = false;

function configureLegacyWorker(pdfjsLib: any): void {
  if (legacyWorkerConfigured) return;
  if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/workers/pdf.worker.legacy.min.js';
    legacyWorkerConfigured = true;
  }
}

export async function loadPdfjsLegacy(): Promise<any> {
  if (pdfjsLegacyInstance) return pdfjsLegacyInstance;
  if (pdfjsLegacyLoadingPromise) return pdfjsLegacyLoadingPromise;

  pdfjsLegacyLoadingPromise = import('pdfjs-dist-legacy' as string).then((module) => {
    const pdfjs = module as any;
    configureLegacyWorker(pdfjs);
    pdfjsLegacyInstance = pdfjs;
    pdfjsLegacyLoadingPromise = null;
    return pdfjs;
  });

  return pdfjsLegacyLoadingPromise;
}

export interface SVGGraphicsInstance {
  embedFonts: boolean;
  getSVG(operatorList: any, viewport: any): Promise<SVGElement>;
}

export interface SVGGraphicsConstructor {
  new(commonObjs: any, objs: any): SVGGraphicsInstance;
}

export async function loadSVGGraphics(): Promise<SVGGraphicsConstructor> {
  await loadPdfjsLegacy();
  const svgModule = await import('pdfjs-dist-legacy/lib/display/svg' as string);
  if (!svgModule.SVGGraphics) {
    throw new Error('SVGGraphics class not found in legacy pdfjs-dist');
  }
  return svgModule.SVGGraphics as SVGGraphicsConstructor;
}

export function isLegacyLibraryLoaded(): boolean {
  return pdfjsLegacyInstance !== null;
}
