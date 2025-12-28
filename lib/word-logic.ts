export type TileStatus = 'correct' | 'present' | 'absent';

export function evaluateGuess(answer: string, guess: string): TileStatus[] {
    const result: TileStatus[] = Array(5).fill('absent');
    const answerCounts: Record<string, number> = {};

    // Count frequencies in answer
    for (const char of answer) {
        answerCounts[char] = (answerCounts[char] || 0) + 1;
    }

    // Pass 1: Mark Correct and decrement counts
    for (let i = 0; i < 5; i++) {
        if (guess[i] === answer[i]) {
            result[i] = 'correct';
            answerCounts[guess[i]]--;
        }
    }

    // Pass 2: Mark Present if counts remain
    for (let i = 0; i < 5; i++) {
        if (result[i] !== 'correct') { // Skip already marked correct
            const char = guess[i];
            if (answerCounts[char] > 0) {
                result[i] = 'present';
                answerCounts[char]--;
            }
        }
    }

    return result;
}

export function getWinMessage(guessesUsed: number): string {
    const messages = [
        "Genius.",
        "Magnificent!",
        "Impressive!",
        "Splendid!",
        "Great!",
        "Phew!"
    ];
    return messages[guessesUsed - 1] || "Impressive!";
}

export function getLossMessage(solution?: string): string {
    if (solution) {
        return `Better luck next time. The word was ${solution.toUpperCase()}`;
    }
    return "Better luck next time.";
}
