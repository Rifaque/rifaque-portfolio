import { Link } from "react-router-dom";
import { profiles, site, support } from "../../content/site";
import { ExternalLink } from "../ExternalLink";
import { primaryNav } from "../../content/nav";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer-inner">
        <div className="site-footer-id">
          <p className="brand">
            RSX <span>Develops</span>
          </p>
          <p className="site-footer-name">{site.person}</p>
          <p className="site-footer-note">{site.positioning}</p>
        </div>

        <nav aria-label="Footer" className="site-footer-nav">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            {primaryNav.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
          <ul>
            <li>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </li>
            <li>
              <ExternalLink href={profiles.github}>GitHub</ExternalLink>
            </li>
            <li>
              <ExternalLink href={profiles.linkedin}>LinkedIn</ExternalLink>
            </li>
            <li>
              <a href={site.resume}>Resume (PDF)</a>
            </li>
          </ul>
        </nav>

        <div className="site-footer-support">
          <p>If my open-source work is useful to you, you can support it:</p>
          <p>
            {support.map((s, i) => (
              <span key={s.href}>
                {i > 0 && <span aria-hidden="true"> · </span>}
                <ExternalLink href={s.href} className="text-link">
                  {s.label}
                </ExternalLink>
              </span>
            ))}
          </p>
        </div>

        <p className="site-footer-legal">
          © 2026 {site.person} · {site.name} is a personal identity, not a company.
        </p>
      </div>
    </footer>
  );
}
