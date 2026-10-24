import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Navigate to a path that may carry a hash. Re-selecting the hash you are
 * already on does not change the location, so scroll to it directly.
 */
export function useGoTo() {
  const navigate = useNavigate();
  const { pathname, hash } = useLocation();

  return useCallback(
    (to: string) => {
      const [path, frag] = to.split("#");
      const target = path || "/";
      if (frag && target === pathname && `#${frag}` === hash) {
        scrollToId(frag);
        return;
      }
      navigate(to);
    },
    [navigate, pathname, hash],
  );
}

/** Scroll to an element and focus it. Smooth unless motion is reduced or a behaviour is given. */
export function scrollToId(id: string, behavior?: ScrollBehavior) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ block: "start", behavior: behavior ?? (reduce ? "instant" : "smooth") });
  // Move focus with the view so keyboard and screen-reader users land there.
  if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
}
