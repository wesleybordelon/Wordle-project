import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

let answers: string[] | null = null;
let allowed: Set<string> | null = null;

// Epoch date for deterministic daily puzzle
const EPOCH = new Date('2021-06-19T00:00:00');

function loadLists() {
    if (answers && allowed) return;

    const dataDir = path.join(process.cwd(), 'data');
    try {
        const answersPath = path.join(dataDir, 'answers.txt');
        const allowedPath = path.join(dataDir, 'allowed.txt');

        const readLines = (p: string) => fs.readFileSync(p, 'utf8')
            .split('\n')
            .map(l => l.trim().toLowerCase())
            .filter(l => l.length === 5 && /^[a-z]+$/.test(l));

        answers = readLines(answersPath);
        const extraAllowed = readLines(allowedPath);

        allowed = new Set([...answers, ...extraAllowed]);

        console.log(`Loaded ${answers.length} answers and ${allowed.size} allowed words.`);
    } catch (e) {
        console.error("Failed to load word lists:", e);
        answers = ['apple'];
        allowed = new Set(['apple']);
    }
}

function getAnswerHash(answer: string): string {
    return crypto.createHash('md5').update(answer + 'WORDLESALT2023').digest('hex').slice(0, 8);
}

// Helper that takes pure date string
function getAnswerForDate(dateStr: string): string {
    loadLists();
    if (!answers || answers.length === 0) return 'fail';

    const current = new Date(dateStr + 'T00:00:00');
    const epoch = EPOCH;

    const oneDay = 1000 * 60 * 60 * 24;
    const diffTime = current.getTime() - epoch.getTime();
    const diffDays = Math.floor(diffTime / oneDay);

    let index = diffDays % answers.length;
    if (index < 0) index += answers.length;

    return answers[index];
}

export function getServerPuzzleId(): string {
    // Returns YYYY-MM-DD-HASH in server local time
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    // Compute answer for this date to append hash
    const answer = getAnswerForDate(dateStr);
    return `${dateStr}-${getAnswerHash(answer)}`;
}

export function createPracticePuzzle(): string {
    loadLists();
    if (!answers || answers.length === 0) return 'fail';

    // Generate a secure random seed for deterministic answer pick
    const seed = crypto.randomBytes(4).toString('hex');
    return `practice-${seed}`;
}

export function getPracticeAnswer(puzzleId: string): string | undefined {
    loadLists();
    if (!answers || answers.length === 0) return undefined;

    if (!puzzleId.startsWith('practice-')) return undefined;

    const seed = puzzleId.replace('practice-', '');
    if (!seed) return undefined;

    // Stable hash from seed
    const hash = crypto.createHash('sha256').update(seed + 'WORDLE_PRACTICE_SALT').digest('hex');
    const index = parseInt(hash.slice(0, 8), 16) % answers.length;

    return answers[index];
}

export function getDailyAnswer(puzzleId: string): string {
    // Strip hash suffix if present
    // Format: YYYY-MM-DD-HASH or YYYY-MM-DD
    const parts = puzzleId.split('-');
    if (parts.length >= 4) {
        const dateStr = parts.slice(0, 3).join('-');
        return getAnswerForDate(dateStr);
    }

    // Fallback for old IDs or raw date string
    return getAnswerForDate(puzzleId);
}

export function checkIsValidWord(word: string): boolean {
    loadLists();
    return allowed!.has(word.toLowerCase());
}
