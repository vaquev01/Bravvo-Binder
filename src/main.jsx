import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { VaultProvider } from './contexts/VaultContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LanguageProvider } from './contexts/LanguageContext';

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
