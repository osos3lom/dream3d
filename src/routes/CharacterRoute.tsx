/** One architectural character: its region, its climate logic, its three design
 *  typologies, and the elements attested for each.
 *
 *  The typology is selected through `?typology=` rather than component state so
 *  a particular cell of the 19 x 3 matrix is linkable — that is the unit a
 *  designer or a reviewer actually refers to.
 *
 *  Every block carries its own provenance badge. A character can hold a
 *  documented registry entry next to an unsourced description, and the page has
 *  to show that difference rather than average it into a single confidence. */

import { Link, useParams, useSearchParams } from "react-router";
import { characterById, t as pick, isRegistryOnly } from "@/data/characters";
import { exhibitsForCharacter } from "@/data";
import { elementById } from "@/data/corpus/elements";
import { TYPOLOGIES, type Typology } from "@/types/character";
import { CorpusShell } from "@/components/corpus/CorpusShell";
import { RegistryBadge } from "@/components/corpus/RegistryBadge";
import { ProvenanceBadge, CitationList } from "@/components/corpus/Provenance";
import { useDocumentTitle } from "@/hooks/use-locale-chrome";
import { useTranslation } from "@/i18n/translations";
import NotFoundRoute from "./NotFoundRoute";
import type { Language } from "@/types/i18n";

const isTypology = (v: string | null): v is Typology =>
  !!v && (TYPOLOGIES as readonly string[]).includes(v);

export default function CharacterRoute() {
  const { lang, characterId } = useParams<{ lang: Language; characterId: string }>();
  const [params, setParams] = useSearchParams();
  const language = (lang ?? "en") as Language;
  const t = useTranslation(language);

  const character = characterId ? characterById(characterId) : undefined;
  useDocumentTitle(
    character ? `${pick(character.name, language)} — ${t.siteTitle}` : t.corpus.notFoundTitle,
  );

  if (!character) return <NotFoundRoute />;

  const requested = params.get("typology");
  const typology: Typology = isTypology(requested) ? requested : "contemporary";
  const profile = character.typologies[typology];
  const thin = isRegistryOnly(character);
  const exhibits = exhibitsForCharacter(character.id);

  return (
    <CorpusShell lang={language} activeNav="empires">
      <nav className="mb-5">
        <Link to={`/${language}/characters`} className="corpus-back" dir="auto">
          {t.corpus.backToCharacters}
        </Link>
      </nav>

      <header className="mb-8 max-w-[68ch]">
        <RegistryBadge character={character} lang={language} showIndex />
        <h1
          className="font-display mt-2 text-[2rem] font-bold leading-tight text-ink sm:text-[2.5rem]"
          dir="auto"
        >
          {pick(character.name, language)}
        </h1>
        <p className="mt-1 text-[0.95rem] text-ink-muted" dir="auto">
          {pick(character.region, language)}
        </p>

        <div className="mt-4">
          <ProvenanceBadge provenance={character.provenance} lang={language} />
        </div>

        {thin ? (
          <div className="corpus-thin" dir="auto">
            <strong>{t.corpus.inProgress}</strong>
            <p>{t.corpus.inProgressNote}</p>
          </div>
        ) : (
          <p className="mt-4 text-[1rem] leading-relaxed text-ink-soft" dir="auto">
            {pick(character.description, language)}
          </p>
        )}

        <CitationList provenance={character.provenance} lang={language} />
      </header>

      {!thin && character.climate.drivers.length > 0 && (
        <section className="mb-8">
          <h2 className="kicker mb-2">{t.corpus.climate}</h2>
          <ul className="chip-row">
            {character.climate.drivers.map((d) => (
              <li key={d} className="element-chip element-chip--plain">
                {t.corpus.drivers[d] ?? d.replace(/-/g, " ")}
              </li>
            ))}
          </ul>
          <div className="mt-2">
            <ProvenanceBadge provenance={character.climate.provenance} lang={language} />
          </div>
        </section>
      )}

      <section className="mb-8">
        <h2 className="kicker mb-3">{t.corpus.typologies}</h2>
        <div className="typology-tabs" role="tablist" aria-label={t.corpus.typologies}>
          {TYPOLOGIES.map((ty) => (
            <button
              key={ty}
              role="tab"
              aria-selected={ty === typology}
              className={`typology-tab ${ty === typology ? "is-active" : ""}`}
              onClick={() => {
                const next = new URLSearchParams(params);
                next.set("typology", ty);
                setParams(next, { replace: true });
              }}
            >
              {ty}
            </button>
          ))}
        </div>

        <div className="typology-panel" role="tabpanel">
          <p className="text-[0.95rem] leading-relaxed text-ink-soft" dir="auto">
            {pick(profile.summary, language)}
          </p>
          <p className="mt-2 text-[0.82rem] text-ink-muted" dir="auto">
            {pick(profile.period, language)}
          </p>
          <div className="mt-3">
            <ProvenanceBadge provenance={profile.provenance} lang={language} />
            <CitationList provenance={profile.provenance} lang={language} compact />
          </div>

          <h3 className="kicker mt-5 mb-2">{t.corpus.elements}</h3>
          {profile.elementIds.length === 0 ? (
            <p className="text-[0.88rem] text-ink-muted" dir="auto">
              {t.corpus.noElements}
            </p>
          ) : (
            <ul className="chip-row">
              {profile.elementIds.map((id) => {
                const el = elementById(id);
                if (!el) return null;
                return (
                  <li key={id}>
                    <Link to={`/${language}/elements/${id}`} className="element-chip" dir="auto">
                      <span className="element-chip__name">{pick(el.name, language)}</span>
                      <span className="element-chip__term">{el.term.ar}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {profile.exhibitId && exhibits.some((e) => e.id === profile.exhibitId) && (
            <Link to={`/${language}/villa/${profile.exhibitId}`} className="btn-primary mt-5 inline-flex">
              {t.corpus.exhibit}
            </Link>
          )}
        </div>
      </section>

      <p className="corpus-disclaimer" dir="auto">
        {t.corpus.notAffiliated}
      </p>
    </CorpusShell>
  );
}
