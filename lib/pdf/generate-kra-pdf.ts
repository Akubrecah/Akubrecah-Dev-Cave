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

  // Helper to format date from YYYY-MM-DD to DD/MM/YYYY
  const formatKraDate = (d: string) => {
    if (!d) return '';
    if (d.includes('-')) {
      const parts = d.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return d;
  };

  // Obscure the hardcoded dates from the template with white rectangles


  // Overlay data based on extracted coordinates for the new template
  const currentDateFormatted = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  
  // Calculate X for right alignment (target right edge at X=565)
  const dateTextWidth = helveticaFont.widthOfTextAtSize(currentDateFormatted, 9);
  const dateX = 565 - dateTextWidth;
  
  const pinWidth = helveticaFont.widthOfTextAtSize(data.kraPin, 9);
  const pinX = 565 - pinWidth;
  
  drawText(currentDateFormatted, dateX, 740, 9); // Certificate Date
  drawText(data.kraPin, pinX, 708, 9, false); // PIN
  
  // Taxpayer Information
  drawText(data.taxpayerName.toUpperCase(), 254, 600, 10);
  drawText(data.email.toUpperCase(), 254, 582, 10);
  
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
  drawText(formatKraDate(data.fromDate), 274, 388, 9);


  // Save the PDF
  return await pdfDoc.save();
}

