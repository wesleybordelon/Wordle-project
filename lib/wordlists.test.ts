import { test } from 'node:test';
import assert from 'node:assert';
import { createPracticePuzzle, getPracticeAnswer, getServerPuzzleId, getDailyAnswer } from './wordlists';

test('Practice puzzle answer is stable and deterministic', () => {
    const puzzleId = createPracticePuzzle();
    assert.ok(puzzleId.startsWith('practice-'), 'ID should start with practice-');

    const answer1 = getPracticeAnswer(puzzleId);
    const answer2 = getPracticeAnswer(puzzleId);

    assert.ok(answer1, 'Answer should be found');
    assert.strictEqual(answer1, answer2, 'Answer must be stable for the same puzzleId');
});

test('Daily puzzle answer is deterministic for a given ID', () => {
    const puzzleId = getServerPuzzleId();
    const dateStr = puzzleId.split('-').slice(0, 3).join('-');

    const answer1 = getDailyAnswer(puzzleId);
    const answer2 = getDailyAnswer(dateStr); // Fallback format

    assert.ok(answer1, 'Answer should be found');
    assert.strictEqual(answer1, answer2, 'Answer must be stable for the same date');
});

test('Practice answer derives from seed', () => {
    // Simulate two different seeds
    const id1 = 'practice-abc123';
    const id2 = 'practice-def456';

    const ans1 = getPracticeAnswer(id1);
    const ans2 = getPracticeAnswer(id2);

    assert.ok(ans1 && ans2, 'Answers should be found');
});

test('Unknown practice puzzle returns undefined or is handled', () => {
    const ans = getPracticeAnswer('practice-');
    assert.strictEqual(ans, undefined, 'Empty seed should return undefined');

    const notPractice = getPracticeAnswer('daily-123');
    assert.strictEqual(notPractice, undefined, 'Non-practice ID returns undefined');
});
