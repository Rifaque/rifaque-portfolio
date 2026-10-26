import { useState } from "react";
import { Link } from "react-router";
import { projects } from "../content/projects";
import { stackSwitches } from "../content/profile";
import { Status } from "./Glyph";

const usedIn = (match: string) =>
  projects.flatMap((p) => {
    const entry = p.stack.find((s) => s.name.includes(match));
    return entry ? [{ project: p, entry }] : [];
  });

/**
 * Trace a technology to the work: one switch on at a time; the projects that
 * used it light up with what it did there. Rendered with a default switch on,
 * so the prerendered page shows a complete reading without JavaScript.
 */
export function Switchboard() {
  const [on, setOn] = useState<string>("Ollama");
  const current = stackSwitches.find((s) => s.label === on)!;
  const hits = usedIn(current.match);

  return (
    <section id="stack" className="board" aria-labelledby="board-title">
      <div className="board-head">
        <h2 id="board-title" className="board-title">
          Trace a technology to the work
        </h2>
        <p className="board-lede">Switch one on. The signal runs to every project that used it, with what it did there.</p>
      </div>
      <div className="board-body">
        <ul className="switches" aria-label="Technologies">
          {stackSwitches.map((s) => (
            <li key={s.label}>
              <button type="button" className="switch" aria-pressed={s.label === on} onClick={() => setOn(s.label)}>
                <span className="switch-track" aria-hidden="true">
                  <span className="switch-knob" />
                </span>
                <span>{s.label}</span>
                <span className="switch-count" aria-hidden="true">
                  {usedIn(s.match).length}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="bus" aria-hidden="true" />
        <div className="readings" aria-live="polite">
          <p className="readings-head">
            {current.label} · {hits.length} {hits.length === 1 ? "project" : "projects"}
          </p>
          <ol key={on} className="readings-list">
            {hits.map(({ project: p, entry }, i) => (
              <li key={p.slug} style={{ animationDelay: `${i * 70}ms` }}>
                <div className="reading-top">
                  <Link to={`/work/${p.slug}`} className="reading-title">
                    {p.title}
                  </Link>
                  {p.ownership.kind === "hubzero" && <span className="hub-badge hub-badge--small">HubZero</span>}
                  <Status stage={p.stage} text={p.status} className="reading-status" />
                </div>
                <p className="reading-stack">{entry.name}</p>
                <p className="reading-why">{entry.why}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
