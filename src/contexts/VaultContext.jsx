import React, { createContext, useState, useContext, useEffect } from 'react';
import { CARACA_BAR_DATA } from '../data/mockData';

const VaultContext = createContext();

export const VaultProvider = ({ children, initialData, onSave }) => {
    // Initialize with provided data or fallback to mock
    const [appData, setAppData] = useState(initialData || CARACA_BAR_DATA);

    // Update state when initialData changes (Client Switch)
    useEffect(() => {
        if (initialData) {
            setAppData(initialData);
        }
    }, [initialData]);

    // Persist changes
    useEffect(() => {
        if (onSave) {
            onSave(appData);
        }
    }, [appData, onSave]);

    const updateVault = (vaultId, newData) => {
        setAppData(prev => ({
            ...prev,
            vaults: {
                ...prev.vaults,
                [vaultId]: { ...prev.vaults[vaultId], ...newData }
            }
        }));
    };

    const updateDashboard = (sectionId, newData) => {
        setAppData(prev => ({
            ...prev,
            dashboard: {
                ...prev.dashboard,
                [sectionId]: newData
            }
        }));
    };

    return (
        <VaultContext.Provider value={{ appData, setAppData, updateVault, updateDashboard }}>
            {children}
        </VaultContext.Provider>
    );
};

export const useVaults = () => useContext(VaultContext);
