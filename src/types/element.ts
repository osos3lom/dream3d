/** The cultural element library — where culture meets parameters.
 *
 *  An element is a named architectural device attested in the sources: a
 *  roshan, a furjat band, shurfat, a tarma. Each one carries its own
 *  attribution, the environmental job it does, the bounded parameters that
 *  describe it, and — importantly — the constraints on where it may legally
 *  appear.
 *
 *  Two properties of this file do the real authenticity work:
 *
 *  1. `name`, `term` and every other human-readable string live HERE, authored
 *     and reviewed by people. A generated design spec carries `elementId`
 *     only. A model therefore cannot coin an Arabic term, which is both the
 *     most damaging cultural error available to it and the hardest for a
 *     non-specialist reviewer to catch.
 *
 *  2. `ElementParam` separates the range a value may technically take from the
 *     range the sources actually document. A shurfat scaled three times over is
 *     still "shurfat" to a schema, but it is no longer the thing the source
 *     describes, and the UI says so. */

import type { LocalizedText } from "./i18n";
import type { Provenance } from "./provenance";
import type { Typology } from "./character";

export type ElementKind =
  | "massing"      // courtyard block, wing, tower (burj), podium
  | "opening"      // window bay, door, arched opening, light slit
  | "screen"       // mashrabiya, roshan, lattice, mangour
  | "crown"        // parapet, shurfat, coping, cornice
  | "perforation"  // furjat, triangular vent band, qamariya
  | "projection"   // tarma, balcony, canopy, eave
  | "surface"      // band, rib, plaster relief, stone course
  | "court"        // hosh, liwan, pool, pergola
  | "roofscape"    // roof majlis, stair box, terrace
  | "ground";      // planting, paving, boundary wall

/** Which face of a mass an element may sit on, by what that face looks at. */
export type FaceExposure = "street" | "court" | "side" | "rear" | "any";

/** Vertical band of a mass an element may occupy. */
export type PlacementZone =
  | "plinth"
  | "ground"
  | "upper"
  | "crown"
  | "roof"
  | "ground-plane";

/** A surface an element may be applied to. Distinct from `PlacementZone`:
 *  this is the interior/exterior question, and it exists because getting it
 *  wrong produces real cultural errors. Al-Qatt Al-Asiri, inscribed on
 *  UNESCO's Representative List of Intangible Cultural Heritage in 2017, is
 *  specifically a female *interior* wall decoration; rendering it across an
 *  exterior façade misrepresents the tradition. */
export type ApplicableSurface = "exterior" | "interior" | "roof" | "court";

/** A bounded numeric knob.
 *
 *  `min`/`max` are what the builder will accept — sometimes deliberately wider
 *  than the record, because a contemporary typology is allowed to depart.
 *  `documentedRange` is what the sources attest. A value inside min/max but
 *  outside `documentedRange` renders, and is flagged: the inspector and the
 *  share card both say the design has left documented territory. */
export interface ElementParam {
  key: string;
  label: LocalizedText;
  unit: "m" | "deg" | "count" | "ratio";
  min: number;
  max: number;
  default: number;
  step?: number;
  /** The surveyed range, when narrower than [min, max]. Shown in the UI as a
   *  marked band on the slider. */
  documentedRange?: [number, number];
  provenance: Provenance;
}

/** Where an element may legally appear. Enforced twice: by `culturalLint` on
 *  every spec regardless of origin, and by the studio UI, which will not offer
 *  an illegal placement in the first place. */
export interface ElementPlacement {
  faces: FaceExposure[];
  zone: PlacementZone[];
  surfaces: ApplicableSurface[];
  /** Cap on instances per wall face. Stops a forty-roshan façade that would be
   *  schema-valid and culturally absurd. */
  maxPerFace?: number;
  /** Why the constraint exists, in the user's language. Shown when the studio
   *  declines a placement, so a refusal teaches rather than just blocks. */
  notes?: LocalizedText;
}

/** Which character attests this element, and at which typologies. */
export interface ElementAttestation {
  characterId: string;
  typologies: Typology[];
  provenance: Provenance;
}

export interface CulturalElement {
  id: string;
  kind: ElementKind;
  /** Display name. Human-authored; never generated. */
  name: LocalizedText;
  /** Transliteration plus the Arabic term as the sources use it. */
  term: { translit: string; ar: string };
  /** One line: what it is. */
  gloss: LocalizedText;
  /** The environmental or social job it does — the "why" copy, and the part
   *  that makes the reference material genuinely educational rather than a
   *  catalogue of shapes. */
  rationale: LocalizedText;
  attestedIn: ElementAttestation[];
  params: ElementParam[];
  /** The two implementations that must stay in step: a builder in
   *  `src/three/parametric/elements.ts` for the browser, and a `villa_lib`
   *  helper for the offline Blender path. `verify-parity` asserts both names
   *  resolve, so an element cannot ship with only half a pipeline. */
  builder: { ts: string; py: string };
  placement: ElementPlacement;
  provenance: Provenance;
}

/** Elements this character attests at this typology. This intersection is the
 *  studio's entire allowed vocabulary for a brief — the generator is handed
 *  nothing else, so producing a cross-character design would require inventing
 *  an id, which validation rejects. */
export function allowedElements(
  elements: CulturalElement[],
  characterId: string,
  typology: Typology,
): CulturalElement[] {
  return elements.filter((el) =>
    el.attestedIn.some(
      (a) => a.characterId === characterId && a.typologies.includes(typology),
    ),
  );
}

/** Whether a parameter value has left the documented range. Drives the
 *  `param-outside-documented-range` warning. */
export function isOutsideDocumented(param: ElementParam, value: number): boolean {
  if (!param.documentedRange) return false;
  const [lo, hi] = param.documentedRange;
  return value < lo || value > hi;
}
