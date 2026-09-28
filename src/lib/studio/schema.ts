/** The parametric façade spec — one document, three renderers.
 *
 *  A design is data, not geometry. The browser builds it live, the Blender
 *  pipeline builds a production version of the same thing, and the curated
 *  catalog is a set of these files. Because all three read this schema, they
 *  cannot drift apart by accident.
 *
 *  The abstraction level is deliberately the shape `scripts/blender/najdi.py`
 *  already works in: rectangular volumes with per-face openings, a crown per
 *  volume, a site block, and a named material palette. That file is a spec
 *  already, expressed as Python calls; this is its data form.
 *
 *  ── Why the schema is the cultural control point ──────────────────────────
 *
 *  Two narrowing mechanisms do more work than any prompt instruction could:
 *
 *  1. `sourceId` is `z.enum(SOURCE_IDS)`. There is no free-text citation field
 *     anywhere in this file. A fabricated reference is a parse failure, not
 *     something a reviewer has to notice.
 *
 *  2. `buildRequestSchema(characterId, typology)` clones the schema with every
 *     `elementId` narrowed to the elements actually attested for that exact
 *     character and typology. A roshan on a Najdi brief is then unrepresentable
 *     in the output type — the model cannot express the blend, rather than
 *     being asked not to.
 *
 *  And `provenance.kind` is pinned to the literal `"interpretation"`: a
 *  generated design cannot claim to be documented. */

import { z } from "zod";
import { SOURCE_IDS } from "@/data/corpus/sources";
import { ELEMENTS, allowedElementIds } from "@/data/corpus/elements";
import { PALETTE_IDS } from "@/data/corpus/palettes";
import { TYPOLOGIES } from "@/types/character";
import type { Typology } from "@/types/character";

export const SPEC_VERSION = 1 as const;

/** zod needs a non-empty literal tuple; the corpus arrays are plain arrays. */
const tuple = <T extends string>(xs: readonly T[]): [T, ...T[]] => {
  if (xs.length === 0) throw new Error("cannot build an enum from an empty list");
  return xs as unknown as [T, ...T[]];
};

const ALL_ELEMENT_IDS = ELEMENTS.map((e) => e.id);

/** Coordinate contract, identical to `scripts/blender/villa_lib.py` (its module
 *  docstring states the same): metres, Z up, street front faces -Y. The browser
 *  kit converts to glTF Y-up at the end, exactly as `villa_lib.commit()` does. */
export const Face = z.enum(["S", "N", "W", "E"]);
export const Exposure = z.enum(["street", "court", "side", "rear"]);
export const Zone = z.enum(["plinth", "ground", "upper", "crown", "roof", "ground-plane"]);

const MaterialRef = z.string().min(1).max(24);
const Hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "expected a #rrggbb colour");

export const CitationSchema = z.strictObject({
  // The whole anti-fabrication mechanism is this one line.
  sourceId: z.enum(tuple(SOURCE_IDS)),
  locus: z.string().max(160).optional(),
});

/** A generated spec is always an interpretation. `z.literal` makes the
 *  alternative unrepresentable rather than merely discouraged. */
export const SpecProvenanceSchema = z.strictObject({
  kind: z.literal("interpretation"),
  derivedFrom: z
    .array(
      z.strictObject({
        elementId: z.string(),
        citations: z.array(CitationSchema).min(1),
      }),
    )
    .min(1),
  author: z.enum(["studio-team", "claude", "visitor"]),
  model: z.string().max(60).optional(),
  generatedAt: z.string().max(40).optional(),
});

export const PaletteSchema = z.strictObject({
  /** A curated palette is selected; colours are not invented. */
  paletteId: z.enum(tuple(PALETTE_IDS)),
  /** Bounded per-material overrides, so a designer can warm a render without
   *  leaving the palette behind. */
  overrides: z
    .record(
      MaterialRef,
      z.strictObject({
        hex: Hex,
        roughness: z.number().min(0).max(1),
        metalness: z.number().min(0).max(0.4),
      }),
    )
    .optional(),
});

/** Mirrors the `holes` tuples consumed by `villa_lib.wall()` and `fill()`. */
const openingSchema = (ElementId: z.ZodType<string>) =>
  z.strictObject({
    /** along-wall extent in metres, from the volume's local origin */
    u: z.tuple([z.number(), z.number()]),
    z: z.tuple([z.number().min(0), z.number().max(24)]),
    fill: z.enum(["glass", "open", "door", "screen", "louvre"]),
    /** set when the opening is framed by a library element */
    elementId: ElementId.optional(),
    /** validated against that element's own ElementParam bounds by culturalLint */
    params: z.record(z.string(), z.number()).optional(),
  });

const faceElementSchema = (ElementId: z.ZodType<string>) =>
  z.strictObject({
    elementId: ElementId,
    zone: Zone,
    /** along-wall span; omit for a full-width band */
    u: z.tuple([z.number(), z.number()]).optional(),
    z: z.number().min(0).max(24).optional(),
    params: z.record(z.string(), z.number()),
    repeat: z
      .strictObject({
        pitch: z.number().min(0.2).max(6),
        count: z.number().int().min(1).max(40),
      })
      .optional(),
    material: MaterialRef.optional(),
  });

const wallFaceSchema = (ElementId: z.ZodType<string>) =>
  z.strictObject({
    face: Face,
    /** what this face looks at; drives the placement rules in culturalLint */
    exposure: Exposure,
    openings: z.array(openingSchema(ElementId)).max(24),
    elements: z.array(faceElementSchema(ElementId)).max(12),
  });

/** One rectangular mass. Corresponds 1:1 to a `villa_lib.G.vol()` call. */
const massSchema = (ElementId: z.ZodType<string>) =>
  z.strictObject({
    id: z.string().min(1).max(32),
    role: z.enum(["front-wing", "side-wing", "rear-wing", "tower", "podium", "annex"]),
    /** footprint in metres: x0, y0, x1, y1, with the site centred on the origin */
    footprint: z.tuple([z.number(), z.number(), z.number(), z.number()]),
    base: z.number().min(0).max(2),
    storeys: z.number().int().min(1).max(4),
    storeyHeight: z.number().min(2.6).max(4.6),
    wallThickness: z.number().min(0.2).max(0.9),
    material: MaterialRef,
    faces: z.array(wallFaceSchema(ElementId)).max(4),
    crown: z
      .strictObject({
        elementIds: z.array(ElementId).max(4),
        params: z.record(z.string(), z.number()),
        /** which sides carry it, e.g. "SNEW" */
        sides: z.string().regex(/^[SNEW]{0,4}$/),
      })
      .optional(),
  });

const siteSchema = (ElementId: z.ZodType<string>) =>
  z.strictObject({
    plot: z.tuple([z.number(), z.number(), z.number(), z.number()]),
    court: z
      .strictObject({
        footprint: z.tuple([z.number(), z.number(), z.number(), z.number()]),
        elementIds: z.array(ElementId).max(8),
        params: z.record(z.string(), z.number()),
      })
      .optional(),
    planting: z
      .array(
        z.strictObject({
          kind: z.enum(["palm", "shrub"]),
          at: z.tuple([z.number(), z.number()]),
          height: z.number().min(0.4).max(12),
          seed: z.number().int().min(0).max(9999),
        }),
      )
      .max(40),
  });

/** Hotspot anchors the design exposes, so the existing `HotspotLayer` and the
 *  engine's anchor snapping work on generated geometry unchanged. Same
 *  normalised box-fraction convention as `Hotspot.anchor`. */
const anchorSchema = (ElementId: z.ZodType<string>) =>
  z.strictObject({
    id: z.string().min(1).max(40),
    elementId: ElementId,
    anchor: z.tuple([
      z.number().min(0).max(1),
      z.number().min(0).max(1),
      z.number().min(0).max(1),
    ]),
    snap: z.enum(["roof", "court", "wall"]),
  });

const WarningSchema = z.strictObject({
  code: z.enum([
    "element-not-attested",
    "param-outside-documented-range",
    "typology-mixing",
    "manufacturability",
    "other",
  ]),
  detail: z.strictObject({ en: z.string().max(400), ar: z.string().max(400) }),
});

function build(ElementId: z.ZodType<string>) {
  return z.strictObject({
    specVersion: z.literal(SPEC_VERSION),
    /** content hash, filled by the client after validation — never by the model */
    id: z.string().max(80).optional(),
    characterId: z.string().min(1).max(60),
    typology: z.enum(tuple(TYPOLOGIES)),
    title: z.strictObject({ en: z.string().max(70), ar: z.string().max(70) }),
    /** the design argument, in the designer's words */
    rationale: z.strictObject({ en: z.string().max(900), ar: z.string().max(900) }),
    palette: PaletteSchema,
    masses: z.array(massSchema(ElementId)).min(1).max(6),
    site: siteSchema(ElementId),
    anchors: z.array(anchorSchema(ElementId)).max(8),
    camera: z.strictObject({
      azimuth: z.number().min(-180).max(180),
      elevation: z.number().min(8).max(70),
      dist: z.number().min(0.7).max(2),
      targetY: z.number().min(0).max(1),
    }),
    provenance: SpecProvenanceSchema,
    /** the model's own flagged uncertainties, surfaced in the UI rather than
     *  quietly dropped */
    warnings: z.array(WarningSchema).max(8),
  });
}

/** The general schema: any element in the library is acceptable. Used for
 *  catalog files and permalinks, which may legitimately reference a character
 *  other than the one currently on screen. */
export const FacadeSpecSchema = build(z.enum(tuple(ALL_ELEMENT_IDS)));

export type FacadeSpec = z.infer<typeof FacadeSpecSchema>;
export type SpecMass = FacadeSpec["masses"][number];
export type SpecWallFace = SpecMass["faces"][number];
export type SpecOpening = SpecWallFace["openings"][number];
export type SpecFaceElement = SpecWallFace["elements"][number];
export type SpecAnchor = FacadeSpec["anchors"][number];
export type SpecWarning = FacadeSpec["warnings"][number];

/** The per-request schema: element ids are narrowed to exactly what this
 *  character attests at this typology.
 *
 *  This is what is handed to the model as its output format. Cross-character
 *  blending — the single most likely cultural failure — becomes a schema
 *  violation rather than a judgement call, because there is no way to name a
 *  roshan in a Najdi request. */
export function buildRequestSchema(characterId: string, typology: Typology) {
  const allowed = allowedElementIds(characterId, typology);
  if (allowed.length === 0) {
    // No attested vocabulary means there is nothing to generate from. Better to
    // refuse than to fall back to the full library, which would silently permit
    // every blend this narrowing exists to prevent.
    return null;
  }
  return build(z.enum(tuple(allowed)));
}

/** JSON Schema for the Anthropic structured-output path.
 *
 *  `zodOutputFormat` in the SDK was written against zod 3 and this project is
 *  on zod 4. If the helper rejects the schema, this is the documented fallback:
 *  pass the JSON Schema directly and validate the reply with `safeParse`.
 *  Every object above is `strictObject`, which is what produces the
 *  `additionalProperties: false` that structured outputs require. */
export function specJsonSchema(characterId: string, typology: Typology): object | null {
  const schema = buildRequestSchema(characterId, typology);
  return schema ? z.toJSONSchema(schema) : null;
}
