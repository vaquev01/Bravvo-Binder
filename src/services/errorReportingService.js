const STORAGE_KEY = 'bravvo_error_log';
const MAX_ENTRIES = 50;

function safeStringify(value) {
    try {
        return JSON.stringify(value);
    } catch {
        return undefined;
    }
}

function normalizeError(error) {
    if (!error) {
        return { name: 'UnknownError', message: 'Unknown error', stack: '' };
    }

    if (error instanceof Error) {
        return { name: error.name, message: error.message, stack: error.stack || '' };
    }

    if (typeof error === 'string') {
        return { name: 'Error', message: error, stack: '' };
    }

    const asJson = safeStringify(error);
    return { name: 'Error', message: asJson || String(error), stack: '' };
}

function readLog() {
    if (typeof window === 'undefined') return [];
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function writeLog(entries) {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
        // ignore
    }
}

export function reportError(source, error, extra = {}) {
    const normalized = normalizeError(error);
    const entry = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        ts: new Date().toISOString(),
        source,
        name: normalized.name,
        message: normalized.message,
        stack: normalized.stack,
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        extra
    };

    const entries = readLog();
    entries.unshift(entry);
    writeLog(entries.slice(0, MAX_ENTRIES));

    if (typeof import.meta !== 'undefined' && import.meta?.env?.DEV) {
        console.error(`[BravvoOS][${source}]`, error, extra);
    }

    return entry;
}

export function getRecentErrors() {
    return readLog();
}

export function clearErrors() {
    writeLog([]);
}
