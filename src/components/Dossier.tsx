import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router";
import type { Project } from "../content/types";
import { Figure } from "./Figure";
import { Status } from "./Glyph";
import { Facts, OutLinks } from "./ProjectParts";

type Props = {
  projects: Project[];
  /** Slug from the URL; null when closed. */
  slug: string | null;
  /** Where the paper opens from (the selected ribbon segment). */
  originFor: (slug: string) => Element | null;
  onRequestClose: () => void;
  onStep: (dir: 1 | -1) => void;
  /** Called after the close animation, with the slug that was showing. */
  onClosed: (slug: string) => void;
};

const OPEN_MS = 680;
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Resolves when the animation finishes or is cancelled, or after its planned
 * duration plus a margin, whichever comes first, so the dialog's state always
 * settles even if the browser stops producing frames (an occluded window, a
 * throttled tab).
 */
function settled(a: Animation, ms: number) {
  return Promise.race([a.finished.then(() => undefined, () => undefined), new Promise<void>((r) => setTimeout(r, ms + 250))]);
}

function clipFrom(el: Element | null) {
  const vw = innerWidth, vh = innerHeight;
  const r = el?.getBoundingClientRect();
  const visible = r && r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw && r.width > 0;
  const b = visible ? r : { top: vh * 0.3, bottom: vh * 0.7, left: vw * 0.25, right: vw * 0.75 };
  const px = (v: number) => `${Math.max(0, Math.round(v))}px`;
  return `inset(${px(b.top)} ${px(vw - b.right)} ${px(vh - b.bottom)} ${px(b.left)})`;
}

/**
 * The project dossier: a native modal <dialog> (focus containment, Escape,
 * inert page behind). URL state lives in the page (?project=slug); this
 * component only animates the ink-to-paper hand-off and renders the content.
 */
export function Dossier({ projects, slug, originFor, onRequestClose, onStep, onClosed }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [shown, setShown] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);
  const anim = useRef<Animation | null>(null);
  const pendingOpen = useRef(false);
  const slugRef = useRef(slug);
  slugRef.current = slug;

  // URL → dialog.
  useLayoutEffect(() => {
    const d = dialogRef.current!;
    if (slug && !d.open) {
      pendingOpen.current = true;
      setOpening(!reducedMotion());
      setShown(slug);
    } else if (slug && d.open && slug !== shown) {
      setShown(slug);
    } else if (!slug && d.open) {
      const was = shown;
      document.body.classList.remove("reading");
      anim.current?.cancel();
      const done = () => {
        if (slugRef.current) {
          // Reopened while closing: stay open on the requested project.
          document.body.classList.add("reading");
          setOpening(false);
          if (slugRef.current !== was) setShown(slugRef.current);
          return;
        }
        d.close();
        setShown(null);
        if (was) onClosed(was);
      };
      if (reducedMotion()) {
        anim.current = d.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120 });
      } else {
        setOpening(true); // hide the content while the paper folds back
        anim.current = d.animate([{ clipPath: "inset(0px 0px 0px 0px)" }, { clipPath: clipFrom(was ? originFor(was) : null) }], {
          duration: OPEN_MS * 0.8,
          delay: 100,
          easing: "cubic-bezier(0.7, 0, 0.2, 1)",
        });
      }
      let ran = false;
      settled(anim.current, OPEN_MS).then(() => {
        if (ran) return;
        ran = true;
        done();
      });
    }
  }, [slug]);

  // Open once the content for `shown` is in the DOM.
  useLayoutEffect(() => {
    const d = dialogRef.current!;
    if (!shown) return;
    d.querySelector(".ds-scroll")?.scrollTo(0, 0);
    if (pendingOpen.current) {
      pendingOpen.current = false;
      const from = clipFrom(originFor(shown));
      d.showModal();
      document.body.classList.add("reading");
      anim.current?.cancel();
      if (reducedMotion()) {
        anim.current = d.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 140 });
      } else {
        anim.current = d.animate([{ clipPath: from }, { clipPath: "inset(0px 0px 0px 0px)" }], { duration: OPEN_MS, easing: "cubic-bezier(0.7, 0, 0.2, 1)" });
        const a = anim.current;
        settled(a, OPEN_MS).then(() => {
          if (anim.current === a) setOpening(false);
        });
      }
    }
    d.querySelector<HTMLElement>("#ds-title")?.focus({ preventScroll: true });
  }, [shown]);

  // Leaving the page with the dossier open (e.g. "Read the full case study").
  useEffect(
    () => () => {
      document.body.classList.remove("reading");
    },
    [],
  );

  const i = shown ? projects.findIndex((p) => p.slug === shown) : -1;
  const p = i >= 0 ? projects[i] : null;
  const prev = p ? projects[(i - 1 + projects.length) % projects.length] : null;
  const next = p ? projects[(i + 1) % projects.length] : null;

  return (
    <dialog
      ref={dialogRef}
      className={opening ? "dossier is-opening" : "dossier"}
      aria-labelledby="ds-title"
      onCancel={(e) => {
        e.preventDefault(); // Escape: run our own close (history + animation)
        onRequestClose();
      }}
    >
      {p && prev && next && (
        <div className="ds-scroll">
          <div className="ds-bar">
            <button type="button" className="ds-btn ds-close" onClick={onRequestClose}>
              <span aria-hidden="true">←</span> <span>
                Back<span className="ds-long"> to the work</span>
              </span>{" "}
              <kbd aria-hidden="true">Esc</kbd>
            </button>
            <p className="ds-count">
              Dossier {String(i + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
            </p>
            <div className="ds-step">
              <button type="button" className="ds-btn" onClick={() => onStep(-1)} aria-label={`Previous project: ${prev.title}`}>
                <span aria-hidden="true">←</span> <span className="ds-long">{prev.title}</span>
              </button>
              <button type="button" className="ds-btn" onClick={() => onStep(1)} aria-label={`Next project: ${next.title}`}>
                <span className="ds-long">{next.title}</span> <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>

          <article key={p.slug} className="ds-body">
            <header className="ds-head">
              <div>
                <p className="kicker">{p.kicker}</p>
                <h2 id="ds-title" className="ds-title" tabIndex={-1}>
                  {p.title}
                </h2>
                <Status stage={p.stage} text={p.status} className="chip" />
                {p.question && <p className="ds-q">{p.question}</p>}
                <Facts project={p} />
              </div>
              <Figure media={p.media[0]} sizes="(min-width: 900px) 52vw, 92vw" eager />
            </header>

            <div className="ds-grid">
              <section className="ds-sec" aria-labelledby={`ds-why-${p.slug}`}>
                <h3 id={`ds-why-${p.slug}`}>Why it exists</h3>
                <div className="ds-sec-body">
                  <p className="lead">{p.summary}</p>
                  {p.problem.map((t) => (
                    <p key={t}>{t}</p>
                  ))}
                </div>
              </section>
              <section className="ds-sec" aria-labelledby={`ds-how-${p.slug}`}>
                <h3 id={`ds-how-${p.slug}`}>How it works</h3>
                <div className="ds-sec-body">
                  <ol className="flow">
                    {p.how.map((h) => (
                      <li key={h.title}>
                        <b>{h.title}</b>
                        <p>{h.body}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              </section>
              <section className="ds-sec" aria-labelledby={`ds-dec-${p.slug}`}>
                <h3 id={`ds-dec-${p.slug}`}>Decisions and trade-offs</h3>
                <div className="ds-sec-body">
                  <ul className="decisions">
                    {p.decisions.map((d) => (
                      <li key={d.title}>
                        <b>{d.title}</b>
                        <p>{d.body}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
              <section className="ds-sec" aria-labelledby={`ds-stack-${p.slug}`}>
                <h3 id={`ds-stack-${p.slug}`}>Stack, and why it matters</h3>
                <div className="ds-sec-body">
                  <dl className="stack">
                    {p.stack.map((s) => (
                      <div key={s.name}>
                        <dt>{s.name}</dt>
                        <dd>{s.why}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </section>
              <section className="ds-sec" aria-labelledby={`ds-lim-${p.slug}`}>
                <h3 id={`ds-lim-${p.slug}`}>Status and limits</h3>
                <div className="ds-sec-body">
                  <ul className="limits">
                    {p.limits.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              </section>
              <section className="ds-sec" aria-labelledby={`ds-next-${p.slug}`}>
                <h3 id={`ds-next-${p.slug}`}>Explore</h3>
                <div className="ds-sec-body">
                  <div className="actions">
                    <Link className="btn btn--primary" to={`/work/${p.slug}`}>
                      Read the full case study <span aria-hidden="true">→</span>
                    </Link>
                    <OutLinks project={p} />
                  </div>
                </div>
              </section>
            </div>

            <nav className="ds-foot" aria-label="More projects">
              <button type="button" onClick={() => onStep(-1)}>
                <small>Previous project</small>
                <span>← {prev.title}</span>
              </button>
              <button type="button" onClick={() => onStep(1)}>
                <small>Next project</small>
                <span>{next.title} →</span>
              </button>
            </nav>
          </article>
        </div>
      )}
    </dialog>
  );
}
