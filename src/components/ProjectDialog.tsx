import { useEffect, useRef } from "react";
import { FiX, FiExternalLink, FiGithub } from "react-icons/fi";
import StatusBadge from "@/components/StatusBadge";
import { NexusDiagram, AtlasDiagram } from "@/components/ArchitectureDiagram";
import type { Project } from "@/data/portfolio";

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const ProjectDialog = ({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    restoreRef.current = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const nodes = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter((n) => n.offsetParent !== null);
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
      restoreRef.current?.focus?.();
    };
  }, [onClose]);

  // Enter-only, in CSS. An exit transition driven by requestAnimationFrame
  // never completes while the tab is hidden, which leaves a modal that cannot
  // be closed — a far worse bug than a missing fade-out.
  return (
    <div
      className={[
        "dialog-overlay fixed inset-0 z-[60] flex justify-center bg-black/70 backdrop-blur-sm",
        // A bottom sheet on phones, a centred panel from tablet up.
        "items-end sm:items-center sm:p-6 lg:p-8",
      ].join(" ")}
      onClick={onClose}
    >
      <div
        className={[
          "dialog-panel relative flex w-full flex-col overflow-hidden border border-foreground/10 bg-background",
          // dvh, not vh: mobile browser chrome must not push the close button
          // and the last links off the bottom of the sheet.
          "max-h-[92dvh] rounded-t-2xl",
          "sm:max-h-[88dvh] sm:max-w-2xl sm:rounded-2xl",
          // Tablets have real room; use it rather than centring a phone sheet.
          "md:max-w-[46rem] lg:max-w-3xl 2xl:max-w-4xl",
        ].join(" ")}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`dialog-${project.id}-title`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header stays put so the close control is always reachable */}
        <div className="flex items-start justify-between gap-4 border-b border-foreground/[0.08] px-5 py-4 sm:px-8 sm:py-5">
          <div className="min-w-0">
            <h2
              id={`dialog-${project.id}-title`}
              className="break-words text-lg font-semibold tracking-tight text-foreground sm:text-2xl"
            >
              {project.name}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
              <StatusBadge status={project.status} />
              <span className="font-mono text-xs text-foreground/45">
                {project.dates}
              </span>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="tap-target shrink-0 rounded-md border border-foreground/10 p-2.5 text-foreground/60 transition-colors hover:text-foreground focus-ring"
          >
            <span className="sr-only">Close</span>
            <FiX className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {/* Only this region scrolls, so the header and its close control stay
            put no matter how long the narrative is. */}
        <div className="overflow-y-auto overscroll-contain px-5 py-6 pb-[calc(1.5rem+var(--safe-bottom))] sm:px-8 sm:py-8 lg:px-10">
          <p className="text-sm text-foreground/45">{project.role}</p>

          {project.image && (
            <img
              src={project.image}
              alt={`${project.name} interface`}
              width={1280}
              height={450}
              loading="lazy"
              decoding="async"
              className="mt-6 w-full rounded-xl border border-foreground/[0.08]"
            />
          )}

          {project.diagram === "nexus" && (
            <div className="mt-6">
              <NexusDiagram />
            </div>
          )}
          {project.diagram === "atlas" && (
            <div className="mt-6">
              <AtlasDiagram />
            </div>
          )}

          <div className="mt-8 space-y-8">
            {project.narrative.map((block) => (
              <div key={block.heading}>
                <h3 className="font-mono text-xs uppercase tracking-[0.16em] text-aurora-teal/80">
                  {block.heading}
                </h3>
                {block.body && (
                  <div className="prose-narrative mt-3">
                    {block.body.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                )}
                {block.list && (
                  <ul className="mt-3 space-y-2.5">
                    {block.list.map((item, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-[0.95rem] leading-relaxed text-foreground/70"
                      >
                        <span
                          aria-hidden
                          className="mt-2 h-1 w-1 shrink-0 rounded-full bg-aurora-teal/70"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 border-t border-foreground/[0.08] pt-6">
            <h3 className="font-mono text-xs uppercase tracking-[0.16em] text-foreground/40">
              Built with
            </h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <li
                  key={tech}
                  className="max-w-full break-words rounded-md border border-foreground/10 px-2.5 py-1 text-xs text-foreground/65"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </div>

          {project.links.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {project.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-foreground/15 px-4 py-2.5 text-sm text-foreground/85 transition-colors hover:border-aurora-teal/40 hover:text-foreground focus-ring"
                >
                  {link.kind === "live" ? (
                    <FiExternalLink className="h-4 w-4" aria-hidden />
                  ) : (
                    <FiGithub className="h-4 w-4" aria-hidden />
                  )}
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDialog;
