/**
 * BRAVVO STORAGE SERVICE
 * 
 * Camada de abstração para dados.
 * Permite trocar localStorage por Supabase/Firebase sem quebrar a UI.
 */

const CURRENT_SCHEMA_VERSION = 1;

const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const ensureArray = (value, fallback = []) => (Array.isArray(value) ? value : fallback);
const ensureObject = (value, fallback = {}) => (isPlainObject(value) ? value : fallback);

const STORAGE_KEYS = {
    APP_DATA: 'bravvo_app_data',
    USER_PREFS: 'bravvo_user_prefs',
    AUTH: 'bravvo_auth_session'
};

const BLANK_CLIENT_TEMPLATE = {
    clientName: '',
    vaults: {
        S1: { id: 'S1', fields: {} },
        S2: { id: 'S2', products: [], metrics: {}, strategy: {}, bait: {} },
        S3: { id: 'S3', steps: [], channels: [], traffic: {}, social: {}, cta: {}, metrics: {} },
        S4: { id: 'S4', matrix: [], slas: {}, owners: {}, contacts: {}, schedule: {}, governanceCalendar: {}, stakeholders: [], competitors: [] },
        S5: { id: 'S5', palette: {}, rules: {}, ideas: [], references: [], notepad: '', brandAssets: {}, brandIdentity: {} }
    },
    dashboard: {
        D1: [],
        D2: [],
        D3: [],
        D4: [],
        D5: []
    },
    kpis: {
        revenue: { value: 0, goal: 0 },
        traffic: { value: 0, goal: 0 },
        sales: { value: 0, goal: 0 }
    },
    measurementContract: {
        lastUpdate: '',
        cycle: { id: '', label: '', status: 'active' },
        objectives: [],
        dashboardLayout: { topKpis: ['revenue', 'sales', 'traffic'], secondaryKpis: [] },
        kpis: [
            { id: 'revenue', label: 'Receita', format: 'currency', source: 'manual', target: 0, active: true },
            { id: 'traffic', label: 'Tráfego', format: 'decimal', source: 'manual', target: 0, active: true },
            { id: 'sales', label: 'Vendas', format: 'integer', source: 'manual', target: 0, active: true }
        ],
        auditLog: []
    },
    creativeAssets: [],
    governanceHistory: [],
    promptHistory: [],
    customThemeEnabled: false
};

const resolveTestMode = () => {
    const envFlag = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_TEST_MODE === '1';
    const windowFlag = typeof window !== 'undefined' && window.__BRAVVO_TEST_MODE__ === true;
    return Boolean(envFlag || windowFlag);
};

class StorageService {
    constructor() {
        this.driver = 'local_storage'; // 'local_storage' | 'supabase' | 'firebase'
        this.pendingSaves = 0;
        this.lastSaveAt = 0;
        this.saveSequence = 0;
        this.saveQueue = Promise.resolve();
        this.testMode = resolveTestMode();
        if (this.testMode && typeof window !== 'undefined') {
            window.__PENDING_SAVES__ = this.pendingSaves;
            window.__LAST_SAVE_AT__ = this.lastSaveAt;
            window.__SAVE_SEQ__ = this.saveSequence;
            window.__flushPersistence__ = () => this.flush();
        }
    }

    updateDebugState() {
        if (!this.testMode || typeof window === 'undefined') return;
        window.__PENDING_SAVES__ = this.pendingSaves;
        window.__LAST_SAVE_AT__ = this.lastSaveAt;
        window.__SAVE_SEQ__ = this.saveSequence;
    }

    markSaveStart() {
        this.pendingSaves += 1;
        this.updateDebugState();
    }

    markSaveEnd() {
        this.pendingSaves = Math.max(0, this.pendingSaves - 1);
        this.lastSaveAt = Date.now();
        this.saveSequence += 1;
        this.updateDebugState();
    }

    enqueueSaveCompletion() {
        this.saveQueue = this.saveQueue.then(() => Promise.resolve().then(() => this.markSaveEnd()));
    }

    flush() {
        return this.saveQueue;
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
    loadClientData(clientId = null, fallbackData = null) {
        const withClientId = (data) => {
            if (!clientId) return data;
            const safe = ensureObject(data, {});
            if (typeof safe.id === 'string' && safe.id.trim()) return safe;
            return { ...safe, id: clientId };
        };

        const perClientKey = clientId ? `${STORAGE_KEYS.APP_DATA}:${clientId}` : null;
        const saved = perClientKey ? this.load(perClientKey) : null;
        if (saved) return this.normalizeClientData(withClientId(saved));

        const legacy = this.load(STORAGE_KEYS.APP_DATA);
        if (clientId) {
            if (legacy && legacy.id === clientId) {
                return this.normalizeClientData(withClientId(legacy));
            }
            if (fallbackData) return this.normalizeClientData(fallbackData);
            return this.normalizeClientData(withClientId(BLANK_CLIENT_TEMPLATE));
        }

        // Backward compatible fallback (no client selected)
        if (legacy) return this.normalizeClientData(legacy);

        if (fallbackData) return this.normalizeClientData(fallbackData);
        return this.normalizeClientData(BLANK_CLIENT_TEMPLATE);
    }

    normalizeClientData(rawData) {
        const safeRaw = ensureObject(rawData, {});
        const incomingVersion = Number.isFinite(safeRaw.schemaVersion) ? safeRaw.schemaVersion : 0;
        const migrated = incomingVersion >= CURRENT_SCHEMA_VERSION
            ? safeRaw
            : this.migrateClientData(safeRaw, incomingVersion);

        const base = BLANK_CLIENT_TEMPLATE;
        const merged = {
            ...base,
            ...migrated,
            schemaVersion: CURRENT_SCHEMA_VERSION,
            creativeAssets: ensureArray(migrated.creativeAssets || base.creativeAssets),
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
        const s4GovernanceCalendar = ensureObject(s4.governanceCalendar, {});
        const s5Palette = ensureObject(s5.palette, {});
        const s5Rules = ensureObject(s5.rules, {});
        const s5BrandIdentity = ensureObject(s5.brandIdentity, {});

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
                governanceCalendar: {
                    weekStartDay: Number.isFinite(s4GovernanceCalendar.weekStartDay) ? s4GovernanceCalendar.weekStartDay : 1,
                    meetingWeekday: Number.isFinite(s4GovernanceCalendar.meetingWeekday) ? s4GovernanceCalendar.meetingWeekday : 1,
                    monthlyMeetingDay: Number.isFinite(s4GovernanceCalendar.monthlyMeetingDay) ? s4GovernanceCalendar.monthlyMeetingDay : 1,
                    ...s4GovernanceCalendar
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
                    fontFamily: typeof s5BrandIdentity.fontFamily === 'string' ? s5BrandIdentity.fontFamily : 'Inter',
                    ...s5BrandIdentity
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
        const normalized = this.normalizeClientData(data);
        this.markSaveStart();
        const ok = this.save(STORAGE_KEYS.APP_DATA, normalized);
        if (normalized?.id) {
            this.save(`${STORAGE_KEYS.APP_DATA}:${normalized.id}`, normalized);
        }
        this.enqueueSaveCompletion();
        return ok;
    }

    /**
     * Limpa dados (Logout / Reset)
     */
    clearClientData() {
        localStorage.removeItem(STORAGE_KEYS.APP_DATA);
        return this.normalizeClientData(BLANK_CLIENT_TEMPLATE);
    }

    resetClientData(clientId, options = {}) {
        const resolvedClientId = typeof clientId === 'string' && clientId.trim() ? clientId.trim() : null;

        const legacy = this.load(STORAGE_KEYS.APP_DATA);
        if (!resolvedClientId || (legacy && legacy.id === resolvedClientId)) {
            localStorage.removeItem(STORAGE_KEYS.APP_DATA);
        }

        localStorage.removeItem('bravvo_form_data');
        localStorage.removeItem('bravvo_meeting_state');

        if (resolvedClientId) {
            localStorage.removeItem(`${STORAGE_KEYS.APP_DATA}:${resolvedClientId}`);
            localStorage.removeItem(`bravvo_form_data:${resolvedClientId}`);
            localStorage.removeItem(`bravvo_meeting_state:${resolvedClientId}`);
        }

        const blank = this.normalizeClientData({
            ...BLANK_CLIENT_TEMPLATE,
            id: resolvedClientId || undefined,
            clientName: typeof options.clientName === 'string' ? options.clientName : ''
        });

        this.save(STORAGE_KEYS.APP_DATA, blank);
        if (resolvedClientId) {
            this.save(`${STORAGE_KEYS.APP_DATA}:${resolvedClientId}`, blank);
        }

        return blank;
    }
}

export const storageService = new StorageService();
