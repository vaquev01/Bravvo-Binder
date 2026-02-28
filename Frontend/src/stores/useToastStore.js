/**
 * Toast Store - Zustand (sem persist, estado efêmero)
 * Substitui o ToastContext para o estado.
 * O componente ToastContainer agora é standalone.
 * 
 * Uso:
 *   import { useToastStore } from '../stores/useToastStore';
 *   const addToast = useToastStore(s => s.addToast);
 */
import { create } from 'zustand';

export const useToastStore = create((set) => ({
    toasts: [],

    addToast: ({ title, description, type = 'success', duration = 3000, action = null }) => {
        const id = Date.now();
        set((state) => ({
            toasts: [...state.toasts, { id, title, description, type, duration, action }]
        }));

        if (duration > 0) {
            setTimeout(() => {
                set((state) => ({
                    toasts: state.toasts.filter(t => t.id !== id)
                }));
            }, duration);
        }
    },

    removeToast: (id) => {
        set((state) => ({
            toasts: state.toasts.filter(t => t.id !== id)
        }));
    }
}));
