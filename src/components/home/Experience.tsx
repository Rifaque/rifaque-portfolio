import { Link } from "react-router-dom";
import { experiences } from "../../content/experience";
import { pick } from "../../content/projects";
import { ExternalLink } from "../ExternalLink";
import { StatusBadge } from "../StatusBadge";

export function Experience() {
  return (
    <section id="experience" className="section" aria-labelledby="experience-title">
      <div className="container">
        <header className="section-head">
          <h2 id="experience-title" className="h2">
            Experience
          </h2>
          <p>A studio I co-founded, and an internship on a production platform.</p>
        </header>

        <ol className="xp-list">
          {experiences.map((x) => (
            <li key={x.id} className="xp">
              <div className="xp-side">
                <h3 className="xp-company">{x.company}</h3>
                <p className="xp-role">{x.role}</p>
                <p className="xp-when">
                  {x.period}
                  <br />
                  {x.location}
                </p>
                {x.url && (
                  <ExternalLink href={x.url} className="text-link xp-url">
                    {x.url.replace("https://", "")}
                  </ExternalLink>
                )}
              </div>
              <div className="xp-main">
                <p className="xp-summary">{x.summary}</p>
                <ul className="xp-highlights">
                  {x.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>

                {x.work && (
                  <div className="xp-work">
                    <h4 className="tag">Work through {x.company}</h4>
                    <ul>
                      {pick(x.work).map((p) => (
                        <li key={p.slug} className="xp-card">
                          <p className="kicker">{p.kicker}</p>
                          <h5 className="xp-card-title">{p.title}</h5>
                          <StatusBadge stage={p.stage} text={p.status} />
                          <p className="xp-card-attr">{p.attribution}</p>
                          <p className="xp-card-period">{p.period}</p>
                          <Link to={`/work/${p.slug}`} className="text-link xp-card-link">
                            Read the {p.title} case study
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
