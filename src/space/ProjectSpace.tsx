import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Glyph, Status } from "../components/Glyph";
import { archiveBuilds } from "../content/profile";
import { sound } from "../lib/prefs";
import { alsoBuilt, space, spaceBySlug, type SpaceProject } from "./data";
import { SpaceStage } from "./SpaceStage";
import { SpaceDetail } from "./SpaceDetail";
import { AsideStrip } from "./ui";

const DEFAULT = "atlas";

/**
 * Project Space: the six featured projects. A persistent list (a chip row on
 * narrower screens), the project's 3D stage in the centre, and concise
 * information beside it with Explore project, which opens the detail view.
 *
 * URL: ?project=<slug> selects, &open=1 opens the detail view; both are pushed,
 * so Back closes the detail view and then steps back through selections. The
 * page's hash is kept, so selecting never scrolls the page.
 */
export function ProjectSpace() {
  const location = useLocation();
  const navigate = useNavigate();
  // The prerendered page shows the default project; read the URL after hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const q = new URLSearchParams(location.search);
  const param = q.get("project");
  const valid = !!(param && spaceBySlug(param));
  const slug = mounted && valid ? param! : DEFAULT;
  const open = mounted && valid && q.get("open") === "1";
  const sp = spaceBySlug(slug)!;
  const p = sp.project;

  const row = useRef<HTMLOListElement>(null);
  const [announce, setAnnounce] = useState("");
  const firstSel = useRef(true);

  const select = useCallback(
    (s: string) => {
      if (s === slug) return;
      sound.play("select");
      navigate({ search: `?project=${s}`, hash: location.hash }, { preventScrollReset: true });
    },
    [navigate, slug, location.hash],
  );
  const explore = () => {
    sound.play("open");
    navigate({ search: `?project=${slug}&open=1`, hash: location.hash }, { state: { spaceOpen: true }, preventScrollReset: true });
  };
  const close = () => {
    sound.play("close");
    if ((location.state as { spaceOpen?: boolean } | null)?.spaceOpen) navigate(-1);
    else navigate({ search: `?project=${slug}`, hash: location.hash }, { replace: true, preventScrollReset: true });
  };

  // The chip row (narrow screens): centre the chosen chip; fade an edge only while more chips lie beyond it.
  const fades = useCallback(() => {
    const r = row.current;
    if (!r) return;
    r.classList.toggle("more-l", r.scrollLeft > 2);
    r.classList.toggle("more-r", r.scrollLeft + r.clientWidth < r.scrollWidth - 2);
  }, []);
  const centre = useCallback(
    (behavior: ScrollBehavior = "auto") => {
      const r = row.current;
      const el = r?.querySelector<HTMLElement>('[aria-current="true"]');
      if (r && el && r.scrollWidth > r.clientWidth) {
        const c = el.getBoundingClientRect(), b = r.getBoundingClientRect();
        r.scrollTo({ left: r.scrollLeft + c.left - b.left - (r.clientWidth - c.width) / 2, behavior });
      }
      fades();
    },
    [fades],
  );
  useEffect(() => {
    centre(firstSel.current ? "auto" : "smooth");
    if (!firstSel.current) setAnnounce(`${p.title} selected.`);
    firstSel.current = false;
  }, [slug, centre, p.title]);
  useEffect(() => {
    const onResize = () => centre();
    window.addEventListener("resize", onResize);
    document.fonts?.ready.then(() => centre());
    return () => window.removeEventListener("resize", onResize);
  }, [centre]);

  const onKey = (e: KeyboardEvent<HTMLOListElement>) => {
    const keys: Record<string, number | "first" | "last"> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1, Home: "first", End: "last" };
    if (!(e.key in keys)) return;
    const btns = [...(row.current?.querySelectorAll<HTMLButtonElement>(".ps-sd-btn") ?? [])];
    const i = btns.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    e.preventDefault();
    const k = keys[e.key];
    const next = btns[k === "first" ? 0 : k === "last" ? btns.length - 1 : (i + (k as number) + btns.length) % btns.length];
    next.focus();
    select(next.dataset.slug!);
  };

  return (
    <section id="work" className="ps" aria-labelledby="ps-title">
      <div className="ps-head">
        <h2 id="ps-title">Projects</h2>
        <p>Each project in the environment it runs in. Choose one, then explore it.</p>
      </div>
      <div className="ps-grid">
        <nav className="ps-side" aria-label="Projects">
          <ol ref={row} onKeyDown={onKey} onScroll={fades}>
            {space.map((s) => (
              <SideItem key={s.slug} sp={s} current={s.slug === slug} live={mounted} onSelect={select} />
            ))}
          </ol>
        </nav>

        <SpaceStage
          slug={slug}
          scene={sp.scene}
          label={`${p.title}: devices and media, a 3D view`}
          caption={sp.scene.cap}
          aside={sp.scene.aside ? <AsideStrip kind={sp.scene.aside} /> : undefined}
          className="ps-main"
        />

        <div className="ps-info" id="ps-info" key={slug}>
          <div className="ps-in-a">
            <p className="ps-in-line">{p.ownership.kind === "hubzero" ? "With HubZero · client work" : p.kicker}</p>
            <h3 className="ps-in-title">{p.title}</h3>
            <Status stage={p.stage} text={p.status} />
            <p className="ps-in-blurb">{sp.blurb}</p>
          </div>
          <div className="ps-in-b">
            <p className="ps-in-part">
              <b>My part</b>
              {sp.part}
            </p>
            <p className="ps-in-runs">Runs on {sp.platforms.join(", ")}</p>
            {mounted ? (
              <button type="button" className="ps-btn ps-btn-solid ps-cta" id="ps-explore" aria-haspopup="dialog" onClick={explore}>
                Explore project
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </button>
            ) : (
              <Link className="ps-btn ps-btn-solid ps-cta" to={`/work/${slug}`}>
                Read the case study
              </Link>
            )}
          </div>
        </div>
      </div>

      <aside className="ps-also" aria-labelledby="ps-also-title">
        <h3 id="ps-also-title">Also built</h3>
        {alsoBuilt.map((a) => (
          <p key={a.slug}>
            <b>
              <Link to={`/work/${a.slug}`} data-sound="press">
                {a.title}
              </Link>
            </b>
            . {a.note}
          </p>
        ))}
      </aside>

      {/* Archive builds: earlier, smaller and team work, kept quiet beneath the six. */}
      <section className="arc-wrap" id="archive" aria-labelledby="archive-title">
        <header className="arc-head">
          <h3 id="archive-title">Archive builds</h3>
          <p>Earlier, smaller and team work, kept short. Each entry is described from its code.</p>
        </header>
        <ol className="arc-list">
          {archiveBuilds.map((a) => (
            <li className="arc" key={a.id}>
              <div className="arc-id">
                <h4>{a.name}</h4>
                <p className="arc-meta">{a.meta}</p>
              </div>
              <div className="arc-body">
                <p className="arc-what">{a.what}</p>
                <p className="arc-tech">{a.tech}</p>
                <p className="arc-links">
                  {a.links.map((l) => (
                    <a key={l.href} href={l.href} rel="noopener" data-sound="press">
                      {l.label}
                      <span className="sr-only"> ({a.name})</span>
                    </a>
                  ))}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <p className="sr-status" aria-live="polite">
        {announce}
      </p>
      <SpaceDetail sp={sp} open={open} onClose={close} />
    </section>
  );
}

function SideItem({ sp, current, live, onSelect }: { sp: SpaceProject; current: boolean; live: boolean; onSelect: (slug: string) => void }) {
  const p = sp.project;
  const hub = p.ownership.kind === "hubzero";
  const body = (
    <>
      <span className="ps-sd-name">
        {p.title}
        <Glyph stage={p.stage} />
      </span>
      <span className="ps-sd-line">{hub ? "Client project, HubZero" : p.kicker}</span>
    </>
  );
  return (
    <>
      {hub && (
        <li className="ps-sd-group" aria-hidden="true">
          With HubZero
        </li>
      )}
      <li>
        {live ? (
          <button type="button" className="ps-sd-btn" data-slug={sp.slug} aria-current={current ? "true" : "false"} aria-controls="ps-info" onClick={() => onSelect(sp.slug)}>
            {body}
          </button>
        ) : (
          // Before hydration (or without JavaScript) each entry leads to its case study.
          <Link className="ps-sd-btn" data-slug={sp.slug} aria-current={current ? "true" : "false"} to={`/work/${sp.slug}`}>
            {body}
          </Link>
        )}
      </li>
    </>
  );
}
