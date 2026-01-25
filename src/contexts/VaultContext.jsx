import React, { createContext, useState, useContext, useEffect } from 'react';
import { CARACA_BAR_DATA } from '../data/mockData';

const VaultContext = createContext();

 const deepMerge = (base, override) => {
     if (override === undefined || override === null) return base;
     if (Array.isArray(base)) return Array.isArray(override) ? override : base;
     if (typeof base !== 'object' || base === null) return override;
     if (typeof override !== 'object' || override === null) return override;

     const result = { ...base };
     for (const key of Object.keys(override)) {
         const baseVal = base?.[key];
         const overrideVal = override[key];

         if (Array.isArray(overrideVal)) {
             result[key] = overrideVal;
         } else if (typeof overrideVal === 'object' && overrideVal !== null) {
             result[key] = deepMerge(baseVal ?? {}, overrideVal);
         } else {
             result[key] = overrideVal;
         }
     }
     return result;
 };

 const normalizeAppData = (data) => deepMerge(CARACA_BAR_DATA, data || {});

export const VaultProvider = ({ children, initialData, onSave }) => {
    // Initialize with provided data or fallback to mock
    const [appData, setAppData] = useState(() => normalizeAppData(initialData));

    // Update state when initialData changes (Client Switch)
    useEffect(() => {
        if (initialData) {
            setAppData(normalizeAppData(initialData));
        }
    }, [initialData]);

    // Persist changes
    useEffect(() => {
        if (onSave) {
            onSave(appData);
        }
    }, [appData, onSave]);

    const updateVault = (vaultId, newData) => {
        setAppData(prev => normalizeAppData({
            ...prev,
            vaults: {
                ...(prev?.vaults || {}),
                [vaultId]: { ...(prev?.vaults?.[vaultId] || {}), ...newData }
            }
        }));
    };

    const updateDashboard = (sectionId, newData) => {
        setAppData(prev => normalizeAppData({
            ...prev,
            dashboard: {
                ...(prev?.dashboard || {}),
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
