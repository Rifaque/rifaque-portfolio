import { useState } from "react";
import { FiExternalLink, FiGithub, FiArrowLeft } from "react-icons/fi";
import { projects, type Project } from "@/data/portfolio";

const ProjectsApp = () => {
    const [selected, setSelected] = useState<Project | null>(null);

    if (selected) {
        return (
            <div className="space-y-4 p-5">
                <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="inline-flex items-center gap-2 text-sm text-foreground/60 transition-colors hover:text-foreground focus-ring"
                >
                    <FiArrowLeft className="h-4 w-4" aria-hidden />
                    All projects
                </button>

                <div>
                    <h2 className="text-lg font-semibold text-foreground">{selected.name}</h2>
                    <p className="mt-1 font-mono text-[10px] text-foreground/45">
                        {selected.status.label} · {selected.dates}
                    </p>
                    <p className="mt-2 text-xs text-foreground/50">{selected.role}</p>
                </div>

                <div className="space-y-4">
                    {selected.narrative.map((block) => (
                        <div key={block.heading}>
                            <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-aurora-teal/80">
                                {block.heading}
                            </h3>
                            {block.body?.map((p, i) => (
                                <p key={i} className="mt-2 text-xs leading-relaxed text-foreground/60">
                                    {p}
                                </p>
                            ))}
                            {block.list && (
                                <ul className="mt-2 space-y-1.5">
                                    {block.list.map((item, i) => (
                                        <li key={i} className="flex gap-2 text-xs leading-relaxed text-foreground/60">
                                            <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-aurora-teal/70" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>

                <ul className="flex flex-wrap gap-1.5 border-t border-foreground/[0.08] pt-3">
                    {selected.technologies.map((tech) => (
                        <li
                            key={tech}
                            className="rounded border border-foreground/10 px-1.5 py-0.5 text-[10px] text-foreground/50"
                        >
                            {tech}
                        </li>
                    ))}
                </ul>

                {selected.links.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                        {selected.links.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-foreground/60 transition-colors hover:text-foreground focus-ring"
                            >
                                {link.kind === "live" ? (
                                    <FiExternalLink className="h-3.5 w-3.5" aria-hidden />
                                ) : (
                                    <FiGithub className="h-3.5 w-3.5" aria-hidden />
                                )}
                                {link.label}
                            </a>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <ul className="space-y-2 p-5">
            {projects.map((project) => (
                <li key={project.id}>
                    <button
                        type="button"
                        onClick={() => setSelected(project)}
                        className="w-full rounded-lg border border-foreground/[0.07] p-3 text-left transition-colors hover:border-aurora-teal/25 focus-ring"
                    >
                        <div className="flex items-baseline justify-between gap-3">
                            <span className="text-sm font-medium text-foreground">
                                {project.name}
                            </span>
                            <span className="shrink-0 font-mono text-[10px] text-foreground/40">
                                {project.dates}
                            </span>
                        </div>
                        <p className="mt-1 text-[10px] uppercase tracking-wider text-aurora-teal/70">
                            {project.status.label}
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-foreground/55">
                            {project.tagline}
                        </p>
                    </button>
                </li>
            ))}
        </ul>
    );
};

export default ProjectsApp;
