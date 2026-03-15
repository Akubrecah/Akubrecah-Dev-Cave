/**
 * Tool category types
 */
export type ToolCategory =
  | 'edit-annotate'
  | 'convert-to-pdf'
  | 'convert-from-pdf'
  | 'organize-manage'
  | 'optimize-repair'
  | 'secure-pdf';

/**
 * All valid tool categories as an array
 */
export const TOOL_CATEGORIES: ToolCategory[] = [
  'edit-annotate',
  'convert-to-pdf',
  'convert-from-pdf',
  'organize-manage',
  'optimize-repair',
  'secure-pdf',
];

/**
 * Category display information
 */
export interface CategoryInfo {
  id: ToolCategory;
  name: string;
  description: string;
  icon: string;
}

/**
 * Category metadata for display
 */
export const CATEGORY_INFO: Record<ToolCategory, CategoryInfo> = {
  'edit-annotate': {
    id: 'edit-annotate',
    name: 'Edit & Annotate',
    description: 'Edit, annotate, and modify PDF content',
    icon: 'Edit3',
  },
  'convert-to-pdf': {
    id: 'convert-to-pdf',
    name: 'Convert to PDF',
    description: 'Convert various formats to PDF',
    icon: 'FilePlus',
  },
  'convert-from-pdf': {
    id: 'convert-from-pdf',
    name: 'Convert from PDF',
    description: 'Convert PDF to other formats',
    icon: 'FileOutput',
  },
  'organize-manage': {
    id: 'organize-manage',
    name: 'Organize & Manage',
    description: 'Organize, merge, split, and manage PDF pages',
    icon: 'FolderSync',
  },
  'optimize-repair': {
    id: 'optimize-repair',
    name: 'Optimize & Repair',
    description: 'Compress, optimize, and repair PDF files',
    icon: 'Zap',
  },
  'secure-pdf': {
    id: 'secure-pdf',
    name: 'Secure PDF',
    description: 'Encrypt, decrypt, and secure PDF files',
    icon: 'ShieldCheck',
  },
};

/**
 * Tool definition interface
 */
export interface Tool {
  id: string;
  slug: string;
  icon: string;
  category: ToolCategory;
  acceptedFormats: string[];
  outputFormat: string;
  maxFileSize: number;
  maxFiles: number;
  features: string[];
  relatedTools: string[];
  disabled?: boolean;
}

/**
 * Processing status
 */
export type ProcessingStatus = 'idle' | 'uploading' | 'processing' | 'complete' | 'error';

/**
 * Processing state
 */
export interface ProcessingState {
  status: ProcessingStatus;
  progress: number;
  currentStep: string;
  error: string | null;
}
