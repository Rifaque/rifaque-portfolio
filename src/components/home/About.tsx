import { Link } from "react-router-dom";
import { education, perspective } from "../../content/experience";

export function About() {
  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <div className="container">
        <header className="section-head">
          <h2 id="about-title" className="h2">
            How I work
          </h2>
          <p>The habits the projects above have in common.</p>
        </header>
        <ol className="principles">
          {perspective.map((item, i) => (
            <li key={item.title} className="principle">
              <span className="kicker-index principle-index" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="principle-title">{item.title}</h3>
              <p>{item.body}</p>
            </li>
          ))}
        </ol>

        <section className="edu" aria-labelledby="edu-title">
          <h3 id="edu-title" className="tag">
            Education
          </h3>
          <dl className="edu-list">
            <div>
              <dt>{education.degree}</dt>
              <dd>
                {education.institution} · {education.period}
              </dd>
            </div>
            <div>
              <dt>CGPA</dt>
              <dd>{education.cgpa}</dd>
            </div>
            <div>
              <dt>Final-year project</dt>
              <dd>
                <Link to={`/work/${education.finalYearProject}`} className="text-link">
                  QueryCraft
                </Link>
                , a three-person team
              </dd>
            </div>
            <div>
              <dt>Training</dt>
              <dd>{education.training}</dd>
            </div>
          </dl>
        </section>
      </div>
    </section>
  );
}
