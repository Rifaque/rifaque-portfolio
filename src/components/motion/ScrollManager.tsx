import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { scrollToId } from "../../hooks/useGoTo";
import { createScrollStore, decideScroll, entryKey, type Place, type ScrollDecision } from "./scrollDecision";

/**
 * Route-level scrolling, mounted once inside BrowserRouter (main.tsx) so it
 * outlives the per-page Layout. The policy is decideScroll; this component
 * records where each history entry was left and carries the decision out.
 * Client only: the prerender renders AppRoutes without it.
 */
export function ScrollManager() {
  const location = useLocation();
  const action = useNavigationType();
  const store = useRef<ReturnType<typeof createScrollStore>>();
  const currentKey = useRef<string | null>(null);
  const handled = useRef<object | null>(null);
  const previous = useRef<Place | null>(null);
  const pendingFrame = useRef(0);

  // Positions are recorded against the entry on screen. The capture-phase
  // click and popstate listeners run before the router changes the page.
  useEffect(() => {
    const { history } = window;
    const restoration = history.scrollRestoration;
    history.scrollRestoration = "manual";

    let frame = 0;
    const save = () => {
      if (currentKey.current) store.current?.set(currentKey.current, window.scrollY);
    };
    const onScroll = () => {
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          save();
        });
    };
    const onPageHide = () => {
      save();
      store.current?.flush();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", save, true);
    window.addEventListener("popstate", save);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", save, true);
      window.removeEventListener("popstate", save);
      window.removeEventListener("pagehide", onPageHide);
      cancelAnimationFrame(frame);
      onPageHide();
      history.scrollRestoration = restoration;
    };
  }, []);

  // Before paint, so a new page never shows at the old page's offset.
  useLayoutEffect(() => {
    // React StrictMode re-runs effects in development; act once per location.
    if (handled.current === location) return;
    const first = handled.current === null;
    handled.current = location;
    store.current ??= createScrollStore(sessionStorageOrNull());

    const key = entryKey(location);
    currentKey.current = key;
    const next = { pathname: location.pathname, search: location.search, hash: location.hash };
    const decision = decideScroll({
      action,
      next,
      previous: previous.current,
      documentNavigation: first ? documentNavigationType() : undefined,
      saved: store.current.get(key),
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    });
    previous.current = next;

    cancelAnimationFrame(pendingFrame.current);
    pendingFrame.current = apply(decision);
  }, [location, action]);

  return null;
}

/** Carries out a decision. Returns a pending animation frame, or 0. */
function apply(decision: ScrollDecision) {
  switch (decision.type) {
    case "none":
      return 0;
    case "top":
      window.scrollTo({ top: 0, left: 0, behavior: decision.behavior });
      return 0;
    case "restore":
      window.scrollTo({ top: decision.y, left: 0, behavior: "instant" });
      return 0;
    case "hash": {
      // A new page is placed at its target before the first paint. Focus,
      // and any glide, follow a frame later: after the command palette has
      // closed and handed focus back, so nothing pulls the view away again.
      if (decision.behavior === "instant") {
        document.getElementById(decision.id)?.scrollIntoView({ block: "start", behavior: "instant" });
      }
      return requestAnimationFrame(() => scrollToId(decision.id, decision.behavior));
    }
  }
}

function sessionStorageOrNull() {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function documentNavigationType() {
  try {
    const [entry] = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    return entry?.type;
  } catch {
    return undefined;
  }
}
