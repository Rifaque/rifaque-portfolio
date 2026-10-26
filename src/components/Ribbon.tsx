import { useEffect, useMemo, useRef, type CSSProperties, type KeyboardEvent, type MouseEvent } from "react";
import type { Project } from "../content/types";
import { COMPACT_SHAPE, DESKTOP_SHAPE, poses, poseTransform, type RibbonShape } from "../lib/ribbon";
import { Illustration } from "./Illustration";

type Props = {
  projects: Project[];
  selected: number;
  onSelect: (i: number) => void;
  onOpen: (i: number, trigger: HTMLElement) => void;
};

/** Keep equal to the compact media query in home.css. */
const COMPACT_QUERY = "(max-width: 760px), (max-aspect-ratio: 4 / 5)";
const pad = (i: number) => String(i + 1).padStart(2, "0");
const reducedMotion = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
/**
 * Input modality: focus that follows a pointer press must not select (the
 * click does that); keyboard and programmatic focus do. Tracked directly
 * because :focus-visible is not reliable inside focus handlers in every engine.
 */
let pointerModality = false;
if (typeof window !== "undefined") {
  window.addEventListener("pointerdown", () => (pointerModality = true), true);
  window.addEventListener("keydown", () => (pointerModality = false), true);
}
/** Plain clicks are ours; modified clicks keep the link's native behaviour. */
const isPlainClick = (e: MouseEvent) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

/**
 * The connected ribbon, drawn as a receding corridor. The DOM is the only
 * interactive surface: every segment is a real link to the project's case
 * study, so the ribbon works without JavaScript. With JavaScript, a plain click
 * on another segment selects it and a click on the selected segment opens
 * the dossier.
 *
 * Two materials: a project with a real interface is a lit screen; a project
 * explained by a diagram is a paper plate (which becomes the paper dossier).
 *
 * The initial pose is rendered on the server (positions are in units of
 * --seg-w, set by CSS), so the band is right before hydration. After that,
 * poses are written imperatively, and requestAnimationFrame runs only while
 * the selection is settling or being dragged.
 */
export function Ribbon({ projects, selected, onSelect, onOpen }: Props) {
  const n = projects.length;
  const initial = useMemo(() => poses(n, selected), []); // server and first client render agree
  const segRefs = useRef<(HTMLLIElement | null)[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);
  const st = useRef({ s: selected, target: selected, raf: 0, last: 0, dragging: false, shape: DESKTOP_SHAPE as RibbonShape, suppress: false });

  const layout = (s: number) => {
    poses(n, s, st.current.shape).forEach((p, i) => {
      const el = segRefs.current[i];
      if (!el) return;
      el.style.transform = poseTransform(p);
      el.style.setProperty("--shade", p.shade.toFixed(3));
    });
  };

  const frame = (now: number) => {
    const o = st.current;
    const dt = Math.min(64, now - (o.last || now));
    o.last = now;
    if (!o.dragging) {
      o.s = o.target + (o.s - o.target) * Math.exp(-dt / 130);
      if (Math.abs(o.s - o.target) < 0.0008) o.s = o.target;
    }
    layout(o.s);
    if (o.dragging || o.s !== o.target) o.raf = requestAnimationFrame(frame);
    else {
      o.raf = 0;
      o.last = 0;
    }
  };
  const kick = () => {
    if (!st.current.raf) st.current.raf = requestAnimationFrame(frame);
  };
  /** Selections that start here update the target at once, so a key pressed before React re-renders sees it. */
  const select = (i: number) => {
    st.current.target = i;
    onSelect(i);
  };

  // Compact screens use their own fold; follow the media query.
  useEffect(() => {
    const mq = matchMedia(COMPACT_QUERY);
    const apply = () => {
      st.current.shape = mq.matches ? COMPACT_SHAPE : DESKTOP_SHAPE;
      layout(st.current.s);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      cancelAnimationFrame(st.current.raf);
      st.current.raf = 0;
    };
  }, []);

  // Follow the selection.
  useEffect(() => {
    const o = st.current;
    if (o.target === selected && o.s === selected) return;
    o.target = selected;
    const seg = segRefs.current[selected];
    if (seg && !reducedMotion()) {
      seg.classList.remove("swept");
      void seg.offsetWidth;
      seg.classList.add("swept");
    }
    if (reducedMotion()) {
      o.s = selected;
      layout(selected);
    } else kick();
  }, [selected]);

  // Horizontal drag and swipe. touch-action: pan-y leaves vertical scrolling to the browser.
  useEffect(() => {
    const stage = stageRef.current!;
    let start: { x: number; y: number; s: number; id: number; w: number } | null = null;
    let vel = 0, lastX = 0, lastT = 0;
    const down = (e: PointerEvent) => {
      if (e.button > 0) return;
      start = { x: e.clientX, y: e.clientY, s: st.current.s, id: e.pointerId, w: segRefs.current[0]?.offsetWidth || 600 };
      lastX = e.clientX;
      lastT = performance.now();
      vel = 0;
    };
    const move = (e: PointerEvent) => {
      const o = st.current;
      if (!start || e.pointerId !== start.id) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (!o.dragging) {
        if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
        o.dragging = true;
        stage.setPointerCapture(e.pointerId);
        stage.classList.add("dragging");
        kick();
      }
      const now = performance.now();
      vel = (e.clientX - lastX) / Math.max(1, now - lastT);
      lastX = e.clientX;
      lastT = now;
      o.s = Math.max(-0.35, Math.min(n - 0.65, start.s - dx / (start.w * 0.8)));
    };
    const up = () => {
      const o = st.current;
      if (o.dragging) {
        o.dragging = false;
        stage.classList.remove("dragging");
        o.suppress = true;
        setTimeout(() => (o.suppress = false), 0);
        const next = Math.max(0, Math.min(n - 1, Math.round(o.s - vel * 0.35)));
        o.target = next;
        kick();
        onSelect(next);
      }
      start = null;
    };
    let wheelAcc = 0, wheelLock = 0;
    const wheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; // vertical wheel scrolls the page
      e.preventDefault();
      if (performance.now() < wheelLock) return;
      wheelAcc += e.deltaX;
      if (Math.abs(wheelAcc) > 50) {
        select(Math.max(0, Math.min(n - 1, st.current.target + Math.sign(wheelAcc))));
        wheelAcc = 0;
        wheelLock = performance.now() + 380;
      }
    };
    stage.addEventListener("pointerdown", down);
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerup", up);
    stage.addEventListener("pointercancel", up);
    stage.addEventListener("wheel", wheel, { passive: false });
    return () => {
      stage.removeEventListener("pointerdown", down);
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerup", up);
      stage.removeEventListener("pointercancel", up);
      stage.removeEventListener("wheel", wheel);
    };
  }, [n, onSelect]);

  const click = (i: number) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (!isPlainClick(e)) return;
    e.preventDefault();
    if (st.current.suppress) return;
    if (i !== st.current.target) select(i);
    else onOpen(i, e.currentTarget);
  };

  const keydown = (e: KeyboardEvent<HTMLOListElement>) => {
    const t = st.current.target;
    const map: Record<string, number> = { ArrowLeft: t - 1, ArrowRight: t + 1, Home: 0, End: n - 1 };
    if (!(e.key in map)) return;
    e.preventDefault();
    const next = Math.max(0, Math.min(n - 1, map[e.key]));
    select(next);
    segRefs.current[next]?.querySelector<HTMLAnchorElement>(".seg-hit")?.focus({ preventScroll: true });
  };

  return (
    <div className="stage" ref={stageRef}>
      <ol className="band" onKeyDown={keydown} aria-label="Selected work. Arrow keys move along the ribbon.">
        {projects.map((p, i) => {
          const m = p.media[0];
          const pose = initial[i];
          const screen = m.kind === "screenshot";
          return (
            <li
              key={p.slug}
              ref={(el) => {
                segRefs.current[i] = el;
              }}
              data-origin={p.slug}
              className={`seg ${screen ? "seg--screen" : "seg--plate"}${i === selected ? " is-on" : ""}`}
              style={{ transform: poseTransform(pose), "--shade": pose.shade.toFixed(3) } as CSSProperties}
            >
              <span className="seg-edge" aria-hidden="true" />
              {screen ? (
                <div className="seg-face" aria-hidden="true">
                  <img src={m.src} srcSet={m.srcSet} sizes="(max-width: 760px) 86vw, 62vw" width={m.width} height={m.height} alt="" draggable={false} decoding="async" />
                  <div className="screen-bar">
                    <span className="seg-index">{pad(i)}</span>
                    <span className="seg-title">{p.title}</span>
                  </div>
                </div>
              ) : (
                <div className="seg-face plate" aria-hidden="true">
                  <div className="plate-head">
                    <span className="seg-index">{pad(i)}</span>
                    <span className="seg-title">{p.title}</span>
                  </div>
                  <div className="plate-art">
                    <Illustration id={m.id} live />
                  </div>
                </div>
              )}
              <span className="seg-tag" aria-hidden="true">
                {screen ? "Screenshot" : "Illustration"}
              </span>
              <span className="seg-node seg-node--top" aria-hidden="true" />
              <span className="seg-node seg-node--bottom" aria-hidden="true" />
              <span className="seg-sweep" aria-hidden="true" />
              <span className="seg-shade" aria-hidden="true" />
              <a
                className="seg-hit"
                data-focus-for={p.slug}
                href={`/work/${p.slug}`}
                onClick={click(i)}
                onFocus={() => {
                  if (!pointerModality) select(i);
                }}
                aria-label={`${p.title}: ${p.kicker}. ${p.status}. ${screen ? "Screenshot" : "Illustration"}.`}
                aria-current={i === selected ? "true" : undefined}
                draggable={false}
              />
            </li>
          );
        })}
      </ol>
    </div>
  );
}
