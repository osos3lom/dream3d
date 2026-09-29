/** Empire Atlas — core data contracts.
 *  The entire application is driven by these types; adding a new empire
 *  means adding data + assets, never touching the viewer or UI. */

import type { Typology } from "./character";
import type { Provenance } from "./provenance";

export type Vec3 = [number, number, number];

/** Hotspot anchor, expressed in *normalised model space*:
 *  x/z are fractions across the model footprint (0..1, min→max),
 *  y is a fraction of model height (0..1). Converted to world
 *  coordinates after the model is normalised. */
export interface Hotspot {
  id: string;
  title: string;
  /** one-line italic summary shown on the floating label */
  short: string;
  /** longer educational description shown when activated */
  detail: string;
  category: "structure" | "roof" | "court" | "entrance" | "interior" | "artifact-zone" | "facade";
  /** Placed against the model's bounding box; the viewer snaps it onto the
   *  nearest real surface so the pin sits on the building, not in the air. */
  anchor: Vec3;
  /** Which kind of surface the pin belongs on. The viewer resolves this
   *  against the model's own geometry, so a pin lands on the feature it
   *  names whatever the dwelling's shape:
   *  - "roof"  the highest built mass nearest the anchor
   *  - "court" the open low ground enclosed by that mass
   *  - "wall"  the outer skin, met by coming in horizontally from outside
   *  The anchor then only steers *which* roof, court or wall. */
  snap?: "roof" | "court" | "wall";
  /** @deprecated Annotations now appear on hover at the pin, so labels no
   *  longer float at a fixed offset. Retained so existing data still type-checks. */
  labelOffset?: [number, number];
  /** how strongly the camera pushes in when activated (1 = default) */
  focus?: number;
  /** The cultural element this pin names, when it is one from the library
   *  (`src/data/corpus/elements.ts`). Lets the pin show the element's citations
   *  and its placement constraints rather than just prose. */
  elementId?: string;
  /** Attribution for the claim made in `detail`. Optional for now because the
   *  five existing exhibits predate the provenance layer; required for anything
   *  authored from here on. */
  provenance?: Provenance;
}

export interface KeyFact {
  label: string;
  value: string;
  icon: "period" | "region" | "materials" | "feature" | "occupants";
}

export interface Artifact {
  name: string;
  purpose: string;
  material: string;
  context: string;
}

export interface QuizQuestion {
  q: string;
  choices: string[];
  answer: number;
  explanation: string;
}

export interface TimelineEntry {
  era: string;
  year: string;
  text: string;
}

export interface CameraPreset {
  /** azimuth in degrees (0 = +Z front, positive orbits right) */
  azimuth: number;
  /** elevation in degrees above horizon */
  elevation: number;
  /** distance multiplier relative to auto-framing */
  dist: number;
  /** vertical framing bias: fraction of model height for look-at */
  targetY: number;
}

export interface EmpireSection {
  title: string;
  kicker: string;
  cta: string;
  text: string;
  /** image path under /img */
  image: string;
}

export interface FloorPlanSection extends EmpireSection {
  rooms: FloorPlanRoom[];
  /** Measured, bilingual vector plan, shown in the floor-plan detail view.
   *  `image` stays the card thumbnail: this one is drawn for reading at full
   *  size and would be illegible cropped into a 16:9 tile. */
  plan?: string;
}

export interface FloorPlanRoom {
  name: string;
  note?: string;
}

export interface LessonBlock {
  heading: string;
  body: string;
}

export interface EmpireArabicData {
  name?: string;
  dwelling?: string;
  subtitle?: string;
  description?: string;
  facts?: Array<{ label?: string; value?: string }>;
  hotspots?: Array<{ id: string; title?: string; short?: string; detail?: string }>;
  interior?: { kicker?: string; title?: string; cta?: string; text?: string };
  floorPlan?: { kicker?: string; title?: string; cta?: string; text?: string; rooms?: Array<{ name?: string; note?: string }> };
  artifacts?: { kicker?: string; title?: string; cta?: string; text?: string; items?: Array<{ name?: string; purpose?: string; material?: string; context?: string }> };
  dailyLife?: { kicker?: string; title?: string; cta?: string; text?: string };
  geography?: { kicker?: string; title?: string; cta?: string; text?: string; regionLabel?: string };
  lesson?: { title?: string; intro?: string; blocks?: Array<{ heading?: string; body?: string }> };
  quiz?: Array<{ q?: string; choices?: string[]; explanation?: string }>;
  timeline?: Array<{ era?: string; year?: string; text?: string }>;
}

export interface Empire {
  id: string;
  name: string;
  dwelling: string;
  subtitle: string;
  description: string;
  modelPath: string;
  /** Photoreal exterior render, used where the villa is given a full-width
   *  presentation. Optional: styles without one fall back to `hero`. */
  ultraHero?: string;
  /** Small-screen / fallback exterior render. Optional: styles without one
   *  fall back to the flat massing render at `/img/<id>/hero.webp`. */
  hero?: string;
  /** per-empire warm accent used for subtle scene tinting */
  tint: string;
  camera: CameraPreset;
  facts: KeyFact[];
  hotspots: Hotspot[];
  interior: EmpireSection;
  floorPlan: FloorPlanSection;
  artifacts: EmpireSection & { items: Artifact[] };
  dailyLife: EmpireSection;
  geography: EmpireSection & { regionLabel: string };
  lesson: { title: string; intro: string; blocks: LessonBlock[] };
  quiz: QuizQuestion[];
  timeline: TimelineEntry[];
  keywords: string[];
  ar?: EmpireArabicData;

  /** Which architectural character this villa interprets — an `ArchCharacter.id`
   *  from `src/data/characters`. Optional during migration; `verify:corpus`
   *  reports any exhibit still missing it. */
  characterId?: string;
  /** Which of the three design typologies this villa is. All five of the
   *  original villas are contemporary interpretations, not reconstructions. */
  typology?: Typology;
  /** Exhibit-level attribution. */
  provenance?: Provenance;
}
