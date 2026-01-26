const STORAGE_KEY = 'bravvo_feature_flags';

const DEFAULT_FLAGS = {
    DASH_ONBOARDING: false,
    DASH_INSIGHTS: false,
    DASH_INSIGHTS_ACTIONS: false,
    DASH_EMPTY_STATES: false
};

function readStoredFlags() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

function writeStoredFlags(nextFlags) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextFlags));
    } catch {
        // ignore
    }
}

function normalizeFlagName(name) {
    return String(name || '')
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9_]/g, '_');
}

function readEnvFlag(flagName) {
    const safeName = normalizeFlagName(flagName);
    const key = `VITE_FLAG_${safeName}`;
    const env = typeof import.meta !== 'undefined' ? import.meta.env : undefined;
    const raw = env ? env[key] : undefined;

    if (raw === undefined) return undefined;
    if (raw === true) return true;
    if (raw === false) return false;

    const str = String(raw).trim().toLowerCase();
    if (['1', 'true', 'yes', 'on'].includes(str)) return true;
    if (['0', 'false', 'no', 'off'].includes(str)) return false;

    return undefined;
}

export function getFeatureFlag(flagName, defaultValue) {
    const safeName = normalizeFlagName(flagName);
    const envValue = readEnvFlag(safeName);
    if (envValue !== undefined) return envValue;

    if (typeof window === 'undefined') {
        return defaultValue ?? DEFAULT_FLAGS[safeName] ?? false;
    }

    const stored = readStoredFlags();
    if (Object.prototype.hasOwnProperty.call(stored, safeName)) {
        return Boolean(stored[safeName]);
    }

    return defaultValue ?? DEFAULT_FLAGS[safeName] ?? false;
}

export function setFeatureFlag(flagName, enabled) {
    const safeName = normalizeFlagName(flagName);
    const stored = readStoredFlags();
    const next = { ...DEFAULT_FLAGS, ...stored, [safeName]: Boolean(enabled) };
    writeStoredFlags(next);
    return next;
}

export function getAllFeatureFlags() {
    if (typeof window === 'undefined') return { ...DEFAULT_FLAGS };
    const stored = readStoredFlags();
    return { ...DEFAULT_FLAGS, ...stored };
}
