'use client';

import React from 'react';

interface MarqueeBannerProps {
  message: string;
  theme?: string;
  speed?: number;
}

const themeStyles: Record<string, string> = {
  crimson: "from-[#E30613] via-[#FF0000] to-[#E30613] border-[#E30613]/20",
  blue: "from-[#0F172A] via-[#1E293B] to-[#0F172A] border-[#3B82F6]/20",
  amber: "from-[#F59E0B] via-[#fbbf24] to-[#F59E0B] border-[#F59E0B]/20",
  green: "from-[#10B981] via-[#34D399] to-[#10B981] border-[#10B981]/20",
  slate: "from-[#020617] via-[#0F172A] to-[#020617] border-white/10",
};

export function MarqueeBanner({ message, theme = 'crimson', speed = 30 }: MarqueeBannerProps) {
  if (!message) return null;

  const styleClass = themeStyles[theme] || themeStyles.crimson;

  return (
    <div className={`fixed top-0 left-0 w-full overflow-hidden bg-gradient-to-r ${styleClass} py-2 border-b shadow-[0_4px_20px_rgba(0,0,0,0.5)] z-[70]`}>
      <div className="flex animate-marquee whitespace-nowrap">
        {/* Triple the items to ensure enough length for any screen size */}
        {[...Array(24)].map((_, i) => (
          <span 
            key={i}
            className="text-[10px] sm:text-xs font-black text-white px-8 uppercase tracking-[0.4em] font-heading flex items-center" 
            style={{ fontFamily: 'var(--font-plus-jakarta), "Plus Jakarta Sans", sans-serif' }}
            dangerouslySetInnerHTML={{ __html: `${message.toUpperCase()} &nbsp; • &nbsp;` }} 
          />
        ))}
        {/* Duplicate the sets for seamless looping */}
        {[...Array(24)].map((_, i) => (
          <span 
            key={`dup-${i}`}
            className="text-[10px] sm:text-xs font-black text-white px-8 uppercase tracking-[0.4em] font-heading flex items-center" 
            style={{ fontFamily: 'var(--font-plus-jakarta), "Plus Jakarta Sans", sans-serif' }}
            dangerouslySetInnerHTML={{ __html: `${message.toUpperCase()} &nbsp; • &nbsp;` }} 
          />
        ))}
      </div>

      <style>{`
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee ${speed}s linear infinite;
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
