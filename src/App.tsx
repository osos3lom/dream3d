import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router";
import type { Language } from "@/types/i18n";
import { isLanguage, preferredLanguage } from "@/hooks/use-locale-chrome";
import { EMPIRES } from "@/data";

const EmpireAtlasApp = lazy(() => import("@/components/EmpireAtlasApp"));

/** The reference routes are their own chunk. They carry no three.js, so a
 *  visitor arriving on a character page never downloads the viewer. */
const CharactersIndexRoute = lazy(() => import("@/routes/CharactersIndexRoute"));
const CharacterRoute = lazy(() => import("@/routes/CharacterRoute"));
const ElementRoute = lazy(() => import("@/routes/ElementRoute"));
const NotFoundRoute = lazy(() => import("@/routes/NotFoundRoute"));
/** The studio carries three.js and the parametric kit, so it stays in its own
 *  chunk — a visitor reading the reference pages never downloads it. */
const StudioRoute = lazy(() => import("@/routes/StudioRoute"));

/** Everything lives under the repository subpath on GitHub Pages, so the
 *  router's basename comes from Vite's `base` rather than being hard-coded. */
const BASENAME = import.meta.env.BASE_URL.replace(/\/$/, "");

/** Guards the locale segment for every route beneath it. An unknown locale
 *  redirects once, rather than each child having to re-check. */
function LocaleGate({ render }: { render: (lang: Language) => React.ReactNode }) {
  const { lang } = useParams<{ lang: string }>();
  if (!isLanguage(lang)) return <Navigate to={`/${preferredLanguage()}`} replace />;
  return <>{render(lang)}</>;
}

/** Shown only for the moment a route chunk is in flight; painted in the
 *  page's own parchment so it never flashes white on a phone. */
function RouteFallback() {
  return <div className="min-h-dvh bg-paper" aria-busy="true" />;
}

export function App() {
  return (
    <BrowserRouter basename={BASENAME}>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Navigate to={`/${preferredLanguage()}`} replace />} />

          {/* The exhibit. `/villa/:exhibitId` makes a specific villa linkable;
              the bare locale opens the default one, as it always has. */}
          <Route path="/:lang" element={<LocaleGate render={(l) => <EmpireAtlasApp routeLang={l} />} />} />
          <Route
            path="/:lang/villa/:exhibitId"
            element={<LocaleGate render={(l) => <VillaRoute lang={l} />} />}
          />

          {/* The reference layer. */}
          <Route
            path="/:lang/characters"
            element={<LocaleGate render={() => <CharactersIndexRoute />} />}
          />
          <Route
            path="/:lang/characters/:characterId"
            element={<LocaleGate render={() => <CharacterRoute />} />}
          />
          <Route
            path="/:lang/elements/:elementId"
            element={<LocaleGate render={() => <ElementRoute />} />}
          />

          <Route path="/:lang/studio" element={<LocaleGate render={() => <StudioRoute />} />} />
          <Route
            path="/:lang/studio/c/:catalogId"
            element={<LocaleGate render={() => <StudioRoute />} />}
          />

          {/* A genuine 404 rather than a silent redirect to the home villa. */}
          <Route path="*" element={<NotFoundRoute />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

/** An unknown villa id is a 404, not a silent fall-back to the default villa.
 *  `empireById` returns EMPIRES[0] for anything it does not recognise, which is
 *  the right behaviour inside the app and the wrong behaviour for a URL. */
function VillaRoute({ lang }: { lang: Language }) {
  const { exhibitId } = useParams<{ exhibitId: string }>();
  if (!exhibitId || !EMPIRES.some((e) => e.id === exhibitId)) return <NotFoundRoute />;
  return <EmpireAtlasApp routeLang={lang} initialEmpireId={exhibitId} />;
}
