"use client";

import React from 'react';
import { useToolStore } from '@/lib/hooks/useToolStore';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export const ProcessingProgress: React.FC = () => {
  const { state } = useToolStore();
  const { status, progress, currentStep, error } = state;

  if (status === 'idle') return null;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 p-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {status === 'processing' && (
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          )}
          {status === 'complete' && (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          )}
          {status === 'error' && (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
          <span className="font-semibold text-gray-900">
            {status === 'processing' ? 'Processing...' : 
             status === 'complete' ? 'Completed' : 
             status === 'error' ? 'Error' : status}
          </span>
        </div>
        <span className="text-sm font-medium text-gray-500">
          {Math.round(progress)}%
        </span>
      </div>

      <div className="relative h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className={`absolute left-0 top-0 h-full rounded-full ${
            status === 'error' ? 'bg-red-500' : 'bg-blue-600'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="space-y-1 text-center">
        <p className="text-sm text-gray-600 font-medium">
          {currentStep || 'Getting things ready...'}
        </p>
        {error && (
          <p className="text-xs text-red-500 mt-2 bg-red-50 p-2 rounded">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};
