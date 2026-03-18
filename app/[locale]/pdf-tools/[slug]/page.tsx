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
import Link from 'next/link';
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
    setFiles,
    addFiles,
    removeFile
  } = useToolStore();

  useEffect(() => {
    if (!tool && slug) {
      router.push('/pdf-tools');
    }
    return () => resetState();
  }, [slug, router, tool, resetState]);

  const handleProcess = async () => {
    if (!tool || files.length === 0) return;
    
    // Check user subscription and daily usage limits (best-effort, don't block on failure)
    try {
      const response = await fetch('/api/user/status');
      
      if (response.status === 401) {
        // User is not signed in — allow processing but skip usage tracking
        console.warn('User not authenticated, skipping usage check.');
      } else if (response.ok) {
        const status = await response.json();
        const isPaidUser = status.hasPdfPremium || status.isCyberPro;
        
        if (!isPaidUser) {
          try {
            const usageRes = await fetch('/api/pdf/usage-status');
            const usageData = await usageRes.json();
            
            if (!usageData.allowed) {
              setError('Daily limit reached (2 tools/day). Please upgrade to premium for unlimited access.');
              return;
            }
          } catch (usageErr) {
            console.warn('Usage check failed, allowing processing:', usageErr);
          }
        }
      } else {
        // API returned an error (e.g. 500) — allow processing anyway
        console.warn('User status API error, skipping usage check:', response.status);
      }
    } catch (err) {
      // Network error or other failure — allow processing anyway
      console.warn('Error checking usage limits, allowing processing:', err);
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
    
    // Default options - let each processor use its own defaults
    const options: Record<string, unknown> = {}; 
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
    <div className="min-h-screen bg-[#111111] py-32 px-4 sm:px-6 lg:px-8">
      {/* Background illumination */}
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none z-0 opacity-30" 
           style={{ background: 'radial-gradient(ellipse at center, rgba(227, 6, 19, 0.4) 0%, transparent 70%)' }}></div>

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        <div className="flex flex-col gap-6">
          <nav className="flex items-center gap-2 text-[#BEA0A0] text-sm">
            <Link href="/pdf-tools" className="hover:text-[var(--color-brand-red)] transition-colors">PDF Suite</Link>
            <Icons.ChevronRight size={14} />
            <span className="text-white capitalize">{tool.id.replace(/-/g, ' ')}</span>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/pdf-tools')}
              className="p-3 bg-white/5 hover:bg-[var(--color-brand-red)]/20 rounded-full transition-all text-[#BEA0A0] hover:text-[var(--color-brand-red)] border border-white/10"
            >
              <Icons.ChevronLeft size={24} />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-white capitalize">
                {tool.id.replace(/-/g, ' ')}
              </h1>
              <p className="text-[#BEA0A0] text-lg mt-1 italic">
                {tool.features[0]}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-panel overflow-hidden border-[var(--color-brand-red)]/20 shadow-2xl shadow-red-900/5">
          <div className="p-10 space-y-10">
            {state.status === 'idle' && (
              <div className="animate-in fade-in zoom-in duration-500">
                <FileUploader 
                  maxFiles={tool.maxFiles}
                  multiple={tool.maxFiles > 1}
                  accept={tool.acceptedFormats}
                  onFilesSelected={(selectedFiles) => {
                    if (tool.maxFiles > 1) {
                      addFiles(selectedFiles);
                    } else {
                      setFiles(selectedFiles);
                    }
                  }}
                  className="bg-black/20 border-white/5 hover:border-[var(--color-brand-red)]/50"
                />

                {files.length > 0 && (
                  <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between px-2">
                      <h3 className="text-white font-bold flex items-center gap-2">
                        <Icons.Files size={18} className="text-[var(--color-brand-red)]" />
                        Selected Files ({files.length})
                      </h3>
                      {tool.maxFiles > 1 && (
                        <button 
                          onClick={() => resetState()}
                          className="text-xs text-[#BEA0A0] hover:text-[var(--color-brand-red)] transition-colors"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    <div className="grid gap-3">
                      {files.map((fileObj) => (
                        <div 
                          key={fileObj.id}
                          className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl group hover:border-[var(--color-brand-red)]/30 transition-all"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 bg-[var(--color-brand-red)]/10 rounded-lg text-[var(--color-brand-red)]">
                              <Icons.FileText size={20} />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-white font-medium truncate text-sm">
                                {fileObj.file.name}
                              </p>
                              <p className="text-[#BEA0A0] text-xs">
                                {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button 
                            onClick={() => removeFile(fileObj.id)}
                            className="p-2 text-[#BEA0A0] hover:text-[var(--color-brand-red)] hover:bg-[var(--color-brand-red)]/10 rounded-lg transition-all"
                            title="Remove file"
                          >
                            <Icons.Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-center mt-10">
                  <button
                    disabled={files.length === 0}
                    onClick={handleProcess}
                    className="btn-primary px-12 py-5 text-xl font-bold disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(227,6,19,0.3)]"
                  >
                    Start Processing
                  </button>
                </div>
              </div>
            )}

            {(state.status === 'processing' || state.status === 'error' || (state.status === 'complete' && !result)) && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ProcessingProgress 
                  progress={state.progress} 
                  status={state.status} 
                  message={state.currentStep}
                />
              </div>
            )}

            {state.status === 'complete' && result && (
              <div className="text-center space-y-8 py-10 animate-in fade-in zoom-in duration-700">
                <div className="w-24 h-24 bg-[var(--color-brand-red)]/10 text-[var(--color-brand-red)] rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--color-brand-red)]/20">
                  <Icons.CheckCircle2 size={48} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Success!</h2>
                  <p className="text-[#BEA0A0] text-lg">Your PDF has been processed and is ready for download.</p>
                </div>
                
                <div className="flex flex-col items-center gap-6">
                  <DownloadButton 
                    file={Array.isArray(result) ? result[0] : result} 
                    filename={`${tool.id.toUpperCase()}_RESULT.PDF`} 
                  />
                  
                  <button 
                    onClick={() => {
                      resetState();
                      setResult(null);
                    }}
                    className="text-[var(--color-brand-yellow)] font-bold hover:underline py-2"
                  >
                    ← Process another file
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        {state.status === 'idle' && (
           <div className="p-6 rounded-2xl bg-[#1A1A1A] border border-white/5 flex items-start gap-4 text-[#BEA0A0] text-sm italic">
             <Icons.ShieldCheck className="text-[var(--color-brand-red)] shrink-0 mt-0.5" size={18} />
             <p>Your files are processed locally in your browser and are never uploaded to our servers. No one can see your documents.</p>
           </div>
        )}
      </div>
    </div>
  );
}

