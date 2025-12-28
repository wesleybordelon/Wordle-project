import { GameMode, GameState, GameStats, Theme } from '@/models';

const KEYS = {
    STATS: 'wordle_stats_v1',
    STATE: 'wordle_state_v1',
    CONTRAST: 'wordle_contrast_v1',
    THEME: 'wordle_theme_v1',
};

// --- Storage Keys Helper ---
const getStatsKey = (mode: GameMode) => mode === 'daily' ? KEYS.STATS : `${KEYS.STATS}_${mode}`;
const getStateKey = (mode: GameMode) => mode === 'daily' ? KEYS.STATE : `${KEYS.STATE}_${mode}`;

// --- Game State ---
export const saveGameState = (state: GameState, mode: GameMode) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(getStateKey(mode), JSON.stringify(state));
};

export const loadGameState = (mode: GameMode): GameState | null => {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(getStateKey(mode));
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

export const clearGameState = (mode: GameMode) => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(getStateKey(mode));
};

// --- Stats ---
export const getStats = (mode: GameMode): GameStats => {
    if (typeof window === 'undefined') return emptyStats();
    try {
        const raw = localStorage.getItem(getStatsKey(mode));
        if (!raw) return emptyStats();
        return JSON.parse(raw);
    } catch {
        return emptyStats();
    }
};

export const saveStats = (stats: GameStats, mode: GameMode) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(getStatsKey(mode), JSON.stringify(stats));
};

const emptyStats = (): GameStats => ({
    played: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    distribution: [0, 0, 0, 0, 0, 0],
    lastPuzzleId: '',
});

// --- Theme & Contrast ---
export const getHighContrast = (): boolean => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(KEYS.CONTRAST) === 'true';
};

export const setHighContrast = (enabled: boolean) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEYS.CONTRAST, String(enabled));
};

export const getTheme = (): Theme => {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem(KEYS.THEME);
    if (saved === 'dark' || saved === 'light') return saved as Theme;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
};

export const setTheme = (theme: Theme) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEYS.THEME, theme);
};
