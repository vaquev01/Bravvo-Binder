import React, { createContext, useState, useContext } from 'react';
import { CARACA_BAR_DATA } from '../data/mockData';

const VaultContext = createContext();

export const VaultProvider = ({ children }) => {
    // In a real app, this would fetch from an API
    const [appData, setAppData] = useState(CARACA_BAR_DATA);

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
