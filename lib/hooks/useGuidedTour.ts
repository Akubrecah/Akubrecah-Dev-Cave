/**
 * useGuidedTour Hook
 * Requirements: 10.5
 * 
 * React hook for managing guided tour state for first-time users
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

export interface TourStep {
  id: string;
  target: string; // CSS selector for the target element
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  highlightPadding?: number;
}

const TOUR_COMPLETED_KEY = 'pdfcraft_tour_completed';
const TOUR_DISMISSED_KEY = 'pdfcraft_tour_dismissed';

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export interface UseGuidedTourReturn {
  isActive: boolean;
  currentStep: number;
  currentStepData: TourStep | null;
  totalSteps: number;
  isFirstVisit: boolean;
  
  // Actions
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  endTour: () => void;
  dismissTour: () => void;
  resetTour: () => void;
}

export function useGuidedTour(steps: TourStep[]): UseGuidedTourReturn {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isFirstVisit, setIsFirstVisit] = useState(() => {
    if (typeof window === 'undefined') return false;
    const completed = window.localStorage.getItem('pdfcraft_tour_completed');
    const dismissed = window.localStorage.getItem('pdfcraft_tour_dismissed');
    return !completed && !dismissed;
  });


  // Logic moved to lazy initializer
  useEffect(() => {
    // Keep effect if any other mount logic is needed, otherwise can be removed
  }, []);


  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Tour completed
      setIsActive(false);
      if (isLocalStorageAvailable()) {
        localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
      }
      setIsFirstVisit(false);
    }
  }, [currentStep, steps.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
    }
  }, [steps.length]);

  const endTour = useCallback(() => {
    setIsActive(false);
    if (isLocalStorageAvailable()) {
      localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
    }
    setIsFirstVisit(false);
  }, []);

  const dismissTour = useCallback(() => {
    setIsActive(false);
    if (isLocalStorageAvailable()) {
      localStorage.setItem(TOUR_DISMISSED_KEY, 'true');
    }
    setIsFirstVisit(false);
  }, []);

  const resetTour = useCallback(() => {
    if (isLocalStorageAvailable()) {
      localStorage.removeItem(TOUR_COMPLETED_KEY);
      localStorage.removeItem(TOUR_DISMISSED_KEY);
    }
    setIsFirstVisit(true);
    setCurrentStep(0);
    setIsActive(false);
  }, []);

  const currentStepData = steps[currentStep] || null;

  return {
    isActive,
    currentStep,
    currentStepData,
    totalSteps: steps.length,
    isFirstVisit,
    startTour,
    nextStep,
    prevStep,
    goToStep,
    endTour,
    dismissTour,
    resetTour,
  };
}
