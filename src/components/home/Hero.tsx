import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { site } from "../../content/site";
import { pick, selectedSlugs } from "../../content/projects";
import { StatusBadge } from "../StatusBadge";
import { fit, ribbonPath } from "../motion/ribbonGeometry";

// The motif is the ribbon's own run and exit curve, fitted into the hero's
// upper right (wide) or into a small static mark (compact). Two edges, a
// little apart, read as a band.
const wideMap = fit([0.22, 0.58], [1.1, -0.16], [0, 0.7], [1.02, -0.02]);
const WIDE = ribbonPath(1, wideMap);
const WIDE_ECHO = ribbonPath(1, wideMap, 0.035);
const COMPACT = ribbonPath(2, fit([0.74, 0.5], [1.1, -0.16], [0, 0.92], [1, 0.04]));

const stagger = (i: number) => ({ "--i": i }) as CSSProperties;

export function Hero() {
  const now = pick(selectedSlugs);
  return (
    <div className="hero-shell">
      <svg className="hero-motif hero-motif--wide" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path className="hero-line" d={WIDE} vectorEffect="non-scaling-stroke" />
        <path className="hero-line hero-line--echo" d={WIDE_ECHO} vectorEffect="non-scaling-stroke" />
      </svg>
      <svg className="hero-motif hero-motif--compact" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path className="hero-line" d={COMPACT} vectorEffect="non-scaling-stroke" />
      </svg>

      <section className="hero container" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="kicker hero-kicker">
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
            {now.map((p, i) => (
              <li key={p.slug} style={stagger(i + 1)}>
                <Link to={`/work/${p.slug}`} className="now-item">
                  <span className="now-name">{p.title}</span>
                  <StatusBadge stage={p.stage} text={p.status} className="now-status" />
                </Link>
              </li>
            ))}
            <li style={stagger(now.length + 1)}>
              <Link to="/#experience" className="now-item">
                <span className="now-name">HubZero</span>
                <StatusBadge stage="role" text="Co-founder & Software Engineer · since Jan 2025" className="now-status" />
              </Link>
            </li>
          </ul>
        </aside>
      </section>
    </div>
  );
}
