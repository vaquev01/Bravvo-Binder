import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary';
import { LanguageProvider } from './contexts/LanguageContext';
import { reportError } from './services/errorReportingService';

if (typeof window !== 'undefined') {
    const shouldRecoverFromChunkError = (err) => {
        const msg = String(err?.message || err || '');
        if (!msg) return false;
        return (
            msg.includes('Failed to fetch dynamically imported module') ||
            msg.includes('Importing a module script failed')
        );
    };

    const recoverFromChunkErrorOnce = () => {
        try {
            const key = 'bravvo_chunk_recover_once';
            if (sessionStorage.getItem(key)) return;
            sessionStorage.setItem(key, '1');
            const url = new URL(window.location.href);
            url.searchParams.set('v', String(Date.now()));
            window.location.replace(url.toString());
        } catch {
            window.location.reload();
        }
    };

    window.addEventListener('error', (event) => {
        reportError('window_error', event?.error || event?.message, {
            message: event?.message,
            filename: event?.filename,
            lineno: event?.lineno,
            colno: event?.colno
        });

        if (shouldRecoverFromChunkError(event?.error) || shouldRecoverFromChunkError(event?.message)) {
            recoverFromChunkErrorOnce();
        }
    });

    window.addEventListener('unhandledrejection', (event) => {
        reportError('unhandled_rejection', event?.reason, {
            reason: event?.reason
        });

        if (shouldRecoverFromChunkError(event?.reason)) {
            recoverFromChunkErrorOnce();
        }
    });
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <LanguageProvider>
                <App />
            </LanguageProvider>
        </ErrorBoundary>
    </React.StrictMode>,
)
