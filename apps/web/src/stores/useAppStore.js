/**
 * App Store - Zustand com persist
 * Substitui o VaultContext para gerenciamento de estado global.
 * 
 * Uso: 
 *   import { useAppStore } from '../stores/useAppStore';
 *   const { appData, setAppData, updateVault, updateDashboard } = useAppStore();
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { storageService } from '../services/storageService';

export const useAppStore = create(
    persist(
        (set, get) => ({
            // State
            appData: storageService.loadClientData(),

            // Actions
            setAppData: (updaterOrValue) => {
                set((state) => {
                    const newData = typeof updaterOrValue === 'function'
                        ? updaterOrValue(state.appData)
                        : updaterOrValue;
                    // Persist to storage service as backup
                    storageService.saveClientData(newData);
                    return { appData: newData };
                });
            },

            updateVault: (vaultId, newData) => {
                set((state) => {
                    const updated = {
                        ...state.appData,
                        vaults: {
                            ...(state.appData?.vaults || {}),
                            [vaultId]: { ...(state.appData?.vaults?.[vaultId] || {}), ...newData }
                        }
                    };
                    storageService.saveClientData(updated);
                    return { appData: updated };
                });
            },

            updateDashboard: (sectionId, newData) => {
                set((state) => {
                    const updated = {
                        ...state.appData,
                        dashboard: {
                            ...(state.appData?.dashboard || {}),
                            [sectionId]: newData
                        }
                    };
                    storageService.saveClientData(updated);
                    return { appData: updated };
                });
            },

            // Reset with new client data (for client switching)
            loadClientData: (initialData) => {
                const normalized = initialData
                    ? storageService.normalizeClientData(initialData)
                    : storageService.loadClientData();
                set({ appData: normalized });
            }
        }),
        {
            name: 'bravvo-app-data',
            // Only persist appData
            partialize: (state) => ({ appData: state.appData }),
        }
    )
);
