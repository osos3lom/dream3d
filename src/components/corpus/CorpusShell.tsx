/** Page chrome for the reference routes.
 *
 *  The exhibit (`EmpireAtlasApp`) keeps its own shell. This is a deliberately
 *  separate, lighter one rather than a shared extraction, for two reasons: the
 *  exhibit's shell is entangled with viewer state that reference pages have no
 *  use for, and it was being edited in parallel while this was written.
 *  Unifying them is a worthwhile later cleanup, not a prerequisite.
 *
 *  What is shared is what matters: the same `Header`, the same search overlay,
 *  the same locale behaviour, the same card language. */

import { type ReactNode, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Header } from "@/components/Header";
import { SearchOverlay } from "@/components/modals";
import { useLocaleChrome } from "@/hooks/use-locale-chrome";
import type { Language } from "@/types/i18n";

export function CorpusShell({
  lang,
  activeNav = "empires",
  children,
}: {
  lang: Language;
  activeNav?: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const { toggleLang } = useLocaleChrome(lang);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /** Header nav is a set of shortcuts rather than a site map, which is how the
   *  exhibit already treats it. From a reference page the useful destinations
   *  are the characters index and the villa itself. */
  const onNav = useCallback(
    (nav: string) => {
      if (nav === "empires" || nav === "library") navigate(`/${lang}/characters`);
      else navigate(`/${lang}`);
    },
    [lang, navigate],
  );

  /** A search result routes to whichever surface actually owns it: a character
   *  or element opens its reference page, anything else opens the villa. */
  const onPick = useCallback(
    (empireId: string, hotspotId?: string, characterId?: string, elementId?: string) => {
      setSearchOpen(false);
      if (characterId) navigate(`/${lang}/characters/${characterId}`);
      else if (elementId) navigate(`/${lang}/elements/${elementId}`);
      else if (empireId) navigate(`/${lang}/villa/${empireId}${hotspotId ? `#${hotspotId}` : ""}`);
      else navigate(`/${lang}`);
    },
    [lang, navigate],
  );

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <Header
        onSearchOpen={() => setSearchOpen(true)}
        onMenuOpen={() => navigate(`/${lang}/characters`)}
        onNav={onNav}
        activeNav={activeNav}
        lang={lang}
        onToggleLang={toggleLang}
      />
      <main className="mx-auto w-full max-w-[1180px] flex-1 px-4 pb-16 pt-6 sm:px-6">{children}</main>
      {searchOpen && (
        <SearchOverlay onClose={() => setSearchOpen(false)} onPick={onPick} lang={lang} />
      )}
    </div>
  );
}
