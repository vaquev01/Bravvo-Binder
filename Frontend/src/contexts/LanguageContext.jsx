/**
 * LanguageContext - Agora usa Zustand internamente
 * 
 * BACKWARD COMPAT: mantém LanguageProvider e useLanguage() exportados.
 * Para novo código, use diretamente:
 *   import { useLanguageStore } from '../stores/useLanguageStore';
 */
import React from 'react';
import { useLanguageStore } from '../stores/useLanguageStore';

/**
 * LanguageProvider - Wrapper de compatibilidade (no-op)
 * A store Zustand não precisa de Provider, mas mantemos para não quebrar main.jsx.
 */
export const LanguageProvider = ({ children }) => {
    return <>{children}</>;
};

/**
 * useLanguage - Hook de compatibilidade
 * Retorna { language, setLanguage, t }
 */
export const useLanguage = () => {
    const language = useLanguageStore((s) => s.language);
    const setLanguage = useLanguageStore((s) => s.setLanguage);
    const t = useLanguageStore((s) => s.t);

    return { language, setLanguage, t };
};
