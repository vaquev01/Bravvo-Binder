import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { VaultProvider } from './contexts/VaultContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LanguageProvider } from './contexts/LanguageContext';
import { reportError } from './services/errorReportingService';

if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
        reportError('window_error', event?.error || event?.message, {
            message: event?.message,
            filename: event?.filename,
            lineno: event?.lineno,
            colno: event?.colno
        });
    });

    window.addEventListener('unhandledrejection', (event) => {
        reportError('unhandled_rejection', event?.reason, {
            reason: event?.reason
        });
    });
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <LanguageProvider>
                <VaultProvider>
                    <App />
                </VaultProvider>
            </LanguageProvider>
        </ErrorBoundary>
    </React.StrictMode>,
)
