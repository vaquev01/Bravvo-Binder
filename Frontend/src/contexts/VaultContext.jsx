/**
 * VaultContext - Agora usa Zustand internamente
 * 
 * BACKWARD COMPAT: mantém VaultProvider e useVaults() exportados
 * para que nenhum consumer precise mudar os imports.
 * 
 * Para novo código, use diretamente:
 *   import { useAppStore } from '../stores/useAppStore';
 */
import React, { useEffect } from 'react';
import { useAppStore } from '../stores/useAppStore';

/**
 * VaultProvider - Inicializa a store com dados do cliente
 * Mantido para compatibilidade com App.jsx que passa initialData/onSave.
 */
export const VaultProvider = ({ children, initialData, onSave }) => {
    const { appData, setAppData, loadClientData } = useAppStore();

    // Inicializa com dados do cliente se fornecido
    useEffect(() => {
        if (initialData) {
            loadClientData(initialData);
        }
    }, []);

    // Auto-save quando appData muda
    useEffect(() => {
        if (onSave && appData) {
            onSave(appData);
        }
    }, [appData, onSave]);

    return <>{children}</>;
};

/**
 * useVaults - Hook de compatibilidade
 * Retorna a mesma interface: { appData, setAppData, updateVault, updateDashboard }
 */
export const useVaults = () => {
    const appData = useAppStore((s) => s.appData);
    const setAppData = useAppStore((s) => s.setAppData);
    const updateVault = useAppStore((s) => s.updateVault);
    const updateDashboard = useAppStore((s) => s.updateDashboard);

    return { appData, setAppData, updateVault, updateDashboard };
};
