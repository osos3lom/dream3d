import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router";
import type { Language } from "@/types/i18n";

const EmpireAtlasApp = lazy(() => import("@/components/EmpireAtlasApp"));

/** Everything lives under the repository subpath on GitHub Pages, so the
 *  router's basename comes from Vite's `base` rather than being hard-coded. */
const BASENAME = import.meta.env.BASE_URL.replace(/\/$/, "");

const LANGUAGES: Language[] = ["en", "ar"];

const isLanguage = (value: string | undefined): value is Language =>
  !!value && (LANGUAGES as string[]).includes(value);

/** The first visit has no locale in the path. Honour the last choice the
 *  visitor made, then the browser's own preference, before falling back to
 *  English — the same resolution order the Next.js redirect implied. */
function preferredLanguage(): Language {
  try {
    const stored = localStorage.getItem("atlas-lang");
    if (isLanguage(stored ?? undefined)) return stored as Language;
  } catch {
    /* Safari private mode throws on access; the default is fine */
  }
  if (typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("ar")) {
    return "ar";
  }
  return "en";
}

function LocaleRoute() {
  const { lang } = useParams<{ lang: string }>();
  if (!isLanguage(lang)) return <Navigate to={`/${preferredLanguage()}`} replace />;
  return <EmpireAtlasApp routeLang={lang} />;
}

/** Shown only for the moment the viewer chunk is in flight; painted in the
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
          <Route path="/:lang" element={<LocaleRoute />} />
          <Route path="*" element={<Navigate to={`/${preferredLanguage()}`} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
