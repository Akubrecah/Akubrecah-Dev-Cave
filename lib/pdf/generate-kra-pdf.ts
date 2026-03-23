import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { PIN_CERTIFICATE_TEMPLATE_BASE64 } from './pin-certificate-template';

export interface KraPdfData {
  kraPin: string;
  taxpayerName: string;
  email: string;
  building: string;
  street: string;
  city: string;
  county: string;
  district: string;
  taxArea: string;
  station: string;
  box: string;
  postal: string;
  lrNumber: string;
  obligation: string;
  fromDate: string;
  tillDate: string;
  status: string;
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

export async function generateKraPdf(data: KraPdfData): Promise<Uint8Array> {
  // Load the embedded template (no fetch needed)
  const templateBytes = base64ToUint8Array(PIN_CERTIFICATE_TEMPLATE_BASE64);
  const pdfDoc = await PDFDocument.load(templateBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  // Embed a standard font
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

  // Overlay data based on extracted coordinates
  drawText(new Date().toLocaleDateString('en-GB'), 512.97, 738.05, 8); // Certificate Date
  drawText(data.kraPin, 502.3, 710.05, 8, true); // PIN
  
  drawText(data.taxpayerName.toUpperCase(), 245, 602.32, 10);
  drawText(data.email.toUpperCase(), 245, 584.32, 10);
  
  // Registered Address
  drawText(data.lrNumber || 'N/A', 119.56, 531.79, 10);
  drawText(data.building || 'N/A', 355, 531.82, 10);
  drawText(data.street || 'N/A', 118, 513.82, 10);
  drawText(data.city || 'N/A', 360, 515.32, 10);
  drawText(data.county || 'N/A', 100, 495.82, 10);
  drawText(data.district || 'N/A', 346, 495.82, 10);
  drawText(data.taxArea || 'N/A', 107, 477.82, 10);
  drawText(data.station || 'N/A', 346, 477.82, 10);
  drawText(data.box || 'N/A', 108, 459.82, 10);
  drawText(data.postal || 'N/A', 371, 459.82, 10);

  // Tax Obligation
  drawText(data.obligation, 115.21, 393.63, 10);
  drawText(data.fromDate, 273.98, 387.82, 10);
  drawText(data.tillDate || 'N.A.', 414.27, 387.82, 10);
  
  // Status check (Active in green-ish, but template is black/white usually)
  drawText(data.status, 503.39, 387.82, 10, true);

  // Save the PDF
  return await pdfDoc.save();
}
