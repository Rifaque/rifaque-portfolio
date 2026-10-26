import { Link } from "react-router";
import { education, experience, principles, skills } from "../content/profile";
import { pick } from "../content/projects";
import { profiles, site } from "../content/site";
import { Status } from "../components/Glyph";

export default function About() {
  return (
    <div className="page">
      <header className="page-head">
        <p className="kicker">About</p>
        <h1 className="page-title">{site.displayName}</h1>
        <p className="page-lede">
          {site.positioning} {site.lede}
        </p>
        <p className="page-meta">
          {site.location} · {site.availability}
        </p>
      </header>

      <section className="page-sec" aria-labelledby="how-title">
        <h2 id="how-title">How I work</h2>
        <ol className="principles">
          {principles.map((pr, i) => (
            <li key={pr.title}>
              <span className="idx" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3>{pr.title}</h3>
              <p>{pr.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="page-sec" aria-labelledby="xp-title">
        <h2 id="xp-title">Experience</h2>
        <ol className="xp">
          {experience.map((x) => (
            <li key={x.id}>
              <div className="xp-side">
                <h3>{x.company}</h3>
                <p>{x.role}</p>
                <p className="mono">
                  {x.period}
                  <br />
                  {x.location}
                </p>
                {x.url && (
                  <a href={x.url} rel="noopener">
                    {x.url.replace("https://", "")}
                  </a>
                )}
              </div>
              <div>
                <p>{x.summary}</p>
                <ul className="limits limits--plain">
                  {x.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
                {x.work && (
                  <ul className="xp-work">
                    {pick(x.work).map((w) => (
                      <li key={w.slug}>
                        <Link to={`/work/${w.slug}`}>{w.title}</Link>
                        <Status stage={w.stage} text={w.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="page-sec" aria-labelledby="edu-title">
        <h2 id="edu-title">Education</h2>
        <dl className="facts facts--wide">
          <div>
            <dt>Degree</dt>
            <dd>
              {education.degree}, {education.period}
            </dd>
          </div>
          <div>
            <dt>Institution</dt>
            <dd>{education.institution}</dd>
          </div>
          <div>
            <dt>CGPA</dt>
            <dd>{education.cgpa}</dd>
          </div>
          <div>
            <dt>Final-year project</dt>
            <dd>
              <Link to={`/work/${education.finalYearProject}`}>QueryCraft</Link>, with a team of three
            </dd>
          </div>
          <div>
            <dt>Training</dt>
            <dd>{education.training}</dd>
          </div>
        </dl>
      </section>

      <section className="page-sec" aria-labelledby="skills-title">
        <h2 id="skills-title">Skills, with where they were used</h2>
        <dl className="stack">
          {skills.map((s) => (
            <div key={s.area}>
              <dt>{s.area}</dt>
              <dd>
                {s.items}
                <span className="evidence">Used in: {s.evidence}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="page-sec" aria-labelledby="reach-title">
        <h2 id="reach-title">Contact</h2>
        <p>
          Email is the quickest way to reach me: <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
        <div className="actions">
          <a className="btn" href={profiles.linkedin} rel="noopener">
            LinkedIn
          </a>
          <a className="btn" href={profiles.github} rel="noopener">
            GitHub
          </a>
          <a className="btn" href={site.resume}>
            Resume (PDF)
          </a>
        </div>
      </section>
    </div>
  );
}
