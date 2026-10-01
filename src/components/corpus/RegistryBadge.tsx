/** Whether a character is on the official Saudi Architecture Characters Map.
 *
 *  This badge exists to prevent one specific misrepresentation: implying that a
 *  character carries national standing when it does not. Salmani is the case
 *  that motivated it — a real, documented contemporary character associated
 *  with Riyadh, and not one of the nineteen.
 *
 *  The two states are visually distinct and both are labelled in words. The
 *  non-official state says what it is ("Documented character") and what it is
 *  not ("Not on the official map") rather than simply omitting the official
 *  badge, because an absent badge reads as an oversight, while a present one
 *  reads as a statement. */

import { memo } from "react";
import type { ArchCharacter } from "@/types/character";
import type { Language } from "@/types/i18n";
import { useTranslation } from "@/i18n/translations";

export const RegistryBadge = memo(function RegistryBadge({
  character,
  lang,
  showIndex = false,
}: {
  character: ArchCharacter;
  lang: Language;
  /** The map position. Off by default: the ordering is taken from secondary
   *  reference and has not been confirmed against the portal, so it is not
   *  presented as an official number without a reason. */
  showIndex?: boolean;
}) {
  const t = useTranslation(lang);
  const official = character.registry === "official-map";

  return (
    <span
      className={`registry-pill ${official ? "registry-pill--official" : "registry-pill--other"}`}
      dir="auto"
    >
      <span className="registry-pill__label">
        {official ? t.corpus.officialBadge : t.corpus.otherBadge}
        {official && showIndex && typeof character.officialIndex === "number" && (
          <span className="registry-pill__index"> {character.officialIndex}</span>
        )}
      </span>
      <span className="registry-pill__sep" aria-hidden="true">
        ·
      </span>
      <span className="registry-pill__full">
        {official ? t.corpus.officialFull : t.corpus.otherFull}
      </span>
    </span>
  );
});
