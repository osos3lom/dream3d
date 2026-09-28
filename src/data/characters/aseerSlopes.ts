/** Aseer Slopes — official map character no. 8.
 *
 *  The one character where an element-level claim is fully documented: Al-Qatt
 *  Al-Asiri, inscribed by UNESCO in 2017. Note that the inscription describes an
 *  *interior* practice — the al-qatt element record restricts itself to interior
 *  surfaces accordingly, and that restriction is tested. Nothing here should be
 *  read as licence to paint qatt across an exterior facade. */

import type { ArchCharacter } from "@/types/character";
import type { Provenance } from "@/types/provenance";

const registry: Provenance = {
  kind: "documented",
  citations: [{ sourceId: "dasc-architecture-map-2025", locus: "Aseer Slopes Architecture" }],
};

const registryAndQatt: Provenance = {
  kind: "documented",
  citations: [
    { sourceId: "dasc-architecture-map-2025", locus: "Aseer Slopes Architecture" },
    { sourceId: "unesco-ich-01261-al-qatt-al-asiri", locus: "Representative List inscription, 2017" },
  ],
  corroborated: true,
};

const pending: Provenance = {
  kind: "unverified",
  note:
    "Studio-authored exhibit copy. Awaiting the DASC design guideline for " +
    "Aseer Slopes to record a citable locus (source: dasc-design-guidelines).",
};

export const aseerSlopes: ArchCharacter = {
  id: "aseer-slopes",
  registry: "official-map",
  officialIndex: 8,
  name: { en: "Aseer Slopes", ar: "سفوح عسير" },
  region: { en: "Asir — the western escarpment", ar: "عسير — الحيد الغربي" },
  tagline: {
    en: "Stone towers, projecting rain courses, and painted interiors",
    ar: "أبراج حجرية وصفائح مطر بارزة وداخل ملوّن",
  },
  description: {
    en: "The architecture of the south-western escarpment, and the one Saudi character shaped primarily by rain rather than heat. Tall stone towers are built up in courses with thin slate slabs set to project every few courses, throwing rainwater clear of the wall — a horizontal rhythm that is the character's most recognisable texture. Parapets are lime-washed white and pointed so the houses read across a valley. Inside, the walls carry Al-Qatt Al-Asiri, the geometric painting practised by the women of Asir and inscribed by UNESCO in 2017.",
    ar: "عمارة الحيد الجنوبي الغربي، وهي الطابع السعودي الوحيد الذي شكّله المطر أكثر من الحرارة. تُبنى أبراج حجرية عالية بمداميك تتخللها صفائح حجرية رقيقة بارزة كل بضعة مداميك لتبعد ماء المطر عن الجدار، فيتكوّن الإيقاع الأفقي الذي هو أبرز ملامح الطابع. وتُطلى الدروات بالجير الأبيض وتُدبّب لتُرى عبر الوادي. وفي الداخل تحمل الجدران القط العسيري، فن الزخرفة الهندسية الذي تمارسه نساء عسير والمُدرج في اليونسكو عام 2017.",
  },
  climate: {
    summerHighC: [26, 32],
    humidity: "highland",
    drivers: ["rainfall", "altitude-cold", "solar-gain"],
    provenance: pending,
  },
  typologies: {
    traditional: {
      typology: "traditional",
      summary: {
        en: "Coursed stone towers with projecting slate rain ribs, white pointed merlons, qamariya fanlights, and Al-Qatt painted interiors.",
        ar: "أبراج حجرية بمداميك وصفائح مطر بارزة، ورؤوس بيضاء مدببة، وقمريات، وداخل مزخرف بالقط.",
      },
      period: { en: "Attested over several centuries; Al-Qatt Al-Asiri is described as a practice of more than 300 years", ar: "موثّق على مدى قرون؛ ويوصف القط العسيري بممارسة تمتد أكثر من ثلاثمئة عام" },
      elementIds: ["slate-ribs", "al-qatt", "qamariya"],
      materialIds: ["asiri-stone"],
      provenance: registryAndQatt,
    },
    transitional: {
      typology: "transitional",
      summary: {
        en: "Framed or block construction retaining the projecting rib rhythm and the white crowned parapet.",
        ar: "بناء هيكلي أو بالبلوك يحتفظ بإيقاع الصفائح البارزة والدروة البيضاء المتوّجة.",
      },
      period: { en: "Mid-20th century onward", ar: "من منتصف القرن العشرين" },
      elementIds: ["slate-ribs", "qamariya"],
      materialIds: ["asiri-stone"],
      provenance: registry,
    },
    contemporary: {
      typology: "contemporary",
      summary: {
        en: "Contemporary stone massing keeping the rain-shedding rib courses and the pointed white crown, with qatt colour used in interiors and courts rather than on the street facade.",
        ar: "كتل حجرية معاصرة تحفظ مداميك تصريف المطر والتتويج الأبيض المدبب، ويُستخدم لون القط في الداخل والأفنية لا في واجهة الشارع.",
      },
      period: { en: "Present practice", ar: "الممارسة الحالية" },
      elementIds: ["slate-ribs", "al-qatt", "qamariya"],
      materialIds: ["asiri-stone"],
      provenance: registryAndQatt,
      exhibitId: "asiri",
    },
  },
  provenance: registryAndQatt,
  // Approximate centroid, Asir escarpment near Abha.
  centroid: [42.66, 18.28],
  tint: "#a66a4c",
  keywords: {
    en: "asiri, aseer, asir, al-qatt, qatt, qamariya, slate, rain course, rijal almaa",
    ar: "عسيري، عسير، القط العسيري، القمرية، الصفائح، صفائح المطر، رجال ألمع",
    extra: ["escarpment", "highland", "intangible cultural heritage"],
  },
};
