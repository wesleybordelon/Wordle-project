// scripts/normalize-wordlist.mjs
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

function getArg(flag, fallback = null) {
    const i = process.argv.indexOf(flag);
    if (i === -1) return fallback;
    return process.argv[i + 1] ?? fallback;
}

async function main() {
    const inPath = getArg("--in");
    const outPath = getArg("--out");

    if (!inPath || !outPath) {
        console.error("Usage: node scripts/normalize-wordlist.mjs --in <input> --out <output>");
        process.exit(1);
    }

    const raw = await readFile(inPath, "utf8");

    // Split on any whitespace, lowercase, and keep non-empty tokens
    const words = raw
        .split(/\s+/)
        .map((w) => w.trim().toLowerCase())
        .filter(Boolean);

    // Optional: de-dupe while keeping first occurrence
    const seen = new Set();
    const unique = [];
    for (const w of words) {
        if (!seen.has(w)) {
            seen.add(w);
            unique.push(w);
        }
    }

    // Ensure output directory exists
    await mkdir(path.dirname(outPath), { recursive: true });

    // Write one word per line with trailing newline
    await writeFile(outPath, unique.join("\n") + "\n", "utf8");

    console.log(`Read:  ${words.length} tokens from ${inPath}`);
    console.log(`Wrote: ${unique.length} unique words to ${outPath}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
