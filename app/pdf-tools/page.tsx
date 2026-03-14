import Link from 'next/link';
import { FileUp, Scissors, Combine, FileArchive, Zap, ShieldCheck, Lock, FileCode2 } from 'lucide-react';

export default function PdfTools() {
  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none z-0" 
             style={{ background: 'radial-gradient(ellipse at center, rgba(227, 6, 19, 0.2) 0%, transparent 70%)' }}></div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-brand-red)]/10 border border-[var(--color-brand-red)]/30 rounded-full text-[var(--color-brand-red)] font-semibold text-sm mb-8">
            <ShieldCheck size={16} />
            <span>100% Secure & Private</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
            Professional <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-red)] to-[var(--color-brand-yellow)]">PDF Tools</span>
          </h1>
          
          <p className="text-xl text-[#E8D5D5] max-w-2xl mx-auto mb-10 leading-relaxed">
            Merge, split, compress, and convert your documents securely. All processing happens entirely in your browser—your files never touch our servers.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#tools" className="btn-primary px-8 py-4 text-lg">
              Explore Tools
            </a>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="border-y border-white/10 bg-[#1A1A1A]/50 backdrop-blur-md py-8">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[var(--color-brand-red)]/10 text-[var(--color-brand-red)] rounded-xl flex items-center justify-center shrink-0">
              <Lock size={24} />
            </div>
            <div>
              <h3 className="text-white font-bold">100% Private</h3>
              <p className="text-[#BEA0A0] text-sm">Files processed locally in browser.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[var(--color-brand-red)]/10 text-[var(--color-brand-red)] rounded-xl flex items-center justify-center shrink-0">
              <Zap size={24} />
            </div>
            <div>
              <h3 className="text-white font-bold">Ultra Fast</h3>
              <p className="text-[#BEA0A0] text-sm">Instant results with WebAssembly.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[var(--color-brand-red)]/10 text-[var(--color-brand-red)] rounded-xl flex items-center justify-center shrink-0">
              <FileCode2 size={24} />
            </div>
            <div>
              <h3 className="text-white font-bold">No Watermarks</h3>
              <p className="text-[#BEA0A0] text-sm">Clean exports every time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section id="tools" className="py-24 px-6 max-w-[1200px] mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Powerful Utilities</h2>
          <p className="text-[#E8D5D5] text-lg">Everything you need to manage your PDF files efficiently.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Tool 1 */}
          <Link href="/pdf-tools/merge" className="group bg-[#111111] border border-white/10 rounded-2xl p-8 hover:-translate-y-2 hover:border-[var(--color-brand-red)] hover:shadow-[0_0_30px_rgba(227,6,19,0.2)] transition-all duration-300 flex flex-col">
            <div className="w-14 h-14 bg-[var(--color-brand-red)]/10 text-[var(--color-brand-red)] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Combine size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[var(--color-brand-red)] transition-colors">Merge PDF</h3>
            <p className="text-[#BEA0A0] text-sm mb-6 flex-grow">Combine multiple PDF files into a single document in seconds. Preserve formatting.</p>
            <div className="text-[var(--color-brand-red)] text-sm font-semibold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all flex items-center gap-1">
              Open Tool <span>→</span>
            </div>
          </Link>

          {/* Tool 2 */}
          <Link href="/pdf-tools/split" className="group bg-[#111111] border border-white/10 rounded-2xl p-8 hover:-translate-y-2 hover:border-[var(--color-brand-red)] hover:shadow-[0_0_30px_rgba(227,6,19,0.2)] transition-all duration-300 flex flex-col">
            <div className="w-14 h-14 bg-[var(--color-brand-red)]/10 text-[var(--color-brand-red)] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Scissors size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[var(--color-brand-red)] transition-colors">Split PDF</h3>
            <p className="text-[#BEA0A0] text-sm mb-6 flex-grow">Extract specific pages, separate by ranges, or burst a large PDF into individual files.</p>
            <div className="text-[var(--color-brand-red)] text-sm font-semibold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all flex items-center gap-1">
              Open Tool <span>→</span>
            </div>
          </Link>

          {/* Tool 3 */}
          <Link href="/pdf-tools/compress" className="group bg-[#111111] border border-white/10 rounded-2xl p-8 hover:-translate-y-2 hover:border-[var(--color-brand-red)] hover:shadow-[0_0_30px_rgba(227,6,19,0.2)] transition-all duration-300 flex flex-col">
            <div className="w-14 h-14 bg-[var(--color-brand-red)]/10 text-[var(--color-brand-red)] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FileArchive size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[var(--color-brand-red)] transition-colors">Compress PDF</h3>
            <p className="text-[#BEA0A0] text-sm mb-6 flex-grow">Reduce file size dramatically while maintaining visual quality for email sharing.</p>
            <div className="text-[var(--color-brand-red)] text-sm font-semibold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all flex items-center gap-1">
              Open Tool <span>→</span>
            </div>
          </Link>

        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-tr from-[#111111] to-[var(--color-brand-crimson)]/30 border border-white/10 rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[3px] bg-gradient-to-r from-transparent via-[var(--color-brand-red)] to-transparent"></div>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Need more advanced features?</h2>
          <p className="text-[#E8D5D5] mb-8 max-w-2xl mx-auto">
            Upgrade to KRA Checker Pro for bulk processing, API access, and priority support.
          </p>
          <Link href="/pricing" className="btn-primary px-8 py-4">
            View Pricing Plans
          </Link>
        </div>
      </section>

    </div>
  );
}
