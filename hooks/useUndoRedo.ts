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

interface HistoryWrapper {
    history: HistoryState[];
    index: number;
}

/**
 * Custom hook for undo/redo functionality
 */
export function useUndoRedo(): UseUndoRedoReturn {
    const [state, setState] = useState<HistoryWrapper>({
        history: [],
        index: -1,
    });
    
    const isUndoRedoAction = useRef(false);

    const canUndo = state.index > 0;
    const canRedo = state.index < state.history.length - 1;

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
        const newState: HistoryState = {
            nodes: JSON.parse(JSON.stringify(nodes)),
            edges: JSON.parse(JSON.stringify(edges)),
        };

        setState(prev => {
            const nextHistory = prev.index < prev.history.length - 1 
                ? prev.history.slice(0, prev.index + 1) 
                : prev.history;
            
            const updatedHistory = [...nextHistory, newState];
            const finalHistory = updatedHistory.length > MAX_HISTORY_SIZE ? updatedHistory.slice(1) : updatedHistory;
            
            return {
                history: finalHistory,
                index: updatedHistory.length > MAX_HISTORY_SIZE ? MAX_HISTORY_SIZE - 1 : updatedHistory.length - 1,
            };
        });
    }, []);

    /**
     * Undo last action
     */
    const undo = useCallback((): HistoryState | null => {
        let result: HistoryState | null = null;
        
        setState(prev => {
            if (prev.index <= 0) return prev;
            
            isUndoRedoAction.current = true;
            const newIndex = prev.index - 1;
            result = prev.history[newIndex];
            
            return { ...prev, index: newIndex };
        });
        
        return result;
    }, []);

    /**
     * Redo last undone action
     */
    const redo = useCallback((): HistoryState | null => {
        let result: HistoryState | null = null;
        
        setState(prev => {
            if (prev.index >= prev.history.length - 1) return prev;
            
            isUndoRedoAction.current = true;
            const newIndex = prev.index + 1;
            result = prev.history[newIndex];
            
            return { ...prev, index: newIndex };
        });
        
        return result;
    }, []);

    /**
     * Clear all history
     */
    const clearHistory = useCallback(() => {
        setState({
            history: [],
            index: -1,
        });
    }, []);

    return {
        historyIndex: state.index,
        historyLength: state.history.length,
        canUndo,
        canRedo,
        pushHistory,
        undo,
        redo,
        clearHistory,
    };
}

export default useUndoRedo;
