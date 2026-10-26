import { Fragment, useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { bio, chronicle, principles, type ChronEntry, type ChronKind } from "../content/profile";
import { bomProjects, materials } from "../content/materials";
import { profiles, site } from "../content/site";
import { projectBySlug } from "../content/projects";
import { sound } from "../lib/prefs";
import { ProjectLink } from "../space/ProjectLink";

/* ------------------------------------------------------------------ How I work */

/** Nexus and Atlas, named in the text, open on the Projects section. */
function linkify(text: string): ReactNode[] {
  return text.split(/(\{nexus\}|\{atlas\}|\bNexus\b|\bAtlas\b)/).map((part, i) => {
    const slug = part.replace(/[{}]/g, "").toLowerCase();
    if (slug === "nexus" || slug === "atlas")
      return (
        <ProjectLink key={i} slug={slug} className="inline-link">
          {slug === "nexus" ? "Nexus" : "Atlas"}
        </ProjectLink>
      );
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export function HowIWork() {
  const [lede, ...rest] = bio;
  return (
    <section className="section about wrap" id="about" aria-labelledby="about-title">
      <header className="sec-head">
        <h2 id="about-title">How I work</h2>
      </header>
      <div className="about-grid">
        <div className="about-bio">
          <p className="about-lede">{lede}</p>
          {rest.map((t) => (
            <p key={t}>{linkify(t)}</p>
          ))}
        </div>
        <ol className="principles" aria-label="Principles">
          {principles.map((p, i) => (
            <li className="principle" key={p.title}>
              <span className="p-num" aria-hidden="true">
                {["I", "II", "III", "IV"][i]}
              </span>
              <h3>{p.title}.</h3>
              <p>{linkify(p.body)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Experience and education */

// The timeline runs from January 2022 to the present (October 2026), month by month.
const START: [number, number] = [2022, 1];
const NOW: [number, number] = [2026, 10];
const SPAN = (NOW[0] - START[0]) * 12 + NOW[1] - START[1] + 1;
/** Position (percent) of the start of a month, or of its end. */
const pos = ([y, m]: [number, number], end = false) => Math.min(100, (((y - START[0]) * 12 + m - START[1] + (end ? 1 : 0)) / SPAN) * 100);
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmt = ([y, m]: [number, number]) => `${MONTHS[m - 1]} ${y}`;
const KIND: Record<ChronKind, string> = {
  Employment: "work",
  "Co-founder": "work",
  "Personal project": "own",
  "Personal projects": "own",
  "Collaborative project": "team",
  "Client project": "team",
  Education: "study",
};

function ChronRow({ c }: { c: ChronEntry }) {
  const l = pos(c.from);
  const r = c.to ? pos(c.to, true) : 100;
  return (
    <li className="ch-row" data-kind={KIND[c.kind]}>
      <p className="ch-dates">
        <span>
          {fmt(c.from)} to {c.to ? fmt(c.to) : "now"}
        </span>
      </p>
      <div className="ch-main">
        <h3 className="ch-title">{c.slug && projectBySlug(c.slug) ? <Link to={`/work/${c.slug}`}>{c.title}</Link> : c.title}</h3>
        <p className="ch-org">
          <span className="ch-kind">{c.kind}</span> {c.org}
        </p>
        <p className="ch-note">
          {c.note}
          {c.link && (
            <>
              {" "}
              <a className="link" href={c.link.href} rel="noopener">
                {c.link.label}
              </a>
            </>
          )}
        </p>
      </div>
      <div className="ch-track" aria-hidden="true">
        <span className={`ch-bar${c.to ? "" : " is-open"}`} style={{ left: `${l}%`, width: `${Math.max(1.2, r - l)}%` }} />
      </div>
    </li>
  );
}

export function Experience() {
  const years: number[] = [];
  for (let y = START[0]; y <= NOW[0]; y++) years.push(y);
  return (
    <section className="section experience wrap" id="experience" aria-labelledby="exp-title">
      <header className="sec-head">
        <h2 id="exp-title">Experience and education</h2>
        <p>Newest first. Each line is drawn to scale against the same years, so overlaps read straight down the page.</p>
      </header>
      <div className="chron">
        <div className="ch-head" aria-hidden="true">
          <p className="ch-legend">
            <span data-kind="work">
              <i></i>Employment
            </span>
            <span data-kind="team">
              <i></i>With HubZero or a team
            </span>
            <span data-kind="own">
              <i></i>Personal project
            </span>
            <span data-kind="study">
              <i></i>Education
            </span>
          </p>
          <div className="ch-axis-row">
            <span></span>
            <span></span>
            <div className="ch-axis">
              {years.map((y) => (
                <span key={y} className="ch-year" style={{ left: `${pos([y, 1])}%` }}>
                  {y}
                </span>
              ))}
              <span className="ch-now">now</span>
            </div>
          </div>
        </div>
        <ol className="ch-list">
          {chronicle.map((c) => (
            <ChronRow key={c.title + c.from.join("-")} c={c} />
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Bill of materials */

type Sel = { type: "tech" | "project"; id: string } | null;
const techs = materials.flatMap(([fam, rows]) => rows.map(([name, used]) => ({ fam, name, used })));
const shortOf = Object.fromEntries(bomProjects.map((p) => [p.slug, p.short]));
const titleOf = (slug: string) => projectBySlug(slug)?.title ?? shortOf[slug];
const listNames = (names: string[]) => (names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : names[0]);
function joined(items: ReactNode[]) {
  return items.map((a, i) => (
    <Fragment key={i}>
      {i === 0 ? "" : i === items.length - 1 ? " and " : ", "}
      {a}
    </Fragment>
  ));
}

export function BillOfMaterials() {
  const [pinned, setPinned] = useState<Sel>(null);
  const [hover, setHover] = useState<Sel>(null);
  const [fine, setFine] = useState(false);
  useEffect(() => setFine(matchMedia("(hover: hover) and (pointer: fine)").matches), []);
  const sel = hover ?? pinned;

  const techOn = (t: (typeof techs)[number]) => !!sel && (sel.type === "tech" ? t.name === sel.id : t.used.includes(sel.id));
  const projectOn = (slug: string) => !!sel && (sel.type === "tech" ? techs.find((t) => t.name === sel.id)!.used.includes(slug) : slug === sel.id);
  const choose = (s: NonNullable<Sel>) => {
    sound.play("select");
    setPinned((p) => (p && p.id === s.id ? null : s));
  };
  const preview = (s: NonNullable<Sel>) => fine && setHover(s);

  let out: ReactNode = "Choose a technology or a project.";
  if (sel?.type === "tech") {
    const t = techs.find((x) => x.name === sel.id)!;
    out = (
      <>
        <b>{t.name}</b> is used in{" "}
        {joined(
          t.used.map((s) => (
            <ProjectLink key={s} slug={s}>
              {titleOf(s)}
            </ProjectLink>
          )),
        )}
        .
      </>
    );
  } else if (sel?.type === "project") {
    const slug = sel.id;
    out = (
      <>
        <b>{titleOf(slug)}</b> uses {listNames(techs.filter((t) => t.used.includes(slug)).map((t) => t.name))}.{" "}
        <ProjectLink slug={slug}>{["querycraft", "bluetap"].includes(slug) ? "Read the case study" : "Open it in Projects"}</ProjectLink>.
      </>
    );
  }

  return (
    <section className="section materials wrap" id="stack-index" aria-labelledby="bom-title">
      <header className="sec-head">
        <h2 id="bom-title">Bill of materials</h2>
        <p>Technologies, listed only where a project here used them. Choose one to see where; choose a project to see what it is made of.</p>
      </header>
      <div className={`bom${sel ? " has-sel" : ""}`} onPointerLeave={() => setHover(null)}>
        <div className="bom-projects" role="group" aria-label="Projects">
          {bomProjects.map((p) => (
            <button
              key={p.slug}
              type="button"
              className={`bom-p${projectOn(p.slug) ? " is-on" : ""}`}
              aria-pressed={pinned?.id === p.slug}
              onClick={() => choose({ type: "project", id: p.slug })}
              onPointerOver={() => preview({ type: "project", id: p.slug })}
            >
              {p.short}
            </button>
          ))}
        </div>
        <div className="bom-fams">
          {materials.map(([fam, rows]) => (
            <div className="bom-fam" key={fam}>
              <h3>{fam}</h3>
              <div className="bom-chips" role="group" aria-label={fam}>
                {rows.map(([name, used]) => (
                  <button
                    key={name}
                    type="button"
                    className={`bom-t${techOn(techs.find((t) => t.name === name)!) ? " is-on" : ""}`}
                    aria-pressed={pinned?.id === name}
                    onClick={() => choose({ type: "tech", id: name })}
                    onPointerOver={() => preview({ type: "tech", id: name })}
                  >
                    {name}
                    <span className="sr-only">, used in {listNames(used.map((s) => shortOf[s]))}</span>
                    <span className="bom-n" aria-hidden="true">
                      {used.length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="bom-out" aria-live="polite">
          {out}
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Contact */

export function Contact() {
  const [status, setStatus] = useState("");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setStatus("Email address copied.");
      sound.play("press");
    } catch {
      setStatus(`Copy failed. The address is ${site.email}.`);
    }
  };
  return (
    <section className="section contact wrap" id="contact" aria-labelledby="contact-title">
      <header className="sec-head">
        <h2 id="contact-title">Get in touch</h2>
        <p>I'm open to software engineering roles, remote or with relocation. Email is the quickest way to reach me.</p>
      </header>
      <dl className="titleblock">
        <div className="tb-cell tb-email">
          <dt>Email</dt>
          <dd>
            <a className="tb-big" href={`mailto:${site.email}`} data-sound="press">
              {site.email}
            </a>
            <button className="btn btn-small" type="button" onClick={copy}>
              Copy
            </button>
          </dd>
        </div>
        <div className="tb-cell">
          <dt>Name</dt>
          <dd>{site.displayName}</dd>
        </div>
        <div className="tb-cell">
          <dt>Working as</dt>
          <dd>{site.name}</dd>
        </div>
        <div className="tb-cell">
          <dt>Based in</dt>
          <dd>{site.location}</dd>
        </div>
        <div className="tb-cell">
          <dt>Availability</dt>
          <dd>{site.availability}.</dd>
        </div>
        <div className="tb-cell tb-links">
          <dt>Elsewhere</dt>
          <dd>
            <a href={profiles.github} rel="noopener" data-sound="press">
              GitHub
            </a>
            <a href={profiles.linkedin} rel="noopener" data-sound="press">
              LinkedIn
            </a>
            <a href={site.resume}>Résumé (PDF)</a>
          </dd>
        </div>
      </dl>
      <p className="status-line" role="status" aria-live="polite">
        {status}
      </p>
    </section>
  );
}
