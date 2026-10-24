import type { Project } from "../content/projects";

type Props = { project: Project; className?: string };

/** Maturity dot plus the project's status line. The dot is decorative. */
export function StatusLine({ project, className }: Props) {
  return (
    <p className={className ? `status ${className}` : "status"}>
      <span className={`dot dot--${project.maturity}`} aria-hidden="true" />
      {project.status}
    </p>
  );
}
