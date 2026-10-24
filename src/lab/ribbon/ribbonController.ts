import { DWELL, buildTrack, indexToProgress, poseFor, progressToIndex, type CardSize, type RibbonTrack } from "./ribbonLayout";

/** When the pinned ribbon runs. Keep equal to the live-layout query in ribbon.css. */
export const RIBBON_QUERY = "(min-width: 1200px) and (min-height: 680px) and (prefers-reduced-motion: no-preference)";

type Parts = { track: HTMLElement; stage: HTMLElement; counter: HTMLElement | null };

/**
 * Drives the pinned ribbon from the page's scroll position.
 *
 * Progress is (scrollY − track top) / (track height − stage height): the
 * scrollbar stays the only source of truth, so wheel, touch, keys and
 * scroll restoration all just move the page. Layout is read only when it
 * can change (start, and ResizeObserver on the stage and the document);
 * each animation frame reads scrollY and writes transform, opacity and one
 * custom property per card (the picture's shade; text is never dimmed).
 * React never re-renders while scrolling.
 *
 * Returns a stop function that removes every listener, observer, pending
 * frame and inline style it added.
 */
export function startRibbon({ track, stage, counter }: Parts) {
  const cards = [...stage.querySelectorAll<HTMLElement>(".ribbon-card")];
  const count = cards.length;
  let geometry: RibbonTrack | null = null;
  let trackTop = 0;
  let scrollLength = 1;
  let sizes: CardSize[] = [];
  let frame = 0;
  let active = -1;

  const measure = () => {
    geometry = buildTrack(stage.clientWidth, stage.clientHeight);
    trackTop = track.getBoundingClientRect().top + window.scrollY;
    scrollLength = Math.max(1, track.offsetHeight - stage.clientHeight);
    sizes = cards.map((c) => ({ w: c.offsetWidth, h: c.offsetHeight }));
  };

  const render = () => {
    frame = 0;
    if (!geometry) return;
    const index = progressToIndex((window.scrollY - trackTop) / scrollLength, count);
    for (let i = 0; i < count; i++) {
      const { w, h } = sizes[i];
      const pose = poseFor(geometry, i - index, sizes[i]);
      const resting = Math.abs(i - index) < DWELL;
      // Whole pixels at rest keep the active card's text sharp.
      const x = resting ? Math.round(pose.x - w / 2) : pose.x - w / 2;
      const y = resting ? Math.round(pose.y - h / 2) : pose.y - h / 2;
      const el = cards[i];
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${pose.z.toFixed(1)}px) rotateZ(${pose.rotateZ.toFixed(2)}deg) rotateY(${pose.rotateY.toFixed(2)}deg) scale(${pose.scale.toFixed(4)})`;
      el.style.opacity = pose.opacity.toFixed(3);
      el.style.setProperty("--shade", pose.shade.toFixed(3));
    }
    const next = Math.min(count - 1, Math.max(0, Math.round(index)));
    if (next !== active) {
      active = next;
      cards.forEach((c, i) => c.toggleAttribute("data-active", i === next));
      if (counter) counter.textContent = String(next + 1).padStart(2, "0");
    }
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(render);
  };
  // On a resize the stage and track change height, so the same scrollY would
  // mean a different card. Keep the progress instead, so the view holds.
  const remeasure = () => {
    const before = (window.scrollY - trackTop) / scrollLength;
    measure();
    if (before > 0 && before < 1) {
      const top = trackTop + before * scrollLength;
      if (Math.abs(top - window.scrollY) > 1) window.scrollTo({ top, behavior: "instant" });
    }
    schedule();
  };

  // Keyboard users: focusing a link in any card brings that card to the
  // focus. Focus itself never moves when the active card changes.
  const onFocusIn = (e: FocusEvent) => {
    const target = e.target as Element;
    // A pointer press focuses the link too; moving the card then would pull
    // it out from under the click.
    if (!target.matches(":focus-visible")) return;
    const card = target.closest<HTMLElement>(".ribbon-card");
    if (!card) return;
    const i = cards.indexOf(card);
    const current = progressToIndex((window.scrollY - trackTop) / scrollLength, count);
    if (Math.abs(current - i) < 0.3) return;
    window.scrollTo({ top: trackTop + indexToProgress(i, count) * scrollLength, behavior: "instant" });
  };

  const resize = new ResizeObserver(remeasure);
  measure();
  stage.setAttribute("data-live", "");
  render();
  resize.observe(stage);
  resize.observe(document.documentElement);
  window.addEventListener("scroll", schedule, { passive: true });
  stage.addEventListener("focusin", onFocusIn);

  return () => {
    window.removeEventListener("scroll", schedule);
    stage.removeEventListener("focusin", onFocusIn);
    resize.disconnect();
    cancelAnimationFrame(frame);
    stage.removeAttribute("data-live");
    for (const c of cards) {
      c.style.removeProperty("transform");
      c.style.removeProperty("opacity");
      c.style.removeProperty("--shade");
      c.removeAttribute("data-active");
    }
    if (counter) counter.textContent = "01";
  };
}
