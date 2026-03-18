'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { 
  ShieldCheck, Zap, Lock, FileCode2, Search, X
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { ToolGrid } from '@/components/pdf-tools/ToolGrid';
import { PDF_TOOLS } from '@/config/pdf-tools';

export default function PdfTools() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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

  return (
    <div className="flex flex-col min-h-screen bg-[#111111]">
      
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
                <Search size={32} />
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

      {/* Tools Section */}
      <section id="tools" className="py-24 px-6 max-w-[1200px] mx-auto w-full">
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-bold text-white mb-4">Professional PDF Toolkit</h2>
            <p className="text-[#E8D5D5] text-lg max-w-md">Everything you need to manage your PDF files efficiently.</p>
            {hasPremiumAccess && timeLeft !== null && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-brand-red)]/15 border border-[var(--color-brand-red)]/40 text-sm text-white">
                <span className="font-semibold">Access ends in:</span>
                <span className="font-mono">{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="w-full md:w-96 relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[#BEA0A0] group-focus-within:text-[var(--color-brand-red)] transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search 67+ tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-12 pr-12 py-4 bg-[#1A1A1A] border border-white/10 rounded-2xl text-white placeholder-[#BEA0A0] focus:ring-2 focus:ring-[var(--color-brand-red)]/50 focus:border-[var(--color-brand-red)] transition-all outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#BEA0A0] hover:text-white"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Tool Grid */}
        <ToolGrid 
          tools={PDF_TOOLS} 
          locale={locale} 
          searchQuery={searchQuery}
          showCategoryHeaders={!searchQuery}
          className="animate-in fade-in duration-1000"
        />
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-tr from-[#111111] to-[var(--color-brand-crimson)]/30 border border-white/10 rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[3px] bg-gradient-to-r from-transparent via-[var(--color-brand-red)] to-transparent"></div>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Need more advanced features?</h2>
          <p className="text-[#E8D5D5] mb-8 max-w-2xl mx-auto">
            Upgrade to KRA Checker Pro for bulk processing, API access, and priority support.
          </p>
          <Link href="/pricing" className="btn-primary px-8 py-4 inline-block">
            View Pricing Plans
          </Link>
        </div>
      </section>

    </div>
  );
}

