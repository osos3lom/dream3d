"use client";

import { memo } from "react";
import type { Language } from "@/types/i18n";
import { useTranslation } from "@/i18n/translations";
import { CloseIcon } from "./icons";

interface Props {
  onDismiss: () => void;
  lang: Language;
}

export const TRIPO_URL = "https://studio.tripo3d.com/?utm_source=brand&utm_medium=creator&utm_campaign=suj";

/** A single line of credit above the header, dismissible for good. */
export const Banner = memo(function Banner({ onDismiss, lang }: Props) {
  const t = useTranslation(lang);
  return (
    <div
      className="relative z-50 flex flex-none items-center justify-center gap-x-3 gap-y-1 border-b border-line-strong bg-cream px-11 py-2 text-center xl:h-10 xl:py-0"
      role="region"
      aria-label="Credits"
    >
      <p className="text-[0.78rem] leading-snug text-ink-soft sm:text-[0.82rem]">
        <span className="font-semibold text-terracotta">{t.banner.tag} — </span>
        <span>{t.banner.text}</span>
      </p>

      <button
        onClick={onDismiss}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-ink-muted transition-colors hover:bg-paper-deep hover:text-ink rtl:left-2.5 rtl:right-auto"
        aria-label="Dismiss credits"
      >
        <CloseIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
});
