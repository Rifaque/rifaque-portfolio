import type { JSX } from "react";
import type { Stage } from "../content/types";

/**
 * Status is carried by shape and text, never by colour, so the accent can
 * never be mistaken for a status.
 */
const shapes: Record<Stage | "role", JSX.Element> = {
  released: <circle cx="8" cy="8" r="6" fill="currentColor" />,
  "pre-release": (
    <>
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 2a6 6 0 0 1 0 12z" fill="currentColor" />
    </>
  ),
  "in-development": (
    <>
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 8V2.6" stroke="currentColor" strokeWidth="1.5" />
    </>
  ),
  "private-alpha": <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2.4 2.2" />,
  delivered: (
    <>
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.2 8.2 7.2 10.1 10.9 6" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </>
  ),
  retired: (
    <>
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M4.2 11.8 11.8 4.2" stroke="currentColor" strokeWidth="1" />
    </>
  ),
  role: <rect x="3" y="3" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" />,
};

export function Glyph({ stage }: { stage: Stage | "role" }) {
  return (
    <svg className="glyph" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      {shapes[stage]}
    </svg>
  );
}

export function Status({ stage, text, className = "" }: { stage: Stage | "role"; text: string; className?: string }) {
  return (
    <span className={`status ${className}`}>
      <Glyph stage={stage} />
      <span>{text}</span>
    </span>
  );
}
