import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback(({ title, description, type = 'success', duration = 3000 }) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, title, description, type, duration }]);

        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none" data-testid="toast-container">
                {toasts.map((toast, index) => (
                    <div
                        key={toast.id}
                        data-testid={`toast-${toast.type}-${toast.id}`}
                        data-toast-type={toast.type}
                        data-toast-index={index}
                        className={`
                            pointer-events-auto min-w-[300px] max-w-sm rounded-xl p-4 shadow-2xl border flex items-start gap-3 animate-slideUp
                            ${toast.type === 'success' ? 'bg-[#111] border-green-500/30 text-green-400' :
                                toast.type === 'error' ? 'bg-[#111] border-red-500/30 text-red-400' :
                                    'bg-[#111] border-blue-500/30 text-blue-400'}
                        `}
                    >
                        {toast.type === 'success' && <CheckCircle className="shrink-0 mt-0.5" size={18} />}
                        {toast.type === 'error' && <AlertTriangle className="shrink-0 mt-0.5" size={18} />}
                        {toast.type === 'info' && <Info className="shrink-0 mt-0.5" size={18} />}

                        <div className="flex-1">
                            <h4 className="font-bold text-sm text-white">{toast.title}</h4>
                            {toast.description && (
                                <p className="text-xs text-gray-400 mt-1">{toast.description}</p>
                            )}
                        </div>

                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-gray-500 hover:text-white transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
