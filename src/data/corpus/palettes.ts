/** Material palettes, mirrored from the Blender generators.
 *
 *  Each palette is transcribed from the `MATS` dict of the corresponding script
 *  in `scripts/blender/` — the tuples there are `(hex, roughness, metalness)`,
 *  and the keys are the material names the parametric vocabulary refers to.
 *  Keeping these identical is what lets a design spec name a material and have
 *  the browser builder and the offline Blender path resolve it the same way.
 *
 *  A generated design selects a `paletteId`; it does not invent colours. The
 *  spec schema allows bounded per-material overrides so a designer can warm a
 *  render, but the palette itself is curated. */

/** `[hex, roughness, metalness]`, exactly as the Blender scripts express it. */
export type MaterialSpec = readonly [hex: string, roughness: number, metalness: number];

export interface Palette {
  id: string;
  /** Characters this palette is appropriate for. */
  characterIds: string[];
  /** Backdrop colour the Blender stage uses (`BG` in the scripts). */
  background: string;
  materials: Readonly<Record<string, MaterialSpec>>;
  /** Named sub-groups a builder may draw from, e.g. the Al-Qatt frieze colours
   *  (`QATT` in `scripts/blender/asiri.py`). */
  groups?: Readonly<Record<string, readonly string[]>>;
}

/** scripts/blender/najdi.py — carved earthen masonry. */
const najdi: Palette = {
  id: "najdi-earth",
  characterIds: ["najdi", "northern-najdi", "eastern-najdi"],
  background: "#eadcc4",
  materials: {
    mud: ["#c49a6c", 0.95, 0.0],
    mud_dark: ["#946a41", 0.95, 0.0],
    shadow: ["#2a2019", 0.9, 0.0],
    door: ["#2d6a6c", 0.6, 0.0],
    door_paint: ["#e2c16b", 0.6, 0.0],
    glass: ["#1c262c", 0.08, 0.5],
    frame: ["#3b2d22", 0.5, 0.3],
    pave: ["#dccaa6", 0.9, 0.0],
    court: ["#cfb68d", 0.9, 0.0],
    lawn: ["#6d8a47", 0.95, 0.0],
    water: ["#3a8fa8", 0.05, 0.0],
    coping: ["#e6d6b8", 0.8, 0.0],
    trunk: ["#7a5f45", 0.95, 0.0],
    leaf: ["#5b7438", 0.8, 0.0],
    wood: ["#6b4a2b", 0.7, 0.0],
  },
};

/** scripts/blender/salmani.py — contemporary Riyadh reinterpretation.
 *  Belongs to the Salmani character, which is NOT on the official map. */
const salmani: Palette = {
  id: "salmani-stone",
  characterIds: ["salmani"],
  background: "#e9e0cf",
  materials: {
    stone: ["#dcc9a6", 0.85, 0.0],
    stone_dark: ["#bea37b", 0.85, 0.0],
    shadow: ["#2b2622", 0.9, 0.0],
    glass: ["#22303a", 0.06, 0.5],
    frame: ["#2f2b27", 0.4, 0.6],
    wood: ["#8a6440", 0.6, 0.0],
    pave: ["#e4d6bc", 0.9, 0.0],
    lawn: ["#6b8a46", 0.95, 0.0],
    water: ["#4a9fc0", 0.05, 0.0],
    coping: ["#efe4cf", 0.8, 0.0],
    trunk: ["#7a5f45", 0.95, 0.0],
    leaf: ["#5b7438", 0.8, 0.0],
  },
};

/** scripts/blender/hijazi.py — coral stone with timber coursing and lattice. */
const hijazi: Palette = {
  id: "hijazi-coral",
  characterIds: ["coastal-hijazi", "al-madinah", "taif"],
  background: "#e6e2d6",
  materials: {
    coral: ["#ebe2ce", 0.9, 0.0],
    coral_course: ["#d2c4a6", 0.9, 0.0],
    timber: ["#5a3b22", 0.8, 0.0],
    wood: ["#7a5230", 0.7, 0.0],
    lattice: ["#6a4428", 0.7, 0.0],
    shutter: ["#3f6a55", 0.6, 0.0],
    shadow: ["#231a14", 0.9, 0.0],
    glass: ["#1f2b33", 0.06, 0.5],
    frame: ["#3a2a1c", 0.5, 0.2],
    door: ["#5a3b22", 0.7, 0.0],
    pave: ["#e6dcc8", 0.9, 0.0],
    lawn: ["#6b8a46", 0.95, 0.0],
    water: ["#3f9bbd", 0.05, 0.0],
    coping: ["#f1e9da", 0.8, 0.0],
    trunk: ["#7a5f45", 0.95, 0.0],
    leaf: ["#5b7438", 0.8, 0.0],
  },
};

/** scripts/blender/asiri.py — stone with slate rain ribs and painted friezes. */
const asiri: Palette = {
  id: "asiri-stone",
  characterIds: ["aseer-slopes", "abha-highlands", "sarawat-mountains"],
  background: "#dfe1da",
  materials: {
    stone: ["#86735f", 0.95, 0.0],
    stone_base: ["#6f604f", 0.95, 0.0],
    slate: ["#3d3a36", 0.8, 0.0],
    white: ["#f3efe6", 0.8, 0.0],
    red: ["#b8392c", 0.6, 0.0],
    green: ["#3c7a4a", 0.6, 0.0],
    yellow: ["#e1b43b", 0.6, 0.0],
    blue: ["#2e5c8e", 0.6, 0.0],
    qamar: ["#f0c96a", 0.3, 0.0],
    glass: ["#1f2a33", 0.06, 0.5],
    frame: ["#f3efe6", 0.6, 0.0],
    door: ["#6a4a2e", 0.7, 0.0],
    shadow: ["#211c18", 0.9, 0.0],
    pave: ["#cfc1a8", 0.9, 0.0],
    lawn: ["#627f42", 0.95, 0.0],
    water: ["#3f8fa8", 0.05, 0.0],
    coping: ["#e9e2d4", 0.8, 0.0],
    trunk: ["#5e4a38", 0.95, 0.0],
    leaf: ["#3f5a34", 0.85, 0.0],
  },
  groups: {
    // `QATT` in scripts/blender/asiri.py — the frieze colours. Note that the
    // al-qatt element itself is restricted to interior surfaces; see
    // src/data/corpus/elements.ts.
    qatt: ["red", "yellow", "green", "blue"],
  },
};

/** scripts/blender/eastern.py — coral and gypsum courtyard house. */
const eastern: Palette = {
  id: "eastern-gypsum",
  characterIds: ["eastern-coast", "al-qatif", "al-ahsa-oasis"],
  background: "#e3e6e2",
  materials: {
    gypsum: ["#efe8d8", 0.85, 0.0],
    screen: ["#f7f2e7", 0.8, 0.0],
    coral: ["#cbb997", 0.95, 0.0],
    coral_dark: ["#a9977a", 0.95, 0.0],
    wood: ["#6f4b2e", 0.8, 0.0],
    door: ["#2f6e8e", 0.55, 0.0],
    shadow: ["#2a241e", 0.9, 0.0],
    glass: ["#1f2c34", 0.06, 0.5],
    frame: ["#5b4128", 0.6, 0.0],
    court_a: ["#e2d3b5", 0.85, 0.0],
    court_b: ["#c6b08b", 0.85, 0.0],
    pave: ["#e6dac3", 0.9, 0.0],
    lawn: ["#6b8a46", 0.95, 0.0],
    water: ["#2f95b8", 0.05, 0.0],
    coping: ["#f1e9da", 0.8, 0.0],
    trunk: ["#7a5f45", 0.95, 0.0],
    leaf: ["#5b7438", 0.8, 0.0],
  },
};

export const PALETTES: Palette[] = [najdi, salmani, hijazi, asiri, eastern];

export const PALETTE_IDS = [
  "najdi-earth",
  "salmani-stone",
  "hijazi-coral",
  "asiri-stone",
  "eastern-gypsum",
] as const;

export type PaletteId = (typeof PALETTE_IDS)[number];

const BY_ID = new Map<string, Palette>(PALETTES.map((p) => [p.id, p]));

export const paletteById = (id: string): Palette | undefined => BY_ID.get(id);

export const palettesForCharacter = (characterId: string): Palette[] =>
  PALETTES.filter((p) => p.characterIds.includes(characterId));

/** Whether a material key exists in a palette. The spec schema validates
 *  material references against this, so a design cannot name a material the
 *  builder would not be able to resolve. */
export function paletteHasMaterial(paletteId: string, material: string): boolean {
  return !!BY_ID.get(paletteId)?.materials[material];
}
