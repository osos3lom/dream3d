/** Eastern Coast — official map character no. 19.
 *
 *  The studio's existing "Eastern Coastal" exhibit sits here. Note that Al-Qatif
 *  (16) and Al-Ahsa Oasis (17) are separate characters on the official map, even
 *  though they share much of this vocabulary — a good example of why the map's
 *  distinctions must be preserved rather than collapsed into a single "Gulf"
 *  style. Elements attested across more than one of them say so individually in
 *  their `attestedIn` lists. */

import type { ArchCharacter } from "@/types/character";
import type { Provenance } from "@/types/provenance";

const registry: Provenance = {
  kind: "documented",
  citations: [{ sourceId: "dasc-architecture-map-2025", locus: "Eastern Coast Architecture" }],
};

const pending: Provenance = {
  kind: "unverified",
  note:
    "Studio-authored exhibit copy. Awaiting the DASC design guideline for " +
    "Eastern Coast to record a citable locus (source: dasc-design-guidelines).",
};

export const easternCoast: ArchCharacter = {
  id: "eastern-coast",
  registry: "official-map",
  officialIndex: 19,
  name: { en: "Eastern Coast", ar: "الساحل الشرقي" },
  region: { en: "Gulf coast — Eastern Province", ar: "ساحل الخليج — المنطقة الشرقية" },
  tagline: {
    en: "Coral and gypsum courtyard houses, carved screens, and wind towers",
    ar: "بيوت أفنية من الحجر البحري والجص، ونقوش مخرّمة، وأبراج هواء",
  },
  description: {
    en: "The architecture of the Gulf littoral: courtyard houses built of porous coral stone cut from the shallows and bedded in gypsum mortar, the rough stone left as a base course where the wall meets salty ground and finished above in smooth gypsum plaster. Openings are screened with carved gypsum panels rather than timber. Roofs are spanned with danchal — straight mangrove poles shipped from East Africa — whose ends project through the wall in a row. Above the roof, a slotted wind tower catches the Gulf breeze from any direction and drives it down into the rooms.",
    ar: "عمارة ساحل الخليج: بيوت أفنية من الحجر البحري المسامي المقطوع من المياه الضحلة والمبني بمونة الجص، يُترك الحجر خشناً مدماكاً عند التقاء الجدار بالأرض المالحة ويُلبَّس أعلاه بلياسة جصية ناعمة. وتُستر الفتحات بألواح جصية منقوشة بدل الخشب. وتُسقف البيوت بالدنجل — جذوع مانجروف مستقيمة تُجلب من شرق أفريقيا — تبرز رؤوسها صفاً من الجدار. وفوق السطح يلتقط برج هواء مشقوق نسيم الخليج من أي اتجاه ويدفعه إلى الغرف.",
  },
  climate: {
    summerHighC: [42, 48],
    humidity: "humid-coastal",
    drivers: ["cross-ventilation", "solar-gain", "salt-air", "privacy", "thermal-mass"],
    provenance: pending,
  },
  typologies: {
    traditional: {
      typology: "traditional",
      summary: {
        en: "Coral stone and gypsum courtyard plan with a riwaq arcade, carved gypsum screens, danchal beam ends, and a badgir wind tower.",
        ar: "مسقط فناء من الحجر البحري والجص مع رواق، ونقوش جصية مخرّمة، ورؤوس دنجل، وبرج بادجير.",
      },
      period: { en: "Attested through the 19th–early 20th century", ar: "موثّق من القرن التاسع عشر إلى أوائل العشرين" },
      elementIds: ["farush-base", "gypsum-screen", "danchal", "badgir", "riwaq"],
      materialIds: ["eastern-gypsum"],
      provenance: registry,
    },
    transitional: {
      typology: "transitional",
      summary: {
        en: "Framed construction retaining the courtyard plan, the screened opening and the projecting beam line as facade devices.",
        ar: "بناء هيكلي يحتفظ بمسقط الفناء والفتحة المستورة وخط الأعواد البارز عناصر في الواجهة.",
      },
      period: { en: "Mid-20th century onward", ar: "من منتصف القرن العشرين" },
      elementIds: ["farush-base", "gypsum-screen", "danchal", "riwaq"],
      materialIds: ["eastern-gypsum"],
      provenance: registry,
    },
    contemporary: {
      typology: "contemporary",
      summary: {
        en: "Contemporary courtyard massing keeping cross-ventilation and the screened opening, with the wind tower reinterpreted as a light and ventilation shaft.",
        ar: "كتل فناء معاصرة تحفظ التهوية المتصالبة والفتحة المستورة، ويُعاد تفسير برج الهواء منوراً وشافطاً للتهوية.",
      },
      period: { en: "Present practice", ar: "الممارسة الحالية" },
      elementIds: ["farush-base", "gypsum-screen", "danchal", "badgir", "riwaq"],
      materialIds: ["eastern-gypsum"],
      provenance: registry,
      exhibitId: "eastern",
    },
  },
  provenance: registry,
  // Approximate centroid, Gulf coast near Dammam.
  centroid: [50.1, 26.43],
  tint: "#9fb0a6",
  keywords: {
    en: "eastern, gulf, coastal, farush, coral stone, gypsum, danchal, badgir, riwaq, courtyard",
    ar: "الشرقية، الخليج، ساحلي، الفروش، الحجر البحري، الجص، الدنجل، البادجير، الرواق، الفناء",
    extra: ["wind tower", "mangrove", "oasis"],
  },
};
