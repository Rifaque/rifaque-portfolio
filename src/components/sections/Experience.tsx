import { FiExternalLink } from "react-icons/fi";
import Section, { Reveal } from "@/components/Section";
import { experiences } from "@/data/portfolio";

const Experience = () => (
  <Section
    id="experience"
    eyebrow="Experience"
    heading="Where the work happened"
    lede="Two entries that overlap, which is deliberate rather than a date error — the studio ran alongside the internship."
  >
    <ol className="relative space-y-10 border-l border-foreground/[0.1] pl-5 sm:space-y-14 sm:pl-8 lg:space-y-16 lg:pl-10">
      {experiences.map((job, i) => (
        <li key={job.id} className="relative">
          <span
            aria-hidden
            className="absolute -left-[calc(1.25rem+4.5px)] top-2 h-2 w-2 rounded-full bg-aurora-teal sm:-left-[calc(2rem+4.5px)] lg:-left-[calc(2.5rem+4.5px)]"
          />
          <Reveal delay={i * 0.05}>
            <p className="font-mono text-xs text-foreground/45">
              {job.dates} · {job.location}
            </p>

            <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground sm:text-xl lg:text-2xl">
              {job.role}
            </h3>

            <p className="mt-1 text-base text-foreground/70">
              {job.url ? (
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tap-target inline-flex items-center gap-1.5 transition-colors hover:text-aurora-teal focus-ring"
                >
                  {job.company}
                  <FiExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              ) : (
                job.company
              )}
            </p>

            <p className="mt-4 max-w-2xl text-[0.9rem] leading-relaxed text-foreground/60 sm:text-[0.95rem]">
              {job.summary}
            </p>

            {/* Always visible. Nothing here was ever worth hiding behind a
                hover, and on a phone hover does not exist at all. */}
            <ul className="mt-5 max-w-2xl space-y-3">
              {job.highlights.map((item, idx) => (
                <li
                  key={idx}
                  className="flex gap-3 text-[0.9rem] leading-relaxed text-foreground/70 sm:text-[0.95rem]"
                >
                  <span
                    aria-hidden
                    className="mt-[0.55rem] h-1 w-1 shrink-0 rounded-full bg-aurora-teal/70"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <ul className="mt-5 flex flex-wrap gap-2">
              {job.technologies.map((tech) => (
                <li
                  key={tech}
                  className="max-w-full break-words rounded-md border border-foreground/10 px-2.5 py-1 text-xs text-foreground/55"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </Reveal>
        </li>
      ))}
    </ol>
  </Section>
);

export default Experience;
