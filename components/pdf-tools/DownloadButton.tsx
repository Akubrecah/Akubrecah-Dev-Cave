"use client";

import React from 'react';
import { Download, FileDown } from 'lucide-react';

interface DownloadButtonProps {
  blob: Blob | Blob[];
  filename?: string;
  className?: string;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  blob,
  filename = 'processed_document.pdf',
  className,
}) => {
  const handleDownload = () => {
    const blobs = Array.isArray(blob) ? blob : [blob];
    
    blobs.forEach((b, index) => {
      const url = URL.createObjectURL(b);
      const link = document.createElement('a');
      link.href = url;
      
      const downloadName = blobs.length > 1 
        ? `${filename.replace('.pdf', '')}_part_${index + 1}.pdf`
        : filename;
        
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  };

  return (
    <button
      onClick={handleDownload}
      className={`
        inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl
        font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 
        transition-all active:scale-95 group ${className}
      `}
    >
      <FileDown className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
      <span>Download Result</span>
    </button>
  );
};
