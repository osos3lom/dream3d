/** The cultural element library.
 *
 *  Each record names an architectural device attested in the sources, the job
 *  it does, the bounded parameters that describe it, where it may legally
 *  appear, and the two builders — browser and Blender — that realise it.
 *
 *  Provenance honesty. Only `al-qatt` currently carries `documented`
 *  provenance, because the UNESCO inscription behind it has been read directly.
 *  Every other record is marked `unverified` with a note naming the source that
 *  needs reading, almost always the per-character design guideline published by
 *  DASC. The descriptive copy is the studio team's own authored exhibit text
 *  (migrated from `src/data/styles/*.ts`, EN and AR both human-written), which
 *  makes it ours to use but does not make it sourced. Promoting a record to
 *  `documented` means someone read the guideline and recorded the locus — it is
 *  not a formatting change.
 *
 *  `scripts/studio/catalog-build.mjs` counts the `unverified` records and, once
 *  STRICT_PROVENANCE is switched on ahead of publication, fails the build on any
 *  that remain. The count is deliberately visible rather than hidden behind a
 *  default. */

import type { CulturalElement } from "@/types/element";
import type { Typology } from "@/types/character";
import type { Provenance } from "@/types/provenance";

/** Records awaiting a primary source. Keeps the reason in one place instead of
 *  repeating the same sentence fifteen times. */
const pending = (character: string): Provenance => ({
  kind: "unverified",
  note:
    "Descriptive copy is the studio's own authored exhibit text. Awaiting the " +
    `DASC design guideline for ${character} to record a citable locus ` +
    "(source: dasc-design-guidelines).",
});

/** The UNESCO inscription behind Al-Qatt Al-Asiri, read directly. */
const qattSource = (locus?: string): Provenance => ({
  kind: "documented",
  citations: [{ sourceId: "unesco-ich-01261-al-qatt-al-asiri", ...(locus ? { locus } : {}) }],
});

export const ELEMENTS: CulturalElement[] = [
  // ─────────────────────────────────────────────────────────────── Najdi
  {
    id: "shurfat",
    kind: "crown",
    name: { en: "Shurfat Battlements", ar: "الشرفات" },
    term: { translit: "shurfat", ar: "الشرفات" },
    gloss: { en: "Stepped crenellations crowning the roof", ar: "تتويج مدرّج أعلى السطح" },
    rationale: {
      en: "Stepped triangular merlons run along the parapet, the way they crowned the walls of Diriyah and old Riyadh, giving the roofline a recognisable silhouette from the street.",
      ar: "تمتد الشرفات المثلثة المدرّجة على الحواف كما كانت تتوّج جدران الدرعية والرياض القديمة، فتمنح خط السطح صورة مميزة من الشارع.",
    },
    attestedIn: [
      { characterId: "najdi", typologies: ["traditional", "transitional", "contemporary"], provenance: pending("Najdi") },
    ],
    params: [
      { key: "width", label: { en: "Merlon width", ar: "عرض الشرفة" }, unit: "m", min: 0.3, max: 1.1, default: 0.56, step: 0.02, documentedRange: [0.45, 0.7], provenance: pending("Najdi") },
      { key: "height", label: { en: "Merlon height", ar: "ارتفاع الشرفة" }, unit: "m", min: 0.3, max: 1.2, default: 0.6, step: 0.02, documentedRange: [0.45, 0.8], provenance: pending("Najdi") },
      { key: "pitch", label: { en: "Spacing", ar: "التباعد" }, unit: "m", min: 0.7, max: 2.6, default: 1.5, step: 0.05, documentedRange: [0.9, 1.6], provenance: pending("Najdi") },
      { key: "steps", label: { en: "Steps", ar: "الدرجات" }, unit: "count", min: 1, max: 5, default: 3, step: 1, documentedRange: [2, 3], provenance: pending("Najdi") },
    ],
    builder: { ts: "shurfat", py: "shurfat" },
    placement: {
      faces: ["any"],
      zone: ["crown", "roof"],
      surfaces: ["exterior", "roof"],
      notes: { en: "Shurfat crown a parapet; they do not appear at ground level.", ar: "الشرفات تتوّج الدروة ولا تظهر عند مستوى الأرض." },
    },
    provenance: pending("Najdi"),
  },
  {
    id: "furjat",
    kind: "perforation",
    name: { en: "Furjat Openings", ar: "الفرجات" },
    term: { translit: "furjat", ar: "الفرجات" },
    gloss: { en: "Triangular vents in a carved band", ar: "فتحات مثلثة في شريط منحوت" },
    rationale: {
      en: "A continuous band of triangular openings sits beneath the parapet. In traditional Najdi houses furjat vented hot air from the upper rooms and let light in without glare.",
      ar: "شريط متصل من الفتحات المثلثة أسفل الدروة كان يطرد الهواء الساخن من الغرف العلوية ويُدخل الضوء دون وهج.",
    },
    attestedIn: [
      { characterId: "najdi", typologies: ["traditional", "transitional", "contemporary"], provenance: pending("Najdi") },
      { characterId: "northern-najdi", typologies: ["traditional", "transitional"], provenance: pending("Northern Najdi") },
    ],
    params: [
      { key: "height", label: { en: "Band height", ar: "ارتفاع الشريط" }, unit: "m", min: 0.4, max: 1.4, default: 0.75, step: 0.05, documentedRange: [0.5, 0.9], provenance: pending("Najdi") },
      { key: "base", label: { en: "Triangle base", ar: "قاعدة المثلث" }, unit: "m", min: 0.25, max: 0.9, default: 0.52, step: 0.02, documentedRange: [0.35, 0.6], provenance: pending("Najdi") },
      { key: "pitch", label: { en: "Spacing", ar: "التباعد" }, unit: "m", min: 0.5, max: 2.0, default: 0.92, step: 0.02, documentedRange: [0.7, 1.1], provenance: pending("Najdi") },
    ],
    builder: { ts: "triBand", py: "tri_band" },
    placement: {
      faces: ["any"],
      zone: ["upper", "crown"],
      surfaces: ["exterior"],
      notes: { en: "Furjat sit high in the wall, below the parapet — that is where they do their venting work.", ar: "تقع الفرجات عالياً في الجدار أسفل الدروة، وهو موضع عملها في التهوية." },
    },
    provenance: pending("Najdi"),
  },
  {
    id: "tarma",
    kind: "projection",
    name: { en: "Tarma", ar: "الطرمة" },
    term: { translit: "tarma", ar: "الطرمة" },
    gloss: { en: "Projecting peephole box over the door", ar: "صندوق بارز فوق المدخل" },
    rationale: {
      en: "A small box projecting from the upper wall above the entrance, pierced with narrow slits so the household could see who was at the door before opening it.",
      ar: "صندوق صغير يبرز من الجدار فوق الباب بفتحات ضيقة لرؤية الزائر قبل فتح الباب.",
    },
    attestedIn: [
      { characterId: "najdi", typologies: ["traditional", "transitional", "contemporary"], provenance: pending("Najdi") },
    ],
    params: [
      { key: "width", label: { en: "Width", ar: "العرض" }, unit: "m", min: 0.8, max: 2.6, default: 1.6, step: 0.05, documentedRange: [1.0, 2.0], provenance: pending("Najdi") },
      { key: "height", label: { en: "Height", ar: "الارتفاع" }, unit: "m", min: 0.6, max: 2.0, default: 1.1, step: 0.05, provenance: pending("Najdi") },
      { key: "depth", label: { en: "Projection", ar: "البروز" }, unit: "m", min: 0.2, max: 0.9, default: 0.45, step: 0.02, documentedRange: [0.3, 0.6], provenance: pending("Najdi") },
    ],
    builder: { ts: "tarma", py: "lbox" },
    placement: {
      faces: ["street"],
      zone: ["upper"],
      surfaces: ["exterior"],
      maxPerFace: 1,
      notes: { en: "A tarma exists to watch the entrance. It belongs above the door on the street face, and only one of them.", ar: "وُجدت الطرمة لمراقبة المدخل، فموضعها فوق الباب في واجهة الشارع، وواحدة فقط." },
    },
    provenance: pending("Najdi"),
  },
  {
    id: "hosh",
    kind: "court",
    name: { en: "Hosh Courtyard", ar: "الحوش" },
    term: { translit: "hosh", ar: "الحوش" },
    gloss: { en: "Inward-facing shaded courtyard", ar: "فناء داخلي مظلل" },
    rationale: {
      en: "Rooms open inward to the court rather than the street. A pergola filters midday sun and a shallow pool cools the air by evaporation, while the outer wall keeps the household private.",
      ar: "تنفتح الغرف نحو الفناء لا نحو الشارع؛ برجولة تكسر شمس الظهيرة وحوض ماء يلطّف الهواء، ويحفظ الجدار الخارجي خصوصية الأسرة.",
    },
    attestedIn: [
      { characterId: "najdi", typologies: ["traditional", "transitional", "contemporary"], provenance: pending("Najdi") },
      { characterId: "al-ahsa-oasis", typologies: ["traditional", "transitional"], provenance: pending("Al-Ahsa Oasis") },
    ],
    params: [
      { key: "width", label: { en: "Court width", ar: "عرض الفناء" }, unit: "m", min: 4, max: 20, default: 12, step: 0.5, provenance: pending("Najdi") },
      { key: "depth", label: { en: "Court depth", ar: "عمق الفناء" }, unit: "m", min: 4, max: 20, default: 8, step: 0.5, provenance: pending("Najdi") },
    ],
    builder: { ts: "court", py: "box" },
    placement: { faces: ["court"], zone: ["ground-plane"], surfaces: ["court"], maxPerFace: 1 },
    provenance: pending("Najdi"),
  },
  {
    id: "burj",
    kind: "massing",
    name: { en: "Corner Burj", ar: "البرج الركني" },
    term: { translit: "burj", ar: "البرج" },
    gloss: { en: "Corner tower with its own crown", ar: "برج ركني بتتويج خاص" },
    rationale: {
      en: "Najdi compounds often rose to a corner tower for lookout and cross-ventilation, repeating the furjat band and a denser row of shurfat at its crown.",
      ar: "كانت المساكن النجدية ترتفع ببرج ركني للمراقبة والتهوية، يكرر شريط الفرجات وصفاً أكثف من الشرفات في تتويجه.",
    },
    attestedIn: [
      { characterId: "najdi", typologies: ["traditional", "transitional", "contemporary"], provenance: pending("Najdi") },
    ],
    params: [
      { key: "storeys", label: { en: "Storeys", ar: "الطوابق" }, unit: "count", min: 2, max: 4, default: 3, step: 1, documentedRange: [2, 3], provenance: pending("Najdi") },
      { key: "width", label: { en: "Plan width", ar: "عرض المسقط" }, unit: "m", min: 3, max: 8, default: 5, step: 0.25, provenance: pending("Najdi") },
    ],
    builder: { ts: "mass", py: "vol" },
    placement: { faces: ["any"], zone: ["ground"], surfaces: ["exterior"], maxPerFace: 1 },
    provenance: pending("Najdi"),
  },

  // ──────────────────────────────────────────────────────── Coastal Hijazi
  {
    id: "roshan",
    kind: "screen",
    name: { en: "Rawashin", ar: "الرواشين" },
    term: { translit: "roshan (pl. rawashin)", ar: "الروشن / الرواشين" },
    gloss: { en: "Projecting timber lattice bays", ar: "شرفات خشبية مشبّكة بارزة" },
    rationale: {
      en: "A wooden bay projecting from the facade, closed by fine lattice. It admits breeze and filtered light, lets the family see out without being seen, and shades the wall behind it.",
      ar: "شرفة خشبية تبرز من الواجهة وتُغلق بالخشب المشبّك؛ تُدخل النسيم والضوء المصفّى وتتيح الرؤية دون أن يُرى من بالداخل، وتظلل الجدار خلفها.",
    },
    attestedIn: [
      { characterId: "coastal-hijazi", typologies: ["traditional", "transitional", "contemporary"], provenance: pending("Coastal Hijazi") },
      { characterId: "al-madinah", typologies: ["traditional", "transitional"], provenance: pending("Al-Madinah") },
      { characterId: "taif", typologies: ["traditional", "transitional"], provenance: pending("Taif") },
    ],
    params: [
      { key: "width", label: { en: "Bay width", ar: "عرض الروشن" }, unit: "m", min: 1.2, max: 4.5, default: 2.6, step: 0.1, documentedRange: [1.6, 3.4], provenance: pending("Coastal Hijazi") },
      { key: "height", label: { en: "Bay height", ar: "ارتفاع الروشن" }, unit: "m", min: 1.6, max: 6.5, default: 3.0, step: 0.1, provenance: pending("Coastal Hijazi") },
      { key: "depth", label: { en: "Projection", ar: "البروز" }, unit: "m", min: 0.3, max: 1.2, default: 0.6, step: 0.05, documentedRange: [0.4, 0.9], provenance: pending("Coastal Hijazi") },
      { key: "cell", label: { en: "Lattice cell", ar: "خلية التشبيك" }, unit: "m", min: 0.05, max: 0.3, default: 0.14, step: 0.01, provenance: pending("Coastal Hijazi") },
    ],
    builder: { ts: "roshan", py: "roshan" },
    placement: {
      faces: ["street", "side"],
      zone: ["upper", "ground"],
      surfaces: ["exterior"],
      maxPerFace: 5,
      notes: { en: "Rawashin face outward — they exist to mediate between the household and the street.", ar: "تتجه الرواشين للخارج، فوظيفتها الوساطة بين البيت والشارع." },
    },
    provenance: pending("Coastal Hijazi"),
  },
  {
    id: "takalil",
    kind: "surface",
    name: { en: "Coral Coursing & Takalil", ar: "الحجر المنقبي والتكاليل" },
    term: { translit: "takalil", ar: "التكاليل" },
    gloss: { en: "Pale walls banded by timber tie-beams", ar: "جدران فاتحة تقطعها أخشاب أفقية" },
    rationale: {
      en: "Hijazi builders used blocks of coral limestone from the Red Sea, levelled roughly every metre by timber beams (takalil) that tied the walls together and absorbed movement.",
      ar: "بنى الحجازيون بالحجر المنقبي من شعاب البحر الأحمر، وكانوا يضعون كل متر تقريباً أخشاباً أفقية (تكاليل) تربط الجدار وتمتص الحركة.",
    },
    attestedIn: [
      { characterId: "coastal-hijazi", typologies: ["traditional", "transitional", "contemporary"], provenance: pending("Coastal Hijazi") },
    ],
    params: [
      { key: "pitch", label: { en: "Course spacing", ar: "تباعد المداميك" }, unit: "m", min: 0.5, max: 2.0, default: 1.0, step: 0.05, documentedRange: [0.8, 1.2], provenance: pending("Coastal Hijazi") },
      { key: "height", label: { en: "Beam height", ar: "سماكة الخشب" }, unit: "m", min: 0.05, max: 0.3, default: 0.12, step: 0.01, provenance: pending("Coastal Hijazi") },
    ],
    builder: { ts: "band", py: "band" },
    placement: { faces: ["any"], zone: ["ground", "upper"], surfaces: ["exterior"] },
    provenance: pending("Coastal Hijazi"),
  },
  {
    id: "ventilation-screen",
    kind: "screen",
    name: { en: "High Ventilation Screens", ar: "فتحات التهوية العالية" },
    term: { translit: "mashrabiya", ar: "المشربية" },
    gloss: { en: "Lattice openings near every ceiling", ar: "مشربيات قرب كل سقف" },
    rationale: {
      en: "Lattice panels high in each wall let hot air escape at ceiling level and pull the sea breeze through the house — a high aperture ratio suited to humid coastal heat.",
      ar: "ألواح مشبّكة عالية في كل جدار تطرد الهواء الساخن من أعلى الغرف وتسحب نسيم البحر عبر البيت.",
    },
    attestedIn: [
      { characterId: "coastal-hijazi", typologies: ["traditional", "transitional", "contemporary"], provenance: pending("Coastal Hijazi") },
      { characterId: "tihamah-coast", typologies: ["traditional", "transitional"], provenance: pending("Tihamah Coast") },
    ],
    params: [
      { key: "height", label: { en: "Panel height", ar: "ارتفاع اللوح" }, unit: "m", min: 0.3, max: 1.2, default: 0.6, step: 0.05, provenance: pending("Coastal Hijazi") },
      { key: "cell", label: { en: "Lattice cell", ar: "خلية التشبيك" }, unit: "m", min: 0.05, max: 0.3, default: 0.14, step: 0.01, provenance: pending("Coastal Hijazi") },
    ],
    builder: { ts: "lattice", py: "lattice" },
    placement: {
      faces: ["any"],
      zone: ["upper"],
      surfaces: ["exterior"],
      notes: { en: "These sit just under the ceiling; that height is what makes them vent.", ar: "تقع أسفل السقف مباشرة، وهذا الارتفاع هو ما يجعلها تُهوّي." },
    },
    provenance: pending("Coastal Hijazi"),
  },

  // ─────────────────────────────────────────────────────────────── Aseer
  {
    id: "slate-ribs",
    kind: "surface",
    name: { en: "Slate Rain Courses", ar: "مداميك الصفائح" },
    term: { translit: "raqf", ar: "الرقف / صفائح المطر" },
    gloss: { en: "Projecting stone ribs every half metre", ar: "أحجار بارزة كل نصف متر" },
    rationale: {
      en: "Asir gets real rain. Builders set thin slabs of slate into the walls every few courses so they project and throw rainwater clear of the wall face — the style's most recognisable texture.",
      ar: "تهطل الأمطار في عسير، فكان البناؤون يضعون صفائح حجرية رقيقة بارزة كل بضعة مداميك لتبعد ماء المطر عن الجدار، ويشكّل إيقاعها الأفقي أبرز ملامح الطراز.",
    },
    attestedIn: [
      { characterId: "aseer-slopes", typologies: ["traditional", "transitional", "contemporary"], provenance: pending("Aseer Slopes") },
      { characterId: "abha-highlands", typologies: ["traditional", "transitional"], provenance: pending("Abha Highlands") },
      { characterId: "sarawat-mountains", typologies: ["traditional", "transitional"], provenance: pending("Sarawat Mountains") },
    ],
    params: [
      { key: "pitch", label: { en: "Rib spacing", ar: "تباعد الصفائح" }, unit: "m", min: 0.2, max: 1.2, default: 0.45, step: 0.02, documentedRange: [0.3, 0.6], provenance: pending("Aseer Slopes") },
      { key: "height", label: { en: "Rib thickness", ar: "سماكة الصفيحة" }, unit: "m", min: 0.03, max: 0.2, default: 0.06, step: 0.01, provenance: pending("Aseer Slopes") },
      { key: "depth", label: { en: "Projection", ar: "البروز" }, unit: "m", min: 0.05, max: 0.35, default: 0.12, step: 0.01, documentedRange: [0.08, 0.2], provenance: pending("Aseer Slopes") },
    ],
    builder: { ts: "ribs", py: "ribs" },
    placement: {
      faces: ["any"],
      zone: ["ground", "upper"],
      surfaces: ["exterior"],
      notes: { en: "Rain courses are an exterior device; they shed water off the outside wall.", ar: "صفائح المطر عنصر خارجي، فوظيفتها تصريف الماء عن الجدار الخارجي." },
    },
    provenance: pending("Aseer Slopes"),
  },
  {
    id: "al-qatt",
    kind: "surface",
    name: { en: "Al-Qatt Al-Asiri", ar: "القط العسيري" },
    term: { translit: "al-qatt al-asiri", ar: "القط العسيري" },
    gloss: { en: "Painted geometric wall decoration in primary colours", ar: "زخرفة جدارية هندسية بالألوان الأساسية" },
    rationale: {
      en: "The geometric wall painting traditionally made by the women of Asir, inscribed by UNESCO on the Representative List of the Intangible Cultural Heritage of Humanity in 2017. Rows of red, yellow, green and blue forms are painted directly onto the wall; the practitioner is known as al-qattatah.",
      ar: "فن الزخرفة الهندسية الذي تمارسه نساء عسير، وأُدرج في قائمة اليونسكو التمثيلية للتراث الثقافي غير المادي عام 2017؛ صفوف من الأشكال بالأحمر والأصفر والأخضر والأزرق تُرسم على الجدار مباشرة، وتُسمّى الممارِسة القطّاطة.",
    },
    attestedIn: [
      { characterId: "aseer-slopes", typologies: ["traditional", "transitional", "contemporary"], provenance: qattSource("Inscription description, 2017") },
      { characterId: "abha-highlands", typologies: ["traditional", "transitional"], provenance: qattSource("Inscription description, 2017") },
    ],
    params: [
      { key: "height", label: { en: "Frieze height", ar: "ارتفاع الإفريز" }, unit: "m", min: 0.2, max: 1.5, default: 0.6, step: 0.05, provenance: qattSource() },
      { key: "pitch", label: { en: "Motif spacing", ar: "تباعد الوحدة" }, unit: "m", min: 0.1, max: 0.8, default: 0.3, step: 0.02, provenance: qattSource() },
    ],
    builder: { ts: "qattFrieze", py: "tri_row" },
    placement: {
      faces: ["court"],
      zone: ["ground", "upper"],
      // THE GUARDRAIL. The UNESCO inscription describes Al-Qatt Al-Asiri
      // specifically as *interior* wall decoration, made by women on the inside
      // walls of the home — majlis and reception rooms. Rendering it across an
      // exterior street facade misrepresents the tradition, and a system that
      // does so cheerfully is producing a cultural error, not a design variant.
      // `culturalLint` rejects any exterior placement of this element, and that
      // rejection is a regression test in the suite, not a preference.
      surfaces: ["interior"],
      notes: {
        en: "Al-Qatt Al-Asiri is inscribed by UNESCO as a female interior wall decoration. It belongs on interior walls — majlis and reception rooms — not on an exterior street facade.",
        ar: "القط العسيري مُدرج في اليونسكو كزخرفة جدارية داخلية تمارسها النساء، وموضعه الجدران الداخلية في المجلس وغرف الاستقبال، لا الواجهة الخارجية.",
      },
    },
    provenance: {
      kind: "documented",
      citations: [
        {
          sourceId: "unesco-ich-01261-al-qatt-al-asiri",
          locus: "Representative List inscription, 2017",
          quote: "female traditional interior wall decoration in Asir",
        },
      ],
    },
  },
  {
    id: "qamariya",
    kind: "opening",
    name: { en: "Qamariya Fanlight", ar: "القمرية" },
    term: { translit: "qamariya", ar: "القمرية" },
    gloss: { en: "Coloured fanlight above a window", ar: "منور ملوّن فوق النافذة" },
    rationale: {
      en: "Above each window sits a qamariya — a small fanlight of coloured glass or pierced gypsum that throws patterned light into the room.",
      ar: "فوق كل نافذة قمرية صغيرة من الزجاج الملوّن أو الجص المخرّم تُلقي ضوءاً منقوشاً في الغرفة.",
    },
    attestedIn: [
      { characterId: "aseer-slopes", typologies: ["traditional", "transitional", "contemporary"], provenance: pending("Aseer Slopes") },
      { characterId: "al-madinah", typologies: ["traditional"], provenance: pending("Al-Madinah") },
    ],
    params: [
      { key: "width", label: { en: "Width", ar: "العرض" }, unit: "m", min: 0.3, max: 1.6, default: 0.8, step: 0.05, provenance: pending("Aseer Slopes") },
      { key: "height", label: { en: "Height", ar: "الارتفاع" }, unit: "m", min: 0.2, max: 1.0, default: 0.45, step: 0.05, provenance: pending("Aseer Slopes") },
    ],
    builder: { ts: "qamariya", py: "tri_row" },
    placement: {
      faces: ["any"],
      zone: ["ground", "upper"],
      surfaces: ["exterior", "interior"],
      notes: { en: "A qamariya sits directly above the window it lights.", ar: "تقع القمرية فوق النافذة التي تنوّرها مباشرة." },
    },
    provenance: pending("Aseer Slopes"),
  },

  // ───────────────────────────────────────────────────────── Eastern Coast
  {
    id: "farush-base",
    kind: "surface",
    name: { en: "Coral-Stone Base", ar: "قاعدة الحجر البحري" },
    term: { translit: "farush", ar: "الفروش" },
    gloss: { en: "Rough coral blocks at the foot of the walls", ar: "كتل مرجانية خشنة أسفل الجدران" },
    rationale: {
      en: "Gulf builders cut porous coral stone (farush) from the shallow sea and bedded it in gypsum mortar, using it where the wall meets salty ground, below smooth gypsum plaster.",
      ar: "قطع البناؤون الحجر البحري (الفروش) من المياه الضحلة وبنوه بمونة الجص عند التقاء الجدار بالأرض المالحة تحت اللياسة الجصية الناعمة.",
    },
    attestedIn: [
      { characterId: "eastern-coast", typologies: ["traditional", "transitional", "contemporary"], provenance: pending("Eastern Coast") },
      { characterId: "al-qatif", typologies: ["traditional", "transitional"], provenance: pending("Al-Qatif") },
    ],
    params: [
      { key: "height", label: { en: "Base height", ar: "ارتفاع القاعدة" }, unit: "m", min: 0.3, max: 2.0, default: 0.9, step: 0.05, provenance: pending("Eastern Coast") },
    ],
    builder: { ts: "baseCourse", py: "band" },
    placement: {
      faces: ["any"],
      zone: ["plinth"],
      surfaces: ["exterior"],
      notes: { en: "The coral base is a plinth device — it exists because of salt at ground level.", ar: "قاعدة الفروش عنصر سفلي، ووجودها بسبب الملح عند مستوى الأرض." },
    },
    provenance: pending("Eastern Coast"),
  },
  {
    id: "gypsum-screen",
    kind: "screen",
    name: { en: "Carved Gypsum Screens", ar: "النقوش الجصية المخرّمة" },
    term: { translit: "naqsh jissi", ar: "النقش الجصي" },
    gloss: { en: "Perforated gypsum panels in an opening", ar: "ألواح جصية مثقّبة في الفتحات" },
    rationale: {
      en: "Instead of timber, coastal houses screened their openings with carved gypsum panels, admitting breeze and dappled light while keeping the interior private.",
      ar: "بدلاً من الخشب ستر أهل الساحل فتحاتهم بألواح جصية منقوشة تُدخل النسيم والضوء المتقطع وتحفظ الخصوصية.",
    },
    attestedIn: [
      { characterId: "eastern-coast", typologies: ["traditional", "transitional", "contemporary"], provenance: pending("Eastern Coast") },
      { characterId: "al-qatif", typologies: ["traditional", "transitional"], provenance: pending("Al-Qatif") },
      { characterId: "al-ahsa-oasis", typologies: ["traditional", "transitional"], provenance: pending("Al-Ahsa Oasis") },
    ],
    params: [
      { key: "cell", label: { en: "Perforation cell", ar: "خلية التخريم" }, unit: "m", min: 0.04, max: 0.25, default: 0.12, step: 0.01, provenance: pending("Eastern Coast") },
      { key: "bar", label: { en: "Rib thickness", ar: "سماكة العرق" }, unit: "m", min: 0.015, max: 0.1, default: 0.03, step: 0.005, provenance: pending("Eastern Coast") },
    ],
    builder: { ts: "lattice", py: "lattice" },
    placement: { faces: ["any"], zone: ["ground", "upper"], surfaces: ["exterior", "court"] },
    provenance: pending("Eastern Coast"),
  },
  {
    id: "danchal",
    kind: "surface",
    name: { en: "Danchal Beams", ar: "أعواد الدنجل" },
    term: { translit: "danchal", ar: "الدنجل" },
    gloss: { en: "Mangrove pole ends at the roofline", ar: "رؤوس جذوع المانجروف عند السطح" },
    rationale: {
      en: "Roofs were spanned with danchal — straight mangrove poles shipped from East Africa — whose ends project through the wall in a neat row, casting a shadow line at the roofline.",
      ar: "سُقفت البيوت بالدنجل — جذوع مستقيمة من المانجروف تُجلب من شرق أفريقيا — تبرز رؤوسها صفاً منتظماً من الجدار فتصنع خط ظل عند السطح.",
    },
    attestedIn: [
      { characterId: "eastern-coast", typologies: ["traditional", "transitional", "contemporary"], provenance: pending("Eastern Coast") },
      { characterId: "al-qatif", typologies: ["traditional", "transitional"], provenance: pending("Al-Qatif") },
    ],
    params: [
      { key: "pitch", label: { en: "Beam spacing", ar: "تباعد الأعواد" }, unit: "m", min: 0.3, max: 1.2, default: 0.55, step: 0.05, provenance: pending("Eastern Coast") },
      { key: "depth", label: { en: "Projection", ar: "البروز" }, unit: "m", min: 0.1, max: 0.6, default: 0.25, step: 0.02, provenance: pending("Eastern Coast") },
    ],
    builder: { ts: "beamEnds", py: "cyl" },
    placement: {
      faces: ["any"],
      zone: ["crown"],
      surfaces: ["exterior"],
      notes: { en: "Beam ends appear at the roofline because that is where the roof structure lands.", ar: "تظهر رؤوس الأعواد عند خط السطح لأن هناك موضع هيكل السقف." },
    },
    provenance: pending("Eastern Coast"),
  },
  {
    id: "badgir",
    kind: "roofscape",
    name: { en: "Badgir Wind Tower", ar: "البادجير" },
    term: { translit: "badgir", ar: "البادجير" },
    gloss: { en: "Slotted tower that drives breeze down", ar: "برج بفتحات يدفع النسيم للأسفل" },
    rationale: {
      en: "The badgir rises above the roof with tall slots on all four sides. Whichever way the Gulf wind blows, the tower catches it and drives air down into the rooms below.",
      ar: "يرتفع البادجير فوق السطح بفتحات طويلة على جهاته الأربع، فيلتقط ريح الخليج من أي اتجاه ويدفعها إلى الغرف.",
    },
    attestedIn: [
      { characterId: "eastern-coast", typologies: ["traditional", "transitional", "contemporary"], provenance: pending("Eastern Coast") },
      { characterId: "al-qatif", typologies: ["traditional"], provenance: pending("Al-Qatif") },
    ],
    params: [
      { key: "height", label: { en: "Tower height", ar: "ارتفاع البرج" }, unit: "m", min: 1.5, max: 6.0, default: 3.2, step: 0.1, provenance: pending("Eastern Coast") },
      { key: "width", label: { en: "Plan width", ar: "عرض المسقط" }, unit: "m", min: 1.0, max: 3.5, default: 1.8, step: 0.1, provenance: pending("Eastern Coast") },
    ],
    builder: { ts: "badgir", py: "vol" },
    placement: {
      faces: ["any"],
      zone: ["roof"],
      surfaces: ["roof"],
      maxPerFace: 2,
      notes: { en: "A wind tower must stand clear above the roof to reach moving air.", ar: "يجب أن يعلو برج الهواء فوق السطح ليبلغ الهواء المتحرك." },
    },
    provenance: pending("Eastern Coast"),
  },
  {
    id: "riwaq",
    kind: "court",
    name: { en: "Riwaq Arcade", ar: "الرواق" },
    term: { translit: "riwaq", ar: "الرواق / الليوان" },
    gloss: { en: "Shaded arcade along the courtyard", ar: "رواق مظلل على الفناء" },
    rationale: {
      en: "A shaded arcade of pointed arches runs along the court, whose paving alternates light and dark around a central pool — the heart of family life in the courtyard houses of the Gulf coast.",
      ar: "رواق مظلل من الأقواس المدببة يمتد على الفناء المبلط بمربعات فاتحة وداكنة حول حوض ماء — قلب حياة العائلة في بيوت الساحل.",
    },
    attestedIn: [
      { characterId: "eastern-coast", typologies: ["traditional", "transitional", "contemporary"], provenance: pending("Eastern Coast") },
      { characterId: "al-qatif", typologies: ["traditional", "transitional"], provenance: pending("Al-Qatif") },
      { characterId: "al-ahsa-oasis", typologies: ["traditional", "transitional"], provenance: pending("Al-Ahsa Oasis") },
    ],
    params: [
      { key: "depth", label: { en: "Arcade depth", ar: "عمق الرواق" }, unit: "m", min: 1.2, max: 4.0, default: 2.2, step: 0.1, provenance: pending("Eastern Coast") },
      { key: "pitch", label: { en: "Bay spacing", ar: "تباعد البواكي" }, unit: "m", min: 1.5, max: 5.0, default: 2.8, step: 0.1, provenance: pending("Eastern Coast") },
    ],
    builder: { ts: "riwaq", py: "poly" },
    placement: {
      faces: ["court"],
      zone: ["ground"],
      surfaces: ["court"],
      notes: { en: "A riwaq faces the court; that is what it shades.", ar: "يتجه الرواق نحو الفناء، فهو ما يظلله." },
    },
    provenance: pending("Eastern Coast"),
  },
];

const BY_ID = new Map<string, CulturalElement>(ELEMENTS.map((e) => [e.id, e]));

export const elementById = (id: string): CulturalElement | undefined => BY_ID.get(id);

export const isKnownElement = (id: string): boolean => BY_ID.has(id);

/** Every element id, for schema narrowing and the parity check. */
export const ELEMENT_IDS: string[] = ELEMENTS.map((e) => e.id);

/** The vocabulary a given character actually attests at a given typology.
 *
 *  This is the list the design-spec schema narrows to, so it is the single
 *  point where cross-character blending is prevented. Keep it derived from
 *  `attestedIn` rather than from a character's `elementIds`: the character
 *  record says what it lists, the element record says what it is attested for,
 *  and the element is the authority on itself. `verify:corpus` checks the two
 *  agree. */
export function allowedElementIds(characterId: string, typology: Typology): string[] {
  return ELEMENTS.filter((el) =>
    el.attestedIn.some((a) => a.characterId === characterId && a.typologies.includes(typology)),
  ).map((el) => el.id);
}

/** Count of records still awaiting a primary source. Surfaced by the KPI report
 *  so corpus thinness is visible rather than implied by silence. */
export const unverifiedElementCount = (): number =>
  ELEMENTS.filter((e) => e.provenance.kind === "unverified").length;
