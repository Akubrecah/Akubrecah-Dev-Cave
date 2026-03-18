'use client';

import React, { useMemo, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

export type ProcessingStatus = 'idle' | 'uploading' | 'processing' | 'complete' | 'error';

export interface ProcessingProgressProps {
  /** Current progress (0-100) */
  progress: number;
  /** Current processing status */
  status: ProcessingStatus;
  /** Current step message */
  message?: string;
  /** Estimated time remaining in seconds */
  estimatedTime?: number;
  /** Custom class name */
  className?: string;
  /** Show percentage text */
  showPercentage?: boolean;
  /** Show estimated time */
  showEstimatedTime?: boolean;
  /** Callback when cancel is clicked */
  onCancel?: () => void;
}

/**
 * ProcessingProgress Component
 * Requirements: 5.3
 * 
 * Displays progress bar with current step and estimated time.
 */
export const ProcessingProgress: React.FC<ProcessingProgressProps> = ({
  progress,
  status,
  message,
  estimatedTime,
  className = '',
  showPercentage = true,
  showEstimatedTime = true,
  onCancel,
}) => {
  const t = useTranslations('common');

  // Clamp progress between 0 and 100
  const clampedProgress = Math.max(0, Math.min(100, progress));

  // Format estimated time
  const formattedTime = useMemo(() => {
    if (!estimatedTime || estimatedTime <= 0) return null;
    
    if (estimatedTime < 60) {
      return `${Math.ceil(estimatedTime)}s remaining`;
    }
    
    const minutes = Math.floor(estimatedTime / 60);
    const seconds = Math.ceil(estimatedTime % 60);
    
    if (minutes < 60) {
      return `${minutes}m ${seconds}s remaining`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m remaining`;
  }, [estimatedTime]);

  // Get status text
  const statusText = useMemo(() => {
    switch (status) {
      case 'idle':
        return t('status.idle');
      case 'uploading':
        return t('status.uploading');
      case 'processing':
        return t('status.processing');
      case 'complete':
        return t('status.complete');
      case 'error':
        return t('status.error');
      default:
        return '';
    }
  }, [status, t]);

  // Get progress bar color based on status
  const progressBarColor = useMemo(() => {
    switch (status) {
      case 'complete':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'uploading':
      case 'processing':
        return 'bg-[hsl(var(--color-primary))]';
      default:
        return 'bg-[hsl(var(--color-muted))]';
    }
  }, [status]);

  // Determine if we should show the cancel button
  const showCancel = onCancel && (status === 'uploading' || status === 'processing');

  // Track previous status for announcements
  const prevStatusRef = useRef(status);
  const announcementRef = useRef<string>('');

  // Update announcement when status changes
  useEffect(() => {
    if (prevStatusRef.current !== status) {
      if (status === 'complete') {
        announcementRef.current = `${statusText}. ${message || ''}`;
      } else if (status === 'error') {
        announcementRef.current = `${statusText}. ${message || ''}`;
      } else if (status === 'processing' || status === 'uploading') {
        announcementRef.current = statusText;
      }
      prevStatusRef.current = status;
    }
  }, [status, statusText, message]);

  // Don't render if idle
  if (status === 'idle') {
    return null;
  }

  return (
    <div
      className={`w-full ${className}`.trim()}
      role="progressbar"
      aria-valuenow={clampedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${statusText}: ${clampedProgress}%`}
    >
      {/* Screen reader announcement for status changes */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {announcementRef.current}
      </div>
      {/* Status and percentage header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Status indicator */}
          {(status === 'uploading' || status === 'processing') && (
            <div className="relative">
              <div className="w-5 h-5 rounded-full bg-[var(--color-brand-red)]/20" />
              <div className="absolute inset-0 w-5 h-5 rounded-full bg-[var(--color-brand-red)] animate-ping opacity-40" />
              <div className="absolute inset-1.5 w-2 h-2 rounded-full bg-[var(--color-brand-red)] shadow-[0_0_10px_var(--color-brand-red)]" />
            </div>
          )}
          {status === 'complete' && (
             <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
               <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
               </svg>
             </div>
          )}
          {status === 'error' && (
             <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
               <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
               </svg>
             </div>
          )}
          
          {/* Status text */}
          <span className="text-base font-bold text-white tracking-tight uppercase">
            {statusText}
          </span>
        </div>

        {/* Percentage */}
        {showPercentage && (
          <span className="text-2xl font-black text-[var(--color-brand-yellow)] tabular-nums">
            {Math.round(clampedProgress)}<span className="text-xs ml-0.5 opacity-60">%</span>
          </span>
        )}
      </div>

      {/* Progress bar container */}
      <div className="relative w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
        <div
          className={`absolute left-0.5 top-0.5 h-[calc(100%-4px)] transition-all duration-700 ease-out rounded-full ${status === 'complete' ? 'bg-green-500' : status === 'error' ? 'bg-red-500' : 'bg-gradient-to-r from-[var(--color-brand-crimson)] to-[var(--color-brand-red)] shadow-[0_0_15px_rgba(227,6,19,0.5)]'}`}
          style={{ width: `calc(${clampedProgress}% - 4px)` }}
        />
        
        {/* Animated shimmer for active states */}
        {(status === 'uploading' || status === 'processing') && clampedProgress < 100 && (
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent motion-safe:animate-shimmer"
            style={{ width: `${clampedProgress}%` }}
          />
        )}
      </div>


      {/* Message and estimated time */}
      <div className="flex items-center justify-between mt-2">
        {/* Current step message */}
        <p className="text-sm text-[hsl(var(--color-muted-foreground))] truncate flex-1">
          {message || ''}
        </p>

        {/* Estimated time */}
        {showEstimatedTime && formattedTime && (status === 'uploading' || status === 'processing') && (
          <span className="text-xs text-[hsl(var(--color-muted-foreground))] ml-4 whitespace-nowrap">
            {formattedTime}
          </span>
        )}
      </div>

      {/* Cancel button */}
      {showCancel && (
        <div className="mt-3">
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-foreground))] transition-colors"
            aria-label={t('buttons.cancel')}
          >
            {t('buttons.cancel')}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProcessingProgress;
