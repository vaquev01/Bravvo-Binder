import React, { createContext, useState, useContext, useEffect } from 'react';
import { storageService } from '../services/storageService';

const VaultContext = createContext();

export const VaultProvider = ({ children, initialData, onSave }) => {
    // Initialize with provided data or fallback to storage service
    const [appData, setAppData] = useState(() => {
        if (initialData) {
            // Se dados forem injetados (ex: seleção de cliente), usamos eles (normalizados pelo service se necessário)
            // Aqui assumimos que quem passa initialData já cuida da fonte, mas podemos garantir normalização
            // Como storageService.loadClientData já normaliza, podemos expor um método estático ou auxiliar se precisarmos normalizar dados brutos.
            // Por enquanto, vamos manter a lógica de normalização interna do service acessível ou duplicar a proteção aqui, 
            // mas o ideal é que o service seja a fonte da verdade.
            // Para simplificar e manter compatibilidade, usaremos a lógica do service se ele tiver methods públicos de normalização, 
            // ou apenas garantimos que o initialData seja tratado.
            return initialData; // Assumindo que o App.jsx já passa dados válidos ou normalizados
        }
        return storageService.loadClientData();
    });

    // Update state when initialData changes (Client Switch)
    useEffect(() => {
        if (initialData) {
            setAppData(initialData);
        }
    }, [initialData]);

    // Persist changes
    useEffect(() => {
        // Se houver uma função de salvamento externa (ex: sync com API), chama ela
        if (onSave) {
            onSave(appData);
        }
        // Também salvamos no storage local como backup/cache do cliente atual
        storageService.saveClientData(appData);
    }, [appData, onSave]);

    const updateVault = (vaultId, newData) => {
        setAppData(prev => {
            const updated = {
                ...prev,
                vaults: {
                    ...(prev?.vaults || {}),
                    [vaultId]: { ...(prev?.vaults?.[vaultId] || {}), ...newData }
                }
            };
            return updated;
        });
    };

    const updateDashboard = (sectionId, newData) => {
        setAppData(prev => {
            const updated = {
                ...prev,
                dashboard: {
                    ...(prev?.dashboard || {}),
                    [sectionId]: newData
                }
            };
            return updated;
        });
    };

    return (
        <VaultContext.Provider value={{ appData, setAppData, updateVault, updateDashboard }}>
            {children}
        </VaultContext.Provider>
    );
};

export const useVaults = () => useContext(VaultContext);
