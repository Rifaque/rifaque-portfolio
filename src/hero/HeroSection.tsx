import { useEffect, useRef } from "react";
import { site } from "../content/site";
import { reducedMotion, sound, type Theme } from "../lib/prefs";
import { createHero, posterSVG, type Hero as HeroScene, type HeroView } from "./hero.js";

const VIEW_TEXT: Record<HeroView, string> = {
  axo: "Its three shadows each spell a letter.",
  r: "Seen along x, the solid is its own R.",
  s: "Seen from above, it is the S on the floor.",
  x: "Seen along z, it reads X.",
};
// The loading gate: the poster's hand-over to the canvas, the same when the move is skipped, and what ends it.
const GATE_FADE = 220;
const GATE_SETTLE = 520;
const GATE_LIMIT = 4500;
const GATE_SKIP = ["pointerdown", "wheel", "touchmove", "keydown", "scroll"];
// The drawing of the same geometry: the no-WebGL fallback (and what shows without JavaScript).
const POSTER = { __html: posterSVG({ label: "A solid made of small cubes in the corner of a room. Its shadows on the two walls and the floor spell R, S and X." }) };

/**
 * The landing gate: the RSX solid in the corner of a room, whose three
 * shadows spell R, S and X (Three.js, loaded on demand). While WebGL starts
 * the room stays empty (CSS, keyed to html.js), so no finished poster flashes
 * before the entrance takes it apart; the poster is shown only as the
 * deliberate fallback (.gl-off). The text layer above the canvas passes the
 * pointer through except over the copy and the controls.
 */
export function Hero() {
  const stageRef = useRef<HTMLDivElement>(null);
  const objectRef = useRef<HTMLDivElement>(null);
  const viewsRef = useRef<HTMLDivElement>(null);
  const nowRef = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const stage = stageRef.current!;
    const object = objectRef.current!;
    const views = viewsRef.current!;
    const poster = stage.querySelector<SVGSVGElement>(".hero-poster")!;
    const params = new URLSearchParams(location.search);
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    let hero: HeroScene | null = null;
    let cancelled = false;
    // A page being left (reload, navigation) aborts the scene's download; that is not a failure.
    let leaving = false;
    const onLeave = () => (leaving = true);
    addEventListener("pagehide", onLeave);

    /** The solid sits at the centre of the grid's object column, so text and object stay together. */
    const frame = () => {
      const s = stage.getBoundingClientRect();
      const o = object.getBoundingClientRect();
      const stacked = innerWidth <= 900;
      const cx = (o.left + o.width / 2 - s.left) / s.width;
      const cy = stacked ? 0.5 : (o.top + o.height * 0.44 - s.top) / s.height;
      const height = stacked ? 33 : Math.max(40, Math.min(48, 40 * (860 / Math.max(s.height, 560))));
      return { cx, cy, height };
    };
    const placePoster = () => {
      const r = stage.getBoundingClientRect();
      const f = frame();
      const vb = poster.viewBox.baseVal;
      const scale = r.height / f.height;
      Object.assign(poster.style, {
        width: `${vb.width * scale}px`,
        height: `${vb.height * scale}px`,
        left: `${f.cx * r.width + vb.x * scale}px`,
        top: `${f.cy * r.height + vb.y * scale}px`,
      });
    };
    const reframe = () => {
      placePoster();
      hero?.frame(frame());
    };
    const ro = new ResizeObserver(reframe);
    ro.observe(stage);
    reframe();

    const setView = (name: HeroView) => {
      views.querySelectorAll<HTMLButtonElement>(".view-key[data-view]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.view === name)));
      if (nowRef.current) nowRef.current.textContent = VIEW_TEXT[name];
    };
    const onViews = (e: MouseEvent) => {
      const b = (e.target as Element).closest<HTMLButtonElement>(".view-key");
      if (!b) return;
      if (b.id === "nudge") {
        hero?.nudge();
        sound.play("press");
        return;
      }
      if (!hero || b.getAttribute("aria-pressed") === "true") return;
      sound.play("turn");
      hero.setView(b.dataset.view as HeroView);
    };
    views.addEventListener("click", onViews);
    const showHint = () => {
      if (hintRef.current) hintRef.current.textContent = fine.matches ? "Drag the solid to turn it. It settles back into place." : "Swipe sideways across the solid to turn it.";
    };
    showHint();

    const onTheme = (e: Event) => hero?.theme((e as CustomEvent<Theme>).detail);
    window.addEventListener("rsx-theme", onTheme);

    const root = document.documentElement;
    let gateRunning = false;
    let gateSkipped = false;
    let gateLimit = 0;
    const reveal = () => {
      hero?.canvas.classList.add("is-ready");
      stage.classList.add("has-gl");
    };
    const leaveGate = () => {
      clearTimeout(gateLimit);
      for (const type of GATE_SKIP) removeEventListener(type, skipGate, true);
      document.removeEventListener("visibilitychange", skipGate);
      root.classList.remove("gate");
      root.style.removeProperty("--gate-poster");
    };
    /** Any use of the page, or leaving it, ends the move in the hero's resting state. */
    function skipGate() {
      gateSkipped = true;
      if (!gateRunning) return;
      gateRunning = false;
      hero?.gateFinish(() => {
        reveal();
        leaveGate();
      });
    }
    if (root.classList.contains("gate")) {
      for (const type of GATE_SKIP) addEventListener(type, skipGate, { capture: true, passive: true });
      document.addEventListener("visibilitychange", skipGate);
    }
    /** Hands from the poster to the live scene, then moves it into the hero. */
    const runGate = (h: HeroScene) => {
      if (gateSkipped || scrollY || document.hidden) {
        // Too late for the move: the scene fades in over the poster where the hero rests.
        reveal();
        setTimeout(leaveGate, GATE_SETTLE);
        return;
      }
      gateRunning = true;
      // A device too slow to finish the move in time goes straight to the hero.
      gateLimit = window.setTimeout(skipGate, GATE_LIMIT);
      h.gateOpen(parseFloat(getComputedStyle(stage).getPropertyValue("--gate-cx")))
        .then(() => {
          if (!gateRunning) return;
          h.canvas.classList.add("is-ready");
          if (window.__gateHold) return;
          setTimeout(() => {
            if (!gateRunning) return;
            h.gatePlay(() => {
              gateRunning = false;
              reveal();
              leaveGate();
            });
          }, GATE_FADE);
        })
        .catch((e) => {
          console.warn("Loading gate unavailable:", e);
          skipGate();
        });
    };

    const fallback = () => {
      skipGate();
      leaveGate();
      stage.classList.add("gl-off"); // the drawing is now the deliberate fallback
      views.hidden = true;
      if (hintRef.current) hintRef.current.textContent = "This is a drawing of the solid. Turning it needs WebGL.";
    };
    // No trial context: browsers cap live ones, and createHero reports a renderer that cannot start.
    const glOK = params.get("webgl") !== "off" && "WebGL2RenderingContext" in window;
    if (!glOK) fallback();
    else
      createHero(stage, {
        reduced: reducedMotion,
        onView: setView,
        onSettle: () => sound.play("settle"),
        onContextLost: () => {
          skipGate();
          stage.classList.remove("has-gl");
          hero?.canvas.classList.remove("is-ready");
          fallback();
        },
        onContextRestored: () => {
          stage.classList.remove("gl-off");
          views.hidden = false;
          showHint();
          hero?.canvas.classList.add("is-ready");
          stage.classList.add("has-gl");
        },
      })
        .then((h) => {
          if (cancelled) return h?.destroy();
          if (!h) return fallback();
          hero = h;
          h.frame(frame());
          h.theme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
          if (root.classList.contains("gate")) return runGate(h);
          let played = false;
          try {
            played = sessionStorage.getItem("rsx-intro") === "1";
          } catch {
            /* storage unavailable */
          }
          if (!played && !params.has("nointro")) {
            h.intro();
            try {
              sessionStorage.setItem("rsx-intro", "1");
            } catch {
              /* storage unavailable */
            }
          }
          requestAnimationFrame(() => {
            h.canvas.classList.add("is-ready");
            stage.classList.add("has-gl");
          });
        })
        .catch((e) => {
          if (cancelled || leaving) return;
          console.warn("Hero scene unavailable:", e);
          fallback();
        });

    return () => {
      gateRunning = false;
      leaveGate();
      cancelled = true;
      removeEventListener("pagehide", onLeave);
      ro.disconnect();
      views.removeEventListener("click", onViews);
      window.removeEventListener("rsx-theme", onTheme);
      hero?.destroy();
      stage.classList.remove("has-gl", "gl-off");
    };
  }, []);

  return (
    <section className="hero" id="top" aria-labelledby="hero-name">
      <div className="hero-stage" id="hero-stage" aria-hidden="true" ref={stageRef} dangerouslySetInnerHTML={POSTER} suppressHydrationWarning />
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <h1 className="hero-name" id="hero-name">
            <span>Rifaque</span> <span>Akrami</span>
          </h1>
          <p className="hero-role">
            Software engineer, working as <b>RSX Develops</b>.
          </p>
          <p className="hero-lede">I build software that stays understandable as it becomes more capable: local-first AI tools, developer systems and client products.</p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#work" data-sound="press">
              See the work
            </a>
            <a className="btn" href={`mailto:${site.email}`} data-sound="press">
              Email
            </a>
            <a className="link resume-link" href={site.resume}>
              Résumé (PDF)
            </a>
          </div>
          <p className="hero-meta">Bhatkal, India. Open to relocation and remote roles.</p>
        </div>
        <div className="hero-object" ref={objectRef}>
          <div className="hero-instrument" role="group" aria-labelledby="solid-caption">
            <p className="solid-caption" id="solid-caption">
              <span className="solid-what">RSX, as one solid.</span> <span ref={nowRef}>{VIEW_TEXT.axo}</span>
            </p>
            <div className="views" ref={viewsRef}>
              <button type="button" className="view-key" data-view="axo" aria-pressed="true" aria-label="Corner view: the solid and all three shadows">
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M2 5l6-3 6 3v6l-6 3-6-3z M2 5l6 3 6-3M8 8v6" fill="none" stroke="currentColor" strokeWidth="1.3" />
                </svg>
              </button>
              <button type="button" className="view-key" data-view="r" aria-pressed="false" aria-label="Look along x: the solid reads R">
                R
              </button>
              <button type="button" className="view-key" data-view="s" aria-pressed="false" aria-label="Look from above: the solid reads S">
                S
              </button>
              <button type="button" className="view-key" data-view="x" aria-pressed="false" aria-label="Look along z: the solid reads X">
                X
              </button>
              <button type="button" className="view-key view-nudge" id="nudge" aria-label="Knock the solid out of alignment and let it settle">
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M13 8a5 5 0 1 1-1.5-3.6M13 2.5v2.6h-2.6" fill="none" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </button>
            </div>
            <p className="solid-hint" ref={hintRef}>
              Drag the solid to turn it. It settles back into place.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
