import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { Project } from "../../content/projects";
import { FieldDiagram } from "./FieldDiagram";
import { ProjectFigure } from "./ProjectFigure";
import { ProjectMedia } from "./ProjectMedia";
import { ProjectText } from "./ProjectText";
import { StatusGlyph } from "../StatusBadge";

type Props = {
  projects: Project[];
  /** Review override for /lab. Production always uses "auto". */
  layout?: "auto" | "pinned" | "stacked";
};

/**
 * The signature section. One DOM serves both layouts, and CSS decides which
 * one applies (work.css, the PIN media query): the pinned stage on a large,
 * tall window with motion allowed, the stacked editorial list everywhere
 * else, including with JavaScript off. There is no client-side layout swap,
 * so the prerendered HTML is already the final layout.
 *
 * In the pinned layout the copy scrolls in ordinary document flow and only
 * the stage is sticky. The project whose band crosses the middle of the
 * viewport is the active one, so the scrollbar stays the single source of
 * truth: reading, Tab, find-in-page and the index rail all move the page,
 * and the stage follows.
 */
export function SelectedWork({ projects, layout = "auto" }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const bandRefs = useRef<(HTMLElement | null)[]>([]);
  const headingRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const railRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);

  // A one-pixel line across the middle of the viewport. Native, cheap, and
  // recalculated by the browser on resize and orientation change.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    bandRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [projects.length]);

  // Progress line: one transform write per frame while scrolling.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const track = trackRef.current;
      const fill = fillRef.current;
      if (!track || !fill || fill.offsetParent === null) return;
      const r = track.getBoundingClientRect();
      const mid = window.innerHeight / 2;
      const p = Math.min(1, Math.max(0, (mid - r.top) / Math.max(1, r.height)));
      fill.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const goTo = (i: number) => {
    const band = bandRefs.current[i];
    if (!band) return;
    const top = band.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: "smooth" });
    // Focus the project so the next Tab reaches its links, without a second,
    // competing scroll.
    headingRefs.current[i]?.focus({ preventScroll: true });
  };

  const onRailKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const last = projects.length - 1;
    const keys: Record<string, number> = {
      ArrowDown: Math.min(i + 1, last),
      ArrowRight: Math.min(i + 1, last),
      ArrowUp: Math.max(i - 1, 0),
      ArrowLeft: Math.max(i - 1, 0),
      Home: 0,
      End: last,
    };
    if (!(e.key in keys)) return;
    e.preventDefault();
    railRefs.current[keys[e.key]]?.focus();
  };

  const current = projects[active];

  return (
    <div className="sw" data-layout={layout} ref={trackRef}>
      <div className="sw-bands">
        {projects.map((p, i) => (
          <article
            key={p.slug}
            id={`work-${p.slug}`}
            data-index={i}
            data-active={i === active}
            ref={(el) => (bandRefs.current[i] = el)}
            className="sw-band"
            aria-labelledby={`work-${p.slug}-title`}
          >
            <div className="sw-text">
              <ProjectText
                project={p}
                index={i}
                headingId={`work-${p.slug}-title`}
                headingRef={(el) => (headingRefs.current[i] = el)}
              />
            </div>
            {/* Stacked layout only; hidden (and out of the accessibility
                tree) while the pinned stage is showing. */}
            <div className="sw-visual">
              <ProjectFigure project={p} />
              {p.media && <ProjectMedia media={p.media} className="sw-media" sizes="(min-width: 900px) 45vw, 92vw" />}
            </div>
          </article>
        ))}
      </div>

      <div className="sw-stage-col">
        <div className="sw-stage">
          <figure className="sw-frame">
            <div className="sw-canvas">
              <FieldDiagram active={current.slug} slugs={projects.map((p) => p.slug)} label={current.diagramLabel ?? current.title} />
              {projects.map((p) =>
                p.media ? (
                  <figure key={p.slug} className="sw-stage-media" data-on={p === current} aria-hidden={p !== current}>
                    <img
                      src={p.media.src}
                      srcSet={p.media.srcSet}
                      sizes="30vw"
                      width={p.media.width}
                      height={p.media.height}
                      alt={p.media.alt}
                      loading="lazy"
                      decoding="async"
                    />
                    <figcaption>{p.media.caption}</figcaption>
                  </figure>
                ) : null,
              )}
            </div>
            <figcaption className="sw-caption">
              <span className="tag">
                {current.media ? "Diagram: illustration · Image: real screenshot" : "Illustration, not a screenshot"}
              </span>
              <span className="sw-caption-name">{current.title}</span>
            </figcaption>
          </figure>

          <nav className="sw-rail" aria-label="Selected work index">
            <div className="sw-progress" aria-hidden="true">
              <div ref={fillRef} className="sw-progress-fill" />
            </div>
            <ol>
              {projects.map((p, i) => (
                <li key={p.slug}>
                  <button
                    type="button"
                    ref={(el) => (railRefs.current[i] = el)}
                    className="sw-rail-btn"
                    aria-current={i === active ? "true" : undefined}
                    onClick={() => goTo(i)}
                    onKeyDown={(e) => onRailKey(e, i)}
                  >
                    <span className="sw-rail-index">{String(i + 1).padStart(2, "0")}</span>
                    <span>{p.title}</span>
                    <StatusGlyph stage={p.stage} />
                    <span className="sr-only">, {p.status}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>
    </div>
  );
}
