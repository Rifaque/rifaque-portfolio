import { useLayoutEffect, type CSSProperties, type RefObject } from "react";

/**
 * Reveal-once for content below the fold.
 *
 * Mark elements with revealProps(i) and call useReveal(containerRef) once
 * for the container. One IntersectionObserver serves the whole page. The
 * hidden starting state lives in motion.css and applies only to elements
 * useReveal has marked pending (below the fold when measured), under
 * html.motion-ready with motion allowed. So without JavaScript, before
 * hydration, after a failed hydration or with reduced motion, everything is
 * simply visible, and content already on screen is never hidden.
 */

export const MAX_STAGGER = 6;

/** Props for one revealed element; `index` staggers siblings (capped). */
export function revealProps(index = 0): { "data-reveal": ""; style: CSSProperties } {
  return { "data-reveal": "", style: { "--reveal-index": staggerIndex(index) } as CSSProperties };
}

export function staggerIndex(i: number) {
  return Number.isFinite(i) ? Math.min(Math.max(Math.round(i), 0), MAX_STAGGER) : 0;
}

/** True when a box overlaps the viewport or lies above it (already scrolled past). */
export function isPastOrVisible(rect: { top: number }, viewportHeight: number) {
  return rect.top < viewportHeight;
}

let observer: IntersectionObserver | null = null;
let watched = 0;

function reveal(el: Element) {
  el.setAttribute("data-revealed", "");
}

function shared() {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        reveal(e.target);
        unwatch(e.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
  );
  return observer;
}

function unwatch(el: Element) {
  if (!observer) return;
  observer.unobserve(el);
  watched = Math.max(0, watched - 1);
  if (watched === 0) {
    observer.disconnect();
    observer = null;
  }
}

/**
 * Registers the container's [data-reveal] elements. Runs as a layout effect,
 * before paint. Only elements below the fold are marked pending, the one
 * state motion.css hides; anything already on screen or scrolled past is
 * marked revealed and never takes the hidden style. That holds after a
 * client-side navigation too, where html.motion-ready is already set: had
 * on-screen content matched the hidden style, measuring it would have
 * computed that style and revealing it would fade it in. (ScrollManager
 * restores the scroll position in an earlier layout effect, so this measures
 * the restored view.)
 */
export function useReveal(container: RefObject<HTMLElement>) {
  useLayoutEffect(() => {
    const root = container.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    const pending: Element[] = [];
    for (const el of root.querySelectorAll("[data-reveal]:not([data-revealed])")) {
      if (isPastOrVisible(el.getBoundingClientRect(), window.innerHeight)) {
        reveal(el);
      } else {
        // React rendered data-reveal="" and leaves it alone while the prop is
        // unchanged.
        el.setAttribute("data-reveal", "pending");
        shared().observe(el);
        watched++;
        pending.push(el);
      }
    }
    return () => {
      for (const el of pending) if (!el.hasAttribute("data-revealed")) unwatch(el);
    };
  }, [container]);
}
