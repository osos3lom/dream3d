/** Official-map characters whose reference material has not been written yet.
 *
 *  These records carry only what the Characters Map itself establishes: that the
 *  character exists, its official index, its name, and roughly where it sits.
 *  Everything descriptive says "reference in progress" and nothing more.
 *
 *  That is a deliberate choice, and the alternative was worse. Writing
 *  confident-sounding prose about, say, Farasan Islands architecture from
 *  secondary web sources would make the product look finished while quietly
 *  filling it with unsourced claims — the exact failure this whole design is
 *  built to avoid. A visibly thin record invites the research; a plausible
 *  fabricated one prevents it.
 *
 *  The KPI report counts these as cells without a profile, so coverage is
 *  reported as it actually is (currently 4 characters of 19 with authored
 *  content) rather than implied by the presence of nineteen files.
 *
 *  Promoting one of these means: read the DASC design guideline for that
 *  character, add it to the source register with its `characterIds`, author the
 *  description and climate profile with citations, list the attested elements,
 *  and have the result reviewed. Replacing the placeholder strings alone is not
 *  promotion. */

import type { ArchCharacter, Typology, TypologyProfile } from "@/types/character";
import { TYPOLOGIES } from "@/types/character";
import type { Provenance } from "@/types/provenance";

/** What we can honestly say: the registry lists this character. */
const registryFor = (englishName: string): Provenance => ({
  kind: "documented",
  citations: [
    { sourceId: "dasc-architecture-map-2025", locus: `${englishName} (Saudi Architecture Characters Map)` },
  ],
});

/** What we cannot yet say. */
const notWritten = (englishName: string): Provenance => ({
  kind: "unverified",
  note:
    `No reference material authored for ${englishName} yet. Requires the DASC ` +
    "design guideline for this character to be read and added to " +
    "src/data/corpus/sources.ts with its characterIds before any descriptive " +
    "claim is made. Placeholder copy must not be presented as documented.",
});

const IN_PROGRESS = {
  en: "Reference in progress. This character is listed on the Saudi Architecture Characters Map; its design guideline has not been read into the corpus yet, so no description is offered.",
  ar: "المرجع قيد الإعداد. هذا الطابع مُدرج في خريطة طابع العمارة السعودية، ولم تُقرأ موجهاته التصميمية بعد، فلا يُقدَّم وصف.",
} as const;

function blankTypologies(englishName: string): Record<Typology, TypologyProfile> {
  const one = (typology: Typology): TypologyProfile => ({
    typology,
    summary: IN_PROGRESS,
    period: { en: "—", ar: "—" },
    elementIds: [],
    materialIds: [],
    provenance: notWritten(englishName),
  });
  return TYPOLOGIES.reduce(
    (acc, t) => ({ ...acc, [t]: one(t) }),
    {} as Record<Typology, TypologyProfile>,
  );
}

interface Seed {
  id: string;
  officialIndex: number;
  en: string;
  ar: string;
  regionEn: string;
  regionAr: string;
  /** Approximate [longitude, latitude]; indicative placement on the map only. */
  centroid: [number, number];
  tint: string;
}

/** The fifteen official characters still awaiting reference material. Najdi,
 *  Coastal Hijazi, Aseer Slopes and Eastern Coast are authored separately and
 *  are not in this list. */
const SEEDS: Seed[] = [
  { id: "northern-najdi", officialIndex: 3, en: "Northern Najdi", ar: "نجد الشمالي", regionEn: "Qassim and Ha'il", regionAr: "القصيم وحائل", centroid: [43.97, 26.33], tint: "#c9a878" },
  { id: "eastern-najdi", officialIndex: 18, en: "Eastern Najdi", ar: "نجد الشرقي", regionEn: "Eastern Najd", regionAr: "شرق نجد", centroid: [45.3, 25.8], tint: "#c6a074" },
  { id: "tabuk-coast", officialIndex: 2, en: "Tabuk Coast", ar: "ساحل تبوك", regionEn: "Tabuk, Red Sea coast", regionAr: "تبوك، ساحل البحر الأحمر", centroid: [35.6, 27.5], tint: "#d8c6a8" },
  { id: "al-madinah", officialIndex: 4, en: "Al-Madinah", ar: "المدينة المنورة", regionEn: "Al-Madinah", regionAr: "المدينة المنورة", centroid: [39.61, 24.47], tint: "#cbb894" },
  { id: "al-madinah-rural", officialIndex: 5, en: "Al-Madinah Rural", ar: "ريف المدينة المنورة", regionEn: "Rural Al-Madinah", regionAr: "ريف المدينة المنورة", centroid: [39.4, 24.2], tint: "#c4b08c" },
  { id: "taif", officialIndex: 6, en: "Taif", ar: "الطائف", regionEn: "Taif highlands, Makkah Province", regionAr: "مرتفعات الطائف، منطقة مكة المكرمة", centroid: [40.42, 21.27], tint: "#b9a184" },
  { id: "sarawat-mountains", officialIndex: 9, en: "Sarawat Mountains", ar: "جبال السروات", regionEn: "Sarawat range, Asir and Al-Bahah", regionAr: "سلسلة السروات، عسير والباحة", centroid: [41.5, 19.9], tint: "#8f7d68" },
  { id: "tihamah-coast", officialIndex: 10, en: "Tihamah Coast", ar: "ساحل تهامة", regionEn: "Tihamah coast, Jazan and Asir", regionAr: "ساحل تهامة، جازان وعسير", centroid: [42.55, 17.5], tint: "#cbb79a" },
  { id: "tihamah-foothills", officialIndex: 11, en: "Tihamah Foothills", ar: "سفوح تهامة", regionEn: "Tihamah foothills", regionAr: "سفوح تهامة", centroid: [42.9, 17.9], tint: "#b8a488" },
  { id: "abha-highlands", officialIndex: 12, en: "Abha Highlands", ar: "مرتفعات أبها", regionEn: "Abha, Asir", regionAr: "أبها، عسير", centroid: [42.5, 18.22], tint: "#94826c" },
  { id: "bisha-desert", officialIndex: 13, en: "Bisha Desert", ar: "صحراء بيشة", regionEn: "Bisha, Asir", regionAr: "بيشة، عسير", centroid: [42.6, 19.98], tint: "#c2a67f" },
  { id: "farasan-islands", officialIndex: 14, en: "Farasan Islands", ar: "جزر فرسان", regionEn: "Farasan Islands, Jazan", regionAr: "جزر فرسان، جازان", centroid: [42.12, 16.7], tint: "#ded0b4" },
  { id: "najran", officialIndex: 15, en: "Najran", ar: "نجران", regionEn: "Najran", regionAr: "نجران", centroid: [44.13, 17.49], tint: "#b58f66" },
  { id: "al-qatif", officialIndex: 16, en: "Al-Qatif", ar: "القطيف", regionEn: "Qatif oasis, Eastern Province", regionAr: "واحة القطيف، المنطقة الشرقية", centroid: [50.02, 26.56], tint: "#cfc0a2" },
  { id: "al-ahsa-oasis", officialIndex: 17, en: "Al-Ahsa Oasis", ar: "واحة الأحساء", regionEn: "Al-Ahsa oasis, Eastern Province", regionAr: "واحة الأحساء، المنطقة الشرقية", centroid: [49.59, 25.38], tint: "#c9b795" },
];

/** Al-Ahsa Oasis has a UNESCO inscription we have read, so its character-level
 *  provenance can corroborate the registry even though its design guideline has
 *  not been read. This is the only exception in this file, and it is exactly the
 *  shape a promotion takes. */
const CHARACTER_PROVENANCE: Record<string, Provenance | undefined> = {
  "al-ahsa-oasis": {
    kind: "documented",
    citations: [
      { sourceId: "dasc-architecture-map-2025", locus: "Al-Ahsa Oasis Architecture" },
      { sourceId: "unesco-whc-1563-al-ahsa-oasis", locus: "Al-Ahsa Oasis, inscribed 2018" },
    ],
    corroborated: true,
  },
};

export const REGISTRY_ONLY_CHARACTERS: ArchCharacter[] = SEEDS.map((s) => ({
  id: s.id,
  registry: "official-map",
  officialIndex: s.officialIndex,
  name: { en: s.en, ar: s.ar },
  region: { en: s.regionEn, ar: s.regionAr },
  tagline: IN_PROGRESS,
  description: IN_PROGRESS,
  climate: {
    // Deliberately neutral: a fabricated climate profile would be as much of an
    // invention as fabricated prose. Left flat and marked unverified.
    summerHighC: [0, 0],
    humidity: "arid",
    drivers: [],
    provenance: notWritten(s.en),
  },
  typologies: blankTypologies(s.en),
  provenance: CHARACTER_PROVENANCE[s.id] ?? registryFor(s.en),
  centroid: s.centroid,
  tint: s.tint,
  keywords: { en: `${s.en.toLowerCase()}, ${s.regionEn.toLowerCase()}`, ar: `${s.ar}، ${s.regionAr}` },
}));

/** True when a character record is still a registry-only placeholder. The UI
 *  uses this to show an honest "reference in progress" state, and the KPI report
 *  uses it to compute coverage. */
export const isRegistryOnly = (c: ArchCharacter): boolean =>
  c.description.en === IN_PROGRESS.en;
