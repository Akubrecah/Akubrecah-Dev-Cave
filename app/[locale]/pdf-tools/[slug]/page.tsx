"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PDF_TOOLS } from '@/config/pdf-tools';
import { useToolStore } from '@/lib/hooks/useToolStore';
import { FileUploader } from '@/components/pdf-tools/FileUploader';
import { ProcessingProgress } from '@/components/pdf-tools/ProcessingProgress';
import { DownloadButton } from '@/components/pdf-tools/DownloadButton';
import { PDFProcessor, UploadedFile, PDFError } from '@/types/pdf';
import { ProcessingStatus } from '@/types/tool';
import * as Processors from '@/lib/pdf/processors';
import * as Icons from 'lucide-react';

type ProcessorConstructor = new () => PDFProcessor;

export default function ToolPage() {
  const { slug } = useParams();
  const router = useRouter();
  const tool = PDF_TOOLS.find(t => t.slug === slug) || null;
  const [result, setResult] = useState<Blob | Blob[] | null>(null);
  
  const { 
    files, 
    state, 
    setProcessingStatus, 
    updateProgress, 
    setError, 
    resetState,
    setFiles
  } = useToolStore();

  useEffect(() => {
    if (!tool && slug) {
      router.push('/pdf-tools');
    }
    return () => resetState();
  }, [slug, router, tool, resetState]);

  const handleProcess = async () => {
    if (!tool || files.length === 0) return;
    
    // Check user subscription and daily usage limits
    try {
      const response = await fetch('/api/user/status');
      const status = await response.json();
      
      const isPaidUser = status.hasPdfPremium || status.isCyberPro;
      
      if (!isPaidUser) {
        // Enforce 2-per-day limit via API or client-side check linked to server
        // Since this is a client component, we'll call a usage endpoint
        const usageRes = await fetch('/api/pdf/usage-status');
        const usageData = await usageRes.json();
        
        if (!usageData.allowed) {
          setError('Daily limit reached (2 tools/day). Please upgrade to premium for unlimited access.');
          return;
        }
      }
    } catch (err) {
      console.error('Error checking usage limits:', err);
      setError('Unable to verify usage status. Please try again.');
      return;
    }

    setProcessingStatus('processing');
    setResult(null);
    
    const processorMap: Record<string, ProcessorConstructor> = {
      'merge-pdf': Processors.MergePDFProcessor,
      'split-pdf': Processors.SplitPDFProcessor,
      'compress-pdf': Processors.CompressPDFProcessor,
      'pdf-to-image': Processors.PDFToImageProcessor,
      'flatten-pdf': Processors.FlattenPDFProcessor,
      'alternate-merge': Processors.AlternateMergePDFProcessor,
      'protect-pdf': Processors.EncryptPDFProcessor,
      'unlock-pdf': Processors.DecryptPDFProcessor,
      'organize-pdf': Processors.OrganizePDFProcessor,
      'extract-pages': Processors.ExtractPagesPDFProcessor,
      'delete-pages': Processors.DeletePagesPDFProcessor,
      'rotate-pdf': Processors.RotatePDFProcessor,
      'crop-pdf': Processors.CropProcessor,
      'sign-pdf': Processors.SignProcessor,
      'watermark-pdf': Processors.WatermarkProcessor,
      'page-numbers': Processors.PageNumbersProcessor,
      'edit-metadata': Processors.EditMetadataPDFProcessor,
      'ocr-pdf': Processors.OCRProcessor,
      'image-to-pdf': Processors.ImageToPDFProcessor,
      'word-to-pdf': Processors.WordToPDFProcessor,
      'excel-to-pdf': Processors.ExcelToPDFProcessor,
      'pptx-to-pdf': Processors.PPTXToPDFProcessor,
      'txt-to-pdf': Processors.TextToPDFProcessor,
      'html-to-pdf': Processors.MarkdownToPDFProcessor,
    };

    const ProcessorClass = processorMap[tool.id];
    
    if (!ProcessorClass) {
      setError(`Processor for ${tool.id} not implemented yet.`);
      return;
    }

    const processor = new ProcessorClass();
    
    // Default options logic
    const options: Record<string, unknown> = { ...tool.features }; 
    if (tool.id === 'split-pdf') options.ranges = [{ start: 1, end: 1 }];

    try {
      const output = await processor.process({
        files: files.map(f => f.file),
        options,
      }, (progress: number, message?: string) => {
        updateProgress(progress, message || '');
      });

      if (output.success && output.result) {
        setProcessingStatus('complete');
        setResult(output.result);
        
        // Increment usage count for non-premium users
        try {
          await fetch('/api/pdf/increment-usage', { method: 'POST' });
        } catch (err) {
          console.error('Failed to increment usage:', err);
        }
      } else if (output.error) {
        setError(output.error.message);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    }
  };


  if (!tool) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/pdf-tools')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Icons.ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 text-capitalize">
              {tool.id.replace(/-/g, ' ')}
            </h1>
            <p className="text-gray-500">
              {tool.features[0]}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 space-y-8">
            {state.status === 'idle' && (
              <>
                <FileUploader 
                  maxFiles={tool.maxFiles}
                  accept={tool.acceptedFormats}
                  onFilesSelected={(selectedFiles) => {
                    setFiles(selectedFiles);
                  }}
                />
                
                <div className="flex justify-center">
                  <button
                    disabled={files.length === 0}
                    onClick={handleProcess}
                    className="px-10 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-blue-200"
                  >
                    Start Processing
                  </button>
                </div>
              </>
            )}

            {(state.status === 'processing' || state.status === 'error' || (state.status === 'complete' && !result)) && (
              <ProcessingProgress 
                progress={state.progress} 
                status={state.status} 
                message={state.currentStep}
              />
            )}

            {state.status === 'complete' && result && (
              <div className="text-center space-y-6 py-8">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icons.CheckCircle2 size={40} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Success!</h2>
                <p className="text-gray-600">Your PDF has been processed and is ready for download.</p>
                <DownloadButton 
                  file={Array.isArray(result) ? result[0] : result} 
                  filename={`${tool.id}_result.pdf`} 
                />
                <div>
                  <button 
                    onClick={() => {
                      resetState();
                      setResult(null);
                    }}
                    className="text-blue-600 font-medium hover:underline"
                  >
                    Process another file
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
