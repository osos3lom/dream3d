import type { Empire } from "@/types/empire";
import { najdi } from "./styles/najdi";
import { salmani } from "./styles/salmani";
import { hijazi } from "./styles/hijazi";
import { asiri } from "./styles/asiri";
import { eastern } from "./styles/eastern";
import { qassimi } from "./styles/qassimi";
import { haili } from "./styles/haili";
import { jouf } from "./styles/jouf";
import { northern } from "./styles/northern";
import { tabuki } from "./styles/tabuki";
import { madani } from "./styles/madani";
import { ulai } from "./styles/ulai";
import { taifi } from "./styles/taifi";
import { bahi } from "./styles/bahi";
import { tihami } from "./styles/tihami";
import { jazani } from "./styles/jazani";
import { farasani } from "./styles/farasani";
import { najrani } from "./styles/najrani";
import { ahsai } from "./styles/ahsai";

import type { ArchCharacter } from "@/types/character";
import { CHARACTERS, characterById, t } from "@/data/characters";
import { ELEMENTS } from "@/data/corpus/elements";

import type { Language } from "@/types/i18n";
import { asset } from "@/lib/assets";

/** The dataset stores `public/` paths root-absolute (`/models/najdi.glb`).
 *  Under a GitHub Pages subpath those have to be re-based onto Vite's
 *  BASE_URL, so it happens once here and every consumer — viewer, panels,
 *  modals — reads paths that are already correct. */
const rebase = (e: Empire): Empire => ({
  ...e,
  modelPath: asset(e.modelPath),
  ultraHero: e.ultraHero ? asset(e.ultraHero) : undefined,
  interior: { ...e.interior, image: asset(e.interior.image) },
  floorPlan: {
    ...e.floorPlan,
    image: asset(e.floorPlan.image),
    plan: e.floorPlan.plan ? asset(e.floorPlan.plan) : undefined,
  },
  artifacts: { ...e.artifacts, image: asset(e.artifacts.image) },
  dailyLife: { ...e.dailyLife, image: asset(e.dailyLife.image) },
  geography: { ...e.geography, image: asset(e.geography.image) },
});

/** The nineteen styles of the Saudi Architecture characterization, each
 *  modelled as a modern villa and ordered roughly north to south. The data
 *  contract is still named `Empire` from the app's first life as an atlas. */
export const EMPIRES: Empire[] = [
  najdi, salmani, qassimi, haili, jouf, northern, tabuki,
  madani, ulai, hijazi, taifi, bahi, asiri, tihami,
  jazani, farasani, najrani, eastern, ahsai,
].map(rebase);

export const empireById = (id: string): Empire => EMPIRES.find((e) => e.id === id) ?? EMPIRES[0];

/** The architectural character this exhibit interprets, or null if it is not
 *  linked yet. Kept as a lookup rather than an embedded object so the exhibit
 *  data stays a flat, serialisable record. */
export const characterFor = (e: Empire): ArchCharacter | null =>
  e.characterId ? characterById(e.characterId) ?? null : null;

/** Every exhibit built for a given character. Usually one, sometimes none —
 *  most of the 57 character/typology cells will never have a villa. */
export const exhibitsForCharacter = (characterId: string): Empire[] =>
  EMPIRES.filter((e) => e.characterId === characterId);

export function getLocalizedEmpire(empire: Empire, lang: Language): Empire {
  if (lang === "ar" && empire.ar) {
    const ar = empire.ar;
    return {
      ...empire,
      name: ar.name ?? empire.name,
      dwelling: ar.dwelling ?? empire.dwelling,
      subtitle: ar.subtitle ?? empire.subtitle,
      description: ar.description ?? empire.description,
      facts: empire.facts.map((f, i) => ({
        ...f,
        label: ar.facts?.[i]?.label ?? f.label,
        value: ar.facts?.[i]?.value ?? f.value,
      })),
      hotspots: empire.hotspots.map((h) => {
        const arH = ar.hotspots?.find((item) => item.id === h.id);
        return arH
          ? {
              ...h,
              title: arH.title ?? h.title,
              short: arH.short ?? h.short,
              detail: arH.detail ?? h.detail,
            }
          : h;
      }),
      interior: {
        ...empire.interior,
        kicker: ar.interior?.kicker ?? empire.interior.kicker,
        title: ar.interior?.title ?? empire.interior.title,
        cta: ar.interior?.cta ?? empire.interior.cta,
        text: ar.interior?.text ?? empire.interior.text,
      },
      floorPlan: {
        ...empire.floorPlan,
        kicker: ar.floorPlan?.kicker ?? empire.floorPlan.kicker,
        title: ar.floorPlan?.title ?? empire.floorPlan.title,
        cta: ar.floorPlan?.cta ?? empire.floorPlan.cta,
        text: ar.floorPlan?.text ?? empire.floorPlan.text,
        rooms: empire.floorPlan.rooms.map((r, i) => ({
          ...r,
          name: ar.floorPlan?.rooms?.[i]?.name ?? r.name,
          note: ar.floorPlan?.rooms?.[i]?.note ?? r.note,
        })),
      },
      artifacts: {
        ...empire.artifacts,
        kicker: ar.artifacts?.kicker ?? empire.artifacts.kicker,
        title: ar.artifacts?.title ?? empire.artifacts.title,
        cta: ar.artifacts?.cta ?? empire.artifacts.cta,
        text: ar.artifacts?.text ?? empire.artifacts.text,
        items: empire.artifacts.items.map((item, i) => ({
          ...item,
          name: ar.artifacts?.items?.[i]?.name ?? item.name,
          purpose: ar.artifacts?.items?.[i]?.purpose ?? item.purpose,
          material: ar.artifacts?.items?.[i]?.material ?? item.material,
          context: ar.artifacts?.items?.[i]?.context ?? item.context,
        })),
      },
      dailyLife: {
        ...empire.dailyLife,
        kicker: ar.dailyLife?.kicker ?? empire.dailyLife.kicker,
        title: ar.dailyLife?.title ?? empire.dailyLife.title,
        cta: ar.dailyLife?.cta ?? empire.dailyLife.cta,
        text: ar.dailyLife?.text ?? empire.dailyLife.text,
      },
      geography: {
        ...empire.geography,
        kicker: ar.geography?.kicker ?? empire.geography.kicker,
        title: ar.geography?.title ?? empire.geography.title,
        cta: ar.geography?.cta ?? empire.geography.cta,
        text: ar.geography?.text ?? empire.geography.text,
        regionLabel: ar.geography?.regionLabel ?? empire.geography.regionLabel,
      },
      lesson: {
        title: ar.lesson?.title ?? empire.lesson.title,
        intro: ar.lesson?.intro ?? empire.lesson.intro,
        blocks: empire.lesson.blocks.map((b, i) => ({
          heading: ar.lesson?.blocks?.[i]?.heading ?? b.heading,
          body: ar.lesson?.blocks?.[i]?.body ?? b.body,
        })),
      },
      quiz: empire.quiz.map((q, i) => ({
        ...q,
        q: ar.quiz?.[i]?.q ?? q.q,
        choices: ar.quiz?.[i]?.choices ?? q.choices,
        explanation: ar.quiz?.[i]?.explanation ?? q.explanation,
      })),
      timeline: empire.timeline.map((t, i) => ({
        ...t,
        era: ar.timeline?.[i]?.era ?? t.era,
        year: ar.timeline?.[i]?.year ?? t.year,
        text: ar.timeline?.[i]?.text ?? t.text,
      })),
    };
  }
  return empire;
}

export const DEFAULT_EMPIRE_ID = "najdi";

/** Resolve per-empire image paths (thumbnail derived from hero set) */
export const empireImages = (e: Empire) => ({
  thumbnail: asset(`/img/${e.id}/thumbnail.webp`),
  hero: asset(`/img/${e.id}/hero.webp`),
  interior: e.interior.image,
  floorPlan: e.floorPlan.image,
  artifacts: e.artifacts.image,
  dailyLife: e.dailyLife.image,
  map: e.geography.image,
});

/** Global search index built from the dataset */
export interface SearchEntry {
  kind: "empire" | "dwelling" | "feature" | "room" | "artifact" | "material" | "character" | "element";
  title: string;
  subtitle: string;
  /** Empty for corpus entries that have no exhibit behind them. */
  empireId: string;
  hotspotId?: string;
  /** Set on "character" and "element" entries, so a result can route to the
   *  corpus pages rather than only to a villa. */
  characterId?: string;
  elementId?: string;
}

export function buildSearchIndex(lang: Language = "en"): SearchEntry[] {
  const out: SearchEntry[] = [];

  // The reference layer is emitted FIRST, deliberately.
  //
  // SearchOverlay caps results at 14 (modals.tsx). A query like "salmani" or
  // "najdi" matches a dozen rooms, motifs and keywords belonging to one villa,
  // which was enough to push the character entry off the end of the list. That
  // meant the entry carrying the registry standing — including the "not on the
  // official map" label that keeps Salmani honest — was the first thing
  // truncated. Ordering the corpus ahead of the exhibits makes the
  // authoritative answer the visible one, and matches the product direction:
  // the character is the subject, the villa is one interpretation of it.
  // Corpus entries — the reference layer, searchable alongside the exhibits.
  //
  // Two constraints shape what is emitted here:
  //
  // 1. Searchable text must include the transliteration. An element's display
  //    name is "Rawashin" but people type "roshan", and the filter in
  //    SearchOverlay is a plain substring match over title + subtitle, so the
  //    translit has to appear in one of them or the element is unfindable by the
  //    name it is usually known by.
  //
  // 2. Every entry carries the id of the page that owns it. Corpus entries set
  //    characterId or elementId and route to the reference pages; `empireId` is
  //    only a convenience for the villa, and is empty for the many characters
  //    that have none. Both pick handlers check the corpus ids first, because
  //    `empireById` falls back to EMPIRES[0] and an unrouted corpus result
  //    would otherwise land the visitor silently on the Najdi villa.
  for (const c of CHARACTERS) {
    const exhibit = exhibitsForCharacter(c.id)[0];
    const standing =
      c.registry === "official-map"
        ? lang === "ar"
          ? "طابع رسمي · خريطة طابع العمارة السعودية"
          : "Official character · Saudi Architecture Characters Map"
        : lang === "ar"
          ? "طابع موثّق · خارج الخريطة الرسمية"
          : "Documented character · not on the official map";
    out.push({
      kind: "character",
      title: t(c.name, lang),
      subtitle: t(c.region, lang) + " — " + standing,
      empireId: exhibit?.id ?? "",
      characterId: c.id,
    });
  }

  for (const el of ELEMENTS) {
    const exhibit = EMPIRES.find((e) =>
      e.characterId ? el.attestedIn.some((a) => a.characterId === e.characterId) : false,
    );
    const hotspot = exhibit?.hotspots.find((h) => h.elementId === el.id);
    out.push({
      kind: "element",
      title: t(el.name, lang),
      // translit first so the element is findable by the name people type
      subtitle: el.term.translit + " · " + el.term.ar + " · " + t(el.gloss, lang),
      empireId: exhibit?.id ?? "",
      hotspotId: hotspot?.id,
      elementId: el.id,
    });
  }

  for (const raw of EMPIRES) {
    const e = getLocalizedEmpire(raw, lang);
    const dwellingSub = lang === "ar" ? `فيلا الطراز ${e.name}` : `${e.name} style villa`;
    const floorPlanSub = lang === "ar" ? `مخطط ${e.dwelling}` : `${e.dwelling} floor plan`;
    const relatedSub = lang === "ar" ? `مرتبط بالطراز ${e.name}` : `Related to ${e.name} style`;

    out.push({ kind: "empire", title: e.name, subtitle: `${e.dwelling} — ${e.subtitle}`, empireId: e.id });
    out.push({ kind: "dwelling", title: e.dwelling, subtitle: dwellingSub, empireId: e.id });
    for (const h of e.hotspots)
      out.push({ kind: "feature", title: h.title, subtitle: `${e.dwelling} · ${h.short}`, empireId: e.id, hotspotId: h.id });
    for (const r of e.floorPlan.rooms)
      out.push({ kind: "room", title: r.name, subtitle: floorPlanSub, empireId: e.id });
    for (const a of e.artifacts.items)
      out.push({ kind: "artifact", title: a.name, subtitle: `${e.dwelling} · ${a.purpose}`, empireId: e.id });
    for (const k of e.keywords)
      out.push({ kind: "material", title: k, subtitle: relatedSub, empireId: e.id });
  }

  return out;
}
