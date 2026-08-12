"use client";

import { memo, useState } from "react";
import type { Empire } from "@/types/empire";
import type { Language } from "@/types/i18n";
import { useTranslation } from "@/i18n/translations";
import { empireImages, buildSearchIndex } from "@/data";
import { ModalShell } from "./ModalShell";
import { CheckIcon, ArrowRightIcon, QuizIcon, VaseIcon, SearchIcon, CloseIcon, TimelineIcon } from "./icons";

interface ModalBaseProps {
  empire: Empire;
  onClose: () => void;
  lang?: Language;
}

/* ═══ Lesson ═══ */
export const LessonModal = memo(function LessonModal({
  empire,
  onClose,
  onQuiz,
  lang = "en",
}: ModalBaseProps & { onQuiz: () => void }) {
  const t = useTranslation(lang);
  return (
    <ModalShell title={empire.lesson.title} kicker={`${t.modals.lesson.kicker} · ${empire.name}`} onClose={onClose} wide>
      <div className="flex gap-5">
        <img src={empireImages(empire).hero} alt="" className="hidden h-28 w-40 flex-none rounded-xl border border-line-warm bg-paper-deep object-contain sm:block" />
        <p className="font-display text-[1.08rem] italic leading-snug text-ink-soft">{empire.lesson.intro}</p>
      </div>
      <div className="mt-5 space-y-4">
        {empire.lesson.blocks.map((b, i) => (
          <section key={b.heading} className="flex gap-4">
            <span className="font-display flex h-7 w-7 flex-none items-center justify-center rounded-full border border-line-strong bg-paper-deep text-[0.85rem] font-bold text-terracotta">
              {i + 1}
            </span>
            <div>
              <h3 className="font-display text-[1.1rem] font-bold text-ink">{b.heading}</h3>
              <p className="mt-1 text-[0.88rem] leading-relaxed text-ink-soft">{b.body}</p>
            </div>
          </section>
        ))}
      </div>
      <button className="btn-primary mt-6 w-full" onClick={onQuiz}>
        <QuizIcon className="h-4 w-4" />
        {t.modals.lesson.startQuiz}
        <ArrowRightIcon className="h-4 w-4 rtl:rotate-180" />
      </button>
    </ModalShell>
  );
});

/* ═══ Quiz ═══ */
export const QuizModal = memo(function QuizModal({ empire, onClose, lang = "en" }: ModalBaseProps) {
  const t = useTranslation(lang);
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const q = empire.quiz[step];
  const done = step >= empire.quiz.length;

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.answer) setScore((s) => s + 1);
  };

  const titleText = done
    ? t.modals.quiz.resultsTitle
    : `${t.modals.quiz.question} ${step + 1} ${t.modals.quiz.of} ${empire.quiz.length}`;

  return (
    <ModalShell title={titleText} kicker={`${t.modals.quiz.kicker} · ${empire.dwelling}`} onClose={onClose}>
      {!done ? (
        <>
          <div className="tl-track mb-5"><div className="tl-fill" style={{ width: `${(step / empire.quiz.length) * 100}%` }} /></div>
          <h3 className="font-display text-[1.3rem] font-bold leading-snug text-ink">{q.q}</h3>
          <div className="mt-4 space-y-2">
            {q.choices.map((c, i) => (
              <button
                key={i}
                disabled={picked !== null}
                onClick={() => pick(i)}
                className={`quiz-choice w-full text-[0.9rem] text-ink-soft rtl:text-right ${
                  picked === null ? "" : i === q.answer ? "is-correct" : i === picked ? "is-wrong" : "opacity-60"
                }`}
              >
                <span className="font-display mr-2 font-bold text-terracotta rtl:ml-2 rtl:mr-0">{String.fromCharCode(65 + i)}.</span>
                {c}
                {picked !== null && i === q.answer && <CheckIcon className="ml-2 inline h-4 w-4 text-[#5d8a4f] rtl:mr-2 rtl:ml-0" />}
              </button>
            ))}
          </div>
          {picked !== null && (
            <div className="mt-4 rounded-xl border border-line-warm bg-paper-deep p-4">
              <p className="text-[0.86rem] leading-relaxed text-ink-soft">{q.explanation}</p>
              <button className="btn-primary mt-3 w-full" onClick={() => { setStep(step + 1); setPicked(null); }}>
                {step + 1 === empire.quiz.length ? t.modals.quiz.seeResults : t.modals.quiz.nextQuestion}
                <ArrowRightIcon className="h-4 w-4 rtl:rotate-180" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="py-4 text-center">
          <div className="font-display text-[3.4rem] font-bold leading-none text-terracotta">
            {score}<span className="text-[1.8rem] text-ink-muted">/{empire.quiz.length}</span>
          </div>
          <p className="font-display mt-2 text-[1.05rem] italic text-ink-soft">
            {score === empire.quiz.length
              ? t.modals.quiz.scoreCurator
              : score >= 3
              ? t.modals.quiz.scoreGood
              : t.modals.quiz.scoreLow}
          </p>
          <button className="btn-outline mt-5" onClick={() => { setStep(0); setScore(0); setPicked(null); }}>{t.modals.quiz.retake}</button>
        </div>
      )}
    </ModalShell>
  );
});

/* ═══ Artifacts ═══ */
export const ArtifactsModal = memo(function ArtifactsModal({ empire, onClose, lang = "en" }: ModalBaseProps) {
  return (
    <ModalShell title={empire.artifacts.title} kicker={`${empire.artifacts.kicker} · ${empire.name}`} onClose={onClose} wide>
      <div className="relative overflow-hidden rounded-xl border border-line-warm">
        <img src={empire.artifacts.image} alt={empire.artifacts.title} className="block h-auto w-full object-contain" />
      </div>
      <p className="font-display mt-3 text-[1rem] italic leading-snug text-ink-soft">{empire.artifacts.text}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {empire.artifacts.items.map((a) => (
          <div key={a.name} className="artifact-card group p-4" tabIndex={0}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[1.05rem] font-bold text-ink">{a.name}</h3>
              <VaseIcon className="h-4 w-4 text-terracotta-soft transition-transform group-hover:scale-110" />
            </div>
            <p className="mt-1 text-[0.82rem] font-medium text-terracotta-deep">{a.purpose}</p>
            <p className="mt-1.5 text-[0.8rem] leading-relaxed text-ink-muted">
              <span className="font-medium text-ink-soft">{a.material}.</span> {a.context}
            </p>
          </div>
        ))}
      </div>
    </ModalShell>
  );
});

/* ═══ Timeline ═══ */
export const TimelineModal = memo(function TimelineModal({ empire, onClose, lang = "en" }: ModalBaseProps) {
  const t = useTranslation(lang);
  const [idx, setIdx] = useState(0);
  const item = empire.timeline[idx];
  return (
    <ModalShell title={`${empire.name} — ${t.modals.timeline.titleSuffix}`} kicker={t.modals.timeline.kicker} onClose={onClose} wide>
      <div className="px-1 pt-2">
        <input
          type="range"
          min={0}
          max={empire.timeline.length - 1}
          value={idx}
          onChange={(e) => setIdx(Number(e.target.value))}
          className="w-full accent-[#a55338]"
          aria-label="Timeline position"
        />
        <div className="mt-2 flex justify-between text-[0.68rem] font-medium uppercase tracking-wide text-ink-muted">
          {empire.timeline.map((t2, i) => (
            <button key={i} onClick={() => setIdx(i)} className={`max-w-[90px] text-center leading-tight transition-colors ${i === idx ? "text-terracotta" : ""}`}>
              {t2.year}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6 rounded-2xl border border-line-warm bg-paper-deep p-6 text-center">
        <div className="kicker !text-terracotta">{item.era}</div>
        <div className="font-display mt-1 text-[1.9rem] font-bold text-ink">{item.year}</div>
        <p className="font-display mx-auto mt-2 max-w-[46ch] text-[1.05rem] leading-snug text-ink-soft">{item.text}</p>
        <div className="mt-4 flex items-center justify-center gap-2">
          {empire.timeline.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-terracotta" : "w-1.5 bg-line-strong"}`} />
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-[0.8rem] text-ink-muted">
        <TimelineIcon className="h-4 w-4 flex-none" />
        <span>{t.modals.timeline.hint}</span>
      </div>
    </ModalShell>
  );
});

/* ═══ Image detail (interior / floor plan / daily life / map) ═══ */
export const SectionModal = memo(function SectionModal({
  empire,
  section,
  onClose,
  lang = "en",
}: ModalBaseProps & {
  section: "interior" | "floorPlan" | "dailyLife" | "geography";
}) {
  const data = empire[section];
  const rooms = section === "floorPlan" ? empire.floorPlan.rooms : null;
  return (
    <ModalShell title={data.title} kicker={`${data.kicker} · ${empire.dwelling}`} onClose={onClose} wide>
      <div className="overflow-hidden rounded-xl border border-line-warm bg-paper-deep">
        <img src={data.image} alt={data.title} className="w-full object-contain" />
      </div>
      {section === "geography" && (
        <div className="kicker mt-3 !text-terracotta">{empire.geography.regionLabel}</div>
      )}
      <p className="font-display mt-3 text-[1.05rem] leading-snug text-ink-soft">{data.text}</p>
      {rooms && (
        <div className="mt-4 flex flex-wrap gap-2">
          {rooms.map((r) => (
            <span key={r.name} className="rounded-full border border-line-warm bg-surface px-3 py-1.5 text-[0.78rem] text-ink-soft" title={r.note}>
              <span className="font-display font-bold text-ink">{r.name}</span>
              {r.note ? <span className="text-ink-muted"> · {r.note}</span> : null}
            </span>
          ))}
        </div>
      )}
    </ModalShell>
  );
});

/* ═══ Search overlay ═══ */
export const SearchOverlay = memo(function SearchOverlay({
  onClose,
  onPick,
  lang = "en",
}: {
  onClose: () => void;
  onPick: (empireId: string, hotspotId?: string) => void;
  lang?: Language;
}) {
  const t = useTranslation(lang);
  const index = buildSearchIndex(lang);
  const [q, setQ] = useState("");
  const results = q.trim()
    ? index.filter((e) => `${e.title} ${e.subtitle}`.toLowerCase().includes(q.toLowerCase())).slice(0, 14)
    : index.filter((e) => e.kind === "empire");

  return (
    <div className="overlay-backdrop flex items-start justify-center p-4 pt-[10vh]" onClick={onClose}>
      <div className="modal-panel w-full max-w-[560px] overflow-hidden" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Search">
        <div className="flex items-center gap-3 border-b border-line-warm px-5 py-4">
          <SearchIcon className="h-5 w-5 flex-none text-ink-muted" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.search.placeholder}
            className="font-display w-full bg-transparent text-[1.1rem] italic text-ink outline-none placeholder:text-ink-muted"
            aria-label="Search"
          />
          <button onClick={onClose} className="rounded-md p-1 text-ink-muted hover:text-ink" aria-label="Close search">
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="atlas-scroll max-h-[46vh] overflow-y-auto p-2" role="listbox">
          {results.length === 0 && <p className="font-display px-3 py-6 text-center italic text-ink-muted">{t.search.noResults}</p>}
          {results.map((r, i) => (
            <button
              key={`${r.empireId}-${r.title}-${i}`}
              role="option"
              aria-selected={false}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-paper-deep rtl:text-right"
              onClick={() => onPick(r.empireId, r.hotspotId)}
            >
              <span className="flex-none rounded-md border border-line-warm bg-surface px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wider text-terracotta">
                {t.search.kinds[r.kind] || r.kind}
              </span>
              <span className="min-w-0">
                <span className="font-display block truncate text-[0.98rem] font-bold text-ink">{r.title}</span>
                <span className="block truncate text-[0.76rem] text-ink-muted">{r.subtitle}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});
