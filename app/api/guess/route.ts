import { NextResponse } from 'next/server';
import { checkIsValidWord, getDailyAnswer, getServerPuzzleId } from '@/lib/wordlists';
import { evaluateGuess } from '@/lib/word-logic';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { guess, puzzleId, attemptIndex } = body; // attemptIndex is 0-indexed (0 to 5)

        if (!guess || typeof guess !== 'string' || guess.length !== 5) {
            return NextResponse.json({ isValid: false, reason: 'bad_format' });
        }

        const normalizedGuess = guess.toLowerCase();

        // Debug logging for developers
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[GUESS] mode=${puzzleId.startsWith('practice-') ? 'practice' : 'daily'} puzzleId=${puzzleId} guess=${normalizedGuess}`);
        }

        // Verify word exists in allowed list
        if (!checkIsValidWord(normalizedGuess)) {
            return NextResponse.json({ isValid: false, reason: 'not_in_wordlist' });
        }

        // Determine the answer for the server's current day
        let currentPuzzleId = puzzleId;
        let answer: string | undefined;

        // Check if practice
        if (typeof puzzleId === 'string' && puzzleId.startsWith('practice-')) {
            // Practice Mode
            const { getPracticeAnswer } = await import('@/lib/wordlists');
            answer = getPracticeAnswer(puzzleId);

            if (!answer) {
                return NextResponse.json({ isValid: false, reason: 'invalid_practice_session' });
            }
        } else {
            // Daily Mode
            currentPuzzleId = getServerPuzzleId();
            answer = getDailyAnswer(currentPuzzleId);
        }

        const result = evaluateGuess(answer, normalizedGuess);
        const isWin = result.every(r => r === 'correct');
        let isGameOver = isWin;
        let shouldRevealAnswer = isWin;
        if (!isWin && typeof attemptIndex === 'number' && attemptIndex >= 5) {
            isGameOver = true;
            shouldRevealAnswer = true;
        }

        return NextResponse.json({
            isValid: true,
            result,
            isWin,
            isGameOver,
            answer: shouldRevealAnswer ? answer : undefined
        });

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
