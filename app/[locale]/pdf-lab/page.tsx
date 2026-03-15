import { ToolGrid } from '@/components/pdf-tools/ToolGrid';
import { getAllTools } from '@/config/tools';
import Link from 'next/link';
import React from 'react';

interface PdfLabPageProps {
  params: Promise<{ locale: string }>;
}

export default async function PdfLabPage({ params }: PdfLabPageProps) {
  const { locale } = await params;
  const allTools = getAllTools();
  
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <header className="w-full border-b border-white/10 px-6 py-4 flex items-center justify-between bg-[#050505]/90 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-[0.2em] text-white/50">
            PDF LAB
          </span>
          <span className="h-5 w-px bg-white/10" />
          <span className="text-sm text-white/70">
            Integrated PDF Suite
          </span>
        </div>
        <Link
          href="/pdf-tools"
          className="text-xs font-semibold text-white/70 hover:text-white border border-white/20 px-3 py-1.5 rounded-lg transition-colors"
        >
          ← Back to Core Tools
        </Link>
      </header>

      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">Full PDF Suite</h1>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Everything you need to edit, convert, and manage your PDF documents in one powerful, unified interface.
            </p>
          </div>
          
          <ToolGrid 
            tools={allTools} 
            locale={locale} 
            showCategoryHeaders={true}
            className="pb-20"
          />
        </div>
      </main>
    </div>
  );
}

