import { useState, useCallback, useRef } from 'react';
import { useToast } from '../contexts/ToastContext';

/**
 * useUndo - ONDA 2.3 PRD
 * Sistema de undo com timeout de 10 segundos
 * Para: deletar, reagendar, alterar status
 */

export function useUndo(options = {}) {
    const { 
        timeout = 10000,  // 10 segundos padrão
        onUndo,
        onCommit 
    } = options;
    
    const { addToast } = useToast();
    const [pendingAction, setPendingAction] = useState(null);
    const timeoutRef = useRef(null);

    // Executa ação com possibilidade de undo
    const executeWithUndo = useCallback(({ 
        action, 
        undoAction, 
        description,
        type = 'info'
    }) => {
        // Cancela timeout anterior se existir
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            // Commita ação anterior
            if (pendingAction?.commit) {
                pendingAction.commit();
            }
        }

        // Executa a ação imediatamente
        action();

        // Guarda ação pendente
        const pending = {
            undoAction,
            description,
            commit: onCommit,
            executedAt: Date.now()
        };
        setPendingAction(pending);

        // Toast com botão de undo
        addToast({
            title: description,
            description: 'Clique para desfazer',
            type,
            duration: timeout,
            action: {
                label: 'Desfazer',
                onClick: () => {
                    if (timeoutRef.current) {
                        clearTimeout(timeoutRef.current);
                    }
                    undoAction();
                    setPendingAction(null);
                    onUndo?.();
                    addToast({
                        title: 'Ação desfeita',
                        type: 'success',
                        duration: 2000
                    });
                }
            }
        });

        // Timeout para commit definitivo
        timeoutRef.current = setTimeout(() => {
            setPendingAction(null);
            onCommit?.();
        }, timeout);

        return pending;
    }, [pendingAction, timeout, addToast, onUndo, onCommit]);

    // Cancela ação pendente (undo)
    const undo = useCallback(() => {
        if (pendingAction) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            pendingAction.undoAction();
            setPendingAction(null);
            onUndo?.();
        }
    }, [pendingAction, onUndo]);

    // Força commit imediato
    const commit = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setPendingAction(null);
        onCommit?.();
    }, [onCommit]);

    return {
        executeWithUndo,
        undo,
        commit,
        hasPendingAction: !!pendingAction,
        pendingAction
    };
}

export default useUndo;
