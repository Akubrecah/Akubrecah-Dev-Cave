'use client';

import React from 'react';
import { Scale, ChevronRight } from 'lucide-react';

interface Section {
  id: string;
  title: string;
}

interface LegalSidebarNavProps {
  sections: Section[];
  activeSection: string;
  onScrollToSection: (id: string) => void;
}

export function LegalSidebarNav({
  sections,
  activeSection,
  onScrollToSection,
}: LegalSidebarNavProps) {
  return (
    <div className="glass-panel p-6 border border-white/5 space-y-6">
      <div className="flex items-center gap-3 text-primary">
        <Scale size={18} />
        <span className="text-xs font-black uppercase tracking-widest text-white">Document Index</span>
      </div>

      <nav className="flex flex-col gap-1" aria-label="Document sections">
        {sections.map((section) => {
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => onScrollToSection(section.id)}
              aria-current={isActive ? 'location' : undefined}
              className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-300 ${
                isActive
                  ? 'bg-primary/10 text-primary border-l-2 border-primary shadow-sm shadow-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider truncate pr-2">
                {section.title}
              </span>
              <ChevronRight
                size={14}
                className={`flex-shrink-0 transition-all duration-300 ${
                  isActive ? 'opacity-100 translate-x-0 text-primary' : 'opacity-0 -translate-x-2'
                }`}
              />
            </button>
          );
        })}
      </nav>
    </div>
  );
}
