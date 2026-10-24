import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * Document-level motion state, mounted once inside BrowserRouter (main.tsx).
 *
 * html.motion-ready: the app has hydrated, so reveal starting states may
 * apply (motion.css). Set in a passive effect, after every reveal layout
 * effect has marked what is already on screen.
 *
 * html.intro-done: the hero's entrance belongs to the first page load only.
 * The first change of pathname sets it, before paint, so a client-side visit
 * to the homepage never replays the entrance.
 */
export function MotionRoot() {
  const { pathname } = useLocation();
  const initial = useRef(pathname);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("motion-ready");
    return () => html.classList.remove("motion-ready");
  }, []);

  useLayoutEffect(() => {
    if (pathname !== initial.current) document.documentElement.classList.add("intro-done");
  }, [pathname]);

  return null;
}
