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
  const toolUrl = `/${locale}/pdf-tools/${tool.slug}`;

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

  const IconComponent = getToolIcon(tool.icon);

  const categoryName = t(`home.categories.${categoryTranslationKeys[tool.category]}`);

  return (
    <Link
      href={toolUrl}
      className={`block focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-ring))] focus-visible:ring-offset-2 rounded-[var(--radius-lg)] group ${className}`}
      data-testid="tool-card"
    >
      <Card
        className="h-full glass-panel hover:border-[var(--color-brand-red)] transition-all duration-500 hover:shadow-[0_0_20px_rgba(31,111,91,0.3)] hover:-translate-y-1 relative overflow-hidden border-white/10 rounded-3xl bg-[#0a0a0a]"
        data-testid="tool-card-container"
      >
        <div className="absolute top-0 right-0 p-3 z-10">
          <FavoriteButton toolId={tool.id} size="sm" />
        </div>
        <div className="absolute top-0 right-10 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ArrowUpRight className="w-5 h-5 text-[var(--color-brand-red)]" />
        </div>

        <div className="flex flex-col h-full">
          <div className="flex items-start gap-4 mb-4">
            {/* Tool Icon */}
            <div
              className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500"
              data-testid="tool-card-icon"
              aria-hidden="true"
            >
              <IconComponent className="w-7 h-7 text-[var(--color-brand-red)]" />
            </div>
          </div>

          {/* Tool Info */}
          <div className="flex-1 min-w-0">
            <h3
              className="text-lg font-bold text-white truncate mb-2 group-hover:text-[var(--color-brand-red)] transition-colors"
              data-testid="tool-card-name"
            >
              {toolName}
            </h3>
            <p
              className="text-sm text-[#E8D5D5]/70 line-clamp-2 leading-relaxed"
              data-testid="tool-card-description"
            >
              {description}
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#E8D5D5]/70">
            <span className="font-bold bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-white">
              {categoryName}
            </span>
            <span className="group-hover:translate-x-1 transition-transform duration-300 text-[var(--color-brand-red)] font-bold opacity-0 group-hover:opacity-100">
              {t('common.buttons.next') || 'Try now'} {/* Using Next as dummy or keep Try now if no key */}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default ToolCard;
