/** The browser twin of `scripts/blender/villa_lib.py`.
 *
 *  Same conventions, deliberately: metres, Z up, the street front facing -Y,
 *  and wall helpers working in a face frame (O, U, N) where `a` runs along the
 *  wall, `b` is world Z and `d` is distance along the outward normal. Geometry
 *  accumulates per material and commits as one mesh per material.
 *
 *  That last invariant is not stylistic. `ViewerEngine.applyRim` reads
 *  `mesh.material` as a single material and swaps it for a TSL node material;
 *  a mesh carrying a material array would silently keep its original and lose
 *  the rim light. One mesh per material is a hard requirement of the pipeline.
 *
 *  Two things differ from the Python side, both forced by the target:
 *
 *  · Blender recalculates face normals after the fact (`recalc_face_normals`).
 *    There is no equivalent here, so every primitive passes the centroid of the
 *    convex shape it belongs to and faces pointing inward are flipped. Every
 *    primitive in this kit is convex, which is what makes that sound.
 *
 *  · Geometry is built non-indexed and flat-shaded. It is simpler than
 *    replicating Blender's normal handling and it is what architectural masses
 *    want anyway — crisp edges rather than smoothed ones. */

import * as THREE from "three/webgpu";
import type { MaterialSpec } from "@/data/corpus/palettes";

export type Vec3 = [number, number, number];
/** A wall face frame: origin, along-wall unit vector, outward normal. */
export type Frame = [Vec3, Vec3, Vec3];
export type Side = "S" | "N" | "W" | "E";

/** Mirrors `villa_lib.face()`. */
export function face(side: Side, plane: number): Frame {
  switch (side) {
    case "S":
      return [[0, plane, 0], [1, 0, 0], [0, -1, 0]];
    case "N":
      return [[0, plane, 0], [1, 0, 0], [0, 1, 0]];
    case "W":
      return [[plane, 0, 0], [0, 1, 0], [-1, 0, 0]];
    case "E":
      return [[plane, 0, 0], [0, 1, 0], [1, 0, 0]];
  }
}

/** An opening in a wall: along-wall extent, height extent, and how it is filled. */
export interface Hole {
  a0: number;
  a1: number;
  z0: number;
  z1: number;
  kind?: "glass" | "open" | "door" | "screen" | "louvre";
}

interface Bucket {
  positions: number[];
}

export interface CommitResult {
  group: THREE.Group;
  /** Normalised box fractions, matching `Hotspot.anchor`: x and z across the
   *  footprint, y up the height — after the glTF axis swap. */
  anchors: Record<string, { anchor: Vec3; snap: "roof" | "court" | "wall" }>;
  bbox: { min: Vec3; max: Vec3 };
  triangles: number;
}

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

export class Kit {
  private readonly buckets = new Map<string, Bucket>();
  private readonly anchors = new Map<string, { at: Vec3; snap: "roof" | "court" | "wall" }>();

  constructor(private readonly materials: Readonly<Record<string, MaterialSpec>>) {}

  private bucket(material: string): Bucket {
    if (!this.materials[material]) {
      throw new Error(
        `unknown material "${material}"; the palette defines ` +
          Object.keys(this.materials).join(", "),
      );
    }
    let b = this.buckets.get(material);
    if (!b) {
      b = { positions: [] };
      this.buckets.set(material, b);
    }
    return b;
  }

  /** Add polygons, fan-triangulated, with inward-facing ones flipped against
   *  `centroid`. Mirrors `villa_lib.G.add` plus Blender's normal recalculation. */
  add(material: string, verts: Vec3[], faces: number[][], centroid?: Vec3) {
    const out = this.bucket(material).positions;
    for (const f of faces) {
      if (f.length < 3) continue;
      const a = verts[f[0]];
      const b = verts[f[1]];
      const c = verts[f[2]];
      let poly = f;
      if (centroid) {
        const n = cross(sub(b, a), sub(c, a));
        // Vector from the shape centre out to the face: if the winding normal
        // opposes it the face is inside-out.
        const outward = sub(a, centroid);
        if (dot(n, outward) < 0) poly = [...f].reverse();
      }
      for (let i = 1; i < poly.length - 1; i += 1) {
        for (const idx of [poly[0], poly[i], poly[i + 1]]) {
          const v = verts[idx];
          out.push(v[0], v[1], v[2]);
        }
      }
    }
  }

  /** Axis-aligned box. Mirrors `villa_lib.G.box`. */
  box(material: string, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number) {
    const [ax, bx] = [Math.min(x0, x1), Math.max(x0, x1)];
    const [ay, by] = [Math.min(y0, y1), Math.max(y0, y1)];
    const [az, bz] = [Math.min(z0, z1), Math.max(z0, z1)];
    if (bx - ax < 1e-6 || by - ay < 1e-6 || bz - az < 1e-6) return;
    const v: Vec3[] = [
      [ax, ay, az], [bx, ay, az], [bx, by, az], [ax, by, az],
      [ax, ay, bz], [bx, ay, bz], [bx, by, bz], [ax, by, bz],
    ];
    const f = [
      [0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4],
      [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7],
    ];
    this.add(material, v, f, [(ax + bx) / 2, (ay + by) / 2, (az + bz) / 2]);
  }

  /** A prism extruded along a face frame's normal. Mirrors `villa_lib.G.poly`. */
  poly(material: string, pts: Array<[number, number]>, fr: Frame, d0: number, d1: number) {
    const [O, U, N] = fr;
    const n = pts.length;
    if (n < 3) return;
    const v: Vec3[] = [];
    for (const d of [d0, d1]) {
      for (const [a, b] of pts) {
        v.push([O[0] + U[0] * a + N[0] * d, O[1] + U[1] * a + N[1] * d, b]);
      }
    }
    const f: number[][] = [
      Array.from({ length: n }, (_, i) => n - 1 - i),
      Array.from({ length: n }, (_, i) => n + i),
    ];
    for (let i = 0; i < n; i += 1) {
      f.push([i, (i + 1) % n, n + ((i + 1) % n), n + i]);
    }
    const c: Vec3 = [0, 0, 0];
    for (const p of v) {
      c[0] += p[0] / v.length;
      c[1] += p[1] / v.length;
      c[2] += p[2] / v.length;
    }
    this.add(material, v, f, c);
  }

  /** A rectangle on a face frame. Mirrors `villa_lib.G.lbox`. */
  lbox(material: string, fr: Frame, a0: number, a1: number, b0: number, b1: number, d0: number, d1: number) {
    if (Math.abs(a1 - a0) < 1e-6 || Math.abs(b1 - b0) < 1e-6) return;
    this.poly(material, [[a0, b0], [a1, b0], [a1, b1], [a0, b1]], fr, d0, d1);
  }

  /** A wall with rectangular holes cut out, built as the solid runs between
   *  them. Mirrors `villa_lib.G.wall`. */
  wall(
    material: string,
    fr: Frame,
    u0: number,
    u1: number,
    z0: number,
    z1: number,
    t: number,
    holes: Hole[] = [],
    dOut = 0,
  ) {
    const us = [...new Set([u0, u1, ...holes.flatMap((h) => [h.a0, h.a1])])]
      .filter((u) => u >= u0 - 1e-9 && u <= u1 + 1e-9)
      .sort((a, b) => a - b);
    const zs = [...new Set([z0, z1, ...holes.flatMap((h) => [h.z0, h.z1])])]
      .filter((z) => z >= z0 - 1e-9 && z <= z1 + 1e-9)
      .sort((a, b) => a - b);

    for (let j = 0; j < zs.length - 1; j += 1) {
      const cz = (zs[j] + zs[j + 1]) / 2;
      let run: number | null = null;
      for (let i = 0; i < us.length - 1; i += 1) {
        const cu = (us[i] + us[i + 1]) / 2;
        const solid = !holes.some((h) => h.a0 < cu && cu < h.a1 && h.z0 < cz && cz < h.z1);
        if (solid && run === null) run = us[i];
        if (!solid && run !== null) {
          this.lbox(material, fr, run, us[i], zs[j], zs[j + 1], dOut - t, dOut);
          run = null;
        }
      }
      if (run !== null) {
        this.lbox(material, fr, run, us[us.length - 1], zs[j], zs[j + 1], dOut - t, dOut);
      }
    }
  }

  /** Glazing, doors and panels set back inside their openings.
   *  Mirrors `villa_lib.G.fill`. */
  fill(
    fr: Frame,
    holes: Hole[],
    t: number,
    opts: { glass?: string; frame?: string; door?: string; depth?: number } = {},
  ) {
    const glass = opts.glass ?? "glass";
    const frameMat = opts.frame ?? "frame";
    const doorMat = opts.door ?? "door";
    const depth = opts.depth ?? 0.55;
    for (const h of holes) {
      const kind = h.kind ?? "glass";
      if (kind === "open") continue;
      const dg = -t * depth;
      if (kind === "glass" || kind === "louvre" || kind === "screen") {
        this.lbox(glass, fr, h.a0, h.a1, h.z0, h.z1, dg - 0.03, dg);
        const w = h.a1 - h.a0;
        if (w > 2.2) {
          const n = Math.max(1, Math.floor(w / 1.5));
          for (let k = 1; k <= n; k += 1) {
            const a = h.a0 + (w * k) / (n + 1);
            this.lbox(frameMat, fr, a - 0.04, a + 0.04, h.z0, h.z1, dg - 0.06, dg + 0.03);
          }
        }
      } else {
        this.lbox(doorMat, fr, h.a0, h.a1, h.z0, h.z1, dg - 0.08, dg);
      }
    }
  }

  /** A closed rectangular volume with per-side openings.
   *  Mirrors `villa_lib.G.vol`. */
  vol(
    material: string,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    z0: number,
    z1: number,
    t = 0.4,
    holes: Partial<Record<Side, Hole[]>> = {},
    roof = true,
    fillOpts: { glass?: string; frame?: string; door?: string } = {},
  ) {
    const spans: Record<Side, [number, number, number]> = {
      S: [y0, x0, x1],
      N: [y1, x0, x1],
      W: [x0, y0 + t, y1 - t],
      E: [x1, y0 + t, y1 - t],
    };
    for (const side of ["S", "N", "W", "E"] as Side[]) {
      const [plane, u0, u1] = spans[side];
      const fr = face(side, plane);
      const hs = holes[side] ?? [];
      this.wall(material, fr, u0, u1, z0, z1, t, hs);
      this.fill(fr, hs, t, fillOpts);
    }
    if (roof) this.box(material, x0, y0, z1 - 0.3, x1, y1, z1);
  }

  /** Mirrors `villa_lib.G.parapet`. */
  parapet(material: string, x0: number, y0: number, x1: number, y1: number, z: number, h: number, t: number, sides = "SNEW") {
    if (sides.includes("S")) this.box(material, x0, y0, z, x1, y0 + t, z + h);
    if (sides.includes("N")) this.box(material, x0, y1 - t, z, x1, y1, z + h);
    if (sides.includes("W")) this.box(material, x0, y0, z, x0 + t, y1, z + h);
    if (sides.includes("E")) this.box(material, x1 - t, y0, z, x1, y1, z + h);
  }

  /** A horizontal band projecting slightly from every face.
   *  Mirrors `villa_lib.G.band`. */
  band(material: string, x0: number, y0: number, x1: number, y1: number, z: number, h: number, p = 0.04) {
    this.box(material, x0 - p, y0 - p, z, x1 + p, y1 + p, z + h);
  }

  /** Repeated projecting ribs up a face. Mirrors `villa_lib.G.ribs`. */
  ribs(material: string, fr: Frame, u0: number, u1: number, z0: number, z1: number, step = 0.45, h = 0.06, p = 0.12) {
    for (let z = z0; z <= z1 - h; z += step) {
      this.lbox(material, fr, u0, u1, z, z + h, 0, p);
    }
  }

  /** The furjat band: a row of triangular voids in a wall course.
   *  Mirrors `villa_lib.G.tri_band`. */
  triBand(material: string, fr: Frame, u0: number, u1: number, z: number, h: number, t: number, b = 0.45, p = 0.8, dOut = 0) {
    let a = u0;
    // Solid runs between triangles, so the triangles read as true openings.
    const tris: Array<[number, number]> = [];
    while (a + b <= u1) {
      tris.push([a, a + b]);
      a += p;
    }
    let cursor = u0;
    for (const [t0, t1] of tris) {
      if (t0 > cursor) this.lbox(material, fr, cursor, t0, z, z + h, dOut - t, dOut);
      // The triangle itself: two solid wedges either side of the void.
      this.poly(material, [[t0, z], [t0 + (t1 - t0) / 2, z + h], [t0, z + h]], fr, dOut - t, dOut);
      this.poly(material, [[t1, z], [t1, z + h], [t0 + (t1 - t0) / 2, z + h]], fr, dOut - t, dOut);
      cursor = t1;
    }
    if (cursor < u1) this.lbox(material, fr, cursor, u1, z, z + h, dOut - t, dOut);
  }

  /** Stepped crenellations along a parapet. Mirrors `villa_lib.G.shurfat`. */
  shurfat(material: string, fr: Frame, u0: number, u1: number, z: number, t: number, w = 0.7, h = 0.8, p = 1.1, steps = 3, dOut = 0) {
    for (let a = u0; a + w <= u1; a += p) {
      for (let s = 0; s < steps; s += 1) {
        const inset = (w / 2) * (s / steps);
        const sz = z + (h * s) / steps;
        const sh = h / steps;
        this.lbox(material, fr, a + inset, a + w - inset, sz, sz + sh, dOut - t, dOut);
      }
    }
  }

  /** A cylinder, used for beam ends and trunks. Mirrors `villa_lib.G.cyl`. */
  cyl(material: string, cx: number, cy: number, z0: number, z1: number, r0: number, r1 = r0, seg = 10) {
    const v: Vec3[] = [];
    for (const [z, r] of [[z0, r0], [z1, r1]] as Array<[number, number]>) {
      for (let i = 0; i < seg; i += 1) {
        const a = (2 * Math.PI * i) / seg;
        v.push([cx + r * Math.cos(a), cy + r * Math.sin(a), z]);
      }
    }
    const f: number[][] = [
      Array.from({ length: seg }, (_, i) => seg - 1 - i),
      Array.from({ length: seg }, (_, i) => seg + i),
    ];
    for (let i = 0; i < seg; i += 1) {
      f.push([i, (i + 1) % seg, seg + ((i + 1) % seg), seg + i]);
    }
    this.add(material, v, f, [cx, cy, (z0 + z1) / 2]);
  }

  /** Mirrors `villa_lib.G.palm`. */
  palm(x: number, y: number, h: number, opts: { trunk?: string; leaf?: string; fronds?: number; seed?: number } = {}) {
    const trunk = opts.trunk ?? "trunk";
    const leaf = opts.leaf ?? "leaf";
    const fronds = opts.fronds ?? 11;
    let seed = (opts.seed ?? 0) * 9301 + 49297;
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    this.cyl(trunk, x, y, 0, h, 0.22, 0.16, 8);
    for (let i = 0; i < fronds; i += 1) {
      const a = (2 * Math.PI * i) / fronds + rnd() * 0.3;
      const len = 2.2 + rnd() * 0.8;
      const droop = 0.7 + rnd() * 0.5;
      const tipX = x + Math.cos(a) * len;
      const tipY = y + Math.sin(a) * len;
      this.add(
        leaf,
        [
          [x, y, h],
          [tipX, tipY, h - droop],
          [x + Math.cos(a) * 0.4 - Math.sin(a) * 0.22, y + Math.sin(a) * 0.4 + Math.cos(a) * 0.22, h + 0.1],
        ],
        [[0, 1, 2]],
      );
      this.add(
        leaf,
        [
          [x, y, h],
          [x + Math.cos(a) * 0.4 + Math.sin(a) * 0.22, y + Math.sin(a) * 0.4 - Math.cos(a) * 0.22, h + 0.1],
          [tipX, tipY, h - droop],
        ],
        [[0, 1, 2]],
      );
    }
  }

  /** Mirrors `villa_lib.G.shrub`. */
  shrub(x: number, y: number, r = 0.7, material = "leaf") {
    this.cyl(material, x, y, 0, r * 1.6, r * 0.9, r * 0.2, 8);
  }

  /** Mirrors `villa_lib.G.pool`. */
  pool(x0: number, y0: number, x1: number, y1: number, z: number, opts: { coping?: string; water?: string; w?: number } = {}) {
    const coping = opts.coping ?? "coping";
    const water = opts.water ?? "water";
    const w = opts.w ?? 0.35;
    this.box(coping, x0 - w, y0 - w, z, x1 + w, y1 + w, z + 0.12);
    this.box(water, x0, y0, z + 0.06, x1, y1, z + 0.1);
  }

  /** Mirrors `villa_lib.G.anchor`. */
  anchor(name: string, x: number, y: number, z: number, snap: "roof" | "court" | "wall") {
    this.anchors.set(name, { at: [x, y, z], snap });
  }

  /** One mesh per material, converted to glTF axes.
   *
   *  The axis swap (x, y, z) -> (x, z, -y) is the same one Blender's glTF
   *  exporter applies, and the anchor formula below is transcribed from
   *  `villa_lib.commit()` so pins land in the same place in both pipelines.
   *  Its determinant is +1, so face winding survives untouched. */
  commit(name = "design"): CommitResult {
    const group = new THREE.Group();
    group.name = name;

    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    for (const { positions } of this.buckets.values()) {
      for (let i = 0; i < positions.length; i += 3) {
        minX = Math.min(minX, positions[i]);
        maxX = Math.max(maxX, positions[i]);
        minY = Math.min(minY, positions[i + 1]);
        maxY = Math.max(maxY, positions[i + 1]);
        minZ = Math.min(minZ, positions[i + 2]);
        maxZ = Math.max(maxZ, positions[i + 2]);
      }
    }
    if (!Number.isFinite(minX)) throw new Error("nothing was built: every material bucket is empty");

    let triangles = 0;
    for (const [material, { positions }] of this.buckets) {
      const arr = new Float32Array(positions.length);
      for (let i = 0; i < positions.length; i += 3) {
        arr[i] = positions[i];
        arr[i + 1] = positions[i + 2];
        arr[i + 2] = -positions[i + 1];
      }
      const geom = new THREE.BufferGeometry();
      geom.setAttribute("position", new THREE.BufferAttribute(arr, 3));
      geom.computeVertexNormals();
      const [hex, roughness, metalness] = this.materials[material];
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(hex),
        roughness,
        metalness,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.name = name + "_" + material;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
      triangles += arr.length / 9;
    }

    const dx = maxX - minX || 1;
    const dy = maxY - minY || 1;
    const dz = maxZ - minZ || 1;
    const anchors: CommitResult["anchors"] = {};
    for (const [n, { at, snap }] of this.anchors) {
      const [x, y, z] = at;
      anchors[n] = {
        anchor: [
          Number(((x - minX) / dx).toFixed(3)),
          Number(((z - minZ) / dz).toFixed(3)),
          Number(((maxY - y) / dy).toFixed(3)),
        ],
        snap,
      };
    }

    return {
      group,
      anchors,
      bbox: { min: [minX, minY, minZ], max: [maxX, maxY, maxZ] },
      triangles,
    };
  }
}
