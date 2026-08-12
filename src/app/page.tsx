"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { EMPIRES, empireById, DEFAULT_EMPIRE_ID, getLocalizedEmpire } from "@/data";
import type { Empire } from "@/types/empire";
import type { Language } from "@/types/i18n";
import { Banner } from "@/components/Banner";
import { Header } from "@/components/Header";
import { EmpireLibrary } from "@/components/EmpireLibrary";
import { InfoPanel } from "@/components/InfoPanel";
import { BottomCards } from "@/components/BottomCards";
import { LessonModal, QuizModal, ArtifactsModal, TimelineModal, SectionModal, SearchOverlay } from "@/components/modals";
import { CloseIcon } from "@/components/icons";

const Viewer = dynamic(() => import("@/components/Viewer").then((mod) => mod.Viewer), {
  ssr: false,
});

type ModalId = "lesson" | "quiz" | "artifacts" | "timeline" | "interior" | "floorPlan" | "dailyLife" | "geography" | null;

const mq = (q: string) => (typeof window !== "undefined" ? window.matchMedia(q).matches : false);

const getStorageItem = (key: string): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

export default function Home() {
  const [lang, setLang] = useState<Language>("en");
  const [rawViewerEmpire, setRawViewerEmpire] = useState<Empire>(() => empireById(DEFAULT_EMPIRE_ID));
  const [rawPanelEmpire, setRawPanelEmpire] = useState<Empire>(() => empireById(DEFAULT_EMPIRE_ID));
  
  const viewerEmpire = getLocalizedEmpire(rawViewerEmpire, lang);
  const panelEmpire = getLocalizedEmpire(rawPanelEmpire, lang);

  const [modal, setModal] = useState<ModalId>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [creditsOpen, setCreditsOpen] = useState(true);
  const [focusHotspot, setFocusHotspot] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState("explore");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());

  // Restore client-only preferences from localStorage & media queries after mount
  useEffect(() => {
    try {
      const storedLang = localStorage.getItem("atlas-lang") as Language;
      if (storedLang === "en" || storedLang === "ar") {
        setLang(storedLang);
      }
    } catch {}

    try {
      if (localStorage.getItem("atlas-credits") === "dismissed") {
        setCreditsOpen(false);
      }
    } catch {}

    try {
      const rawFavs = localStorage.getItem("atlas-favs");
      if (rawFavs) {
        setFavorites(new Set(JSON.parse(rawFavs)));
      }
    } catch {}

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReducedMotion(true);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === "en" ? "ar" : "en";
      try {
        localStorage.setItem("atlas-lang", next);
      } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(q.matches);
    q.addEventListener("change", sync);
    return () => q.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("rm", reducedMotion);
  }, [reducedMotion]);

  /* ⌘K search */
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

  useEffect(() => {
    document.title = `${panelEmpire.dwelling} — ${lang === "ar" ? "أطلس الإمبراطوريات" : "Empire Atlas"}`;
  }, [panelEmpire, lang]);

  const selectEmpire = useCallback(
    (id: string) => {
      const e = empireById(id);
      if (e.id === rawViewerEmpire.id) return;
      setAnimating(false);
      setRawViewerEmpire(e);
    },
    [rawViewerEmpire.id],
  );

  const onSwap = useCallback((e: Empire) => setRawPanelEmpire(e), []);

  const dismissCredits = useCallback(() => {
    setCreditsOpen(false);
    localStorage.setItem("atlas-credits", "dismissed");
  }, []);

  const prefetchRef = useRef<((e: Empire) => void) | null>(null);
  const prefetch = useCallback((id: string) => prefetchRef.current?.(empireById(id)), []);

  const toggleFav = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem("atlas-favs", JSON.stringify([...next]));
      return next;
    });
  }, []);

  const onNav = useCallback(
    (nav: string) => {
      setActiveNav(nav);
      if (nav === "lessons") setModal("lesson");
      else if (nav === "empires" || nav === "library") setSearchOpen(true);
      else if (nav === "notes") setModal("timeline");
    },
    [],
  );

  const onSearchPick = useCallback(
    (empireId: string, hotspotId?: string) => {
      setSearchOpen(false);
      if (empireId !== viewerEmpire.id) selectEmpire(empireId);
      if (hotspotId) window.setTimeout(() => setFocusHotspot(hotspotId), empireId !== viewerEmpire.id ? 1600 : 50);
    },
    [selectEmpire, viewerEmpire.id],
  );

  const localizedEmpires = EMPIRES.map((e) => getLocalizedEmpire(e, lang));

  return (
    <div
      className="flex min-h-screen flex-col bg-paper"
      style={{ "--banner-h": creditsOpen ? "40px" : "0px" } as React.CSSProperties}
    >
      {creditsOpen && <Banner onDismiss={dismissCredits} lang={lang} />}
      <Header
        onSearchOpen={() => setSearchOpen(true)}
        onMenuOpen={() => setMenuOpen(true)}
        onNav={onNav}
        activeNav={activeNav}
        lang={lang}
        onToggleLang={toggleLang}
      />

      <div className="flex min-h-[62vh] gap-4 px-3 pb-3 pt-3 sm:min-h-[520px] sm:px-4 xl:h-[calc(100vh-188px-var(--banner-h,0px))] xl:min-h-[600px] xl:px-5">
        <aside className="hidden w-[268px] flex-none xl:flex">
          <EmpireLibrary
            empires={localizedEmpires}
            activeId={viewerEmpire.id}
            favorites={favorites}
            onSelect={selectEmpire}
            onToggleFav={toggleFav}
            onViewAll={() => setSearchOpen(true)}
            onPrefetch={prefetch}
            lang={lang}
          />
        </aside>

        <main className="flex min-w-0 flex-1">
          <Viewer
            empire={viewerEmpire}
            onSwap={onSwap}
            reducedMotion={reducedMotion}
            animating={animating}
            focusHotspot={focusHotspot}
            onFocusHandled={() => setFocusHotspot(null)}
            onArtifacts={() => setModal("artifacts")}
            onTimeline={() => setModal("timeline")}
            onPrefetchReady={(fn) => { prefetchRef.current = fn; }}
            lang={lang}
          />
        </main>

        <aside className="hidden w-[330px] flex-none xl:flex">
          <InfoPanel
            empire={panelEmpire}
            animating={animating}
            onLesson={() => setModal("lesson")}
            onToggleAnimate={() => setAnimating((v) => !v)}
            onArtifacts={() => setModal("artifacts")}
            onQuiz={() => setModal("quiz")}
            lang={lang}
          />
        </aside>
      </div>

      <section className="px-3 pb-3 pt-1 sm:px-4 xl:hidden" aria-label="Selected dwelling">
        <InfoPanel
          empire={panelEmpire}
          flow
          animating={animating}
          onLesson={() => setModal("lesson")}
          onToggleAnimate={() => setAnimating((v) => !v)}
          onArtifacts={() => setModal("artifacts")}
          onQuiz={() => setModal("quiz")}
          lang={lang}
        />
      </section>

      <section className="px-3 pb-6 pt-1 sm:px-4 xl:px-5" aria-label="Explore the dwelling">
        <BottomCards empire={panelEmpire} onOpen={(s) => setModal(s)} lang={lang} />
      </section>

      {menuOpen && (
        <div className="overlay-backdrop xl:hidden" onClick={() => setMenuOpen(false)}>
          <div
            className="flex h-full w-[min(320px,86vw)] flex-col bg-paper shadow-lift"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="flex flex-none items-center justify-between border-b border-line-warm px-4 py-3">
              <span className="font-display text-[1.15rem] font-bold text-ink">
                {lang === "ar" ? "أطلس الإمبراطوريات" : "Empire Atlas"}
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                className="rounded-lg border border-line-warm p-1.5 text-ink-muted transition-colors hover:text-ink"
                aria-label="Close menu"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 px-3 py-3">
              <EmpireLibrary
                empires={localizedEmpires}
                activeId={viewerEmpire.id}
                favorites={favorites}
                onSelect={(id) => { setMenuOpen(false); selectEmpire(id); }}
                onToggleFav={toggleFav}
                onViewAll={() => { setMenuOpen(false); setSearchOpen(true); }}
                onPrefetch={prefetch}
                lang={lang}
              />
            </div>
          </div>
        </div>
      )}

      {modal === "lesson" && <LessonModal empire={panelEmpire} onClose={() => setModal(null)} onQuiz={() => setModal("quiz")} lang={lang} />}
      {modal === "quiz" && <QuizModal key={panelEmpire.id} empire={panelEmpire} onClose={() => setModal(null)} lang={lang} />}
      {modal === "artifacts" && <ArtifactsModal empire={panelEmpire} onClose={() => setModal(null)} lang={lang} />}
      {modal === "timeline" && <TimelineModal empire={panelEmpire} onClose={() => setModal(null)} lang={lang} />}
      {(modal === "interior" || modal === "floorPlan" || modal === "dailyLife" || modal === "geography") && (
        <SectionModal empire={panelEmpire} section={modal} onClose={() => setModal(null)} lang={lang} />
      )}
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} onPick={onSearchPick} lang={lang} />}
    </div>
  );
}
