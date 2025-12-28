import { describe, it } from 'node:test';
import assert from 'node:assert';
import { evaluateGuess, getWinMessage, getLossMessage } from './word-logic';

describe('Word Logic Evaluation', () => {
    it('handles correct guess', () => {
        const result = evaluateGuess('apple', 'apple');
        assert.deepEqual(result, ['correct', 'correct', 'correct', 'correct', 'correct']);
    });

    it('handles all wrong', () => {
        const result = evaluateGuess('apple', 'zzzzz');
        assert.deepEqual(result, ['absent', 'absent', 'absent', 'absent', 'absent']);
    });

    it('handles simple present', () => {
        const result = evaluateGuess('apple', 'leapp');
        assert.deepEqual(result, ['present', 'present', 'present', 'present', 'present']);
    });

    it('handles duplicate letters (two pass logic)', () => {
        const result = evaluateGuess('abbey', 'babes');
        assert.deepEqual(result, ['present', 'present', 'correct', 'correct', 'absent']);
    });


    it('handles tricky duplicates (guess has more than answer)', () => {
        const result = evaluateGuess('apple', 'puppy');
        assert.deepEqual(result, ['present', 'absent', 'correct', 'absent', 'absent']);
    });
});

describe('Game Over Messages', () => {
    it('returns correct win messages', () => {
        assert.strictEqual(getWinMessage(1), "Genius.");
        assert.strictEqual(getWinMessage(2), "Magnificent!");
        assert.strictEqual(getWinMessage(3), "Impressive!");
        assert.strictEqual(getWinMessage(4), "Splendid!");
        assert.strictEqual(getWinMessage(5), "Great!");
        assert.strictEqual(getWinMessage(6), "Phew!");
        assert.strictEqual(getWinMessage(7), "Impressive!"); // Default
    });

    it('returns correct loss messages', () => {
        assert.strictEqual(getLossMessage(), "Better luck next time.");
        assert.strictEqual(getLossMessage('apple'), "Better luck next time. The word was APPLE");
    });
});
