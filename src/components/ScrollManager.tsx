import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router";
import { applyHead } from "../lib/head";
import { routeFor } from "../content/routes";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Keeps the head, the root environment and the scroll position in step with
 * navigation. A change to ?project only (Project Space) never scrolls.
 * Within a page a hash scrolls smoothly; a new page lands at once, since a
 * smooth scroll across a page swap can stop short as the document shrinks.
 */
export function ScrollManager() {
  const { pathname, hash } = useLocation();
  const first = useRef(true);
  const lastPath = useRef(pathname);

  useIsoLayoutEffect(() => {
    const route = routeFor(pathname);
    document.documentElement.dataset.env = route.env;
    if (first.current) {
      first.current = false;
      return; // the browser has already handled the initial load and any hash
    }
    applyHead(route);
    const behavior: ScrollBehavior = lastPath.current === pathname ? "auto" : "instant"; // "auto" follows the CSS (smooth unless reduced motion)
    lastPath.current = pathname;
    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) {
        el.scrollIntoView({ behavior });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior });
    // Move focus to the new page for keyboard and screen-reader users.
    document.getElementById("main")?.focus({ preventScroll: true });
  }, [pathname, hash]);

  // Marks the page as interactive (used by the browser tests; harmless otherwise).
  useEffect(() => {
    document.documentElement.dataset.hydrated = "true";
  }, []);

  return null;
}
