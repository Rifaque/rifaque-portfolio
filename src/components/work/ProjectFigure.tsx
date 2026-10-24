import type { Project } from "../../content/projects";
import { FieldDiagram } from "./FieldDiagram";
import { fieldLayouts } from "./fieldLayouts";

/**
 * A still, labelled diagram with its path written out underneath. Below
 * 640px the drawing's labels would be too small to read, so the list is
 * shown instead of them.
 */
export function ProjectFigure({ project: p }: { project: Project }) {
  const layout = fieldLayouts[p.slug];
  if (!layout) return null;
  return (
    <figure className="sw-figure">
      <div className="lf-canvas--raised">
        <FieldDiagram active={p.slug} label={p.diagramLabel ?? p.title} />
      </div>
      <figcaption>
        <span className="tag">Illustration, not a screenshot</span>
        <ol className="flow">
          {layout.flow.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </figcaption>
    </figure>
  );
}
