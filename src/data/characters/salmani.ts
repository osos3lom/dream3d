/** Salmani — a documented character that is NOT on the official map.
 *
 *  This file is the reference case for the registry distinction, and it exists
 *  as much to be tested as to be read. Salmani is a real, named contemporary
 *  design character associated with Riyadh, and the studio has already built a
 *  Salmani exhibit. It is not one of the nineteen characters of the Saudi
 *  Architecture Characters Map.
 *
 *  Two consequences, both enforced rather than trusted:
 *
 *  1. `registry` is `"documented-other"` and `officialIndex` is absent. The
 *     assertion in `./index.ts` counts official-map records and would fail if
 *     this one drifted into that set.
 *
 *  2. Its `provenance` does NOT cite `dasc-architecture-map-2025`. Citing the
 *     Characters Map here would imply official standing the character does not
 *     have, which is precisely the misrepresentation the type system is meant
 *     to prevent. `culturalLint` also rejects it, because `sourceCovers()`
 *     returns false — "salmani" is not in that source's `characterIds`.
 *
 *  Its provenance is therefore `unverified` until a primary source for the
 *  Salmani design character is read and added to the register. That is the
 *  honest state: the character is real and the studio's copy describes it, but
 *  no source has been recorded yet. */

import type { ArchCharacter } from "@/types/character";
import type { Provenance } from "@/types/provenance";

const pending: Provenance = {
  kind: "unverified",
  note:
    "Studio-authored exhibit copy for a character that is NOT on the official " +
    "Saudi Architecture Characters Map. Needs a primary source for the Salmani " +
    "design character added to src/data/corpus/sources.ts before any claim here " +
    "may be marked documented. Do not cite dasc-architecture-map-2025 for this " +
    "character — it does not cover it.",
};

export const salmani: ArchCharacter = {
  id: "salmani",
  registry: "documented-other",
  // officialIndex deliberately absent — see the note above.
  name: { en: "Salmani", ar: "سلماني" },
  region: { en: "Riyadh", ar: "الرياض" },
  tagline: {
    en: "A contemporary Riyadh design character: crisp geometry and deep shadow lines",
    ar: "طابع رياضي معاصر: هندسة نقية وخطوط ظل عميقة",
  },
  description: {
    en: "A contemporary design character associated with Riyadh, drawing on the Najdi vocabulary of the central plateau but restating it in cleaner geometry: modular facades, deep reveals that read as shadow lines, and the triangular furjat motif redrawn as a small-scale relief rather than a pierced vent. Listed here as a documented character outside the official nineteen.",
    ar: "طابع تصميمي معاصر مرتبط بالرياض، يستند إلى مفردات نجد في الهضبة الوسطى ويعيد صياغتها بهندسة أنقى: واجهات معيارية، وغوائر عميقة تُقرأ خطوط ظل، ووحدة الفرجات المثلثة مُعاد رسمها نحتاً صغير المقياس لا فتحة تهوية. ويُدرج هنا طابعاً موثّقاً خارج التسعة عشر الرسمية.",
  },
  climate: {
    summerHighC: [42, 47],
    humidity: "arid",
    drivers: ["solar-gain", "thermal-mass", "privacy"],
    provenance: pending,
  },
  typologies: {
    traditional: {
      typology: "traditional",
      summary: {
        en: "Not applicable — Salmani is by definition a contemporary character; it has no traditional stratum of its own.",
        ar: "لا ينطبق — الطابع السلماني معاصر بطبيعته وليس له طبقة تقليدية خاصة.",
      },
      period: { en: "—", ar: "—" },
      elementIds: [],
      materialIds: [],
      provenance: pending,
    },
    transitional: {
      typology: "transitional",
      summary: {
        en: "Reference in progress. The relationship between Salmani and the Najdi transitional stratum needs a source before it is described.",
        ar: "المرجع قيد الإعداد. تحتاج علاقة الطابع السلماني بالطبقة النجدية الانتقالية إلى مصدر قبل وصفها.",
      },
      period: { en: "—", ar: "—" },
      elementIds: [],
      materialIds: ["salmani-stone"],
      provenance: pending,
    },
    contemporary: {
      typology: "contemporary",
      summary: {
        en: "Modular stone-clad facades, deep shadow reveals, cantilevered planes, and a small-scale triangular relief in place of a pierced furjat band.",
        ar: "واجهات معيارية بكسوة حجرية، وغوائر ظل عميقة، ومستويات كابولية، ونحت مثلث صغير المقياس بدل شريط الفرجات المخرّم.",
      },
      period: { en: "Present practice", ar: "الممارسة الحالية" },
      elementIds: [],
      materialIds: ["salmani-stone"],
      provenance: pending,
      exhibitId: "salmani",
    },
  },
  provenance: pending,
  // Approximate centroid, Riyadh.
  centroid: [46.72, 24.69],
  tint: "#d2bb92",
  keywords: {
    en: "salmani, riyadh, contemporary, modular facade, shadow line, cantilever",
    ar: "سلماني، الرياض، معاصر، واجهة معيارية، خط ظل، كابولي",
    extra: ["not-official-map", "documented-other"],
  },
};
