/**
 * DOMMatrix Polyfill for Node.js
 * Required by pdfjs-dist in server-side environments (Vercel)
 */

export function setupDOMMatrix() {
  // Only polyfill on the server (Node.js) where window is undefined
  if (typeof window === 'undefined' && typeof global !== 'undefined') {
    // Check if DOMMatrix is already defined (shouldn't be in Node.js < 20 or without JSDOM)
    const globalAny = global as any;
    if (!globalAny.DOMMatrix) {
      try {
        console.log('[PDF-LOADER] Initializing DOMMatrix polyfill for server-side PDF processing...');
        
        // Try to load the dommatrix package
        // Note: Use require for direct node_modules access in CommonJS/ESM mixed environments
         
        const DOMMatrix = require('dommatrix');
        
        // Assign to global
        globalAny.DOMMatrix = DOMMatrix.DOMMatrix || DOMMatrix;
        
        console.log('[PDF-LOADER] DOMMatrix polyfilled successfully using the dommatrix package.');
      } catch (e: any) {
        console.warn(`[PDF-LOADER] Failed to load dommatrix package: ${e.message}. Using minimal fallback.`);
        
        // Define a minimal fallback if the package is unavailable
        globalAny.DOMMatrix = class DOMMatrix {
          m11: number = 1; m12: number = 0; m13: number = 0; m14: number = 0;
          m21: number = 0; m22: number = 1; m23: number = 0; m24: number = 0;
          m31: number = 0; m32: number = 0; m33: number = 1; m34: number = 0;
          m41: number = 0; m42: number = 0; m43: number = 0; m44: number = 1;
          
          constructor(init?: string | number[]) {
            if (Array.isArray(init) && init.length === 6) {
              // matrix(a, b, c, d, e, f) -> m11, m12, m21, m22, m41, m42
              this.m11 = init[0]; this.m12 = init[1];
              this.m21 = init[2]; this.m22 = init[3];
              this.m41 = init[4]; this.m42 = init[5];
            }
          }
          
          toString() {
            return `matrix(${this.m11}, ${this.m12}, ${this.m21}, ${this.m22}, ${this.m41}, ${this.m42})`;
          }
        };
      }
    }
  }
}
