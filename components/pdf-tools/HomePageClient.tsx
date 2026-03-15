'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { ArrowRight, Search, FileText, Zap, ShieldCheck, Sparkles, Star, Wrench, FolderOpen, Edit, FileImage, Settings, Combine, Scissors, FileArchive } from 'lucide-react';
import React from 'react';
import { ToolGrid } from '@/components/pdf-tools/ToolGrid';
import { Card } from '@/components/ui/Card';
import { getToolsByCategory, getPopularTools } from '@/config/tools';
import { type Locale } from '@/lib/i18n/config';
import { ToolCategory } from '@/types/tool';

interface HomePageClientProps {
  locale: Locale;
  localizedToolContent?: Record<string, { title: string; description: string }>;
}

export default function HomePageClient({ locale, localizedToolContent }: HomePageClientProps) {
  const { isSignedIn } = useAuth();
  const t = useTranslations();
  const popularTools = getPopularTools();

  // Feature highlights
  const features = [
    {
      icon: ShieldCheck,
      title: '100% Private',
      description: 'All processing happens in your browser. Your files never leave your device.',
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    },
    {
      icon: Zap,
      title: 'Completely Free',
      description: 'No registration, no limits, no hidden costs. Professional tools for everyone.',
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10'
    },
    {
      icon: Wrench,
      title: '67+ Powerful Tools',
      description: 'Professional-grade PDF tools for merging, splitting, converting, and more.',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
  ];

  // Category icons mapping
  const categoryIcons: Record<ToolCategory, React.ElementType> = {
    'edit-annotate': Edit,
    'convert-to-pdf': FileImage,
    'convert-from-pdf': FileImage,
    'organize-manage': FolderOpen,
    'optimize-repair': Settings,
    'secure-pdf': ShieldCheck,
  };

  const categoryTranslationKeys: Record<ToolCategory, string> = {
    'edit-annotate': 'editAnnotate',
    'convert-to-pdf': 'convertToPdf',
    'convert-from-pdf': 'convertFromPdf',
    'organize-manage': 'organizeManage',
    'optimize-repair': 'optimizeRepair',
    'secure-pdf': 'securePdf',
  };

  const categoryOrder: ToolCategory[] = [
    'edit-annotate',
    'convert-to-pdf',
    'convert-from-pdf',
    'organize-manage',
    'optimize-repair',
    'secure-pdf',
  ];

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Dual Hero Section - Integrated with KRA & PDF */}
      <section className="relative min-h-[95vh] flex items-center py-24 overflow-hidden bg-black">
        {/* Glow Effects */}
        <div className="absolute top-[-200px] left-1/4 -translate-x-1/2 w-[600px] h-[600px] pointer-events-none z-0" 
             style={{ background: 'radial-gradient(ellipse at center, rgba(227, 6, 19, 0.3) 0%, transparent 70%)' }} aria-hidden="true"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[80%] pointer-events-none opacity-40"
             style={{ background: 'radial-gradient(ellipse at center, rgba(30, 60, 220, 0.2) 0%, transparent 60%)' }} aria-hidden="true"></div>

        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
          
          <div className="hero-text text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/5 border border-white/10 shadow-sm backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-[var(--color-brand-red)]" aria-hidden="true" />
              <span className="text-sm font-medium text-white">
                Powered by Akubrecah Technologies
              </span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight mb-8 tracking-tight">
              One Platform. <br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-br from-[var(--color-brand-red)] to-[var(--color-brand-yellow)]">
                KRA & PDFs.
              </span>
            </h1>
            <p className="text-xl text-[#E8D5D5] mb-12 max-w-[550px] leading-relaxed font-sans">
              Instantly verify KRA PINs and generate compliance certificates. Plus, access 67+ secure, lightning-fast PDF tools right in your browser.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={isSignedIn ? `/${locale}/dashboard` : `/${locale}/sign-in`} className="btn-primary text-base px-8 py-4 flex items-center justify-center gap-2 group">
                <Search size={20} /> Verify KRA PIN <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href={isSignedIn ? `/${locale}/pdf-tools` : `/${locale}/sign-in`} className="inline-flex items-center justify-center rounded-xl px-8 py-4 text-base font-semibold tracking-wide text-white bg-white/5 border border-white/20 hover:bg-white/10 hover:border-white/40 transition-all duration-300">
                <FileText size={20} className="mr-2" /> All PDF Tools
              </Link>
            </div>
          </div>

          <div className="grid grid-rows-2 gap-6 h-[500px] lg:h-[600px]">
            {/* Top Visual - KRA */}
            <div className="relative rounded-3xl border border-white/10 overflow-hidden group" 
                 style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #111111 100%)' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-red)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-6 left-6 bg-[var(--color-brand-red)]/20 text-[var(--color-brand-red)] px-3 py-1 rounded-full text-xs font-bold border border-[var(--color-brand-red)]/30 backdrop-blur-md">
                KRA Compliance System
              </div>
              <div className="h-full flex items-center justify-center p-8">
                 <div className="glass-panel p-6 w-full max-w-[350px] border border-white/10 shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-500"
                      style={{ background: 'rgba(20, 20, 20, 0.8)', backdropFilter: 'blur(20px)' }}>
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-2 text-white/50 text-sm">
                         <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></div>
                         Live Gateway
                      </div>
                      <span className="text-[#34D399] font-medium bg-[#10B981]/10 px-2 py-1 rounded-md text-xs border border-[#10B981]/20">Valid PIN</span>
                    </div>
                    <div className="h-4 w-3/4 bg-white/10 rounded mb-3"></div>
                    <div className="h-4 w-1/2 bg-white/5 rounded"></div>
                 </div>
              </div>
            </div>

            {/* Bottom Visual - PDF Tools */}
            <div className="relative rounded-3xl border border-white/10 overflow-hidden group" 
                 style={{ background: 'linear-gradient(135deg, #111111 0%, #0a0a0a 100%)' }}>
               <div className="absolute inset-0 bg-gradient-to-tl from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
               <div className="absolute top-6 left-6 bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/30 backdrop-blur-md">
                Pro PDF Suite
              </div>
              <div className="h-full flex gap-4 p-8 pt-16 items-center justify-center">
                 <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 group-hover:-translate-y-2 transition-transform duration-300">
                    <Combine size={28} className="text-white" />
                    <span className="text-xs font-bold text-white/70">Merge</span>
                 </div>
                 <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 group-hover:-translate-y-4 transition-transform duration-300 delay-75 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                    <Scissors size={28} className="text-white" />
                    <span className="text-xs font-bold text-white/70">Split</span>
                 </div>
                 <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 group-hover:-translate-y-2 transition-transform duration-300 delay-150">
                    <FileArchive size={28} className="text-white" />
                    <span className="text-xs font-bold text-white/70">Compress</span>
                 </div>
              </div>
            </div>
          </div>
          
        </div>
      </section>

      {/* Marquee */}
      <div className="bg-[#6A0808]/20 py-6 overflow-hidden border-y border-white/10 backdrop-blur-sm" aria-label="Feature highlight marquee">
        <div className="flex animate-[marquee_30s_linear_infinite] whitespace-nowrap items-center" aria-hidden="true">
          {[1, 2, 3, 4].map((i) => (
             <React.Fragment key={i}>
                <span className="px-12 text-xl font-bold text-[#BEA0A0]">Verify KRA PINs</span>
                <span className="px-8 text-[var(--color-brand-red)]"><Zap size={20}/></span>
                <span className="px-12 text-xl font-bold text-[#BEA0A0]">Merge PDFs</span>
                <span className="px-8 text-[var(--color-brand-red)]"><Zap size={20}/></span>
                <span className="px-12 text-xl font-bold text-[#BEA0A0]">Compress Files</span>
                <span className="px-8 text-[var(--color-brand-red)]"><Zap size={20}/></span>
                <span className="px-12 text-xl font-bold text-[#BEA0A0]">Custom Workflow</span>
                <span className="px-8 text-[var(--color-brand-red)]"><Zap size={20}/></span>
                <span className="px-12 text-xl font-bold text-[#BEA0A0]">100% Secure</span>
                <span className="px-8 text-[var(--color-brand-red)]"><Zap size={20}/></span>
             </React.Fragment>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}} />

      {/* Features Section */}
      <section className="py-24 px-6 bg-[#0a0a0a]" aria-label="Features">
          <div className="max-w-[1400px] mx-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="p-8 glass-panel border-white/10 hover:border-[var(--color-brand-red)] transition-all duration-500">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${feature.bg} mb-6 ${feature.color}`}>
                      <Icon className="h-7 w-7" aria-hidden="true" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-[#E8D5D5]/80 leading-relaxed">
                      {feature.description}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
      </section>

      {/* Popular Tools Section - Only visible if signed in */}
      {isSignedIn && (
        <section className="py-24 px-6 bg-[#111111]" aria-labelledby="popular-tools-heading">
          <div className="max-w-[1400px] mx-auto w-full">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-[var(--color-brand-red)]/10 border border-[var(--color-brand-red)]/20 shadow-sm backdrop-blur-md">
                <Star className="h-4 w-4 text-[var(--color-brand-red)]" aria-hidden="true" />
                <span className="text-sm font-medium text-[var(--color-brand-red)] text-white">
                  Most Popular
                </span>
              </div>
              <h2 id="popular-tools-heading" className="text-4xl lg:text-5xl font-bold text-white mb-4">
                {t('home.popularTools.title')}
              </h2>
              <p className="text-[#E8D5D5]/70 max-w-2xl mx-auto text-lg font-sans">
                Join thousands of users who simplify their PDF workflows every day.
              </p>
            </div>
            <ToolGrid
              tools={popularTools}
              locale={locale}
              localizedToolContent={localizedToolContent}
            />
          </div>
        </section>
      )}

      {/* Tool Categories Section */}
      <section className="py-24 px-6 bg-[#0a0a0a]" aria-labelledby="categories-heading">
        <div className="max-w-[1400px] mx-auto w-full">
          <div className="text-center mb-16">
            <h2 id="categories-heading" className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Explore All Tool Categories
            </h2>
            <p className="text-[#E8D5D5]/70 max-w-2xl mx-auto text-lg font-sans">
              67+ professional PDF tools organized for your convenience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {categoryOrder.map((category) => {
              const categoryTools = getToolsByCategory(category);
              const Icon = categoryIcons[category];
              const categoryName = t(`home.categories.${categoryTranslationKeys[category]}`);
              const categoryDescription = t(`home.categoriesDescription.${categoryTranslationKeys[category]}`);

              return (
                <Link
                  key={category}
                  href={isSignedIn ? `/${locale}/pdf-tools?category=${category}` : `/${locale}/sign-in`}
                  className="group"
                >
                  <Card className="p-6 h-full glass-panel border-white/5 hover:bg-white/5 hover:border-[var(--color-brand-red)]/30 transition-all duration-300 group-hover:-translate-y-1">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[var(--color-brand-red)]/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-6 w-6 text-[var(--color-brand-red)]" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[var(--color-brand-red)] transition-colors">
                          {categoryName}
                        </h3>
                        <p className="text-sm text-[#E8D5D5]/60 line-clamp-2 mb-4">
                          {categoryDescription}
                        </p>
                        <div className="flex items-center text-xs font-medium text-[var(--color-brand-red)]">
                          <span className="bg-[var(--color-brand-red)]/10 px-3 py-1 rounded-full text-white">
                            {categoryTools.length} {t('home.categoriesSection.toolsCount', { count: categoryTools.length }).replace(/[0-9]+/g, '')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 border-t border-white/5 bg-[#111111]" aria-label="Statistics">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div className="space-y-2">
            <div className="text-4xl lg:text-5xl font-bold text-white">
              67+
            </div>
            <div className="text-sm font-bold text-[var(--color-brand-red)] uppercase tracking-widest">
              PDF Tools
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl lg:text-5xl font-bold text-white">
              100%
            </div>
            <div className="text-sm font-bold text-[var(--color-brand-red)] uppercase tracking-widest">
              Secure
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl lg:text-5xl font-bold text-white">
              12
            </div>
            <div className="text-sm font-bold text-[var(--color-brand-red)] uppercase tracking-widest">
              Languages
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl lg:text-5xl font-bold text-white">
              0
            </div>
            <div className="text-sm font-bold text-[var(--color-brand-red)] uppercase tracking-widest">
              Server Logs
            </div>
          </div>
        </div>
      </section>

      {/* Unified CTA Section */}
      <section className="py-32 px-6 border-t border-white/10 bg-gradient-to-b from-[#0a0a0a] to-[#111111]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">One simple workflow.</h2>
          <p className="text-[#BEA0A0] text-xl mb-12 max-w-2xl mx-auto">Verify your KRA compliance and manage your documents with professional precision today.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link href={`/${locale}/pricing`} className="btn-primary text-lg px-10 py-5">
              Start Your Free Trial
            </Link>
            <Link href={`/${locale}/about`} className="inline-flex items-center justify-center rounded-xl px-10 py-5 text-lg font-semibold text-white border border-white/20 hover:bg-white/5 transition-all">
              Learn More
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
