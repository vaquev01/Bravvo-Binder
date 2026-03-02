import { useEffect } from 'react';

/**
 * Applies theme preferences from appData to the document root variables.
 * Enables dynamic branding (colors, fonts) across the entire application.
 * Also handles dynamic loading of Google Fonts.
 */
export function ThemeManager({ appData }) {
    useEffect(() => {
        const theme = appData?.workspacePrefs?.theme;
        const root = document.documentElement;

        if (theme?.enabled) {
            // Apply custom theme attribute to enable CSS overrides
            root.setAttribute('data-theme', 'custom');

            // Apply Font Family & Load from Google Fonts
            if (theme.fontFamily && theme.fontFamily !== 'Inter') {
                root.style.setProperty('--brand-font', theme.fontFamily);
                
                // Dynamic Font Loading
                const fontName = theme.fontFamily;
                const linkId = 'bravvo-dynamic-font';
                let link = document.getElementById(linkId);
                
                if (!link) {
                    link = document.createElement('link');
                    link.id = linkId;
                    link.rel = 'stylesheet';
                    document.head.appendChild(link);
                }
                
                // Convert "Open Sans" to "Open+Sans"
                const fontQuery = fontName.replace(/\s+/g, '+');
                link.href = `https://fonts.googleapis.com/css2?family=${fontQuery}:wght@300;400;500;600;700&display=swap`;
                
            } else {
                root.style.setProperty('--brand-font', 'Inter');
                // Remove dynamic font if reverting to default
                const link = document.getElementById('bravvo-dynamic-font');
                if (link) link.remove();
            }

            // Apply Primary Color (Brand Primary)
            if (theme.primaryColor) {
                root.style.setProperty('--brand-primary', theme.primaryColor);
            } else {
                root.style.removeProperty('--brand-primary');
            }

            // Apply Accent Color (Brand Accent)
            if (theme.accentColor) {
                root.style.setProperty('--brand-accent', theme.accentColor);
                // Also update accent-purple alias for compatibility
                root.style.setProperty('--accent-purple', theme.accentColor);
            } else {
                root.style.removeProperty('--brand-accent');
                root.style.removeProperty('--accent-purple');
            }
        } else {
            // Revert to default design system
            root.removeAttribute('data-theme');
            root.style.removeProperty('--brand-font');
            root.style.removeProperty('--brand-primary');
            root.style.removeProperty('--brand-accent');
            root.style.removeProperty('--accent-purple');
            
            const link = document.getElementById('bravvo-dynamic-font');
            if (link) link.remove();
        }
    }, [appData?.workspacePrefs?.theme]);

    return null; // Logic-only component
}
