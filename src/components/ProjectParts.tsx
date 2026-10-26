import type { Project } from "../content/types";

/** Ownership, role, period and licence, shared by the dossier and the case study. */
export function Facts({ project: p, withStack = false, withCredit = true }: { project: Project; withStack?: boolean; withCredit?: boolean }) {
  return (
    <dl className="facts">
      <div>
        <dt>Ownership</dt>
        <dd>{p.ownership.label}</dd>
      </div>
      {withCredit && p.ownership.kind === "hubzero" && (
        <div>
          <dt>Credit</dt>
          <dd>{p.ownership.credit}</dd>
        </div>
      )}
      <div>
        <dt>Role</dt>
        <dd>{p.role}</dd>
      </div>
      {p.period && (
        <div>
          <dt>Period</dt>
          <dd>{p.period}</dd>
        </div>
      )}
      {p.licence && (
        <div>
          <dt>Licence</dt>
          <dd>{p.licence}</dd>
        </div>
      )}
      {withStack && (
        <div>
          <dt>Stack</dt>
          <dd>{p.stack.map((s) => s.name).join(" · ")}</dd>
        </div>
      )}
    </dl>
  );
}

/** Verified external links, or a sentence explaining why there are none. */
export function OutLinks({ project: p }: { project: Project }) {
  if (!p.links.length) return <p className="note">{p.linksNote}</p>;
  return (
    <>
      {p.links.map((l) => (
        <a key={l.href} className="btn" href={l.href} rel="noopener">
          {l.label} <span aria-hidden="true">↗</span>
        </a>
      ))}
    </>
  );
}
