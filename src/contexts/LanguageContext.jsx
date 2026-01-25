import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../data/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    // Default to PT or retrieve from local storage
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('bravvo_lang') || 'pt';
    });

    useEffect(() => {
        localStorage.setItem('bravvo_lang', language);
    }, [language]);

    // Translation helper function
    // Usage: t('landing.hero.title')
    const t = (path) => {
        const keys = path.split('.');
        let current = translations[language];

        for (let key of keys) {
            if (current[key] === undefined) {
                console.warn(`Translation missing for key: ${path} in language: ${language}`);
                // Fallback to English if missing
                let fallback = translations['en'];
                for (let fbKey of keys) {
                    fallback = fallback?.[fbKey];
                }
                return fallback || path;
            }
            current = current[key];
        }
        return current;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
