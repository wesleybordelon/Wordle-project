import { useEffect, useState } from 'react';
import { Theme } from '@/models';
import { getTheme, setTheme, getHighContrast, setHighContrast } from '@/services/storage.service';

export function useTheme() {
    const [theme, setThemeState] = useState<Theme>('light');
    const [highContrast, setHighContrastState] = useState(false);

    // Initial Load
    useEffect(() => {
        // Theme
        const t = getTheme();
        setThemeState(t);
        applyThemeToDom(t);

        // High Contrast
        const hc = getHighContrast();
        setHighContrastState(hc);
        applyHighContrastToDom(hc);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleTheme = () => {
        const newVal = theme === 'light' ? 'dark' : 'light';
        setThemeState(newVal);
        setTheme(newVal);
        applyThemeToDom(newVal);
    };

    const toggleHighContrast = () => {
        const newVal = !highContrast;
        setHighContrastState(newVal);
        setHighContrast(newVal);
        applyHighContrastToDom(newVal);
    };

    return {
        theme,
        toggleTheme,
        highContrast,
        toggleHighContrast
    };
}

// Helpers to keep DOM logic encapsulated
function applyThemeToDom(theme: Theme) {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;
    if (theme === 'dark') {
        html.classList.add('dark');
    } else {
        html.classList.remove('dark');
    }
}

function applyHighContrastToDom(enabled: boolean) {
    if (typeof document === 'undefined') return;
    if (enabled) {
        document.body.setAttribute('data-high-contrast', 'true');
    } else {
        document.body.removeAttribute('data-high-contrast');
    }
}
