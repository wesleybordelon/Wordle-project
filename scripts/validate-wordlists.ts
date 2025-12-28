import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const ANSWERS_PATH = path.join(DATA_DIR, 'answers.txt');
const ALLOWED_PATH = path.join(DATA_DIR, 'allowed.txt');

function readList(p: string): string[] {
    if (!fs.existsSync(p)) {
        console.error(`ERROR: File not found: ${p}`);
        process.exit(1);
    }
    return fs.readFileSync(p, 'utf8')
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0);
}

function validate() {
    console.log("Validating word lists...");

    const answers = readList(ANSWERS_PATH);
    const allowed = readList(ALLOWED_PATH);
    const allowedSet = new Set(allowed);

    let errors = 0;

    // 1. Validate regex and lowercase
    const regex = /^[a-z]{5}$/;
    answers.forEach((w, i) => {
        if (!regex.test(w)) {
            console.error(`Answer line ${i + 1} invalid format: "${w}"`);
            errors++;
        }
    });
    allowed.forEach((w, i) => {
        if (!regex.test(w)) {
            console.error(`Allowed line ${i + 1} invalid format: "${w}"`);
            errors++;
        }
    });

    // 2. Duplicates
    if (new Set(answers).size !== answers.length) {
        console.error("ERROR: Duplicate words found in answers.txt");
        errors++;
    }
    if (new Set(allowed).size !== allowed.length) {
        console.error("ERROR: Duplicate words found in allowed.txt");
        errors++;
    }

    // 3. Answers subset of Allowed
    answers.forEach(a => {
        if (!allowedSet.has(a)) {
            console.error(`ERROR: Answer "${a}" is NOT in allowed.txt`);
            errors++;
        }
    });

    console.log(`Stats:`);
    console.log(`- Answers: ${answers.length}`);
    console.log(`- Allowed: ${allowed.length}`);

    if (answers.length < 20) {
        console.warn("WARNING: Answer list is very small (MVP mode?).");
    }

    if (errors > 0) {
        console.error(`FAILED: Found ${errors} errors.`);
        process.exit(1);
    } else {
        console.log("SUCCESS: Word lists are valid.");
    }
}

validate();
