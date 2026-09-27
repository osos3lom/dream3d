import type { Empire } from "@/types/empire";
import { najdi } from "./styles/najdi";
import { salmani } from "./styles/salmani";
import { hijazi } from "./styles/hijazi";
import { asiri } from "./styles/asiri";
import { eastern } from "./styles/eastern";

import type { Language } from "@/types/i18n";
import { asset } from "@/lib/assets";

/** The dataset stores `public/` paths root-absolute (`/models/najdi.glb`).
 *  Under a GitHub Pages subpath those have to be re-based onto Vite's
 *  BASE_URL, so it happens once here and every consumer — viewer, panels,
 *  modals — reads paths that are already correct. */
const rebase = (e: Empire): Empire => ({
  ...e,
  modelPath: asset(e.modelPath),
  interior: { ...e.interior, image: asset(e.interior.image) },
  floorPlan: { ...e.floorPlan, image: asset(e.floorPlan.image) },
  artifacts: { ...e.artifacts, image: asset(e.artifacts.image) },
  dailyLife: { ...e.dailyLife, image: asset(e.dailyLife.image) },
  geography: { ...e.geography, image: asset(e.geography.image) },
});

/** The five heritage styles, each modelled as a modern villa. The data
 *  contract is still named `Empire` from the app's first life as an atlas. */
export const EMPIRES: Empire[] = [najdi, salmani, hijazi, asiri, eastern].map(rebase);

export const empireById = (id: string): Empire => EMPIRES.find((e) => e.id === id) ?? EMPIRES[0];

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
  kind: "empire" | "dwelling" | "feature" | "room" | "artifact" | "material";
  title: string;
  subtitle: string;
  empireId: string;
  hotspotId?: string;
}

export function buildSearchIndex(lang: Language = "en"): SearchEntry[] {
  const out: SearchEntry[] = [];
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
