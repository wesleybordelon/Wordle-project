// scripts/build-wordlists.mjs
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

function usage() {
    console.log(`
Usage:
  node scripts/build-wordlists.mjs --in data/source/scowl.txt --out data --answers sample --n 2315

Options:
  --in       Input word list path (required)
  --out      Output directory (default: data)
  --answers  all | sample | filtered   (default: sample)
  --n        Sample size for answers when --answers=sample (default: 2315)
`);
}

function getArg(name, fallback = null) {
    const idx = process.argv.indexOf(name);
    if (idx === -1) return fallback;
    return process.argv[idx + 1] ?? fallback;
}

function parseWordFromLine(line) {
    // Grab the first contiguous alphabetic token on the line.
    // Works for plain lists, and for SCOWL-ish lines that may have extra fields.
    const m = line.match(/[A-Za-z]+/);
    if (!m) return null;
    return m[0].toLowerCase();
}

function isFiveLetterWord(w) {
    return /^[a-z]{5}$/.test(w);
}

function stableHash32(s) {
    // Deterministic ranking for sampling (same inputs => same outputs)
    const buf = crypto.createHash("sha256").update(s).digest();
    return buf.readUInt32BE(0);
}

function isAnswerCandidate(w) {
    // Conservative-ish filters to avoid lots of obvious inflections.
    // This is NOT “Wordle official” — it’s just a reasonable default.
    // You can relax/tighten later.
    if (w.endsWith("s")) return false; // avoids many plurals/3rd-person verbs
    if (w.endsWith("ed")) return false;
    // keep the rest; Wordle includes plenty of oddballs anyway
    return true;
}

async function main() {
    const inPath = getArg("--in");
    if (!inPath) {
        usage();
        process.exit(1);
    }

    const outDir = getArg("--out", "data");
    const answersMode = getArg("--answers", "sample"); // all | sample | filtered
    const n = Number(getArg("--n", "2315"));

    const raw = await readFile(inPath, "utf8");
    const lines = raw.split(/\r?\n/);

    const allowedSet = new Set();
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed.startsWith("#")) continue;

        const w = parseWordFromLine(trimmed);
        if (!w) continue;
        if (!isFiveLetterWord(w)) continue;

        allowedSet.add(w);
    }

    const allowed = Array.from(allowedSet).sort();

    let answers;
    if (answersMode === "all") {
        answers = [...allowed];
    } else if (answersMode === "filtered") {
        answers = allowed.filter(isAnswerCandidate);
    } else if (answersMode === "sample") {
        // Deterministically pick N “random-ish” words so it’s reproducible across machines.
        // Sort by stable hash, take N, then keep that order (hash order).
        const ranked = allowed
            .map((w) => ({ w, h: stableHash32(w) }))
            .sort((a, b) => a.h - b.h);

        answers = ranked.slice(0, Math.min(n, ranked.length)).map((x) => x.w);
    } else {
        console.error(`Unknown --answers mode: ${answersMode}`);
        usage();
        process.exit(1);
    }

    // Ensure answers ⊆ allowed (should already be true)
    const allowedLookup = new Set(allowed);
    answers = answers.filter((w) => allowedLookup.has(w));

    await mkdir(outDir, { recursive: true });
    await writeFile(path.join(outDir, "allowed.txt"), allowed.join("\n") + "\n", "utf8");
    await writeFile(path.join(outDir, "answers.txt"), answers.join("\n") + "\n", "utf8");

    console.log(`Wrote ${allowed.length} allowed words -> ${path.join(outDir, "allowed.txt")}`);
    console.log(`Wrote ${answers.length} answer words  -> ${path.join(outDir, "answers.txt")} (mode=${answersMode})`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
