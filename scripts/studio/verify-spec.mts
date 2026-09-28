/** Spec schema and cultural-lint checks.
 *
 *  Two things are being verified. First, that a well-formed design passes: the
 *  golden fixture validates against the schema and produces no lint errors.
 *  Second, and more importantly, that specific cultural mistakes are *refused* —
 *  each negative case below is a way the product could misrepresent Saudi
 *  architecture, and a guard nobody has watched fail is not known to work.
 *
 *  Run: npm run verify:spec */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { FacadeSpecSchema, buildRequestSchema } from "@/lib/studio/schema";
import { culturalLint, manufacturabilityLint, type LintCode } from "@/lib/studio/culturalLint";

// Resolved from the working directory, not import.meta.url: this file is
// bundled into node_modules/.cache before it runs, so a URL-relative path would
// look for the fixture next to the bundle. npm scripts run at the repo root.
const fixturePath = resolve(process.cwd(), "scripts/studio/fixtures/najdi-contemporary.spec.json");
const raw: unknown = JSON.parse(readFileSync(fixturePath, "utf8"));

let failures = 0;
const ok = (name: string, detail = "") => console.log("  pass  " + name + (detail ? "  (" + detail + ")" : ""));
const bad = (name: string, why: string) => {
  console.log("  FAIL  " + name);
  console.log("        " + why);
  failures += 1;
};

console.log("");
console.log("Design spec — schema and cultural lint");
console.log("-".repeat(64));

// ── the golden fixture must pass cleanly ────────────────────────────────────
const parsed = FacadeSpecSchema.safeParse(raw);
if (!parsed.success) {
  bad("golden fixture validates", JSON.stringify(parsed.error.issues.slice(0, 4), null, 1));
  console.log("");
  process.exit(1);
}
ok("golden fixture validates against the general schema");

const spec = parsed.data;
const lint = culturalLint(spec);
if (!lint.ok) {
  bad("golden fixture passes culturalLint", lint.errors.map((e) => e.path + ": " + e.message).join("\n        "));
} else {
  ok("golden fixture passes culturalLint", lint.warnings.length + " warning(s)");
  for (const w of lint.warnings) console.log("          warn: " + w.code + " — " + w.message);
}

// The narrowed schema is what the model is actually handed.
const narrowed = buildRequestSchema("najdi", "contemporary");
if (!narrowed) bad("narrowed schema exists for najdi/contemporary", "buildRequestSchema returned null");
else if (!narrowed.safeParse(raw).success) bad("golden fixture validates against the narrowed schema", "rejected");
else ok("golden fixture validates against the narrowed schema");

// ── negative cases ──────────────────────────────────────────────────────────
type Mutate = (s: unknown) => unknown;
const clone = (): Record<string, unknown> => JSON.parse(JSON.stringify(raw));

/** A case the SCHEMA must refuse — structurally unrepresentable. */
function schemaRefuses(name: string, why: string, mutate: Mutate, narrow = false) {
  const mutated = mutate(clone());
  const schema = narrow ? buildRequestSchema("najdi", "contemporary") : FacadeSpecSchema;
  if (!schema) return bad(name, "no schema");
  if (schema.safeParse(mutated).success) bad(name, "the schema accepted it — " + why);
  else ok(name);
}

/** A case CULTURAL LINT must flag, with the expected code. */
function lintFlags(name: string, code: LintCode, mutate: Mutate, level: "error" | "warning" = "error") {
  const mutated = mutate(clone());
  const p = FacadeSpecSchema.safeParse(mutated);
  if (!p.success) return bad(name, "the fixture no longer parses, so the rule was never reached");
  const r = culturalLint(p.data);
  const pool = level === "error" ? r.errors : r.warnings;
  if (!pool.some((i) => i.code === code)) {
    bad(name, "expected a " + level + " with code " + code + "; got " + JSON.stringify(pool.map((i) => i.code)));
  } else {
    ok(name, code);
  }
}

console.log("");
console.log("  Cross-character blending");
schemaRefuses(
  "a roshan cannot be named in a Najdi request",
  "a Hijazi element must be unrepresentable in a Najdi design, not merely discouraged",
  (s) => {
    const o = s as Record<string, any>;
    o.masses[0].faces[0].elements[0].elementId = "roshan";
    return o;
  },
  true,
);

console.log("");
console.log("  Fabricated citations");
schemaRefuses("an unregistered sourceId is rejected", "citations must come from the register", (s) => {
  const o = s as Record<string, any>;
  o.provenance.derivedFrom[0].citations[0].sourceId = "unesco-whc-9999-invented";
  return o;
});
schemaRefuses("a generated spec cannot claim to be documented", "provenance.kind is pinned", (s) => {
  const o = s as Record<string, any>;
  o.provenance.kind = "documented";
  return o;
});

console.log("");
console.log("  Element placement");
lintFlags(
  "Al-Qatt Al-Asiri cannot be placed on a facade",
  "placement-surface",
  (s) => {
    const o = s as Record<string, any>;
    // Placed on the street elevation, which is what the UNESCO inscription
    // says it is not: an interior wall decoration.
    o.characterId = "aseer-slopes";
    o.palette.paletteId = "asiri-stone";
    o.masses[0].material = "stone";
    o.masses[0].faces[0].elements = [
      { elementId: "al-qatt", zone: "upper", params: { height: 0.6, pitch: 0.3 } },
    ];
    o.masses[0].crown.elementIds = [];
    o.masses[1].crown.elementIds = [];
    o.masses[2].crown.elementIds = [];
    o.site.court.elementIds = [];
    o.anchors = [];
    o.provenance.derivedFrom = [
      { elementId: "al-qatt", citations: [{ sourceId: "unesco-ich-01261-al-qatt-al-asiri" }] },
    ];
    return o;
  },
);
lintFlags("shurfat cannot sit at plinth level", "placement-zone", (s) => {
  const o = s as Record<string, any>;
  o.masses[0].faces[0].elements.push({
    elementId: "shurfat",
    zone: "plinth",
    params: { width: 0.56, height: 0.6, pitch: 1.5, steps: 3 },
  });
  return o;
});
lintFlags("a second tarma on the same face exceeds the documented maximum", "placement-count", (s) => {
  const o = s as Record<string, any>;
  o.masses[0].faces[0].elements.push({
    elementId: "tarma",
    zone: "upper",
    u: [3, 4.6],
    z: 3.6,
    params: { width: 1.6, height: 1.1, depth: 0.45 },
  });
  return o;
});

console.log("");
console.log("  Parameters");
lintFlags("a parameter outside its hard bounds is an error", "param-out-of-range", (s) => {
  const o = s as Record<string, any>;
  o.masses[0].crown.params.height = 9;
  return o;
});
lintFlags(
  "a parameter outside the documented range is a warning, not a block",
  "param-outside-documented-range",
  (s) => {
    const o = s as Record<string, any>;
    // 1.05 m is buildable (max 1.2) but well past the documented 0.45-0.8.
    o.masses[0].crown.params.height = 1.05;
    return o;
  },
  "warning",
);
lintFlags("an unknown parameter key is rejected", "unknown-param", (s) => {
  const o = s as Record<string, any>;
  o.masses[0].crown.params.sparkle = 3;
  return o;
});

console.log("");
console.log("  Attribution");
lintFlags("an element with no stated derivation is rejected", "provenance-incomplete", (s) => {
  const o = s as Record<string, any>;
  o.provenance.derivedFrom = o.provenance.derivedFrom.filter(
    (d: { elementId: string }) => d.elementId !== "tarma",
  );
  return o;
});
lintFlags("a real source cited for a character it does not cover", "source-coverage", (s) => {
  const o = s as Record<string, any>;
  o.provenance.derivedFrom[0].citations = [{ sourceId: "unesco-whc-1361-historic-jeddah" }];
  return o;
});

console.log("");
console.log("  Geometry and materials");
lintFlags("masses that interpenetrate are rejected", "mass-overlap", (s) => {
  const o = s as Record<string, any>;
  o.masses[1].footprint = [-9, -6, -4, 6];
  return o;
});
lintFlags("a mass outside the plot is rejected", "mass-outside-plot", (s) => {
  const o = s as Record<string, any>;
  o.masses[0].footprint = [-9, -30, 9, -2];
  return o;
});
lintFlags("a material outside the chosen palette is rejected", "unknown-material", (s) => {
  const o = s as Record<string, any>;
  o.masses[0].material = "chrome";
  return o;
});

console.log("");
console.log("  Manufacturability");
const thin = clone();
(thin as Record<string, any>).masses[0].wallThickness = 0.1;
const thinParsed = FacadeSpecSchema.safeParse(thin);
if (thinParsed.success) {
  const m = manufacturabilityLint(thinParsed.data);
  if (m.ok) bad("a wall too thin to cast is flagged", "manufacturabilityLint passed it");
  else ok("a wall too thin to cast is flagged", m.errors[0].message);
} else {
  // 0.1 is below the schema minimum too, which is also a valid refusal.
  ok("a wall too thin to cast is flagged", "refused by the schema bounds");
}
const baseM = manufacturabilityLint(spec);
if (!baseM.ok) bad("the golden fixture is manufacturable", baseM.errors.map((e) => e.message).join("; "));
else ok("the golden fixture is manufacturable");

console.log("");
if (failures > 0) {
  console.error(failures + " check(s) failed.");
  process.exit(1);
}
console.log("spec schema and cultural lint behaving as specified");
