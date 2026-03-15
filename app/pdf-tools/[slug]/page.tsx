"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PDF_TOOLS } from '@/config/pdf-tools';
import { useToolStore } from '@/lib/hooks/useToolStore';
import { FileUploader } from '@/components/pdf-tools/FileUploader';
import { ProcessingProgress } from '@/components/pdf-tools/ProcessingProgress';
import { DownloadButton } from '@/components/pdf-tools/DownloadButton';
import { MergePDFProcessor } from '@/lib/pdf/processors/merge';
import { SplitPDFProcessor } from '@/lib/pdf/processors/split';
import { Tool } from '@/types/tool';
import * as Icons from 'lucide-react';

export default function ToolPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [tool, setTool] = useState<Tool | null>(null);
  const [result, setResult] = useState<Blob | Blob[] | null>(null);
  
  const { 
    files, 
    state, 
    setProcessingStatus, 
    updateProgress, 
    setError, 
    resetState 
  } = useToolStore();

  useEffect(() => {
    const foundTool = PDF_TOOLS.find(t => t.slug === slug);
    if (!foundTool) {
      router.push('/pdf-tools');
    } else {
      setTool(foundTool);
    }
    return () => resetState();
  }, [slug, router, resetState]);

  const handleProcess = async () => {
    if (!tool || files.length === 0) return;
    
    setProcessingStatus('processing');
    setResult(null);
    
    let processor;
    switch (tool.id) {
      case 'merge-pdf':
        processor = new MergePDFProcessor();
        break;
      case 'split-pdf':
        processor = new SplitPDFProcessor();
        break;
      default:
        setError('Processor not implemented yet.');
        return;
    }

    try {
      const output = await processor.process({
        files: files.map(f => f.file),
        options: tool.id === 'split-pdf' ? { ranges: [{ start: 1, end: 1 }] } : { preserveBookmarks: true },
      }, (progress, message) => {
        updateProgress(progress, message);
      });

      if (output.success && output.result) {
        setProcessingStatus('complete');
        setResult(output.result);
      } else if (output.error) {
        setError(output.error.message);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    }
  };

  if (!tool && slug) {
    const foundTool = PDF_TOOLS.find(t => t.slug === slug);
    if (!foundTool) {
      router.push('/pdf-tools');
      return null;
    }
    setTool(foundTool);
    return null; // Force one re-render
  }

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
            <h1 className="text-3xl font-bold text-gray-900">
              {tool.id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
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
                  acceptedFormats={tool.acceptedFormats.reduce((acc, curr) => ({ ...acc, 'application/pdf': [curr] }), {})}
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
              <ProcessingProgress />
            )}

            {state.status === 'complete' && result && (
              <div className="text-center space-y-6 py-8">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icons.CheckCircle2 size={40} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Success!</h2>
                <p className="text-gray-600">Your PDF has been processed and is ready for download.</p>
                <DownloadButton blob={result} filename={`${tool.id}_result.pdf`} />
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
