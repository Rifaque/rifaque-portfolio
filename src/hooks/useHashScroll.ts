import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Arriving at "/#work" from another route lands before the section exists.
 * Scroll once the target is actually in the DOM.
 */
export function useHashScroll() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    const frame = requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [hash]);
}
