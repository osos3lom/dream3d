/** The viewer for procedurally built designs.
 *
 *  Deliberately separate from `Viewer`. That component is 400 lines of
 *  exhibit-specific behaviour — GLB loading with progress, neighbour
 *  prefetching, a tool rail bound to an `Empire` — none of which a generated
 *  design needs, and all of which would have to grow a second code path to
 *  accommodate one. What the two genuinely share is the engine and the hotspot
 *  layer, and both of those are reused here directly.
 *
 *  The rebuild policy is the interesting part. Dragging a slider produces a new
 *  spec on every frame, and a full pipeline pass per tick would be unusable:
 *  `computeBoundsTree` blocks the main thread and `warm` renders the group
 *  off-screen. So while scrubbing the geometry is adopted without either and
 *  swapped in place; on release one full pass runs so pins and occlusion come
 *  back. */

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { ViewerEngine, type Framing, type LoadedModel } from "@/three/engine";
import { HotspotLayer } from "@/components/HotspotLayer";
import { buildDesign } from "@/three/parametric/build";
import { specKey, specToFraming } from "@/lib/studio/framing";
import type { FacadeSpec } from "@/lib/studio/schema";
import type { Language } from "@/types/i18n";

export interface BuildInfo {
  triangles: number;
  meshes: number;
  unbuilt: string[];
  ms: number;
}

interface Props {
  spec: FacadeSpec;
  lang: Language;
  reducedMotion?: boolean;
  /** True while a control is being dragged: skip the expensive passes. */
  scrubbing?: boolean;
  onBuilt?: (info: BuildInfo) => void;
  onError?: (message: string) => void;
}

export const StudioViewer = memo(function StudioViewer({
  spec,
  lang,
  reducedMotion = false,
  scrubbing = false,
  onBuilt,
  onError,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<ViewerEngine | null>(null);
  const requestRef = useRef(0);
  const firstRef = useRef(true);

  const [ready, setReady] = useState(false);
  const [framing, setFraming] = useState<Framing | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [markersVisible, setMarkersVisible] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new ViewerEngine(canvas);
    engineRef.current = engine;
    let cancelled = false;
    engine
      .init()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((e) => onError?.(String(e?.message ?? e)));
    return () => {
      cancelled = true;
      engine.dispose();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    engineRef.current?.setReducedMotion(reducedMotion);
  }, [reducedMotion, ready]);

  const present = useCallback(
    async (next: FacadeSpec, fast: boolean) => {
      const engine = engineRef.current;
      if (!engine) return;
      const token = ++requestRef.current;
      const key = specKey(next);
      const nextFraming = specToFraming(next, lang);

      let model: LoadedModel;
      const started = performance.now();
      try {
        const built = buildDesign(next, key);
        model = await engine.adopt(built.group, key, {
          // Both are expensive and neither is needed until the drag ends.
          bvh: !fast,
          warm: !fast,
          framing: nextFraming,
        });
        onBuilt?.({
          triangles: built.triangles,
          meshes: built.group.children.length,
          unbuilt: built.unbuilt,
          ms: Math.round(performance.now() - started),
        });
      } catch (e) {
        onError?.(String((e as Error)?.message ?? e));
        return;
      }
      // A newer spec won while this one was being built.
      if (token !== requestRef.current) return;

      setFraming(nextFraming);
      if (firstRef.current) {
        firstRef.current = false;
        engine.present(model);
        engine.frameEmpire(nextFraming, false);
        setMarkersVisible(true);
      } else {
        // No turntable spin: the design is being adjusted, not replaced.
        engine.swapInPlace(model);
        if (!fast) setMarkersVisible(true);
      }
    },
    [lang, onBuilt, onError],
  );

  useEffect(() => {
    if (!ready) return;
    if (scrubbing) setMarkersVisible(false);
    void present(spec, scrubbing);
  }, [spec, ready, scrubbing, present]);

  return (
    <div ref={containerRef} className="atlas-card viewer-stage relative h-full w-full overflow-hidden">
      <canvas ref={canvasRef} className="block h-full w-full" />
      {framing && (
        <HotspotLayer
          engine={ready ? engineRef.current : null}
          framing={framing}
          containerRef={containerRef}
          activeId={activeId}
          hoverId={hoverId}
          onHover={setHoverId}
          onActivate={setActiveId}
          visible={markersVisible}
          lang={lang}
        />
      )}
      {/* Generated geometry is never on screen without saying so. The ribbon
          stays for as long as the design does, and is deliberately words rather
          than an icon — a screenshot has to carry the label with it. */}
      <div className="interp-ribbon" dir="auto">
        {lang === "ar" ? "تفسير مولَّد — ليس أثراً تراثياً" : "Generated interpretation — not a heritage record"}
      </div>
    </div>
  );
});
