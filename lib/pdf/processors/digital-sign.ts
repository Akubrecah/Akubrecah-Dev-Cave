/**
 * Digital Signature Processor
 * Signs PDFs with X.509 certificates using node-forge + @signpdf/signpdf.
 */
import forge from 'node-forge';
import { PDFDocument } from 'pdf-lib';
import signPdfLib from '@signpdf/signpdf';
import { P12Signer } from '@signpdf/signer-p12';
import { pdflibAddPlaceholder } from '@signpdf/placeholder-pdf-lib';
import type {
  CertificateData,
  SignPdfOptions,
} from '@/types/digital-signature';

/**
 * Parse a PFX/P12 file
 */
export function parsePfxFile(pfxBytes: ArrayBuffer, password: string): CertificateData {
  const pfxAsn1 = forge.asn1.fromDer(forge.util.createBuffer(new Uint8Array(pfxBytes)));
  const pfx = forge.pkcs12.pkcs12FromAsn1(pfxAsn1, password);

  const certBags = pfx.getBags({ bagType: forge.pki.oids.certBag });
  const keyBags = pfx.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });

  const certBagArray = certBags[forge.pki.oids.certBag];
  const keyBagArray = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag];

  if (!certBagArray || certBagArray.length === 0) {
    throw new Error('No certificate found in PFX file');
  }
  if (!keyBagArray || keyBagArray.length === 0) {
    throw new Error('No private key found in PFX file');
  }

  const certificate = certBagArray[0].cert;
  if (!certificate) {
    throw new Error('Failed to extract certificate from PFX file');
  }

  return { p12Buffer: pfxBytes, password, certificate };
}

/**
 * Parse PEM files (combined cert + key)
 */
export function parseCombinedPem(pemContent: string, password?: string): CertificateData {
  const certMatch = pemContent.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/);
  const keyMatch = pemContent.match(/-----BEGIN (RSA |EC |ENCRYPTED )?PRIVATE KEY-----[\s\S]*?-----END (RSA |EC |ENCRYPTED )?PRIVATE KEY-----/);

  if (!certMatch) throw new Error('No certificate found in PEM file');
  if (!keyMatch) throw new Error('No private key found in PEM file');

  const certificate = forge.pki.certificateFromPem(certMatch[0]);

  let privateKey: forge.pki.PrivateKey;
  if (keyMatch[0].includes('ENCRYPTED')) {
    if (!password) throw new Error('Password required for encrypted private key');
    privateKey = forge.pki.decryptRsaPrivateKey(keyMatch[0], password);
    if (!privateKey) throw new Error('Failed to decrypt private key');
  } else {
    privateKey = forge.pki.privateKeyFromPem(keyMatch[0]);
  }

  const p12Password = password || 'temp-password';
  const p12Asn1 = forge.pkcs12.toPkcs12Asn1(privateKey, [certificate], p12Password, { algorithm: '3des' });
  const p12Der = forge.asn1.toDer(p12Asn1).getBytes();
  const p12Buffer = new Uint8Array(p12Der.length);
  for (let i = 0; i < p12Der.length; i++) {
    p12Buffer[i] = p12Der.charCodeAt(i);
  }

  return { p12Buffer: p12Buffer.buffer, password: p12Password, certificate };
}

/**
 * Get certificate info for display
 */
export function getCertificateInfo(certificate: forge.pki.Certificate) {
  const subjectCN = certificate.subject.getField('CN');
  const issuerCN = certificate.issuer.getField('CN');

  return {
    subject: (subjectCN?.value as string) ?? 'Unknown',
    issuer: (issuerCN?.value as string) ?? 'Unknown',
    validFrom: certificate.validity.notBefore,
    validTo: certificate.validity.notAfter,
    serialNumber: certificate.serialNumber,
  };
}

/**
 * Sign a PDF with a certificate
 */
export async function signPdf(
  pdfBytes: Uint8Array,
  certificateData: CertificateData,
  options: SignPdfOptions = {}
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const signatureInfo = options.signatureInfo ?? {};

  // 1. Prepare signature placeholder
  const placeholderOptions = {
    signatureLength: 8192, // Generous space for the PKCS#7 signature
    reason: signatureInfo.reason ?? 'Digital Signature',
    location: signatureInfo.location ?? 'Kenya',
    contactInfo: signatureInfo.contactInfo ?? 'support@akubrecah.co.ke',
    name: signatureInfo.name ?? 'Akubrecah Platform',
  };

  // 2. Handle visible signature if enabled
  if (options.visibleSignature?.enabled) {
    const vs = options.visibleSignature;
    // Note: Visible signature placement with pdf-lib + signpdf involves more complex
    // widget creation. For now, we use standard placeholder which creates a form field.
    // In a full implementation, we would create a Widget Annotation here.
  }

  // 3. Add placeholder to the document
  pdflibAddPlaceholder({
    pdfDoc,
    ...placeholderOptions,
  });

  const pdfBuffer = await pdfDoc.save();

  // 4. Create the signer
  const signer = new P12Signer(Buffer.from(certificateData.p12Buffer), {
    passphrase: certificateData.password,
  });

  // 5. Perform the final signing
  const signedPdf = await signPdfLib.sign(pdfBuffer, signer);

  return new Uint8Array(signedPdf);
}
