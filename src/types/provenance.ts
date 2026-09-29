/** Cultural provenance — the contract that makes an unattributed claim
 *  unrepresentable.
 *
 *  Every cultural assertion this application renders carries a `Provenance`.
 *  There is no default: a claim is either backed by citations to the curated
 *  source register, or it is declared an interpretation and says what it was
 *  derived from. The third case, `unverified`, exists only so authoring drafts
 *  type-check — `scripts/studio/catalog-build.mjs` fails the build if any
 *  shipped record still carries it.
 *
 *  Source *text* lives in exactly one place, `src/data/corpus/sources.ts`.
 *  Nothing else may introduce a source, and no type here has a free-text
 *  citation field — which is what stops a generated design inventing a
 *  reference. */

import type { LocalizedText } from "./i18n";

/** A `Source.id` from the register. At build time this is narrowed to a union
 *  of the actual ids, so an unknown source is a compile/validation failure
 *  rather than something a reviewer has to catch by eye. */
export type SourceId = string;

/** How much weight a source carries. Ordered strongest first: the official
 *  registry and government publications outrank academic work, which outranks
 *  press. A cultural claim resting only on `press` is a thin claim and the KPI
 *  report says so. */
export type SourceKind =
  | "official"    // DASC / Ministry of Culture / Heritage Commission publications
  | "unesco"      // World Heritage or Intangible Cultural Heritage inscriptions
  | "academic"    // peer-reviewed or scholarly monographs
  | "museum"      // museum or archive catalogues
  | "survey"      // documented field survey or measured drawings
  | "press"       // reputable reporting; weakest admissible kind
  | "field-photo"; // our own dated, located photography

export interface Source {
  id: SourceId;
  kind: SourceKind;
  title: string;
  titleAr?: string;
  author?: string;
  publisher?: string;
  year?: number;
  /** Stable locator: URL, DOI, ISBN or archive reference. */
  locator?: string;
  /** ISO date, required for web sources so a dead link is still auditable. */
  accessed?: string;
  /** True only for the Saudi Architecture Characters Map itself. Used to
   *  enforce that every official-map character cites the registry. */
  isOfficialRegistry?: boolean;
  /** Character ids this source actually covers. `culturalLint` rejects a
   *  citation whose source does not cover the character being described —
   *  the common way a real source gets attached to the wrong claim. */
  characterIds?: string[];
}

export interface Citation {
  sourceId: SourceId;
  /** Page, plate, clause or section, so a reader can find the claim rather
   *  than being handed a whole book. */
  locus?: string;
  /** Short supporting quote for reviewer audit only, never rendered as body
   *  copy. Keep well under fair-use length. */
  quote?: string;
  quoteAr?: string;
}

/** A documented claim. `citations` is non-empty by construction. */
export interface DocumentedProvenance {
  kind: "documented";
  citations: [Citation, ...Citation[]];
  /** Set when two or more mutually independent sources agree. Reported as a
   *  corroboration rate in the KPI sheet. */
  corroborated?: boolean;
}

/** Who produced an interpretation. `claude` must also set `model`. */
export type InterpretationAuthor = "studio-team" | "claude" | "visitor";

/** A contemporary reading, not a historical record. Cannot be constructed
 *  without naming the documented elements it draws on. */
export interface InterpretationProvenance {
  kind: "interpretation";
  /** `citations` is a plain array rather than a non-empty tuple, unlike
   *  `DocumentedProvenance`. The reason is where the guarantee lives: a
   *  generated interpretation is produced by the design-spec schema, whose
   *  `.min(1)` enforces non-emptiness at parse time, and zod infers that as
   *  `Citation[]`. Demanding a tuple here would mean casting every validated
   *  spec, which trades a real runtime check for a cosmetic compile-time one.
   *  Hand-authored documented claims keep the tuple, because nothing validates
   *  those at runtime. */
  derivedFrom: Array<{
    elementId: string;
    citations: Citation[];
  }>;
  author: InterpretationAuthor;
  /** Exact model id, e.g. "claude-opus-5". Required when author is "claude". */
  model?: string;
  /** ISO timestamp. */
  generatedAt?: string;
}

/** Authoring escape hatch. Legal in `scripts/studio/corpus/**` drafts only;
 *  the catalog build refuses to ship a record carrying it. */
export interface UnverifiedProvenance {
  kind: "unverified";
  note: string;
}

export type Provenance =
  | DocumentedProvenance
  | InterpretationProvenance
  | UnverifiedProvenance;

export const isDocumented = (p: Provenance): p is DocumentedProvenance =>
  p.kind === "documented";

export const isInterpretation = (p: Provenance): p is InterpretationProvenance =>
  p.kind === "interpretation";

export const isUnverified = (p: Provenance): p is UnverifiedProvenance =>
  p.kind === "unverified";

/** Every citation carried by a provenance, whatever its kind. Used by the
 *  source register page, the KPI counter and the CI provenance gate. */
export function citationsOf(p: Provenance): Citation[] {
  if (p.kind === "documented") return p.citations;
  if (p.kind === "interpretation") return p.derivedFrom.flatMap((d) => d.citations);
  return [];
}

/** A claim that carries its own attribution. Cultural records attach
 *  provenance per *field group* rather than per record, so a character can
 *  hold documented materials and an interpreted contemporary reading side by
 *  side without either borrowing the other's authority. */
export interface Claim {
  text: LocalizedText;
  provenance: Provenance;
}
