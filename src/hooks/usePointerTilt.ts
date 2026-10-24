import { useEffect, type RefObject } from "react";

export const MAX_TILT = 3;

/**
 * Tilt in degrees for a pointer at (px, py), each 0..1 across the element.
 * rotateX lifts the edge nearest the pointer; both axes are clamped.
 */
export function tiltFor(px: number, py: number, max = MAX_TILT) {
  const clamp = (n: number) => Math.min(1, Math.max(0, Number.isFinite(n) ? n : 0.5));
  const x = clamp(px);
  const y = clamp(py);
  const round = (n: number) => Math.round(n * 100) / 100 || 0;
  return { rotateX: round((0.5 - y) * 2 * max), rotateY: round((x - 0.5) * 2 * max) };
}

/**
 * Pointer-driven tilt for one element, for fine pointers that hover, with
 * motion allowed. It only writes CSS custom properties (--tilt-x, --tilt-y,
 * --pointer-x, --pointer-y) and data-tilt="active" while hovered; the
 * .tilt class in motion.css turns them into a transform and eases back on
 * leave. Pointer moves are coalesced to one write per frame, and nothing
 * runs between hovers. Content and controls never depend on it.
 */
export function usePointerTilt(ref: RefObject<HTMLElement>, max = MAX_TILT) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let frame = 0;
    let rect: DOMRect | null = null;
    let last: PointerEvent | null = null;

    const write = () => {
      frame = 0;
      if (!last || !rect) return;
      const px = (last.clientX - rect.left) / rect.width;
      const py = (last.clientY - rect.top) / rect.height;
      const { rotateX, rotateY } = tiltFor(px, py, max);
      el.style.setProperty("--tilt-x", `${rotateX}deg`);
      el.style.setProperty("--tilt-y", `${rotateY}deg`);
      el.style.setProperty("--pointer-x", `${Math.round(px * 100)}%`);
      el.style.setProperty("--pointer-y", `${Math.round(py * 100)}%`);
    };
    const onMove = (e: PointerEvent) => {
      last = e;
      if (!frame) frame = requestAnimationFrame(write);
    };
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      last = null;
      rect = null;
      el.removeEventListener("pointermove", onMove);
      el.removeAttribute("data-tilt");
      for (const name of ["--tilt-x", "--tilt-y", "--pointer-x", "--pointer-y"]) el.style.removeProperty(name);
    };
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      rect = el.getBoundingClientRect();
      el.setAttribute("data-tilt", "active");
      el.addEventListener("pointermove", onMove);
      onMove(e);
    };

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", reset);
    return () => {
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", reset);
      reset();
    };
  }, [ref, max]);
}
