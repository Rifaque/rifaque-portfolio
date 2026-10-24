import { pick, smallerSlugs } from "../../content/projects";
import { ExternalLink } from "../ExternalLink";
import { StatusLine } from "../StatusLine";

/** Small labelled illustrations. Not screenshots: neither app has a public build. */
const diagrams: Record<string, { label: string; svg: JSX.Element }> = {
  bluetap: {
    label:
      "Illustration of BlueTap: a home-screen widget is assigned to an already-paired Bluetooth device. Assigning and customising works; connecting or disconnecting from the widget is not implemented.",
    svg: (
      <>
        <rect x="20" y="60" width="130" height="64" rx="14" className="mini-box mini-box--accent" />
        <text x="85" y="88" textAnchor="middle" className="mini-label">Widget</text>
        <text x="85" y="108" textAnchor="middle" className="mini-sub">2×1 · preset</text>
        <circle cx="330" cy="92" r="30" className="mini-box" />
        <text x="330" y="97" textAnchor="middle" className="mini-label">Earbuds</text>
        <text x="330" y="146" textAnchor="middle" className="mini-sub">already paired</text>
        <path d="M150 80 H300" className="mini-edge mini-edge--accent" />
        <text x="225" y="70" textAnchor="middle" className="mini-sub">assign · customise</text>
        <path d="M150 108 H300" className="mini-edge mini-edge--dashed" />
        <text x="225" y="128" textAnchor="middle" className="mini-sub">tap to connect: not yet</text>
      </>
    ),
  },
  layers: {
    label:
      "Illustration of Layers: one portable widget definition is rendered by a shared runtime into widgets of different sizes.",
    svg: (
      <>
        <rect x="16" y="66" width="104" height="52" rx="6" className="mini-box mini-box--accent" />
        <text x="68" y="97" textAnchor="middle" className="mini-label mini-label--mono">.layers</text>
        <path d="M120 92 H168" className="mini-edge mini-edge--accent" />
        <rect x="168" y="66" width="96" height="52" rx="6" className="mini-box" />
        <text x="216" y="97" textAnchor="middle" className="mini-label">runtime</text>
        <path d="M264 92 C 288 92, 288 46, 310 46" className="mini-edge" />
        <path d="M264 92 H310" className="mini-edge" />
        <path d="M264 92 C 288 92, 288 146, 310 146" className="mini-edge" />
        <rect x="310" y="32" width="56" height="28" rx="6" className="mini-box" />
        <rect x="310" y="72" width="40" height="40" rx="6" className="mini-box" />
        <rect x="310" y="126" width="76" height="40" rx="6" className="mini-box" />
        <text x="216" y="146" textAnchor="middle" className="mini-sub">editor · themes · presets</text>
      </>
    ),
  },
};

export function SmallerBuilds() {
  return (
    <section id="smaller" className="section" aria-labelledby="smaller-title">
      <div className="container">
        <header className="section-head">
          <h2 id="smaller-title" className="h2">
            Smaller builds
          </h2>
          <p>Two pre-release Android projects, listed with what works and what does not.</p>
        </header>
        <div className="smaller-grid">
          {pick(smallerSlugs).map((p) => {
            const d = diagrams[p.slug];
            return (
              <article key={p.slug} id={`smaller-${p.slug}`} className="smaller" aria-labelledby={`smaller-${p.slug}-title`}>
                {d && (
                  <figure className="smaller-figure">
                    <svg viewBox="0 0 400 180" role="img" aria-label={d.label} className="mini">
                      {d.svg}
                    </svg>
                    <figcaption className="tag">Illustration, not a screenshot</figcaption>
                  </figure>
                )}
                <p className="kicker">{p.kicker}</p>
                <h3 id={`smaller-${p.slug}-title`} className="smaller-title">
                  {p.title}
                </h3>
                <StatusLine project={p} />
                <p className="smaller-summary">{p.summary}</p>
                <p className="smaller-limits">
                  <span className="tag">Not yet</span> {p.limits}
                </p>
                <p className="smaller-role">{p.role}</p>
                {p.links.map((l) => (
                  <ExternalLink key={l.href} href={l.href} className="text-link smaller-link">
                    {l.label}
                  </ExternalLink>
                ))}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
