import JSZip from 'jszip';

/**
 * Creates a ZIP file from an array of blobs or files.
 * 
 * @param files Array of files or blobs with names to include in the ZIP
 * @returns A promise that resolves to a ZIP blob
 */
export async function createZip(
  files: { blob: Blob | File; filename: string }[]
): Promise<Blob> {
  const zip = new JSZip();

  files.forEach(({ blob, filename }) => {
    zip.file(filename, blob);
  });

  return await zip.generateAsync({ 
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 9
    }
  });
}
