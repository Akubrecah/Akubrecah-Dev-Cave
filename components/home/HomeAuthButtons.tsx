'use client';

import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { Search, ArrowRight, FileText } from 'lucide-react';
import { Locale } from '@/lib/i18n/config';

interface HomeAuthButtonsProps {
  locale: Locale;
}

export function HomeAuthButtons({ locale }: HomeAuthButtonsProps) {
  const { isSignedIn } = useAuth();

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <div className="flex flex-col gap-2 w-full sm:w-auto">
        <Link 
          href={isSignedIn ? `/${locale}/dashboard` : `/${locale}/sign-in`} 
          className="btn-primary text-base px-8 py-4 flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(31,111,91,0.3)]"
        >
          <Search size={20} /> Verify KRA PIN <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
        <p className="text-[10px] text-white/40 text-center uppercase tracking-widest font-bold">
          Free Daily Lookups • Secure
        </p>
      </div>
      <Link 
        href={`/${locale}/pdf-tools`} 
        className="inline-flex items-center justify-center rounded-xl px-8 py-4 text-base font-semibold tracking-wide text-white bg-white/5 border border-white/20 hover:bg-white/10 hover:border-white/40 transition-all duration-300 gap-2 w-full sm:w-auto"
      >
        <FileText size={20} /> Explore 88+ PDF Tools
      </Link>
    </div>
  );
}

export function HomeAuthCTA({ locale }: HomeAuthButtonsProps) {
  const { isSignedIn } = useAuth();

  return (
    <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
      <Link 
        href={isSignedIn ? `/${locale}/dashboard` : `/${locale}/sign-in`} 
        className="btn-primary text-base sm:text-xl px-8 sm:px-12 py-4 sm:py-5 flex items-center justify-center gap-3 group shadow-[0_0_20px_rgba(31,111,91,0.3)]"
      >
        Get Started Free <ArrowRight className="group-hover:translate-x-2 transition-transform" />
      </Link>
      <Link 
        href={`/${locale}/pdf-tools`} 
        className="inline-flex items-center justify-center rounded-xl px-8 sm:px-12 py-4 sm:py-5 text-base sm:text-xl font-semibold text-white border border-white/20 hover:bg-white/10 transition-all backdrop-blur-md"
      >
        Browse Tools
      </Link>
    </div>
  );
}
