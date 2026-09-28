/** The characters index — the front door to the reference layer.
 *
 *  Shows all nineteen official characters plus any documented-other characters,
 *  grouped by region. Characters whose reference material has not been written
 *  yet are shown as such rather than hidden: the gap is the honest state, and
 *  displaying it is what keeps the coverage claim truthful. Hiding them would
 *  make the corpus look complete at four characters. */

import { Link, useParams } from "react-router";
import { CHARACTERS, officialCharacters, otherCharacters, t as pick, isRegistryOnly, cellCoverage } from "@/data/characters";
import { CorpusShell } from "@/components/corpus/CorpusShell";
import { RegistryBadge } from "@/components/corpus/RegistryBadge";
import { useDocumentTitle } from "@/hooks/use-locale-chrome";
import { useTranslation } from "@/i18n/translations";
import type { ArchCharacter } from "@/types/character";
import type { Language } from "@/types/i18n";

function CharacterCard({ c, lang }: { c: ArchCharacter; lang: Language }) {
  const t = useTranslation(lang);
  const thin = isRegistryOnly(c);
  return (
    <Link
      to={`/${lang}/characters/${c.id}`}
      className={`char-card ${thin ? "char-card--thin" : ""}`}
      style={{ "--char-tint": c.tint } as React.CSSProperties}
    >
      <span className="char-card__swatch" aria-hidden="true" />
      <span className="char-card__body">
        <span className="font-display char-card__name" dir="auto">
          {pick(c.name, lang)}
        </span>
        <span className="char-card__region" dir="auto">
          {pick(c.region, lang)}
        </span>
        <span className="char-card__tagline" dir="auto">
          {thin ? t.corpus.inProgress : pick(c.tagline, lang)}
        </span>
        <RegistryBadge character={c} lang={lang} />
      </span>
    </Link>
  );
}

export default function CharactersIndexRoute() {
  const { lang } = useParams<{ lang: Language }>();
  const language = (lang ?? "en") as Language;
  const t = useTranslation(language);
  useDocumentTitle(`${t.corpus.charactersTitle} — ${t.siteTitle}`);

  const official = officialCharacters();
  const others = otherCharacters();
  const coverage = cellCoverage();
  const authored = official.filter((c) => !isRegistryOnly(c)).length;

  // Listed in registry order rather than grouped by region.
  //
  // Grouping was the obvious first move and it was wrong: every character's
  // region label is specific to that character ("Tihamah foothills", "Bisha,
  // Asir"), so grouping produced nineteen groups of one — a structure that
  // looked meaningful and carried no information. Coarser buckets (Najd, Hijaz,
  // Asir, Eastern) would be a taxonomy we invented, which is exactly what this
  // corpus is built to avoid. The registry order is the real one, and each
  // card already states its own region.
  return (
    <CorpusShell lang={language} activeNav="empires">
      <header className="mb-8 max-w-[62ch]">
        <p className="kicker">{CHARACTERS.length} {language === "ar" ? "طابعاً" : "characters"}</p>
        <h1 className="font-display mt-1 text-[2rem] font-bold leading-tight text-ink sm:text-[2.4rem]" dir="auto">
          {t.corpus.charactersTitle}
        </h1>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft" dir="auto">
          {t.corpus.charactersLead}
        </p>

        {/* Coverage, stated plainly. A reference product that implies more
            completeness than it has is worse than one that admits the gap. */}
        <p className="corpus-coverage" dir="auto">
          {language === "ar"
            ? `${authored} من ${official.length} طوابع لها مادة مرجعية · ${coverage.written} من ${coverage.total} خانة`
            : `${authored} of ${official.length} characters have reference material · ${coverage.written} of ${coverage.total} cells`}
        </p>
      </header>

      <section className="mb-9">
        <h2 className="kicker mb-3" dir="auto">
          {t.corpus.officialFull}
        </h2>
        <div className="char-grid">
          {official.map((c) => (
            <CharacterCard key={c.id} c={c} lang={language} />
          ))}
        </div>
      </section>

      {others.length > 0 && (
        <section className="mb-9">
          <h2 className="kicker mb-3" dir="auto">
            {t.corpus.otherBadge} · {t.corpus.otherFull}
          </h2>
          <div className="char-grid">
            {others.map((c) => (
              <CharacterCard key={c.id} c={c} lang={language} />
            ))}
          </div>
        </section>
      )}

      <p className="corpus-disclaimer" dir="auto">
        {t.corpus.notAffiliated}
      </p>
    </CorpusShell>
  );
}
