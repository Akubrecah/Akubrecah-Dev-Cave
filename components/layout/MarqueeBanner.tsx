'use client';

import React from 'react';

interface MarqueeBannerProps {
  message: string;
  theme?: string;
}

const themeStyles: Record<string, string> = {
  purple: "from-[#7C3AED] via-[#3B82F6] to-[#7C3AED] border-[#7C3AED]/20",
  blue: "from-[#3B82F6] via-[#22D3EE] to-[#3B82F6] border-[#3B82F6]/20",
  green: "from-[#10B981] via-[#34D399] to-[#10B981] border-[#10B981]/20",
  pink: "from-[#EC4899] via-[#F472B6] to-[#EC4899] border-[#EC4899]/20",
  gold: "from-[#F5C200] via-[#FFD700] to-[#F5C200] border-[#F5C200]/20",
};

export function MarqueeBanner({ message, theme = 'purple' }: MarqueeBannerProps) {
  if (!message) return null;

  const styleClass = themeStyles[theme] || themeStyles.purple;

  return (
    <div className={`relative w-full overflow-hidden bg-gradient-to-r ${styleClass} py-2 border-b shadow-lg z-[60]`}>
      <div className="flex animate-marquee whitespace-nowrap">
        {[...Array(8)].map((_, i) => (
          <span 
            key={i}
            className="text-[10px] sm:text-xs font-black text-white px-4 uppercase tracking-[0.3em] font-heading" 
            style={{ fontFamily: 'Outfit, sans-serif' }}
            dangerouslySetInnerHTML={{ __html: message }} 
          />
        ))}
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
