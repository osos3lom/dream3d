"use client";

import { memo, useRef } from "react";
import type { Empire } from "@/types/empire";
import { empireImages } from "@/data";
import type { Language } from "@/types/i18n";
import { useTranslation } from "@/i18n/translations";
import { BookmarkIcon, HeartIcon, ArrowRightIcon } from "./icons";

interface Props {
  empires: Empire[];
  activeId: string;
  favorites: Set<string>;
  onSelect: (id: string) => void;
  onToggleFav: (id: string) => void;
  onViewAll: () => void;
  /** called on hover/focus so the model is already in memory when clicked */
  onPrefetch?: (id: string) => void;
  lang: Language;
}

export const EmpireLibrary = memo(function EmpireLibrary({ empires, activeId, favorites, onSelect, onToggleFav, onViewAll, onPrefetch, lang }: Props) {
  const t = useTranslation(lang);
  const listRef = useRef<HTMLDivElement>(null);

  const onKey = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = e.key === "ArrowDown" ? idx + 1 : idx - 1;
      const clamped = (next + empires.length) % empires.length;
      const id = empires[clamped].id;
      onSelect(id);
      listRef.current?.querySelectorAll<HTMLElement>("[data-empire]")[clamped]?.focus();
    }
  };

  return (
    <aside className="flex h-full w-full flex-col gap-3 overflow-hidden" aria-label="Heritage style library">
      <div className="flex flex-none items-center justify-between px-1 pt-1">
        <span className="kicker !text-[0.78rem]">{t.library.title}</span>
        <BookmarkIcon className="h-[18px] w-[18px] text-slateblue" aria-hidden />
      </div>

      <div ref={listRef} className="atlas-scroll -mx-2 min-h-0 flex-1 space-y-1.5 overflow-y-auto px-2 pb-2" role="listbox" aria-label="Heritage styles">
        {empires.map((e, i) => {
          const active = e.id === activeId;
          const fav = favorites.has(e.id);
          return (
            <button
              key={e.id}
              data-empire
              role="option"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onKeyDown={(ev) => onKey(ev, i)}
              onMouseEnter={() => onPrefetch?.(e.id)}
              onFocus={() => onPrefetch?.(e.id)}
              onClick={() => onSelect(e.id)}
              className={`empire-card ${active ? "is-active" : ""}`}
            >
              <img className="thumb" src={empireImages(e).thumbnail} alt={`${e.dwelling} render`} loading="lazy" draggable={false} />
              <span className="min-w-0 flex-1 leading-tight">
                <span className="font-display block text-[0.98rem] font-bold leading-[1.1] text-ink">{e.name}</span>
                <span className="mt-0.5 block truncate text-[0.78rem] text-ink-muted">{e.dwelling}</span>
              </span>
              <span
                role="button"
                tabIndex={-1}
                aria-label={fav ? "Remove favorite" : "Mark favorite"}
                className={`heart flex-none text-terracotta ${fav ? "is-fav" : ""}`}
                onClick={(ev) => {
                  ev.stopPropagation();
                  onToggleFav(e.id);
                }}
              >
                <HeartIcon className="h-[18px] w-[18px]" filled={fav || active} />
              </span>
            </button>
          );
        })}
      </div>

      <button onClick={onViewAll} className="btn-outline flex-none !justify-between px-4">
        <span className="font-display !text-[0.95rem] font-semibold">{t.library.viewAll}</span>
        <ArrowRightIcon className="h-4 w-4 rtl:rotate-180" />
      </button>
    </aside>
  );
});
