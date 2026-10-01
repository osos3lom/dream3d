/** One cultural element: what it is, what job it does, the range the sources
 *  document, where it may be placed, and which characters attest it.
 *
 *  The placement block is not decoration. It is the same constraint set that
 *  `culturalLint` enforces on generated designs, shown to the reader in plain
 *  language — so a refusal in the studio later is explicable rather than
 *  arbitrary. Al-Qatt Al-Asiri is the clearest case: the page states that it is
 *  an interior practice and why, which is the reason the generator will decline
 *  to paint it across a street facade. */

import { Link, useParams } from "react-router";
import { elementById } from "@/data/corpus/elements";
import { characterById, t as pick } from "@/data/characters";
import { CorpusShell } from "@/components/corpus/CorpusShell";
import { ProvenanceBadge, CitationList } from "@/components/corpus/Provenance";
import { useDocumentTitle } from "@/hooks/use-locale-chrome";
import { useTranslation } from "@/i18n/translations";
import NotFoundRoute from "./NotFoundRoute";
import type { Language } from "@/types/i18n";

export default function ElementRoute() {
  const { lang, elementId } = useParams<{ lang: Language; elementId: string }>();
  const language = (lang ?? "en") as Language;
  const t = useTranslation(language);

  const el = elementId ? elementById(elementId) : undefined;
  useDocumentTitle(el ? `${pick(el.name, language)} — ${t.siteTitle}` : t.corpus.notFoundTitle);

  if (!el) return <NotFoundRoute />;

  return (
    <CorpusShell lang={language} activeNav="empires">
      <nav className="mb-5">
        <Link to={`/${language}/characters`} className="corpus-back" dir="auto">
          {t.corpus.backToCharacters}
        </Link>
      </nav>

      <header className="mb-8 max-w-[68ch]">
        <p className="kicker">{t.corpus.kinds[el.kind] ?? el.kind}</p>
        <h1
          className="font-display mt-1 text-[2rem] font-bold leading-tight text-ink sm:text-[2.4rem]"
          dir="auto"
        >
          {pick(el.name, language)}
        </h1>
        <p className="element-term" dir="auto">
          <span className="element-term__ar">{el.term.ar}</span>
          <span className="element-term__translit">{el.term.translit}</span>
        </p>
        <p className="mt-3 text-[1rem] leading-relaxed text-ink-soft" dir="auto">
          {pick(el.rationale, language)}
        </p>
        <div className="mt-4">
          <ProvenanceBadge provenance={el.provenance} lang={language} />
        </div>
        <CitationList provenance={el.provenance} lang={language} />
      </header>

      <section className="mb-8">
        <h2 className="kicker mb-3">{t.corpus.attestedIn}</h2>
        <ul className="chip-row">
          {el.attestedIn.map((a) => {
            const c = characterById(a.characterId);
            if (!c) return null;
            return (
              <li key={a.characterId}>
                <Link to={`/${language}/characters/${a.characterId}`} className="element-chip" dir="auto">
                  <span className="element-chip__name">{pick(c.name, language)}</span>
                  <span className="element-chip__term">{a.typologies.join(" · ")}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="kicker mb-3">{t.corpus.parameters}</h2>
        <div className="param-table" role="table">
          {el.params.map((p) => (
            <div className="param-row" role="row" key={p.key}>
              <span className="param-row__label" dir="auto" role="cell">
                {pick(p.label, language)}
              </span>
              <span className="param-row__range" role="cell">
                {p.min}–{p.max} {p.unit === "count" ? "" : p.unit}
              </span>
              <span className="param-row__doc" role="cell">
                {p.documentedRange
                  ? `${t.corpus.documentedRange} ${p.documentedRange[0]}–${p.documentedRange[1]}`
                  : "—"}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="kicker mb-3">{t.corpus.placement}</h2>
        <div className="placement-grid">
          <div>
            <span className="placement-grid__key">{t.corpus.allowedSurfaces}</span>
            <span className="placement-grid__val">{el.placement.surfaces.join(", ")}</span>
          </div>
          <div>
            <span className="placement-grid__key">{t.corpus.allowedFaces}</span>
            <span className="placement-grid__val">{el.placement.faces.join(", ")}</span>
          </div>
          <div>
            <span className="placement-grid__key">{t.corpus.allowedZones}</span>
            <span className="placement-grid__val">{el.placement.zone.join(", ")}</span>
          </div>
          {typeof el.placement.maxPerFace === "number" && (
            <div>
              <span className="placement-grid__key">{t.corpus.maxPerFace}</span>
              <span className="placement-grid__val">{el.placement.maxPerFace}</span>
            </div>
          )}
        </div>

        {el.placement.notes && (
          <div className="placement-note" dir="auto">
            <strong>{t.corpus.constraintNote}</strong>
            <p>{pick(el.placement.notes, language)}</p>
          </div>
        )}
      </section>
    </CorpusShell>
  );
}
