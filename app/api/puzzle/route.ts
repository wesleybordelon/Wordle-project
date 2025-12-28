import { NextResponse } from 'next/server';
import { getServerPuzzleId, createPracticePuzzle } from '@/lib/wordlists';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') === 'practice' ? 'practice' : 'daily';

    const puzzleId = mode === 'practice' ? createPracticePuzzle() : getServerPuzzleId();

    return NextResponse.json({
        puzzleId,
        mode,
        wordLength: 5,
        maxGuesses: 6
    });
}
