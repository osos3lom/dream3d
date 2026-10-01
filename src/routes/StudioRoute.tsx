/** The design studio.
 *
 *  A visitor opens a curated, documented design and adjusts it — no API key, no
 *  network call beyond the static bundle, no AI. That ordering is deliberate:
 *  if the studio is not worth using before any model is involved, then the
 *  model was decoration.
 *
 *  Three properties hold throughout:
 *
 *  · Every control is bounded by the element's own `ElementParam`, and the
 *    documented sub-range is marked on the slider. You can leave documented
 *    territory, and when you do the design says so.
 *  · `culturalLint` runs on every edit, not just on generated output.
 *  · The result is labelled an interpretation, in words, permanently. */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { CorpusShell } from "@/components/corpus/CorpusShell";
import { StudioViewer, type BuildInfo } from "@/components/studio/StudioViewer";
import { ProvenanceBadge } from "@/components/corpus/Provenance";
import { RegistryBadge } from "@/components/corpus/RegistryBadge";
import { CATALOG, catalogById } from "@/data/catalog";
import { characterById, t as pick } from "@/data/characters";
import { sourceById } from "@/data/corpus/sources";
import { culturalLint } from "@/lib/studio/culturalLint";
import { collectParams, resetParams, setParam, type EditableParam } from "@/lib/studio/params";
import { encodeSpec, decodeSpec, readSpecHash, specHash } from "@/lib/studio/permalink";
import type { FacadeSpec } from "@/lib/studio/schema";
import { useDocumentTitle } from "@/hooks/use-locale-chrome";
import { useTranslation } from "@/i18n/translations";
import type { Language } from "@/types/i18n";

function Slider({
  p,
  lang,
  onChange,
  onScrub,
}: {
  p: EditableParam;
  lang: Language;
  onChange: (value: number) => void;
  onScrub: (active: boolean) => void;
}) {
  const t = useTranslation(lang);
  const { param } = p;
  const span = param.max - param.min || 1;
  const band = param.documentedRange;
  const outside = band ? p.value < band[0] || p.value > band[1] : false;

  return (
    <label className="studio-param">
      <span className="studio-param__head">
        <span className="studio-param__label" dir="auto">
          {pick(param.label, lang)}
        </span>
        <span className={"studio-param__value" + (outside ? " is-outside" : "")}>
          {p.value}
          {param.unit === "count" ? "" : param.unit === "deg" ? "°" : " " + param.unit}
        </span>
      </span>
      <span className="studio-param__track">
        {band && (
          // The documented band drawn on the track: leaving it is allowed and
          // visible, rather than silently permitted.
          <span
            className="studio-param__band"
            style={{
              insetInlineStart: ((band[0] - param.min) / span) * 100 + "%",
              width: ((band[1] - band[0]) / span) * 100 + "%",
            }}
            title={t.studio.documentedBand + " " + band[0] + "–" + band[1]}
          />
        )}
        <input
          type="range"
          min={param.min}
          max={param.max}
          step={param.step ?? 0.01}
          value={p.value}
          onChange={(e) => onChange(Number(e.target.value))}
          onPointerDown={() => onScrub(true)}
          onPointerUp={() => onScrub(false)}
          onBlur={() => onScrub(false)}
        />
      </span>
      {outside && band && (
        <span className="studio-param__warn" dir="auto">
          {lang === "ar"
            ? `خارج المدى الموثّق (${band[0]}–${band[1]})`
            : `outside the documented range (${band[0]}–${band[1]})`}
        </span>
      )}
    </label>
  );
}

export default function StudioRoute() {
  const { lang, catalogId } = useParams<{ lang: Language; catalogId?: string }>();
  const [search] = useSearchParams();
  const language = (lang ?? "en") as Language;
  const t = useTranslation(language);

  const seed = (catalogId ? catalogById(catalogId) : undefined) ?? CATALOG[0];
  const [spec, setSpec] = useState<FacadeSpec>(seed.spec);
  const [scrubbing, setScrubbing] = useState(false);
  const [build, setBuild] = useState<BuildInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const loadedHash = useRef(false);

  const character = characterById(spec.characterId);
  useDocumentTitle(`${t.studio.title} — ${t.siteTitle}`);

  /* A shared design arrives in the hash, which never reaches the server. */
  useEffect(() => {
    if (loadedHash.current) return;
    loadedHash.current = true;
    const code = readSpecHash(window.location.hash);
    if (!code) return;
    void decodeSpec(code).then((r) => {
      if (r.ok) setSpec(r.spec);
      else setNotice(t.studio.linkLoadFailed + (r.detail ? " — " + r.detail : ""));
    });
  }, [t.studio.linkLoadFailed]);

  const params = useMemo(() => collectParams(spec), [spec]);
  const lint = useMemo(() => culturalLint(spec), [spec]);

  const groups = useMemo(() => {
    const map = new Map<string, EditableParam[]>();
    for (const p of params) {
      const list = map.get(p.group);
      if (list) list.push(p);
      else map.set(p.group, [p]);
    }
    return [...map.entries()];
  }, [params]);

  const onShare = useCallback(async () => {
    const r = await encodeSpec(spec);
    if (!r.ok) {
      setNotice(t.studio.tooLarge);
      return;
    }
    const url = window.location.origin + window.location.pathname + specHash(r.code);
    try {
      await navigator.clipboard.writeText(url);
      setNotice(t.studio.copied);
    } catch {
      // Clipboard access can be refused; put it in the address bar so it can
      // still be copied by hand.
      window.location.hash = specHash(r.code);
      setNotice(t.studio.copied);
    }
  }, [spec, t.studio.copied, t.studio.tooLarge]);

  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(id);
  }, [notice]);

  const highlight = search.get("focus");

  return (
    <CorpusShell lang={language} activeNav="explore">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="max-w-[58ch]">
          <p className="kicker">{t.studio.title}</p>
          <h1 className="font-display mt-1 text-[1.7rem] font-bold leading-tight text-ink sm:text-[2rem]" dir="auto">
            {pick(spec.title, language)}
          </h1>
          <p className="mt-2 text-[0.9rem] leading-relaxed text-ink-soft" dir="auto">
            {t.studio.lead}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-outline" onClick={() => setSpec(resetParams(spec))}>
            {t.studio.reset}
          </button>
          <button className="btn-primary" onClick={onShare}>
            {t.studio.share}
          </button>
        </div>
      </header>

      {notice && (
        <p className="studio-notice" role="status" dir="auto">
          {notice}
        </p>
      )}
      {error && (
        <p className="studio-notice studio-notice--error" role="alert" dir="auto">
          {error}
        </p>
      )}

      <div className="studio-grid" data-highlight={highlight ?? undefined}>
        {/* ── controls ─────────────────────────────────────────────── */}
        <aside className="studio-rail">
          <h2 className="kicker mb-2">{t.studio.parameters}</h2>
          {groups.map(([group, items]) => (
            <section key={group} className="studio-group">
              <h3 className="studio-group__title">{group}</h3>
              {items.map((p) => (
                <Slider
                  key={p.path + p.key}
                  p={p}
                  lang={language}
                  onChange={(v) => setSpec((s) => setParam(s, p.path, p.key, v))}
                  onScrub={setScrubbing}
                />
              ))}
            </section>
          ))}

          {CATALOG.length > 1 && (
            <section className="studio-group">
              <h3 className="studio-group__title">{t.studio.openCatalog}</h3>
              {CATALOG.map((c) => (
                <Link key={c.id} to={`/${language}/studio/c/${c.id}`} className="studio-catalog-link">
                  {pick(c.spec.title, language)}
                </Link>
              ))}
            </section>
          )}
        </aside>

        {/* ── stage ────────────────────────────────────────────────── */}
        <main className="studio-stage">
          <StudioViewer
            spec={spec}
            lang={language}
            scrubbing={scrubbing}
            onBuilt={setBuild}
            onError={setError}
          />
        </main>

        {/* ── inspector ────────────────────────────────────────────── */}
        <aside className="studio-rail">
          <h2 className="kicker mb-2">{t.studio.inspector}</h2>

          <div className="studio-block">
            <ProvenanceBadge provenance={spec.provenance} lang={language} />
            <p className="studio-block__note" dir="auto">
              {t.studio.interpretation}
            </p>
          </div>

          {character && (
            <div className="studio-block">
              <span className="studio-block__key">{t.studio.basedOn}</span>
              <Link to={`/${language}/characters/${character.id}`} className="studio-block__link" dir="auto">
                {pick(character.name, language)}
              </Link>
              <span className="studio-block__meta">{spec.typology}</span>
              <div className="mt-1.5">
                <RegistryBadge character={character} lang={language} />
              </div>
            </div>
          )}

          <div className="studio-block">
            <span className="studio-block__key">{t.studio.derivedFrom}</span>
            <ul className="prov-sources">
              {spec.provenance.derivedFrom.flatMap((d) =>
                d.citations.map((c, i) => {
                  const src = sourceById(c.sourceId);
                  const title = src ? (language === "ar" && src.titleAr ? src.titleAr : src.title) : c.sourceId;
                  return (
                    <li key={d.elementId + i} className="prov-sources__item">
                      {src?.locator ? (
                        <a href={src.locator} target="_blank" rel="noopener noreferrer" dir="auto">
                          {title}
                        </a>
                      ) : (
                        <span dir="auto">{title}</span>
                      )}
                    </li>
                  );
                }),
              )}
            </ul>
          </div>

          <div className="studio-block">
            <span className="studio-block__key">{t.studio.issues}</span>
            {lint.errors.length === 0 && lint.warnings.length === 0 ? (
              <p className="studio-block__note" dir="auto">
                {t.studio.noIssues}
              </p>
            ) : (
              <ul className="studio-issues">
                {lint.errors.map((e, i) => (
                  <li key={"e" + i} className="studio-issues__item is-error" dir="auto">
                    {e.message}
                  </li>
                ))}
                {lint.warnings.map((w, i) => (
                  <li key={"w" + i} className="studio-issues__item" dir="auto">
                    {w.message}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {build && (
            <div className="studio-block">
              <span className="studio-block__key">{t.studio.geometry}</span>
              <span className="studio-block__meta">
                {build.triangles.toLocaleString()} {t.studio.triangles} · {build.meshes} {t.studio.meshes} ·{" "}
                {t.studio.buildTime} {build.ms}ms
              </span>
              {build.unbuilt.length > 0 && (
                <>
                  <span className="studio-block__key mt-2">{t.studio.unbuilt}</span>
                  <span className="studio-block__meta">{build.unbuilt.join(", ")}</span>
                  <p className="studio-block__note" dir="auto">
                    {t.studio.unbuiltNote}
                  </p>
                </>
              )}
            </div>
          )}
        </aside>
      </div>
    </CorpusShell>
  );
}
