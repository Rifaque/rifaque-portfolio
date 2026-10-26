import { Link } from "react-router";
import { Status } from "../components/Glyph";
import type { Project } from "../content/types";
import { illustration } from "../lib/illustrations.js";
import { alsoScenes } from "../space/alsoScenes";
import { SpaceStage } from "../space/SpaceStage";

const ALSO = ["querycraft", "bluetap"];
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/**
 * Case study for the two Also built projects (QueryCraft, BlueTap) in the
 * accepted design's study layout: the project as a 3D object, its labelled
 * drawing, then what it is, how it works, decisions, limits, stack and links.
 */
export function StudyPage({ p, others }: { p: Project; others: Project[] }) {
  const lead = p.media[0];
  const other = others.find((o) => ALSO.includes(o.slug) && o.slug !== p.slug);
  const also = alsoScenes[p.slug];
  return (
    <article className="wrap study" aria-labelledby="st-title">
      <nav className="crumbs" aria-label="Breadcrumb">
        <ol>
          <li>
            <Link to="/#work">Projects</Link>
          </li>
          <li aria-current="page">{p.title}</li>
        </ol>
      </nav>

      <header className="st-head">
        <p className="st-kicker">{p.kicker}</p>
        <h1 className="st-title" id="st-title">
          {p.title}
        </h1>
        <Status stage={p.stage} text={p.status} />
        {p.question && <p className="st-q">{p.question}</p>}
        <dl className="st-meta">
          {p.period && (
            <div>
              <dt>Period</dt>
              <dd>{p.period}</dd>
            </div>
          )}
          <div>
            <dt>Ownership</dt>
            <dd>{p.ownership.label}</dd>
          </div>
          {/* A licence is shown only where it has been verified. */}
          {p.licence && (
            <div>
              <dt>Licence</dt>
              <dd>{p.licence}</dd>
            </div>
          )}
        </dl>
        {p.ownership.kind === "hubzero" && <p className="ro-credit">{p.ownership.credit}</p>}
      </header>

      {also && (
        <section className="st-3d" aria-label={`${p.title}, in 3D`}>
          <SpaceStage slug={`${p.slug}-object`} scene={also.scene} label={also.label} caption={also.scene.cap} ar={also.ar} className="psc-solo" />
        </section>
      )}

      {lead?.kind === "illustration" && (
        <figure className="st-fig">
          <div className="st-pic" dangerouslySetInnerHTML={{ __html: illustration(lead.id, lead.label) }} />
          <figcaption>
            <span className="tag">Illustration</span>
            <span>{lead.caption.replace(/^Illustration, not a screenshot\. /, "")}</span>
          </figcaption>
        </figure>
      )}

      <section className="st-cols" aria-labelledby="st-what">
        <h2 id="st-what">What it is</h2>
        <div className="st-text">
          <p>{p.summary}</p>
          {p.problem.map((t) => (
            <p key={t}>{t}</p>
          ))}
        </div>
      </section>

      {p.caseStudy.map((s) => (
        <section key={s.heading} className="st-cols" aria-labelledby={`st-${slugify(s.heading)}`}>
          <h2 id={`st-${slugify(s.heading)}`}>{s.heading}</h2>
          <div className="st-text">
            {s.body?.map((t) => (
              <p key={t}>{t}</p>
            ))}
            {s.list && (
              <ul className="st-limits">
                {s.list.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ))}

      <section className="st-cols" aria-labelledby="st-how">
        <h2 id="st-how">How it works</h2>
        <div className="st-dec">
          {p.how.map((h) => (
            <div key={h.title}>
              <h3>{h.title}</h3>
              <p>{h.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="st-cols" aria-labelledby="st-decisions">
        <h2 id="st-decisions">Decisions</h2>
        <div className="st-dec">
          {p.decisions.map((d) => (
            <div key={d.title}>
              <h3>{d.title}</h3>
              <p>{d.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="st-cols" aria-labelledby="st-stands">
        <h2 id="st-stands">Where it stands</h2>
        <div>
          <ul className="st-limits">
            {p.limits.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          {p.licenceNote && <p className="st-note">{p.licenceNote}</p>}
        </div>
      </section>

      <section className="st-cols" aria-labelledby="st-stack">
        <h2 id="st-stack">Stack</h2>
        <ul className="st-stack">
          {p.stack.map((s) => (
            <li key={s.name} title={s.why}>
              {s.name}
            </li>
          ))}
        </ul>
      </section>

      <section className="st-cols" aria-labelledby="st-links">
        <h2 id="st-links">Links</h2>
        <div>
          {p.links.length > 0 && (
            <div className="st-links">
              {p.links.map((l) => (
                <a key={l.href} className="btn btn-small" href={l.href} rel="noopener" data-sound="press">
                  {l.label}
                </a>
              ))}
            </div>
          )}
          {(p.linksNote || p.links.length === 0) && <p className="st-note">{p.linksNote ?? "No public links."}</p>}
        </div>
      </section>

      <nav className="st-next" aria-label="Other case studies">
        <Link to="/#work" data-sound="press">
          <small>Back to</small>Projects
        </Link>
        {other && (
          <Link to={`/work/${other.slug}`} data-sound="press">
            <small>Also built</small>
            {other.title}
          </Link>
        )}
      </nav>
    </article>
  );
}
