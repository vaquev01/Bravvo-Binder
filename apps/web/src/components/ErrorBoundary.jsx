import React from 'react';
import { reportError } from '../services/errorReportingService';

const shouldRecoverFromChunkError = (err) => {
    const msg = String(err?.message || err || '');
    if (!msg) return false;
    return (
        msg.includes('Failed to fetch dynamically imported module') ||
        msg.includes('Importing a module script failed')
    );
};

const recoverFromChunkErrorOnce = () => {
    if (typeof window === 'undefined') return;
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

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(_error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        reportError('react_error_boundary', error, {
            componentStack: errorInfo?.componentStack
        });
        this.setState({ error, errorInfo });

        if (shouldRecoverFromChunkError(error)) {
            recoverFromChunkErrorOnce();
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', color: 'white', background: '#111', height: '100vh', fontFamily: 'monospace' }}>
                    <h1>⚠️ Algo deu errado.</h1>
                    <details style={{ whiteSpace: 'pre-wrap' }}>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                    <button
                        onClick={() => {
                            if (shouldRecoverFromChunkError(this.state.error)) {
                                recoverFromChunkErrorOnce();
                            } else {
                                window.location.reload();
                            }
                        }}
                        style={{ marginTop: '20px', padding: '10px 20px', background: '#333', color: 'white', border: 'none', cursor: 'pointer' }}
                    >
                        Recarregar Página
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
