import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { Scene, Kind } from "./data";
import { mount, reducedMotion, sceneHTML, watchBreakpoint, type Turn } from "./stage3d";
import { Caption } from "./ui";

/**
 * One 3D stage: the scene, an optional strip beneath it, the evidence caption
 * and a discreet Reset view that appears only once the scene has been turned.
 * The scene is prerendered as markup; on the client the stage engine takes it
 * over (rotation, cable, transitions between projects).
 */
export function SpaceStage({
  slug,
  scene,
  label,
  caption,
  aside,
  ar,
  className = "",
}: {
  slug: string;
  scene: Scene;
  label: string;
  caption: [Kind | null, string][];
  aside?: ReactNode;
  /** A fixed aspect ratio, for a single object on its own stage. */
  ar?: string;
  className?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const turn = useRef<Turn | null>(null);
  const first = useRef(true);
  // The prerendered scene; React never touches this markup again.
  const [initial] = useState(() => ({ __html: sceneHTML(slug, label, scene) }));

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const animate = !first.current && !reducedMotion();
    first.current = false;
    turn.current = mount(el, slug, label, scene, {
      animate,
      onTurn: (t) => {
        if (wrap.current) wrap.current.dataset.turned = String(t);
      },
    });
    if (animate) {
      wrap.current?.querySelectorAll(".ps-aside, .ps-cap").forEach((n) => n.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, delay: 380, easing: "ease-out", fill: "backwards" }));
    }
    // The label follows the slug, so it is not a dependency of its own.
  }, [slug, scene]);

  useEffect(() => {
    const stop = watchBreakpoint();
    return () => {
      stop();
      turn.current?.destroy();
    };
  }, []);

  const reset = () => {
    turn.current?.reset();
    // Reset hides itself, so focus moves to the scene rather than being lost.
    host.current?.querySelector<HTMLElement>(".ps-scene:not(.leaving)")?.focus({ preventScroll: true });
  };

  return (
    <div ref={wrap} className={`ps-stage ${className}`} data-turned="false">
      <div ref={host} className="ps-stage3" style={ar ? ({ "--sar": ar } as CSSProperties) : undefined} dangerouslySetInnerHTML={initial} suppressHydrationWarning />
      {aside && <div className="ps-aside">{aside}</div>}
      <div className="ps-stage-foot">
        <Caption items={caption} />
        <button type="button" className="ps-reset" onClick={reset}>
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M4.6 10a5.4 5.4 0 1 0 1.7-3.9" />
            <path d="M4 4.5v3.6h3.6" />
          </svg>
          <span className="ps-reset-text">Reset view</span>
        </button>
      </div>
    </div>
  );
}
