/** Coastal Hijazi — official map character no. 7.
 *
 *  Taxonomy facts cite the Characters Map; the historical grounding cites the
 *  Historic Jeddah inscription, which we have read. Descriptive and climate copy
 *  is the studio's own authored exhibit text and stays `unverified` until the
 *  DASC guideline for this character is read. */

import type { ArchCharacter } from "@/types/character";
import type { Provenance } from "@/types/provenance";

const registry: Provenance = {
  kind: "documented",
  citations: [{ sourceId: "dasc-architecture-map-2025", locus: "Coastal Hijazi Architecture" }],
};

const registryAndJeddah: Provenance = {
  kind: "documented",
  citations: [
    { sourceId: "dasc-architecture-map-2025", locus: "Coastal Hijazi Architecture" },
    { sourceId: "unesco-whc-1361-historic-jeddah", locus: "Historic Jeddah, the Gate to Makkah, inscribed 2014" },
  ],
  corroborated: true,
};

const pending: Provenance = {
  kind: "unverified",
  note:
    "Studio-authored exhibit copy. Awaiting the DASC design guideline for " +
    "Coastal Hijazi to record a citable locus (source: dasc-design-guidelines).",
};

export const coastalHijazi: ArchCharacter = {
  id: "coastal-hijazi",
  registry: "official-map",
  officialIndex: 7,
  name: { en: "Coastal Hijazi", ar: "الحجاز الساحلي" },
  region: { en: "Red Sea coast — Jeddah and the Hijaz littoral", ar: "ساحل البحر الأحمر — جدة وسواحل الحجاز" },
  tagline: {
    en: "Coral-stone tower houses, timber coursing, and projecting lattice bays",
    ar: "بيوت برجية من الحجر المنقبي وتكاليل خشبية ورواشين بارزة",
  },
  description: {
    en: "The architecture of the Red Sea littoral: tall houses of coral limestone quarried from the shallows, walls levelled and tied roughly every metre by timber beams, and facades layered with projecting timber lattice bays that catch the sea breeze while screening the household. High lattice openings vent hot air at ceiling level, and the roof terrace is a room in its own right. Historic Jeddah, inscribed by UNESCO in 2014, preserves the city-scale version of this character.",
    ar: "عمارة ساحل البحر الأحمر: بيوت مرتفعة من الحجر المنقبي المقطوع من الشعاب، تُسوّى جدرانها وتُربط كل متر تقريباً بأخشاب أفقية، وتتطبّق واجهاتها برواشين خشبية بارزة تلتقط نسيم البحر وتستر البيت. وتطرد الفتحات المشبّكة العالية الهواء الساخن من أعلى الغرف، ويصبح سطح البيت غرفة قائمة بذاتها. ويحفظ جدة التاريخية، المسجلة في اليونسكو عام 2014، صورة هذا الطابع على مقياس المدينة.",
  },
  climate: {
    summerHighC: [38, 43],
    humidity: "humid-coastal",
    drivers: ["cross-ventilation", "solar-gain", "salt-air", "privacy"],
    provenance: pending,
  },
  typologies: {
    traditional: {
      typology: "traditional",
      summary: {
        en: "Coral limestone with timber takalil tie-beams, stacked rawashin, high lattice vents, and a latticed roof terrace.",
        ar: "حجر منقبي بتكاليل خشبية، ورواشين متراكبة، وفتحات تهوية مشبّكة عالية، وسطح بدروة مشبّكة.",
      },
      period: { en: "Attested through the 19th–early 20th century", ar: "موثّق من القرن التاسع عشر إلى أوائل العشرين" },
      elementIds: ["roshan", "takalil", "ventilation-screen"],
      materialIds: ["hijazi-coral"],
      provenance: registryAndJeddah,
    },
    transitional: {
      typology: "transitional",
      summary: {
        en: "Framed construction retaining the roshan as an applied bay and the timber coursing as a facade band.",
        ar: "بناء هيكلي يحتفظ بالروشن شرفة مضافة وبالتكاليل شريطاً في الواجهة.",
      },
      period: { en: "Mid-20th century onward", ar: "من منتصف القرن العشرين" },
      elementIds: ["roshan", "takalil"],
      materialIds: ["hijazi-coral"],
      provenance: registry,
    },
    contemporary: {
      typology: "contemporary",
      summary: {
        en: "Contemporary massing keeping the layered, deeply shaded facade and the ventilated roof room, with lattice reinterpreted in modern materials.",
        ar: "كتل معاصرة تحفظ الواجهة المتطبّقة عميقة الظل وغرفة السطح المهوّاة، ويُعاد تفسير التشبيك بمواد حديثة.",
      },
      period: { en: "Present practice", ar: "الممارسة الحالية" },
      elementIds: ["roshan", "takalil", "ventilation-screen"],
      materialIds: ["hijazi-coral"],
      provenance: registry,
      exhibitId: "hijazi",
    },
  },
  provenance: registryAndJeddah,
  // Approximate centroid, Jeddah.
  centroid: [39.19, 21.49],
  tint: "#b8905e",
  keywords: {
    en: "hijazi, hejazi, jeddah, al-balad, roshan, rawashin, mashrabiya, coral stone, takalil",
    ar: "حجازي، جدة، البلد، الروشن، الرواشين، المشربية، الحجر المنقبي، التكاليل",
    extra: ["red sea", "coral limestone", "tower house"],
  },
};
