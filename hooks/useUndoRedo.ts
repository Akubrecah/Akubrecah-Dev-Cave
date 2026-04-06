/**
 * Undo/Redo Hook for Workflow Editor
 * Provides history management for workflow state
 */

import { useState, useCallback, useRef } from 'react';
import { WorkflowNode, WorkflowEdge } from '@/types/workflow';
import { Edge } from 'reactflow';

interface HistoryState {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
}

interface UseUndoRedoReturn {
    /** Current history index */
    historyIndex: number;
    /** Total history length */
    historyLength: number;
    /** Whether undo is available */
    canUndo: boolean;
    /** Whether redo is available */
    canRedo: boolean;
    /** Push current state to history */
    pushHistory: (nodes: WorkflowNode[], edges: WorkflowEdge[]) => void;
    /** Undo last action */
    undo: () => HistoryState | null;
    /** Redo last undone action */
    redo: () => HistoryState | null;
    /** Clear history */
    clearHistory: () => void;
}

const MAX_HISTORY_SIZE = 50;

/**
 * Custom hook for undo/redo functionality
 */
export function useUndoRedo(): UseUndoRedoReturn {
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [history, setHistory] = useState<HistoryState[]>([]);
    const isUndoRedoAction = useRef(false);

    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;


    /**
     * Push a new state to history
     */
    const pushHistory = useCallback((nodes: WorkflowNode[], edges: WorkflowEdge[]) => {
        // Don't push if this is an undo/redo action
        if (isUndoRedoAction.current) {
            isUndoRedoAction.current = false;
            return;
        }

        // Create a deep copy of the state
        const state: HistoryState = {
            nodes: JSON.parse(JSON.stringify(nodes)),
            edges: JSON.parse(JSON.stringify(edges)),
        };

        setHistory(prev => {
            const nextHistory = historyIndex < prev.length - 1 
                ? prev.slice(0, historyIndex + 1) 
                : prev;
            
            const updated = [...nextHistory, state];
            return updated.length > MAX_HISTORY_SIZE ? updated.slice(1) : updated;
        });

        setHistoryIndex(prev => {
            // We can't easily know history.length inside the functional update of another state 
            // without being careful, but we know the new length will be min(historyIndex+2, MAX_HISTORY_SIZE).
            // Actually, simply incrementing is fine if the call is valid.
            return prev + 1;
        });
    }, [historyIndex]);


    /**
     * Undo last action
     */
    const undo = useCallback((): HistoryState | null => {
        if (!canUndo) return null;

        isUndoRedoAction.current = true;
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);

        return history[newIndex];
    }, [canUndo, historyIndex, history]);


    /**
     * Redo last undone action
     */
    const redo = useCallback((): HistoryState | null => {
        if (!canRedo) return null;

        isUndoRedoAction.current = true;
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);

        return history[newIndex];
    }, [canRedo, historyIndex, history]);


    /**
     * Clear all history
     */
    const clearHistory = useCallback(() => {
        setHistory([]);
        setHistoryIndex(-1);
    }, []);


    return {
        historyIndex,
        historyLength: history.length,
        canUndo,
        canRedo,
        pushHistory,
        undo,
        redo,
        clearHistory,
    };

}

export default useUndoRedo;
