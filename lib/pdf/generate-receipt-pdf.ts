import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { RECEIPT_TEMPLATE_BASE64 } from './receipt-template';

export interface ReceiptPdfData {
  kraPin: string;
  taxpayerName: string;
  acknowledgmentNumber: string;
  date: string;
}

/** Decode a base64 string to Uint8Array (works in browser) */
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function generateReceiptPdf(data: ReceiptPdfData): Promise<Uint8Array> {
  // Load the embedded template
  const templateBytes = base64ToUint8Array(RECEIPT_TEMPLATE_BASE64);
  const pdfDoc = await PDFDocument.load(templateBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  // Embed standard fonts
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const drawText = (text: string, x: number, y: number, size: number = 10, isBold: boolean = false) => {
    if (!text) return;
    firstPage.drawText(text, {
      x,
      y,
      size,
      font: isBold ? helveticaBold : helveticaFont,
      color: rgb(0, 0, 0),
    });
  };

  // Overlay data based on provided coordinates
  // Note: Coordinates are estimates based on the template layout
  drawText(data.kraPin, 382, 601, 10, true);
  drawText(data.taxpayerName, 382, 586, 10, true);
  drawText(data.acknowledgmentNumber, 382, 571, 10, true);
  drawText(data.date, 382, 556, 10, true);

  // Save the PDF
  return await pdfDoc.save();
}
