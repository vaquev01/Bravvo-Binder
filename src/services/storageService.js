/**
 * BRAVVO STORAGE SERVICE
 * 
 * Camada de abstração para dados.
 * Permite trocar localStorage por Supabase/Firebase sem quebrar a UI.
 */

import { CARACA_BAR_DATA } from '../data/mockData';

const CURRENT_SCHEMA_VERSION = 1;

const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const ensureArray = (value, fallback = []) => (Array.isArray(value) ? value : fallback);
const ensureObject = (value, fallback = {}) => (isPlainObject(value) ? value : fallback);

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

        return this.normalizeClientData(saved || CARACA_BAR_DATA);
    }

    normalizeClientData(rawData) {
        const safeRaw = ensureObject(rawData, {});
        const incomingVersion = Number.isFinite(safeRaw.schemaVersion) ? safeRaw.schemaVersion : 0;
        const migrated = incomingVersion >= CURRENT_SCHEMA_VERSION
            ? safeRaw
            : this.migrateClientData(safeRaw, incomingVersion);

        const base = CARACA_BAR_DATA;
        const merged = {
            ...base,
            ...migrated,
            schemaVersion: CURRENT_SCHEMA_VERSION,
            vaults: {
                ...ensureObject(base.vaults),
                ...ensureObject(migrated.vaults)
            },
            dashboard: {
                ...ensureObject(base.dashboard),
                ...ensureObject(migrated.dashboard)
            },
            kpis: {
                ...ensureObject(base.kpis),
                ...ensureObject(migrated.kpis)
            },
            measurementContract: {
                ...ensureObject(base.measurementContract),
                ...ensureObject(migrated.measurementContract)
            }
        };

        const s1 = ensureObject(merged.vaults.S1, {});
        const s2 = ensureObject(merged.vaults.S2, {});
        const s3 = ensureObject(merged.vaults.S3, {});
        const s4 = ensureObject(merged.vaults.S4, {});
        const s5 = ensureObject(merged.vaults.S5, {});

        const s1Fields = ensureObject(s1.fields, {});
        const s2Metrics = ensureObject(s2.metrics, {});
        const s2Strategy = ensureObject(s2.strategy, {});
        const s2Bait = ensureObject(s2.bait, {});
        const s3Social = ensureObject(s3.social, {});
        const s3Cta = ensureObject(s3.cta, {});
        const s3Traffic = ensureObject(s3.traffic, {});
        const s3Metrics = ensureObject(s3.metrics, {});
        const s4Slas = ensureObject(s4.slas, {});
        const s4Owners = ensureObject(s4.owners, {});
        const s4Contacts = ensureObject(s4.contacts, {});
        const s4Schedule = ensureObject(s4.schedule, {});
        const s5Palette = ensureObject(s5.palette, {});
        const s5Rules = ensureObject(s5.rules, {});

        merged.vaults = {
            ...merged.vaults,
            S1: {
                ...s1,
                fields: {
                    ...s1Fields,
                    tone: ensureArray(s1Fields.tone),
                    values: ensureArray(s1Fields.values),
                    brandValues: ensureArray(s1Fields.brandValues || s1Fields.values)
                }
            },
            S2: {
                ...s2,
                products: ensureArray(s2.products),
                metrics: {
                    ...s2Metrics
                },
                strategy: {
                    ...s2Strategy
                },
                bait: {
                    ...s2Bait
                }
            },
            S3: {
                ...s3,
                steps: ensureArray(s3.steps),
                channels: ensureArray(s3.channels),
                social: {
                    ...s3Social
                },
                cta: {
                    ...s3Cta
                },
                traffic: {
                    ...s3Traffic
                },
                metrics: {
                    ...s3Metrics
                }
            },
            S4: {
                ...s4,
                matrix: ensureArray(s4.matrix),
                slas: {
                    approval: s4Slas.approval || '24h',
                    production: s4Slas.production || '48h',
                    ...s4Slas
                },
                owners: {
                    content: s4Owners.content || '',
                    traffic: s4Owners.traffic || '',
                    support: s4Owners.support || '',
                    ...s4Owners
                },
                contacts: {
                    emergency: s4Contacts.emergency || '',
                    ...s4Contacts
                },
                schedule: {
                    frequency: s4Schedule.frequency || '3x',
                    bestDays: ensureArray(s4Schedule.bestDays),
                    bestTimes: ensureArray(s4Schedule.bestTimes),
                    startDate: s4Schedule.startDate || '',
                    cycleDuration: s4Schedule.cycleDuration || '30',
                    ...s4Schedule
                },
                stakeholders: ensureArray(s4.stakeholders),
                competitors: ensureArray(s4.competitors)
            },
            S5: {
                ...s5,
                palette: {
                    primary: s5Palette.primary || '#F97316',
                    secondary: s5Palette.secondary || '#1E293B',
                    accent: s5Palette.accent || '#10B981',
                    ...s5Palette
                },
                rules: {
                    mood: s5Rules.mood || 'moderno',
                    ...s5Rules
                },
                ideas: ensureArray(s5.ideas),
                references: ensureArray(s5.references),
                notepad: typeof s5.notepad === 'string' ? s5.notepad : '',
                brandAssets: {
                    logos: [],
                    textures: [],
                    icons: [],
                    postTemplates: [],
                    ...ensureObject(s5.brandAssets)
                },
                brandIdentity: {
                    musicalStyle: '',
                    visualVibes: [],
                    keyElements: [],
                    prohibitedElements: [],
                    colorMeanings: '',
                    photoStyle: '',
                    typographyNotes: '',
                    ...ensureObject(s5.brandIdentity)
                }
            }
        };

        merged.dashboard = {
            ...merged.dashboard,
            D1: ensureArray(merged.dashboard.D1),
            D2: ensureArray(merged.dashboard.D2),
            D3: ensureArray(merged.dashboard.D3),
            D4: ensureArray(merged.dashboard.D4),
            D5: ensureArray(merged.dashboard.D5)
        };

        merged.governanceHistory = ensureArray(merged.governanceHistory);
        merged.promptHistory = ensureArray(merged.promptHistory);

        if (typeof merged.customThemeEnabled !== 'boolean') {
            merged.customThemeEnabled = false;
        }

        return merged;
    }

    migrateClientData(data, fromVersion) {
        const next = { ...ensureObject(data) };
        const v = Number.isFinite(fromVersion) ? fromVersion : 0;
        if (v < 1) {
            const vaults = ensureObject(next.vaults);
            const s5 = ensureObject(vaults.S5);

            next.vaults = {
                ...vaults,
                S5: {
                    ...s5,
                    ideas: ensureArray(s5.ideas),
                    references: ensureArray(s5.references),
                    notepad: typeof s5.notepad === 'string' ? s5.notepad : '',
                    brandAssets: ensureObject(s5.brandAssets),
                    brandIdentity: ensureObject(s5.brandIdentity)
                }
            };
        }
        next.schemaVersion = CURRENT_SCHEMA_VERSION;
        return next;
    }

    /**
     * Salva os dados do cliente
     */
    saveClientData(data) {
        return this.save(STORAGE_KEYS.APP_DATA, this.normalizeClientData(data));
    }

    /**
     * Limpa dados (Logout / Reset)
     */
    clearClientData() {
        localStorage.removeItem(STORAGE_KEYS.APP_DATA);
        return this.normalizeClientData(CARACA_BAR_DATA);
    }
}

export const storageService = new StorageService();
