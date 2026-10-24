import { Link, useParams } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { ExternalLink } from "../components/ExternalLink";
import { StatusBadge } from "../components/StatusBadge";
import { ProjectFigure } from "../components/work/ProjectFigure";
import { ProjectMedia } from "../components/work/ProjectMedia";
import { caseStudySlugs, pick, projectBySlug } from "../content/projects";
import NotFound from "./NotFound";

const caseStudies = pick(caseStudySlugs);

export default function WorkPage() {
  const { slug = "" } = useParams();
  const p = projectBySlug(slug);
  if (!p || !(caseStudySlugs as readonly string[]).includes(p.slug)) return <NotFound />;

  const i = caseStudies.findIndex((c) => c.slug === p.slug);
  const next = caseStudies[(i + 1) % caseStudies.length];
  const backTo = p.attribution ? "/#experience" : `/#work-${p.slug}`;

  return (
    <Layout>
      <article className="cs" aria-labelledby="cs-title">
        <header className="container cs-head">
          <nav aria-label="Breadcrumb" className="crumbs">
            <ol>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to={backTo}>{p.attribution ? "Experience" : "Selected work"}</Link>
              </li>
              <li aria-current="page">{p.title}</li>
            </ol>
          </nav>
          <p className="kicker">{p.kicker}</p>
          <h1 id="cs-title" className="cs-title">
            {p.title}
          </h1>
          <StatusBadge stage={p.stage} text={p.status} className="cs-status" />
          {p.question && <p className="cs-question">{p.question}</p>}
          <p className="cs-summary">{p.summary}</p>
          {p.attribution && <p className="cs-attribution">{p.attribution}</p>}
          <dl className="cs-facts">
            <div>
              <dt>Role</dt>
              <dd>{p.role}</dd>
            </div>
            <div>
              <dt>Period</dt>
              <dd>{p.period}</dd>
            </div>
            <div>
              <dt>Stack</dt>
              <dd>{p.stack.join(" · ")}</dd>
            </div>
          </dl>
          {p.links.length > 0 && (
            <ul className="cs-links">
              {p.links.map((l) => (
                <li key={l.href}>
                  <ExternalLink href={l.href} className="btn">
                    {l.label}
                  </ExternalLink>
                </li>
              ))}
            </ul>
          )}
        </header>

        {(p.diagramLabel || p.media) && (
          <div className="container cs-visuals">
            <ProjectFigure project={p} />
            {p.media && <ProjectMedia media={p.media} className="cs-media" sizes="(min-width: 1100px) 60vw, 92vw" eager />}
          </div>
        )}

        <div className="container cs-body">
          {p.sections.map((s) => (
            <section key={s.heading} className="cs-section" aria-labelledby={`cs-${slugify(s.heading)}`}>
              <h2 id={`cs-${slugify(s.heading)}`} className="cs-h2">
                {s.heading}
              </h2>
              <div className="cs-prose">
                {s.body?.map((para) => <p key={para}>{para}</p>)}
                {s.list && (
                  <ul>
                    {s.list.map((li) => (
                      <li key={li}>{li}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}

          <aside className="cs-limits" aria-labelledby="cs-limits-title">
            <h2 id="cs-limits-title" className="tag">
              In one line: the limits
            </h2>
            <p>{p.limits}</p>
          </aside>
        </div>

        <nav className="container cs-next" aria-label="More case studies">
          <p className="tag">Next case study</p>
          <Link to={`/work/${next.slug}`} className="cs-next-link">
            <span className="cs-next-title">{next.title}</span>
            <span className="cs-next-kicker">{next.kicker}</span>
          </Link>
        </nav>
      </article>
    </Layout>
  );
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
