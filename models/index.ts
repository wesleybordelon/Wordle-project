export type GameMode = 'daily' | 'practice';
export type GameStatus = 'playing' | 'won' | 'lost';
export type TileStatus = 'correct' | 'present' | 'absent';
export type Theme = 'light' | 'dark';

export interface GameStats {
    played: number;
    wins: number;
    currentStreak: number;
    maxStreak: number;
    distribution: number[]; // 0 for '1 guess', 1 for '2 guesses', etc. Index 5 = 6 guesses.
    lastPuzzleId: string;
}

export interface GameState {
    puzzleId: string;
    guesses: string[];
    gameStatus: GameStatus;
    lastPlayedTs: number;
    results?: TileStatus[][];
}

export interface GuessResult {
    isValid: boolean;
    reason?: string;
    result: TileStatus[];
    isWin: boolean;
    isGameOver: boolean;
    answer?: string;
}

export interface GridProps {
    guesses: string[];
    currentGuess: string;
    results: TileStatus[][];
    maxGuesses: number;
    isRevealing?: boolean;
    revealingRowIndex?: number;
}

export interface RowProps {
    word: string;
    result?: TileStatus[];
    isCurrent?: boolean;
    isRevealing?: boolean;
}

export interface TileProps {
    char?: string;
    status?: TileStatus;
    isFilled?: boolean;
    isRevealing?: boolean;
    animationDelay?: string;
}

export interface KeyboardProps {
    onChar: (char: string) => void;
    onDelete: () => void;
    onEnter: () => void;
    keyStatuses: Record<string, TileStatus>;
}

export interface StatsModalProps {
    stats: GameStats;
    isOpen: boolean;
    onClose: () => void;
    solution?: string;
}

export const GAME_CONFIG = {
    WORD_LENGTH: 5,
    MAX_GUESSES: 6,
    ANIMATION_DELAY_MS: 1500, // Time to wait before showing stats/messages after game over
    REVEAL_TIME_MS: 300, // Approx time for reveal animation per tile
};
