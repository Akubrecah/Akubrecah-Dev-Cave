"use client";

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Plus } from 'lucide-react';
import { useToolStore } from '@/lib/hooks/useToolStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FileUploaderProps {
  maxFiles?: number;
  acceptedFormats?: Record<string, string[]>;
  className?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  maxFiles = 10,
  acceptedFormats = { 'application/pdf': ['.pdf'] },
  className,
}) => {
  const { files, addFiles, removeFile, clearFiles } = useToolStore();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    addFiles(acceptedFiles);
  }, [addFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFormats,
    maxFiles: maxFiles - files.length,
    disabled: files.length >= maxFiles,
  });

  return (
    <div className={cn("w-full space-y-4", className)}>
      {files.length === 0 ? (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-xl p-12 transition-all cursor-pointer flex flex-col items-center justify-center gap-4",
            isDragActive ? "border-blue-500 bg-blue-50/50" : "border-gray-200 hover:border-blue-400 hover:bg-gray-50"
          )}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <Upload size={32} />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">
              {isDragActive ? "Drop files here" : "Click or drag files to upload"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Supports PDF files up to 100MB
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((fileObj) => (
              <div
                key={fileObj.id}
                className="relative group border border-gray-200 rounded-lg p-4 flex items-center gap-3 bg-white hover:shadow-sm transition-all"
              >
                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                  <FileText size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {fileObj.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => removeFile(fileObj.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            
            {files.length < maxFiles && (
              <div
                {...getRootProps()}
                className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex items-center justify-center gap-2 hover:border-blue-400 hover:bg-gray-50 transition-all cursor-pointer text-gray-500 hover:text-blue-500"
              >
                <input {...getInputProps()} />
                <Plus size={20} />
                <span className="text-sm font-medium">Add more</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={clearFiles}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              Clear all files
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
