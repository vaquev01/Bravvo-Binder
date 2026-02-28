/**
 * ToastContext - Agora usa Zustand internamente
 * 
 * BACKWARD COMPAT: mantém ToastProvider e useToast() exportados.
 * ToastProvider agora é apenas o container de UI + a store Zustand.
 * 
 * Para novo código, use diretamente:
 *   import { useToastStore } from '../stores/useToastStore';
 *   const addToast = useToastStore(s => s.addToast);
 */
import React from 'react';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { useToastStore } from '../stores/useToastStore';

/**
 * ToastProvider - Render container de UI
 * Zustand gerencia o estado; este componente apenas renderiza.
 */
export function ToastProvider({ children }) {
    const toasts = useToastStore((s) => s.toasts);
    const removeToast = useToastStore((s) => s.removeToast);

    return (
        <>
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
                            {toast.action && (
                                <button
                                    onClick={() => {
                                        toast.action.onClick?.();
                                        removeToast(toast.id);
                                    }}
                                    className="mt-2 text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    {toast.action.label}
                                </button>
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
        </>
    );
}

/**
 * useToast - Hook de compatibilidade
 * Retorna { addToast }
 */
export function useToast() {
    const addToast = useToastStore((s) => s.addToast);
    return { addToast };
}
