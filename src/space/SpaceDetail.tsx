import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { Status } from "../components/Glyph";
import type { SpaceProject } from "./data";
import { reducedMotion } from "./stage3d";
import { DiagramFigure, ShotFigure, Tag } from "./ui";

/**
 * The detail view behind Explore project: larger evidence with thumbnails,
 * what the project does, my part, highlights, status and limits, and links.
 * A modal dialog: Escape, the close button and the backdrop close it, and
 * focus returns to Explore project.
 */
export function SpaceDetail({ sp, open, onClose }: { sp: SpaceProject; open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const [i, setI] = useState(0);
  const p = sp.project;

  useEffect(() => setI(0), [sp.slug]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      d.scrollTop = 0;
      closeBtn.current?.focus();
      if (!reducedMotion()) d.animate([{ opacity: 0, translate: "0 18px" }, { opacity: 1, translate: "0 0" }], { duration: 280, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
    } else if (!open && d.open) {
      d.close();
      document.getElementById("ps-explore")?.focus({ preventScroll: true });
    }
  }, [open]);

  const m = sp.evidence[i] ?? sp.evidence[0];
  const links = p.links;

  return (
    <dialog
      ref={ref}
      className="ps-detail"
      aria-labelledby="ps-dt-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClose={() => {
        // Closed some other way (the browser can force-close on repeated Escape): keep the URL in step.
        // The event is dispatched late, so a quick Back then Forward may already have reopened it.
        if (open && !ref.current?.open) onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      {open && (
        <div className="ps-dt-panel">
          <header className="ps-dt-head">
            <div className="ps-dt-id">
              <h2 id="ps-dt-title">{p.title}</h2>
              <p className="ps-in-line">{p.kicker}</p>
            </div>
            <button ref={closeBtn} type="button" className="ps-icon-btn ps-dt-close" aria-label={`Close ${p.title} details`} title="Close (Esc)" onClick={onClose}>
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M5 5l10 10M15 5L5 15" />
              </svg>
            </button>
          </header>

          <section className="ps-dt-media" aria-labelledby="ps-dt-ev">
            <h3 className="ps-dt-label" id="ps-dt-ev">
              Evidence
            </h3>
            {m.kind === "illustration" ? <DiagramFigure id={m.id} caption={m.caption} className="ps-dt-fig" /> : <ShotFigure media={m} className="ps-dt-fig" eager />}
            {sp.evidence.length > 1 && (
              <div className="ps-dt-thumbs" role="group" aria-label={`${p.title} media`}>
                {sp.evidence.map((e, k) => (
                  <button key={k} type="button" className="ps-th" aria-pressed={k === i} aria-label={`Show ${e.caption.replace(/\.$/, "")}`} onClick={() => setI(k)}>
                    {e.kind === "illustration" ? "Illustration" : <img src={e.src} alt="" loading="lazy" />}
                  </button>
                ))}
              </div>
            )}
            {sp.liveNote && <p className="ps-dt-note">{sp.liveNote}</p>}
            {sp.studio && (
              <div className="ps-studio">
                <b>
                  Layers Studio <Tag kind="planned" />
                </b>
                <p>A browser editor, specified but not built: no Studio source exists yet, so there is nothing to show. It is planned to offer:</p>
                <ul className="ps-works">
                  {sp.studio.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <div className="ps-dt-text">
            <section className="ps-dt-sec ps-dt-lead" aria-label="Summary">
              <Status stage={p.stage} text={p.status} />
              <p className="ps-dt-sum">{sp.purpose}</p>
              <Link className="ps-btn ps-btn-solid ps-dt-cta" to={`/work/${sp.slug}`} data-sound="open">
                Read the case study
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </Link>
            </section>
            <section className="ps-dt-sec" aria-labelledby="ps-dt-part">
              <h3 id="ps-dt-part">My part</h3>
              <p>{sp.contribution}</p>
              <p className="ps-dt-note">{p.ownership.label}</p>
            </section>
            <section className="ps-dt-sec" aria-labelledby="ps-dt-facts">
              <h3 id="ps-dt-facts">Facts</h3>
              <dl className="ps-facts">
                <dt>Runs on</dt>
                <dd>{sp.platforms.join(", ")}</dd>
                {p.period && (
                  <>
                    <dt>Period</dt>
                    <dd>{p.period}</dd>
                  </>
                )}
                {p.licence && (
                  <>
                    <dt>Licence</dt>
                    <dd>{p.licence}</dd>
                  </>
                )}
              </dl>
            </section>
            <section className="ps-dt-sec" aria-labelledby="ps-dt-hl">
              <h3 id="ps-dt-hl">Highlights</h3>
              <dl className="ps-hl">
                {sp.highlights.map(([a, b]) => (
                  <div key={a}>
                    <dt>{a}</dt>
                    <dd>{b}</dd>
                  </div>
                ))}
              </dl>
            </section>
            <section className="ps-dt-sec" aria-labelledby="ps-dt-lim">
              <h3 id="ps-dt-lim">Limits</h3>
              <p className="ps-limits">{sp.limits}</p>
              {sp.missing.length > 0 && <p className="ps-limits">{sp.missing.join(" ")}</p>}
            </section>
            {links.length > 0 && (
              <section className="ps-dt-sec" aria-labelledby="ps-dt-links">
                <h3 id="ps-dt-links">Links</h3>
                <div className="ps-dt-links">
                  {links.map((l) => (
                    <a key={l.href} className="ps-btn" href={l.href} rel="noopener" data-sound="press">
                      {l.label}
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}
