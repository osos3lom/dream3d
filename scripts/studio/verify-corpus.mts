/** Corpus integrity check, runnable outside the browser.
 *
 *  Importing the corpus is itself most of the test: the assertions in
 *  src/data/characters/index.ts run at module load and throw on any violation.
 *  This script adds the checks that need to walk the data rather than guard it —
 *  citation resolution, source coverage, cross-references, parameter sanity and
 *  the Arabic completeness audit — and prints a coverage summary.
 *
 *  Run: npm run verify:corpus
 *  With STRICT_PROVENANCE=1, any record still marked `unverified` becomes
 *  blocking. That switch goes on before anything is published; until then the
 *  count is reported as a warning so corpus thinness is visible rather than
 *  silently tolerated.
 *
 *  Exit code is non-zero on any blocking failure, so CI can gate on it. */

import { CHARACTERS, officialCharacters, cellCoverage, registryOnlyCharacters, characterById } from "@/data/characters";
import { EMPIRES } from "@/data/index";
import { ELEMENTS, unverifiedElementCount } from "@/data/corpus/elements";
import { SOURCES, isRegisteredSource, sourceCovers } from "@/data/corpus/sources";
import { PALETTES, paletteById } from "@/data/corpus/palettes";
import { citationsOf } from "@/types/provenance";
import { TYPOLOGIES } from "@/types/character";

const errors: string[] = [];
const warnings: string[] = [];

/** Accept both a flag and an env var. The flag is what the npm script uses,
 *  because `VAR=1 node ...` is not portable to the Windows shell npm runs. */
const STRICT = process.argv.includes("--strict") || process.env.STRICT_PROVENANCE === "1";

// ── every citation resolves to a registered source ──────────────────────────
for (const c of CHARACTERS) {
  const pools = [
    { where: "character " + c.id, p: c.provenance },
    { where: "character " + c.id + " climate", p: c.climate.provenance },
    ...TYPOLOGIES.map((ty) => ({ where: "character " + c.id + " / " + ty, p: c.typologies[ty].provenance })),
  ];
  for (const { where, p } of pools) {
    for (const cit of citationsOf(p)) {
      if (!isRegisteredSource(cit.sourceId)) {
        errors.push(where + ': unknown sourceId "' + cit.sourceId + '"');
      }
    }
  }
}

for (const el of ELEMENTS) {
  const pools = [
    { where: "element " + el.id, p: el.provenance },
    ...el.params.map((pm) => ({ where: "element " + el.id + " param " + pm.key, p: pm.provenance })),
    ...el.attestedIn.map((a) => ({ where: "element " + el.id + " attestation " + a.characterId, p: a.provenance })),
  ];
  for (const { where, p } of pools) {
    for (const cit of citationsOf(p)) {
      if (!isRegisteredSource(cit.sourceId)) {
        errors.push(where + ': unknown sourceId "' + cit.sourceId + '"');
      }
    }
  }
}

// ── documented claims must carry at least one citation ──────────────────────
const allProvenance = [
  ...CHARACTERS.flatMap((c) => [
    c.provenance,
    c.climate.provenance,
    ...TYPOLOGIES.map((ty) => c.typologies[ty].provenance),
  ]),
  ...ELEMENTS.flatMap((el) => [
    el.provenance,
    ...el.params.map((p) => p.provenance),
    ...el.attestedIn.map((a) => a.provenance),
  ]),
];
for (const p of allProvenance) {
  if (p.kind === "documented" && p.citations.length === 0) {
    errors.push("a documented claim carries an empty citations array");
  }
}

// ── an attestation's cited source must actually cover that character ────────
for (const el of ELEMENTS) {
  for (const a of el.attestedIn) {
    for (const cit of citationsOf(a.provenance)) {
      if (!sourceCovers(cit.sourceId, a.characterId)) {
        warnings.push(
          "element " + el.id + ': source "' + cit.sourceId + '" does not list "' +
            a.characterId + '" in its characterIds',
        );
      }
    }
  }
}

// ── cross-references resolve ────────────────────────────────────────────────
const charIds = new Set(CHARACTERS.map((c) => c.id));
const elIds = new Set(ELEMENTS.map((e) => e.id));

for (const el of ELEMENTS) {
  for (const a of el.attestedIn) {
    if (!charIds.has(a.characterId)) {
      errors.push("element " + el.id + ' attests unknown character "' + a.characterId + '"');
    }
  }
}
for (const c of CHARACTERS) {
  for (const ty of TYPOLOGIES) {
    for (const id of c.typologies[ty].elementIds) {
      if (!elIds.has(id)) {
        errors.push("character " + c.id + "/" + ty + ' lists unknown element "' + id + '"');
      }
    }
    for (const pid of c.typologies[ty].materialIds) {
      if (!paletteById(pid)) {
        errors.push("character " + c.id + "/" + ty + ' lists unknown palette "' + pid + '"');
      }
    }
  }
}

// ── a typology may only list elements that attest that character+typology ───
// This is the check that keeps cross-character blending out of the corpus, and
// therefore out of the vocabulary the generator is ever handed.
for (const c of CHARACTERS) {
  for (const ty of TYPOLOGIES) {
    for (const id of c.typologies[ty].elementIds) {
      const el = ELEMENTS.find((e) => e.id === id);
      if (!el) continue;
      const ok = el.attestedIn.some((a) => a.characterId === c.id && a.typologies.includes(ty));
      if (!ok) {
        errors.push(
          "character " + c.id + "/" + ty + ' lists element "' + id +
            '", but that element does not attest ' + c.id + " at " + ty,
        );
      }
    }
  }
}

// ── Arabic completeness on claim-bearing fields ─────────────────────────────
for (const c of CHARACTERS) {
  const fields = { name: c.name, region: c.region, tagline: c.tagline, description: c.description };
  for (const [field, v] of Object.entries(fields)) {
    if (!v.ar || !v.ar.trim()) errors.push("character " + c.id + ": missing Arabic for " + field);
  }
}
for (const el of ELEMENTS) {
  const fields = { name: el.name, gloss: el.gloss, rationale: el.rationale };
  for (const [field, v] of Object.entries(fields)) {
    if (!v.ar || !v.ar.trim()) errors.push("element " + el.id + ": missing Arabic for " + field);
  }
  if (!el.term.ar || !el.term.ar.trim()) errors.push("element " + el.id + ": missing Arabic term");
}

// ── builders declared for both pipelines ───────────────────────────────────
for (const el of ELEMENTS) {
  if (!el.builder.ts || !el.builder.ts.trim()) errors.push("element " + el.id + ": no TS builder named");
  if (!el.builder.py || !el.builder.py.trim()) errors.push("element " + el.id + ": no Python builder named");
}

// ── parameter sanity ───────────────────────────────────────────────────────
for (const el of ELEMENTS) {
  for (const p of el.params) {
    if (p.min > p.max) errors.push("element " + el.id + " param " + p.key + ": min exceeds max");
    if (p.default < p.min || p.default > p.max) {
      errors.push(
        "element " + el.id + " param " + p.key + ": default " + p.default +
          " outside [" + p.min + ", " + p.max + "]",
      );
    }
    if (p.documentedRange) {
      const lo = p.documentedRange[0];
      const hi = p.documentedRange[1];
      if (lo > hi) errors.push("element " + el.id + " param " + p.key + ": documentedRange inverted");
      if (lo < p.min || hi > p.max) {
        errors.push(
          "element " + el.id + " param " + p.key + ": documentedRange [" + lo + ", " + hi +
            "] escapes [" + p.min + ", " + p.max + "]",
        );
      }
    }
  }
}

// ── al-qatt guardrail: this one is named explicitly, on purpose ─────────────
// The UNESCO inscription describes an interior practice. If a future edit ever
// widens this element to exterior surfaces, the build should stop and make
// someone justify it, rather than the change slipping through a diff review.
const qatt = ELEMENTS.find((e) => e.id === "al-qatt");
if (!qatt) {
  warnings.push("al-qatt element is absent; the interior-only guardrail is not being exercised");
} else if (qatt.placement.surfaces.some((s) => s !== "interior")) {
  errors.push(
    "al-qatt placement.surfaces is [" + qatt.placement.surfaces.join(", ") + "] — the UNESCO " +
      "inscription describes a female INTERIOR wall decoration, so exterior placement " +
      "misrepresents the tradition. If this is intentional, cite a source that supports it.",
  );
}

// ── exhibits are linked to the taxonomy ────────────────────────────────────
for (const e of EMPIRES) {
  if (!e.characterId) {
    errors.push('exhibit "' + e.id + '" has no characterId — it is not linked to a character');
  } else if (!characterById(e.characterId)) {
    errors.push('exhibit "' + e.id + '" links unknown character "' + e.characterId + '"');
  }
  if (!e.typology) {
    errors.push('exhibit "' + e.id + '" has no typology; an exhibit must say which of the three it is');
  }
  for (const h of e.hotspots) {
    if (h.elementId && !elIds.has(h.elementId)) {
      errors.push('exhibit "' + e.id + '" hotspot "' + h.id + '" links unknown element "' + h.elementId + '"');
    }
  }
}

// ── a typology's exhibitId must resolve, and must agree with the exhibit ────
const exhibitIds = new Set(EMPIRES.map((e) => e.id));
for (const c of CHARACTERS) {
  for (const ty of TYPOLOGIES) {
    const ref = c.typologies[ty].exhibitId;
    if (!ref) continue;
    if (!exhibitIds.has(ref)) {
      errors.push("character " + c.id + "/" + ty + ' references unknown exhibit "' + ref + '"');
      continue;
    }
    const ex = EMPIRES.find((e) => e.id === ref)!;
    if (ex.characterId !== c.id) {
      errors.push(
        "character " + c.id + "/" + ty + ' claims exhibit "' + ref +
          '", but that exhibit is linked to "' + ex.characterId + '"',
      );
    }
    if (ex.typology !== ty) {
      errors.push(
        "character " + c.id + "/" + ty + ' claims exhibit "' + ref +
          '", but that exhibit is typology "' + ex.typology + '"',
      );
    }
  }
}

// ── a hotspot must not place an element where that element forbids ─────────
// Same rule culturalLint applies to a generated spec, applied to the authored
// exhibits. This is what caught the Al-Qatt exterior question.
for (const e of EMPIRES) {
  for (const h of e.hotspots) {
    if (!h.elementId) continue;
    const el = ELEMENTS.find((x) => x.id === h.elementId);
    if (!el) continue;
    const exteriorish = h.snap === "wall" || h.snap === "roof" || h.category === "facade" || h.category === "roof";
    const allowsExterior = el.placement.surfaces.includes("exterior") || el.placement.surfaces.includes("roof");
    if (exteriorish && !allowsExterior) {
      warnings.push(
        'exhibit "' + e.id + '" hotspot "' + h.id + '" places element "' + el.id +
          '" on an exterior surface, but that element is restricted to [' +
          el.placement.surfaces.join(", ") + "] — see the review note in the style file",
      );
    }
  }
}

// ── unverified records: counted always, blocking only under STRICT ─────────
const unverifiedElements = unverifiedElementCount();
const unverifiedChars = CHARACTERS.filter((c) => c.provenance.kind === "unverified").length;
const note =
  unverifiedElements + " element record(s) and " + unverifiedChars +
  " character record(s) still marked unverified";
if (STRICT) errors.push("STRICT_PROVENANCE: " + note);
else warnings.push(note);

// ── report ─────────────────────────────────────────────────────────────────
const cov = cellCoverage();
const official = officialCharacters();
const authored = official.length - registryOnlyCharacters().length;

console.log("");
console.log("Saudi Architecture corpus");
console.log("-".repeat(58));
console.log("  official-map characters     " + official.length + " / 19");
console.log("  authored (not placeholder)  " + authored + " / 19");
console.log("  documented-other            " + CHARACTERS.filter((c) => c.registry === "documented-other").length);
console.log("  cells with material         " + cov.written + " / " + cov.total);
console.log("  cultural elements           " + ELEMENTS.length);
console.log("  registered sources          " + SOURCES.length);
console.log("  material palettes           " + PALETTES.length);
console.log("  linked exhibits             " + EMPIRES.filter((e) => e.characterId).length + " / " + EMPIRES.length);
console.log("  strict provenance           " + (STRICT ? "ON (publication mode)" : "off (authoring mode)"));
console.log("");

if (warnings.length) {
  console.log("warnings (" + warnings.length + "):");
  for (const w of warnings) console.log("  . " + w);
  console.log("");
}
if (errors.length) {
  console.error("BLOCKING (" + errors.length + "):");
  for (const e of errors) console.error("  x " + e);
  console.error("");
  process.exit(1);
}
console.log("corpus integrity OK");
