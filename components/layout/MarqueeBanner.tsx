'use client';

import React from 'react';

interface MarqueeBannerProps {
  message: string;
}

export function MarqueeBanner({ message }: MarqueeBannerProps) {
  if (!message) return null;

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 py-2 border-b border-emerald-400/20 shadow-lg z-[60]">
      <div className="flex animate-marquee whitespace-nowrap">
        <span className="text-xs sm:text-sm font-black text-white px-4 uppercase tracking-[0.2em]" dangerouslySetInnerHTML={{ __html: message }} />
        <span className="text-xs sm:text-sm font-black text-white px-4 uppercase tracking-[0.2em]" dangerouslySetInnerHTML={{ __html: message }} />
        <span className="text-xs sm:text-sm font-black text-white px-4 uppercase tracking-[0.2em]" dangerouslySetInnerHTML={{ __html: message }} />
        <span className="text-xs sm:text-sm font-black text-white px-4 uppercase tracking-[0.2em]" dangerouslySetInnerHTML={{ __html: message }} />
        <span className="text-xs sm:text-sm font-black text-white px-4 uppercase tracking-[0.2em]" dangerouslySetInnerHTML={{ __html: message }} />
        <span className="text-xs sm:text-sm font-black text-white px-4 uppercase tracking-[0.2em]" dangerouslySetInnerHTML={{ __html: message }} />
        <span className="text-xs sm:text-sm font-black text-white px-4 uppercase tracking-[0.2em]" dangerouslySetInnerHTML={{ __html: message }} />
        <span className="text-xs sm:text-sm font-black text-white px-4 uppercase tracking-[0.2em]" dangerouslySetInnerHTML={{ __html: message }} />
      </div>

      <style jsx>{`
        .animate-marquee {
          display: flex;
          width: fit-content;
          animation: marquee 30s linear infinite;
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
