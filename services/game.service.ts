import { GameMode, GuessResult } from '@/models';

interface PuzzleResponse {
    puzzleId: string;
}

export const fetchNewPuzzle = async (mode: GameMode): Promise<PuzzleResponse> => {
    const res = await fetch(`/api/puzzle?mode=${mode}&t=${Date.now()}`);
    if (!res.ok) {
        throw new Error('Failed to fetch puzzle');
    }
    return res.json();
};

export const submitGuess = async (
    guess: string,
    puzzleId: string,
    attemptIndex: number
): Promise<GuessResult> => {
    const res = await fetch('/api/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guess, puzzleId, attemptIndex }),
    });

    // Even if 400 (invalid), we might return JSON with reason
    // But fetch throws on network error only.
    if (!res.ok) {
        // Try to parse error
        try {
            const err = await res.json();
            // Map to GuessResult shape for easier handling if it's a "soft" error like invalid word
            // But usually API returns 200 OK with isValid: false?
            // Checking page.tsx logic: "const data = await res.json(); if (!data.isValid)..."
            // So logic implies 200 OK.
            // If it's a real 500/404, throw.
            throw new Error(err.message || 'Error submitting guess');
        } catch {
            throw new Error('Network response was not ok');
        }
    }
    return res.json();
};
