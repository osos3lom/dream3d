/** Najdi — official map character no. 1.
 *
 *  The one character with a fully authored reference set, because the studio
 *  already built a Najdi exhibit and wrote its content. Treat this file as the
 *  shape the other eighteen should grow into: every claim attributed, the
 *  registry cited at character level, and the descriptive copy honest about
 *  still awaiting its design guideline.
 *
 *  Note what is and is not documented here. The taxonomy facts — that Najdi is
 *  on the official map, its index, its region, the three typologies — cite the
 *  Characters Map itself. The historical grounding for At-Turaif cites the
 *  UNESCO inscription. The descriptive and climate copy is the studio's own and
 *  is marked `unverified` until the DASC guideline is read. */

import type { ArchCharacter } from "@/types/character";
import type { Provenance } from "@/types/provenance";

const registry: Provenance = {
  kind: "documented",
  citations: [
    { sourceId: "dasc-architecture-map-2025", locus: "Najdi Architecture (character 1 of 19)" },
  ],
};

const registryAndTuraif: Provenance = {
  kind: "documented",
  citations: [
    { sourceId: "dasc-architecture-map-2025", locus: "Najdi Architecture" },
    { sourceId: "unesco-whc-1329-at-turaif", locus: "At-Turaif District in ad-Dir'iyah, inscribed 2010" },
  ],
  corroborated: true,
};

const pending: Provenance = {
  kind: "unverified",
  note:
    "Studio-authored exhibit copy. Awaiting the DASC design guideline for Najdi " +
    "to record a citable locus (source: dasc-design-guidelines).",
};

export const najdi: ArchCharacter = {
  id: "najdi",
  registry: "official-map",
  officialIndex: 1,
  name: { en: "Najdi", ar: "نجدي" },
  region: { en: "Najd — Riyadh, Qassim and Ha'il", ar: "نجد — الرياض والقصيم وحائل" },
  tagline: {
    en: "Carved earthen mass, triangular light, and an inward-facing court",
    ar: "كتلة طينية منحوتة وضوء مثلث وفناء داخلي",
  },
  description: {
    en: "The architecture of the central plateau: thick load-bearing earthen walls that hold the night's cool through the day, small and deeply shaded openings, a stepped crenellated roofline, and rooms turned inward onto a courtyard rather than outward onto the street. At-Turaif in ad-Dir'iyah, inscribed by UNESCO in 2010, is among the largest mudbrick settlements in the world and the reference point for the character.",
    ar: "عمارة الهضبة الوسطى: جدران طينية حاملة سميكة تحفظ برد الليل إلى النهار، وفتحات صغيرة غائرة الظل، وخط سطح مدرّج بالشرفات، وغرف تنفتح على الفناء لا على الشارع. وحي طريف في الدرعية، المسجل في اليونسكو عام 2010، من أكبر المستوطنات الطينية في العالم ومرجع هذا الطابع.",
  },
  climate: {
    summerHighC: [42, 47],
    humidity: "arid",
    drivers: ["solar-gain", "thermal-mass", "sand-wind", "privacy"],
    provenance: pending,
  },
  typologies: {
    traditional: {
      typology: "traditional",
      summary: {
        en: "Load-bearing mudbrick, minimal openings, furjat venting bands, shurfat crown, hosh courtyard plan.",
        ar: "بناء طيني حامل، فتحات قليلة، شرائط فرجات للتهوية، تتويج بالشرفات، ومسقط حوش داخلي.",
      },
      period: { en: "Attested through the 18th–early 20th century", ar: "موثّق من القرن الثامن عشر إلى أوائل العشرين" },
      elementIds: ["shurfat", "furjat", "tarma", "hosh", "burj"],
      materialIds: ["najdi-earth"],
      provenance: registryAndTuraif,
    },
    transitional: {
      typology: "transitional",
      summary: {
        en: "Masonry and concrete frame carrying the earthen vocabulary: the crenellated roofline and furjat band kept as applied relief.",
        ar: "هيكل من الحجر والخرسانة يحمل المفردات الطينية؛ يُحتفظ بخط الشرفات وشريط الفرجات كنحت مضاف.",
      },
      period: { en: "Mid-20th century onward", ar: "من منتصف القرن العشرين" },
      elementIds: ["shurfat", "furjat", "tarma", "hosh"],
      materialIds: ["najdi-earth"],
      provenance: registry,
    },
    contemporary: {
      typology: "contemporary",
      summary: {
        en: "Contemporary massing that keeps the court, the deep shade and the crowned roofline while opening glazing inward rather than to the street.",
        ar: "كتل معاصرة تحفظ الفناء والظل العميق وخط السطح المتوّج، وتفتح الزجاج نحو الداخل لا نحو الشارع.",
      },
      period: { en: "Present practice", ar: "الممارسة الحالية" },
      elementIds: ["shurfat", "furjat", "tarma", "hosh", "burj"],
      materialIds: ["najdi-earth"],
      provenance: registry,
      // The studio's existing Najdi villa exhibit.
      exhibitId: "najdi",
    },
  },
  provenance: registryAndTuraif,
  // Approximate centroid, Riyadh.
  centroid: [46.72, 24.69],
  tint: "#c49a6c",
  keywords: {
    en: "najdi, najd, riyadh, diriyah, at-turaif, mudbrick, furjat, shurfat, tarma, hosh, courtyard",
    ar: "نجدي، نجد، الرياض، الدرعية، طريف، الطين، الفرجات، الشرفات، الطرمة، الحوش، الفناء",
    extra: ["adobe", "merlon", "crenellation", "burj"],
  },
};
