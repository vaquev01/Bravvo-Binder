/**
 * BRAVVO STORAGE SERVICE
 * 
 * Camada de abstração para dados.
 * Permite trocar localStorage por Supabase/Firebase sem quebrar a UI.
 */

import { CARACA_BAR_DATA } from '../data/mockData';

const STORAGE_KEYS = {
    APP_DATA: 'bravvo_app_data',
    USER_PREFS: 'bravvo_user_prefs',
    AUTH: 'bravvo_auth_session'
};

class StorageService {
    constructor() {
        this.driver = 'local_storage'; // 'local_storage' | 'supabase' | 'firebase'
    }

    // --- GENERIC METHODS ---

    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Save failed:', e);
            return false;
        }
    }

    load(key, fallback = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : fallback;
        } catch (e) {
            console.error('Load failed:', e);
            return fallback;
        }
    }

    // --- DOMAIN SPECIFIC METHODS ---

    /**
     * Carrega os dados do cliente atual
     */
    loadClientData() {
        // Tenta carregar do local, se não existir, usa o Mock inicial
        const saved = this.load(STORAGE_KEYS.APP_DATA);
        
        // Normalização de dados (Deep Merge simplificado para garantir estrutura)
        if (!saved) return CARACA_BAR_DATA;

        // Garantir que estrutura mínima existe (resiliência)
        return {
            ...CARACA_BAR_DATA,
            ...saved,
            vaults: {
                ...CARACA_BAR_DATA.vaults,
                ...(saved.vaults || {})
            }
        };
    }

    /**
     * Salva os dados do cliente
     */
    saveClientData(data) {
        return this.save(STORAGE_KEYS.APP_DATA, data);
    }

    /**
     * Limpa dados (Logout / Reset)
     */
    clearClientData() {
        localStorage.removeItem(STORAGE_KEYS.APP_DATA);
        return CARACA_BAR_DATA;
    }
}

export const storageService = new StorageService();
