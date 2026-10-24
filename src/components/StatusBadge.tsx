import type { Stage } from "../content/projects";
import { roleTreatment, stageTreatment, type Glyph } from "../content/stages";

type Props = {
  /** A project's stage, or "role" for a position held rather than a release. */
  stage: Stage | "role";
  /** The visible status, shown verbatim. */
  text: string;
  className?: string;
};

/**
 * Stage glyph plus the status text. The glyph is decorative: the text says
 * the same thing, and the glyph's shape (not only its colour) differs by stage.
 */
export function StatusBadge({ stage, text, className }: Props) {
  const { glyph } = stage === "role" ? roleTreatment : stageTreatment[stage];
  return (
    <p className={className ? `status ${className}` : "status"} data-stage={stage}>
      <StatusGlyph stage={stage} glyph={glyph} />
      {text}
    </p>
  );
}

export function StatusGlyph({ stage, glyph }: { stage: Stage | "role"; glyph?: Glyph }) {
  const shape = glyph ?? (stage === "role" ? roleTreatment : stageTreatment[stage]).glyph;
  return (
    <svg className={`glyph glyph--${stage}`} viewBox="0 0 12 12" aria-hidden="true" focusable="false">
      {shapes[shape]}
    </svg>
  );
}

const ring = { cx: 6, cy: 6, r: 4.25, fill: "none", stroke: "currentColor", strokeWidth: 1.5 };

const shapes: Record<Glyph, JSX.Element> = {
  filled: <circle cx="6" cy="6" r="4.5" fill="currentColor" />,
  half: (
    <>
      <circle {...ring} />
      <path d="M6 1.75a4.25 4.25 0 0 0 0 8.5z" fill="currentColor" />
    </>
  ),
  "ring-tick": (
    <>
      <circle {...ring} />
      <path d="M6 6V3.25M6 6h2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  "dashed-ring": <circle {...ring} strokeDasharray="2.2 1.6" />,
  check: <path d="M2 6.4 4.8 9.2 10 3.2" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />,
  "hollow-ring": <circle {...ring} />,
  role: <rect x="3" y="3" width="6" height="6" rx="1" fill="currentColor" />,
};
