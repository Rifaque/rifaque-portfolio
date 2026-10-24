import { useRef } from "react";
import { revealProps, useReveal } from "../components/motion/reveal";
import { usePointerTilt } from "../hooks/usePointerTilt";

const samples = ["Reveal once", "Staggered by index", "Opacity and a 12 px rise", "Visible without JavaScript"];

/**
 * Review fixtures for the shared motion utilities, before any section of the
 * site adopts them. /lab only: noindex and not linked.
 */
export function MotionLab() {
  const ref = useRef<HTMLElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  useReveal(ref);
  usePointerTilt(tiltRef);

  return (
    <section ref={ref} className="container lab-motion" aria-labelledby="lab-motion-title">
      <h2 id="lab-motion-title" className="h2">
        Motion foundation
      </h2>
      <ul className="lab-motion-list">
        {samples.map((s, i) => (
          <li key={s} className="lab-motion-item" {...revealProps(i)}>
            {s}
          </li>
        ))}
      </ul>
      <div ref={tiltRef} className="lab-tilt tilt" data-testid="tilt-sample">
        <p className="kicker">Pointer tilt</p>
        <p>Up to 3° on each axis, fine pointers only, flat again on leave.</p>
      </div>
    </section>
  );
}
