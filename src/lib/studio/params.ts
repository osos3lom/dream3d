/** Walking a spec for its editable parameters.
 *
 *  The studio's controls are derived from the design rather than hand-written:
 *  whatever elements a spec places, their documented parameters become the
 *  sliders. That means a new element in the corpus becomes adjustable with no
 *  UI change, and — more to the point — a slider can never offer a value the
 *  element's own record does not permit, because the bounds come from the same
 *  `ElementParam` that `culturalLint` checks against. */

import type { FacadeSpec } from "./schema";
import type { CulturalElement, ElementParam } from "@/types/element";
import { elementById } from "@/data/corpus/elements";

export interface EditableParam {
  /** Where the value lives, e.g. "masses.0.crown.params". */
  path: string;
  key: string;
  value: number;
  element: CulturalElement;
  param: ElementParam;
  /** A short human label for the group the control belongs to. */
  group: string;
}

/** Every parameter the spec exposes, in document order. */
export function collectParams(spec: FacadeSpec): EditableParam[] {
  const out: EditableParam[] = [];

  const push = (path: string, group: string, elementId: string, params: Record<string, number>) => {
    const element = elementById(elementId);
    if (!element) return;
    for (const [key, value] of Object.entries(params)) {
      const param = element.params.find((p) => p.key === key);
      // A key with no matching ElementParam is a lint error elsewhere; it is
      // simply not offered as a control rather than shown unbounded.
      if (!param) continue;
      out.push({ path, key, value, element, param, group });
    }
  };

  spec.masses.forEach((m, mi) => {
    m.faces.forEach((f, fi) => {
      f.elements.forEach((el, ei) => {
        push(`masses.${mi}.faces.${fi}.elements.${ei}.params`, m.id + " · " + f.face, el.elementId, el.params);
      });
    });
    if (m.crown) {
      for (const id of m.crown.elementIds) {
        push(`masses.${mi}.crown.params`, m.id + " · crown", id, m.crown.params);
      }
    }
  });

  if (spec.site.court) {
    for (const id of spec.site.court.elementIds) {
      push("site.court.params", "court", id, spec.site.court.params);
    }
  }

  // The same params object can be shared by several crown elements; de-dupe on
  // path+key so one slider does not appear twice.
  const seen = new Set<string>();
  return out.filter((p) => {
    const k = p.path + "/" + p.key;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** A copy of the spec with one parameter changed.
 *
 *  Structural sharing is not worth it here: a spec is a few kilobytes, and a
 *  fresh object per edit keeps React's change detection and the content hash
 *  both honest. */
export function setParam(spec: FacadeSpec, path: string, key: string, value: number): FacadeSpec {
  const next = JSON.parse(JSON.stringify(spec)) as FacadeSpec;
  const segments = path.split(".");
  let node: unknown = next;
  for (const seg of segments) {
    if (node === null || typeof node !== "object") return spec;
    node = (node as Record<string, unknown>)[seg];
  }
  if (node === null || typeof node !== "object") return spec;
  (node as Record<string, number>)[key] = value;
  return next;
}

/** Reset every parameter to the element's documented default. */
export function resetParams(spec: FacadeSpec): FacadeSpec {
  let next = spec;
  for (const p of collectParams(spec)) {
    next = setParam(next, p.path, p.key, p.param.default);
  }
  return next;
}
