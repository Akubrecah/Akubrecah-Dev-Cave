'use client';

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Tool, ToolCategory, CATEGORY_INFO } from '@/types/tool';
import { ToolCard } from './ToolCard';

export interface ToolGridProps {
  /** Array of tools to display */
  tools: Tool[];
  /** Current locale for URL generation */
  locale: string;
  /** Optional category filter */
  category?: ToolCategory;
  /** Optional search query to filter tools */
  searchQuery?: string;
  /** Whether to show category headers */
  showCategoryHeaders?: boolean;
  /** Optional additional CSS classes */
  className?: string;
  /** localized tool content */
  localizedToolContent?: Record<string, { title: string; description: string }>;
}

/**
 * ToolGrid component displays a responsive grid of tool cards.
 * Supports filtering by category and responsive layout (1-4 columns).
 * 
 * Requirements: 6.1 - Organize tools into 7 categories
 * Requirements: 6.4 - Responsive grid layout adapting to screen sizes
 */
export function ToolGrid({
  tools,
  locale,
  category,
  searchQuery,
  showCategoryHeaders = false,
  className = '',
  localizedToolContent,
}: ToolGridProps) {
  const t = useTranslations();

  const categoryTranslationKeys: Record<ToolCategory, string> = {
    'edit-annotate': 'editAnnotate',
    'convert-to-pdf': 'convertToPdf',
    'convert-from-pdf': 'convertFromPdf',
    'organize-manage': 'organizeManage',
    'optimize-repair': 'optimizeRepair',
    'secure-pdf': 'securePdf',
  };

  // Filter tools by category if specified
  const filteredTools = useMemo(() => {
    let result = tools;

    if (category) {
      result = result.filter(tool => tool.category === category);
    }

    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(tool => {
        // Search in localized content if available
        if (localizedToolContent && localizedToolContent[tool.id]) {
          const { title, description } = localizedToolContent[tool.id];
          if (title.toLowerCase().includes(query) || description.toLowerCase().includes(query)) {
            return true;
          }
        }

        const toolName = tool.id.replace(/-/g, ' ').toLowerCase();
        const features = tool.features.map(f => f.replace(/-/g, ' ').toLowerCase()).join(' ');
        return toolName.includes(query) || features.includes(query);
      });
    }

    return result;
  }, [tools, category, searchQuery, localizedToolContent]);

  // Group tools by category if showing headers
  const groupedTools = useMemo(() => {
    if (!showCategoryHeaders) {
      return null;
    }

    const groups: Record<ToolCategory, Tool[]> = {
      'edit-annotate': [],
      'convert-to-pdf': [],
      'convert-from-pdf': [],
      'organize-manage': [],
      'optimize-repair': [],
      'secure-pdf': [],
    };

    for (const tool of filteredTools) {
      groups[tool.category].push(tool);
    }

    return groups;
  }, [filteredTools, showCategoryHeaders]);

  if (filteredTools.length === 0) {
    return (
      <div
        className={`text-center py-24 glass-panel ${className}`}
        data-testid="tool-grid-empty"
      >
        <p className="text-[#BEA0A0] text-lg">
          No tools found for your search
        </p>
      </div>
    );
  }

  // Render grouped by category
  if (showCategoryHeaders && groupedTools) {
    return (
      <div className={`space-y-16 ${className}`} data-testid="tool-grid">
        {(Object.entries(groupedTools) as [ToolCategory, Tool[]][]).map(([cat, categoryTools]) => {
          if (categoryTools.length === 0) return null;

          const categoryInfo = CATEGORY_INFO[cat];
          const categoryName = t(`home.categories.${categoryTranslationKeys[cat]}`);

          return (
            <div key={cat} className="animate-in fade-in slide-in-from-bottom-4 duration-700" data-testid={`tool-grid-category-${cat}`}>
              <div className="mb-8 border-l-4 border-[var(--color-brand-red)] pl-6">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {categoryName}
                </h2>
                <p className="text-[#BEA0A0] text-lg">
                  {categoryInfo.description}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categoryTools.map(tool => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    locale={locale}
                    localizedContent={localizedToolContent?.[tool.id]}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Render flat grid
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}
      data-testid="tool-grid"
    >
      {filteredTools.map(tool => (
        <ToolCard
          key={tool.id}
          tool={tool}
          locale={locale}
          localizedContent={localizedToolContent?.[tool.id]}
        />
      ))}
    </div>
  );
}


export default ToolGrid;
