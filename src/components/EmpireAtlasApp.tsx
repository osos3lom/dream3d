import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
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
import { useTranslation } from "@/i18n/translations";
import { useScrollLock } from "@/hooks/use-scroll-lock";

/** three.js is by far the heaviest dependency; keeping the viewer in its own
 *  chunk lets the parchment shell paint before it arrives. */
const Viewer = lazy(() => import("@/components/Viewer").then((mod) => ({ default: mod.Viewer })));

type ModalId = "lesson" | "quiz" | "artifacts" | "timeline" | "interior" | "floorPlan" | "dailyLife" | "geography" | null;

export default function EmpireAtlasApp({ routeLang }: { routeLang: Language }) {
  const navigate = useNavigate();
  const [lang, setLang] = useState<Language>(routeLang);
  const t = useTranslation(lang);
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

  useScrollLock(menuOpen);

  /* Esc closes the drawer, matching the modals and the search overlay. */
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // Sync route lang if route params change
  useEffect(() => {
    setLang(routeLang);
  }, [routeLang]);

  // Restore client-only preferences from localStorage & media queries after mount
  useEffect(() => {
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
    const next = lang === "en" ? "ar" : "en";
    try {
      localStorage.setItem("atlas-lang", next);
    } catch {}
    navigate(`/${next}`);
  }, [lang, navigate]);

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
    document.title = `${panelEmpire.dwelling} — ${t.siteTitle}`;
  }, [panelEmpire, t.siteTitle]);

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
      className="flex min-h-dvh flex-col bg-paper"
      data-credits={creditsOpen ? "open" : "closed"}
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

      <div className="stage-row flex gap-4 px-3 pb-3 pt-3 sm:px-4 xl:px-5">
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
          <Suspense fallback={<div className="atlas-card viewer-stage h-full w-full" aria-busy="true" />}>
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
          </Suspense>
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

      <section className="px-3 pb-3 pt-1 sm:px-4 xl:hidden" aria-label="Selected villa">
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

      <section className="px-3 pb-[max(1.5rem,calc(var(--safe-bottom)+0.75rem))] pt-1 sm:px-4 xl:px-5" aria-label="Explore the villa">
        <BottomCards empire={panelEmpire} onOpen={(s) => setModal(s)} lang={lang} />
      </section>

      {menuOpen && (
        <div className="overlay-backdrop xl:hidden" onClick={() => setMenuOpen(false)}>
          <div
            className="pad-safe-top pad-safe-bottom flex h-full w-[min(320px,86vw)] flex-col bg-paper shadow-lift"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="flex flex-none items-center justify-between border-b border-line-warm px-4 py-3">
              <span className="font-display text-[1.15rem] font-bold text-ink">
                {t.siteTitle}
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                className="flex h-11 w-11 flex-none items-center justify-center rounded-lg border border-line-warm text-ink-muted transition-colors hover:text-ink"
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
