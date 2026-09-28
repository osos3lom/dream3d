/** The provenance affordances — the part of the UI that carries the product's
 *  central claim.
 *
 *  The visual contract, stated once here and not varied elsewhere:
 *
 *  · documented     slate-blue, book icon, the word "Documented"
 *  · interpretation terracotta, compass icon, the words "AI interpretation"
 *                   spelled out — never an icon alone
 *  · unverified     muted, dashed outline, "Awaiting a source"
 *
 *  Documented and interpreted claims are never rendered adjacently without
 *  their labels, and no list interleaves them without a heading. An icon on its
 *  own is not sufficient labelling for a generated interpretation: someone
 *  screenshotting the page has to carry the distinction with them. */

import { memo } from "react";
import type { Provenance } from "@/types/provenance";
import { citationsOf } from "@/types/provenance";
import { sourceById } from "@/data/corpus/sources";
import type { Language } from "@/types/i18n";
import { useTranslation } from "@/i18n/translations";

function KindIcon({ kind }: { kind: Provenance["kind"] }) {
  if (kind === "documented") {
    return (
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 flex-none" aria-hidden="true">
        <path
          d="M2.5 3.2c1.8-.8 3.6-.8 5.5 0v9.6c-1.9-.8-3.7-.8-5.5 0V3.2Zm11 0c-1.8-.8-3.6-.8-5.5 0v9.6c1.9-.8 3.7-.8 5.5 0V3.2Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (kind === "interpretation") {
    return (
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 flex-none" aria-hidden="true">
        <circle cx="8" cy="8" r="5.6" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="m10.2 5.8-1.5 3.4-3.4 1.5 1.5-3.4 3.4-1.5Z" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 flex-none" aria-hidden="true">
      <circle cx="8" cy="8" r="5.6" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2" />
      <path d="M8 4.8v4.2M8 10.8v.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/** A short badge naming what kind of claim this is. */
export const ProvenanceBadge = memo(function ProvenanceBadge({
  provenance,
  lang,
  className = "",
}: {
  provenance: Provenance;
  lang: Language;
  className?: string;
}) {
  const t = useTranslation(lang);
  const label =
    provenance.kind === "documented"
      ? t.corpus.provDocumented
      : provenance.kind === "interpretation"
        ? t.corpus.provInterpretation
        : t.corpus.provUnverified;
  const note =
    provenance.kind === "documented"
      ? t.corpus.provDocumentedNote
      : provenance.kind === "interpretation"
        ? t.corpus.provInterpretationNote
        : t.corpus.provUnverifiedNote;

  return (
    <span className={`prov-badge prov-badge--${provenance.kind} ${className}`} title={note}>
      <KindIcon kind={provenance.kind} />
      <span>{label}</span>
      {provenance.kind === "documented" && provenance.corroborated && (
        <span className="prov-badge__dot" title={t.corpus.corroborated} aria-label={t.corpus.corroborated} />
      )}
    </span>
  );
});

/** The sources behind a claim, listed in full rather than hidden behind a
 *  tooltip. A citation that is inconvenient to read is a citation nobody
 *  checks. */
export const CitationList = memo(function CitationList({
  provenance,
  lang,
  compact = false,
}: {
  provenance: Provenance;
  lang: Language;
  compact?: boolean;
}) {
  const t = useTranslation(lang);
  const citations = citationsOf(provenance);

  if (provenance.kind === "unverified") {
    // `note` is an authoring instruction — it names source ids and file paths so
    // whoever picks the record up knows exactly what to read. That is useful in
    // a diff and wrong on a page: a visitor should be told the claim is
    // provisional, not handed our repository layout. The note is kept in the
    // title attribute so it stays one hover away for anyone working on the
    // corpus, and out of the rendered copy.
    return (
      <p className="prov-note" dir="auto" title={provenance.note}>
        {t.corpus.provUnverifiedNote}
      </p>
    );
  }
  if (citations.length === 0) return null;

  return (
    <div className={compact ? "" : "mt-2"}>
      {!compact && <h4 className="kicker mb-1">{t.corpus.sources}</h4>}
      <ul className="prov-sources">
        {citations.map((c, i) => {
          const source = sourceById(c.sourceId);
          if (!source) {
            // Should be unreachable: verify:corpus fails the build on an
            // unresolved sourceId. Rendered rather than thrown so a data slip
            // never blanks the page.
            return (
              <li key={i} className="prov-sources__item prov-sources__item--missing">
                {c.sourceId}
              </li>
            );
          }
          const title = lang === "ar" && source.titleAr ? source.titleAr : source.title;
          return (
            <li key={i} className="prov-sources__item">
              {source.locator ? (
                <a href={source.locator} target="_blank" rel="noopener noreferrer" dir="auto">
                  {title}
                </a>
              ) : (
                <span dir="auto">{title}</span>
              )}
              {source.publisher && <span className="prov-sources__meta"> · {source.publisher}</span>}
              {source.year && <span className="prov-sources__meta"> · {source.year}</span>}
              {c.locus && <span className="prov-sources__meta"> · {c.locus}</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
});

/** Badge plus sources, the pairing most pages want. */
export const ProvenanceBlock = memo(function ProvenanceBlock({
  provenance,
  lang,
}: {
  provenance: Provenance;
  lang: Language;
}) {
  return (
    <div className="prov-block">
      <ProvenanceBadge provenance={provenance} lang={lang} />
      <CitationList provenance={provenance} lang={lang} compact />
    </div>
  );
});
