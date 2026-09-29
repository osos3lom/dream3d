/** Curated designs — the keyless tier.
 *
 *  Every visitor gets these with no API key, no network call beyond the static
 *  bundle, and no AI at runtime. They are produced offline by the studio (and
 *  later by the Claude + Blender pipeline), reviewed, and committed.
 *
 *  Each entry is validated at module load. A catalog file that fails the schema
 *  or the cultural lint is a build-time problem, not something a visitor should
 *  discover — and `verify:spec` runs the same checks in CI against the same
 *  files, so this is a second line rather than the only one.
 *
 *  Note these specs are also the studio's starting points. A visitor opens a
 *  curated design and adjusts it; they are never handed a blank canvas, because
 *  a blank canvas invites invention and a documented starting point invites
 *  interpretation. */

import najdiContemporary from "./najdi-contemporary.spec.json";
import { FacadeSpecSchema, type FacadeSpec } from "@/lib/studio/schema";
import { culturalLint } from "@/lib/studio/culturalLint";
import type { Typology } from "@/types/character";

export interface CatalogEntry {
  id: string;
  spec: FacadeSpec;
  /** Lint warnings carried by the design, shown alongside it. Errors would
   *  have thrown below, so this is always the non-blocking set. */
  warnings: ReturnType<typeof culturalLint>["warnings"];
}

const RAW: Array<{ id: string; data: unknown }> = [
  { id: "najdi-contemporary", data: najdiContemporary },
];

function load({ id, data }: { id: string; data: unknown }): CatalogEntry {
  const parsed = FacadeSpecSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(
      `[catalog] "${id}" does not match the design spec schema: ` +
        parsed.error.issues.map((i) => i.path.join(".") + " " + i.message).join("; "),
    );
  }
  const lint = culturalLint(parsed.data);
  if (!lint.ok) {
    throw new Error(
      `[catalog] "${id}" fails cultural lint: ` +
        lint.errors.map((e) => e.path + " " + e.message).join("; "),
    );
  }
  return { id, spec: parsed.data, warnings: lint.warnings };
}

export const CATALOG: CatalogEntry[] = RAW.map(load);

export const catalogById = (id: string): CatalogEntry | undefined =>
  CATALOG.find((c) => c.id === id);

/** Curated designs for one cell of the character x typology matrix. */
export const catalogFor = (characterId: string, typology: Typology): CatalogEntry[] =>
  CATALOG.filter((c) => c.spec.characterId === characterId && c.spec.typology === typology);

/** Cells that have at least one curated design — what the studio can open. */
export function catalogCells(): Array<{ characterId: string; typology: Typology }> {
  const seen = new Set<string>();
  const out: Array<{ characterId: string; typology: Typology }> = [];
  for (const c of CATALOG) {
    const key = c.spec.characterId + "/" + c.spec.typology;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ characterId: c.spec.characterId, typology: c.spec.typology });
  }
  return out;
}
