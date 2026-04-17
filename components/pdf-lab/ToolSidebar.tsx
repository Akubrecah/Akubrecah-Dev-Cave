'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { PDF_TOOLS as tools } from '@/config/pdf-tools';
import { getToolContent } from '@/config/pdf-tool-content';
import { ToolNodeData } from '@/types/workflow';
import * as LucideIcons from 'lucide-react';
import { Search, ChevronDown, ChevronRight, GripVertical, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Locale } from '@/lib/i18n/config';

interface ToolSidebarProps {
    onDragStart: (event: React.DragEvent, nodeData: ToolNodeData) => void;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

interface CategoryGroup {
    id: string;
    name: string;
    icon: string;
    tools: typeof tools;
}

/**
 * Tool Sidebar for the workflow editor
 * Displays available tools grouped by category
 */

// Format tool ID to human readable name
const formatToolId = (id: string): string => {
    return id
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

// Tools that require interactive UI and should be excluded from workflow
const INTERACTIVE_TOOLS_BLACKLIST = new Set([
    'pdf-multi-tool',
    'edit-pdf',
    'sign-pdf',
    'crop-pdf',
    'bookmark',
    'add-stamps',
    'form-filler',
    'form-creator',
    'rotate-custom',
    'view-metadata',
    'compare-pdfs',
    'add-attachments',
    'edit-attachments',
    'page-dimensions',
    'validate-signature',
    'pdf-to-docx',
    'pdf-to-pptx',
    'pdf-to-excel'
]);

const CATEGORY_ORDER = [
    'organize-manage',
    'edit-annotate',
    'convert-to-pdf',
    'convert-from-pdf',
    'optimize-repair',
    'secure-pdf',
];

const CATEGORY_NAMES: Record<string, string> = {
    'organize-manage': 'Organize & Manage',
    'edit-annotate': 'Edit & Annotate',
    'convert-to-pdf': 'Convert to PDF',
    'convert-from-pdf': 'Convert from PDF',
    'optimize-repair': 'Optimize & Repair',
    'secure-pdf': 'Security & Privacy',
};

const CATEGORY_ICONS: Record<string, string> = {
    'organize-manage': 'files',
    'edit-annotate': 'pencil',
    'convert-to-pdf': 'file-up',
    'convert-from-pdf': 'file-down',
    'optimize-repair': 'zap',
    'secure-pdf': 'shield',
};

// Get icon component dynamically helper moved outside
const getIconByName = (iconName: string) => {
    const pascalName = iconName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (LucideIcons as any)[pascalName] || LucideIcons.FileText;
};

export function ToolSidebar({ onDragStart, isCollapsed = false, onToggleCollapse }: ToolSidebarProps) {
    const tWorkflow = useTranslations('workflow');
    const locale = useLocale() as Locale;

    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
        new Set(['organize-manage', 'convert-to-pdf'])
    );

    // Helper function to get tool name with fallback using getToolContent
    const getToolName = React.useCallback((toolId: string): string => {
        const content = getToolContent(locale, toolId);
        if (content && content.title) {
            return content.title;
        }
        return formatToolId(toolId);
    }, [locale]);

    // Group tools by category
    const categories: CategoryGroup[] = useMemo(() => {
        const categoryMap: Record<string, typeof tools> = {};

        tools
            .filter(tool => !INTERACTIVE_TOOLS_BLACKLIST.has(tool.id))
            .forEach(tool => {
                if (!categoryMap[tool.category]) {
                    categoryMap[tool.category] = [];
                }
                categoryMap[tool.category].push(tool);
            });

        return CATEGORY_ORDER
            .filter(cat => categoryMap[cat])
            .map(cat => ({
                id: cat,
                name: CATEGORY_NAMES[cat] || cat,
                icon: CATEGORY_ICONS[cat] || 'file-text',
                tools: categoryMap[cat],
            }));
    }, []);

    // Filter tools based on search query
    const filteredCategories = useMemo((): CategoryGroup[] => {
        if (!searchQuery.trim()) return categories;

        const query = searchQuery.toLowerCase();
        return categories
            .map(cat => ({
                ...cat,
                tools: cat.tools.filter(tool => {
                    const translatedName = getToolName(tool.id);
                    return (
                        tool.id.toLowerCase().includes(query) ||
                        translatedName.toLowerCase().includes(query)
                    );
                }),
            }))
            .filter(cat => cat.tools.length > 0);
    }, [categories, searchQuery, getToolName]);

    const toggleCategory = (categoryId: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(categoryId)) {
                next.delete(categoryId);
            } else {
                next.add(categoryId);
            }
            return next;
        });
    };

    const handleDragStart = (e: React.DragEvent, tool: typeof tools[0]) => {
        const nodeData: ToolNodeData = {
            toolId: tool.id,
            label: getToolName(tool.id),
            icon: tool.icon,
            category: tool.category,
            acceptedFormats: tool.acceptedFormats,
            outputFormat: tool.outputFormat,
            status: 'idle',
            progress: 0,
        };
        onDragStart(e, nodeData);
    };


    // Collapsed view
    if (isCollapsed) {
        return (
            <div className="w-12 h-full bg-[hsl(var(--color-background))] border-r border-[hsl(var(--color-border))] flex flex-col items-center py-2">
                <button
                    onClick={onToggleCollapse}
                    className="p-2 rounded-lg hover:bg-[hsl(var(--color-muted))] transition-colors mb-2"
                    title={tWorkflow('toolbox') || 'Toolbox'}
                >
                    <PanelLeftOpen className="w-5 h-5 text-[hsl(var(--color-primary))]" />
                </button>
                <div className="w-8 h-px bg-[hsl(var(--color-border))] mb-2" />
                {/* Show category icons when collapsed */}
                {categories.slice(0, 6).map(category => {
                    const CategoryIcon = getIconByName(category.icon);
                    return (
                        <button
                            key={category.id}
                            onClick={onToggleCollapse}
                            className="p-2 rounded-lg hover:bg-[hsl(var(--color-muted))] transition-colors mb-1"
                            title={category.name}
                        >
                            <CategoryIcon className="w-4 h-4 text-[hsl(var(--color-muted-foreground))]" />
                        </button>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="w-72 h-full bg-[hsl(var(--color-background))] border-r border-[hsl(var(--color-border))] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-[hsl(var(--color-border))] flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-[hsl(var(--color-foreground))]">
                        {tWorkflow('toolbox') || 'Tool Box'}
                    </h2>
                    <p className="text-xs text-[hsl(var(--color-muted-foreground))] mt-1">
                        {tWorkflow('dragToAdd') || 'Drag tools to add to workflow'}
                    </p>
                </div>
                <button
                    onClick={onToggleCollapse}
                    className="p-1.5 rounded-lg hover:bg-[hsl(var(--color-muted))] transition-colors"
                    title="Collapse sidebar"
                >
                    <PanelLeftClose className="w-4 h-4 text-[hsl(var(--color-muted-foreground))]" />
                </button>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-[hsl(var(--color-border))]">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--color-muted-foreground))]" />
                    <input
                        type="text"
                        placeholder={tWorkflow('searchTools') || 'Search tools...'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] text-[hsl(var(--color-foreground))] placeholder:text-[hsl(var(--color-muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))]"
                    />
                </div>
            </div>

            {/* Tools List */}
            <div className="flex-1 overflow-y-auto">
                {filteredCategories.map(category => {
                    const isExpanded = expandedCategories.has(category.id);
                    const CategoryIcon = getIconByName(category.icon);

                    return (
                        <div key={category.id} className="border-b border-[hsl(var(--color-border))]">
                            {/* Category Header */}
                            <button
                                onClick={() => toggleCategory(category.id)}
                                className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-[hsl(var(--color-muted)/0.5)] transition-colors"
                            >
                                {isExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-[hsl(var(--color-muted-foreground))]" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 text-[hsl(var(--color-muted-foreground))]" />
                                )}
                                <CategoryIcon className="w-4 h-4 text-[hsl(var(--color-primary))]" />
                                <span className="text-sm font-medium text-[hsl(var(--color-foreground))]">
                                    {category.name}
                                </span>
                                <span className="ml-auto text-xs text-[hsl(var(--color-muted-foreground))]">
                                    {category.tools.length}
                                </span>
                            </button>

                            {/* Tools in Category */}
                            {isExpanded && (
                                <div className="pb-2">
                                    {category.tools.map(tool => {
                                        const ToolIcon = getIconByName(tool.icon);

                                        return (
                                            <div
                                                key={tool.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, tool)}
                                                className="flex items-center gap-2 px-4 py-2 mx-2 rounded-md cursor-grab hover:bg-[hsl(var(--color-muted))] active:cursor-grabbing transition-colors group"
                                            >
                                                <GripVertical className="w-3 h-3 text-[hsl(var(--color-muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <ToolIcon className="w-4 h-4 text-[hsl(var(--color-muted-foreground))]" />
                                                <span className="text-sm text-[hsl(var(--color-foreground))] truncate flex-1">
                                                    {getToolName(tool.id)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-[hsl(var(--color-border))] bg-[hsl(var(--color-muted)/0.3)]">
                <p className="text-xs text-center text-[hsl(var(--color-muted-foreground))]">
                    {tools.length} {tWorkflow('toolsAvailable') || 'tools available'}
                </p>
            </div>
        </div>
    );
}

export default ToolSidebar;
