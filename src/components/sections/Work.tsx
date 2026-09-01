import { useState } from "react";
import { FiArrowUpRight, FiExternalLink, FiGithub } from "react-icons/fi";
import Section, { Reveal } from "@/components/Section";
import StatusBadge from "@/components/StatusBadge";
import ProjectDialog from "@/components/ProjectDialog";
import { signatureProjects, selectedProjects, type Project } from "@/data/portfolio";

/** Pulls the first paragraph out of a named narrative block, if present. */
const excerpt = (project: Project, heading: string) =>
  project.narrative.find((b) => b.heading === heading)?.body?.[0];

/**
 * The project name is the control. The pseudo-element stretches the hit area
 * over the whole card without adding a second tab stop, and `aria-haspopup`
 * says what activating it does — so the heading text stays just the name.
 */
const OpenButton = ({
  onOpen,
  children,
  className = "",
}: {
  onOpen: () => void;
  children: React.ReactNode;
  className?: string;
}) => (
  <button
    type="button"
    onClick={onOpen}
    aria-haspopup="dialog"
    className={`max-w-full break-words text-left focus-ring after:absolute after:inset-0 after:content-[''] ${className}`}
  >
    {children}
  </button>
);

const SignatureCard = ({
  project,
  onOpen,
}: {
  project: Project;
  onOpen: () => void;
}) => {
  const context = excerpt(project, "Context");

  return (
    <article className="card-hover group relative min-w-0 rounded-2xl border border-foreground/[0.08] bg-foreground/[0.015] p-5 transition-colors hover:border-foreground/[0.16] sm:p-7 lg:p-9 2xl:p-11">
      {/*
        Two columns from tablet up. Below that the supporting column follows
        the headline rather than competing with it, so the reading order on a
        phone stays: name, promise, then detail.
      */}
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-8 lg:gap-12 2xl:gap-16">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <StatusBadge status={project.status} />
            <span className="font-mono text-xs text-foreground/40">
              {project.dates}
            </span>
          </div>

          <h3 className="mt-4 break-words text-2xl font-semibold tracking-tight text-foreground sm:text-3xl 2xl:text-4xl">
            <OpenButton onOpen={onOpen}>
              <span className="transition-colors group-hover:text-aurora-teal">
                {project.name}
              </span>
            </OpenButton>
          </h3>

          <p className="mt-3 text-[0.95rem] leading-relaxed text-foreground/70 sm:text-base">
            {project.tagline}
          </p>

          <p className="mt-4 text-sm text-foreground/40">{project.role}</p>

          <ul className="mt-6 flex flex-wrap gap-2">
            {project.technologies.slice(0, 6).map((tech) => (
              <li
                key={tech}
                className="max-w-full break-words rounded-md border border-foreground/10 px-2.5 py-1 text-xs text-foreground/55"
              >
                {tech}
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0 border-t border-foreground/[0.07] pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0 lg:pl-12">
          {context && (
            <p className="text-[0.9rem] leading-relaxed text-foreground/60 sm:text-[0.95rem]">
              {context}
            </p>
          )}
          <ul className="mt-5 space-y-2.5">
            {project.highlights.map((point) => (
              <li
                key={point}
                className="flex gap-3 text-sm leading-relaxed text-foreground/60"
              >
                <span
                  aria-hidden
                  className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-aurora-teal/70"
                />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <p className="relative z-10 mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-aurora-teal">
            Read the full story
            <FiArrowUpRight className="h-4 w-4" aria-hidden />
          </p>
        </div>
      </div>
    </article>
  );
};

const SelectedCard = ({
  project,
  onOpen,
}: {
  project: Project;
  onOpen: () => void;
}) => (
  <article className="card-hover group relative flex h-full min-w-0 flex-col rounded-xl border border-foreground/[0.08] bg-foreground/[0.015] p-5 transition-colors hover:border-foreground/[0.16] sm:p-6">
    <StatusBadge status={project.status} className="self-start" />
    <h3 className="mt-4 break-words text-lg font-semibold tracking-tight text-foreground">
      <OpenButton onOpen={onOpen}>
        <span className="transition-colors group-hover:text-aurora-teal">
          {project.name}
        </span>
      </OpenButton>
    </h3>
    <p className="mt-1 font-mono text-xs text-foreground/40">{project.dates}</p>
    <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground/60">
      {project.tagline}
    </p>
    <ul className="mt-5 flex flex-wrap gap-1.5">
      {project.technologies.slice(0, 4).map((tech) => (
        <li
          key={tech}
          className="max-w-full break-words rounded border border-foreground/10 px-2 py-0.5 text-[0.7rem] text-foreground/50"
        >
          {tech}
        </li>
      ))}
    </ul>
    {project.links.length > 0 && (
      <div className="relative z-10 mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-foreground/[0.07] pt-4">
        {project.links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="tap-target inline-flex items-center gap-1.5 text-xs text-foreground/55 transition-colors hover:text-foreground focus-ring"
          >
            {link.kind === "live" ? (
              <FiExternalLink className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <FiGithub className="h-3.5 w-3.5" aria-hidden />
            )}
            {link.label}
            <span className="sr-only"> — {project.name}</span>
          </a>
        ))}
      </div>
    )}
  </article>
);

const Work = () => {
  const [active, setActive] = useState<Project | null>(null);

  return (
    <Section
      id="work"
      eyebrow="Work"
      heading="Six things worth showing"
      lede="Two projects I would defend line by line, three that shipped or taught me something specific, and a studio I helped build. The rest is in the archive."
    >
      <div className="space-y-5 sm:space-y-7">
        {signatureProjects.map((project, i) => (
          <Reveal key={project.id} delay={i * 0.06}>
            <SignatureCard project={project} onOpen={() => setActive(project)} />
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-5 sm:mt-7">
        <a
          href="#experience"
          className="group flex flex-col gap-4 rounded-2xl border border-dashed border-foreground/[0.14] p-5 transition-colors hover:border-aurora-teal/35 focus-ring sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:p-7 lg:p-9"
        >
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-foreground/40">
              And the third thing
            </p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              HubZero — a five-person engineering studio
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground/60">
              Co-founded in January 2025. Client delivery, a reusable Blueprint
              system, in-house builds and experiments. It is experience, not a
              side project, so it lives with the rest of the work history.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-aurora-teal">
            Experience
            <FiArrowUpRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </span>
        </a>
      </Reveal>

      <Reveal className="mt-14 sm:mt-20 lg:mt-24">
        <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/40">
          Selected work
        </h3>
        {/*
          Two-up on tablets, three-up from large. Deliberately lighter than the
          signature cards so the hierarchy survives every width.
        */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {selectedProjects.map((project) => (
            <SelectedCard
              key={project.id}
              project={project}
              onOpen={() => setActive(project)}
            />
          ))}
        </div>
      </Reveal>

      {active && (
        <ProjectDialog
          key={active.id}
          project={active}
          onClose={() => setActive(null)}
        />
      )}
    </Section>
  );
};

export default Work;
