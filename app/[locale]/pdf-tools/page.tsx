'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { 
  Scissors, Combine, FileArchive, Zap, ShieldCheck, Lock, 
  FileCode2, LockKeyhole, Image as ImageIcon, Layers, FileSearch, FileStack
} from 'lucide-react';

export default function PdfTools() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscriptionInfo, setSubscriptionInfo] = useState<{
    tier?: string;
    subscriptionEnd?: string | null;
    pdfPremiumEnd?: string | null;
  } | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (!isSignedIn) {
        setHasPremiumAccess(false);
        setLoading(false);
        return;
      }
      
      try {
        const res = await fetch('/api/user/status');
        if (res.ok) {
          const data = await res.json();

          if (data.isCyberPro || data.hasPdfPremium) {
            setHasPremiumAccess(true);
          }

          setSubscriptionInfo({
            tier: data.subscriptionTier,
            subscriptionEnd: data.subscriptionEnd,
            pdfPremiumEnd: data.pdfPremiumEnd,
          });
        }
      } catch (err) {
        console.error("Error checking access status", err);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [isSignedIn]);

  useEffect(() => {
    if (!subscriptionInfo) return;

    const target =
      subscriptionInfo.tier === 'daily'
        ? subscriptionInfo.pdfPremiumEnd
        : subscriptionInfo.subscriptionEnd;

    if (!target) {
      setTimeLeft(null);
      return;
    }

    const interval = setInterval(() => {
      const end = new Date(target).getTime();
      const now = Date.now();
      const diff = Math.floor((end - now) / 1000);

      setTimeLeft(diff > 0 ? diff : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, [subscriptionInfo]);

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return 'Expired';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const handlePremiumClick = (e: React.MouseEvent) => {
    if (loading) {
      e.preventDefault();
      return;
    }
    
    if (!hasPremiumAccess) {
      e.preventDefault();
      router.push('/pricing?reason=pdf_premium_required');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none z-0" 
             style={{ background: 'radial-gradient(ellipse at center, rgba(227, 6, 19, 0.2) 0%, transparent 70%)' }}></div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-brand-red)]/10 border border-[var(--color-brand-red)]/30 rounded-full text-[var(--color-brand-red)] font-semibold text-sm mb-8">
            <ShieldCheck size={16} />
            <span>Standardized Compliance & PDF Suite</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
            Unified <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-red)] to-[var(--color-brand-yellow)]">Professional Services</span>
          </h1>
          
          <p className="text-xl text-[#E8D5D5] max-w-2xl mx-auto mb-10 leading-relaxed">
            From KRA tax compliance to advanced PDF processing. Secure, fast, and entirely in-browser.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#kra" className="btn-primary px-8 py-4 text-lg">
              KRA Services
            </a>
            <a href="#tools" className="px-8 py-4 text-lg rounded-xl border border-white/20 text-white hover:border-[var(--color-brand-red)] hover:text-[var(--color-brand-red)] transition-colors">
              PDF Toolkit
            </a>
          </div>
        </div>
      </section>

      {/* KRA Services Section */}
      <section id="kra" className="py-20 px-6 max-w-[1200px] mx-auto w-full border-t border-white/5">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
          <div className="max-w-xl">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">KRA Compliance</h2>
            <p className="text-[#E8D5D5] text-lg italic">Professional KRA PIN verification and professional certificate generation. Fast, accurate, and ready for your compliance needs.</p>
          </div>
          <Link href="/dashboard" className="px-6 py-3 rounded-lg border border-[var(--color-brand-yellow)] text-[var(--color-brand-yellow)] font-bold hover:bg-[var(--color-brand-yellow)]/10 transition-all flex items-center gap-2">
            Open KRA Dashboard →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link href="/dashboard" className="group glass-panel p-10 hover:border-[var(--color-brand-yellow)] transition-all duration-300">
             <div className="w-16 h-16 bg-[var(--color-brand-yellow)]/10 text-[var(--color-brand-yellow)] rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <FileSearch size={32} />
             </div>
             <h3 className="text-2xl font-bold text-white mb-4">KRA PIN Verification</h3>
             <p className="text-[#BEA0A0] leading-relaxed mb-6">Instantly verify the status of any KRA PIN. Get full taxpayer details including obligation and station information.</p>
             <div className="text-[var(--color-brand-yellow)] font-bold flex items-center gap-2">
                Launch Verification Tool →
             </div>
          </Link>

          <Link href="/dashboard" className="group glass-panel p-10 hover:border-[var(--color-brand-red)] transition-all duration-300">
             <div className="w-16 h-16 bg-[var(--color-brand-red)]/10 text-[var(--color-brand-red)] rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <ShieldCheck size={32} />
             </div>
             <h3 className="text-2xl font-bold text-white mb-4">Certificate Generation</h3>
             <p className="text-[#BEA0A0] leading-relaxed mb-6">Generate professional PDF KRA PIN certificates from verified details. Ready for immediate download and official use.</p>
             <div className="text-[var(--color-brand-red)] font-bold flex items-center gap-2">
                Generate Certificate →
             </div>
          </Link>
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
          {hasPremiumAccess && timeLeft !== null && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-brand-red)]/15 border border-[var(--color-brand-red)]/40 text-sm text-white">
              <span className="font-semibold">Time left:</span>
              <span className="font-mono">{formatTime(timeLeft)}</span>
            </div>
          )}
          {!hasPremiumAccess && !loading && (
            <div className="mt-6 inline-block bg-[var(--color-brand-red)]/20 border border-[var(--color-brand-red)] rounded-lg px-4 py-2 text-white">
              <LockKeyhole className="inline text-[var(--color-brand-red)] mr-2" size={18} />
              Unlock Premium tools for 50 KES/day or subscribe to Cyber Pro.
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Tool 1 */}
          <Link 
            href="/pdf-tools/merge-pdf" 
            onClick={handlePremiumClick}
            className={`group bg-[#111111] border border-white/10 rounded-2xl p-8 transition-all duration-300 flex flex-col relative ${!hasPremiumAccess && !loading ? 'opacity-70 grayscale' : 'hover:-translate-y-2 hover:border-[var(--color-brand-red)] hover:shadow-[0_0_30px_rgba(227,6,19,0.2)]'}`}
          >
            {!hasPremiumAccess && !loading && (
               <div className="absolute top-4 right-4 bg-white/10 p-2 rounded-full backdrop-blur-md">
                 <Lock size={16} className="text-[#BEA0A0]" />
               </div>
            )}
            <div className="w-14 h-14 bg-[var(--color-brand-red)]/10 text-[var(--color-brand-red)] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Combine size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[var(--color-brand-red)] transition-colors">Merge PDF</h3>
            <p className="text-[#BEA0A0] text-sm mb-6 flex-grow">Combine multiple PDF files into a single document in seconds. Preserve formatting.</p>
            <div className="text-[var(--color-brand-red)] text-sm font-semibold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all flex items-center gap-1">
              {hasPremiumAccess ? 'Open Tool →' : 'Unlock Tool →'}
            </div>
          </Link>

          {/* Tool 2 */}
          <Link 
            href="/pdf-tools/split-pdf" 
            onClick={handlePremiumClick}
            className={`group bg-[#111111] border border-white/10 rounded-2xl p-8 transition-all duration-300 flex flex-col relative ${!hasPremiumAccess && !loading ? 'opacity-70 grayscale' : 'hover:-translate-y-2 hover:border-[var(--color-brand-red)] hover:shadow-[0_0_30px_rgba(227,6,19,0.2)]'}`}
          >
            {!hasPremiumAccess && !loading && (
               <div className="absolute top-4 right-4 bg-white/10 p-2 rounded-full backdrop-blur-md">
                 <Lock size={16} className="text-[#BEA0A0]" />
               </div>
            )}
            <div className="w-14 h-14 bg-[var(--color-brand-red)]/10 text-[var(--color-brand-red)] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Scissors size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[var(--color-brand-red)] transition-colors">Split PDF</h3>
            <p className="text-[#BEA0A0] text-sm mb-6 flex-grow">Extract specific pages, separate by ranges, or burst a large PDF into individual files.</p>
            <div className="text-[var(--color-brand-red)] text-sm font-semibold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all flex items-center gap-1">
              {hasPremiumAccess ? 'Open Tool →' : 'Unlock Tool →'}
            </div>
          </Link>

          {/* Tool 3 */}
          <Link 
            href="/pdf-tools/compress" 
            onClick={handlePremiumClick}
            className={`group bg-[#111111] border border-white/10 rounded-2xl p-8 transition-all duration-300 flex flex-col relative ${!hasPremiumAccess && !loading ? 'opacity-70 grayscale' : 'hover:-translate-y-2 hover:border-[var(--color-brand-red)] hover:shadow-[0_0_30px_rgba(227,6,19,0.2)]'}`}
          >
            {!hasPremiumAccess && !loading && (
               <div className="absolute top-4 right-4 bg-white/10 p-2 rounded-full backdrop-blur-md">
                 <Lock size={16} className="text-[#BEA0A0]" />
               </div>
            )}
            <div className="w-14 h-14 bg-[var(--color-brand-red)]/10 text-[var(--color-brand-red)] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FileArchive size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[var(--color-brand-red)] transition-colors">Compress PDF</h3>
            <p className="text-[#BEA0A0] text-sm mb-6 flex-grow">Reduce file size dramatically while maintaining visual quality for email sharing.</p>
            <div className="text-[var(--color-brand-red)] text-sm font-semibold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all flex items-center gap-1">
              {hasPremiumAccess ? 'Open Tool →' : 'Unlock Tool →'}
            </div>
          </Link>

          {/* Tool 4 - PDF to PNG */}
          <Link 
            href="/pdf-tools/pdf-to-image" 
            onClick={handlePremiumClick}
            className={`group bg-[#111111] border border-white/10 rounded-2xl p-8 transition-all duration-300 flex flex-col relative ${!hasPremiumAccess && !loading ? 'opacity-70 grayscale' : 'hover:-translate-y-2 hover:border-[var(--color-brand-red)] hover:shadow-[0_0_30px_rgba(227,6,19,0.2)]'}`}
          >
            {!hasPremiumAccess && !loading && (
               <div className="absolute top-4 right-4 bg-white/10 p-2 rounded-full backdrop-blur-md">
                 <Lock size={16} className="text-[#BEA0A0]" />
               </div>
            )}
            <div className="w-14 h-14 bg-[var(--color-brand-red)]/10 text-[var(--color-brand-red)] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ImageIcon size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[var(--color-brand-red)] transition-colors">PDF to Image</h3>
            <p className="text-[#BEA0A0] text-sm mb-6 flex-grow">Convert PDF pages into high-quality PNG or JPG images with ease.</p>
            <div className="text-[var(--color-brand-red)] text-sm font-semibold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all flex items-center gap-1">
              {hasPremiumAccess ? 'Open Tool →' : 'Unlock Tool →'}
            </div>
          </Link>

          {/* Tool 5 - Flatten PDF */}
          <Link 
            href="/pdf-tools/flatten" 
            onClick={handlePremiumClick}
            className={`group bg-[#111111] border border-white/10 rounded-2xl p-8 transition-all duration-300 flex flex-col relative ${!hasPremiumAccess && !loading ? 'opacity-70 grayscale' : 'hover:-translate-y-2 hover:border-[var(--color-brand-red)] hover:shadow-[0_0_30px_rgba(227,6,19,0.2)]'}`}
          >
            {!hasPremiumAccess && !loading && (
               <div className="absolute top-4 right-4 bg-white/10 p-2 rounded-full backdrop-blur-md">
                 <Lock size={16} className="text-[#BEA0A0]" />
               </div>
            )}
            <div className="w-14 h-14 bg-[var(--color-brand-red)]/10 text-[var(--color-brand-red)] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Layers size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[var(--color-brand-red)] transition-colors">Flatten PDF</h3>
            <p className="text-[#BEA0A0] text-sm mb-6 flex-grow">Merge layers and make form fields uneditable for secure document sharing.</p>
            <div className="text-[var(--color-brand-red)] text-sm font-semibold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all flex items-center gap-1">
              {hasPremiumAccess ? 'Open Tool →' : 'Unlock Tool →'}
            </div>
          </Link>

          {/* Tool 6 - Alternate Merge */}
          <Link 
            href="/pdf-tools/alternate-merge" 
            onClick={handlePremiumClick}
            className={`group bg-[#111111] border border-white/10 rounded-2xl p-8 transition-all duration-300 flex flex-col relative ${!hasPremiumAccess && !loading ? 'opacity-70 grayscale' : 'hover:-translate-y-2 hover:border-[var(--color-brand-red)] hover:shadow-[0_0_30px_rgba(227,6,19,0.2)]'}`}
          >
            {!hasPremiumAccess && !loading && (
               <div className="absolute top-4 right-4 bg-white/10 p-2 rounded-full backdrop-blur-md">
                 <Lock size={16} className="text-[#BEA0A0]" />
               </div>
            )}
            <div className="w-14 h-14 bg-[var(--color-brand-red)]/10 text-[var(--color-brand-red)] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FileStack size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[var(--color-brand-red)] transition-colors">Alternate Merge</h3>
            <p className="text-[#BEA0A0] text-sm mb-6 flex-grow">Interleave pages from two PDFs in alternating order - perfect for scanned documents.</p>
            <div className="text-[var(--color-brand-red)] text-sm font-semibold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all flex items-center gap-1">
              {hasPremiumAccess ? 'Open Tool →' : 'Unlock Tool →'}
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
