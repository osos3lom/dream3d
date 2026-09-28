/** A real 404 rather than a silent redirect.
 *
 *  The router previously sent every unmatched path back to the home villa. With
 *  only two valid URLs that was harmless; now that characters and elements have
 *  their own addresses, a mistyped or stale link would land the visitor on the
 *  Najdi villa with no indication that anything had gone wrong — which reads as
 *  the app having answered the question, incorrectly. */

import { Link, useLocation, useParams } from "react-router";
import { CorpusShell } from "@/components/corpus/CorpusShell";
import { useDocumentTitle } from "@/hooks/use-locale-chrome";
import { preferredLanguage, isLanguage } from "@/hooks/use-locale-chrome";
import { useTranslation } from "@/i18n/translations";
import type { Language } from "@/types/i18n";

export default function NotFoundRoute() {
  const { lang } = useParams<{ lang: string }>();
  const location = useLocation();

  // This component is reached two ways: from inside a locale route, where the
  // param is set, and from the catch-all `*`, where it is not. In the second
  // case the param lookup returns nothing and falling straight through to the
  // stored preference would answer an /en/... URL in Arabic. Read the locale
  // off the path first, and only then fall back.
  const fromPath = location.pathname.split("/").filter(Boolean)[0];
  const language: Language = isLanguage(lang)
    ? lang
    : isLanguage(fromPath)
      ? fromPath
      : preferredLanguage();
  const t = useTranslation(language);
  useDocumentTitle(`${t.corpus.notFoundTitle} — ${t.siteTitle}`);

  return (
    <CorpusShell lang={language} activeNav="explore">
      <div className="mx-auto max-w-[46ch] py-16 text-center">
        <h1 className="font-display text-[1.8rem] font-bold text-ink" dir="auto">
          {t.corpus.notFoundTitle}
        </h1>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft" dir="auto">
          {t.corpus.notFoundBody}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to={`/${language}`} className="btn-primary">
            {t.corpus.goHome}
          </Link>
          <Link to={`/${language}/characters`} className="btn-outline">
            {t.corpus.backToCharacters}
          </Link>
        </div>
      </div>
    </CorpusShell>
  );
}
