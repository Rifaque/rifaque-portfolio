import { Link } from "react-router-dom";
import { site } from "../../content/site";
import { pick, selectedSlugs } from "../../content/projects";
import { StatusLine } from "../StatusLine";

export function Hero() {
  const now = pick(selectedSlugs);
  return (
    <section className="hero container" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="kicker">
          {site.person} <span aria-hidden="true">·</span> {site.name}
        </p>
        <h1 id="hero-title" className="hero-title">
          Product-minded engineer building full‑stack software and <em>practical AI systems</em>.
        </h1>
        <p className="hero-lede">
          I build local-first AI tools, developer systems and client products, from the architecture to the servers
          they run on, and I say plainly what each one does not do yet.
        </p>
        <div className="hero-actions">
          <Link to="/#work" className="btn btn--primary">
            See selected work
          </Link>
          <a href={site.resume} className="btn">
            Resume (PDF)
          </a>
          <a href={`mailto:${site.email}`} className="text-link hero-email">
            {site.email}
          </a>
        </div>
        <p className="hero-meta">
          {site.location} · {site.availability}
        </p>
      </div>

      <aside id="now" className="now" aria-labelledby="now-title">
        <h2 id="now-title" className="tag now-title">
          Right now
        </h2>
        <ul className="now-list">
          {now.map((p) => (
            <li key={p.slug}>
              <Link to={`/work/${p.slug}`} className="now-item">
                <span className="now-name">{p.title}</span>
                <StatusLine project={p} className="now-status" />
              </Link>
            </li>
          ))}
          <li>
            <Link to="/#experience" className="now-item">
              <span className="now-name">HubZero</span>
              <span className="status now-status">
                <span className="dot dot--active" aria-hidden="true" />
                Co-founder & Software Engineer · since Jan 2025
              </span>
            </Link>
          </li>
        </ul>
      </aside>
    </section>
  );
}
