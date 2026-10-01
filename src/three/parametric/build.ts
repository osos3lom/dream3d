/** Turn a validated design spec into geometry.
 *
 *  This is the browser half of the two-renderer contract. `spec_to_blender.py`
 *  will walk the same document and make the same calls against `villa_lib.G`;
 *  the golden fixtures and the parity digest exist to keep the two honest.
 *
 *  Element dispatch goes through `CulturalElement.builder.ts` rather than a
 *  switch on ids, so an element cannot be drawn unless the corpus says which
 *  builder draws it — and `verify:corpus` already refuses an element that names
 *  a builder neither pipeline implements. */

import * as THREE from "three/webgpu";
import { Kit, face, type Frame, type Hole, type Side } from "./kit";
import type { FacadeSpec, SpecMass, SpecWallFace } from "@/lib/studio/schema";
import { paletteById } from "@/data/corpus/palettes";
import { elementById } from "@/data/corpus/elements";
import type { MaterialSpec } from "@/data/corpus/palettes";

export interface BuiltDesign {
  group: THREE.Group;
  anchors: Array<{ id: string; anchor: [number, number, number]; snap: "roof" | "court" | "wall" }>;
  triangles: number;
  /** Elements the spec placed that this kit has no builder for yet. Surfaced
   *  rather than swallowed: a silently missing roshan looks like a design
   *  decision, which is the wrong thing for the viewer to imply. */
  unbuilt: string[];
}

const massHeight = (m: SpecMass) => m.base + m.storeys * m.storeyHeight;

function holesFor(f: SpecWallFace): Hole[] {
  return f.openings.map((o) => ({
    a0: Math.min(o.u[0], o.u[1]),
    a1: Math.max(o.u[0], o.u[1]),
    z0: Math.min(o.z[0], o.z[1]),
    z1: Math.max(o.z[0], o.z[1]),
    kind: o.fill,
  }));
}

/** The frame and along-wall span for one face of a mass. */
function frameFor(m: SpecMass, side: Side): { fr: Frame; u0: number; u1: number } {
  const [rx0, ry0, rx1, ry1] = m.footprint;
  const x0 = Math.min(rx0, rx1);
  const x1 = Math.max(rx0, rx1);
  const y0 = Math.min(ry0, ry1);
  const y1 = Math.max(ry0, ry1);
  const t = m.wallThickness;
  switch (side) {
    case "S":
      return { fr: face("S", y0), u0: x0, u1: x1 };
    case "N":
      return { fr: face("N", y1), u0: x0, u1: x1 };
    case "W":
      return { fr: face("W", x0), u0: y0 + t, u1: y1 - t };
    case "E":
      return { fr: face("E", x1), u0: y0 + t, u1: y1 - t };
  }
}

export function buildDesign(spec: FacadeSpec, name = "design"): BuiltDesign {
  const palette = paletteById(spec.palette.paletteId);
  if (!palette) throw new Error(`unknown palette "${spec.palette.paletteId}"`);

  // Bounded per-material overrides, applied on top of the curated palette.
  const materials: Record<string, MaterialSpec> = { ...palette.materials };
  for (const [key, o] of Object.entries(spec.palette.overrides ?? {})) {
    if (materials[key]) materials[key] = [o.hex, o.roughness, o.metalness];
  }

  const kit = new Kit(materials);
  const unbuilt = new Set<string>();

  const has = (m: string) => Boolean(materials[m]);
  const pick = (...names: string[]) => names.find(has) ?? Object.keys(materials)[0];

  // ── site ────────────────────────────────────────────────────────────────
  const [p0, p1, p2, p3] = spec.site.plot;
  const px0 = Math.min(p0, p2);
  const px1 = Math.max(p0, p2);
  const py0 = Math.min(p1, p3);
  const py1 = Math.max(p1, p3);
  const ground = 0.25;
  kit.box(pick("pave"), px0, py0, 0, px1, py1, ground);

  if (spec.site.court) {
    const [c0, c1, c2, c3] = spec.site.court.footprint;
    kit.box(
      pick("court", "court_a", "pave"),
      Math.min(c0, c2), Math.min(c1, c3), ground,
      Math.max(c0, c2), Math.max(c1, c3), ground + 0.03,
    );
    // A court element that reads as a water feature gets one; the rest are
    // spatial and need no geometry of their own.
    for (const id of spec.site.court.elementIds) {
      const el = elementById(id);
      if (!el) continue;
      if (el.builder.ts === "court") {
        const cx = (Math.min(c0, c2) + Math.max(c0, c2)) / 2;
        const cy = (Math.min(c1, c3) + Math.max(c1, c3)) / 2;
        kit.pool(cx - 1.6, cy - 2.4, cx + 1.6, cy + 2.4, ground + 0.03, {
          coping: pick("coping"),
          water: pick("water"),
        });
      } else {
        unbuilt.add(id);
      }
    }
  }

  for (const p of spec.site.planting) {
    if (p.kind === "palm") {
      kit.palm(p.at[0], p.at[1], p.height, { trunk: pick("trunk"), leaf: pick("leaf"), seed: p.seed });
    } else {
      kit.shrub(p.at[0], p.at[1], Math.max(0.4, p.height), pick("leaf"));
    }
  }

  // ── masses ──────────────────────────────────────────────────────────────
  for (const m of spec.masses) {
    const [rx0, ry0, rx1, ry1] = m.footprint;
    const x0 = Math.min(rx0, rx1);
    const x1 = Math.max(rx0, rx1);
    const y0 = Math.min(ry0, ry1);
    const y1 = Math.max(ry0, ry1);
    const top = massHeight(m);

    const holes: Partial<Record<Side, Hole[]>> = {};
    for (const f of m.faces) holes[f.face] = holesFor(f);

    kit.vol(m.material, x0, y0, x1, y1, m.base, top, m.wallThickness, holes, true, {
      glass: pick("glass"),
      frame: pick("frame"),
      door: pick("door"),
    });

    // Face elements.
    for (const f of m.faces) {
      const { fr, u0, u1 } = frameFor(m, f.face);
      for (const inst of f.elements) {
        const el = elementById(inst.elementId);
        if (!el) {
          unbuilt.add(inst.elementId);
          continue;
        }
        const mat = inst.material && has(inst.material) ? inst.material : m.material;
        const a0 = inst.u ? Math.max(u0, Math.min(inst.u[0], inst.u[1])) : u0;
        const a1 = inst.u ? Math.min(u1, Math.max(inst.u[0], inst.u[1])) : u1;
        const z = inst.z ?? top - 1;
        const P = inst.params;

        switch (el.builder.ts) {
          case "triBand":
            kit.triBand(mat, fr, a0, a1, z, P.height ?? 0.75, m.wallThickness, P.base ?? 0.52, P.pitch ?? 0.92);
            break;
          case "shurfat":
            kit.shurfat(mat, fr, a0, a1, z, m.wallThickness * 0.8, P.width ?? 0.56, P.height ?? 0.6, P.pitch ?? 1.5, Math.round(P.steps ?? 3));
            break;
          case "tarma": {
            const w = P.width ?? 1.6;
            const mid = (a0 + a1) / 2;
            kit.lbox(mat, fr, mid - w / 2, mid + w / 2, z, z + (P.height ?? 1.1), 0, P.depth ?? 0.45);
            break;
          }
          case "ribs":
            kit.ribs(mat, fr, a0, a1, m.base, z, P.pitch ?? 0.45, P.height ?? 0.06, P.depth ?? 0.12);
            break;
          case "band":
            kit.lbox(mat, fr, a0, a1, z, z + (P.height ?? 0.12), 0, 0.06);
            break;
          case "baseCourse":
            kit.lbox(mat, fr, a0, a1, m.base, m.base + (P.height ?? 0.9), 0, 0.08);
            break;
          default:
            unbuilt.add(inst.elementId);
        }
      }
    }

    // Crown.
    if (m.crown && m.crown.elementIds.length > 0) {
      const P = m.crown.params;
      const sides = (m.crown.sides || "SNEW").split("") as Side[];
      for (const id of m.crown.elementIds) {
        const el = elementById(id);
        if (!el) {
          unbuilt.add(id);
          continue;
        }
        if (el.builder.ts === "shurfat") {
          kit.parapet(m.material, x0, y0, x1, y1, top, 0.35, m.wallThickness * 0.8);
          for (const side of sides) {
            const { fr, u0, u1 } = frameFor(m, side);
            kit.shurfat(
              m.material, fr, u0 + 0.2, u1 - 0.2, top + 0.35, m.wallThickness * 0.8,
              P.width ?? 0.56, P.height ?? 0.6, P.pitch ?? 1.5, Math.round(P.steps ?? 3),
            );
          }
        } else if (el.builder.ts === "triBand") {
          for (const side of sides) {
            const { fr, u0, u1 } = frameFor(m, side);
            kit.triBand(m.material, fr, u0, u1, top - (P.height ?? 0.75), P.height ?? 0.75, m.wallThickness, P.base ?? 0.52, P.pitch ?? 0.92);
          }
        } else {
          unbuilt.add(id);
        }
      }
    }
  }

  // ── anchors ─────────────────────────────────────────────────────────────
  // Authored in the spec as box fractions already, so they are handed through
  // rather than recomputed; the kit's own anchor path is for the Blender side.
  const result = kit.commit(name);
  const anchors = spec.anchors.map((a) => ({ id: a.id, anchor: a.anchor, snap: a.snap }));

  return {
    group: result.group,
    anchors,
    triangles: result.triangles,
    unbuilt: [...unbuilt],
  };
}
