/**
 * Language Store - Zustand com persist
 * Substitui o LanguageContext.
 * 
 * Uso:
 *   import { useLanguageStore } from '../stores/useLanguageStore';
 *   const { language, setLanguage, t } = useLanguageStore();
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { translations } from '../data/translations';

export const useLanguageStore = create(
    persist(
        (set, get) => ({
            language: 'pt',

            setLanguage: (lang) => set({ language: lang }),

            t: (path) => {
                const { language } = get();
                const keys = path.split('.');
                let current = translations[language];

                for (let key of keys) {
                    if (current?.[key] === undefined) {
                        // Fallback to English
                        let fallback = translations['en'];
                        for (let fbKey of keys) {
                            fallback = fallback?.[fbKey];
                        }
                        return fallback || path;
                    }
                    current = current[key];
                }
                return current;
            }
        }),
        {
            name: 'bravvo-language',
            partialize: (state) => ({ language: state.language }),
        }
    )
);
