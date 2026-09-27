/** Saudi architectural character taxonomy.
 *
 *  Anchored to the Saudi Architecture Characters Map (طابع العمارة السعودية),
 *  launched 16 March 2025 and published by the Architecture and Design
 *  Commission (DASC) of the Ministry of Culture: nineteen architectural
 *  characters defined by natural, geographic and cultural region rather than
 *  administrative boundary, each expressed in three design typologies.
 *
 *  This file draws one distinction that the rest of the application depends
 *  on: the nineteen characters of the official map are not the same kind of
 *  thing as other documented regional characters. Salmani, for instance, is
 *  real, cited and worth modelling, but it is not on the map. `registry` keeps
 *  the two apart so the UI can never imply official standing that a character
 *  does not have. */

import type { LocalizedText } from "./i18n";
import type { Provenance } from "./provenance";

/** Which register a character belongs to.
 *  - `official-map`: one of the nineteen. `officialIndex` is required, and the
 *    character's provenance must cite the registry source.
 *  - `documented-other`: attested and cited, but not on the official map. */
export type CharacterRegistry = "official-map" | "documented-other";

/** The three design typologies the map defines for every character. */
export type Typology = "traditional" | "transitional" | "contemporary";

export const TYPOLOGIES: readonly Typology[] = [
  "traditional",
  "transitional",
  "contemporary",
] as const;

/** The nineteen official characters, in the order the DASC portal presents
 *  them. `src/data/characters/index.ts` asserts at module load that exactly
 *  these nineteen ids carry `registry: "official-map"`, each with a unique
 *  `officialIndex` in 1..19. No code path can introduce a twentieth. */
export const OFFICIAL_CHARACTER_IDS = [
  "najdi",
  "northern-najdi",
  "eastern-najdi",
  "tabuk-coast",
  "al-madinah",
  "al-madinah-rural",
  "taif",
  "coastal-hijazi",
  "aseer-slopes",
  "sarawat-mountains",
  "tihamah-coast",
  "tihamah-foothills",
  "abha-highlands",
  "bisha-desert",
  "farasan-islands",
  "najran",
  "al-qatif",
  "al-ahsa-oasis",
  "eastern-coast",
] as const;

export type OfficialCharacterId = (typeof OFFICIAL_CHARACTER_IDS)[number];

export const isOfficialCharacterId = (id: string): id is OfficialCharacterId =>
  (OFFICIAL_CHARACTER_IDS as readonly string[]).includes(id);

/** The environmental problem a traditional form solves. Drives the "why this
 *  element" copy, and grounds the studio's generation prompt in something
 *  causal rather than stylistic. */
export type ClimateDriver =
  | "solar-gain"
  | "sand-wind"
  | "thermal-mass"
  | "cross-ventilation"
  | "flood"
  | "privacy"
  | "salt-air"
  | "rainfall"
  | "altitude-cold";

export interface ClimateProfile {
  /** Typical summer high range in °C, [low, high]. */
  summerHighC: [number, number];
  humidity: "arid" | "semi-arid" | "humid-coastal" | "highland";
  drivers: ClimateDriver[];
  provenance: Provenance;
}

/** One cell of the 19 × 3 matrix. Most cells will have a written profile long
 *  before any of them has a 3D exhibit, which is deliberate: coverage of the
 *  reference material leads, and modelling follows. */
export interface TypologyProfile {
  typology: Typology;
  summary: LocalizedText;
  /** Period the typology is attested for. Free text because sources disagree
   *  and a false precision here would be its own kind of inaccuracy. */
  period: LocalizedText;
  /** Element ids attested for THIS character at THIS typology. The studio
   *  narrows the generator's entire allowed vocabulary to this list, which is
   *  what makes cross-character blending structurally impossible rather than
   *  merely discouraged. */
  elementIds: string[];
  /** Material palette ids from `src/data/corpus/palettes.ts`. */
  materialIds: string[];
  provenance: Provenance;
  /** The curated 3D exhibit for this cell, when one exists. Links to an
   *  `Empire.id`. */
  exhibitId?: string;
  /** Curated catalog design ids available for this cell. */
  catalogIds?: string[];
}

export interface ArchCharacter {
  id: string;
  registry: CharacterRegistry;
  /** 1..19, present if and only if `registry === "official-map"`. */
  officialIndex?: number;
  name: LocalizedText;
  /** Region grouping as the official map expresses it, e.g. "Makkah Province". */
  region: LocalizedText;
  /** One line for cards and list rows. */
  tagline: LocalizedText;
  description: LocalizedText;
  climate: ClimateProfile;
  /** All three typologies. A cell with no research yet still carries a profile
   *  marked honestly rather than being omitted, so the UI can say "reference
   *  in progress" instead of rendering a confident blank. */
  typologies: Record<Typology, TypologyProfile>;
  /** Character-level attribution. For `official-map` characters this must
   *  include the registry source; the CI provenance gate enforces it. */
  provenance: Provenance;
  /** Approximate [longitude, latitude] centroid, for the characters map. */
  centroid: [number, number];
  /** Warm accent used for scene tinting, same role as `Empire.tint`. */
  tint: string;
  keywords: LocalizedText & { extra?: string[] };
}

/** True when a character may be presented as part of the official map. */
export const isOnOfficialMap = (c: ArchCharacter): boolean =>
  c.registry === "official-map";
