/** Turning a design spec into the things the viewer needs: a stable identity,
 *  a camera, and hotspots.
 *
 *  `ViewerEngine` asks for a `Framing` — id, tint, camera preset, hotspots —
 *  and nothing else. That is the whole surface a generated design has to
 *  satisfy, which is why the same viewer can show a loaded villa and a
 *  procedurally built façade without knowing the difference. */

import type { FacadeSpec } from "./schema";
import type { Framing } from "@/three/engine";
import type { Hotspot } from "@/types/empire";
import type { Language } from "@/types/i18n";
import { elementById } from "@/data/corpus/elements";
import { paletteById } from "@/data/corpus/palettes";
import { characterById } from "@/data/characters";

/** FNV-1a over the canonical JSON of the spec.
 *
 *  The key has to be content-addressed. The studio rebuilds on every slider
 *  tick, and if a changed design kept the same key the engine would treat it as
 *  the model it already has — returning the stale one from the generated pool
 *  and leaving the change invisible. Hashing the content makes a changed spec a
 *  different model by construction, and makes returning to a previous variant
 *  free. */
export function specKey(spec: FacadeSpec): string {
  const json = canonical(spec);
  let h = 0x811c9dc5;
  for (let i = 0; i < json.length; i += 1) {
    h ^= json.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return "gen:" + h.toString(16).padStart(8, "0");
}

/** JSON with object keys sorted, so two structurally identical specs hash the
 *  same regardless of how they were assembled. */
export function canonical(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return "[" + value.map(canonical).join(",") + "]";
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return (
    "{" +
    keys
      .filter((k) => obj[k] !== undefined && k !== "id")
      .map((k) => JSON.stringify(k) + ":" + canonical(obj[k]))
      .join(",") +
    "}"
  );
}

/** Hotspots from the spec's anchors, with their copy taken from the element
 *  library rather than the spec.
 *
 *  This matters: a generated design names elements by id, and every visible
 *  string — the title, the summary, the Arabic term — comes from human-authored
 *  corpus data. The model cannot label anything, which is what keeps invented
 *  terminology structurally impossible rather than merely unlikely. */
export function specHotspots(spec: FacadeSpec, lang: Language): Hotspot[] {
  return spec.anchors.map((a) => {
    const el = elementById(a.elementId);
    const category: Hotspot["category"] =
      a.snap === "roof" ? "roof" : a.snap === "court" ? "court" : "facade";
    if (!el) {
      return {
        id: a.id,
        title: a.elementId,
        short: "",
        detail: "",
        category,
        anchor: a.anchor,
        snap: a.snap,
        elementId: a.elementId,
      };
    }
    return {
      id: a.id,
      title: el.name[lang],
      short: el.gloss[lang],
      detail: el.rationale[lang],
      category,
      anchor: a.anchor,
      snap: a.snap,
      elementId: el.id,
      provenance: el.provenance,
    };
  });
}

export function specToFraming(spec: FacadeSpec, lang: Language): Framing {
  const character = characterById(spec.characterId);
  const palette = paletteById(spec.palette.paletteId);
  // The character's accent if we have one, else a representative colour from
  // the palette, else the app's default warm tone.
  const tint =
    character?.tint ??
    (palette ? Object.values(palette.materials)[0]?.[0] : undefined) ??
    "#c49a6c";

  return {
    id: specKey(spec),
    tint,
    camera: spec.camera,
    hotspots: specHotspots(spec, lang),
  };
}
