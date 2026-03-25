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

  // Overlay data based on extracted coordinates for the new template
  drawText(new Date().toLocaleDateString('en-GB'), 485, 724, 9); // Certificate Date
  drawText(data.kraPin, 485, 708, 9, true); // PIN
  
  // Taxpayer Information
  drawText(data.taxpayerName.toUpperCase(), 210, 600, 10);
  drawText(data.email.toUpperCase(), 210, 582, 10);
  
  // Registered Address
  drawText(data.lrNumber || 'N/A', 130, 532, 9);
  drawText(data.building || 'N/A', 360, 532, 9);
  drawText(data.street || 'N/A', 130, 514, 9);
  drawText(data.city || 'N/A', 360, 514, 9);
  drawText(data.county || 'N/A', 110, 496, 9);
  drawText(data.district || 'N/A', 350, 496, 9);
  drawText(data.taxArea || 'N/A', 120, 478, 9);
  drawText(data.station || 'N/A', 350, 478, 9);
  drawText(data.box || 'N/A', 120, 460, 9);
  drawText(data.postal || 'N/A', 375, 460, 9);

  // Tax Obligation — obligation text is already on the template
  drawText(data.fromDate, 240, 388, 9);
  drawText(data.tillDate || 'N.A.', 410, 388, 9);
  drawText(data.status, 500, 388, 9, true);

  // Save the PDF
  return await pdfDoc.save();
}
