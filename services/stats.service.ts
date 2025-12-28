import { GameMode, GameStats } from '@/models';
import { getStats, saveStats } from './storage.service';

/**
 * Updates the stats for the given mode and persists them.
 * Returns the updated stats object.
 */
export const updateStats = (isWin: boolean, guessCount: number, puzzleId: string, mode: GameMode): GameStats => {
    const stats = getStats(mode);

    // Prevent double recording for same puzzle
    if (stats.lastPuzzleId === puzzleId) return stats;

    stats.played++;
    stats.lastPuzzleId = puzzleId;

    if (isWin) {
        stats.wins++;
        stats.currentStreak++;
        stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
        if (guessCount >= 1 && guessCount <= 6) {
            stats.distribution[guessCount - 1]++;
        }
    } else {
        stats.currentStreak = 0;
    }

    saveStats(stats, mode);
    return stats;
};

export { getStats } from './storage.service';
