import { useEffect, useRef, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import type { Project } from "../../content/projects";
import { StatusBadge } from "../../components/StatusBadge";
import { FieldDiagram } from "../../components/work/FieldDiagram";
import { ribbonPath } from "../../components/motion/ribbonGeometry";
import { firstSentence, scrollSteps } from "./ribbonLayout";
import { startRibbon, RIBBON_QUERY } from "./ribbonController";
import "./ribbon.css";

const PATH = ribbonPath();

/**
 * Experimental project ribbon (/lab only). One DOM serves two layouts, and
 * CSS decides which (ribbon.css, the same query as RIBBON_QUERY): a pinned
 * stage where scrolling carries the cards along the ribbon path, or a static
 * editorial list for narrow or short windows, reduced motion and no
 * JavaScript. Reading order is the DOM order in both.
 */
export function ProjectRibbon({ projects }: { projects: Project[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;
    const mq = window.matchMedia(RIBBON_QUERY);
    let stop: (() => void) | null = null;
    const sync = () => {
      stop?.();
      stop = mq.matches ? startRibbon({ track, stage, counter: counterRef.current }) : null;
    };
    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      stop?.();
    };
  }, [projects.length]);

  const steps = { "--ribbon-steps": scrollSteps(projects.length) } as CSSProperties;

  return (
    <section className="ribbon" aria-labelledby="ribbon-title">
      <header className="container ribbon-head">
        <p className="kicker">Experiment · not on the homepage</p>
        <h2 id="ribbon-title" className="h2">
          Project ribbon
        </h2>
        <p className="ribbon-intro">
          A prototype of the homepage project presentation. Scrolling carries each project along one continuous line;
          the project nearest the centre is the active one. On narrow windows, with reduced motion or without
          JavaScript, the same projects are a plain list.
        </p>
      </header>

      <div ref={trackRef} className="ribbon-track" style={steps}>
        <div ref={stageRef} className="ribbon-stage">
          <svg className="ribbon-path" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <path d={PATH} vectorEffect="non-scaling-stroke" />
          </svg>
          <ol className="ribbon-cards">
            {projects.map((p, i) => (
              <li key={p.slug} className="ribbon-card" data-index={i} style={{ "--i": i } as CSSProperties}>
                <RibbonCard project={p} index={i} />
              </li>
            ))}
          </ol>
          <p className="ribbon-counter" aria-hidden="true">
            <span ref={counterRef}>01</span> / {String(projects.length).padStart(2, "0")}
          </p>
        </div>
      </div>
    </section>
  );
}

function RibbonCard({ project: p, index }: { project: Project; index: number }) {
  const titleId = `ribbon-${p.slug}-title`;
  return (
    <article className="ribbon-article" aria-labelledby={titleId}>
      {p.media ? (
        <figure className="ribbon-visual">
          <img
            src={p.media.src}
            srcSet={p.media.srcSet}
            sizes="(min-width: 1024px) 420px, 92vw"
            width={p.media.width}
            height={p.media.height}
            alt={p.media.alt}
            loading="lazy"
            decoding="async"
          />
          <figcaption className="tag">Screenshot</figcaption>
        </figure>
      ) : (
        <figure className="ribbon-visual ribbon-visual--diagram">
          <div className="lf-canvas--raised">
            <FieldDiagram active={p.slug} label={p.diagramLabel ?? p.title} />
          </div>
          {/* One word, so a card overlapping it mid-handoff can never leave
              "screenshot" showing on an illustration. */}
          <figcaption className="tag">Illustration</figcaption>
        </figure>
      )}
      <div className="ribbon-copy">
        <p className="kicker">
          <span className="kicker-index">{String(index + 1).padStart(2, "0")}</span>
          {p.kicker}
        </p>
        <h3 id={titleId} className="ribbon-title">
          {p.title}
        </h3>
        <StatusBadge stage={p.stage} text={p.status} />
        {p.question && <p className="ribbon-question">{p.question}</p>}
        <p className="ribbon-limit">
          <span className="tag">Limits</span> {firstSentence(p.limits)}
        </p>
        <Link to={`/work/${p.slug}`} className="text-link ribbon-link">
          Read the {p.title} case study
        </Link>
      </div>
    </article>
  );
}
