import { create } from 'zustand';
import { ProcessingStatus, ProcessingState } from '@/types/tool';
import { UploadedFile, PDFError } from '@/types/pdf';

interface ToolStore {
  files: UploadedFile[];
  state: ProcessingState;
  
  // Actions
  setFiles: (files: File[]) => void;
  addFiles: (files: File[]) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  
  updateFileStatus: (id: string, status: UploadedFile['status'], error?: PDFError) => void;
  
  setProcessingStatus: (status: ProcessingStatus) => void;
  updateProgress: (progress: number, step?: string) => void;
  setError: (error: string | null) => void;
  resetState: () => void;
}

export const useToolStore = create<ToolStore>((set) => ({
  files: [],
  state: {
    status: 'idle',
    progress: 0,
    currentStep: '',
    error: null,
  },

  setFiles: (newFiles) => set({
    files: newFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      status: 'pending',
    }))
  }),

  addFiles: (newFiles) => set((state) => ({
    files: [
      ...state.files,
      ...newFiles.map(file => ({
        id: Math.random().toString(36).substring(7),
        file,
        status: 'pending' as const,
      }))
    ]
  })),

  removeFile: (id) => set((state) => ({
    files: state.files.filter(f => f.id !== id)
  })),

  clearFiles: () => set({ files: [] }),

  updateFileStatus: (id, status, error) => set((state) => ({
    files: state.files.map(f => f.id === id ? { ...f, status, error } : f)
  })),

  setProcessingStatus: (status) => set((state) => ({
    state: { ...state.state, status }
  })),

  updateProgress: (progress, step) => set((state) => ({
    state: { 
      ...state.state, 
      progress, 
      currentStep: step || state.state.currentStep 
    }
  })),

  setError: (error) => set((state) => ({
    state: { ...state.state, status: error ? 'error' : state.state.status, error }
  })),

  resetState: () => set({
    files: [],
    state: {
      status: 'idle',
      progress: 0,
      currentStep: '',
      error: null,
    }
  }),
}));
