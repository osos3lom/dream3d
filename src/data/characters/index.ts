/** The character corpus, and the invariants that keep it honest.
 *
 *  The assertions at the bottom of this file run at module load, in development
 *  and in production. They are cheap (a few dozen array operations over static
 *  data) and they guard the one claim this product must never get wrong: which
 *  characters are on the official Saudi Architecture Characters Map.
 *
 *  A failed assertion is a thrown error at startup, not a warning. That is
 *  deliberate. A silent violation here would put a fabricated official character
 *  in front of a user, or attach the registry's authority to a character it does
 *  not cover, and either would be worse than a blank screen. The CI provenance
 *  gate repeats these checks at build time so the failure surfaces before
 *  deployment rather than on a visitor's first page load. */

import type { ArchCharacter, Typology } from "@/types/character";
import { OFFICIAL_CHARACTER_IDS, TYPOLOGIES } from "@/types/character";
import type { Language, LocalizedText } from "@/types/i18n";
import { citationsOf } from "@/types/provenance";

import { najdi } from "./najdi";
import { coastalHijazi } from "./coastalHijazi";
import { aseerSlopes } from "./aseerSlopes";
import { easternCoast } from "./easternCoast";
import { salmani } from "./salmani";
import { REGISTRY_ONLY_CHARACTERS, isRegistryOnly } from "./registryOnly";

/** Characters with authored reference material. */
const AUTHORED: ArchCharacter[] = [najdi, coastalHijazi, aseerSlopes, easternCoast];

/** Everything, official and otherwise, sorted so official-map characters come
 *  first in their registry order and documented-other characters follow. */
export const CHARACTERS: ArchCharacter[] = [
  ...[...AUTHORED, ...REGISTRY_ONLY_CHARACTERS].sort(
    (a, b) => (a.officialIndex ?? 999) - (b.officialIndex ?? 999),
  ),
  salmani,
];

const BY_ID = new Map<string, ArchCharacter>(CHARACTERS.map((c) => [c.id, c]));

export const characterById = (id: string): ArchCharacter | undefined => BY_ID.get(id);

/** The nineteen, in registry order. */
export const officialCharacters = (): ArchCharacter[] =>
  CHARACTERS.filter((c) => c.registry === "official-map");

/** Characters that are documented but not on the official map. */
export const otherCharacters = (): ArchCharacter[] =>
  CHARACTERS.filter((c) => c.registry === "documented-other");

export const DEFAULT_CHARACTER_ID = "najdi";

/** Pick the active language out of a bilingual field. Both sides are required by
 *  the type, so unlike `getLocalizedEmpire` there is no silent fallback to
 *  English — a missing translation is a compile error, not a runtime surprise. */
export const t = (text: LocalizedText, lang: Language): string => text[lang];

/** Characters grouped by region label, for the characters index page. */
export function charactersByRegion(lang: Language): Array<{ region: string; characters: ArchCharacter[] }> {
  const groups = new Map<string, ArchCharacter[]>();
  for (const c of officialCharacters()) {
    const key = t(c.region, lang);
    const list = groups.get(key);
    if (list) list.push(c);
    else groups.set(key, [c]);
  }
  return [...groups.entries()].map(([region, characters]) => ({ region, characters }));
}

/** Cells (character × typology) that have authored reference material, over the
 *  total of 19 × 3. Reported by the KPI sheet, so coverage is stated as it is
 *  rather than implied by the file count. */
export function cellCoverage(): { written: number; total: number } {
  const total = officialCharacters().length * TYPOLOGIES.length;
  let written = 0;
  for (const c of officialCharacters()) {
    for (const ty of TYPOLOGIES) {
      const p = c.typologies[ty];
      if (p.elementIds.length > 0 && p.provenance.kind !== "unverified") written += 1;
    }
  }
  return { written, total };
}

/** Characters still carrying nothing but their registry entry. */
export const registryOnlyCharacters = (): ArchCharacter[] =>
  officialCharacters().filter(isRegistryOnly);

export { isRegistryOnly };

// ───────────────────────────────────────────────────── invariants

function fail(message: string): never {
  throw new Error(`[character corpus] ${message}`);
}

(function assertCorpusIntegrity() {
  // No duplicate ids anywhere.
  if (BY_ID.size !== CHARACTERS.length) {
    const seen = new Set<string>();
    const dupes = CHARACTERS.map((c) => c.id).filter((id) => (seen.has(id) ? true : (seen.add(id), false)));
    fail(`duplicate character ids: ${[...new Set(dupes)].join(", ")}`);
  }

  const official = CHARACTERS.filter((c) => c.registry === "official-map");

  // Exactly nineteen, and exactly the expected nineteen. This is what stops a
  // twentieth official character being introduced by accident.
  if (official.length !== OFFICIAL_CHARACTER_IDS.length) {
    fail(
      `expected ${OFFICIAL_CHARACTER_IDS.length} official-map characters, found ${official.length}`,
    );
  }
  const expected = new Set<string>(OFFICIAL_CHARACTER_IDS);
  for (const c of official) {
    if (!expected.has(c.id)) {
      fail(`"${c.id}" is marked registry:"official-map" but is not one of the nineteen`);
    }
  }
  for (const id of OFFICIAL_CHARACTER_IDS) {
    if (!official.some((c) => c.id === id)) fail(`official character "${id}" is missing from the corpus`);
  }

  // officialIndex present, in range, and unique.
  const indices = new Set<number>();
  for (const c of official) {
    if (typeof c.officialIndex !== "number") {
      fail(`"${c.id}" is on the official map but has no officialIndex`);
    }
    if (c.officialIndex < 1 || c.officialIndex > OFFICIAL_CHARACTER_IDS.length) {
      fail(`"${c.id}" has officialIndex ${c.officialIndex}, outside 1..${OFFICIAL_CHARACTER_IDS.length}`);
    }
    if (indices.has(c.officialIndex)) fail(`officialIndex ${c.officialIndex} is used twice`);
    indices.add(c.officialIndex);
  }

  // Every official-map character cites the registry. Without this, a character
  // could present itself as official while resting on no source at all.
  for (const c of official) {
    const cites = citationsOf(c.provenance).some(
      (cit) => cit.sourceId === "dasc-architecture-map-2025",
    );
    if (!cites) {
      fail(
        `"${c.id}" is on the official map but its provenance does not cite ` +
          `dasc-architecture-map-2025`,
      );
    }
  }

  // The converse: a documented-other character must NOT cite the registry, or it
  // would borrow official standing it does not have. This is the Salmani case.
  for (const c of CHARACTERS.filter((x) => x.registry === "documented-other")) {
    if (typeof c.officialIndex === "number") {
      fail(`"${c.id}" is registry:"documented-other" but carries an officialIndex`);
    }
    const cites = citationsOf(c.provenance).some(
      (cit) => cit.sourceId === "dasc-architecture-map-2025",
    );
    if (cites) {
      fail(
        `"${c.id}" is not on the official map but cites dasc-architecture-map-2025, ` +
          `which would imply official standing it does not have`,
      );
    }
  }

  // All three typologies present and correctly keyed.
  for (const c of CHARACTERS) {
    for (const ty of TYPOLOGIES) {
      const p: { typology: Typology } | undefined = c.typologies[ty];
      if (!p) fail(`"${c.id}" is missing the "${ty}" typology`);
      if (p.typology !== ty) {
        fail(`"${c.id}" has typology "${p.typology}" filed under the "${ty}" key`);
      }
    }
  }
})();
