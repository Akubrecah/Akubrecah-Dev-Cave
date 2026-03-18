'use client';
import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Tool, ToolCategory } from '@/types/tool';
import { Card } from '@/components/ui/Card';
import { ArrowUpRight } from 'lucide-react';
import { getToolIcon } from '@/config/icons';
import { FavoriteButton } from '@/components/ui/FavoriteButton';

export interface ToolCardProps {
  /** Tool data to display */
  tool: Tool;
  /** Current locale for URL generation */
  locale: string;
  /** Optional additional CSS classes */
  className?: string;
  /** Localized content */
  localizedContent?: { title: string; description: string };
}

const categoryTranslationKeys: Record<ToolCategory, string> = {
  'edit-annotate': 'editAnnotate',
  'convert-to-pdf': 'convertToPdf',
  'convert-from-pdf': 'convertFromPdf',
  'organize-manage': 'organizeManage',
  'optimize-repair': 'optimizeRepair',
  'secure-pdf': 'securePdf',
};

/**
 * ToolCard component displays a single PDF tool with icon, name, and description.
 * Includes hover effects and links to the tool page.
 */
export function ToolCard({ tool, locale, className = '', localizedContent }: ToolCardProps) {
  const t = useTranslations();
  const toolUrl = tool.slug.startsWith('/') 
    ? `/${locale}${tool.slug}` 
    : `/${locale}/pdf-tools/${tool.slug}`;

  // Get a human-readable name from the tool ID
  // Use localized title if available, otherwise fallback to formatting the ID
  const toolName = localizedContent?.title || tool.id
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Generate a description from features
  // Use localized description (metaDescription) if available
  const description = localizedContent?.description || tool.features
    .slice(0, 3)
    .map(f => f.replace(/-/g, ' '))
    .join(', ');

  const categoryName = t(`home.categories.${categoryTranslationKeys[tool.category]}`);

  return (
    <Link
      href={toolUrl}
      className={`block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-red)] focus-visible:ring-offset-2 rounded-2xl group ${className}`}
      data-testid="tool-card"
    >
      <div
        className="h-full glass-panel p-8 hover:bg-white/5 transition-all duration-300 hover:shadow-[0_0_30px_rgba(227,6,19,0.15)] hover:border-[var(--color-brand-red)]/50 relative overflow-hidden flex flex-col"
        data-testid="tool-card-container"
      >
        <div className="absolute top-0 right-0 p-3 z-10">
          <FavoriteButton toolId={tool.id} size="sm" />
        </div>
        <div className="absolute top-0 right-10 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ArrowUpRight className="w-5 h-5 text-[var(--color-brand-red)]" />
        </div>

        <div className="flex flex-col h-full">
          <div className="flex items-start gap-4 mb-6">
            {/* Tool Icon */}
            <div
              className="flex-shrink-0 w-14 h-14 rounded-2xl bg-[var(--color-brand-red)]/10 text-[var(--color-brand-red)] flex items-center justify-center group-hover:scale-110 group-hover:bg-[var(--color-brand-red)]/20 transition-all duration-300"
              data-testid="tool-card-icon"
              aria-hidden="true"
            >
              {React.createElement(getToolIcon(tool.icon), {
                className: "w-7 h-7"
              })}
            </div>
          </div>

          {/* Tool Info */}
          <div className="flex-1 min-w-0">
            <h3
              className="text-xl font-bold text-white truncate mb-2 group-hover:text-[var(--color-brand-red)] transition-colors"
              data-testid="tool-card-name"
            >
              {toolName}
            </h3>
            <p
              className="text-[#BEA0A0] text-sm line-clamp-2 leading-relaxed"
              data-testid="tool-card-description"
            >
              {description}
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between text-xs text-[#BEA0A0]">
            <span className="font-semibold bg-white/5 px-3 py-1 rounded-full text-[var(--color-brand-yellow)]">
              {categoryName}
            </span>
            <span className="group-hover:translate-x-1 transition-all duration-300 text-[var(--color-brand-red)] font-bold opacity-0 group-hover:opacity-100 flex items-center gap-1">
              Try now →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}


export default ToolCard;
