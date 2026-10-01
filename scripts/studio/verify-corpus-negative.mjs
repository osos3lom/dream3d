/** Negative tests for the corpus invariants.
 *
 *  A guard that has never been seen to fail is not known to work. This script
 *  copies the source tree to a scratch directory, introduces one deliberate
 *  violation at a time, and asserts that `verify-corpus` refuses to pass. If a
 *  case stops failing, either the invariant was weakened or the patch no longer
 *  matches the source — both are worth a build failure.
 *
 *  Each case is a real cultural-integrity rule, not a synthetic assertion:
 *  every one of them describes a way the product could misrepresent Saudi
 *  architectural heritage if the guard were absent.
 *
 *  Run: npm run verify:corpus:negative */

import { execFileSync } from "node:child_process";
import { build } from "esbuild";
import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const repo = fileURLToPath(new URL("../..", import.meta.url));

/** @typedef {{ name: string, why: string, file: string, find: string | RegExp, replace: string, expect: RegExp }} Case */

/** @type {Case[]} */
const CASES = [
  {
    name: "a twentieth official-map character",
    why: "The map has nineteen characters. A twentieth would present a fabricated character as national policy.",
    file: "src/data/characters/salmani.ts",
    find: 'registry: "documented-other",',
    replace: 'registry: "official-map",',
    expect: /expected 19 official-map characters, found 20/,
  },
  {
    name: "a documented-other character citing the official registry",
    why: "Citing the Characters Map for a character it does not cover borrows official standing. This is the Salmani case.",
    file: "src/data/characters/salmani.ts",
    find: /const pending: Provenance = \{[\s\S]*?\n\};/,
    replace:
      'const pending: Provenance = {\n  kind: "documented",\n' +
      '  citations: [{ sourceId: "dasc-architecture-map-2025" }],\n};',
    expect: /is not on the official map but cites dasc-architecture-map-2025/,
  },
  {
    name: "a duplicated officialIndex",
    why: "Two characters claiming the same position in the registry means at least one is wrong.",
    file: "src/data/characters/najdi.ts",
    find: "officialIndex: 1,",
    replace: "officialIndex: 7,",
    expect: /officialIndex 7 is used twice/,
  },
  {
    name: "a fabricated source id",
    why: "This is what an invented citation looks like. It must not be representable.",
    file: "src/data/characters/najdi.ts",
    find: "unesco-whc-1329-at-turaif",
    replace: "unesco-whc-9999-fabricated",
    expect: /unknown sourceId "unesco-whc-9999-fabricated"/,
  },
  {
    name: "Al-Qatt Al-Asiri widened to exterior surfaces",
    why: "The UNESCO inscription describes a female interior wall decoration. Painting it across a street facade misrepresents the tradition.",
    file: "src/data/corpus/elements.ts",
    find: 'surfaces: ["interior"],',
    replace: 'surfaces: ["interior", "exterior"],',
    expect: /al-qatt placement\.surfaces/,
  },
  {
    name: "cross-character blending in the corpus",
    why: "A roshan is Hijazi. Listing it under Najdi would put it in the vocabulary the generator is handed.",
    file: "src/data/characters/najdi.ts",
    find: 'elementIds: ["shurfat", "furjat", "tarma", "hosh", "burj"],',
    replace: 'elementIds: ["shurfat", "furjat", "tarma", "hosh", "burj", "roshan"],',
    expect: /does not attest najdi at/,
  },
  {
    name: "a claim-bearing field with no Arabic",
    why: "Arabic is not a translation layer here; a cultural claim that exists only in English is incomplete.",
    file: "src/data/corpus/elements.ts",
    find: 'ar: "الحوش" }',
    replace: 'ar: "" }',
    expect: /missing Arabic/,
  },
];

let failures = 0;
console.log("");
console.log("Corpus invariant negative tests");
console.log("-".repeat(64));

for (const c of CASES) {
  const dir = mkdtempSync(join(tmpdir(), "corpus-neg-"));
  try {
    cpSync(join(repo, "src"), join(dir, "src"), { recursive: true });
    cpSync(join(repo, "scripts"), join(dir, "scripts"), { recursive: true });

    const target = join(dir, c.file);
    const before = readFileSync(target, "utf8");
    const after = before.replace(c.find, c.replace);
    if (after === before) {
      console.log("  SKIP  " + c.name);
      console.log("        patch did not apply — the source moved, so this case is no longer testing anything");
      failures += 1;
      continue;
    }
    writeFileSync(target, after, "utf8");

    // Build first, and treat a build failure as a broken test rather than a
    // satisfied invariant — otherwise a typo in a patch would look like a pass.
    // esbuild's JS API is used directly: spawning the binary from inside the
    // scratch directory resolves nothing, and the resulting build error looks
    // exactly like a blocked invariant.
    try {
      await build({
        entryPoints: [join(dir, "scripts/studio/verify-corpus.mts")],
        bundle: true,
        platform: "node",
        format: "esm",
        alias: { "@": join(dir, "src") },
        // The corpus reaches src/data/index.ts, which re-bases asset paths
        // through Vite's import.meta.env. Node has no such thing, so define it —
        // without this the bundle builds but crashes at runtime, and every case
        // below would "block" for the wrong reason.
        define: { "import.meta.env.BASE_URL": JSON.stringify("/") },
        outfile: join(dir, "out.mjs"),
        logLevel: "silent",
      });
    } catch (err) {
      console.log("  ERROR " + c.name);
      console.log("        the patched tree did not build, so the invariant was never reached:");
      console.log("        " + (String(err.stderr ?? err.stdout ?? err).split("\n")[0] || "").trim());
      failures += 1;
      continue;
    }

    let output = "";
    let blocked = false;
    try {
      output = execFileSync(process.execPath, ["out.mjs"], { cwd: dir, stdio: "pipe" }).toString();
    } catch (err) {
      blocked = true;
      output = String(err.stdout ?? "") + String(err.stderr ?? "");
    }

    if (!blocked) {
      console.log("  FAIL  " + c.name);
      console.log("        expected the corpus check to refuse this, but it passed");
      failures += 1;
    } else if (!c.expect.test(output)) {
      console.log("  FAIL  " + c.name);
      console.log("        blocked, but not for the expected reason (" + c.expect + ")");
      failures += 1;
    } else {
      console.log("  pass  " + c.name);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

console.log("");
if (failures > 0) {
  console.error(failures + " of " + CASES.length + " invariant(s) are not being enforced as expected.");
  process.exit(1);
}
console.log("all " + CASES.length + " invariants enforced");
