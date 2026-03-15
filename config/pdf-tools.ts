import { Tool } from '@/types/tool';

export const PDF_TOOLS: Tool[] = [
  {
    id: 'merge-pdf',
    slug: 'merge-pdf',
    icon: 'FolderSync',
    category: 'organize-manage',
    acceptedFormats: ['.pdf'],
    outputFormat: 'pdf',
    maxFileSize: 100 * 1024 * 1024,
    maxFiles: 20,
    features: ['Combine multiple PDF files', 'Maintain original formatting', 'Drag & drop ordering'],
    relatedTools: ['split-pdf', 'compress-pdf'],
  },
  {
    id: 'split-pdf',
    slug: 'split-pdf',
    icon: 'Scissors',
    category: 'organize-manage',
    acceptedFormats: ['.pdf'],
    outputFormat: 'pdf',
    maxFileSize: 100 * 1024 * 1024,
    maxFiles: 1,
    features: ['Extract specific pages', 'Split into separate files', 'Visual page selection'],
    relatedTools: ['merge-pdf', 'organize-pdf'],
  },
  // Add more tools as needed
];
