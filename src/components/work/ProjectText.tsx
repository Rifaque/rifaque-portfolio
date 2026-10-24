import type { Ref } from "react";
import { Link } from "react-router-dom";
import type { Project } from "../../content/projects";
import { ExternalLink } from "../ExternalLink";
import { StatusBadge } from "../StatusBadge";

type Props = {
  project: Project;
  index: number;
  headingId: string;
  headingRef?: Ref<HTMLHeadingElement>;
};

/** The editorial copy for one selected project. Shared by both layouts. */
export function ProjectText({ project: p, index, headingId, headingRef }: Props) {
  return (
    <>
      <p className="kicker">
        <span className="kicker-index">{String(index + 1).padStart(2, "0")}</span>
        {p.kicker}
      </p>
      <h3 ref={headingRef} id={headingId} tabIndex={-1} className="p-title">
        {p.title}
      </h3>
      <StatusBadge stage={p.stage} text={p.status} className="p-status" />
      {p.question && <p className="p-question">{p.question}</p>}
      <p className="p-summary">{p.summary}</p>
      <ul className="p-points">
        {p.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      <dl className="p-meta">
        <div>
          <dt>Role</dt>
          <dd>{p.role}</dd>
        </div>
        <div>
          <dt>Period</dt>
          <dd>{p.period}</dd>
        </div>
        <div>
          <dt>Limits</dt>
          <dd>{p.limits}</dd>
        </div>
      </dl>
      <div className="p-links">
        <Link to={`/work/${p.slug}`} className="btn">
          Read the {p.title} case study
        </Link>
        {p.links.map((link) => (
          <ExternalLink key={link.href} href={link.href} className="text-link">
            {link.label}
          </ExternalLink>
        ))}
      </div>
    </>
  );
}
