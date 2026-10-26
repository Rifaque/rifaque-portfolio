import { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router";
import { Status } from "../components/Glyph";
import { space, type CsSection, type SpaceProject, type Visual } from "./data";
import { soloScene } from "./stage3d";
import { SpaceStage } from "./SpaceStage";
import { AsideStrip, DiagramFigure, RichText, ShotFigure } from "./ui";

/**
 * A featured project's case study in the Project Space layout: a compact
 * introduction, the project's 3D scene, then sections with each visual beside
 * the text it explains, and status, limits and links at the end.
 */
export function SpaceCaseStudy({ sp }: { sp: SpaceProject }) {
  const p = sp.project;
  const cs = sp.caseStudy;
  const root = useRef<HTMLElement>(null);
  const i = space.indexOf(sp);
  const prev = space[(i - 1 + space.length) % space.length];
  const next = space[(i + 1) % space.length];

  // A diagram box that scrolls sideways (narrow screens) must be reachable by keyboard.
  useEffect(() => {
    const boxes = () => {
      root.current?.querySelectorAll<HTMLElement>(".psc-dia").forEach((box) => {
        if (box.scrollWidth > box.clientWidth + 1) {
          box.tabIndex = 0;
          box.setAttribute("role", "region");
          box.setAttribute("aria-label", `${box.querySelector("svg")?.getAttribute("aria-label") ?? "Diagram"} Scrolls sideways.`);
        } else {
          box.removeAttribute("tabindex");
          box.removeAttribute("role");
          box.removeAttribute("aria-label");
        }
      });
    };
    boxes();
    window.addEventListener("resize", boxes);
    return () => window.removeEventListener("resize", boxes);
  }, [sp.slug]);

  const facts: [string, string][] = [["Ownership", p.ownership.label], ...cs.facts];
  const aside = sp.scene.aside ? <AsideStrip kind={sp.scene.aside} /> : undefined;

  return (
    <article ref={root} className="psc" aria-labelledby="psc-title">
      <nav aria-label="Breadcrumb" className="crumbs">
        <ol>
          <li>
            <Link to={`/?project=${sp.slug}#work`}>Projects</Link>
          </li>
          <li aria-current="page">{p.title}</li>
        </ol>
      </nav>

      <header className="psc-intro">
        <div>
          <p className="psc-kicker">{cs.kicker}</p>
          <h1 id="psc-title">{p.title}</h1>
          <Status stage={p.stage} text={p.status} />
          <p className="psc-sum">{cs.summary}</p>
        </div>
        <dl className="psc-facts">
          {facts.map(([a, b]) => (
            <div key={a}>
              <dt>{a}</dt>
              <dd>{b}</dd>
            </div>
          ))}
          {p.licence && (
            <div>
              <dt>Licence</dt>
              <dd>{p.licence}</dd>
            </div>
          )}
        </dl>
      </header>

      <section className="psc-open" aria-label={`${p.title}, in 3D`}>
        <SpaceStage slug={sp.slug} scene={sp.scene} label={`${p.title}: ${cs.openLabel}`} caption={sp.scene.cap} aside={aside} />
      </section>

      {cs.sections.map((s) => (
        <Section key={s.id} sp={sp} s={s} />
      ))}

      <nav className="psc-next" aria-label="Other case studies">
        <Link to={`/work/${prev.slug}`}>
          <small>Previous</small>
          <b>{prev.project.title}</b>
        </Link>
        <Link to={`/?project=${sp.slug}#work`}>
          <small>Back to</small>
          <b>Projects</b>
        </Link>
        <Link to={`/work/${next.slug}`}>
          <small>Next</small>
          <b>{next.project.title}</b>
        </Link>
      </nav>
    </article>
  );
}

function Section({ sp, s }: { sp: SpaceProject; s: CsSection }) {
  const p = sp.project;
  const solo = !s.visual;
  return (
    <section className={`psc-sec${s.flip ? " flip" : ""}${solo ? " solo" : ""}`} aria-labelledby={`psc-${s.id}`}>
      <div className="psc-text">
        <h2 id={`psc-${s.id}`}>{s.heading}</h2>
        {s.status && <Status stage={p.stage} text={p.status} />}
        {s.quote && <p className="psc-q">{s.quote}</p>}
        {s.body?.map((t) => (
          <p key={t}>
            <RichText text={t} />
          </p>
        ))}
        {s.list && (
          <ul className="ps-works">
            {s.list.map((t) => (
              <li key={t}>
                <RichText text={t} />
              </li>
            ))}
          </ul>
        )}
        {s.after?.map((t) => (
          <p key={t}>
            <RichText text={t} />
          </p>
        ))}
        {s.status &&
          (p.links.length ? (
            <div className="psc-links">
              {p.links.map((l) => (
                <a key={l.href} className="ps-btn" href={l.href} rel="noopener">
                  {l.label}
                </a>
              ))}
            </div>
          ) : (
            <p className="psc-note">{s.linksNote ?? p.linksNote ?? "No public links."}</p>
          ))}
      </div>
      {s.visual && (
        <div className="psc-vis">
          <VisualBlock sp={sp} v={s.visual} />
        </div>
      )}
    </section>
  );
}

function VisualBlock({ sp, v }: { sp: SpaceProject; v: Visual }) {
  if (v.type === "pair")
    return (
      <div className="psc-pair">
        {v.items.map((it, k) => (
          <VisualBlock key={k} sp={sp} v={it} />
        ))}
      </div>
    );
  if (v.type === "diagram") return <DiagramFigure id={v.id} caption={v.caption} />;
  if (v.type === "media") return <ShotFigure media={v.media} caption={v.caption} />;
  return <SoloStage sp={sp} v={v} />;
}

function SoloStage({ sp, v }: { sp: SpaceProject; v: Extract<Visual, { type: "stage" }> }) {
  const scene = useMemo(() => soloScene(sp.scene, v.only, v.w, v.pw), [sp.scene, v.only, v.w, v.pw]);
  return <SpaceStage slug={`${sp.slug}-${v.only}`} scene={scene} label={`${sp.project.title}: ${v.label}`} caption={[[v.kind, v.caption]]} ar={v.ar} className="psc-solo" />;
}
